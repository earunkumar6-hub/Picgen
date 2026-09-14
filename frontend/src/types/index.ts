export const STYLES = ['Minimalist', 'Swiss', 'Editorial', 'Brutalist', 'Premium Cinematic'] as const
export const INTENTS = ['Bold', 'Trust', 'Urgency', 'Futuristic', 'Luxury', 'Curiosity'] as const
export const LAYOUTS = ['Centered', 'Grid Based', 'Asymmetrical', 'Magazine Style', 'Hero Focus'] as const
export const TYPOGRAPHIES = [
  'Modern Sans Serif',
  'Editorial Serif',
  'Bold Display',
  'Corporate Professional',
] as const
export const SPACINGS = ['Compact', 'Balanced', 'Generous White Space'] as const
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:5'] as const
export const ANTI_SLOP_RULES = [
  'No Gradients',
  'No Neon Glow',
  'No 3D Text',
  'No Floating Particles',
  'No Generic Futuristic Elements',
  'No Random Icons',
  'No Excessive Shadows',
  'No Unnecessary Decorations',
  'No Clutter',
  'No Fake UI',
  'No Stock Poster Aesthetic',
] as const

export interface PromptParameters {
  layout: string
  typography: string
  colors: string
  spacing: string
  aspect_ratio: string
}

export interface PromptBuildRequest {
  style: string
  intent: string
  subject: string
  parameters: PromptParameters
  anti_slop_rules: string[]
  template_key?: string | null
}

export interface Prompt {
  id: string
  style: string
  intent: string
  subject: string
  layout: string
  typography: string
  colors: string
  spacing: string
  aspect_ratio: string
  anti_slop_rules: string[]
  template_key: string | null
  raw_prompt: string
  enhanced_prompt: string | null
  created_at: string
}

export type ProviderId = 'openai' | 'flux' | 'ideogram' | 'imagen'

export interface ProviderStatus {
  provider: ProviderId
  label: string
  available: boolean
}

export interface GeneratedImage {
  id: string
  prompt_id: string
  provider: string
  file_name: string
  format: string
  created_at: string
  url: string
}

export interface Template {
  key: string
  name: string
  style: string
  intent: string
  layout: string
  typography: string
  spacing: string
  aspect_ratio: string
  subject_hint: string
}
