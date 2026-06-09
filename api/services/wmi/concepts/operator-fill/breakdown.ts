import type { Breakdown, BreakdownHighlight } from '../types.js'
import { evalSigns, type Params } from './index.js'

// Authored decomposition of an operator-fill problem: three empty boxes sit
// between four numbers, and the learner picks the set of +/− signs that makes
// the equation reach the target. The learner-facing part is a set of
// color-coded, clickable highlights over the problem text. Each phrase MUST be
// an exact substring of the DISPLAY body (after stripSectionLabels removes
// "Find:" / "Cari:" — the equation and the question sentence remain). The signs
// to try are not in the body, so the machine brief carries the answer label and
// the correct sign sequence every other role binds to.
export function buildOperatorFillBreakdown(params: Params): Breakdown {
  const { nums, target } = params
  const list = nums.join(', ')

  // Mirror render(): find the option whose signs hit the target; its label is
  // the answer. answer.value MUST equal the choice label.
  const labels = ['A', 'B', 'C', 'D'] as const
  const correctIdx = params.options.findIndex((s) => evalSigns(nums, s) === target)
  const answerLabel = labels[correctIdx]
  const correct = params.options[correctIdx]
  const signSeq = correct.map((x) => (x === '+' ? '+' : '−')).join(' ')

  const highlights: BreakdownHighlight[] = [
    // fact — the four given numbers sit on the left of the equation
    {
      category: 'fact',
      phrase_en: '□',
      phrase_id: '□',
      note_en: `Each box hides a + or a − between the numbers ${list}.`,
      note_id: `Tiap kotak menyembunyikan + atau − di antara bilangan ${list}.`,
    },
    // fact — the number the equation must reach
    {
      category: 'fact',
      phrase_en: `= ${target}`,
      phrase_id: `= ${target}`,
      note_en: `The left side has to come out to exactly ${target}.`,
      note_id: `Sisi kiri harus tepat menjadi ${target}.`,
    },
    // condition — the equation must balance
    {
      category: 'condition',
      phrase_en: 'makes the equation true',
      phrase_id: 'membuat persamaan benar',
      note_en: `True means both sides are equal: the signs must add up to ${target}.`,
      note_id: `Benar berarti kedua sisi sama: tandanya harus menghasilkan ${target}.`,
    },
    // question — which set of signs to choose
    {
      category: 'question',
      phrase_en: 'Which set of signs (+, −)',
      phrase_id: 'Pilihan tanda (+, −) mana',
      note_en: `Pick one option, fill its signs into the boxes, and check it equals ${target}.`,
      note_id: `Pilih satu opsi, isikan tandanya ke kotak, dan periksa apakah sama dengan ${target}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Numbers', label_id: 'Bilangan', value: list },
      { label_en: 'Target', label_id: 'Target', value: String(target) },
      { label_en: 'Correct signs', label_id: 'Tanda benar', value: signSeq },
      { label_en: 'Answer', label_id: 'Jawaban', value: answerLabel },
    ],

    strategy: {
      conceptSlug: 'operator-fill',
      name_en: 'try the signs',
      name_id: 'coba tandanya',
    },

    // No single tempting wrong answer: the distractor labels carry different
    // sign sets, none uniquely tempting, so there is no genuine trap.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: answerLabel,
    },

    vocab: [],
  }
}
