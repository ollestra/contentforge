import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID!,
  topup: process.env.STRIPE_TOPUP_PRICE_ID!,
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId } = await request.json()
  const priceId = PRICE_MAP[planId]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const isTopup = planId === 'topup'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: isTopup ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { user_id: user.id },
    ...(isTopup ? {} : { subscription_data: { metadata: { user_id: user.id } } }),
  })

  return NextResponse.json({ url: session.url })
}
