'use client'

import { useState } from 'react'

interface PricingCheckoutButtonProps {
  planId: string
  label: string
  highlighted?: boolean
  isLoggedIn: boolean
}

export default function PricingCheckoutButton({ planId, label, highlighted, isLoggedIn }: PricingCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) {
      window.location.href = '/signup'
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full text-center py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-60 ${
        highlighted
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
      }`}
    >
      {loading ? 'Redirecting…' : label}
    </button>
  )
}
