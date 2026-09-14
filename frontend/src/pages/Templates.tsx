import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { usePromptStore } from '../store/promptStore'
import type { Template } from '../types'

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const applyTemplate = usePromptStore((s) => s.applyTemplate)
  const navigate = useNavigate()

  useEffect(() => {
    api.templates.list().then(setTemplates)
  }, [])

  const useTemplate = (t: Template) => {
    applyTemplate(t)
    navigate('/builder')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-neutral-500">
          Start from a pre-built SIP configuration for common formats.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.key}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>{t.subject_hint}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              <Badge>{t.style}</Badge>
              <Badge>{t.intent}</Badge>
              <Badge>{t.aspect_ratio}</Badge>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => useTemplate(t)}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
