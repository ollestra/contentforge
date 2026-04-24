'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const TipTapEditor = dynamic(() => import('@/components/blog/TipTapEditor'), { ssr: false })

type Category = { id: string; name: string; slug: string }
type Post = {
  id: string
  title: string
  slug: string
  content: string
  category: string
  status: 'draft' | 'published'
  meta_description?: string | null
  tags?: string | null
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [metaDescription, setMetaDescription] = useState('')
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/blog/posts/${params.id}`).then(r => r.json()),
      fetch('/api/blog/categories').then(r => r.json()),
    ]).then(([post, cats]: [Post, Category[]]) => {
      setTitle(post.title)
      setSlug(post.slug)
      setContent(post.content)
      setCategory(post.category)
      setStatus(post.status)
      setMetaDescription(post.meta_description ?? '')
      setTags(post.tags ?? '')
      setCategories(cats)
      setLoading(false)
    })
  }, [params.id])

  async function handleSave(postStatus: 'draft' | 'published') {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/blog/posts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          category,
          status: postStatus,
          meta_description: metaDescription,
          tags,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save')
        return
      }
      router.push('/admin/blog')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/blog/posts/${params.id}`, { method: 'DELETE' })
    router.push('/admin/blog')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900 text-sm">Edit Post</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving || loading}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
      ) : (
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none mb-6 bg-transparent"
            />
            <TipTapEditor key={params.id} content={content} onChange={setContent} />
          </div>

          <div className="w-64 shrink-0 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                URL Slug
              </label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-gray-900 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">/blog/{slug || '...'}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-gray-900 focus:outline-none"
                placeholder="For SEO..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Tags
              </label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
