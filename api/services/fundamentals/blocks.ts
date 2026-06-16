// Pure zod block schema for fundamentals lessons. NO pg/node/react imports, so
// the client bundles it for the editor forms + render dispatch exactly as it
// already does with the brand registry. A lesson's `blocks` JSONB is an ordered
// array of these; the server validates with `lessonBlocksSchema`, the client
// renders by dispatching on `block.type`.
//
// Text fields are PLAIN strings (no markup); the renderer turns `\n` into
// paragraph breaks. `_en`/`_id` pairs are bilingual.

import { z } from 'zod'

const reqText = z.string().min(1)
const optText = z.string().min(1).optional()
const slug = z.string().regex(/^[a-z0-9-]+$/)

const proseBlock = z.object({
  id: z.string().min(1),
  type: z.literal('prose'),
  title_en: optText,
  title_id: optText,
  body_en: reqText,
  body_id: reqText,
})

const tipBlock = z.object({
  id: z.string().min(1),
  type: z.literal('tip'),
  variant: z.enum(['tip', 'warning']).default('tip'),
  title_en: optText,
  title_id: optText,
  body_en: reqText,
  body_id: reqText,
})

const checkBlock = z.object({
  id: z.string().min(1),
  type: z.literal('check'),
  prompt_en: reqText,
  prompt_id: reqText,
  choices_en: z.array(reqText).min(2),
  choices_id: z.array(reqText).min(2),
  answer_index: z.number().int().min(0),
  explain_en: optText,
  explain_id: optText,
})

// v1: only past-paper question embeds (concrete, no params). Concept embeds
// need generated params and are deferred.
const workedBlock = z.object({
  id: z.string().min(1),
  type: z.literal('worked'),
  source: z.literal('paper'),
  code: z.string().min(1), // registered question code, e.g. "WMI-20F1A-Q1"
  caption_en: optText,
  caption_id: optText,
})

const glossaryBlock = z.object({
  id: z.string().min(1),
  type: z.literal('glossary'),
  term_slugs: z.array(slug).min(1),
  intro_en: optText,
  intro_id: optText,
})

const imageBlock = z.object({
  id: z.string().min(1),
  type: z.literal('image'),
  src: reqText,
  alt_en: reqText,
  alt_id: reqText,
  caption_en: optText,
  caption_id: optText,
})

const scoringBlock = z.object({
  id: z.string().min(1),
  type: z.literal('scoring'),
  brands: z.array(z.string().min(1)).optional(), // default: all registry brands
  intro_en: optText,
  intro_id: optText,
})

/** A single content block (discriminated on `type`). */
export const lessonBlockSchema = z.discriminatedUnion('type', [
  proseBlock,
  tipBlock,
  checkBlock,
  workedBlock,
  glossaryBlock,
  imageBlock,
  scoringBlock,
])

export type LessonBlock = z.infer<typeof lessonBlockSchema>
export type LessonBlockType = LessonBlock['type']

/**
 * An ordered list of blocks (a lesson body). Beyond the per-block shape this
 * checks cross-field invariants the discriminated union can't express:
 *  - `check.answer_index` is in range and the two choice arrays line up;
 *  - block `id`s are unique (stable React keys + editor reorder).
 */
export const lessonBlocksSchema = z
  .array(lessonBlockSchema)
  .superRefine((blocks, ctx) => {
    const seen = new Set<string>()
    blocks.forEach((block, i) => {
      if (seen.has(block.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate block id "${block.id}"`,
          path: [i, 'id'],
        })
      }
      seen.add(block.id)

      if (block.type === 'check') {
        if (block.choices_en.length !== block.choices_id.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'choices_en and choices_id must have the same length',
            path: [i, 'choices_id'],
          })
        }
        if (block.answer_index >= block.choices_en.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'answer_index is out of range',
            path: [i, 'answer_index'],
          })
        }
      }
    })
  })

export type LessonBlocks = z.infer<typeof lessonBlocksSchema>

/** Menu of block types for the admin "add block" picker. */
export const BLOCK_TYPES: { type: LessonBlockType; label: string }[] = [
  { type: 'prose', label: 'Text' },
  { type: 'tip', label: 'Tip / Warning' },
  { type: 'check', label: 'Check question' },
  { type: 'worked', label: 'Worked example' },
  { type: 'glossary', label: 'Glossary cards' },
  { type: 'image', label: 'Image' },
  { type: 'scoring', label: 'Scoring calculator' },
]
