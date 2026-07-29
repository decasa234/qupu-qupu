import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import {
  answerOf,
  clauseEn,
  clauseId,
  phantomLeadingZeros,
  qualifying,
  questionEn,
  questionId,
  type Constraint,
  type Params,
} from './index.js'

// Authored decomposition of a count-two-digit-numbers problem: walk 10..99 and
// keep every number that obeys a small set of digit rules, then report how many
// there are (or the spread between the biggest and smallest one).
//
// Display body (after stripSectionLabels removes the "Find:" / "Cari:" label and
// collapses the blank line):
//   "Bilangan dua angka adalah bilangan dari 10 sampai 99. Kita cari bilangan
//    dua angka yang <aturan>. Ada berapa bilangan yang cocok?"
// Every highlight phrase below is lifted verbatim from that body — the rule
// clauses come from the same clauseId/clauseEn helpers the body uses, so the
// two can never drift apart.

function noteId(c: Constraint): string {
  if (c.kind === 'tens') {
    if (c.cmp === 'gt') return `Angka puluhannya harus lebih besar dari ${c.v}, jadi mulai dari ${c.v + 1}.`
    if (c.cmp === 'lt') return `Angka puluhannya harus di bawah ${c.v}, dan paling kecil 1 — bukan 0.`
    return `Angka puluhannya harus tepat ${c.v}, jadi semua bilangannya ${c.v}0-an.`
  }
  if (c.kind === 'units') {
    if (c.cmp === 'gt') return `Angka satuannya harus lebih besar dari ${c.v}.`
    if (c.cmp === 'lt') return `Angka satuannya harus di bawah ${c.v}. Angka satuan boleh 0.`
    return `Angka satuannya harus tepat ${c.v}, jadi bilangannya berakhir dengan ${c.v}.`
  }
  if (c.kind === 'digit-sum') return `Jumlahkan angka puluhan dan angka satuannya — hasilnya harus pas ${c.v}.`
  return `Dari ${c.lo} sampai ${c.hi}; ${c.lo} dan ${c.hi} ikut dihitung.`
}

function noteEn(c: Constraint): string {
  if (c.kind === 'tens') {
    if (c.cmp === 'gt') return `The tens digit must beat ${c.v}, so it starts at ${c.v + 1}.`
    if (c.cmp === 'lt') return `The tens digit must stay under ${c.v}, and the smallest it can be is 1 — not 0.`
    return `The tens digit must be exactly ${c.v}, so every number is in the ${c.v}0s.`
  }
  if (c.kind === 'units') {
    if (c.cmp === 'gt') return `The ones digit must be bigger than ${c.v}.`
    if (c.cmp === 'lt') return `The ones digit must stay under ${c.v}. A ones digit is allowed to be 0.`
    return `The ones digit must be exactly ${c.v}, so every number ends in ${c.v}.`
  }
  if (c.kind === 'digit-sum') return `Add the tens digit and the ones digit — the total must be exactly ${c.v}.`
  return `From ${c.lo} to ${c.hi}; both ${c.lo} and ${c.hi} count.`
}

// How a one-digit near-miss looks when a child writes it with a leading zero.
// 0 itself is written plainly — "00" only confuses a six-year-old.
function asLeadingZero(n: number): string {
  return n === 0 ? '0' : `0${n}`
}

