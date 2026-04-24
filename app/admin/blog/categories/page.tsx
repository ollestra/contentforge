'use client'

import { useState, useEffect, useCallback } from 'react'

type Category = { id: string; name: string; slug: string }

function autoSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [cats, cnts] = await Promise.all([
      fetch('/api/blog/categories').then(r => r.json()),
      fetch('/api/blog/categories/counts').then(r => r.json()),
    ])
    setCategories(cats)
    setCounts(cnts)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function handleNameChange(n: string) {
    setNewName(n)
    if (!slugManual) setNewSlug(autoSlug(n))
  }

  async function handleAdd() {
    if (!newName || !newSlug) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/blog/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, slug: newSlug }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Failed to add category')
    } else {
      setNewName('')
      setNewSlug('')
      setSlugManual(false)
      await loadData()
    }
    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete category "${name}"?`)) return
    await fetch(`/api/blog/categories/${id}`, { method: 'DELETE' })
    await loadData()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Categories</h1>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Slug
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Posts
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 text-gray-500">{counts[cat.slug] ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-gray-300 hover:text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Add Category</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              value={newName}
              onChange={e => handleNameChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              placeholder="e.g. Product Updates"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <input
              value={newSlug}
              onChange={e => { setNewSlug(e.target.value); setSlugManual(true) }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-gray-900 focus:outline-none"
              placeholder="product-updates"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !newName || !newSlug}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
