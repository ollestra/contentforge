import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid video id' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'YouTube API not configured' }, { status: 500 })

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return NextResponse.json(data)
}
