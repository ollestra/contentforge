-- ContentForge initial schema

-- 1. users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  niche text,
  primary_platform text,
  tone_preset text DEFAULT 'professional',
  audience_tag text DEFAULT 'entrepreneurs',
  platforms_default text[] DEFAULT ARRAY['linkedin','x'],
  plan text DEFAULT 'free' CHECK (plan IN ('free','starter','pro','unlimited')),
  credit_balance integer DEFAULT 5 NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  youtube_url text NOT NULL,
  video_title text,
  summary text,
  status text DEFAULT 'processing' CHECK (status IN ('processing','complete','failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  current_step text DEFAULT 'transcribing' CHECK (current_step IN ('transcribing','summarizing','generating','done')),
  platforms text[] NOT NULL,
  retries integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. outputs table
CREATE TABLE IF NOT EXISTS public.outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id),
  platform text NOT NULL,
  output_type text NOT NULL CHECK (output_type IN ('post','thread','hook','cta','hashtags')),
  variant_number integer NOT NULL CHECK (variant_number IN (1,2,3)),
  content text NOT NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase','deduction','refund','gift')),
  job_id uuid REFERENCES public.jobs(id),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON public.jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_outputs_project_id ON public.outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create user row on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- users RLS
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (auth.uid() = id);

-- projects RLS
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- jobs RLS
CREATE POLICY "jobs_select_own" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jobs_delete_own" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- outputs RLS
CREATE POLICY "outputs_select_own" ON public.outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "outputs_insert_own" ON public.outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outputs_update_own" ON public.outputs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "outputs_delete_own" ON public.outputs FOR DELETE USING (auth.uid() = user_id);

-- credit_transactions RLS
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credit_transactions_insert_own" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "credit_transactions_update_own" ON public.credit_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "credit_transactions_delete_own" ON public.credit_transactions FOR DELETE USING (auth.uid() = user_id);

-- RPC: add_credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_job_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, job_id, description)
  VALUES (p_user_id, p_amount, p_type, p_job_id, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: deduct_credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_job_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_balance integer;
BEGIN
  SELECT credit_balance INTO v_balance FROM public.users WHERE id = p_user_id FOR UPDATE;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_balance, p_amount;
  END IF;

  UPDATE public.users
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, job_id, description)
  VALUES (p_user_id, -p_amount, 'deduction', p_job_id, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: refund_credits_for_job
CREATE OR REPLACE FUNCTION public.refund_credits_for_job(p_job_id uuid)
RETURNS void AS $$
DECLARE
  v_job record;
  v_failed_count integer;
BEGIN
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found: %', p_job_id;
  END IF;

  -- Count failed platforms by checking outputs that don't exist vs what was requested
  -- Refund 1 credit per platform that failed (no output generated)
  SELECT (array_length(v_job.platforms, 1) - COUNT(DISTINCT platform))
  INTO v_failed_count
  FROM public.outputs
  WHERE job_id = p_job_id;

  IF v_failed_count > 0 THEN
    PERFORM public.add_credits(
      v_job.user_id,
      v_failed_count,
      'refund',
      p_job_id,
      'Refund for failed platform outputs'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
