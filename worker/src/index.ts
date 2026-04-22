import 'dotenv/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface Job {
  id: string
  project_id: string
  user_id: string
  status: string
  current_step: string
  platforms: string[]
  retries: number
  error_message: string | null
}

interface Project {
  id: string
  youtube_url: string
  video_title: string | null
  summary: string | null
}

interface ContentSummary {
  main_topic: string
  key_ideas: string[]
  memorable_quotes: string[]
  content_type: 'educational' | 'entertainment' | 'interview' | 'tutorial'
}

interface ContentVariant {
  post: string
  hook: string
  cta: string
  hashtags?: string[]
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function updateJob(jobId: string, updates: Partial<Job>) {
  await supabase.from('jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', jobId)
}

async function fetchYouTubeCaptions(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`
    )
    const data = await res.json()
    if (!data.items?.length) return null

    // Use auto-generated or first available caption
    const caption = data.items.find((c: { snippet: { trackKind: string } }) => c.snippet.trackKind === 'asr') || data.items[0]
    if (!caption) return null

    // Fetch caption content
    const captionRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${caption.id}?key=${process.env.YOUTUBE_API_KEY}`,
      { headers: { Accept: 'text/plain' } }
    )
    if (!captionRes.ok) return null
    return await captionRes.text()
  } catch {
    return null
  }
}

async function fetchVideoDescription(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`
    )
    const data = await res.json()
    return data.items?.[0]?.snippet?.description || null
  } catch {
    return null
  }
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
  } catch {}
  return null
}

function chunkText(text: string, maxWords = 10000): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }
  return chunks
}

async function summarizeChunk(text: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Summarize the key points from this transcript segment in 2-3 paragraphs:\n\n${text}`,
      },
    ],
  })
  return (msg.content[0] as { type: string; text: string }).text
}

async function generateSummary(transcript: string): Promise<ContentSummary> {
  const words = transcript.split(/\s+/).length

  let processedText = transcript
  if (words > 12000) {
    const chunks = chunkText(transcript, 10000)
    const chunkSummaries = await Promise.all(chunks.map(summarizeChunk))
    processedText = chunkSummaries.join('\n\n')
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: 'You are a content strategist. Extract the 5-7 key ideas, main argument, and memorable quotes from this transcript. Return ONLY valid JSON with no markdown formatting.',
    messages: [
      {
        role: 'user',
        content: `Analyze this transcript and return JSON with this exact structure:
{
  "main_topic": "string",
  "key_ideas": ["string"],
  "memorable_quotes": ["string"],
  "content_type": "educational" | "entertainment" | "interview" | "tutorial"
}

Transcript:
${processedText}`,
      },
    ],
  })

  const text = (msg.content[0] as { type: string; text: string }).text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid summary response from Claude')
  return JSON.parse(jsonMatch[0]) as ContentSummary
}

async function generatePlatformContent(
  platform: string,
  summary: ContentSummary,
  tone: string,
  audience: string,
  twitterFormat: string,
  includeHashtags: boolean
): Promise<ContentVariant[]> {
  const format =
    platform === 'x' && twitterFormat === 'thread'
      ? 'thread (5-7 tweets separated by ---)'
      : platform === 'x'
      ? 'single tweet (max 280 chars)'
      : platform === 'linkedin'
      ? 'LinkedIn post (150-300 words)'
      : platform === 'instagram'
      ? 'Instagram caption (100-150 words)'
      : platform === 'email'
      ? 'email newsletter section (200-400 words)'
      : 'blog post intro (300-500 words)'

  const hashtagsInstruction = includeHashtags
    ? 'Include 3-5 relevant hashtags in the hashtags field.'
    : 'Leave the hashtags field empty or omit it.'

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert social media content creator. Return ONLY valid JSON with no markdown.`,
    messages: [
      {
        role: 'user',
        content: `Using this content summary, create ${platform} content.
Tone: ${tone}. Target audience: ${audience}.

Summary:
- Topic: ${summary.main_topic}
- Key ideas: ${summary.key_ideas.join(', ')}
- Memorable quotes: ${summary.memorable_quotes.slice(0, 3).join(' | ')}
- Content type: ${summary.content_type}

Generate EXACTLY 3 variants of:
- A ${format}
- A hook (first 1-2 sentences to stop the scroll)
- A CTA (call to action)
${hashtagsInstruction}

Return ONLY this JSON:
{
  "variants": [
    { "post": "string", "hook": "string", "cta": "string", "hashtags": [] },
    { "post": "string", "hook": "string", "cta": "string", "hashtags": [] },
    { "post": "string", "hook": "string", "cta": "string", "hashtags": [] }
  ]
}`,
      },
    ],
  })

  const text = (msg.content[0] as { type: string; text: string }).text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Invalid response for platform ${platform}`)
  const parsed = JSON.parse(jsonMatch[0])
  return parsed.variants as ContentVariant[]
}

