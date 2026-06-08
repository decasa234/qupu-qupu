import type { Breakdown, BreakdownHighlight } from '../types.js'
import { lineLength, type Params } from './index.js'

// Authored decomposition of a position-in-line problem: one child knows their
// place counting from the front AND from the back, and we want the total number
// of children in the line. The trick is that the child is counted once in BOTH
// positions, so the two position numbers overlap by exactly one (the child).
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes the "Find:" / "Cari:" markers and collapses spaces).
export function buildPositionInLineBreakdown(params: Params): Breakdown {
  const { name, fromFront, fromBack } = params
  const total = lineLength(params) // fromFront + fromBack - 1
  // Classic off-by-one: adding the two positions and forgetting the child is the
  // same person in both counts, so they get counted twice.
  const doubleCounted = fromFront + fromBack

  const highlights: BreakdownHighlight[] = [
    // fact — the position counting from the front
    {
      category: 'fact',
      phrase_en: `position ${fromFront}`,
      phrase_id: `urutan ke-${fromFront}`,
      note_en: `${name} is the ${fromFront}th child from the front.`,
      note_id: `${name} adalah anak ke-${fromFront} dari depan.`,
    },
    // fact — the position counting from the back
    {
      category: 'fact',
      phrase_en: `position ${fromBack}`,
      phrase_id: `urutan ke-${fromBack}`,
      note_en: `${name} is also the ${fromBack}th child from the back.`,
      note_id: `${name} juga anak ke-${fromBack} dari belakang.`,
    },
    // condition — the "from the front" framing
    {
      category: 'condition',
      phrase_en: 'Counting from the front',
      phrase_id: 'Dihitung dari depan',
      note_en: `Start at the front of the line and count to ${name}.`,
      note_id: `Mulai dari depan barisan dan hitung sampai ${name}.`,
    },
    // condition — the "from the back" framing
    {
      category: 'condition',
      phrase_en: 'Counting from the back',
      phrase_id: 'Dihitung dari belakang',
      note_en: `${name} is counted again from the other end — the same child.`,
      note_id: `${name} dihitung lagi dari ujung lain — anak yang sama.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'How many children are in the line?',
      phrase_id: 'Berapa banyak anak dalam barisan itu?',
      note_en: `Add both positions, then subtract 1 because ${name} is counted twice.`,
      note_id: `Jumlahkan kedua urutan, lalu kurangi 1 karena ${name} terhitung dua kali.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'From the front', label_id: 'Dari depan', value: String(fromFront) },
      { label_en: 'From the back', label_id: 'Dari belakang', value: String(fromBack) },
      { label_en: 'Answer (total children)', label_id: 'Jawaban (jumlah anak)', value: String(total) },
    ],

    strategy: {
      conceptSlug: 'position-in-line',
      name_en: 'Add the two positions, subtract the overlap of 1',
      name_id: 'Jumlahkan kedua urutan, kurangi tumpang tindih 1',
    },

    // Tempting wrong answer: adding the two positions without subtracting 1.
    trap: {
      wrong: String(doubleCounted),
      why_en: `${fromFront} + ${fromBack} = ${doubleCounted} counts ${name} twice; subtract 1 to get ${total}.`,
      why_id: `${fromFront} + ${fromBack} = ${doubleCounted} menghitung ${name} dua kali; kurangi 1 menjadi ${total}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(total),
    },

    vocab: [],
  }
}
