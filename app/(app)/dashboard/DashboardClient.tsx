'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Platform } from '@/types/database'

interface ProjectRow {
  id: string
  name: string
  youtube_url: string
  video_title: string | null
  status: string
  created_at: string
  outputs: { platform: string }[]
}

const PLATFORM_OPTIONS: Platform[] = ['linkedin', 'x', 'instagram', 'email', 'blog']
const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼',
  x: '𝕏',
  instagram: '📷',
  email: '✉️',
  blog: '✍️',
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    return u.searchParams.get('v')
  } catch { return null }
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function DashboardClient({
  initialProjects,
  atFreeLimit,
}: {
  initialProjects: ProjectRow[]
  atFreeLimit: boolean
}) {
  const [activeTab, setActiveTab] = useState<'all' | Platform>('all')
  const router = useRouter()

  const filteredProjects = activeTab === 'all'
    ? initialProjects
    : initialProjects.filter(p =>
        p.outputs.some((o: { platform: string }) => o.platform === activeTab)
      )

  if (initialProjects.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🎬</div>
        <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
        <p className="text-gray-400 mb-6">Paste your first YouTube URL to get started</p>
        <Link
          href="/dashboard/new"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl"
        >
          Create your first project
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Platform tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {PLATFORM_OPTIONS.map(p => (
          <button
            key={p}
            onClick={() => setActiveTab(p)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === p
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {PLATFORM_ICONS[p]} {p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* New project card */}
        {atFreeLimit ? (
          <div className="bg-gray-900 border border-gray-700 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 opacity-50 cursor-not-allowed">
            <div className="text-3xl mb-2">+</div>
            <p className="text-gray-400 text-sm text-center">Upgrade to add more projects</p>
          </div>
        ) : (
          <Link
            href="/dashboard/new"
            className="bg-gray-900 border border-gray-700 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-500 hover:bg-gray-900/80 transition-all group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">+</div>
            <p className="text-gray-400 text-sm">New project</p>
          </Link>
        )}

        {filteredProjects.map(project => {
          const videoId = getYouTubeId(project.youtube_url)
          const thumbnail = videoId
            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            : null
          const platforms = Array.from(new Set(project.outputs.map((o: { platform: string }) => o.platform)))

          return (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-600 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-800">
                {thumbnail ? (
                  <img src={thumbnail} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">🎬</div>
                )}
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  {project.status === 'processing' && (
                    <span className="flex items-center gap-1 bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-full">
                      <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                      Processing
                    </span>
                  )}
                  {project.status === 'complete' && (
                    <span className="bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full">
                      ✓ Complete
                    </span>
                  )}
                  {project.status === 'failed' && (
                    <span className="bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-full">
                      Failed
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                {project.video_title && project.video_title !== project.name && (
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{project.video_title}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1">
                    {platforms.map(p => (
                      <span key={p} className="text-sm" title={p}>{PLATFORM_ICONS[p] || '📱'}</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">{timeAgo(project.created_at)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
