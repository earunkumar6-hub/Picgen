import { create } from 'zustand'

import type { Prompt, PromptParameters } from '../types'

interface BuilderState {
  style: string
  intent: string
  subject: string
  parameters: PromptParameters
  antiSlopRules: string[]
  templateKey: string | null

  activePrompt: Prompt | null

  setStyle: (style: string) => void
  setIntent: (intent: string) => void
  setSubject: (subject: string) => void
  setParameter: <K extends keyof PromptParameters>(key: K, value: PromptParameters[K]) => void
  setAntiSlopRules: (rules: string[]) => void
  applyTemplate: (t: {
    key: string
    style: string
    intent: string
    layout: string
    typography: string
    spacing: string
    aspect_ratio: string
    subject_hint: string
  }) => void
  setActivePrompt: (prompt: Prompt | null) => void
  reset: () => void
}

const defaults = {
  style: 'Minimalist',
  intent: 'Bold',
  subject: '',
  parameters: {
    layout: 'Centered',
    typography: 'Modern Sans Serif',
    colors: '',
    spacing: 'Balanced',
    aspect_ratio: '1:1',
  } satisfies PromptParameters,
  antiSlopRules: ['No Gradients', 'No Clutter', 'No Fake UI'],
  templateKey: null as string | null,
}

export const usePromptStore = create<BuilderState>((set) => ({
  ...defaults,
  activePrompt: null,

  setStyle: (style) => set({ style }),
  setIntent: (intent) => set({ intent }),
  setSubject: (subject) => set({ subject }),
  setParameter: (key, value) =>
    set((state) => ({ parameters: { ...state.parameters, [key]: value } })),
  setAntiSlopRules: (antiSlopRules) => set({ antiSlopRules }),
  applyTemplate: (t) =>
    set((state) => ({
      style: t.style,
      intent: t.intent,
      subject: state.subject || t.subject_hint,
      parameters: {
        ...state.parameters,
        layout: t.layout,
        typography: t.typography,
        spacing: t.spacing,
        aspect_ratio: t.aspect_ratio,
      },
      templateKey: t.key,
    })),
  setActivePrompt: (activePrompt) => set({ activePrompt }),
  reset: () => set({ ...defaults, activePrompt: null }),
}))
