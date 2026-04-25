import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  async function signIn(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (error) {
      redirect('/admin/login?error=' + encodeURIComponent(error.message))
    }
    redirect('/admin/blog')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-gray-200 rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-black mb-6">Admin Sign In</h1>

        <form action={signIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
