import { getPostBySlug } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import DOMPurify from 'isomorphic-dompurify'

export const dynamic = 'force-dynamic'

const CATEGORY_COLORS: Record<string, string> = {
  tutorial:   'bg-violet-500/10 text-violet-300 border-violet-500/20',
  guide:      'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  update:     'bg-cyan-500/10    text-cyan-300    border-cyan-500/20',
  news:       'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  tips:       'bg-amber-500/10   text-amber-300   border-amber-500/20',
}

function categoryClass(cat: string) {
  return (
    CATEGORY_COLORS[cat.toLowerCase()] ??
    'bg-white/5 text-gray-400 border-white/10'
  )
}

function readingTime(html: string): string {
  const words = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post || post.status !== 'published') return {}
  return {
    title: post.title,
    description: post.meta_description ?? undefined,
    openGraph: {
      title: post.title,
      description: post.meta_description ?? '',
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post || post.status !== 'published') notFound()

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"
          >
            Ollestra
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="text-gray-400 hover:text-white text-sm px-3 py-2 transition-colors">
              Blog
            </Link>
            <Link href="/#pricing" className="text-gray-400 hover:text-white text-sm px-3 py-2 transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white text-sm px-3 py-2 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-16">

        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-3 mb-6">
          <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-medium ${categoryClass(post.category)}`}>
            {post.category}
          </span>
          <time className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
          <span className="text-gray-700 text-xs">·</span>
          <span className="text-xs text-gray-500">{readingTime(post.content)}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          {post.title}
        </h1>

        {/* Summary */}
        {post.meta_description && (
          <p className="text-lg text-gray-400 mb-10 leading-relaxed border-l-2 border-violet-500/40 pl-4">
            {post.meta_description}
          </p>
        )}

        <hr className="border-white/10 mb-10" />

        {/* Body */}
        <div
          className="blog-content prose-dark"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

      </article>

      {/* CTA footer */}
      <div className="border-t border-white/5 mt-8">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-500 text-sm mb-4">Found this helpful?</p>
          <h2 className="text-2xl font-bold mb-4">
            Turn your videos into content —{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              in seconds
            </span>
          </h2>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm"
          >
            Try Ollestra free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

    </div>
  )
}
