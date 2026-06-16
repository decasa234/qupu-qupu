import type { z } from 'zod'

/** Co-located catalog metadata for a poolable illustration+explainer pair. */
export interface PoolMeta {
  /** Stable, shape-named kebab id (NOT a paper code). e.g. "cube-layer-count". */
  id: string
  title: string
  /** One line the AI scans. */
  summary: string
  /** The problem shape this solves — the match signal. */
  useWhen: string
  tags: string[]
  grades: number[]
  status: 'template' | 'bespoke'
  /** Templates only: Zod schema for the params a reuse must pass. */
  paramsSchema?: z.ZodTypeAny
  /** Optional copy-paste example params (templates), shown in the catalog. */
  paramsExample?: string
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function validatePoolMeta(m: Partial<PoolMeta>): string[] {
  const errs: string[] = []
  if (!m.id || !KEBAB.test(m.id)) errs.push('id must be a kebab-case string')
  if (!m.title?.trim()) errs.push('title required')
  if (!m.summary?.trim()) errs.push('summary required')
  if (!m.useWhen?.trim()) errs.push('useWhen required')
  if (!Array.isArray(m.tags)) errs.push('tags must be an array')
  if (!Array.isArray(m.grades) || m.grades.length === 0) errs.push('grades must be a non-empty array')
  if (m.status !== 'template' && m.status !== 'bespoke') errs.push('status must be "template" | "bespoke"')
  if (m.status === 'template' && !m.paramsSchema) errs.push('templates must declare paramsSchema')
  return errs
}

/** Identity helper for type-checked co-located meta in component files. */
export function definePoolMeta<T extends PoolMeta>(m: T): T {
  return m
}
