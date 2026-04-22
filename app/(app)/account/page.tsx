import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const creditColor =
    (profile?.credit_balance ?? 0) > 10
      ? 'text-green-400'
      : (profile?.credit_balance ?? 0) >= 3
      ? 'text-amber-400'
      : 'text-red-400'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Account</h1>

      {/* Plan + credits */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white capitalize font-medium">
              {profile?.plan || 'free'} plan
            </p>
            <p className={`text-2xl font-bold mt-1 ${creditColor}`}>
              {profile?.credit_balance ?? 0} credits
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Link
              href="/pricing"
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-center"
            >
              Upgrade plan
            </Link>
            {profile?.plan !== 'free' && <ManageSubscriptionButton />}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction history</h2>
        {!transactions?.length ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm">{tx.description || tx.type}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
