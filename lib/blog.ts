import { supabaseAdmin } from './supabase/admin'

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  category: string
  status: 'draft' | 'published'
  meta_description?: string | null
  tags?: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Post[]
}

export async function getPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Post[]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data as Post
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Post
}

export async function createPost(
  data: Omit<Post, 'id' | 'created_at' | 'updated_at'>
): Promise<Post> {
  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return post as Post
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>
): Promise<Post> {
  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return post as Post
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
  if (error) throw error
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Category[]
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return category as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function getPostCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin.from('posts').select('category')
  if (error) throw error
  const counts: Record<string, number> = {}
  data.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1
  })
  return counts
}
