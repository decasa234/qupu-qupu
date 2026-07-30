import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCountShapesInFigureBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  segments: z.number().int().min(2).max(5),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-shapes-in-figure',
  name_en: 'Count the triangles',
  name_id: 'Hitung segitiga',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung banyak segitiga dalam gambar kipas dari puncak ke alas.',
} as const

// A fan: apex joined to (segments+1) points along the base. Every pair of rays
// makes one triangle, so the total is C(segments+1, 2).
export function triangleCount(p: Params): number {
  const points = p.segments + 1
  return (points * (points - 1)) / 2
}

export function generate(rng: Rng): Params {
  return { segments: rng.int(2, 5) }
}

export function render(params: Params) {
  const { segments } = params
  const total = triangleCount(params)

  // Build hint steps: for each "width" w = 1..segments, there are (segments - w + 1) triangles.
  // e.g. segments=2: width 1 → 2 small, width 2 → 1 large; 2+1=3
  // e.g. segments=3: width 1 → 3, width 2 → 2, width 3 → 1; 3+2+1=6
  const stepLines_en: string[] = []
  const stepLines_id: string[] = []

  for (let w = 1; w <= segments; w++) {
    const count = segments - w + 1
    const sizeLabel_en = w === 1 ? 'single-section' : w === segments ? 'full-width' : `${w}-section`
    const sizeLabel_id = w === 1 ? 'satu bagian' : w === segments ? 'seluruh alas' : `${w} bagian`
    if (w === 1) {
      stepLines_en.push(`Count the ${count} smallest triangle${count > 1 ? 's' : ''} (${sizeLabel_en} each) → ${count}`)
      stepLines_id.push(`Hitung ${count} segitiga terkecil (${sizeLabel_id}) → ${count}`)
    } else if (w === segments) {
      stepLines_en.push(`Count the ${count} large triangle spanning the ${sizeLabel_en} → ${count}`)
      stepLines_id.push(`Hitung ${count} segitiga besar yang mencakup ${sizeLabel_id} → ${count}`)
    } else {
      stepLines_en.push(`Count triangles spanning ${sizeLabel_en}: ${count}`)
      stepLines_id.push(`Hitung segitiga yang mencakup ${sizeLabel_id}: ${count}`)
    }
  }

  // Running total line
  const additionEN = Array.from({ length: segments }, (_, i) => segments - i).join(' + ')
  const additionID = additionEN
  stepLines_en.push(`Add them up: ${additionEN} = ${total} triangles in total.`)
  stepLines_id.push(`Jumlahkan: ${additionID} = ${total} segitiga.`)

  return {
    body_en: `Count every triangle in the figure, including the larger triangles made by combining sections.\n\nFind: How many triangles are in the figure shown?`,
    body_id: `Hitung setiap segitiga dalam gambar, termasuk segitiga lebih besar yang terbentuk dari gabungan beberapa bagian.\n\nCari: Ada berapa segitiga dalam gambar yang ditunjukkan?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total),
    hint_en: 'Count systematically — start with the smallest single triangles, then count larger ones formed by combining sections.',
    hint_id: 'Hitung secara sistematis — mulai dari segitiga terkecil, lalu hitung yang lebih besar yang terbentuk dari gabungan beberapa bagian.',
    hint_steps_en: stepLines_en,
    hint_steps_id: stepLines_id,
    breakdown: buildCountShapesInFigureBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
