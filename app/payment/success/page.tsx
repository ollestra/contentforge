'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

export default function PaymentSuccessPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [plan, setPlan] = useState<string>('')

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff'],
    })

    // Give webhook time to process, then fetch updated balance
    setTimeout(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('credit_balance, plan')
        .eq('id', user.id)
        .single()
      if (data) {
        setBalance(data.credit_balance)
        setPlan(data.plan)
      }
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">You&apos;re all set!</h1>
        {plan && <p className="text-indigo-400 font-medium mb-2 capitalize">{plan} plan activated</p>}
        {balance !== null && (
          <p className="text-gray-300 mb-6">
            Your new credit balance:{' '}
            <span className="text-green-400 font-bold text-xl">{balance}</span>
          </p>
        )}
        <Link
          href="/dashboard/new"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Continue generating →
        </Link>
      </div>
    </div>
  )
}
