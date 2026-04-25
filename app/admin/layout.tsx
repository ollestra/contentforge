import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL ?? 'ollestraa@gmail.com'
  if (!user) redirect('/admin/login')
  if (user.email !== adminEmail) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900">Admin</span>
          <Link href="/admin/blog" className="text-sm text-gray-500 hover:text-gray-900">
            Posts
          </Link>
          <Link href="/admin/blog/categories" className="text-sm text-gray-500 hover:text-gray-900">
            Categories
          </Link>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-900">
          ← App
        </Link>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}
