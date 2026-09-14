import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { api } from '../api/client'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { usePromptStore } from '../store/promptStore'
import type { GeneratedImage, Prompt } from '../types'

export function Dashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [images, setImages] = useState<GeneratedImage[]>([])
  const setActivePrompt = usePromptStore((s) => s.setActivePrompt)
  const navigate = useNavigate()

  useEffect(() => {
    api.prompts.list().then((p) => setPrompts(p.slice(0, 6)))
    api.images.list().then((i) => setImages(i.slice(0, 8)))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500">Pick up where you left off, or start something new.</p>
        </div>
        <Button size="lg" onClick={() => navigate('/builder')}>
          Quick Create
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Prompts</h2>
        {prompts.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-neutral-500">
              No prompts yet. <Link to="/builder" className="underline">Build your first one</Link>.
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => {
                setActivePrompt(p)
                navigate('/studio')
              }}
            >
              <CardHeader>
                <CardTitle className="line-clamp-1">{p.subject || 'Untitled prompt'}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                <Badge>{p.style}</Badge>
                <Badge>{p.intent}</Badge>
                <Badge>{p.aspect_ratio}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Images</h2>
        {images.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-neutral-500">
              No images yet.
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((img) => (
            <Card key={img.id} className="overflow-hidden">
              <img src={img.url} alt="Generated" className="aspect-square w-full object-cover" />
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
