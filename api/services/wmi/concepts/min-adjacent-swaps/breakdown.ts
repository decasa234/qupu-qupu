import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import {
  KIND_LABELS,
  firstDistantWrongPair,
  inversionCount,
  neighbourWrongPairs,
  phrasing,
  targetRow,
  wrongPairsToRight,
  type Params,
} from './index.js'

// Authored decomposition of a min-adjacent-swaps row. Every highlight phrase
// MUST be an exact substring of the DISPLAY body (after stripSectionLabels
// removes the "Find:" / "Cari:" markers), so all four are built from the same
// `phrasing(params)` the body is built from — they can never drift apart, and
// none of them is a substring of another (which would let the longest-first
// matcher swallow a shorter one).
export function buildMinAdjacentSwapsBreakdown(params: Params): Breakdown {
  const { order, values, kind } = params
  const { plural_en, plural_id } = KIND_LABELS[kind]
  const ph = phrasing(params)

  const perItem = wrongPairsToRight(values, order)
  const answer = inversionCount(values, order)
  const goal = targetRow(values, order)
  const neighbours = neighbourWrongPairs(values, order)
  const distant = firstDistantWrongPair(values, order)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: ph.rowText,
      phrase_id: ph.rowText,
      note_en: `This is the row right now, left to right. It should be ${goal.join(', ')}.`,
      note_id: `Ini barisnya sekarang, dari kiri ke kanan. Seharusnya ${goal.join(', ')}.`,
    },
    {
      category: 'condition',
      phrase_en: ph.rule_en,
      phrase_id: ph.rule_id,
      note_en: `Only neighbours may trade. One trade flips exactly one pair, so it can never fix two pairs at once.`,
      note_id: `Hanya yang bersebelahan boleh bertukar. Satu kali tukar membalik tepat satu pasang, jadi tidak bisa membetulkan dua pasang sekaligus.`,
    },
    {
      category: 'condition',
      phrase_en: ph.goal_en,
      phrase_id: ph.goal_id,
      note_en: `The finished row is ${goal.join(', ')}. Any two numbers not in that order are one wrong pair.`,
      note_id: `Baris yang sudah benar adalah ${goal.join(', ')}. Dua angka mana pun yang tidak urut seperti itu jadi satu pasang terbalik.`,
    },
    {
      category: 'question',
      phrase_en: ph.question_en,
      phrase_id: ph.question_id,
      note_en: `Count every pair that is the wrong way round — pairs far apart count too. That number is the fewest swaps.`,
      note_id: `Hitung semua pasangan yang terbalik — pasangan yang berjauhan juga dihitung. Banyaknya itulah jumlah tukar paling sedikit.`,
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Row now', label_id: 'Baris sekarang', value: ph.rowText },
    { label_en: 'Row wanted', label_id: 'Baris yang diinginkan', value: goal.join(', ') },
    {
      label_en: `Wrong pairs to the right of each ${plural_en.replace(/s$/, '')}`,
      label_id: `Pasangan terbalik di kanan tiap ${plural_id}`,
      value: perItem.join(' + '),
    },
    { label_en: 'Pairs fixed by one swap', label_id: 'Pasangan yang dibetulkan satu tukar', value: '1' },
    { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
  ]

  // The one real misconception: counting only the wrong pairs that happen to be
  // standing side by side. It is offered ONLY when a wrong pair sits apart —
  // that is exactly when the neighbour-only count is short of the truth (the
  // side-by-side wrong pairs are a subset of all wrong pairs), so the trap can
  // never accidentally name the correct answer.
  const trap: BreakdownTrap | null = distant
    ? {
        wrong: String(neighbours),
        why_en: `That only counts the wrong pairs standing side by side. ${distant.a} sits before ${distant.b} with ${plural_en} in between, and they are still the wrong way round — that pair needs a swap of its own. Counting every wrong pair, near or far, gives ${answer}.`,
        why_id: `Itu hanya menghitung pasangan terbalik yang bersebelahan. ${distant.a} ada di depan ${distant.b} walau terpisah beberapa ${plural_id}, dan urutannya tetap terbalik — pasangan itu butuh tukarnya sendiri. Kalau semua pasangan terbalik dihitung, dekat maupun jauh, hasilnya ${answer}.`,
      }
    : null

  return {
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'min-adjacent-swaps',
      name_en: 'Count the pairs that are the wrong way round',
      name_id: 'Hitung pasangan yang terbalik',
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
