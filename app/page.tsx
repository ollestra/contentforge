import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-white mb-4">
        Content<span className="text-indigo-400">Forge</span>
      </h1>
      <p className="text-xl text-gray-400 mb-3 max-w-2xl">
        Create once → distribute everywhere → grow faster
      </p>
      <p className="text-gray-500 mb-8 max-w-lg">
        Paste a YouTube URL. Get platform-optimized posts, hooks, and CTAs for LinkedIn, X, Instagram, and more — in seconds.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Get started free
        </Link>
        <Link
          href="/login"
          className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
        >
          Sign in
        </Link>
      </div>
      <p className="text-gray-600 text-sm mt-6">5 free credits, no card required</p>
    </div>
  )
}
