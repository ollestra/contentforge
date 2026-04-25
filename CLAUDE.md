# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Main App
```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
```

### Worker (separate Node.js process)
```bash
cd worker
npm run dev      # ts-node dev mode
npm run build    # tsc compile
npm run start    # run compiled dist/index.js
```

No test suite exists in this project.

## Architecture Overview

**Ollestra** — SaaS that takes a YouTube URL and generates platform-ready social content (LinkedIn, X, Instagram, Email, Blog, etc.) using Claude AI. Built with Next.js 16 App Router + Supabase + a separate background worker.

### Route groups
- `(auth)/` — `/login`, `/signup` (public)
- `(app)/` — `/dashboard`, `/dashboard/new`, `/project/[id]`, `/account` (requires auth)
- `(marketing)/` — `/pricing` (public)
- `(admin-auth)/` — `/admin/login`
- `admin/` — `/admin/blog/*`, `/admin/blog/categories` (requires `ADMIN_EMAIL` match)
- `blog/` — `/blog`, `/blog/[slug]` (public, dark theme)
- `auth/callback/` — Supabase OAuth callback

### Three Supabase clients
| File | Key used | When to use |
|------|----------|-------------|
| `lib/supabase/client.ts` | anon | Client components (browser) |
| `lib/supabase/server.ts` → `createClient()` | anon + cookies | Server components & API routes for session auth |
| `lib/supabase/server.ts` → `createServiceClient()` | service role | API route mutations that need to bypass RLS |
| `lib/supabase/admin.ts` → `supabaseAdmin` | service role | `lib/blog.ts` and other server-only lib functions |

Never use `supabaseAdmin` or `createServiceClient()` in client components.

### Content generation flow
1. `POST /api/generate` — validates credits, creates `projects` + `jobs` rows, deducts credits via RPC, returns IDs
2. **Worker** polls `jobs` table every 3 s for `status = 'pending'`
3. Worker steps: **transcribing** (YouTube captions API) → **summarizing** (Claude, cached in `projects.summary`) → **generating** (Claude, 3 variants × N platforms, parallel)
4. Outputs stored as individual rows in `outputs` table (`platform`, `output_type`, `variant_number`)
5. `/project/[id]` page subscribes to Supabase Realtime on `jobs` and `outputs` to show live progress

Worker uses `claude-sonnet-4-20250514`. It lives in `worker/` with its own `package.json` and is deployed as a separate Railway service.

### Admin auth
`lib/admin-auth.ts` exports `isAdmin()` — verifies the logged-in user's email matches `ADMIN_EMAIL` env var. Throws at module load if `ADMIN_EMAIL` is unset. Used in all `/api/blog/*` mutating routes.

### Blog system
- All blog DB functions live in `lib/blog.ts` (uses `supabaseAdmin`)
- Public pages call `getPublishedPosts()` / `getPostBySlug()`; both pages have `export const dynamic = 'force-dynamic'`
- API routes call `revalidatePath('/blog')` and `revalidatePath('/blog/[slug]')` after create/update
- TipTap editor (`components/blog/TipTapEditor.tsx`) used in admin; output HTML is sanitized with `isomorphic-dompurify` before rendering on the public post page

### CSS conventions
- Dark theme: `bg-gray-950` / `text-white`, violet-to-indigo gradient accents (`from-violet-400 to-indigo-400`)
- `globals.css` has two blog content classes: `.blog-content` (light, admin preview) and `.prose-dark` (dark, public post page)
- Tailwind v3 — only use opacity modifiers from the default scale (0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100). Non-scale values like `/8` or `/3` break the build inside `@apply` rules; use `[value%]` arbitrary syntax if needed

### Credit system
Credits are managed via Supabase RPC functions (`deduct_credits`, `add_credits`, `refund_credits_for_job`) to ensure transactional consistency. Never update `credit_balance` directly with an update query.

### Security
- HTML from TipTap must always be sanitized with DOMPurify before `dangerouslySetInnerHTML`
- YouTube video metadata is fetched server-side via `/api/youtube/video` (proxy) — the `YOUTUBE_API_KEY` is server-only, not `NEXT_PUBLIC_`
- Auth callback validates the `next` param is a relative path before redirecting
- UUID params are validated with a regex before being passed to Supabase queries

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
YOUTUBE_API_KEY
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID / STRIPE_PRO_PRICE_ID / STRIPE_UNLIMITED_PRICE_ID / STRIPE_TOPUP_PRICE_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_POSTHOG_KEY        # optional analytics
```

Worker needs: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `YOUTUBE_API_KEY`
