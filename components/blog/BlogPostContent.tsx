'use client'

import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

export default function BlogPostContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = DOMPurify.sanitize(html)
    }
  }, [html])

  return <div ref={ref} className="blog-content prose-dark" />
}
