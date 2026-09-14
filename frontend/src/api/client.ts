import type {
  GeneratedImage,
  Prompt,
  PromptBuildRequest,
  ProviderId,
  ProviderStatus,
  Template,
} from '../types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  templates: {
    list: () => request<Template[]>('/api/templates'),
  },
  prompts: {
    create: (body: PromptBuildRequest) =>
      request<Prompt>('/api/prompts', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<Prompt[]>('/api/prompts'),
    get: (id: string) => request<Prompt>(`/api/prompts/${id}`),
    enhance: (id: string) => request<Prompt>(`/api/prompts/${id}/enhance`, { method: 'POST' }),
    exportUrl: (id: string, fmt: 'json' | 'txt' | 'md') => `/api/prompts/${id}/export?fmt=${fmt}`,
  },
  images: {
    providers: () => request<ProviderStatus[]>('/api/images/providers'),
    generate: (body: {
      prompt_id: string
      provider: ProviderId
      use_enhanced: boolean
      variations: number
      format: 'png' | 'jpg'
    }) => request<GeneratedImage[]>('/api/images/generate', { method: 'POST', body: JSON.stringify(body) }),
    list: (promptId?: string) =>
      request<GeneratedImage[]>(`/api/images${promptId ? `?prompt_id=${promptId}` : ''}`),
  },
}
