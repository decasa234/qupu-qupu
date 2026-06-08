import type { Breakdown, BreakdownHighlight } from '../types.js'
import { nextSquareAbove, type Params } from './index.js'

// Authored decomposition of a perfect-square-search problem: find the smallest
// perfect square (a number n × n) that is greater than the given number.
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the rendered (display) body.
export function buildPerfectSquareSearchBreakdown(params: Params): Breakdown {
  const { n } = params
  const answer = nextSquareAbove(params.n)
  const answerRoot = Math.floor(Math.sqrt(n)) + 1
  const prevRoot = answerRoot - 1

  const highlights: BreakdownHighlight[] = [
    // fact — the number we have to beat
    {
      category: 'fact',
      phrase_en: String(n),
      phrase_id: String(n),
      note_en: `The number to beat — your square must be bigger than ${n}.`,
      note_id: `Angka yang harus dilewati — kuadratmu harus lebih besar dari ${n}.`,
    },
    // condition — what kind of number counts
    {
      category: 'condition',
      phrase_en: 'perfect square',
      phrase_id: 'bilangan kuadrat sempurna',
      note_en: 'A perfect square is a number times itself: n × n, like 1, 4, 9, 16…',
      note_id: 'Bilangan kuadrat sempurna adalah angka dikali dirinya: n × n, seperti 1, 4, 9, 16…',
    },
    // question — which square to pick
    {
      category: 'question',
      phrase_en: 'smallest',
      phrase_id: 'terkecil',
      note_en: 'Stop at the very first square that passes — the smallest one.',
      note_id: 'Berhenti di kuadrat pertama yang lolos — yang terkecil.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Number to beat', label_id: 'Angka yang dilewati', value: String(n) },
      { label_en: 'Largest square ≤ n', label_id: 'Kuadrat terbesar ≤ n', value: `${prevRoot} × ${prevRoot} = ${prevRoot * prevRoot}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${answerRoot} × ${answerRoot} = ${answer}` },
    ],

    strategy: {
      conceptSlug: 'perfect-square-search',
      name_en: 'look for n × n',
      name_id: 'cari n × n',
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
