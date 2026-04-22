import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { GenerateRequest, Platform } from '@/types/database'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: GenerateRequest = await request.json()
  const { youtube_url, video_title, platforms } = body

  if (!platforms || platforms.length === 0) {
    return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 })
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await service
    .from('users')
    .select('credit_balance, plan')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  if (profile.credit_balance < platforms.length) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // Free plan: max 1 active job
  if (profile.plan === 'free') {
    const { count } = await service
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'processing')

    if ((count ?? 0) >= 1) {
      return NextResponse.json({ error: 'Free plan allows 1 concurrent job. Please wait for your current job to complete.' }, { status: 429 })
    }
  }

  // Check cache: existing project with same URL
  const { data: existingProject } = await service
    .from('projects')
    .select('id, summary')
    .eq('user_id', user.id)
    .eq('youtube_url', youtube_url)
    .not('summary', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let projectId: string

  if (existingProject) {
    projectId = existingProject.id
  } else {
    const { data: newProject, error: projectError } = await service
      .from('projects')
      .insert({
        user_id: user.id,
        name: video_title || 'Untitled project',
        youtube_url,
        video_title,
        status: 'processing',
      })
      .select('id')
      .single()

    if (projectError || !newProject) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
    projectId = newProject.id
  }

  // Deduct credits
  const { error: creditError } = await service.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: platforms.length,
    p_job_id: null,
    p_description: `Generation for ${platforms.join(', ')}`,
  })

  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: 402 })
  }

  // Create job
  const { data: job, error: jobError } = await service
    .from('jobs')
    .insert({
      project_id: projectId,
      user_id: user.id,
      status: 'pending',
      current_step: 'transcribing',
      platforms: platforms as Platform[],
    })
    .select('id')
    .single()

  if (jobError || !job) {
    // Refund on failure
    await service.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: platforms.length,
      p_type: 'refund',
      p_job_id: null,
      p_description: 'Refund: failed to create job',
    })
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  // Update job with its own ID as reference (for credit tracking)
  await service.from('jobs').update({ id: job.id }).eq('id', job.id)

  return NextResponse.json({ projectId, jobId: job.id }, { status: 200 })
}
