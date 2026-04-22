'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initPostHog } from '@/lib/posthog'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then(({ default: ph }) => {
        ph.capture('$pageview', { path: pathname })
      })
    }
  }, [pathname])

  return <>{children}</>
}
