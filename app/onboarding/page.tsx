'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Platform, TonePreset } from '@/types/database'

const TOTAL_STEPS = 4

const PLATFORM_OPTIONS: { value: Platform; label: string; icon: string }[] = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'email', label: 'Email Newsletter', icon: '✉️' },
]

const TONE_OPTIONS: { value: TonePreset; label: string; desc: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Authoritative & polished' },
  { value: 'casual', label: 'Casual', desc: 'Friendly & approachable' },
  { value: 'witty', label: 'Witty', desc: 'Clever & entertaining' },
  { value: 'inspirational', label: 'Inspirational', desc: 'Motivating & uplifting' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [niche, setNiche] = useState('')
  const [primaryPlatform, setPrimaryPlatform] = useState<Platform | ''>('')
  const [tone, setTone] = useState<TonePreset>('professional')
  const [customTone, setCustomTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function canProceed() {
    if (step === 1) return fullName.trim().length > 0
    if (step === 2) return niche.trim().length > 0
    if (step === 3) return primaryPlatform !== ''
    return true
  }

  async function handleComplete() {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        niche,
        primary_platform: primaryPlatform,
        tone_preset: customTone || tone,
        platforms_default: [primaryPlatform as Platform],
      })

      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">What&apos;s your name?</h2>
              <p className="text-gray-400 mb-6">We&apos;ll personalize your experience</p>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                placeholder="Your full name"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">What&apos;s your niche?</h2>
              <p className="text-gray-400 mb-6">This helps tailor your content tone</p>
              <input
                type="text"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                placeholder="e.g. fitness coaching, SaaS startup, real estate"
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Primary platform?</h2>
              <p className="text-gray-400 mb-6">Where do you post most often?</p>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORM_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPrimaryPlatform(p.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      primaryPlatform === p.value
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Content tone?</h2>
              <p className="text-gray-400 mb-6">How do you want to sound?</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {TONE_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => { setTone(t.value); setCustomTone('') }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      tone === t.value && !customTone
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <p className="font-medium text-white">{t.label}</p>
                    <p className="text-sm text-gray-400">{t.desc}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Or describe your own tone</label>
                <input
                  type="text"
                  value={customTone}
                  onChange={e => setCustomTone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Bold and data-driven"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {loading ? 'Setting up...' : "Let's go!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