// The tempting wrong answers, in priority order:
//  1. counting "0k" as if it were a two-digit number (a 2-digit number can never
//     start with 0), and
//  2. for a plain run of numbers, subtracting the ends and forgetting to count
//     the first number (the fencepost slip).
function buildTrap(params: Params, set: number[], answer: number): BreakdownTrap | null {
  // Only claimed when the rules pin the ones digit down to a few near-misses.
  // When a whole decade of one-digit numbers "qualifies" the rules never really
  // spoke about them, and listing ten of them would drown the note.
  const phantoms = phantomLeadingZeros(params)
  if (phantoms.length > 0 && phantoms.length <= 3) {
    const listed = phantoms.map(asLeadingZero).join(', ')
    if (params.ask === 'how-many') {
      return {
        wrong: String(answer + phantoms.length),
        why_en: `${listed} ${phantoms.length > 1 ? 'are not two-digit numbers' : 'is not a two-digit number'} — the smallest two-digit number is 10.`,
        why_id: `${listed} bukan bilangan dua angka — bilangan dua angka paling kecil adalah 10.`,
      }
    }
    return {
      wrong: String(set[set.length - 1] - phantoms[0]),
      why_en: `The smallest number that fits is ${set[0]}, not ${asLeadingZero(phantoms[0])} — the smallest two-digit number is 10.`,
      why_id: `Bilangan terkecil yang cocok adalah ${set[0]}, bukan ${asLeadingZero(phantoms[0])} — bilangan dua angka paling kecil adalah 10.`,
    }
  }

  const only = params.constraints.length === 1 ? params.constraints[0] : null
  if (only && only.kind === 'between' && params.ask === 'how-many') {
    return {
      wrong: String(only.hi - only.lo),
      why_en: `${only.hi} − ${only.lo} = ${only.hi - only.lo} forgets to count ${only.lo} itself.`,
      why_id: `${only.hi} − ${only.lo} = ${only.hi - only.lo} lupa ikut menghitung ${only.lo} sendiri.`,
    }
  }

  return null
}

export function buildCountTwoDigitNumbersBreakdown(params: Params): Breakdown {
  const set = qualifying(params)
  const answer = answerOf(params)
  const smallest = set[0]
  const largest = set[set.length - 1]

  const highlights: BreakdownHighlight[] = [
    // fact — the search space, and the reason 0 can never lead
    {
      category: 'fact',
      phrase_en: 'any number from 10 to 99',
      phrase_id: 'bilangan dari 10 sampai 99',
      note_en: 'Only 10 up to 99 are two-digit numbers — the tens digit is never 0.',
      note_id: 'Hanya 10 sampai 99 yang bilangan dua angka — angka puluhannya tidak pernah 0.',
    },
    // object — the things being counted
    {
      category: 'object',
      phrase_en: 'two-digit numbers',
      phrase_id: 'bilangan dua angka',
      note_en: 'Every one of them has a tens digit and a ones digit.',
      note_id: 'Setiap bilangan ini punya angka puluhan dan angka satuan.',
    },
    // conditions — one per rule, lifted verbatim from the body
    ...params.constraints.map((c) => ({
      category: 'condition' as const,
      phrase_en: clauseEn(c),
      phrase_id: clauseId(c),
      note_en: noteEn(c),
      note_id: noteId(c),
    })),
    // question — what to report
    {
      category: 'question',
      phrase_en: questionEn(params.ask),
      phrase_id: questionId(params.ask),
      note_en:
        params.ask === 'how-many'
          ? 'You are asked how many numbers there are, not what they are.'
          : 'Find the biggest and the smallest number that fits, then subtract.',
      note_id:
        params.ask === 'how-many'
          ? 'Yang ditanya banyaknya bilangan, bukan bilangannya.'
          : 'Cari bilangan terbesar dan terkecil yang cocok dulu, baru kurangkan.',
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Numbers that fit', label_id: 'Bilangan yang cocok', value: set.join(', ') },
    { label_en: 'How many fit', label_id: 'Banyaknya', value: String(set.length) },
  ]
  if (params.ask === 'largest-minus-smallest') {
    quantities.push({ label_en: 'Smallest', label_id: 'Terkecil', value: String(smallest) })
    quantities.push({ label_en: 'Largest', label_id: 'Terbesar', value: String(largest) })
  }
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: String(answer) })

  return {
    needsVisual: false,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'count-two-digit-numbers',
      name_en: 'Fix the tens digit, walk the ones digit',
      name_id: 'Tahan angka puluhan, jalan di angka satuan',
    },

    trap: buildTrap(params, set, answer),

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
