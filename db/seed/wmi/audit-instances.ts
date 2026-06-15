// db/seed/wmi/audit-instances.ts
//
// READ-ONLY audit of wmi_concept_instances against the CURRENT concept code:
//   1. params that no longer satisfy the concept's paramsSchema (param drift —
//      explainers/illustrators read stale fields → "undefined"/"NaN").
//   2. multiple-choice instances with duplicate choice text (en or id).
// Prints a per-concept report. Makes no writes. Run: tsx db/seed/wmi/audit-instances.ts

import dotenv from 'dotenv'
import { Pool } from 'pg'
import { CONCEPTS } from '../../../api/services/wmi/concepts/registry.js'

dotenv.config()

type Choice = { label: string; text: string }

function dupChoices(choices: unknown): boolean {
  if (!Array.isArray(choices)) return false
  const texts = (choices as Choice[]).map((c) => String(c?.text ?? '').trim().toLowerCase())
  return new Set(texts).size !== texts.length
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<{
    id: string
    concept_slug: string
    params: unknown
    answer_type: string
    choices_en: unknown
    choices_id: unknown
  }>(
    `SELECT id, concept_slug, params, answer_type, choices_en, choices_id
       FROM wmi_concept_instances WHERE is_culled = FALSE`,
  )

  const reg = CONCEPTS as Record<string, { paramsSchema: { safeParse: (p: unknown) => { success: boolean } } }>
  const stat = new Map<string, { total: number; schemaBad: number; dupBad: number; orphan: boolean; sampleBadId?: string }>()

  for (const r of rows) {
    const s = stat.get(r.concept_slug) ?? { total: 0, schemaBad: 0, dupBad: 0, orphan: false }
    s.total++
    const concept = reg[r.concept_slug]
    if (!concept) {
      s.orphan = true
    } else if (!concept.paramsSchema.safeParse(r.params).success) {
      s.schemaBad++
      if (!s.sampleBadId) s.sampleBadId = r.id
    }
    if (r.answer_type === 'multiple_choice' && (dupChoices(r.choices_en) || dupChoices(r.choices_id))) {
      s.dupBad++
      if (!s.sampleBadId) s.sampleBadId = r.id
    }
    stat.set(r.concept_slug, s)
  }

  const problems = [...stat.entries()].filter(([, s]) => s.schemaBad || s.dupBad || s.orphan)
  problems.sort((a, b) => (b[1].schemaBad + b[1].dupBad) - (a[1].schemaBad + a[1].dupBad))

  let totalSchema = 0, totalDup = 0
  console.log(`\nTotal live instances: ${rows.length}, concepts with stored instances: ${stat.size}\n`)
  console.log('slug                                  total  schemaBad  dupChoices  orphan  sampleBadId')
  for (const [slug, s] of problems) {
    totalSchema += s.schemaBad; totalDup += s.dupBad
    console.log(
      `${slug.padEnd(36)}  ${String(s.total).padStart(5)}  ${String(s.schemaBad).padStart(9)}  ${String(s.dupBad).padStart(10)}  ${s.orphan ? 'YES' : '  -'}    ${s.sampleBadId ?? ''}`,
    )
  }
  console.log(`\nTOTAL schema-invalid instances: ${totalSchema}`)
  console.log(`TOTAL duplicate-choice instances: ${totalDup}`)
  console.log(`Concepts flagged: ${problems.length}`)

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
