import { useMemo } from 'react'
import { z } from 'zod'
import type { ExplainerProps } from '../../../concepts/explainers/registry'
import { makeTryCheckExplainer } from '../tryCheckExplainers'
import { definePoolMeta } from '../poolMeta'

export const paramsSchema = z.object({
  intro_en: z.string(),
  intro_id: z.string(),
  /** Rows revealed one per beat. ok: true=✓, false=✗, null=neutral fact. */
  items: z
    .array(z.object({ text_en: z.string(), text_id: z.string(), ok: z.boolean().nullable() }))
    .min(1),
  final_en: z.string(),
  final_id: z.string(),
  aria_en: z.string(),
  aria_id: z.string(),
})
export type TryEliminateParams = z.infer<typeof paramsSchema>

export const meta = definePoolMeta({
  id: 'try-and-eliminate',
  title: 'Try and eliminate (deduce by checking)',
  summary: 'Reveals candidates/facts one per beat (✓/✗/neutral) and derives the answer on screen.',
  useWhen:
    'Non-figure question solved by checking candidates one at a time or chaining facts — arithmetic, "which is largest", "smallest number that…", digit rules, logic deductions.',
  tags: ['deduction', 'non-figure', 'arithmetic'],
  grades: [1, 2, 3],
  status: 'template' as const,
  paramsSchema,
  paramsExample:
    '{ "intro_en": "Check each option.", "intro_id": "Periksa tiap pilihan.", "items": [{"text_en":"21 > 16 ✓","text_id":"21 > 16 ✓","ok":true}], "final_en":"So 21 is largest (B).", "final_id":"Jadi 21 terbesar (B).", "aria_en":"...", "aria_id":"..." }',
})

export function TryEliminateExplainer(props: ExplainerProps) {
  const p = paramsSchema.parse(props.params)
  const Inner = useMemo(
    () =>
      makeTryCheckExplainer((lang) =>
        lang === 'id'
          ? {
              intro: p.intro_id,
              items: p.items.map((i) => ({ text: i.text_id, ok: i.ok })),
              final: p.final_id,
              aria: p.aria_id,
            }
          : {
              intro: p.intro_en,
              items: p.items.map((i) => ({ text: i.text_en, ok: i.ok })),
              final: p.final_en,
              aria: p.aria_en,
            },
      ),
    [props.params],
  )
  return <Inner {...props} />
}

// Non-figure template: no Illustration (the question has no static figure).
export default { meta, Explainer: TryEliminateExplainer }
