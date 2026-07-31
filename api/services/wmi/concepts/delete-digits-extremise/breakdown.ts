import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { plural, solve, trapFor, type Params } from './index.js'

// Authored decomposition of a delete-digits problem. One idea carries both ask
// forms: deleting digits leaves a SUBSEQUENCE — the survivors keep the order
// they were written in — so the number you can reach is decided by which digit
// you can pull to the FRONT while still leaving enough digits behind it.
//
// Every phrase below is assembled from the very same params the body is
// assembled from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildDeleteDigitsExtremiseBreakdown(params: Params): Breakdown {
  const { digits, k, objective, ask, source, concatTo } = params
  const s = solve(params)
  const { keep, result } = s
  const trap = trapFor(params, keep)
  const big = objective === 'max'
  const superlative_en = big ? 'largest' : 'smallest'
  const superlative_id = big ? 'terbesar' : 'terkecil'
  const best_en = big ? 'biggest' : 'smallest'
  const head = s.picks[0]

  const highlights: BreakdownHighlight[] = []

  if (source === 'concat') {
    highlights.push({
      category: 'object',
      phrase_en: `the whole numbers from 1 to ${concatTo}`,
      phrase_id: `bilangan 1 sampai ${concatTo}`,
      note_en: `Write 1, 2, 3 … ${concatTo} one after another with no gaps. That is where the long strip of digits comes from.`,
      note_id: `Tulis 1, 2, 3 … ${concatTo} berurutan tanpa jeda. Dari situlah deretan angka panjang ini berasal.`,
    })
  }

  highlights.push({
    category: 'fact',
    phrase_en: source === 'concat' ? `the long number ${digits}` : `the number ${digits}`,
    phrase_id: source === 'concat' ? `bilangan panjang ${digits}` : `bilangan ${digits}`,
    note_en: `${digits.length} digits on the board. This is the only strip you may take digits from.`,
    note_id: `Ada ${digits.length} angka di papan. Hanya dari deretan inilah kamu boleh mengambil angka.`,
  })

  highlights.push({
    category: 'condition',
    phrase_en: `Delete ${plural(k, 'digit', 'digits')}`,
    phrase_id: `Hapus ${k} angka`,
    note_en: `Exactly ${k} go, so exactly ${keep} stay — not more, not fewer.`,
    note_id: `Tepat ${k} angka dihapus, jadi tepat ${keep} angka tersisa — tidak lebih, tidak kurang.`,
  })

  highlights.push({
    category: 'condition',
    phrase_en: `keep their original order`,
    phrase_id: `tetap urutannya`,
    note_en: `This is the whole puzzle: you may cross digits out, but you may never move one. ${result} can be read straight out of ${digits} from left to right.`,
    note_id: `Ini inti soalnya: kamu boleh mencoret angka, tapi tidak boleh memindahkan angka. ${result} bisa dibaca langsung dari ${digits} dari kiri ke kanan.`,
  })

  if (ask === 'digit-sum-of-middle-three') {
    highlights.push({
      category: 'condition',
      phrase_en: `make the ${superlative_en} number`,
      phrase_id: `membentuk bilangan ${superlative_id}`,
      note_en: `First find the ${superlative_en} number you can leave (${result}); only then look at its middle digits.`,
      note_id: `Cari dulu bilangan ${superlative_id} yang bisa tersisa (${result}); baru lihat angka tengahnya.`,
    })
    highlights.push({
      category: 'question',
      phrase_en: `What is the sum of the three middle digits of that number?`,
      phrase_id: `Berapa jumlah tiga angka tengah dari bilangan itu?`,
      note_en: `${result} has 5 digits, so its three middle ones are ${s.middle.join(', ')} — add those.`,
      note_id: `${result} punya 5 angka, jadi tiga angka tengahnya ${s.middle.join(', ')} — jumlahkan itu.`,
    })
  } else {
    highlights.push({
      category: 'question',
      phrase_en: `What is the ${superlative_en} number that can be left?`,
      phrase_id: `Berapa bilangan ${superlative_id} yang bisa tersisa?`,
      note_en: `Every number you can leave has ${keep} digits, so the front digit decides. Make it as ${best_en} as you can, then do the same again.`,
      note_id: `Setiap bilangan yang bisa tersisa punya ${keep} angka, jadi angka depan yang menentukan. Buat angka depan se${big ? 'besar' : 'kecil'} mungkin, lalu ulangi lagi.`,
    })
  }

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Digits on the board', label_id: 'Angka di papan', value: String(digits.length) },
    { label_en: 'Deleted', label_id: 'Dihapus', value: String(k) },
    { label_en: 'Left standing', label_id: 'Tersisa', value: String(keep) },
    {
      label_en: 'Front digit may come from',
      label_id: 'Angka depan boleh diambil dari',
      value: digits.slice(head.from, head.to + 1),
    },
    { label_en: `The ${superlative_en} number left`, label_id: `Bilangan ${superlative_id} tersisa`, value: result },
  ]
  if (ask === 'digit-sum-of-middle-three') {
    quantities.push({
      label_en: 'Three middle digits',
      label_id: 'Tiga angka tengah',
      value: `${s.middle.join(' + ')} = ${s.middleSum}`,
    })
  }
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: s.answer })

  return {
    // The digit strip with its strike-throughs lives in the post-answer
    // explainer, not as an in-card illustration — the question itself is one
    // short line of text and reads fine unaided.
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'delete-digits-extremise',
      name_en: big ? 'Pull the biggest digit you can to the front' : 'Pull the smallest digit you can to the front',
      name_id: big ? 'Bawa angka terbesar ke depan' : 'Bawa angka terkecil ke depan',
    },
    // The one misconception this concept exists to kill: treating the digits as
    // loose tiles you may sort, instead of a line you may only thin out.
    trap: {
      wrong: trap.answer,
      why_en: `Taking the ${keep} ${best_en} digits and lining them up gives ${trap.number}, but that shuffles them. In ${digits} those digits never stand in that order, and deleting can only remove a digit — never move one. Read left to right, the best you can reach is ${result}.`,
      why_id: `Mengambil ${keep} angka ${superlative_id} lalu menjejerkannya memberi ${trap.number}, padahal itu menukar urutan. Di ${digits} angka-angka itu tidak berdiri dengan urutan seperti itu, dan menghapus hanya bisa membuang angka — bukan memindahkannya. Dibaca dari kiri ke kanan, bilangan ${superlative_id} yang bisa dicapai hanyalah ${result}.`,
    },
    answer: {
      form: 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
