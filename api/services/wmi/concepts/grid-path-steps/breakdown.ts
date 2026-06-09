import type { Breakdown, BreakdownHighlight } from '../types.js'
import { steps, type Params } from './index.js'

// Authored decomposition of a grid-path-steps problem: walk from the dot (start)
// to the flag (end) on a grid using only up/down/left/right moves, and find the
// fewest steps. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text — each phrase MUST be a substring of the
// DISPLAY body (after the "Find:"/"Cari:" section label is stripped).
export function buildGridPathStepsBreakdown(params: Params): Breakdown {
  const hSteps = Math.abs(params.ex - params.sx)
  const vSteps = Math.abs(params.ey - params.sy)
  const total = steps(params)

  const hDirId = params.ex > params.sx ? 'kanan' : 'kiri'
  const vDirId = params.ey > params.sy ? 'bawah' : 'atas'

  const highlights: BreakdownHighlight[] = [
    // facts — the grid and the two marked cells you travel between
    {
      category: 'fact',
      phrase_en: 'a dot (start)',
      phrase_id: 'sebuah titik (mulai)',
      note_en: 'The dot is where you begin walking.',
      note_id: 'Titik adalah tempat kamu mulai berjalan.',
    },
    {
      category: 'fact',
      phrase_en: 'a flag (end)',
      phrase_id: 'sebuah bendera (akhir)',
      note_en: 'The flag is where you must finish.',
      note_id: 'Bendera adalah tempat kamu harus berakhir.',
    },
    // condition — the move rule you must obey
    {
      category: 'condition',
      phrase_en: 'moving only up, down, left, or right',
      phrase_id: 'hanya bergerak atas, bawah, kiri, atau kanan',
      note_en: 'No diagonal moves — each step goes one cell in one direction.',
      note_id: 'Tidak boleh menyerong — tiap langkah satu kotak ke satu arah.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the fewest steps to walk from the dot to the flag',
      phrase_id: 'langkah paling sedikit untuk berjalan dari titik ke bendera',
      note_en: 'Count steps sideways plus steps up/down: the smallest total.',
      note_id: 'Hitung langkah ke samping ditambah ke atas/bawah: total terkecil.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Steps across', label_id: 'Langkah samping', value: `${hSteps} (${hDirId})` },
      { label_en: 'Steps up/down', label_id: 'Langkah atas/bawah', value: `${vSteps} (${vDirId})` },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${hSteps} + ${vSteps} = ${total}` },
    ],

    strategy: {
      conceptSlug: 'grid-path-steps',
      name_en: 'Add across-steps and up/down-steps',
      name_id: 'Jumlahkan langkah samping dan atas/bawah',
    },

    // No genuine tempting wrong answer for a Manhattan-distance count.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(total),
    },

    vocab: [],
  }
}
