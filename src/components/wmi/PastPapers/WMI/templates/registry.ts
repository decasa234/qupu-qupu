import type { ComponentType } from 'react'
import type { ExplainerProps } from '../../../concepts/explainers/registry'
import type { PoolMeta } from '../poolMeta'

/**
 * A reusable, parameterized illustration+explainer pair (Approach A "template").
 * A paper question binds to one via its seed `visual: { templateId, params }`.
 */
export interface ExplainerTemplate {
  meta: PoolMeta & { status: 'template' }
  Illustration: ComponentType<{ params: unknown }>
  Explainer: ComponentType<ExplainerProps>
}

// Templates register here as they are built (Phase 3).
const ALL: ExplainerTemplate[] = []

export const TEMPLATES: Record<string, ExplainerTemplate> = Object.fromEntries(
  ALL.map((t) => [t.meta.id, t]),
)

export function getTemplate(id: string): ExplainerTemplate | null {
  return TEMPLATES[id] ?? null
}

export function templateIds(): string[] {
  return Object.keys(TEMPLATES)
}
