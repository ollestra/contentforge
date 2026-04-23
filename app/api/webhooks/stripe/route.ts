import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getPriceMap() {
  return {
    [process.env.STRIPE_STARTER_PRICE_ID!]: { plan: 'starter', credits: 50 },
    [process.env.STRIPE_PRO_PRICE_ID!]: { plan: 'pro', credits: 150 },
    [process.env.STRIPE_UNLIMITED_PRICE_ID!]: { plan: 'unlimited', credits: 999999 },
    [process.env.STRIPE_TOPUP_PRICE_ID!]: { plan: '', credits: 10 },
  } as Record<string, { plan: string; credits: number }>
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const priceMap = getPriceMap()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (!userId) return NextResponse.json({ error: 'No user_id in metadata' }, { status: 400 })

    if (session.mode === 'payment') {
      await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: 10,
        p_type: 'purchase',
        p_job_id: null,
        p_description: 'Top-up credits',
      })
    } else if (session.mode === 'subscription') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0]?.price.id
      const config = priceMap[priceId]
      if (config?.plan) {
        await supabase.from('users').update({ plan: config.plan }).eq('id', userId)
      }
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const subDetails = invoice.parent?.subscription_details
    if (!subDetails) return NextResponse.json({ received: true })

    // Use snapshot metadata from invoice (set at subscription creation)
    const userId = subDetails.metadata?.user_id as string | undefined
    if (!userId) return NextResponse.json({ received: true })

    const subscriptionId = typeof subDetails.subscription === 'string'
      ? subDetails.subscription
      : subDetails.subscription?.id

    if (!subscriptionId) return NextResponse.json({ received: true })

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0]?.price.id
    const config = priceMap[priceId]
    if (!config) return NextResponse.json({ received: true })

    await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: config.credits,
      p_type: 'purchase',
      p_job_id: null,
      p_description: `${config.plan || 'subscription'} credits`,
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.user_id
    if (userId) {
      await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
