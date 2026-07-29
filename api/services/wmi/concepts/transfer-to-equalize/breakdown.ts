import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import { enCount, simulate, type Params } from './index.js'

// Authored decomposition of a transfer-to-equalize word problem. One idea sits
// under all three ask forms: moving k items from one child to the other changes
// the GAP between them by 2k, because the giver loses k AND the receiver gains k.
// Every highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes the "Find:" / "Cari:" markers), so the phrases below
// are built from the same params the body is built from, and never overlap.
export function buildTransferToEqualizeBreakdown(params: Params): Breakdown {
  const { ask, nameA, nameB, startA, startB, transfer, item_en, item_one_en, item_id } = params
  const sim = simulate(params)
  const twice = 2 * transfer

  let highlights: BreakdownHighlight[]
  let quantities: BreakdownQuantity[]
  let strategy: Breakdown['strategy']
  let trap: BreakdownTrap

  if (ask === 'equalize') {
    const t = sim.equalTransfer as number
    const each = sim.equalCount as number

    highlights = [
      {
        category: 'fact',
        phrase_en: `${nameA} has ${enCount(startA, params)}`,
        phrase_id: `${nameA} punya ${startA} ${item_id}`,
        note_en: `${nameA} starts with more — ${startA} ${item_en}.`,
        note_id: `${nameA} mulai dengan lebih banyak — ${startA} ${item_id}.`,
      },
      {
        category: 'fact',
        phrase_en: `${nameB} has ${enCount(startB, params)}`,
        phrase_id: `${nameB} punya ${startB} ${item_id}`,
        note_en: `${nameB} starts with fewer — ${startB} ${item_en}. The gap is ${startA} − ${startB} = ${sim.gapBefore}.`,
        note_id: `${nameB} mulai dengan lebih sedikit — ${startB} ${item_id}. Selisihnya ${startA} − ${startB} = ${sim.gapBefore}.`,
      },
      {
        category: 'condition',
        phrase_en: `the same number of ${item_en}`,
        phrase_id: `sama banyak`,
        note_en: `They must finish equal, so each one ends with ${each}.`,
        note_id: `Mereka harus berakhir sama, jadi masing-masing punya ${each}.`,
      },
      {
        category: 'question',
        phrase_en: `How many ${item_en} must ${nameA} give to ${nameB}?`,
        phrase_id: `Berapa ${item_id} yang harus ${nameA} berikan kepada ${nameB}?`,
        note_en: `Each ${item_one_en} that moves closes the gap by 2, so move half of ${sim.gapBefore}.`,
        note_id: `Setiap ${item_id} yang pindah menutup selisih sebanyak 2, jadi pindahkan setengah dari ${sim.gapBefore}.`,
      },
    ]

    quantities = [
      { label_en: `${nameA} at first`, label_id: `${nameA} mula-mula`, value: String(startA) },
      { label_en: `${nameB} at first`, label_id: `${nameB} mula-mula`, value: String(startB) },
      { label_en: 'Gap', label_id: 'Selisih', value: String(sim.gapBefore) },
      { label_en: 'Gap change per item moved', label_id: 'Perubahan selisih tiap 1 benda', value: '2' },
      { label_en: 'Each one ends with', label_id: 'Masing-masing berakhir dengan', value: String(each) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(t) },
    ]

    strategy = {
      conceptSlug: 'transfer-to-equalize',
      name_en: 'Move half the gap',
      name_id: 'Pindahkan setengah selisihnya',
    }

    // The classic trap: handing over the whole gap. That just swaps the two
    // children — it never makes them equal.
    trap = {
      wrong: String(sim.gapBefore),
      why_en: `Giving all ${sim.gapBefore} leaves ${nameA} with ${startB} and ${nameB} with ${startA} — they only swapped. Each ${item_one_en} moved changes the gap by 2, not 1, so move ${sim.gapBefore} ÷ 2.`,
      why_id: `Memberi ${sim.gapBefore} membuat ${nameA} punya ${startB} dan ${nameB} punya ${startA} — hanya bertukar. Setiap ${item_id} yang pindah mengubah selisih 2, bukan 1, jadi pindahkan ${sim.gapBefore} ÷ 2.`,
    }
  } else if (ask === 'after-transfer') {
    highlights = [
      {
        category: 'fact',
        phrase_en: `${nameA} has ${enCount(startA, params)}`,
        phrase_id: `${nameA} punya ${startA} ${item_id}`,
        note_en: `${nameA} starts with ${startA} ${item_en}.`,
        note_id: `${nameA} mulai dengan ${startA} ${item_id}.`,
      },
      {
        category: 'fact',
        phrase_en: `${nameB} has ${enCount(startB, params)}`,
        phrase_id: `${nameB} punya ${startB} ${item_id}`,
        note_en: `${nameB} starts with ${startB} ${item_en}. The gap at the start is ${sim.gapBefore}.`,
        note_id: `${nameB} mulai dengan ${startB} ${item_id}. Selisih di awal adalah ${sim.gapBefore}.`,
      },
      {
        category: 'condition',
        phrase_en: `gives ${enCount(transfer, params)} to ${nameB}`,
        phrase_id: `memberi ${transfer} ${item_id} kepada ${nameB}`,
        note_en: `Two numbers change at once: ${startA} − ${transfer} = ${sim.afterA} and ${startB} + ${transfer} = ${sim.afterB}.`,
        note_id: `Dua bilangan berubah sekaligus: ${startA} − ${transfer} = ${sim.afterA} dan ${startB} + ${transfer} = ${sim.afterB}.`,
      },
      {
        category: 'question',
        phrase_en: `How many more ${item_en} does ${nameA} have than ${nameB} now?`,
        phrase_id: `Sekarang ${nameA} punya berapa ${item_id} lebih banyak daripada ${nameB}?`,
        note_en: `The new gap: ${sim.gapBefore} − ${twice} = ${sim.gapAfter}.`,
        note_id: `Selisih baru: ${sim.gapBefore} − ${twice} = ${sim.gapAfter}.`,
      },
    ]

    quantities = [
      { label_en: `${nameA} at first`, label_id: `${nameA} mula-mula`, value: String(startA) },
      { label_en: `${nameB} at first`, label_id: `${nameB} mula-mula`, value: String(startB) },
      { label_en: 'Gap before', label_id: 'Selisih sebelum', value: String(sim.gapBefore) },
      { label_en: 'Moved across', label_id: 'Yang pindah', value: String(transfer) },
      { label_en: 'Gap change', label_id: 'Perubahan selisih', value: `2 × ${transfer} = ${twice}` },
      { label_en: 'Now', label_id: 'Sekarang', value: `${sim.afterA}, ${sim.afterB}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: sim.answer },
    ]

    strategy = {
      conceptSlug: 'transfer-to-equalize',
      name_en: 'The gap changes by twice what moves',
      name_id: 'Selisih berubah dua kali yang dipindah',
    }

    // The classic trap: shrinking the gap by k instead of 2k.
    trap = {
      wrong: String(sim.gapBefore - transfer),
      why_en: `The gap does not drop by only ${transfer}. ${nameA} loses ${transfer} AND ${nameB} gains ${transfer}, so it drops by 2 × ${transfer} = ${twice}.`,
      why_id: `Selisih tidak hanya berkurang ${transfer}. ${nameA} berkurang ${transfer} DAN ${nameB} bertambah ${transfer}, jadi selisih berkurang 2 × ${transfer} = ${twice}.`,
    }
  } else {
    const isGiver = params.subject === 'giver'

    highlights = [
      {
        category: 'condition',
        phrase_en: `${nameA} gives ${enCount(transfer, params)} to ${nameB}`,
        phrase_id: `${nameA} memberi ${transfer} ${item_id} kepada ${nameB}`,
        note_en: `The move already happened, so both numbers you see are the AFTER numbers.`,
        note_id: `Perpindahannya sudah terjadi, jadi kedua bilangan yang terlihat adalah bilangan SESUDAHNYA.`,
      },
      {
        category: 'fact',
        phrase_en: `${nameA} has ${enCount(sim.afterA, params)}`,
        phrase_id: `${nameA} punya ${sim.afterA} ${item_id}`,
        note_en: `${nameA} holds ${sim.afterA} after giving ${transfer} away.`,
        note_id: `${nameA} punya ${sim.afterA} setelah memberi ${transfer}.`,
      },
      {
        category: 'fact',
        phrase_en: `${nameB} has ${enCount(sim.afterB, params)}`,
        phrase_id: `${nameB} punya ${sim.afterB} ${item_id}`,
        note_en: `${nameB} holds ${sim.afterB} after receiving ${transfer}.`,
        note_id: `${nameB} punya ${sim.afterB} setelah menerima ${transfer}.`,
      },
      {
        category: 'question',
        phrase_en: `How many ${item_en} did ${sim.subjectName} have at first?`,
        phrase_id: `Berapa ${item_id} yang ${sim.subjectName} punya mula-mula?`,
        note_en: isGiver
          ? `Rewind: ${sim.subjectName} gave ${transfer} away, so put them back — ${sim.afterA} + ${transfer}.`
          : `Rewind: ${sim.subjectName} received ${transfer}, so take them back off — ${sim.afterB} − ${transfer}.`,
        note_id: isGiver
          ? `Putar balik: ${sim.subjectName} memberi ${transfer}, jadi kembalikan — ${sim.afterA} + ${transfer}.`
          : `Putar balik: ${sim.subjectName} menerima ${transfer}, jadi ambil kembali — ${sim.afterB} − ${transfer}.`,
      },
    ]

    quantities = [
      { label_en: 'Moved across', label_id: 'Yang pindah', value: String(transfer) },
      { label_en: `${nameA} now`, label_id: `${nameA} sekarang`, value: String(sim.afterA) },
      { label_en: `${nameB} now`, label_id: `${nameB} sekarang`, value: String(sim.afterB) },
      { label_en: 'Gap shift from the move', label_id: 'Pergeseran selisih', value: `2 × ${transfer} = ${twice}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: sim.answer },
    ]

    strategy = {
      conceptSlug: 'transfer-to-equalize',
      name_en: 'Rewind the move',
      name_id: 'Putar balik perpindahannya',
    }

    // Same family of mistake: treating the transfer as touching one side only,
    // so the rewind goes the wrong way.
    trap = isGiver
      ? {
          wrong: String(sim.afterA - transfer),
          why_en: `${nameA} GAVE ${transfer} away, so rewinding puts them back: ${sim.afterA} + ${transfer}, not ${sim.afterA} − ${transfer}. A move touches both children, never just one.`,
          why_id: `${nameA} MEMBERI ${transfer}, jadi putar balik berarti mengembalikannya: ${sim.afterA} + ${transfer}, bukan ${sim.afterA} − ${transfer}. Satu perpindahan menyentuh dua anak, bukan satu.`,
        }
      : {
          wrong: String(sim.afterB + transfer),
          why_en: `${nameB} RECEIVED ${transfer}, so rewinding takes them back off: ${sim.afterB} − ${transfer}, not ${sim.afterB} + ${transfer}. A move touches both children, never just one.`,
          why_id: `${nameB} MENERIMA ${transfer}, jadi putar balik berarti mengambilnya kembali: ${sim.afterB} − ${transfer}, bukan ${sim.afterB} + ${transfer}. Satu perpindahan menyentuh dua anak, bukan satu.`,
        }
  }

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy,
    trap,
    answer: {
      form: 'number',
      unit: null,
      value: sim.answer,
    },
    vocab: [],
  }
}
