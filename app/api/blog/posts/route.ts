import { createPost, getPosts } from '@/lib/blog'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'ollestraa@gmail.com'

async function isAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const posts = await getPosts()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const { title, slug, content, category } = body
  if (!title || !slug || !content || !category) {
    return NextResponse.json(
      { error: 'title, slug, content and category are required' },
      { status: 400 }
    )
  }
  try {
    const post = await createPost(body)
    revalidatePath('/blog')
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}
