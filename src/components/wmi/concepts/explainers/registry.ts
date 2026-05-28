import type { ComponentType } from 'react'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
