import { getPosts, getCategories } from '@/lib/blog'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()])

  const published = posts.filter(p => p.status === 'published').length
  const draft = posts.filter(p => p.status === 'draft').length
  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c.name]))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <LogoutButton />
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
          >
            + New post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: posts.length },
          { label: 'Published', value: published },
          { label: 'Drafts', value: draft },
        ].map(stat => (
          <div key={stat.label} className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                <td className="px-4 py-3 text-gray-500">
                  {categoryMap[post.category] ?? post.category}
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(post.created_at)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-gray-400 hover:text-gray-900 text-xs"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No posts yet. Create your first one.
          </div>
        )}
      </div>
    </div>
  )
}
