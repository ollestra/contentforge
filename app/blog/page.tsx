import { getPublishedPosts } from '@/lib/blog'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

function readingTime(html: string): string {
  const words = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

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

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  const [featured, ...rest] = posts

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
            <Link href="/blog" className="text-white text-sm px-3 py-2">
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

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Tips, guides &amp; product updates
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-4">
            The Blog
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to repurpose content faster and grow on every platform.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-24">

        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-24">No posts published yet.</p>
        )}

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block mb-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/5 hover:border-white/20 transition-all overflow-hidden"
          >
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-medium ${categoryClass(featured.category)}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(featured.created_at)}</span>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-gray-500">{readingTime(featured.content)}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors leading-snug">
                  {featured.title}
                </h2>
                {featured.meta_description && (
                  <p className="text-gray-400 text-base leading-relaxed line-clamp-2 mb-6">
                    {featured.meta_description}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-violet-400 group-hover:gap-2.5 transition-all font-medium">
                  Read article
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
              {featured.featured_image ? (
                <div className="hidden sm:block shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-white/10 relative">
                  <Image
                    src={featured.featured_image}
                    alt={featured.featured_image_alt ?? featured.title}
                    fill
                    className="object-cover"
                   
                  />
                </div>
              ) : (
                <div className="hidden sm:flex shrink-0 w-48 h-32 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 items-center justify-center">
                  <svg className="w-10 h-10 text-violet-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <>
            {featured && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
                More posts
              </h2>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-white/10 bg-white/5 hover:bg-white/5 hover:border-white/20 transition-all overflow-hidden"
                >
                  {post.featured_image && (
                    <div className="relative w-full h-40">
                      <Image
                        src={post.featured_image}
                        alt={post.featured_image_alt ?? post.title}
                        fill
                        className="object-cover"
                       
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-medium ${categoryClass(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    {post.meta_description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {post.meta_description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5 text-xs text-gray-600">
                      <span>{formatDate(post.created_at)}</span>
                      <span>·</span>
                      <span>{readingTime(post.content)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
