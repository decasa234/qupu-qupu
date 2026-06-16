import type { ComponentType } from 'react'
import type { ExplainerProps } from '../../../concepts/explainers/registry'
import type { PoolMeta } from '../poolMeta'

/**
 * A reusable, parameterized illustration+explainer pair (Approach A "template").
 * A paper question binds to one via its seed `visual: { templateId, params }`.
 */
export interface ExplainerTemplate {
  meta: PoolMeta & { status: 'template' }
  /** Optional — non-figure templates (e.g. try-and-eliminate) have no static figure. */
  Illustration?: ComponentType<{ params: unknown }>
  Explainer: ComponentType<ExplainerProps>
}

import CountOneByOne from './CountOneByOneTemplate'
import TryEliminate from './TryEliminateTemplate'

// Templates register here as they are built (Phase 3).
const ALL: ExplainerTemplate[] = [CountOneByOne, TryEliminate]

export const TEMPLATES: Record<string, ExplainerTemplate> = Object.fromEntries(
  ALL.map((t) => [t.meta.id, t]),
)

export function getTemplate(id: string): ExplainerTemplate | null {
  return TEMPLATES[id] ?? null
}

export function templateIds(): string[] {
  return Object.keys(TEMPLATES)
}
