import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import { askQuestion, ordinal, solve, stripLength, type Params } from './index.js'

// Authored decomposition of an iterated-rule problem. One idea carries all
// three rules and both ask forms: the rule makes a list, the list starts
// repeating a block, and the far number is found by counting past the run-up
// and taking a remainder.
//
// Every phrase below is assembled from the very same params the body is
// assembled from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing spans that marker, and no two phrases overlap.
export function buildIteratedRuleFarTermBreakdown(params: Params): Breakdown {
  const s = solve(params)
  const { tailLength: tail, cycleLength: len, cycleTerms, tailTerms, terms } = s
  const block = cycleTerms.join(', ')
  const runUp = tailTerms.join(', ')
  const question = askQuestion(params)

  const highlights: BreakdownHighlight[] = []

  if (params.rule === 'difference-of-previous-two') {
    highlights.push({
      category: 'fact',
      phrase_en: `starts with ${params.seedA} and ${params.seedB}`,
      phrase_id: `dimulai dengan ${params.seedA} dan ${params.seedB}`,
      note_en: `These two are given to you. Every other number in the list is built from them.`,
      note_id: `Dua bilangan ini sudah diberikan. Semua bilangan lain dibangun dari keduanya.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: `every new number`,
      phrase_id: `setiap bilangan baru`,
      note_en: `The rule never stops, so the list goes on forever — you just have to see how it behaves.`,
      note_id: `Aturannya tidak pernah berhenti, jadi daftarnya panjang terus — kamu tinggal melihat polanya.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: `the difference between the two numbers just before it`,
      phrase_id: `selisih dua bilangan tepat sebelumnya`,
      note_en: `Look back at the last two numbers and subtract the smaller from the bigger. Subtracting keeps making the numbers smaller, so they soon settle into a short block.`,
      note_id: `Lihat dua bilangan terakhir, lalu kurangkan yang kecil dari yang besar. Karena selalu dikurangi, bilangannya cepat mengecil lalu menetap jadi blok pendek.`,
    })
  } else if (params.rule === 'units-digit-of-product') {
    highlights.push({
      category: 'fact',
      phrase_en: `starts with ${params.seedA}`,
      phrase_id: `dimulai dengan ${params.seedA}`,
      note_en: `The one number you are handed. Everything after it comes from the rule.`,
      note_id: `Satu-satunya bilangan yang diberikan. Sisanya muncul dari aturan.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: `every new number`,
      phrase_id: `setiap bilangan baru`,
      note_en: `The rule never stops, so the list goes on forever — you just have to see how it behaves.`,
      note_id: `Aturannya tidak pernah berhenti, jadi daftarnya panjang terus — kamu tinggal melihat polanya.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: `the ones digit of the number before it times ${params.multiplier}`,
      phrase_id: `angka satuan dari bilangan sebelumnya dikali ${params.multiplier}`,
      note_en: `Multiply, then keep only the last digit. Only the digits 0 to 9 can ever appear, so the list has to start repeating.`,
      note_id: `Kalikan dulu, lalu ambil angka terakhirnya saja. Yang bisa muncul hanya angka 0 sampai 9, jadi daftarnya pasti mulai berulang.`,
    })
  } else {
    highlights.push({
      category: 'object',
      phrase_en: `${params.ring} chairs stand in a circle`,
      phrase_id: `Ada ${params.ring} kursi melingkar`,
      note_en: `A circle has no end: past chair ${params.ring} you are back at chair 1. That is what makes the numbers come round.`,
      note_id: `Lingkaran tidak ada ujungnya: lewat kursi ${params.ring} kamu kembali ke kursi 1. Itulah yang membuat bilangannya berputar.`,
    })
    highlights.push({
      category: 'fact',
      phrase_en: `A ball starts on chair ${params.seedA}`,
      phrase_id: `Sebuah bola mulai di kursi ${params.seedA}`,
      note_en: `Where the ball begins. Careful: the first number you write is the chair AFTER pass 1, not chair ${params.seedA}.`,
      note_id: `Tempat bola bermula. Hati-hati: bilangan pertama yang kamu tulis adalah kursi SETELAH operan ke-1, bukan kursi ${params.seedA}.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: `Pass 1 moves it ${params.forward} chairs forward, pass 2 moves it ${params.back} chairs back`,
      phrase_id: `Operan ke-1 memindahkannya ${params.forward} kursi maju, operan ke-2 memindahkannya ${params.back} kursi mundur`,
      note_en: `Forward ${params.forward}, back ${params.back}, forward ${params.forward}, back ${params.back} — the same two moves take turns forever.`,
      note_id: `Maju ${params.forward}, mundur ${params.back}, maju ${params.forward}, mundur ${params.back} — dua gerakan itu bergantian terus.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: `the chair number after each pass`,
      phrase_id: `nomor kursi setelah setiap operan`,
      note_en: `One number per pass. So the ${params.ask === 'the-term' ? ordinal(params.targetIndex as number) : 'nth'} number in the list means the chair after that many passes.`,
      note_id: `Satu bilangan untuk satu operan. Jadi bilangan ke-${params.ask === 'the-term' ? params.targetIndex : 'n'} berarti kursi setelah sebanyak itu operan.`,
    })
  }

  highlights.push({
    category: 'question',
    phrase_en: question.en,
    phrase_id: question.id,
    note_en:
      params.ask === 'the-term'
        ? `Far too many to write out one by one — find the block that repeats and count with a remainder instead.`
        : `One block means one full repeat, not the first ${len} numbers of the list. Find where the repeat really starts first.`,
    note_id:
      params.ask === 'the-term'
        ? `Terlalu banyak untuk ditulis satu per satu — cari blok yang berulang, lalu hitung pakai sisa pembagian.`
        : `Satu blok berarti satu pengulangan penuh, bukan ${len} bilangan pertama daftar. Cari dulu dari mana pengulangannya benar-benar mulai.`,
  })

  const quantities: BreakdownQuantity[] = [
    {
      label_en: 'The list, written out',
      label_id: 'Daftarnya, ditulis',
      value: `${terms.slice(0, stripLength(s)).join(', ')}, …`,
    },
    { label_en: 'Run-up numbers (never come back)', label_id: 'Bilangan awalan (tidak kembali)', value: tail === 0 ? '-' : runUp },
    { label_en: 'The repeating block', label_id: 'Blok yang berulang', value: block },
    { label_en: 'Block length', label_id: 'Panjang blok', value: String(len) },
  ]
  if (params.ask === 'the-term') {
    quantities.push({
      label_en: 'Numbers asked for, minus the run-up',
      label_id: 'Nomor suku dikurangi bilangan awalan',
      value: `${params.targetIndex} − ${tail} = ${s.stepsInsideBlock}`,
    })
    quantities.push({
      label_en: 'Divided by the block length',
      label_id: 'Dibagi panjang blok',
      value: `${s.stepsInsideBlock} : ${len} = ${s.quotient}`,
    })
    quantities.push({ label_en: 'Remainder', label_id: 'Sisa', value: String(s.remainder) })
    quantities.push({ label_en: 'Slot inside the block', label_id: 'Posisi di dalam blok', value: String(s.slot) })
  } else {
    quantities.push({
      label_en: 'One block added up',
      label_id: 'Satu blok dijumlahkan',
      value: `${cycleTerms.join(' + ')} = ${s.cycleSum}`,
    })
  }
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: s.answer })

  // The one misconception this concept exists to kill: assuming the list cycles
  // from the very first number, so the run-up gets counted as part of the block.
  // Only a real run-up can produce it — with none, there is nothing to trip over.
  let trap: BreakdownTrap | null = null
  if (tail > 0 && s.trapValue !== null && String(s.trapValue) !== s.answer) {
    trap =
      params.ask === 'the-term'
        ? {
            wrong: String(s.trapValue),
            why_en: `Dividing ${params.targetIndex} by ${len} straight away gives ${s.trapValue}, but that pretends the list repeats from the very first number. ${
              tail === 1 ? `The very first number (${runUp}) never comes back` : `The first ${tail} numbers (${runUp}) never come back`
            }, so they are not in the block. Take them off first: ${params.targetIndex} − ${tail} = ${s.stepsInsideBlock}, and ${s.stepsInsideBlock} ÷ ${len} leaves ${s.remainder}, which lands on ${s.targetTerm}.`,
            why_id: `Langsung membagi ${params.targetIndex} dengan ${len} memberi ${s.trapValue}, padahal itu menganggap daftarnya berulang sejak bilangan pertama. ${
              tail === 1 ? `Bilangan pertama (${runUp})` : `${tail} bilangan pertama (${runUp})`
            } tidak pernah kembali, jadi tidak ikut ke dalam blok. Kurangi dulu: ${params.targetIndex} − ${tail} = ${s.stepsInsideBlock}, lalu ${s.stepsInsideBlock} : ${len} bersisa ${s.remainder}, dan itu jatuh di ${s.targetTerm}.`,
          }
        : {
            wrong: String(s.trapValue),
            why_en: `Adding the first ${len} numbers of the list gives ${s.trapValue}, but those still include the run-up (${runUp}), which never comes back. The block that really repeats is ${block}, and it adds up to ${s.cycleSum}.`,
            why_id: `Menjumlahkan ${len} bilangan pertama daftar memberi ${s.trapValue}, padahal itu masih memuat bilangan awalan (${runUp}) yang tidak pernah kembali. Blok yang benar-benar berulang adalah ${block}, dan jumlahnya ${s.cycleSum}.`,
          }
  }

  return {
    // The strip of numbers with its repeating block ringed lives in the
    // post-answer explainer; the question itself is a couple of lines of text
    // and reads fine unaided.
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'iterated-rule-far-term',
      name_en: 'Find where the block starts repeating, then use the remainder',
      name_id: 'Cari dari mana blok mulai berulang, lalu pakai sisa pembagian',
    },
    trap,
    answer: { form: 'number', unit: null, value: s.answer },
    vocab: [],
  }
}
