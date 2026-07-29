import type { Breakdown, BreakdownHighlight } from '../types.js'
import {
  groupText,
  missingValue,
  ruleWords,
  trapFor,
  type Params,
} from './index.js'

// Authored decomposition of a number-figure-rule problem. The figure carries all
// the numbers: three number groups, two complete (the EVIDENCE the child reads
// the hidden rule from) and a third with one slot blanked out. The body is a
// short instruction with no numbers in it at all, so the highlights sit on the
// instruction words and point the child AT the figure.
//
// The notes deliberately never name the rule: naming it would hand over the
// whole puzzle. Every phrase below is an exact substring of the rendered body in
// that language, and none of them overlap (the renderer matches longest-first
// and would swallow a nested phrase). The "Cari:" / "Find:" labels are stripped
// before display, so no phrase is allowed to touch them.
export function buildNumberFigureRuleBreakdown(params: Params): Breakdown {
  const [g1, g2, g3] = params.groups
  const answer = missingValue(params)
  const words = ruleWords(params.rule)
  const trap = trapFor(params)

  const slotOrdinal =
    params.blankPosition === 'a' ? { en: 'first', id: 'pertama' }
    : params.blankPosition === 'b' ? { en: 'second', id: 'kedua' }
    : { en: 'last', id: 'terakhir' }

  const highlights: BreakdownHighlight[] = [
    // condition — one single rule ties all three groups together
    {
      category: 'condition',
      phrase_en: 'The same rule',
      phrase_id: 'Aturan yang sama',
      note_en: 'There is only ONE rule for all the figures — not a different one each time.',
      note_id: 'Cuma ada SATU aturan untuk semua gambar, bukan aturan yang beda-beda.',
    },
    // fact — where the evidence is: the finished groups in the picture
    {
      category: 'fact',
      phrase_en: 'is used in every figure',
      phrase_id: 'dipakai di setiap gambar',
      note_en: 'Look at the figures that are already finished. They show the rule working, so read them first.',
      note_id: 'Lihat gambar yang sudah lengkap. Di situ aturannya terlihat bekerja, jadi baca itu dulu.',
    },
    // question — what to hand in
    {
      category: 'question',
      phrase_en: 'the missing number',
      phrase_id: 'angka yang hilang',
      note_en: `One figure has a "?" where the ${slotOrdinal.en} number should be. Use your rule there and write that one number.`,
      note_id: `Ada satu gambar dengan "?" di tempat angka ${slotOrdinal.id}. Pakai aturanmu di situ, lalu tulis satu angka itu.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    // Machine brief. The real numbers live here (and in the figure) — never in
    // the body, so this is what the illustrator / explainer bind to.
    quantities: [
      { label_en: 'First figure', label_id: 'Gambar pertama', value: groupText(g1, null) },
      { label_en: 'Second figure', label_id: 'Gambar kedua', value: groupText(g2, null) },
      {
        label_en: 'Last figure',
        label_id: 'Gambar terakhir',
        value: groupText(g3, params.blankPosition),
      },
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
