import type { Breakdown, BreakdownHighlight } from '../types.js'
import {
  groupText,
  missingValue,
  ruleWords,
  trapFor,
  type Params,
} from './index.js'

// Authored decomposition of a number-figure-rule problem: a decorated figure
// holds three number groups. Two are complete — they are the EVIDENCE the child
// reads the hidden rule from — and the third has one slot blanked out.
//
// The notes deliberately never name the rule: naming it would hand over the
// whole puzzle. They point at WHERE to look instead. Every phrase below is
// built from params and is an exact substring of the rendered body in that
// language (the "Cari:" / "Find:" labels are stripped before display, so no
// phrase is allowed to touch them).
export function buildNumberFigureRuleBreakdown(params: Params): Breakdown {
  const [g1, g2, g3] = params.groups
  const t1 = groupText(g1, null)
  const t2 = groupText(g2, null)
  const t3 = groupText(g3, params.blankPosition)
  const answer = missingValue(params)
  const words = ruleWords(params.rule)
  const trap = trapFor(params)

  const slotOrdinal =
    params.blankPosition === 'a' ? { en: 'first', id: 'pertama' }
    : params.blankPosition === 'b' ? { en: 'second', id: 'kedua' }
    : { en: 'last', id: 'terakhir' }

  const highlights: BreakdownHighlight[] = [
    // condition — the one rule that ties all three groups together
    {
      category: 'condition',
      phrase_en: 'The same rule is used in every figure',
      phrase_id: 'Aturan yang sama dipakai di setiap gambar',
      note_en: 'One single rule fits all three figures. Find it in the finished ones first.',
      note_id: 'Cuma ada satu aturan untuk ketiga gambar. Cari dulu di gambar yang sudah lengkap.',
    },
    // facts — the two solved groups, the evidence for the rule
    {
      category: 'fact',
      phrase_en: t1,
      phrase_id: t1,
      note_en: `This figure is finished: ${g1.a} and ${g1.b} turn into ${g1.c}. What was done to them?`,
      note_id: `Gambar ini sudah lengkap: ${g1.a} dan ${g1.b} jadi ${g1.c}. Diapakan ya?`,
    },
    {
      category: 'fact',
      phrase_en: t2,
      phrase_id: t2,
      note_en: `A second finished figure: ${g2.a} and ${g2.b} turn into ${g2.c}. Your rule must fit this one too.`,
      note_id: `Gambar lengkap kedua: ${g2.a} dan ${g2.b} jadi ${g2.c}. Aturanmu harus cocok di sini juga.`,
    },
    // object — the group you actually have to work on
    {
      category: 'object',
      phrase_en: t3,
      phrase_id: t3,
      note_en: `This is the figure with the gap — the ${slotOrdinal.en} number is missing.`,
      note_id: `Ini gambar yang bolong — angka ${slotOrdinal.id} hilang.`,
    },
    // question — what to hand in
    {
      category: 'question',
      phrase_en: 'What is the missing number?',
      phrase_id: 'Berapa angka yang hilang?',
      note_en: 'Put the rule you found to work on the last figure and write that one number.',
      note_id: 'Pakai aturan yang kamu temukan di gambar terakhir, lalu tulis satu angka itu.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Figure 1', label_id: 'Gambar 1', value: t1 },
      { label_en: 'Figure 2', label_id: 'Gambar 2', value: t2 },
      { label_en: 'Figure 3', label_id: 'Gambar 3', value: t3 },
      { label_en: 'Hidden rule', label_id: 'Aturan tersembunyi', value: words.id },
      { label_en: 'Missing number', label_id: 'Angka yang hilang', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'number-figure-rule',
      name_en: 'Read the rule off the solved groups, then apply it',
      name_id: 'Baca aturan dari gambar yang lengkap, lalu pakai',
    },

    trap,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
