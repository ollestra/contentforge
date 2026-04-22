# ContentForge Worker

Background job processor for ContentForge. Runs on Railway.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your keys
3. `npm run build && npm start`

## Railway Deployment

1. Go to railway.app → New Project → Deploy from GitHub repo
2. Select the contentforge repo
3. Set **Root Directory** to: `worker`
4. Set **Start Command** to: `npm run build && npm start`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `YOUTUBE_API_KEY`
6. Deploy — Railway keeps this running 24/7

## How it works

- Polls Supabase `jobs` table every 3 seconds for pending jobs
- Claims jobs atomically (status check prevents double-processing)
- Pipeline: transcribe → summarize (Claude) → generate per platform (Claude, parallel)
- Updates job progress via Supabase (frontend listens via Realtime)
- Retries failed Claude calls once before marking platform as failed
- Refunds credits for failed platforms
