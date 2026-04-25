'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  url: string
  alt: string
  onUrlChange: (url: string) => void
  onAltChange: (alt: string) => void
}

export default function FeaturedImageUpload({ url, alt, onUrlChange, onAltChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/blog/images', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
      onUrlChange(data.url)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
        Featured Image
      </label>

      {url ? (
        <div className="space-y-2">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <Image src={url} alt={alt || 'Featured image'} fill className="object-cover" />
            <button
              type="button"
              onClick={() => { onUrlChange(''); onAltChange('') }}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs px-2 py-1 rounded shadow"
            >
              Remove
            </button>
          </div>
          <input
            value={alt}
            onChange={e => onAltChange(e.target.value)}
            placeholder="Alt text (required for SEO)"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
          />
          <p className="text-xs text-gray-400">Describe the image for screen readers and search engines.</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-center text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : '+ Upload featured image'}
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
