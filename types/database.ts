export type Plan = 'free' | 'starter' | 'pro' | 'unlimited'
export type ProjectStatus = 'processing' | 'complete' | 'failed'
export type JobStatus = 'pending' | 'processing' | 'done' | 'failed'
export type JobStep = 'transcribing' | 'summarizing' | 'generating' | 'done'
export type OutputType = 'post' | 'thread' | 'hook' | 'cta' | 'hashtags'
export type TransactionType = 'purchase' | 'deduction' | 'refund' | 'gift'
export type Platform = 'linkedin' | 'x' | 'instagram' | 'email' | 'blog'
export type TonePreset = 'professional' | 'casual' | 'witty' | 'inspirational'
export type AudienceTag = 'entrepreneurs' | 'marketers' | 'developers' | 'students' | 'general'

export interface User {
  id: string
  email: string
  full_name: string | null
  niche: string | null
  primary_platform: Platform | null
  tone_preset: TonePreset
  audience_tag: AudienceTag
  platforms_default: Platform[]
  plan: Plan
  credit_balance: number
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  youtube_url: string
  video_title: string | null
  summary: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  project_id: string
  user_id: string
  status: JobStatus
  current_step: JobStep
  platforms: Platform[]
  retries: number
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Output {
  id: string
  project_id: string
  user_id: string
  job_id: string | null
  platform: Platform
  output_type: OutputType
  variant_number: 1 | 2 | 3
  content: string
  is_edited: boolean
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  job_id: string | null
  description: string | null
  created_at: string
}

export interface GenerateRequest {
  youtube_url: string
  video_title: string
  platforms: Platform[]
  tone: TonePreset | string
  audience: AudienceTag
  twitter_format: 'single' | 'thread'
  include_hashtags: boolean
}

export interface ContentVariant {
  post: string
  hook: string
  cta: string
  hashtags?: string[]
}

export interface ContentSummary {
  main_topic: string
  key_ideas: string[]
  memorable_quotes: string[]
  content_type: 'educational' | 'entertainment' | 'interview' | 'tutorial'
}
