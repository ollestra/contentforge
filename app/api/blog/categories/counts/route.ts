import { getPostCountByCategory } from '@/lib/blog'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const counts = await getPostCountByCategory()
    return NextResponse.json(counts)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
