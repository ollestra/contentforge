'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Job, Output, Platform } from '@/types/database'

const STEPS = ['transcribing', 'summarizing', 'generating', 'done'] as const
const STEP_LABELS: Record<string, string> = {
  transcribing: 'Transcribing',
  summarizing: 'Summarizing',
  generating: 'Generating',
  done: 'Done',
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼',
  x: '𝕏',
  instagram: '📷',
  email: '✉️',
  blog: '✍️',
}

interface OutputCardProps {
  platform: Platform
  outputs: Output[]
  onSave: (id: string, content: string) => Promise<void>
}

function OutputCard({ platform, outputs, onSave }: OutputCardProps) {
  const [activeVariant, setActiveVariant] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const variantOutputs = (v: number) => outputs.filter(o => o.variant_number === v)
  const current = variantOutputs(activeVariant)
  const post = current.find(o => o.output_type === 'post' || o.output_type === 'thread')
  const hook = current.find(o => o.output_type === 'hook')
  const cta = current.find(o => o.output_type === 'cta')
  const hashtags = current.find(o => o.output_type === 'hashtags')

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSave(output: Output) {
    setSaving(true)
    await onSave(output.id, editContent)
    setSaving(false)
    setEditingId(null)
  }

  const variants = Array.from(new Set(outputs.map(o => o.variant_number))).sort()

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
        <span className="text-2xl">{PLATFORM_ICONS[platform] || '📱'}</span>
        <h3 className="text-white font-semibold capitalize">{platform === 'x' ? 'X (Twitter)' : platform}</h3>
      </div>

      {/* Variant tabs */}
      <div className="flex border-b border-gray-800">
        {variants.map(v => (
          <button
            key={v}
            onClick={() => setActiveVariant(v)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeVariant === v
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Variant {v}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Post */}
        {post && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Post</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{post.content.length} chars</span>
                <button
                  onClick={() => handleCopy(post.content, `post-${post.id}`)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copied === `post-${post.id}` ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            {editingId === post.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-800 border border-indigo-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSave(post)}
                    disabled={saving}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                onClick={() => { setEditingId(post.id); setEditContent(post.content) }}
                className="text-gray-200 text-sm leading-relaxed cursor-text hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-colors whitespace-pre-wrap"
              >
                {post.content}
                {post.is_edited && <span className="ml-2 text-xs text-indigo-400">(edited)</span>}
              </p>
            )}
          </div>
        )}

        {/* Hook */}
        {hook && (
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">Hook</span>
              <span className="text-gray-500 text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-300 text-sm">{hook.content}</p>
              <button
                onClick={() => handleCopy(hook.content, `hook-${hook.id}`)}
                className="text-xs text-gray-400 hover:text-white mt-1 transition-colors"
              >
                {copied === `hook-${hook.id}` ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </details>
        )}

        {/* CTA */}
        {cta && (
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-xs font-medium text-green-400 uppercase tracking-wide">CTA</span>
              <span className="text-gray-500 text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-300 text-sm">{cta.content}</p>
              <button
                onClick={() => handleCopy(cta.content, `cta-${cta.id}`)}
                className="text-xs text-gray-400 hover:text-white mt-1 transition-colors"
              >
                {copied === `cta-${cta.id}` ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </details>
        )}

        {/* Hashtags */}
        {hashtags && (
          <div className="flex flex-wrap gap-1">
            {hashtags.content.split(' ').map((tag, i) => (
              <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function ProjectPage({ params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) return <div className="p-8 text-gray-400">Invalid project.</div>

  const [job, setJob] = useState<Job | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [projectName, setProjectName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadProject = useCallback(async () => {
    const { data: project } = await supabase
      .from('projects')
      .select('name, status')
      .eq('id', params.id)
      .single()

    if (project) {
      setProjectName(project.name)
      setNameInput(project.name)
    }

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (jobs?.length) setJob(jobs[0] as Job)

    const { data: existingOutputs } = await supabase
      .from('outputs')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })

    if (existingOutputs) setOutputs(existingOutputs as Output[])
    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  useEffect(() => {
    const jobChannel = supabase
      .channel(`job-${params.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `project_id=eq.${params.id}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        setJob(payload.new as Job)
      })
      .subscribe()

    const outputChannel = supabase
      .channel(`outputs-${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'outputs',
        filter: `project_id=eq.${params.id}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        setOutputs(prev => [...prev, payload.new as Output])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(jobChannel)
      supabase.removeChannel(outputChannel)
    }
  }, [params.id, supabase])

  async function handleSaveOutput(id: string, content: string) {
    await fetch(`/api/outputs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setOutputs(prev => prev.map(o => o.id === id ? { ...o, content, is_edited: true } : o))
  }

  async function handleSaveName() {
    if (nameInput === projectName) { setEditingName(false); return }
    await fetch(`/api/projects/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput }),
    })
    setProjectName(nameInput)
    setEditingName(false)
  }

  const platformsWithOutputs = Array.from(new Set(outputs.map(o => o.platform))) as Platform[]
  const currentStepIdx = job ? STEPS.indexOf(job.current_step as typeof STEPS[number]) : -1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Project name */}
      <div className="mb-6">
        {editingName ? (
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            className="text-2xl font-bold text-white bg-gray-800 border border-indigo-500 rounded-lg px-3 py-1 focus:outline-none"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            className="text-2xl font-bold text-white cursor-text hover:text-gray-300 transition-colors"
          >
            {projectName}
          </h1>
        )}
      </div>

      {/* Progress bar */}
      {job && job.status !== 'done' && job.status !== 'failed' && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i < currentStepIdx
                      ? 'bg-indigo-600 text-white'
                      : i === currentStepIdx
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {i < currentStepIdx ? '✓' : i === currentStepIdx ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${i <= currentStepIdx ? 'text-indigo-400' : 'text-gray-500'}`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-16 mx-2 mb-4 ${i < currentStepIdx ? 'bg-indigo-600' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {job?.status === 'failed' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
          <h3 className="text-red-400 font-semibold mb-1">Generation failed</h3>
          <p className="text-gray-400 text-sm">{job.error_message || 'An unknown error occurred.'}</p>
          <button
            onClick={() => router.push('/dashboard/new')}
            className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Try again
          </button>
        </div>
      )}

      {/* Output cards */}
      {platformsWithOutputs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformsWithOutputs.map(platform => (
            <OutputCard
              key={platform}
              platform={platform}
              outputs={outputs.filter(o => o.platform === platform)}
              onSave={handleSaveOutput}
            />
          ))}
        </div>
      )}

      {platformsWithOutputs.length === 0 && job?.status !== 'failed' && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">⚡</div>
          <p>Generating your content...</p>
        </div>
      )}
    </div>
  )
}
