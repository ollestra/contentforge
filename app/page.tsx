import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant extraction',
    desc: 'AI reads the full transcript and distills the key insights in seconds.',
  },
  {
    icon: '🎯',
    title: 'Platform-native tone',
    desc: 'LinkedIn hooks, tweet threads, Instagram captions — each tuned for the algorithm.',
  },
  {
    icon: '🔄',
    title: '3 variants per post',
    desc: 'Never post the same angle twice. Multiple variations generated automatically.',
  },
  {
    icon: '🪝',
    title: 'Viral hooks & CTAs',
    desc: 'Stop-scroll openers and clear calls-to-action baked into every piece.',
  },
  {
    icon: '📋',
    title: 'One-click copy',
    desc: 'Copy any output straight to clipboard and paste into your scheduler.',
  },
  {
    icon: '♻️',
    title: 'Credit rollover',
    desc: 'Unused credits carry forward every month on paid plans.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Founder @ GrowthLoop',
    text: 'I was spending 4 hours repurposing each video. Ollestra cut that to under 10 minutes. My LinkedIn impressions tripled in 6 weeks.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Reid',
    role: 'Content Strategist',
    text: 'The platform-specific tone is shockingly good. LinkedIn hooks that actually get engagement, not just AI slop.',
    avatar: 'MR',
  },
  {
    name: 'Priya Mehta',
    role: 'B2B SaaS Marketer',
    text: 'Finally a tool that understands YouTube → LinkedIn is not just copy-paste. The variants feature alone is worth the subscription.',
    avatar: 'PM',
  },
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    credits: '5 credits forever',
    features: ['5 lifetime credits', 'Up to 5 projects', '3 variants per platform', 'LinkedIn, X, Instagram'],
    highlighted: false,
    cta: 'Get started free',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: '/mo',
    credits: '50 credits/mo · rollover',
    features: ['50 credits/month', 'Unlimited projects', '3 variants per platform', 'All 8 platforms', 'Priority processing'],
    highlighted: false,
    cta: 'Start Starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/mo',
    credits: '150 credits/mo · rollover',
    features: ['150 credits/month', 'Unlimited projects', '3 variants per platform', 'All 8 platforms', 'Priority processing', 'Zapier/Make integration'],
    highlighted: true,
    cta: 'Start Pro',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$49',
    period: '/mo',
    credits: 'Unlimited (fair use)',
    features: ['Unlimited credits', 'Unlimited projects', '3 variants per platform', 'All 8 platforms', 'Team seats', 'Priority support', 'Zapier/Make integration'],
    highlighted: false,
    cta: 'Go Unlimited',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Ollestra
          </span>
          <div className="flex items-center gap-2">
            <Link href="#pricing" className="text-gray-400 hover:text-white text-sm px-3 py-2 transition-colors hidden sm:block">
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

      {/* ── Hero ── */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-powered content repurposing
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            One video.{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Ten pieces
            </span>
            {' '}of content.
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste any YouTube URL. Ollestra extracts the insights and crafts
            platform-ready posts for LinkedIn, X, Instagram and more — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Start repurposing free →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-xl text-lg transition-all"
            >
              Sign in
            </Link>
          </div>
          <p className="text-gray-600 text-sm">5 free credits · No card required · Cancel anytime</p>
        </div>

        {/* Mock product UI */}
        <div className="relative max-w-3xl mx-auto mt-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-2xl blur-xl" />
          <div className="relative bg-gray-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gray-900">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500 flex items-center gap-2 text-left">
                <span>▶</span>
                youtube.com/watch?v=...
              </div>
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
                Repurpose
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
              {[
                {
                  platform: 'LinkedIn',
                  emoji: '💼',
                  preview: 'Most founders ignore this growth lever entirely. After 3 years studying viral content, here\'s what actually works...',
                },
                {
                  platform: 'X / Twitter',
                  emoji: '𝕏',
                  preview: 'The uncomfortable truth about content strategy that nobody talks about 🧵 Thread:',
                },
                {
                  platform: 'Instagram',
                  emoji: '📸',
                  preview: 'Swipe to see the 3-step system we used to 10x reach without spending a dollar on ads →',
                },
              ].map(({ platform, emoji, preview }) => (
                <div key={platform} className="bg-gray-800/80 border border-white/5 rounded-xl p-3 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">{emoji} {platform}</span>
                    <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">3 variants</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{preview}</p>
                  <div className="mt-3 flex gap-1.5">
                    <div className="h-1 rounded-full bg-gradient-to-r from-violet-500/50 to-indigo-500/50 flex-1" />
                    <div className="h-1 w-8 rounded-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Videos repurposed' },
            { value: '8', label: 'Platforms supported' },
            { value: '< 30s', label: 'Average generation' },
            { value: '3×', label: 'Avg. engagement lift' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {value}
              </div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platforms ── */}
      <section className="py-16 px-6 text-center">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-8 font-medium">
          Repurpose once · publish everywhere
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {['💼 LinkedIn', '𝕏 Twitter', '📸 Instagram', '🎵 TikTok', '📘 Facebook', '🧵 Threads', '▶ YouTube Shorts', '📧 Newsletter'].map(p => (
            <div key={p} className="flex items-center gap-2 bg-gray-800/60 border border-white/5 rounded-full px-4 py-2 text-sm text-gray-300">
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three steps. Zero friction.</h2>
            <p className="text-gray-400">From raw video to publishable content faster than you can make a coffee.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Paste the URL',
                desc: 'Drop any YouTube link — long-form, podcast, interview, tutorial. Ollestra handles the rest.',
              },
              {
                step: '02',
                title: 'AI does the lifting',
                desc: 'We extract the transcript, identify key insights, and craft platform-native content with hooks and CTAs.',
              },
              {
                step: '03',
                title: 'Copy & publish',
                desc: 'Pick your favorite variant, copy with one click, and paste straight into your scheduler.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative p-6 bg-gray-900/50 border border-white/5 rounded-2xl">
                <div className="text-6xl font-black text-white/[0.04] absolute top-3 right-4 select-none">{step}</div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need, nothing you don&apos;t</h2>
            <p className="text-gray-400">Built for creators and marketers who value their time.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-6 bg-gray-900 border border-white/5 rounded-2xl hover:border-violet-500/30 transition-colors group"
              >
                <div className="text-2xl mb-4">{icon}</div>
                <h3 className="font-semibold mb-2 group-hover:text-violet-300 transition-colors">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Creators love Ollestra</h2>
            <p className="text-gray-400">Real results from real people who stopped leaving content on the table.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, avatar }) => (
              <div key={name} className="p-6 bg-gray-900 border border-white/5 rounded-2xl flex flex-col gap-4">
                <div className="flex gap-0.5 text-violet-400 text-sm">{'★★★★★'}</div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-6 bg-gray-900/30" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Start free. Scale when you need to.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-2xl border p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-violet-500 ring-2 ring-violet-500/20'
                    : 'border-white/5'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      ★ Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{plan.credits}</p>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-violet-400 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-t from-violet-600/15 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Repurpose{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              at will.
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Join thousands of creators who stopped leaving content on the table.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            Start repurposing free →
          </Link>
          <p className="text-gray-600 text-sm mt-4">5 free credits · No credit card required</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Ollestra
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-300 transition-colors">Get started</Link>
          </div>
          <p className="text-gray-700 text-xs">© 2025 Ollestra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
