import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { derive, type Params } from './index.js'

// Authored decomposition of a pieces-fill-region problem. The whole question
// turns on two words a child skims past — "turned" and "NOT flipped" — so those
// two spans are highlighted separately: one is the permission, the other is the
// ban, and mixing them up is the entire trap.
//
// Every highlight phrase MUST be an exact substring of the DISPLAY body (the
// body after stripSectionLabels drops "Cari:" / "Find:" and collapses runs of
// whitespace), so each phrase below is built from the same params the body is.
export function buildPiecesFillRegionBreakdown(params: Params): Breakdown {
  const d = derive(params)
  const pair = d.ask === 'pair-of-pieces'

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `one empty hole of ${d.n} squares`,
      phrase_id: `satu lubang kosong berisi ${d.n} kotak`,
      note_en: `This is the gap to fill. Count its squares first — any choice with a different number is out straight away.`,
      note_id: `Ini lubang yang harus diisi. Hitung dulu kotaknya — pilihan dengan jumlah kotak berbeda langsung gugur.`,
    },
  ]

  if (pair) {
    highlights.push({
      category: 'condition',
      phrase_en: `with no gap and no overlap`,
      phrase_id: `tanpa celah dan tanpa bertumpuk`,
      note_en: `The two pieces must add up to exactly ${d.n} squares: ${d.n - 1} would leave a gap and ${d.n + 1} would stack.`,
      note_id: `Dua kepingan itu harus berjumlah tepat ${d.n} kotak: ${d.n - 1} menyisakan celah, ${d.n + 1} pasti bertumpuk.`,
    })
  }

  highlights.push(
    {
      category: 'fact',
      phrase_en: `may be turned to any angle`,
      phrase_id: `boleh diputar ke segala arah`,
      note_en: `So try every piece in all four turns before you say it does not fit. Turning never changes how many squares a piece has, or how long its longest straight line is.`,
      note_id: `Jadi coba tiap kepingan dalam keempat putaran sebelum bilang tidak muat. Memutar tidak mengubah jumlah kotak, juga tidak mengubah panjang garis lurusnya.`,
    },
    {
      category: 'condition',
      phrase_en: `must NOT be flipped over`,
      phrase_id: `TIDAK boleh dibalik`,
      note_en: `This is the trap. A mirror-image piece has exactly the right squares and still never goes in, because turning cannot swap a left corner for a right one.`,
      note_id: `Ini jebakannya. Kepingan bayangan cermin punya kotak yang persis sama tetapi tetap tidak pernah masuk, karena memutar tidak bisa menukar tekukan kiri jadi kanan.`,
    },
    {
      category: 'question',
      phrase_en: `Which ${pair ? 'pair' : 'piece'} — A, B, C, or D — fills the hole exactly?`,
      phrase_id: `${pair ? 'Pasangan' : 'Kepingan'} mana — A, B, C, atau D — yang pas mengisi lubang itu?`,
      note_en: `Rule the wrong ones out: first by square count, then by longest straight line, then by which way the corner turns.`,
      note_id: `Gugurkan yang salah satu per satu: mulai dari jumlah kotak, lalu garis lurus terpanjang, lalu arah tekukannya.`,
    },
  )

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Squares in the hole', label_id: 'Kotak di lubang', value: String(d.n) },
    {
      label_en: 'Longest straight line in the hole',
      label_id: 'Garis lurus terpanjang di lubang',
      value: String(d.holeRun),
    },
    {
      label_en: 'Squares per choice',
      label_id: 'Kotak tiap pilihan',
      value: d.options.map((o) => `${o.label} ${o.squares}`).join(', '),
    },
    {
      label_en: 'Longest line per choice',
      label_id: 'Garis terpanjang tiap pilihan',
      value: d.options.map((o) => `${o.label} ${o.run}`).join(', '),
    },
    { label_en: 'Squares on the board', label_id: 'Kotak di papan', value: String(d.boardSquares) },
    { label_en: 'Answer', label_id: 'Jawaban', value: d.answerLabel },
  ]

  // The mirror option is the one genuinely tempting wrong answer here: it has
  // the right squares, the right straight lines, and it is still unreachable.
  const fl = d.flipLoser
  const trap = fl
    ? {
        wrong: fl.label,
        why_en: `${fl.label} holds the same ${d.n} squares as ${d.answerLabel}, but it is the mirror image. Turned once, twice, three times, four — its corner never comes round to the other side, so squares always poke out of the hole.`,
        why_id: `${fl.label} punya ${d.n} kotak yang sama dengan ${d.answerLabel}, tetapi bentuknya bayangan cermin. Diputar sekali, dua kali, tiga, empat — tekukannya tidak pernah pindah sisi, jadi selalu ada kotak yang menonjol keluar lubang.`,
      }
    : null

  return {
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'pieces-fill-region',
      name_en: 'Count the squares, then turn — never flip',
      name_id: 'Hitung kotaknya, lalu putar — jangan dibalik',
    },
    trap,
    answer: { form: 'choice', unit: null, value: d.answerLabel },
    vocab: [],
  }
}
