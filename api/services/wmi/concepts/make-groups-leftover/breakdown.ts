import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer as remainder, type Params } from './index.js'

// Authored decomposition of a make-groups-leftover problem: share a total of
// counters into equal groups of a fixed size and find how many are left over
// (the remainder). The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be an exact substring of
// the DISPLAY body (after stripSectionLabels removes "Find:" / "Cari:"). There
// is no glossary markup, so the display body equals the rendered body with the
// label dropped.
export function buildMakeGroupsLeftoverBreakdown(params: Params): Breakdown {
  const { total, groupSize } = params
  const groups = Math.floor(total / groupSize)
  const rem = remainder(params)

  const highlights: BreakdownHighlight[] = [
    // fact — the total number of counters to share out
    {
      category: 'fact',
      phrase_en: `${total} counters`,
      phrase_id: `${total} benda`,
      note_en: `All the counters you have — ${total} of them.`,
      note_id: `Semua benda yang kamu punya — sebanyak ${total}.`,
    },
    // fact — the size of each group
    {
      category: 'fact',
      phrase_en: `groups of ${groupSize}`,
      phrase_id: `kelompok berisi ${groupSize}`,
      note_en: `Each group holds exactly ${groupSize}.`,
      note_id: `Setiap kelompok berisi tepat ${groupSize}.`,
    },
    // condition — make equal groups, then keep what cannot fill one more
    {
      category: 'condition',
      phrase_en: 'put into groups',
      phrase_id: 'dibagi ke kelompok',
      note_en: `Fill equal groups of ${groupSize} until you can't make a full one.`,
      note_id: `Isi kelompok sama besar (${groupSize}) sampai tidak cukup satu lagi.`,
    },
    // question — what to find: the leftover (remainder)
    {
      category: 'question',
      phrase_en: 'How many counters are left over?',
      phrase_id: 'Berapa benda yang tersisa?',
      note_en: `${groups} full groups use ${groups * groupSize}; ${total} − ${groups * groupSize} = ${rem} left.`,
      note_id: `${groups} kelompok penuh memakai ${groups * groupSize}; ${total} − ${groups * groupSize} = ${rem} sisa.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Total', label_id: 'Jumlah', value: String(total) },
      { label_en: 'Group size', label_id: 'Isi kelompok', value: String(groupSize) },
      { label_en: 'Full groups', label_id: 'Kelompok penuh', value: String(groups) },
      { label_en: 'Leftover', label_id: 'Sisa', value: String(rem) },
    ],

    strategy: {
      conceptSlug: 'make-groups-leftover',
      name_en: 'divide, keep the remainder',
      name_id: 'bagi, ambil sisanya',
    },

    // No genuine trap: the only common slip is reporting the number of groups
    // instead of the leftover, but that is not a single fixed tempting value
    // worth flagging here.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(rem),
    },

    vocab: [],
  }
}
