import { getCategories, createCategory } from '@/lib/blog'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function isAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === process.env.ADMIN_EMAIL
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const { name, slug } = body
  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
  }
  try {
    const category = await createCategory({ name, slug })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}
