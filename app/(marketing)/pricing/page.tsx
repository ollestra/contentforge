import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PricingCheckoutButton from '@/components/PricingCheckoutButton'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    credits: '5 credits forever',
    features: ['5 lifetime credits', 'Up to 5 projects', '3 variants per platform', 'LinkedIn, X, Instagram'],
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: '/mo',
    credits: '50/mo, roll over',
    features: ['50 credits/month (rollover)', 'Unlimited projects', '3 variants per platform', 'All platforms', 'Priority processing'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/mo',
    credits: '150/mo, roll over',
    features: ['150 credits/month (rollover)', 'Unlimited projects', '3 variants per platform', 'All platforms', 'Priority processing', 'Zapier/Make integration'],
    highlighted: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$49',
    period: '/mo',
    credits: 'Unlimited (fair use)',
    features: ['Unlimited credits (fair use)', 'Unlimited projects', '3 variants per platform', 'All platforms', 'Team seats', 'Priority support', 'Zapier/Make integration'],
    highlighted: false,
  },
]

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
    currentPlan = profile?.plan || 'free'
  }

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm mb-6 inline-block">
            ← Back to dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-gray-400 text-lg">Create once, distribute everywhere</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-gray-900 rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-gray-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ★ Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
                </div>
                <p className="text-gray-400 text-sm mt-1">{plan.credits}</p>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                currentPlan === 'free' ? (
                  <div className="text-center py-2 text-sm text-gray-500 border border-gray-700 rounded-xl">
                    {user ? 'Your current plan' : 'Free forever'}
                  </div>
                ) : (
                  <Link href={user ? '/dashboard' : '/signup'} className="block text-center py-2.5 text-sm font-medium text-gray-300 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors">
                    {user ? 'Current plan' : 'Get started free'}
                  </Link>
                )
              ) : currentPlan === plan.id ? (
                <div className="text-center py-2 text-sm text-gray-500 border border-gray-700 rounded-xl">
                  Your current plan
                </div>
              ) : (
                <PricingCheckoutButton
                  planId={plan.id}
                  label={`Get ${plan.name}`}
                  highlighted={plan.highlighted}
                  isLoggedIn={!!user}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
