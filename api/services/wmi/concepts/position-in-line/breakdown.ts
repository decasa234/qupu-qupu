import type { Breakdown, BreakdownHighlight } from '../types.js'
import { lineLength, posFromBack, peopleBetween, type Params } from './index.js'

// Parametric breakdown builder for all four position-in-line modes.
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes "Find:" / "Cari:" labels and collapses spaces).
export function buildPositionInLineBreakdown(params: Params): Breakdown {
  if (params.mode === 'count-total') {
    return buildCountTotal(params)
  }
  if (params.mode === 'from-back') {
    return buildFromBack(params)
  }
  if (params.mode === 'between') {
    return buildBetween(params)
  }
  return buildReversal(params)
}

// ── Mode 1: count-total ───────────────────────────────────────────────────────

function buildCountTotal(p: Extract<Params, { mode: 'count-total' }>): Breakdown {
  const { name, fromFront, fromBack } = p
  const total = lineLength(p)
  const doubleCounted = fromFront + fromBack

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `position ${fromFront}`,
      phrase_id: `urutan ke-${fromFront}`,
      note_en: `${name} is the ${fromFront}th child from the front.`,
      note_id: `${name} adalah anak ke-${fromFront} dari depan.`,
    },
    {
      category: 'fact',
      phrase_en: `position ${fromBack}`,
      phrase_id: `urutan ke-${fromBack}`,
      note_en: `${name} is also the ${fromBack}th child from the back.`,
      note_id: `${name} juga anak ke-${fromBack} dari belakang.`,
    },
    {
      category: 'condition',
      phrase_en: 'Counting from the front',
      phrase_id: 'Dihitung dari depan',
      note_en: `Start at the front of the line and count to ${name}.`,
      note_id: `Mulai dari depan barisan dan hitung sampai ${name}.`,
    },
    {
      category: 'condition',
      phrase_en: 'Counting from the back',
      phrase_id: 'Dihitung dari belakang',
      note_en: `${name} is counted again from the other end — the same child.`,
      note_id: `${name} dihitung lagi dari ujung lain — anak yang sama.`,
    },
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
      { label_en: 'Total children', label_id: 'Jumlah anak', value: String(total) },
    ],
    strategy: {
      conceptSlug: 'position-in-line',
      name_en: 'Add the two positions, subtract the overlap of 1',
      name_id: 'Jumlahkan kedua urutan, kurangi tumpang tindih 1',
    },
    trap: {
      wrong: String(doubleCounted),
      why_en: `${fromFront} + ${fromBack} = ${doubleCounted} counts ${name} twice; subtract 1 to get ${total}.`,
      why_id: `${fromFront} + ${fromBack} = ${doubleCounted} menghitung ${name} dua kali; kurangi 1 menjadi ${total}.`,
    },
    answer: { form: 'number', unit: null, value: String(total) },
    vocab: [],
  }
}

// ── Mode 2: from-back ─────────────────────────────────────────────────────────

