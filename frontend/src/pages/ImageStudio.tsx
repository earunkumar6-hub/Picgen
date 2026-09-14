import { useEffect, useState } from 'react'

import { api } from '../api/client'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { usePromptStore } from '../store/promptStore'
import type { GeneratedImage, Prompt, ProviderId, ProviderStatus } from '../types'

export function ImageStudio() {
  const activePrompt = usePromptStore((s) => s.activePrompt)
  const setActivePrompt = usePromptStore((s) => s.setActivePrompt)

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [provider, setProvider] = useState<ProviderId>('openai')
  const [variations, setVariations] = useState(1)
  const [format, setFormat] = useState<'png' | 'jpg'>('png')
  const [useEnhanced, setUseEnhanced] = useState(true)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.prompts.list().then(setPrompts).catch(() => setPrompts([]))
    api.images.providers().then((list) => {
      setProviders(list)
      const firstAvailable = list.find((p) => p.available)
      if (firstAvailable) setProvider(firstAvailable.provider)
    })
  }, [])

  useEffect(() => {
    if (activePrompt) {
      api.images.list(activePrompt.id).then(setImages).catch(() => setImages([]))
    }
  }, [activePrompt])

  const onGenerate = async () => {
    if (!activePrompt) return
    setGenerating(true)
    setError(null)
    try {
      const created = await api.images.generate({
        prompt_id: activePrompt.id,
        provider,
        use_enhanced: useEnhanced,
        variations,
        format,
      })
      setImages((prev) => [...created, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed.')
    } finally {
      setGenerating(false)
    }
  }

  const selectedProviderStatus = providers.find((p) => p.provider === provider)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Image Studio</h1>
          <p className="text-sm text-neutral-500">Turn your SIP prompt into generated images.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={activePrompt?.id ?? ''}
              onChange={(e) => {
                const found = prompts.find((p) => p.id === e.target.value) ?? null
                setActivePrompt(found)
              }}
            >
              <option value="" disabled>
                Select a prompt…
              </option>
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.style} / {p.intent} — {p.subject.slice(0, 40)}
                </option>
              ))}
            </Select>
            {activePrompt && (
              <Textarea
                readOnly
                className="min-h-32 font-mono text-xs"
                value={activePrompt.enhanced_prompt ?? activePrompt.raw_prompt}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Selector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)}>
              {providers.map((p) => (
                <option key={p.provider} value={p.provider}>
                  {p.label} {p.available ? '' : '(not configured)'}
                </option>
              ))}
            </Select>
            {selectedProviderStatus && !selectedProviderStatus.available && (
              <p className="text-xs text-amber-600">
                Add the required API key to backend/.env to enable this provider.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Variations</Label>
                <Select value={variations} onChange={(e) => setVariations(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={useEnhanced}
                onChange={(e) => setUseEnhanced(e.target.checked)}
              />
              Use AI-enhanced prompt when available
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              className="w-full"
              size="lg"
              onClick={onGenerate}
              disabled={!activePrompt || generating || !selectedProviderStatus?.available}
            >
              {generating ? 'Generating…' : 'Generate Image'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Image Gallery</h2>
          {images.length > 0 && <Badge>{images.length} image{images.length === 1 ? '' : 's'}</Badge>}
        </div>
        {images.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-neutral-500">
              No images yet. Select a prompt and generate your first image.
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <img src={image.url} alt="Generated" className="aspect-square w-full object-cover" />
              <CardContent className="flex items-center justify-between p-3">
                <Badge>{image.provider}</Badge>
                <a
                  href={image.url}
                  download={`picgen-${image.id}.${image.format}`}
                  className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
                >
                  Download
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
