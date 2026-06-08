import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a pattern-next problem: a short arithmetic sequence
// (start, start+step, start+2*step) followed by "?" — find the number that comes
// next. The rule (the step) is NOT written in the text, so there is no
// "condition" phrase to anchor; the learner discovers the step from the facts.
// Each phrase MUST be an exact substring of the rendered body.
export function buildPatternNextBreakdown(params: Params): Breakdown {
  const seq = [0, 1, 2].map((i) => params.start + i * params.step)
  const correct = params.start + 3 * params.step
  const labels = ['A', 'B', 'C', 'D'] as const
  const distractors = [correct - 1, correct + 1, correct + params.step + 1].filter(
    (v) => v !== correct && v > 0,
  )
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  const answerLabel = labels[values.indexOf(correct)]

  // Facts: the three given numbers in the sequence. Anchor each on its own
  // value as a substring of the body (same approach as budget-selection prices).
  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(seq[0]),
      phrase_id: String(seq[0]),
      note_en: `The sequence starts at ${seq[0]}.`,
      note_id: `Barisan dimulai dari ${seq[0]}.`,
    },
    {
      category: 'fact',
      phrase_en: String(seq[1]),
      phrase_id: String(seq[1]),
      note_en: `${seq[0]} jumps to ${seq[1]} — that is +${params.step}.`,
      note_id: `${seq[0]} loncat ke ${seq[1]} — itu +${params.step}.`,
    },
    {
      category: 'fact',
      phrase_en: String(seq[2]),
      phrase_id: String(seq[2]),
      note_en: `${seq[1]} jumps to ${seq[2]} — again +${params.step}.`,
      note_id: `${seq[1]} loncat ke ${seq[2]} — lagi-lagi +${params.step}.`,
    },
    // Question: the "?" marks the missing next number, and the prompt asks for it.
    {
      category: 'question',
      phrase_en: 'What number comes next in the sequence?',
      phrase_id: 'Angka berapa yang muncul berikutnya dalam barisan ini?',
      note_en: `Add the same jump once more: ${seq[2]} + ${params.step} = ${correct}.`,
      note_id: `Tambahkan loncatan yang sama sekali lagi: ${seq[2]} + ${params.step} = ${correct}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Sequence', label_id: 'Barisan', value: seq.join(', ') },
      { label_en: 'Step', label_id: 'Loncatan', value: String(params.step) },
      { label_en: 'Next number', label_id: 'Angka berikutnya', value: String(correct) },
    ],

    strategy: {
      conceptSlug: 'pattern-next',
      name_en: 'Find the step',
      name_id: 'Cari pola loncatan',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
