import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
  if (!customers.data.length) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${appUrl}/account`,
  })

  return NextResponse.json({ url: session.url })
}
