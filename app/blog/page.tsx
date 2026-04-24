import { getPublishedPosts } from '@/lib/blog'
import Link from 'next/link'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim().slice(0, 120)
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-500 mb-12">Tips, guides, and product updates.</p>

        <div className="grid sm:grid-cols-2 gap-6">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block border border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-2">
                {post.meta_description || stripHtml(post.content)}
              </p>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-400 col-span-2 py-16 text-center">
              No posts published yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
