import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answerSum, type Params } from './index.js'

// Authored decomposition of a venn-set-membership problem: two overlapping
// circles A and B; sum the numbers that are in A only (the part of A that does
// NOT overlap B). The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be an exact substring of
// the DISPLAY body (after stripSectionLabels removes "Find:" / "Cari:"). There
// is no glossary markup, so the display body equals the rendered body with the
// label dropped.
export function buildVennSetMembershipBreakdown(params: Params): Breakdown {
  const aOnlyList = params.aOnly.join(', ')
  const bothList = params.both.join(', ')
  const bOnlyList = params.bOnly.join(', ')
  const aOnlySum = answerSum(params)
  const bothSum = params.both.reduce((s, n) => s + n, 0)
  const addStr = params.aOnly.join(' + ')

  // The trap: counting the overlap numbers too — they sit inside circle A on the
  // diagram, so a learner adds them in, double-counting the shared region.
  const wrong = aOnlySum + bothSum

  const highlights: BreakdownHighlight[] = [
    // fact — the numbers in A only (these ARE counted)
    {
      category: 'fact',
      phrase_en: `Circle A only (not in B) contains: ${aOnlyList}`,
      phrase_id: `Lingkaran A saja (tidak di B) berisi: ${aOnlyList}`,
      note_en: `These belong to A and not B — count them: ${aOnlyList}.`,
      note_id: `Ini milik A dan bukan B — hitung: ${aOnlyList}.`,
    },
    // fact — the numbers in B only (a distractor region, never counted)
    {
      category: 'fact',
      phrase_en: `Circle B only (not in A) contains: ${bOnlyList}`,
      phrase_id: `Lingkaran B saja (tidak di A) berisi: ${bOnlyList}`,
      note_en: `These are outside A, so they never count: ${bOnlyList}.`,
      note_id: `Ini di luar A, jadi tidak pernah dihitung: ${bOnlyList}.`,
    },
    // condition — the overlap rule: shared by both, so skip it
    {
      category: 'condition',
      phrase_en: `The overlap (in both A and B) contains: ${bothList}`,
      phrase_id: `Irisan (di A dan B) berisi: ${bothList}`,
      note_en: `Shared by A and B — "A but not B" leaves these out: ${bothList}.`,
      note_id: `Dimiliki bersama A dan B — "A tetapi bukan B" tidak menghitungnya: ${bothList}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'belong to circle A but NOT to circle B',
      phrase_id: 'termasuk lingkaran A tetapi TIDAK termasuk lingkaran B',
      note_en: `Add only the A-only numbers: ${addStr} = ${aOnlySum}.`,
      note_id: `Jumlahkan hanya bilangan bagian A saja: ${addStr} = ${aOnlySum}.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'A only', label_id: 'A saja', value: aOnlyList },
      { label_en: 'Overlap (both)', label_id: 'Irisan (keduanya)', value: bothList },
      { label_en: 'B only', label_id: 'B saja', value: bOnlyList },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(aOnlySum) },
    ],

    strategy: {
      conceptSlug: 'venn-set-membership',
      name_en: 'Count A only, skip the overlap',
      name_id: 'Hitung A saja, lewati irisan',
    },

    // Tempting wrong answer: double-counting the overlap by adding the shared
    // numbers into A's total. Only a real distractor when the overlap is nonzero
    // (it always is here — `both` has at least one number).
    trap:
      bothSum > 0
        ? {
            wrong: String(wrong),
            why_en: `${aOnlySum} + ${bothSum} = ${wrong} adds the overlap (${bothList}), but those are in B too, so they don't count.`,
            why_id: `${aOnlySum} + ${bothSum} = ${wrong} ikut menghitung irisan (${bothList}), padahal itu juga di B, jadi tidak dihitung.`,
          }
        : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(aOnlySum),
    },

    vocab: [],
  }
}
