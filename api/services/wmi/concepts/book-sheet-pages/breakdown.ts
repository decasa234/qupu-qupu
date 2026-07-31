import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import { derive, ordinalEn, type Params } from './index.js'

// Authored decomposition of a sheet-and-page problem. One idea sits under all
// four ask forms: a two-sided sheet k carries page 2k − 1 on its front and page
// 2k on its back, so odd pages are fronts and even pages are backs.
//
// Every highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes the "Find:" / "Cari:" markers), so the phrases
// below are built from the same params the body is built from. The stems also
// keep their worked example down at pages 1-4 / sheets 1-3 while the generator
// only ever names a page ≥ 5 or a sheet ≥ 4, so no phrase can light up twice.
export function buildBookSheetPagesBreakdown(params: Params): Breakdown {
  const { ask, name, sided, sheets, page, side } = params
  const d = derive(params)

  let highlights: BreakdownHighlight[]
  let quantities: BreakdownQuantity[]
  let strategy: Breakdown['strategy']
  let trap: BreakdownTrap

  // The relation itself, shown on every ask so the brief always states the rule
  // the answer came from rather than the arithmetic that happened to work.
  const rule: BreakdownQuantity = {
    label_en: 'Sheet n holds pages',
    label_id: 'Lembar ke-n memuat halaman',
    value: sided === 'two' ? '2×n − 1 (front) and 2×n (back)' : 'n (front only)',
  }

  if (ask === 'pages-from-sheets') {
    const twoSided = sided === 'two'

    highlights = [
      {
        category: 'fact',
        phrase_en: twoSided
          ? `${sheets} two-sided pieces of paper`
          : `${sheets} one-sided pieces of paper`,
        phrase_id: twoSided
          ? `${sheets} lembar kertas bolak-balik`
          : `${sheets} lembar kertas satu sisi`,
        note_en: `The story counts SHEETS, not pages — ${sheets} of them.`,
        note_id: `Yang dihitung cerita ini LEMBAR, bukan halaman — ada ${sheets}.`,
      },
      {
        category: 'condition',
        phrase_en: twoSided
          ? `Each piece of paper has 2 pages`
          : `printed on the front only, so it holds just 1 page`,
        phrase_id: twoSided
          ? `Setiap lembar kertas memuat 2 halaman`
          : `hanya dicetak di sisi depan, jadi memuat 1 halaman saja`,
        note_en: twoSided
          ? `Sheet 1 holds pages 1 and 2, sheet 2 holds 3 and 4, so sheet ${sheets} holds ${d.frontPage} and ${d.backPage}.`
          : `The back is never printed, so sheet 1 holds page 1 and sheet ${sheets} holds page ${sheets}.`,
        note_id: twoSided
          ? `Lembar ke-1 memuat halaman 1 dan 2, lembar ke-2 memuat 3 dan 4, jadi lembar ke-${sheets} memuat ${d.frontPage} dan ${d.backPage}.`
          : `Belakangnya tidak pernah dicetak, jadi lembar ke-1 memuat halaman 1 dan lembar ke-${sheets} memuat halaman ${sheets}.`,
      },
      {
        category: 'question',
        phrase_en: `How many pages are there in total?`,
        phrase_id: `Ada berapa halaman seluruhnya?`,
        note_en: `The last sheet ends on page ${d.totalPages}, and no number is skipped, so that is the page count.`,
        note_id: `Lembar terakhir berhenti di halaman ${d.totalPages}, dan tidak ada nomor yang dilewat, jadi itulah banyak halamannya.`,
      },
    ]

    quantities = [
      { label_en: 'Sheets used', label_id: 'Lembar yang dipakai', value: String(sheets) },
      {
        label_en: 'Pages per sheet',
        label_id: 'Halaman per lembar',
        value: String(d.perSheet),
      },
      rule,
      {
        label_en: `Last sheet (sheet ${sheets}) holds`,
        label_id: `Lembar terakhir (lembar ke-${sheets}) memuat`,
        value: d.onSheet.join(', '),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: d.answer },
    ]

    strategy = {
      conceptSlug: 'book-sheet-pages',
      name_en: twoSided ? 'Two pages per sheet' : 'One page per sheet',
      name_id: twoSided ? 'Dua halaman tiap lembar' : 'Satu halaman tiap lembar',
    }

    trap = twoSided
      ? {
          wrong: String(sheets),
          why_en: `${sheets} counts the sheets, not the pages. Each sheet also has a back, so sheet ${sheets} reaches page ${d.backPage}, not page ${sheets}.`,
          why_id: `${sheets} itu banyak lembar, bukan halaman. Setiap lembar juga punya belakang, jadi lembar ke-${sheets} sampai halaman ${d.backPage}, bukan halaman ${sheets}.`,
        }
      : {
          wrong: String(2 * sheets),
          why_en: `Doubling is the two-sided answer. This machine leaves every back blank, so sheet ${sheets} still only reaches page ${sheets}.`,
          why_id: `Dikali 2 itu jawaban untuk cetakan bolak-balik. Mesin ini membiarkan setiap belakang kosong, jadi lembar ke-${sheets} tetap hanya sampai halaman ${sheets}.`,
        }
  } else if (ask === 'sheets-from-pages') {
    const twoSided = sided === 'two'
    const pages = d.totalPages

    highlights = [
      {
        category: 'fact',
        phrase_en: `${pages} pages`,
        phrase_id: `${pages} halaman`,
        note_en: `There are ${pages} page numbers to fit onto sheets.`,
        note_id: `Ada ${pages} nomor halaman yang harus muat di lembar-lembar kertas.`,
      },
      {
        category: 'condition',
        phrase_en: twoSided
          ? `each piece of paper holds 2 pages`
          : `each piece of paper holds just 1 page`,
        phrase_id: twoSided
          ? `setiap lembar kertas memuat 2 halaman`
          : `setiap lembar kertas memuat 1 halaman saja`,
        note_en: twoSided
          ? `Pages pair up: (1, 2) on sheet 1, (3, 4) on sheet 2, and the last pair is (${pages - 1}, ${pages}).`
          : `Nothing pairs up — page 1 on sheet 1, page 2 on sheet 2, page ${pages} on sheet ${pages}.`,
        note_id: twoSided
          ? `Halaman berpasangan: (1, 2) di lembar ke-1, (3, 4) di lembar ke-2, dan pasangan terakhir (${pages - 1}, ${pages}).`
          : `Tidak ada yang berpasangan — halaman 1 di lembar ke-1, halaman 2 di lembar ke-2, halaman ${pages} di lembar ke-${pages}.`,
      },
      {
        category: 'question',
        phrase_en: `How many pieces of paper does ${name} need?`,
        phrase_id: `Berapa lembar kertas yang ${name} butuhkan?`,
        note_en: twoSided
          ? `Count the pairs, not the pages: ${pages} ÷ 2 = ${d.answer}.`
          : `Every page needs its own sheet, so the count stays ${d.answer}.`,
        note_id: twoSided
          ? `Hitung pasangannya, bukan halamannya: ${pages} ÷ 2 = ${d.answer}.`
          : `Setiap halaman butuh lembar sendiri, jadi jumlahnya tetap ${d.answer}.`,
      },
    ]

    quantities = [
      { label_en: 'Pages to print', label_id: 'Halaman yang dicetak', value: String(pages) },
      { label_en: 'Pages per sheet', label_id: 'Halaman per lembar', value: String(d.perSheet) },
      rule,
      {
        label_en: 'Last sheet holds',
        label_id: 'Lembar terakhir memuat',
        value: twoSided ? `${pages - 1}, ${pages}` : String(pages),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: d.answer },
    ]

    strategy = {
      conceptSlug: 'book-sheet-pages',
      name_en: twoSided ? 'Pair the pages onto sheets' : 'One page, one sheet',
      name_id: twoSided ? 'Pasangkan halaman ke lembar' : 'Satu halaman, satu lembar',
    }

    trap = twoSided
      ? {
          wrong: String(pages),
          why_en: `${pages} would be right only if each page had its own sheet. Here pages ${pages - 1} and ${pages} share one sheet, and so does every earlier pair.`,
          why_id: `${pages} baru benar kalau tiap halaman punya lembar sendiri. Di sini halaman ${pages - 1} dan ${pages} berbagi satu lembar, begitu juga semua pasangan sebelumnya.`,
        }
      : pages % 2 === 0
        ? {
            wrong: String(pages / 2),
            why_en: `Halving is the two-sided answer. With one side printed, page ${pages - 1} and page ${pages} cannot share a sheet, so nothing halves.`,
            why_id: `Dibagi 2 itu jawaban untuk cetakan bolak-balik. Karena hanya satu sisi dicetak, halaman ${pages - 1} dan ${pages} tidak bisa satu lembar, jadi tidak ada yang dibagi.`,
          }
        : null
  } else if (ask === 'which-page-shares-the-sheet') {
    highlights = [
      {
        category: 'fact',
        phrase_en: `Each piece of paper holds 2 pages`,
        phrase_id: `Setiap lembar kertas memuat 2 halaman`,
        note_en: `Two page numbers per sheet, never one and never three.`,
        note_id: `Dua nomor halaman tiap lembar, tidak pernah satu atau tiga.`,
      },
      {
        category: 'condition',
        phrase_en: `an odd page on the front and the next even page on the back`,
        phrase_id: `halaman ganjil di depan dan halaman genap sesudahnya di belakang`,
        note_en: `So the sheets are (1, 2), (3, 4), (5, 6), … — an odd number always paired with the even number just after it.`,
        note_id: `Jadi lembarnya (1, 2), (3, 4), (5, 6), … — bilangan ganjil selalu berpasangan dengan bilangan genap tepat sesudahnya.`,
      },
      {
        category: 'object',
        phrase_en: `page ${page}`,
        phrase_id: `halaman ${page}`,
        note_en: d.givenIsFront
          ? `${page} is odd, so it is a FRONT — its sheet is (${page}, ${d.partnerPage}).`
          : `${page} is even, so it is a BACK — its sheet is (${d.partnerPage}, ${page}).`,
        note_id: d.givenIsFront
          ? `${page} itu ganjil, jadi ini sisi DEPAN — lembarnya (${page}, ${d.partnerPage}).`
          : `${page} itu genap, jadi ini sisi BELAKANG — lembarnya (${d.partnerPage}, ${page}).`,
      },
      {
        category: 'question',
        phrase_en: `Which page number is printed on the other side of that same piece of paper?`,
        phrase_id: `Halaman berapa yang tercetak di sisi sebaliknya pada lembar yang sama?`,
        note_en: d.givenIsFront
          ? `The other side is the back: ${page} + 1 = ${d.partnerPage}.`
          : `The other side is the front: ${page} − 1 = ${d.partnerPage}.`,
        note_id: d.givenIsFront
          ? `Sisi sebaliknya adalah belakang: ${page} + 1 = ${d.partnerPage}.`
          : `Sisi sebaliknya adalah depan: ${page} − 1 = ${d.partnerPage}.`,
      },
    ]

    quantities = [
      { label_en: 'Page given', label_id: 'Halaman yang diketahui', value: String(page) },
      {
        label_en: 'Odd or even',
        label_id: 'Ganjil atau genap',
        value: d.givenIsFront ? 'odd → front' : 'even → back',
      },
      rule,
      {
        label_en: 'Its sheet holds',
        label_id: 'Lembarnya memuat',
        value: d.givenIsFront ? `${page}, ${d.partnerPage}` : `${d.partnerPage}, ${page}`,
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: d.answer },
    ]

    strategy = {
      conceptSlug: 'book-sheet-pages',
      name_en: 'Odd is the front, even is the back',
      name_id: 'Ganjil di depan, genap di belakang',
    }

    trap = {
      wrong: String(d.givenIsFront ? page - 1 : page + 1),
      why_en: d.givenIsFront
        ? `${page - 1} is on the sheet BEFORE this one. ${page} is odd, so it starts a new sheet and its partner comes after it: ${d.partnerPage}.`
        : `${page + 1} is on the sheet AFTER this one. ${page} is even, so it ends its sheet and its partner comes before it: ${d.partnerPage}.`,
      why_id: d.givenIsFront
        ? `${page - 1} ada di lembar SEBELUMNYA. ${page} itu ganjil, jadi ia memulai lembar baru dan pasangannya ada sesudahnya: ${d.partnerPage}.`
        : `${page + 1} ada di lembar SESUDAHNYA. ${page} itu genap, jadi ia menutup lembarnya dan pasangannya ada sebelumnya: ${d.partnerPage}.`,
    }
  } else {
    const ord = ordinalEn(sheets)
    const sideEn = side === 'back' ? 'back' : 'front'
    const sideId = side === 'back' ? 'belakang' : 'depan'
    const wanted = side === 'back' ? d.backPage : d.frontPage
    const other = side === 'back' ? d.frontPage : d.backPage

    highlights = [
      {
        category: 'fact',
        phrase_en: `Each piece of paper takes 2 page numbers`,
        phrase_id: `Setiap lembar kertas memakai 2 nomor halaman`,
        note_en: `So ${sheets} sheets use up ${sheets} × 2 = ${d.backPage} numbers.`,
        note_id: `Jadi ${sheets} lembar menghabiskan ${sheets} × 2 = ${d.backPage} nomor.`,
      },
      {
        category: 'condition',
        phrase_en: `the 1st piece of paper holds pages 1 and 2, the 2nd holds pages 3 and 4`,
        phrase_id: `lembar ke-1 memuat halaman 1 dan 2, lembar ke-2 memuat halaman 3 dan 4`,
        note_en: `Keep the pattern going: sheet n holds pages 2×n − 1 and 2×n.`,
        note_id: `Teruskan polanya: lembar ke-n memuat halaman 2×n − 1 dan 2×n.`,
      },
      {
        category: 'question',
        phrase_en: `Which page number is on the ${sideEn} of the ${ord} piece of paper?`,
        phrase_id: `Halaman berapa yang ada di sisi ${sideId} lembar ke-${sheets}?`,
        note_en: `Sheet ${sheets} holds pages ${d.frontPage} and ${d.backPage}; the ${sideEn} one is ${wanted}.`,
        note_id: `Lembar ke-${sheets} memuat halaman ${d.frontPage} dan ${d.backPage}; yang di ${sideId} adalah ${wanted}.`,
      },
    ]

    quantities = [
      { label_en: 'Sheet asked about', label_id: 'Lembar yang ditanya', value: String(sheets) },
      rule,
      {
        label_en: `Sheet ${sheets} holds`,
        label_id: `Lembar ke-${sheets} memuat`,
        value: `${d.frontPage} (front), ${d.backPage} (back)`,
      },
      {
        label_en: 'Face asked for',
        label_id: 'Sisi yang ditanya',
        value: sideEn,
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: d.answer },
    ]

    strategy = {
      conceptSlug: 'book-sheet-pages',
      name_en: 'Sheet n holds 2n − 1 and 2n',
      name_id: 'Lembar ke-n memuat 2n − 1 dan 2n',
    }

    // The tightest trap here is the OTHER face of the very same sheet: the
    // child extends the pattern correctly but then reads the wrong side.
    trap = {
      wrong: String(other),
      why_en: `${other} is on the same sheet, but on the ${side === 'back' ? 'front' : 'back'}. The ${sideEn} of sheet ${sheets} is ${wanted}.`,
      why_id: `${other} memang ada di lembar yang sama, tetapi di sisi ${side === 'back' ? 'depan' : 'belakang'}. Sisi ${sideId} lembar ke-${sheets} adalah ${wanted}.`,
    }
  }

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy,
    trap,
    answer: { form: 'number', unit: null, value: d.answer },
    vocab: [],
  }
}
