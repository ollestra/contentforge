import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const VARIANT_MAP: Record<string, { plan: string; credits: number }> = {}

function getVariantMap() {
  return {
    [process.env.LEMONSQUEEZY_STARTER_VARIANT_ID || 'starter']: { plan: 'starter', credits: 50 },
    [process.env.LEMONSQUEEZY_PRO_VARIANT_ID || 'pro']: { plan: 'pro', credits: 150 },
    [process.env.LEMONSQUEEZY_UNLIMITED_VARIANT_ID || 'unlimited']: { plan: 'unlimited', credits: 999999 },
    [process.env.LEMONSQUEEZY_TOPUP_VARIANT_ID || 'topup']: { plan: '', credits: 10 },
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const rawBody = await request.text()
  const signature = request.headers.get('x-signature') || ''

  const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '')
  hmac.update(rawBody)
  const digest = hmac.digest('hex')

  if (digest !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName: string = payload.meta?.event_name || ''
  const customData = payload.meta?.custom_data || {}
  const userId: string = customData.user_id

  if (!userId) {
    return NextResponse.json({ error: 'No user_id in custom data' }, { status: 400 })
  }

  const variantMap = getVariantMap()
  const variantId = String(
    payload.data?.attributes?.first_order_item?.variant_id ||
    payload.data?.attributes?.variant_id ||
    ''
  )
  const variantConfig = variantMap[variantId]

  if (eventName === 'order_created') {
    if (!variantConfig) {
      return NextResponse.json({ error: 'Unknown variant' }, { status: 400 })
    }

    if (variantConfig.plan) {
      await supabase.from('users').update({ plan: variantConfig.plan }).eq('id', userId)
    }

    await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: variantConfig.credits,
      p_type: 'purchase',
      p_job_id: null,
      p_description: `${variantConfig.plan || 'Top-up'} plan credits`,
    })
  }

  if (eventName === 'subscription_cancelled') {
    await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
  }

  if (eventName === 'subscription_renewed') {
    if (!variantConfig) {
      return NextResponse.json({ error: 'Unknown variant' }, { status: 400 })
    }
    await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: variantConfig.credits,
      p_type: 'purchase',
      p_job_id: null,
      p_description: `${variantConfig.plan || 'subscription'} renewal credits`,
    })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

// Keep unused import reference to avoid dead code warnings
void VARIANT_MAP
