'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const TipTapEditor = dynamic(() => import('@/components/blog/TipTapEditor'), { ssr: false })

type Category = { id: string; name: string; slug: string }

function autoSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [metaDescription, setMetaDescription] = useState('')
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/blog/categories').then(r => r.json()).then(setCategories)
  }, [])

  function handleTitleChange(t: string) {
    setTitle(t)
    if (!slugManual) setSlug(autoSlug(t))
  }

  function handleSlugChange(s: string) {
    setSlug(s)
    setSlugManual(true)
  }

  async function handleSave(postStatus: 'draft' | 'published') {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/blog/posts', {
        method: 'POST',
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900 text-sm">New Post</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Post title..."
            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none mb-6 bg-transparent"
          />
          <TipTapEditor content={content} onChange={setContent} />
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
              onChange={e => handleSlugChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-gray-900 focus:outline-none"
              placeholder="post-slug"
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
    </div>
  )
}
