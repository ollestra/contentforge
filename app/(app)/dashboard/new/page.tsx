'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Platform, TonePreset, AudienceTag, User } from '@/types/database'
import UpgradeModal from '@/components/UpgradeModal'

interface VideoMeta {
  title: string
  channelTitle: string
  thumbnail: string
}

const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'email', label: 'Email Newsletter', icon: '✉️' },
  { value: 'blog', label: 'Blog Post', icon: '✍️' },
]

const TONES: TonePreset[] = ['professional', 'casual', 'witty', 'inspirational']
const AUDIENCES: AudienceTag[] = ['entrepreneurs', 'marketers', 'developers', 'students', 'general']

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
  } catch {}
  return null
}

export default function NewProjectPage() {
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null)
  const [urlError, setUrlError] = useState('')
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [platforms, setPlatforms] = useState<Platform[]>(['linkedin', 'x'])
  const [tone, setTone] = useState<TonePreset>('professional')
  const [customTone, setCustomTone] = useState('')
  const [audience, setAudience] = useState<AudienceTag>('entrepreneurs')
  const [twitterFormat, setTwitterFormat] = useState<'single' | 'thread'>('single')
  const [includeHashtags, setIncludeHashtags] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setPlatforms(data.platforms_default || ['linkedin', 'x'])
        setTone(data.tone_preset as TonePreset || 'professional')
        setAudience(data.audience_tag as AudienceTag || 'entrepreneurs')
      }
    }
    loadProfile()
  }, [])

  const fetchVideoMeta = useCallback(async (id: string) => {
    setFetchingMeta(true)
    setUrlError('')
    try {
      const res = await fetch(`/api/youtube/video?id=${id}`)
      const data = await res.json()
      if (!data.items?.length) {
        setUrlError('Video not found or is private.')
        setVideoMeta(null)
        return
      }
      const snippet = data.items[0].snippet
      setVideoMeta({
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
      })
    } catch {
      setUrlError('Failed to fetch video info. Check your API key.')
      setVideoMeta(null)
    } finally {
      setFetchingMeta(false)
    }
  }, [])

  function handleUrlBlur() {
    const id = extractVideoId(url)
    if (!url) return
    if (!id) {
      setUrlError('Invalid YouTube URL. Use youtube.com/watch?v= or youtu.be/ format.')
      setVideoId(null)
      setVideoMeta(null)
      return
    }
    setVideoId(id)
    fetchVideoMeta(id)
  }

  function togglePlatform(p: Platform) {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function savePreferences() {
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tone_preset: customTone || tone,
        audience_tag: audience,
        platforms_default: platforms,
      }),
    })
  }

  async function handleGenerate() {
    if (!videoId || !videoMeta || platforms.length === 0) return
    const creditCost = platforms.length
    if (profile && profile.credit_balance < creditCost) {
      setShowUpgrade(true)
      return
    }
    setGenerating(true)
    await savePreferences()

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_url: url,
          video_title: videoMeta.title,
          platforms,
          tone: customTone || tone,
          audience,
          twitter_format: twitterFormat,
          include_hashtags: includeHashtags,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      router.push(`/project/${data.projectId}`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Generation failed')
      setGenerating(false)
    }
  }

  const creditCost = platforms.length
  const hasEnoughCredits = !profile || profile.credit_balance >= creditCost

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">New project</h1>

      {/* URL Input */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
        <input
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setUrlError(''); setVideoMeta(null) }}
          onBlur={handleUrlBlur}
          placeholder="Paste a YouTube URL to get started"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
        />
        {urlError && <p className="text-red-400 text-sm mt-2">{urlError}</p>}
        {fetchingMeta && (
          <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Fetching video info...
          </div>
        )}
      </div>

      {/* Video Preview */}
      {videoMeta && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-4 flex gap-4">
          {videoMeta.thumbnail && (
            <Image
              src={videoMeta.thumbnail}
              alt={videoMeta.title}
              width={128}
              height={80}
              className="object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div>
            <p className="text-white font-medium line-clamp-2">{videoMeta.title}</p>
            <p className="text-gray-400 text-sm mt-1">{videoMeta.channelTitle}</p>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {videoMeta && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6 mb-4">
          {/* Platform selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Platforms <span className="text-gray-500 font-normal">(+1 credit each)</span>
            </label>
            <div className="space-y-2">
              {PLATFORMS.map(p => (
                <div key={p.value}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platforms.includes(p.value)}
                      onChange={() => togglePlatform(p.value)}
                      className="w-4 h-4 rounded text-indigo-600 bg-gray-800 border-gray-600 focus:ring-indigo-500"
                    />
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-gray-200">{p.label}</span>
                  </label>
                  {p.value === 'x' && platforms.includes('x') && (
                    <div className="ml-11 mt-2 flex gap-3">
                      {(['single', 'thread'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setTwitterFormat(f)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            twitterFormat === f
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {f === 'single' ? 'Single tweet' : 'Thread'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Tone</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => { setTone(t); setCustomTone('') }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                    tone === t && !customTone
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customTone}
              onChange={e => setCustomTone(e.target.value)}
              placeholder="Custom tone..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Target audience</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map(a => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-all ${
                    audience === a
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtags toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Include hashtags</label>
            <button
              onClick={() => setIncludeHashtags(!includeHashtags)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeHashtags ? 'bg-indigo-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeHashtags ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Credit preview + Generate */}
      {videoMeta && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-medium">
                This will use{' '}
                <span className="text-indigo-400 font-bold">{creditCost} credit{creditCost !== 1 ? 's' : ''}</span>
              </p>
              {profile && (
                <p className={`text-sm mt-0.5 ${hasEnoughCredits ? 'text-gray-400' : 'text-red-400'}`}>
                  You have {profile.credit_balance} credit{profile.credit_balance !== 1 ? 's' : ''}
                  {!hasEnoughCredits && (
                    <span>
                      {' '}—{' '}
                      <button onClick={() => setShowUpgrade(true)} className="text-indigo-400 underline">
                        Top up credits
                      </button>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || platforms.length === 0 || !hasEnoughCredits}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors text-lg"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting generation...
              </span>
            ) : (
              `Generate for ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {showUpgrade && profile && (
        <UpgradeModal
          creditsNeeded={creditCost - profile.credit_balance}
          platformList={platforms}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  )
}
