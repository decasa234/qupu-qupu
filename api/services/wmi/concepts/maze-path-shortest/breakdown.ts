import type { Breakdown, BreakdownHighlight } from '../types.js'
import { shortestSteps, type Cell, type Params } from './index.js'

// Authored decomposition of a maze-path-shortest problem: walk from the dot
// (top-left) to the flag (bottom-right) on a grid, moving only up/down/left/right
// and never entering a wall square, and find the fewest steps. The learner-facing
// part is a set of color-coded, clickable highlights over the problem text — each
// phrase MUST be a substring of the DISPLAY body (after the "Find:"/"Cari:"
// section label is stripped).
export function buildMazePathShortestBreakdown(params: Params): Breakdown {
  const { cols, rows, walls } = params
  const steps = shortestSteps(cols, rows, walls as Cell[])
  const manhattan = (cols - 1) + (rows - 1)
  const extra = steps - manhattan
  const wallCount = walls.length

  const highlights: BreakdownHighlight[] = [
    // facts — where you start, where you finish, and what blocks you
    {
      category: 'fact',
      phrase_en: 'A dot marks the top-left corner',
      phrase_id: 'Titik menandai sudut kiri atas',
      note_en: 'The dot is where you begin walking.',
      note_id: 'Titik adalah tempat kamu mulai berjalan.',
    },
    {
      category: 'fact',
      phrase_en: 'a flag marks the bottom-right corner',
      phrase_id: 'bendera menandai sudut kanan bawah',
      note_en: 'The flag is where you must finish.',
      note_id: 'Bendera adalah tempat kamu harus berakhir.',
    },
    // condition — the rules you must obey
    {
      category: 'condition',
      phrase_en: 'Black squares are walls you cannot enter',
      phrase_id: 'Kotak hitam adalah dinding yang tidak boleh dimasuki',
      note_en: 'You must walk around wall squares, never through them.',
      note_id: 'Kamu harus memutari kotak dinding, tidak boleh menembusnya.',
    },
    {
      category: 'condition',
      phrase_en: 'moving only up, down, left, or right',
      phrase_id: 'bergerak hanya ke atas, bawah, kiri, atau kanan',
      note_en: 'No diagonal moves — each step goes one cell in one direction.',
      note_id: 'Tidak boleh menyerong — tiap langkah satu kotak ke satu arah.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the fewest number of steps to walk from the dot to the flag',
      phrase_id: 'langkah paling sedikit untuk berjalan dari titik ke bendera',
      note_en: 'Find the shortest route — the smallest step count that avoids the walls.',
      note_id: 'Cari rute terpendek — jumlah langkah terkecil yang menghindari dinding.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Grid', label_id: 'Kisi', value: `${cols} × ${rows}` },
      { label_en: 'Walls', label_id: 'Dinding', value: String(wallCount) },
      {
        label_en: 'Straight route',
        label_id: 'Rute lurus',
        value: `${cols - 1} + ${rows - 1} = ${manhattan}`,
      },
      {
        label_en: 'Detour steps',
        label_id: 'Langkah memutar',
        value: String(extra),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${steps}` },
    ],

    strategy: {
      conceptSlug: 'maze-path-shortest',
      name_en: 'Trace open squares, detour around walls',
      name_id: 'Telusuri kotak kosong, putari dinding',
    },

    // The straight route ignores walls; when walls force a detour it is too low.
    trap:
      extra > 0
        ? {
            wrong: String(manhattan),
            why_en: `The straight route is ${manhattan} steps, but walls force a detour, so the real answer is ${steps}.`,
            why_id: `Rute lurus ${manhattan} langkah, tetapi dinding memaksa memutar, sehingga jawaban sebenarnya ${steps}.`,
          }
        : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(steps),
    },

    vocab: [],
  }
}