async function processJob(job: Job) {
  console.log(`Processing job ${job.id} for platforms: ${job.platforms.join(', ')}`)

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', job.project_id)
    .single()

  if (projectError || !project) {
    await updateJob(job.id, { status: 'failed', error_message: 'Project not found' })
    return
  }

  let summary: ContentSummary | null = null
  const tone = 'professional'
  const audience = 'entrepreneurs'
  const twitterFormat = 'single'
  const includeHashtags = false

  // Try to use cached summary
  if (project.summary) {
    try {
      summary = JSON.parse(project.summary) as ContentSummary
      console.log(`Cache hit: using existing summary for project ${project.id}`)
    } catch {
      summary = null
    }
  }

  if (!summary) {
    // Step 1: Transcribe
    await updateJob(job.id, { current_step: 'transcribing' })

    const videoId = extractVideoId(project.youtube_url)
    if (!videoId) {
      await updateJob(job.id, { status: 'failed', error_message: 'Invalid YouTube URL' })
      await supabase.from('projects').update({ status: 'failed' }).eq('id', project.id)
      return
    }

    let transcript = await fetchYouTubeCaptions(videoId)
    if (!transcript) {
      console.log('No captions, falling back to description')
      transcript = await fetchVideoDescription(videoId)
    }
    if (!transcript) {
      await updateJob(job.id, { status: 'failed', error_message: 'Could not extract transcript or description' })
      await supabase.from('projects').update({ status: 'failed' }).eq('id', project.id)
      return
    }

    // Step 2: Summarize
    await updateJob(job.id, { current_step: 'summarizing' })

    try {
      summary = await generateSummary(transcript)
      await supabase
        .from('projects')
        .update({ summary: JSON.stringify(summary) })
        .eq('id', project.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Summarization failed'
      await updateJob(job.id, { status: 'failed', error_message: msg })
      await supabase.from('projects').update({ status: 'failed' }).eq('id', project.id)
      return
    }
  }

  // Step 3: Generate per platform (parallel)
  await updateJob(job.id, { current_step: 'generating' })

  const results = await Promise.allSettled(
    job.platforms.map(async (platform) => {
      try {
        const variants = await generatePlatformContent(
          platform, summary!, tone, audience, twitterFormat, includeHashtags
        )

        // Insert outputs
        const outputRows = variants.map((v, i) => [
          {
            project_id: job.project_id,
            user_id: job.user_id,
            job_id: job.id,
            platform,
            output_type: 'post',
            variant_number: i + 1,
            content: v.post,
          },
          {
            project_id: job.project_id,
            user_id: job.user_id,
            job_id: job.id,
            platform,
            output_type: 'hook',
            variant_number: i + 1,
            content: v.hook,
          },
          {
            project_id: job.project_id,
            user_id: job.user_id,
            job_id: job.id,
            platform,
            output_type: 'cta',
            variant_number: i + 1,
            content: v.cta,
          },
          ...(v.hashtags?.length
            ? [{
                project_id: job.project_id,
                user_id: job.user_id,
                job_id: job.id,
                platform,
                output_type: 'hashtags',
                variant_number: i + 1,
                content: v.hashtags!.join(' '),
              }]
            : []),
        ]).flat()

        await supabase.from('outputs').insert(outputRows)
        return platform
      } catch (err) {
        // Retry once
        await sleep(2000)
        try {
          const variants = await generatePlatformContent(
            platform, summary!, tone, audience, twitterFormat, includeHashtags
          )
          const outputRows = variants.map((v, i) => [
            {
              project_id: job.project_id,
              user_id: job.user_id,
              job_id: job.id,
              platform,
              output_type: 'post',
              variant_number: i + 1,
              content: v.post,
            },
            {
              project_id: job.project_id,
              user_id: job.user_id,
              job_id: job.id,
              platform,
              output_type: 'hook',
              variant_number: i + 1,
              content: v.hook,
            },
            {
              project_id: job.project_id,
              user_id: job.user_id,
              job_id: job.id,
              platform,
              output_type: 'cta',
              variant_number: i + 1,
              content: v.cta,
            },
          ]).flat()
          await supabase.from('outputs').insert(outputRows)
          return platform
        } catch {
          throw err
        }
      }
    })
  )

  const allFailed = results.every(r => r.status === 'rejected')
  const anyFailed = results.some(r => r.status === 'rejected')

  if (allFailed) {
    const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult
    await updateJob(job.id, {
      status: 'failed',
      error_message: firstError.reason?.message || 'All platforms failed',
    })
    await supabase.from('projects').update({ status: 'failed' }).eq('id', project.id)
  } else {
    await updateJob(job.id, { status: 'done', current_step: 'done' })
    await supabase.from('projects').update({ status: 'complete' }).eq('id', project.id)

    if (anyFailed) {
      await supabase.rpc('refund_credits_for_job', { p_job_id: job.id })
    }
  }

  console.log(`Job ${job.id} complete`)
}

async function pollJobs() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)

  if (!jobs || jobs.length === 0) return

  const job = jobs[0] as Job

  // Concurrency check for free plan users
  const { data: userProfile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', job.user_id)
    .single()

  if (userProfile?.plan === 'free') {
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', job.user_id)
      .eq('status', 'processing')

    if ((count ?? 0) >= 1) {
      return // Skip — user already has a job processing
    }
  }

  // Claim the job
  const { data: claimed, error } = await supabase
    .from('jobs')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', job.id)
    .eq('status', 'pending')
    .select()

  if (error || !claimed?.length) return // Another worker claimed it

  try {
    await processJob(job)
  } catch (err) {
    console.error(`Fatal error processing job ${job.id}:`, err)
    await updateJob(job.id, {
      status: 'failed',
      error_message: err instanceof Error ? err.message : 'Unknown error',
    })
    await supabase.from('projects').update({ status: 'failed' }).eq('id', job.project_id)
  }
}

async function main() {
  console.log('ContentForge worker started')
  while (true) {
    try {
      await pollJobs()
    } catch (err) {
      console.error('Poll error:', err)
    }
    await sleep(3000)
  }
}

main()
