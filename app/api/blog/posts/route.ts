import { createPost, getPosts } from '@/lib/blog'
import { isAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const posts = await getPosts()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

const VALID_STATUSES = ['draft', 'published'] as const
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validatePostBody(body: Record<string, unknown>): string | null {
  const { title, slug, content, category, status } = body
  if (!title || typeof title !== 'string' || title.trim().length === 0) return 'title is required'
  if (title.length > 200) return 'title must be 200 characters or fewer'
  if (!slug || typeof slug !== 'string' || !SLUG_RE.test(slug)) return 'slug must be lowercase letters, numbers and hyphens only'
  if (slug.length > 100) return 'slug must be 100 characters or fewer'
  if (!content || typeof content !== 'string') return 'content is required'
  if (content.length > 500_000) return 'content exceeds maximum size'
  if (!category || typeof category !== 'string' || category.trim().length === 0) return 'category is required'
  if (status !== undefined && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) return 'status must be draft or published'
  return null
}

export async function POST(request: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const validationError = validatePostBody(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  try {
    const post = await createPost(body)
    revalidatePath('/blog')
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}
