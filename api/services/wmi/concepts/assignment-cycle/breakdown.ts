import type { Breakdown, BreakdownHighlight } from '../types.js'
import { labelAt, type Params } from './index.js'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// Authored decomposition of an assignment-cycle problem: children sit in a
// circle and call out a short list of letters that repeats forever. We want the
// letter the n-th child says. The trick: only the LEFTOVER after the full trips
// matters, so kids skip-count whole trips, then count on the rest one by one.
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes the "Find:" / "Cari:" markers and collapses spaces).
export function buildAssignmentCycleBreakdown(params: Params): Breakdown {
  const { cycle, n } = params
  const seq = LABELS.slice(0, cycle).join(', ')
  const answer = labelAt(params) // e.g. "C"

  const fullTrips = Math.floor(n / cycle)
  const leftover = n - fullTrips * cycle
  const lastFull = fullTrips * cycle

  const highlights: BreakdownHighlight[] = [
    // fact — the short list of letters that repeats
    {
      category: 'fact',
      phrase_en: 'call out letters in order',
      phrase_id: 'menyebutkan huruf secara berurutan',
      note_en: `The letters ${seq} are said over and over.`,
      note_id: `Huruf ${seq} diucapkan berulang-ulang.`,
    },
    // fact — the length of one trip around the circle
    {
      category: 'fact',
      phrase_en: `${cycle} students`,
      phrase_id: `${cycle} siswa`,
      note_en: `One full trip is ${cycle} children, then it starts again.`,
      note_id: `Satu putaran penuh ada ${cycle} anak, lalu mulai lagi.`,
    },
    // condition — the cycle rule
    {
      category: 'condition',
      phrase_en: 'repeats from the beginning',
      phrase_id: 'dimulai dari awal',
      note_en: `After ${cycle} children the same letters start over from A.`,
      note_id: `Setelah ${cycle} anak, huruf yang sama mulai lagi dari A.`,
    },
    // question — which child we are asked about
    {
      category: 'question',
      phrase_en: `student number ${n}`,
      phrase_id: `siswa nomor ${n}`,
      note_en:
        leftover === 0
          ? `Student ${n} finishes a full trip, landing on the last letter ${answer}.`
          : `Skip-count full trips to ${lastFull}, then count on ${leftover} more to reach ${answer}.`,
      note_id:
        leftover === 0
          ? `Siswa ke-${n} menyelesaikan satu putaran penuh, berhenti di huruf terakhir ${answer}.`
          : `Hitung lompat putaran sampai ${lastFull}, lalu lanjut ${leftover} lagi sampai ${answer}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Letters per trip', label_id: 'Huruf per putaran', value: String(cycle) },
      { label_en: 'Repeating sequence', label_id: 'Urutan berulang', value: seq },
      { label_en: 'Student number', label_id: 'Nomor siswa', value: String(n) },
      { label_en: 'Full trips', label_id: 'Putaran penuh', value: String(fullTrips) },
      { label_en: 'Leftover steps', label_id: 'Sisa langkah', value: String(leftover) },
      { label_en: 'Answer (letter)', label_id: 'Jawaban (huruf)', value: answer },
    ],

    strategy: {
      conceptSlug: 'assignment-cycle',
      name_en: 'Skip-count full trips, then count on the leftover',
      name_id: 'Hitung lompat putaran penuh, lalu hitung sisanya',
    },

    // No single tempting wrong answer: the common slip is an off-by-one in the
    // leftover count, which varies, so there is no one stable trap value.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: answer,
    },

    vocab: [],
  }
}
