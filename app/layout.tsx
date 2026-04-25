import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PostHogProvider from '@/components/PostHogProvider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Ollestra — Repurpose at will',
  description: 'Turn any YouTube video into platform-ready content for LinkedIn, X, Instagram and more — in seconds. AI-powered content repurposing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
