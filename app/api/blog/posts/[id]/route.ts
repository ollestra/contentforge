import { getPostById, updatePost, deletePost } from '@/lib/blog'
import { isAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_STATUSES = ['draft', 'published'] as const
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const post = await getPostById(id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const { title, slug, content, status } = body
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0 || title.length > 200))
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  if (slug !== undefined && (typeof slug !== 'string' || !SLUG_RE.test(slug) || slug.length > 100))
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  if (content !== undefined && (typeof content !== 'string' || content.length > 500_000))
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  if (status !== undefined && !VALID_STATUSES.includes(status))
    return NextResponse.json({ error: 'status must be draft or published' }, { status: 400 })
  try {
    const post = await updatePost(id, body)
    revalidatePath('/blog')
    revalidatePath(`/blog/${post.slug}`)
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    await deletePost(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}
