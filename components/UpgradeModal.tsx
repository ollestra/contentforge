'use client'

import { useState } from 'react'

interface UpgradeModalProps {
  creditsNeeded: number
  platformList: string[]
  onClose: () => void
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$9/mo', credits: '50 credits/month' },
  { id: 'pro', name: 'Pro', price: '$19/mo', credits: '150 credits/month', popular: true },
  { id: 'unlimited', name: 'Unlimited', price: '$49/mo', credits: 'Unlimited' },
]

export default function UpgradeModal({ creditsNeeded, platformList, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">You&apos;re out of credits</h2>
          <p className="text-gray-400 mt-1 text-sm">
            You need {creditsNeeded} more credit{creditsNeeded !== 1 ? 's' : ''} to generate for{' '}
            <span className="text-indigo-300">{platformList.join(', ')}</span>.
          </p>
          <div className="mt-3 bg-gray-800 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full w-0" />
          </div>
          <p className="text-xs text-gray-500 mt-1">0 / {platformList.length} credits available</p>
        </div>

        <div className="p-6 space-y-3">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => checkout(plan.id)}
              disabled={loading !== null}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all disabled:opacity-60 ${
                plan.popular
                  ? 'border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{plan.name}</span>
                  {plan.popular && (
                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Most Popular</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{plan.credits}</span>
              </div>
              <span className="text-white font-semibold">
                {loading === plan.id ? 'Redirecting…' : plan.price}
              </span>
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 flex items-center justify-between">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white transition-colors">
            Maybe later
          </button>
          <button
            onClick={() => checkout('topup')}
            disabled={loading !== null}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-60"
          >
            {loading === 'topup' ? 'Redirecting…' : 'Just top up 10 credits ($2) →'}
          </button>
        </div>
      </div>
    </div>
  )
}
