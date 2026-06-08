import type { Breakdown, BreakdownHighlight } from '../types.js'
import { landing, type Params } from './index.js'

// Authored decomposition of a number-line-jumps problem: a frog starts at a
// number and makes several equal jumps of the same size to the right; find
// where it lands. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text — each phrase MUST be an exact substring of
// the DISPLAY body (after the "Find:" label is stripped).
export function buildNumberLineJumpsBreakdown(params: Params): Breakdown {
  const { start, step, jumps } = params
  const total = step * jumps
  const answer = landing(params)

  const highlights: BreakdownHighlight[] = [
    // facts — the start, the jump size, and how many jumps
    {
      category: 'fact',
      phrase_en: `starting at ${start}`,
      phrase_id: `mulai di ${start}`,
      note_en: `The frog begins on ${start}.`,
      note_id: `Katak mulai di angka ${start}.`,
    },
    {
      category: 'fact',
      phrase_en: `jumps of ${step}`,
      phrase_id: `setiap lompatan sejauh ${step}`,
      note_en: `Each jump moves ${step} steps.`,
      note_id: `Setiap lompatan bergerak ${step} langkah.`,
    },
    {
      category: 'fact',
      phrase_en: `${jumps} equal jumps`,
      phrase_id: `melompat ${jumps} kali`,
      note_en: `It jumps ${jumps} times in all.`,
      note_id: `Katak melompat sebanyak ${jumps} kali.`,
    },
    // condition — the jump rule (direction)
    {
      category: 'condition',
      phrase_en: 'to the right',
      phrase_id: 'ke kanan',
      note_en: 'Right means the numbers get bigger, so add.',
      note_id: 'Ke kanan berarti angka membesar, jadi tambahkan.',
    },
    // question — where it lands
    {
      category: 'question',
      phrase_en: 'Where does the frog land',
      phrase_id: 'Di bilangan berapa katak berhenti',
      note_en: 'Find the number the frog stops on.',
      note_id: 'Cari angka tempat katak berhenti.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Start', label_id: 'Mulai', value: String(start) },
      { label_en: 'Jump size', label_id: 'Besar lompatan', value: String(step) },
      { label_en: 'Jumps', label_id: 'Banyak lompatan', value: String(jumps) },
      { label_en: 'Total distance', label_id: 'Jarak total', value: String(total) },
      { label_en: 'Lands on', label_id: 'Berhenti di', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'number-line-jumps',
      name_en: 'Total the jumps, then add to start',
      name_id: 'Jumlahkan lompatan, lalu tambahkan ke awal',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
