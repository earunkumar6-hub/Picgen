import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { api } from '../api/client'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { MultiOptionPicker, OptionPicker } from '../components/ui/option-picker'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { usePromptStore } from '../store/promptStore'
import {
  ANTI_SLOP_RULES,
  ASPECT_RATIOS,
  INTENTS,
  LAYOUTS,
  SPACINGS,
  STYLES,
  TYPOGRAPHIES,
} from '../types'

const subjectSchema = z.object({
  subject: z.string().min(3, 'Describe the subject in at least a few words.').max(2000),
  colors: z.string().max(200).optional(),
})
type SubjectForm = z.infer<typeof subjectSchema>

export function PromptBuilder() {
  const navigate = useNavigate()
  const store = usePromptStore()
  const [submitting, setSubmitting] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
    values: { subject: store.subject, colors: store.parameters.colors },
  })

  const onSubmit = async (data: SubjectForm) => {
    setError(null)
    setSubmitting(true)
    try {
      store.setSubject(data.subject)
      store.setParameter('colors', data.colors ?? '')
      const prompt = await api.prompts.create({
        style: store.style,
        intent: store.intent,
        subject: data.subject,
        parameters: { ...store.parameters, colors: data.colors ?? '' },
        anti_slop_rules: store.antiSlopRules,
        template_key: store.templateKey,
      })
      store.setActivePrompt(prompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt.')
    } finally {
      setSubmitting(false)
    }
  }

  const onEnhance = async () => {
    if (!store.activePrompt) return
    setEnhancing(true)
    setError(null)
    try {
      const updated = await api.prompts.enhance(store.activePrompt.id)
      store.setActivePrompt(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancement failed.')
    } finally {
      setEnhancing(false)
    }
  }

  const prompt = store.activePrompt

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prompt Builder</h1>
          <p className="text-sm text-neutral-500">
            Compose a structured prompt using the Style, Intent, Parameters framework.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Style</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionPicker options={[...STYLES]} value={store.style} onChange={store.setStyle} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intent</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionPicker options={[...INTENTS]} value={store.intent} onChange={store.setIntent} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">What should the image show?</Label>
              <Textarea id="subject" placeholder="A sleek running shoe floating against a plain backdrop..." {...register('subject')} />
              {errors.subject && <p className="text-xs text-red-600">{errors.subject.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colors">Color palette (optional)</Label>
              <Input id="colors" placeholder="black, white, electric blue" {...register('colors')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Layout</Label>
              <Select
                value={store.parameters.layout}
                onChange={(e) => store.setParameter('layout', e.target.value)}
              >
                {LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Typography</Label>
              <Select
                value={store.parameters.typography}
                onChange={(e) => store.setParameter('typography', e.target.value)}
              >
                {TYPOGRAPHIES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Spacing</Label>
              <Select
                value={store.parameters.spacing}
                onChange={(e) => store.setParameter('spacing', e.target.value)}
              >
                {SPACINGS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Aspect Ratio</Label>
              <Select
                value={store.parameters.aspect_ratio}
                onChange={(e) => store.setParameter('aspect_ratio', e.target.value)}
              >
                {ASPECT_RATIOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anti-Slop Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiOptionPicker
              options={[...ANTI_SLOP_RULES]}
              values={store.antiSlopRules}
              onChange={store.setAntiSlopRules}
            />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button size="lg" onClick={handleSubmit(onSubmit)} disabled={submitting}>
          {submitting ? 'Generating…' : 'Generate Prompt'}
        </Button>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Prompt Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!prompt && <p className="text-sm text-neutral-500">Generate a prompt to preview it here.</p>}
            {prompt && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>{prompt.style}</Badge>
                  <Badge>{prompt.intent}</Badge>
                  <Badge>{prompt.aspect_ratio}</Badge>
                </div>
                <Textarea
                  readOnly
                  className="min-h-40 font-mono text-xs"
                  value={prompt.enhanced_prompt ?? prompt.raw_prompt}
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={onEnhance} disabled={enhancing}>
                    {enhancing ? 'Enhancing…' : 'AI Enhance'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/studio')}
                  >
                    Send to Image Studio
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                  {(['json', 'txt', 'md'] as const).map((fmt) => (
                    <a
                      key={fmt}
                      href={api.prompts.exportUrl(prompt.id, fmt)}
                      download
                      className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
                    >
                      Export .{fmt}
                    </a>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