function buildFromBack(p: Extract<Params, { mode: 'from-back' }>): Breakdown {
  const { name, n, pos } = p
  const back = posFromBack(n, pos)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `There are ${n} children`,
      phrase_id: `Ada ${n} anak`,
      note_en: `The total number of children in the line is ${n}.`,
      note_id: `Jumlah anak dalam barisan adalah ${n}.`,
    },
    {
      category: 'fact',
      phrase_en: `position ${pos} counting from the front`,
      phrase_id: `urutan ke-${pos} dari depan`,
      note_en: `${name} has ${pos - 1} children in front of them.`,
      note_id: `Ada ${pos - 1} anak di depan ${name}.`,
    },
    {
      category: 'question',
      phrase_en: `What is ${name}'s position counting from the back?`,
      phrase_id: `Berapa urutan ${name} dihitung dari belakang?`,
      note_en: `Use: position from back = total − position from front + 1.`,
      note_id: `Gunakan: urutan dari belakang = total − urutan dari depan + 1.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Total children', label_id: 'Jumlah anak', value: String(n) },
      { label_en: 'Position from front', label_id: 'Urutan dari depan', value: String(pos) },
      { label_en: 'Position from back', label_id: 'Urutan dari belakang', value: String(back) },
    ],
    strategy: {
      conceptSlug: 'position-in-line',
      name_en: 'Position from back = total − position from front + 1',
      name_id: 'Urutan dari belakang = total − urutan dari depan + 1',
    },
    trap: {
      wrong: String(pos),
      why_en: `${pos} is the front-position — you need to flip it: ${n} − ${pos} + 1 = ${back}.`,
      why_id: `${pos} adalah urutan dari depan — perlu dibalik: ${n} − ${pos} + 1 = ${back}.`,
    },
    answer: { form: 'number', unit: null, value: String(back) },
    vocab: [],
  }
}

// ── Mode 3: between ───────────────────────────────────────────────────────────

function buildBetween(p: Extract<Params, { mode: 'between' }>): Breakdown {
  const { nameA, nameB, posA, posB } = p
  const between = peopleBetween(posA, posB)
  const wrongDiff = posB - posA  // trap: subtract without removing endpoints

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `position ${posA} from the front`,
      phrase_id: `urutan ke-${posA} dari depan`,
      note_en: `${nameA} occupies position ${posA}.`,
      note_id: `${nameA} berada di urutan ke-${posA}.`,
    },
    {
      category: 'fact',
      phrase_en: `position ${posB} from the front`,
      phrase_id: `urutan ke-${posB} dari depan`,
      note_en: `${nameB} occupies position ${posB}.`,
      note_id: `${nameB} berada di urutan ke-${posB}.`,
    },
    {
      category: 'question',
      phrase_en: `strictly between ${nameA} and ${nameB}`,
      phrase_id: `tepat di antara ${nameA} dan ${nameB}`,
      note_en: `"Strictly between" means we do NOT count ${nameA} or ${nameB} themselves.`,
      note_id: `"Tepat di antara" berarti ${nameA} dan ${nameB} sendiri tidak dihitung.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: `${nameA}'s position`, label_id: `Posisi ${nameA}`, value: String(posA) },
      { label_en: `${nameB}'s position`, label_id: `Posisi ${nameB}`, value: String(posB) },
      { label_en: 'Between them', label_id: 'Di antara mereka', value: String(between) },
    ],
    strategy: {
      conceptSlug: 'position-in-line',
      name_en: 'Between = (posB − posA) − 1',
      name_id: 'Di antara = (posB − posA) − 1',
    },
    trap: {
      wrong: String(wrongDiff),
      why_en: `${posB} − ${posA} = ${wrongDiff} counts the gap including one endpoint; subtract 1 more to get ${between}.`,
      why_id: `${posB} − ${posA} = ${wrongDiff} menghitung selisih termasuk satu ujung; kurangi 1 lagi menjadi ${between}.`,
    },
    answer: { form: 'number', unit: null, value: String(between) },
    vocab: [],
  }
}

// ── Mode 4: reversal ──────────────────────────────────────────────────────────

function buildReversal(p: Extract<Params, { mode: 'reversal' }>): Breakdown {
  const { name, n, pos } = p
  const newPos = posFromBack(n, pos) // n − pos + 1

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `position ${pos} counting from the front`,
      phrase_id: `urutan ke-${pos} dari depan`,
      note_en: `Before the reversal, ${name} is at position ${pos} from the front.`,
      note_id: `Sebelum dibalik, ${name} berada di urutan ke-${pos} dari depan.`,
    },
    {
      category: 'fact',
      phrase_en: `${n} children are standing in a line`,
      phrase_id: `${n} anak berdiri dalam barisan`,
      note_en: `There are ${n} children in total.`,
      note_id: `Total ada ${n} anak dalam barisan.`,
    },
    {
      category: 'condition',
      phrase_en: 'turn around and reverse the order',
      phrase_id: 'berbalik sehingga urutan barisan menjadi terbalik',
      note_en: `The first becomes last and the last becomes first — every position flips.`,
      note_id: `Yang pertama menjadi terakhir dan sebaliknya — setiap posisi terbalik.`,
    },
    {
      category: 'question',
      phrase_en: `What is ${name}'s new position counting from the front after the reversal?`,
      phrase_id: `Berapa urutan ${name} dari depan setelah barisan dibalik?`,
      note_en: `After reversal, the old front-rank becomes the back-rank. New front = total − old + 1.`,
      note_id: `Setelah dibalik, urutan lama dari depan menjadi urutan dari belakang. Posisi baru = total − lama + 1.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Total children', label_id: 'Jumlah anak', value: String(n) },
      { label_en: 'Original position (front)', label_id: 'Urutan awal (dari depan)', value: String(pos) },
      { label_en: 'New position (front)', label_id: 'Urutan baru (dari depan)', value: String(newPos) },
    ],
    strategy: {
      conceptSlug: 'position-in-line',
      name_en: 'After reversal: new front-position = total − old position + 1',
      name_id: 'Setelah dibalik: posisi baru dari depan = total − posisi lama + 1',
    },
    trap: {
      wrong: String(pos),
      why_en: `${pos} is the original position — after reversal it becomes the back-rank; the new front-rank is ${n} − ${pos} + 1 = ${newPos}.`,
      why_id: `${pos} adalah posisi awal — setelah dibalik menjadi urutan dari belakang; posisi baru dari depan adalah ${n} − ${pos} + 1 = ${newPos}.`,
    },
    answer: { form: 'number', unit: null, value: String(newPos) },
    vocab: [],
  }
}
