import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from('projects')
      .select(`
        id, name, youtube_url, video_title, status, created_at,
        outputs(platform)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('users')
      .select('plan, credit_balance')
      .eq('id', user.id)
      .single(),
  ])

  const isFreePlan = profile?.plan === 'free'
  const atFreeLimit = isFreePlan && (projects?.length ?? 0) >= 5

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
      </div>

      {atFreeLimit && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-amber-300 text-sm">
            You&apos;ve reached the free limit of 5 projects.
          </p>
          <Link href="/pricing" className="text-sm bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-1.5 rounded-lg">
            Upgrade
          </Link>
        </div>
      )}

      <DashboardClient
        initialProjects={projects ?? []}
        atFreeLimit={atFreeLimit}
      />
    </div>
  )
}
