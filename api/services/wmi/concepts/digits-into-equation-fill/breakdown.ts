import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { analyse, cardList, FRAME, type Params } from './index.js'

// Authored decomposition of a "put the cards in the boxes" problem. One idea
// carries all four asks: you never guess an arrangement, you read ONE column (or
// one divisor, or one place value) and let it rule arrangements out.
//
// Every phrase below is assembled from the very same params the body is
// assembled from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildDigitsIntoEquationFillBreakdown(params: Params): Breakdown {
  const a = analyse(params)
  const frame = FRAME[params.skeleton]
  const listEn = cardList(params.cards, 'en')
  const listId = cardList(params.cards, 'id')
  const boxes = params.cards.length

  const highlights: BreakdownHighlight[] = []
  const quantities: BreakdownQuantity[] = []

  if (params.ask === 'the-result') {
    const winner = a.winner!
    const sol = winner.solutions[0]
    const addendTens = winner.leftover.filter((c) => c !== sol.e)
    // □□ + □ has a single tens card among the addends, □□ + □□ has two; saying
    // "8 = 8" instead of "the tens just stay 8" would read like a typo.
    const noCarryTens_en =
      addendTens.length === 1
        ? `the tens would just stay ${addendTens[0]}`
        : `the tens would read ${addendTens.join(' + ')} = ${addendTens.reduce((s, c) => s + c, 0)}`
    const noCarryTens_id =
      addendTens.length === 1
        ? `puluhannya tetap ${addendTens[0]}`
        : `puluhannya jadi ${addendTens.join(' + ')} = ${addendTens.reduce((s, c) => s + c, 0)}`
    highlights.push(
      {
        category: 'object',
        phrase_en: `The digit cards are ${listEn}`,
        phrase_id: `Kartu angkanya ${listId}`,
        note_en: `${boxes} cards for ${boxes} boxes. Nothing else may be written down — every digit in the finished sum is one of these.`,
        note_id: `${boxes} kartu untuk ${boxes} kotak. Tidak ada angka lain — semua angka pada penjumlahan jadinya berasal dari kartu ini.`,
      },
      {
        category: 'fact',
        phrase_en: frame,
        phrase_id: frame,
        note_en: `The boxes stand in columns. The two right-hand boxes are the units column, and the digit written there has to be a card as well.`,
        note_id: `Kotak-kotaknya berdiri dalam kolom. Dua kotak paling kanan adalah kolom satuan, dan angka yang ditulis di situ juga harus berupa kartu.`,
      },
      {
        category: 'condition',
        phrase_en: 'so the equation is true',
        phrase_id: 'supaya persamaannya benar',
        note_en: `Both columns have to work at once: the units column with its carry, and then the tens column.`,
        note_id: `Dua kolom harus benar sekaligus: kolom satuan beserta simpanannya, lalu kolom puluhan.`,
      },
      {
        category: 'condition',
        phrase_en: 'using each card exactly once',
        phrase_id: 'setiap kartu dipakai tepat satu kali',
        note_en: `No card is left over and none is reused, so once two cards meet in the units column the rest are forced to be the tens.`,
        note_id: `Tidak ada kartu yang tersisa atau dipakai dua kali, jadi begitu dua kartu bertemu di kolom satuan, sisanya pasti jadi puluhan.`,
      },
      {
        category: 'question',
        phrase_en: 'What number ends up in the two answer boxes?',
        phrase_id: 'Berapa bilangan yang ada di dua kotak hasil?',
        note_en: `Only the number after the = sign is wanted, and it comes out the same (${a.answer}) however you arrange the addends.`,
        note_id: `Yang diminta cuma bilangan setelah tanda =, dan hasilnya sama saja (${a.answer}) bagaimanapun penjumlahnya disusun.`,
      },
    )
    quantities.push(
      { label_en: 'Cards', label_id: 'Kartu', value: params.cards.join(', ') },
      {
        label_en: 'Units column',
        label_id: 'Kolom satuan',
        value: `${winner.p} + ${winner.q} = ${winner.sum}`,
      },
      { label_en: 'Carried', label_id: 'Simpanan', value: String(winner.carry) },
      {
        label_en: 'Tens cards left',
        label_id: 'Kartu puluhan tersisa',
        value: winner.leftover.join(', '),
      },
      {
        label_en: "Answer's tens",
        label_id: 'Puluhan hasil',
        value: `(${winner.leftoverSum} + ${winner.carry}) ÷ 2 = ${sol.e}`,
      },
      {
        label_en: 'The sum',
        label_id: 'Penjumlahannya',
        value: `${10 * sol.a + sol.b} + ${sol.d === null ? sol.c : 10 * sol.c + sol.d} = ${sol.result}`,
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: a.answer },
    )

    return {
      needsVisual: false,
      highlights,
      quantities,
      strategy: {
        conceptSlug: 'digits-into-equation-fill',
        name_en: 'Read the units column, then let the tens cards decide',
        name_id: 'Baca kolom satuan, lalu biarkan kartu puluhan yang memutuskan',
      },
      trap: {
        wrong: String(a.trapValue),
        why_en: `${winner.p} + ${winner.q} = ${winner.sum} spills over ten, so a 1 is carried into the tens column. Drop that carry and ${noCarryTens_en} instead of ${sol.e}, and the answer comes out 10 too small: ${a.trapValue} instead of ${a.answer}.`,
        why_id: `${winner.p} + ${winner.q} = ${winner.sum} melewati sepuluh, jadi ada simpanan 1 yang naik ke kolom puluhan. Kalau simpanan itu lupa, ${noCarryTens_id}, bukan ${sol.e}, dan jawabannya kurang 10: ${a.trapValue}, bukan ${a.answer}.`,
      },
      answer: { form: 'number', unit: null, value: a.answer },
      vocab: [],
    }
  }

  if (params.ask === 'largest-quotient') {
    const best = a.bestProbe!.best!
    highlights.push(
      {
        category: 'object',
        phrase_en: `The digit cards are ${listEn}`,
        phrase_id: `Kartu angkanya ${listId}`,
        note_en: `Four cards for four boxes: three of them build the number on top, and the one left over is the divisor.`,
        note_id: `Empat kartu untuk empat kotak: tiga jadi bilangan di atas, dan satu sisanya jadi pembagi.`,
      },
      {
        category: 'fact',
        phrase_en: frame,
        phrase_id: frame,
        note_en: `Choosing which card is the divisor is the real decision — it changes both the divisor and which digits are left for the top.`,
        note_id: `Memilih kartu mana yang jadi pembagi itu keputusan utamanya — itu mengubah pembaginya sekaligus angka apa saja yang tersisa untuk bilangan atas.`,
      },
      {
        category: 'condition',
        phrase_en: 'the division comes out exactly, with nothing left over',
        phrase_id: 'pembagiannya habis, tanpa sisa',
        note_en: `This is the rule that kills the greedy answer. A big top number that leaves a remainder is simply not allowed.`,
        note_id: `Aturan inilah yang mematikan jawaban asal-comot. Bilangan atas yang besar tapi bersisa tidak boleh dipakai.`,
      },
      {
        category: 'condition',
        phrase_en: 'Each card is used exactly once',
        phrase_id: 'Setiap kartu dipakai tepat satu kali',
        note_en: `All four cards go in, so picking the divisor already decides which three digits are left for the top number.`,
        note_id: `Keempat kartu masuk semua, jadi begitu pembaginya dipilih, tiga angka untuk bilangan atas otomatis sudah ditentukan.`,
      },
      {
        category: 'question',
        phrase_en: 'What is the largest quotient you can make?',
        phrase_id: 'Berapa hasil bagi terbesar yang bisa dibuat?',
        note_en: `The answer is the biggest number that can sit after the = sign, not the biggest number on top.`,
        note_id: `Yang ditanya bilangan terbesar yang bisa jadi hasil baginya, bukan bilangan atas yang terbesar.`,
      },
    )
    quantities.push(
      { label_en: 'Cards', label_id: 'Kartu', value: params.cards.join(', ') },
      {
        label_en: 'Best per divisor',
        label_id: 'Terbaik tiap pembagi',
        value: a.probes
          .map((p) => (p.best ? `${p.divisor}: ${p.best.quotient}` : `${p.divisor}: —`))
          .join(', '),
      },
      {
        label_en: 'Winning division',
        label_id: 'Pembagian pemenang',
        value: `${best.dividend} ÷ ${best.divisor} = ${best.quotient}`,
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: a.answer },
    )

    return {
      needsVisual: false,
      highlights,
      quantities,
      strategy: {
        conceptSlug: 'digits-into-equation-fill',
        name_en: 'Try every card as the divisor, keep only exact divisions',
        name_id: 'Coba tiap kartu jadi pembagi, ambil yang habis dibagi saja',
      },
      trap: {
        wrong: String(a.trapValue),
        why_en: `Grabbing the biggest possible top number over the smallest card gives about ${a.trapValue}, but that division leaves a remainder, so the arrangement is not even legal. The biggest LEGAL division is ${best.dividend} ÷ ${best.divisor} = ${best.quotient}.`,
        why_id: `Mengambil bilangan atas sebesar mungkin dibagi kartu terkecil memberi sekitar ${a.trapValue}, padahal pembagian itu bersisa, jadi susunannya tidak sah sama sekali. Pembagian sah yang terbesar adalah ${best.dividend} ÷ ${best.divisor} = ${best.quotient}.`,
      },
      answer: { form: 'number', unit: null, value: a.answer },
      vocab: [],
    }
  }

  if (params.ask === 'minimise-largest-term') {
    const total = params.total as number
    const winner = a.options[0]
    const sigma = params.cards.reduce((s, c) => s + c, 0)
    highlights.push(
      {
        category: 'object',
        phrase_en: `The digit cards are ${listEn}`,
        phrase_id: `Kartu angkanya ${listId}`,
        note_en: `Six cards, six boxes. Three of them will stand in tens boxes and three in units boxes — that split is the whole puzzle.`,
        note_id: `Enam kartu, enam kotak. Tiga akan berdiri di kotak puluhan dan tiga di kotak satuan — pembagian itulah inti soalnya.`,
      },
      {
        category: 'fact',
        phrase_en: frame,
        phrase_id: frame,
        note_en: `A card in a tens box counts ten times, in a units box only once. Same card, very different weight.`,
        note_id: `Kartu di kotak puluhan bernilai sepuluh kali, di kotak satuan cuma satu kali. Kartu yang sama, bobotnya jauh berbeda.`,
      },
      {
        category: 'condition',
        phrase_en: `add up to ${total}`,
        phrase_id: `berjumlah ${total}`,
        note_en: `All six cards add to ${sigma}, so ${total} = 9 × (the tens cards) + ${sigma}. That pins the tens cards to ${a.tensSum}.`,
        note_id: `Semua kartu berjumlah ${sigma}, jadi ${total} = 9 × (kartu puluhan) + ${sigma}. Itu memaku jumlah kartu puluhan di ${a.tensSum}.`,
      },
      {
        category: 'condition',
        phrase_en: 'Each card is used exactly once',
        phrase_id: 'Setiap kartu dipakai tepat satu kali',
        note_en: `Choosing the three tens cards automatically chooses the three units cards — there is nothing left to decide after that except the pairing.`,
        note_id: `Memilih tiga kartu puluhan otomatis memilih tiga kartu satuan — setelah itu tinggal memasangkannya saja.`,
      },
      {
        category: 'question',
        phrase_en: 'If the largest of the three numbers is made as small as possible, what is that largest number?',
        phrase_id: 'Kalau bilangan terbesar di antara ketiganya dibuat sekecil mungkin, berapa bilangan terbesar itu?',
        note_en: `Not the total and not the smallest number: the biggest of the three, squeezed down as far as it will go (${a.answer}).`,
        note_id: `Bukan totalnya dan bukan bilangan terkecil: yang ditanya bilangan terbesar dari ketiganya, ditekan serendah mungkin (${a.answer}).`,
      },
    )
    quantities.push(
      { label_en: 'Cards', label_id: 'Kartu', value: params.cards.join(', ') },
      { label_en: 'All cards added', label_id: 'Jumlah semua kartu', value: String(sigma) },
      {
        label_en: 'Tens cards must add to',
        label_id: 'Kartu puluhan harus berjumlah',
        value: `(${total} − ${sigma}) ÷ 9 = ${a.tensSum}`,
      },
      {
        label_en: 'Possible tens sets',
        label_id: 'Kemungkinan kartu puluhan',
        value: a.options.map((o) => o.tens.join('+')).join(', '),
      },
      {
        label_en: 'Best arrangement',
        label_id: 'Susunan terbaik',
        value: `${winner.numbers.join(' + ')} = ${total}`,
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: a.answer },
    )

    return {
      needsVisual: false,
      highlights,
      quantities,
      strategy: {
        conceptSlug: 'digits-into-equation-fill',
        name_en: 'The tens cards are pinned by the total; then starve the biggest one',
        name_id: 'Total memaku kartu puluhan; lalu kartu puluhan terbesar diberi satuan terkecil',
      },
      trap: {
        wrong: String(a.trapValue),
        why_en: `With the right tens cards ${winner.tens.join(', ')} the biggest number is whichever one holds ${winner.tens[0]}. Hand it the leftover ${winner.units[winner.units.length - 1]} and it swells to ${a.trapValue}; hand it the smallest units card ${winner.units[0]} instead and it shrinks to ${a.answer}, and the other two numbers still fit.`,
        why_id: `Dengan kartu puluhan yang benar ${winner.tens.join(', ')}, bilangan terbesar adalah yang memegang ${winner.tens[0]}. Kalau dia diberi sisa ${winner.units[winner.units.length - 1]}, dia membengkak jadi ${a.trapValue}; kalau diberi kartu satuan terkecil ${winner.units[0]}, dia mengecil jadi ${a.answer}, dan dua bilangan lain tetap muat.`,
      },
      answer: { form: 'number', unit: null, value: a.answer },
      vocab: [],
    }
  }

  // which-card-used
  const triple = a.triple!
  const nearMiss = a.nearMisses.find((n) => n.dividend === a.trapValue) ?? null
  const max = Math.max(...params.cards)
  highlights.push(
    {
      category: 'object',
      phrase_en: `The number cards are ${listEn}`,
      phrase_id: `Kartu bilangannya ${listId}`,
      note_en: `${params.cards.length} cards on the table, but only 3 of them will be used. The rest are there to be ruled out.`,
      note_id: `Ada ${params.cards.length} kartu di meja, tapi cuma 3 yang akan terpakai. Sisanya memang untuk dicoret.`,
    },
    {
      category: 'condition',
      phrase_en: 'Choose three cards',
      phrase_id: 'Pilih tiga kartu',
      note_en: `Three boxes, three cards — a big one, the card that divides it, and the answer. All three must be on the table.`,
      note_id: `Tiga kotak, tiga kartu — satu yang besar, satu pembaginya, dan satu hasilnya. Ketiganya harus ada di meja.`,
    },
    {
      category: 'fact',
      phrase_en: frame,
      phrase_id: frame,
      note_en: `Turn the division upside down and it becomes multiplication: the two smaller cards multiplied must land exactly on the big one.`,
      note_id: `Balik pembagiannya jadi perkalian: dua kartu yang lebih kecil dikalikan harus jatuh tepat di kartu yang besar.`,
    },
    {
      category: 'condition',
      phrase_en: 'so the equation is true',
      phrase_id: 'supaya persamaannya benar',
      note_en: `Dividing exactly is not enough — the answer of the division has to be a card on the table too.`,
      note_id: `Habis dibagi saja belum cukup — hasil pembagiannya juga harus berupa kartu yang ada di meja.`,
    },
    {
      category: 'question',
      phrase_en: 'Which one of these cards is used?',
      phrase_id: 'Kartu mana yang terpakai?',
      note_en: `Find the one true equation first; the four choices only get checked against ${a.usedCards.join(', ')} afterwards.`,
      note_id: `Cari dulu satu-satunya persamaan yang benar; empat pilihan itu baru dicocokkan dengan ${a.usedCards.join(', ')} sesudahnya.`,
    },
  )
  quantities.push(
    { label_en: 'Cards', label_id: 'Kartu', value: params.cards.join(', ') },
    { label_en: 'Biggest card', label_id: 'Kartu terbesar', value: String(max) },
    {
      label_en: `Pairs whose product is at most ${max}`,
      label_id: `Pasangan yang hasil kalinya paling besar ${max}`,
      value: a.products.map((x) => `${x.x}×${x.y}=${x.product}`).join(', '),
    },
    {
      label_en: 'The one true equation',
      label_id: 'Satu-satunya persamaan benar',
      value: `${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient}`,
    },
    { label_en: 'Cards used', label_id: 'Kartu yang terpakai', value: a.usedCards.join(', ') },
    { label_en: 'Answer', label_id: 'Jawaban', value: `${a.answer} (${a.answerValue})` },
  )

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'digits-into-equation-fill',
      name_en: 'Flip the division into multiplication and sweep every pair',
      name_id: 'Balik pembagian jadi perkalian, lalu sapu semua pasangan',
    },
    trap: {
      wrong: String(a.trapValue),
      why_en: nearMiss
        ? `${a.trapValue} looks perfect because ${nearMiss.dividend} ÷ ${nearMiss.divisor} = ${nearMiss.quotient} with nothing left over — but ${nearMiss.quotient} is not on the table, so there is no card for the last box. Only ${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient} has all three numbers on cards.`
        : `${a.trapValue} is not part of any true equation: no card divides it down to another card, and it is not the answer of any division either. Only ${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient} has all three numbers on cards.`,
      why_id: nearMiss
        ? `${a.trapValue} kelihatan pas karena ${nearMiss.dividend} ÷ ${nearMiss.divisor} = ${nearMiss.quotient} tanpa sisa — tapi ${nearMiss.quotient} tidak ada di meja, jadi kotak terakhir tidak punya kartu. Hanya ${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient} yang ketiga bilangannya ada di kartu.`
        : `${a.trapValue} tidak masuk ke persamaan mana pun: tidak ada kartu yang membaginya sampai jatuh di kartu lain, dan dia juga bukan hasil bagi dari pembagian mana pun. Hanya ${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient} yang ketiga bilangannya ada di kartu.`,
    },
    answer: { form: 'choice', unit: null, value: a.answer },
    vocab: [],
  }
}
