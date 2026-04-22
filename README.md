# ContentForge

AI-powered content repurposing — convert YouTube videos into multi-platform social media assets automatically.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database/Auth**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI**: Claude Sonnet 4 (Anthropic)
- **Transcription**: YouTube Data API v3 (captions fallback)
- **Background Jobs**: Railway (Node.js worker)
- **Payments**: LemonSqueezy
- **Analytics**: PostHog
- **Deployment**: Vercel (frontend) + Railway (worker)

## Getting Started

1. Copy `.env.local` and fill in your keys
2. Run `npm install`
3. Run the Supabase migration: `supabase/migrations/001_initial_schema.sql`
4. Start the dev server: `npm run dev`
