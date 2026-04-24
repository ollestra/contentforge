import { getPostBySlug } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">
          ← Blog
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
            {post.category}
          </span>
          <time className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {post.meta_description && (
          <p className="text-lg text-gray-500 mb-8 border-l-4 border-gray-200 pl-4">
            {post.meta_description}
          </p>
        )}

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  )
}
