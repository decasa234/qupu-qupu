import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildBookSheetPagesBreakdown } from './breakdown.js'

export const ASKS = [
  'pages-from-sheets',
  'sheets-from-pages',
  'which-page-shares-the-sheet',
  'page-on-the-back',
] as const
export type Ask = (typeof ASKS)[number]

/** How the copier / printer treats a sheet: one face used, or both. */
export const SIDED = ['one', 'two'] as const
export type Sided = (typeof SIDED)[number]

/** Which face of a named sheet the `page-on-the-back` ask asks about. */
export const SIDES = ['front', 'back'] as const
export type Side = (typeof SIDES)[number]

// ONE relation carries this whole concept: a two-sided sheet k holds page
// 2k − 1 on its front and page 2k on its back. Odd pages are always fronts,
// even pages are always backs. Every ask below is a different door into that
// single fact, and every answer is read back out of it — never out of a
// per-ask shortcut formula.
export function perSheetOf(sided: Sided): 1 | 2 {
  return sided === 'two' ? 2 : 1
}

/** The page numbers printed on sheet `k`. Two-sided: [2k − 1, 2k]. One-sided: [k]. */
export function pagesOnSheet(k: number, perSheet: 1 | 2): number[] {
  return perSheet === 2 ? [2 * k - 1, 2 * k] : [k]
}

/** The inverse of the same relation: the sheet that carries page `p`. */
export function sheetOfPage(p: number, perSheet: 1 | 2): number {
  return perSheet === 2 ? Math.ceil(p / 2) : p
}

const paramsSchema = z
  .object({
    ask: z.enum(ASKS),
    name: z.string().min(1),
    sided: z.enum(SIDED),
    /** The sheet the question is about (or the number of sheets in the story). */
    sheets: z.number().int().min(1).max(30),
    /** The page the story names. Always a page that really sits on `sheets`. */
    page: z.number().int().min(1).max(60),
    side: z.enum(SIDES),
    book_en: z.string().min(1),
    book_id: z.string().min(1),
  })
  // The single invariant that keeps `page` and `sheets` from ever disagreeing:
  // `page` must be a page the relation actually puts on sheet `sheets`.
  .refine((v) => sheetOfPage(v.page, perSheetOf(v.sided)) === v.sheets, {
    message: 'page must be a page number that really sits on sheet `sheets`',
  })
  .refine(
    (v) =>
      v.ask === 'pages-from-sheets' || v.ask === 'sheets-from-pages' || v.sided === 'two',
    { message: 'a one-sided sheet has no second page, so only the counting asks may be one-sided' },
  )
  // The stem works the pattern out loud for pages 1-4 / sheets 1-3. Naming a
  // page or sheet inside that worked example would highlight twice and let the
  // child read the answer straight off the example instead of extending it.
  .refine((v) => v.ask !== 'which-page-shares-the-sheet' || v.page >= 5, {
    message: 'the named page must sit past the worked example (pages 1-4)',
  })
  .refine((v) => v.ask !== 'page-on-the-back' || v.sheets >= 4, {
    message: 'the named sheet must sit past the worked example (sheets 1-3)',
  })
  .refine(
    (v) => (v.ask !== 'pages-from-sheets' && v.ask !== 'sheets-from-pages') || v.sheets >= 3,
    { message: 'the counting asks need at least 3 sheets to be worth asking' },
  )
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Lisa', 'Bagas', 'Rani', 'Dimas', 'Sari', 'Tio', 'Nabila', 'Farhan'] as const

const BOOKS = [
  { book_en: 'storybook', book_id: 'buku cerita' },
  { book_en: 'notebook', book_id: 'buku tulis' },
  { book_en: 'drawing book', book_id: 'buku gambar' },
] as const

export const meta = {
  slug: 'book-sheet-pages',
  name_en: 'Sheets and pages of a book',
  name_id: 'Lembar dan halaman buku',
  grades: [1, 2] as const,
  description_id:
    'Satu lembar kertas memuat dua halaman: halaman ganjil di depan dan halaman genap sesudahnya di belakang.',
} as const

/** 1st, 2nd, 3rd, 4th … 11th, 21st. */
export function ordinalEn(n: number): string {
  const mod100 = n % 100
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
  return `${n}${suffix}`
}

export interface Derived {
  perSheet: 1 | 2
  /** Page numbers on the sheet the question names. */
  onSheet: number[]
  /** Front / back of that sheet when it is two-sided (2k − 1 and 2k). */
  frontPage: number
  backPage: number
  /** Highest page number once `sheets` sheets are used — i.e. the page count. */
  totalPages: number
  /** `which-page-shares-the-sheet`: the page the story names and its partner. */
  givenPage: number
  givenIsFront: boolean
  partnerPage: number
  answer: string
}

// Every field is read out of pagesOnSheet / sheetOfPage, so the answer can never
// drift away from the 2k − 1 / 2k pairing the child is being taught.
export function derive(params: Params): Derived {
  const { ask, sheets, page, side, sided } = params
  const perSheet = perSheetOf(sided)

  const onSheet = pagesOnSheet(sheets, perSheet)
  const totalPages = onSheet[onSheet.length - 1]

  const pair = pagesOnSheet(sheets, 2)
  const frontPage = pair[0]
  const backPage = pair[1]

  // The page the story names sits on some sheet; its partner is the OTHER page
  // the relation puts on that same sheet.
  const givenSheet = sheetOfPage(page, 2)
  const givenPair = pagesOnSheet(givenSheet, 2)
  const givenIsFront = givenPair[0] === page
  const partnerPage = givenIsFront ? givenPair[1] : givenPair[0]

  const answer =
    ask === 'pages-from-sheets'
      ? String(totalPages)
      : ask === 'sheets-from-pages'
        ? String(sheetOfPage(totalPages, perSheet))
        : ask === 'which-page-shares-the-sheet'
          ? String(partnerPage)
          : String(side === 'back' ? backPage : frontPage)

  return {
    perSheet,
    onSheet,
    frontPage,
    backPage,
    totalPages,
    givenPage: page,
    givenIsFront,
    partnerPage,
    answer,
  }
}

export function generate(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const base = { ask, name: rng.pick(NAMES), side: rng.pick(SIDES), ...rng.pick(BOOKS) }

  if (ask === 'pages-from-sheets') {
    const sided = rng.pick(SIDED)
    const sheets = sided === 'two' ? rng.int(3, 12) : rng.int(4, 18)
    return { ...base, sided, sheets, page: perSheetOf(sided) * sheets }
  }

  if (ask === 'sheets-from-pages') {
    const sided = rng.pick(SIDED)
    const sheets = sided === 'two' ? rng.int(3, 15) : rng.int(5, 20)
    return { ...base, sided, sheets, page: perSheetOf(sided) * sheets }
  }

  if (ask === 'which-page-shares-the-sheet') {
    // Both parities are drawn straight from the range, so a child meets odd
    // (front) pages and even (back) pages about equally often. Only ever seeing
    // one parity teaches the wrong half of the rule.
    const page = rng.int(5, 40)
    return { ...base, sided: 'two', page, sheets: sheetOfPage(page, 2) }
  }

  const sheets = rng.int(4, 20)
  return { ...base, sided: 'two', page: 2 * sheets, sheets }
}

export function render(params: Params): Rendered {
  const { ask, name, sided, sheets, page, side, book_en, book_id } = params
  const d = derive(params)
  const breakdown = buildBookSheetPagesBreakdown(params)
  const common = {
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: d.answer,
    breakdown,
  }

  if (ask === 'pages-from-sheets') {
    if (sided === 'two') {
      return {
        ...common,
        body_en:
          `${name} uses a photocopier to copy ${sheets} two-sided pieces of paper. ` +
          `Each piece of paper has 2 pages: an odd page on the front and the next even page on the back.` +
          `\n\nFind: How many pages are there in total?`,
        body_id:
          `${name} memakai mesin fotokopi untuk menyalin ${sheets} lembar kertas bolak-balik. ` +
          `Setiap lembar kertas memuat 2 halaman: halaman ganjil di depan dan halaman genap sesudahnya di belakang.` +
          `\n\nCari: Ada berapa halaman seluruhnya?`,
        hint_en: `Count sheets, then remember every sheet has a back as well as a front.`,
        hint_id: `Hitung lembarnya, lalu ingat setiap lembar punya belakang, bukan cuma depan.`,
        hint_steps_en: [
          `One piece of paper has two sides, so a two-sided copy puts 2 pages on it: sheet 1 holds pages 1 and 2, sheet 2 holds pages 3 and 4.`,
          `Keep going the same way to the end of the pile: sheet ${sheets} holds pages ${d.frontPage} and ${d.backPage}.`,
          `So the page numbers run 1, 2, 3, … , ${d.backPage} with nothing skipped, which is ${d.totalPages} pages.`,
        ],
        hint_steps_id: [
          `Satu lembar kertas punya dua sisi, jadi cetakan bolak-balik memuat 2 halaman: lembar ke-1 memuat halaman 1 dan 2, lembar ke-2 memuat halaman 3 dan 4.`,
          `Teruskan dengan cara yang sama sampai lembar terakhir: lembar ke-${sheets} memuat halaman ${d.frontPage} dan ${d.backPage}.`,
          `Jadi nomor halamannya berurutan 1, 2, 3, …, ${d.backPage} tanpa ada yang terlewat, yaitu ${d.totalPages} halaman.`,
        ],
      }
    }
    return {
      ...common,
      body_en:
        `${name} uses a photocopier to copy ${sheets} one-sided pieces of paper. ` +
        `Each piece of paper is printed on the front only, so it holds just 1 page.` +
        `\n\nFind: How many pages are there in total?`,
      body_id:
        `${name} memakai mesin fotokopi untuk menyalin ${sheets} lembar kertas satu sisi. ` +
        `Setiap lembar kertas hanya dicetak di sisi depan, jadi memuat 1 halaman saja.` +
        `\n\nCari: Ada berapa halaman seluruhnya?`,
      hint_en: `Two-sided sheets hold 2 pages each, but these sheets are printed on one side only.`,
      hint_id: `Lembar bolak-balik memuat 2 halaman, tetapi lembar ini hanya dicetak satu sisi.`,
      hint_steps_en: [
        `A one-sided copy uses the front only, so a piece of paper holds 1 page, not 2: sheet 1 holds page 1, sheet 2 holds page 2.`,
        `The back stays blank every time, so the sheet number and the page number stay equal: sheet ${sheets} holds page ${sheets}.`,
        `The last page number is ${sheets}, so there are ${d.totalPages} pages — doubling would only be right if the backs were printed too.`,
      ],
      hint_steps_id: [
        `Cetakan satu sisi hanya memakai bagian depan, jadi satu lembar memuat 1 halaman, bukan 2: lembar ke-1 memuat halaman 1, lembar ke-2 memuat halaman 2.`,
        `Belakangnya selalu kosong, jadi nomor lembar dan nomor halaman tetap sama: lembar ke-${sheets} memuat halaman ${sheets}.`,
        `Nomor halaman terakhir adalah ${sheets}, jadi ada ${d.totalPages} halaman — mengalikan 2 baru benar kalau belakangnya ikut dicetak.`,
      ],
    }
  }

  if (ask === 'sheets-from-pages') {
    const pages = d.totalPages
    if (sided === 'two') {
      return {
        ...common,
        body_en:
          `${name} wants to photocopy ${pages} pages. ` +
          `The machine prints on both sides, so each piece of paper holds 2 pages: an odd page on the front and the next even page on the back.` +
          `\n\nFind: How many pieces of paper does ${name} need?`,
        body_id:
          `${name} ingin memfotokopi ${pages} halaman. ` +
          `Mesinnya mencetak bolak-balik, jadi setiap lembar kertas memuat 2 halaman: halaman ganjil di depan dan halaman genap sesudahnya di belakang.` +
          `\n\nCari: Berapa lembar kertas yang ${name} butuhkan?`,
        hint_en: `Pair the pages up — each pair fills one sheet, front and back.`,
        hint_id: `Pasangkan halamannya berdua-dua — setiap pasang mengisi satu lembar, depan dan belakang.`,
        hint_steps_en: [
          `Two-sided means one piece of paper takes 2 page numbers: pages 1 and 2 go on sheet 1, pages 3 and 4 go on sheet 2.`,
          `Pair every page the same way to the end: the last pair is ${pages - 1} and ${pages}, and that pair fills one sheet.`,
          `So the number of sheets is the number of pairs: ${pages} ÷ 2 = ${d.answer}. Check: sheet ${d.answer} holds pages ${pages - 1} and ${pages}.`,
        ],
        hint_steps_id: [
          `Bolak-balik berarti satu lembar memakai 2 nomor halaman: halaman 1 dan 2 di lembar ke-1, halaman 3 dan 4 di lembar ke-2.`,
          `Pasangkan semua halaman dengan cara yang sama sampai habis: pasangan terakhir adalah ${pages - 1} dan ${pages}, dan pasangan itu mengisi satu lembar.`,
          `Jadi banyak lembar sama dengan banyak pasangan: ${pages} ÷ 2 = ${d.answer}. Cek: lembar ke-${d.answer} memuat halaman ${pages - 1} dan ${pages}.`,
        ],
      }
    }
    return {
      ...common,
      body_en:
        `${name} wants to photocopy ${pages} pages. ` +
        `The machine prints on one side only, so each piece of paper holds just 1 page.` +
        `\n\nFind: How many pieces of paper does ${name} need?`,
      body_id:
        `${name} ingin memfotokopi ${pages} halaman. ` +
        `Mesinnya hanya mencetak satu sisi, jadi setiap lembar kertas memuat 1 halaman saja.` +
        `\n\nCari: Berapa lembar kertas yang ${name} butuhkan?`,
      hint_en: `Nothing pairs up here — a page cannot share a sheet when the back is never printed.`,
      hint_id: `Di sini tidak ada yang berpasangan — halaman tidak bisa berbagi lembar kalau belakangnya tidak dicetak.`,
      hint_steps_en: [
        `One-sided means a piece of paper takes only 1 page number: page 1 on sheet 1, page 2 on sheet 2.`,
        `No two pages ever share a sheet, because the back of every sheet stays blank.`,
        `So each of the ${pages} pages needs its own sheet: ${d.answer} sheets. Halving would only be right if both sides were printed.`,
      ],
      hint_steps_id: [
        `Satu sisi berarti satu lembar hanya memakai 1 nomor halaman: halaman 1 di lembar ke-1, halaman 2 di lembar ke-2.`,
        `Tidak ada dua halaman yang berbagi lembar, karena bagian belakang setiap lembar dibiarkan kosong.`,
        `Jadi ${pages} halaman butuh lembar sendiri-sendiri: ${d.answer} lembar. Dibagi 2 baru benar kalau dicetak bolak-balik.`,
      ],
    }
  }

  if (ask === 'which-page-shares-the-sheet') {
    const parityStepEn = d.givenIsFront
      ? `${page} is odd, so ${page} is printed on the FRONT of a sheet, and its partner is the number right after it.`
      : `${page} is even, so ${page} is printed on the BACK of a sheet, and its partner is the number right before it.`
    const parityStepId = d.givenIsFront
      ? `${page} itu ganjil, jadi ${page} tercetak di DEPAN sebuah lembar, dan pasangannya adalah nomor tepat sesudahnya.`
      : `${page} itu genap, jadi ${page} tercetak di BELAKANG sebuah lembar, dan pasangannya adalah nomor tepat sebelumnya.`
    const closeEn = d.givenIsFront
      ? `That partner is ${page} + 1 = ${d.partnerPage}, so the sheet is (${page}, ${d.partnerPage}) and the other side is page ${d.partnerPage}.`
      : `That partner is ${page} − 1 = ${d.partnerPage}, so the sheet is (${d.partnerPage}, ${page}) and the other side is page ${d.partnerPage}.`
    const closeId = d.givenIsFront
      ? `Pasangannya ${page} + 1 = ${d.partnerPage}, jadi lembarnya (${page}, ${d.partnerPage}) dan sisi sebaliknya adalah halaman ${d.partnerPage}.`
      : `Pasangannya ${page} − 1 = ${d.partnerPage}, jadi lembarnya (${d.partnerPage}, ${page}) dan sisi sebaliknya adalah halaman ${d.partnerPage}.`

    return {
      ...common,
      body_en:
        `${name} has a ${book_en} bound from pieces of paper. ` +
        `Each piece of paper holds 2 pages: an odd page on the front and the next even page on the back, ` +
        `so pages 1 and 2 are on the first piece of paper, pages 3 and 4 on the second, and so on. ` +
        `One of the pages is page ${page}.` +
        `\n\nFind: Which page number is printed on the other side of that same piece of paper?`,
      body_id:
        `${name} punya ${book_id} yang dijilid dari lembar-lembar kertas. ` +
        `Setiap lembar kertas memuat 2 halaman: halaman ganjil di depan dan halaman genap sesudahnya di belakang, ` +
        `jadi halaman 1 dan 2 ada di lembar pertama, halaman 3 dan 4 di lembar kedua, begitu seterusnya. ` +
        `Salah satu halamannya adalah halaman ${page}.` +
        `\n\nCari: Halaman berapa yang tercetak di sisi sebaliknya pada lembar yang sama?`,
      hint_en: `Odd pages are fronts and even pages are backs — that tells you which way to step.`,
      hint_id: `Halaman ganjil ada di depan dan halaman genap di belakang — itu yang menentukan arah langkahnya.`,
      hint_steps_en: [
        `One piece of paper carries 2 page numbers, an odd one on the front and the very next even one on the back: (1, 2), (3, 4), (5, 6), and so on.`,
        parityStepEn,
        closeEn,
      ],
      hint_steps_id: [
        `Satu lembar kertas memuat 2 nomor halaman, ganjil di depan dan genap tepat sesudahnya di belakang: (1, 2), (3, 4), (5, 6), begitu seterusnya.`,
        parityStepId,
        closeId,
      ],
    }
  }

  // page-on-the-back — the ask names one face of sheet k. `side: 'back'` wants
  // the even page 2k, `side: 'front'` wants the odd page 2k − 1. Both faces get
  // asked so the child never learns "the answer is always the even one".
  const ord = ordinalEn(sheets)
  const sideEn = side === 'back' ? 'back' : 'front'
  const sideId = side === 'back' ? 'belakang' : 'depan'
  const closeEn =
    side === 'back'
      ? `The back is the later of the two numbers, so the ${sideEn} of the ${ord} piece of paper is page ${d.backPage}.`
      : `The front is the earlier of the two numbers, so the ${sideEn} of the ${ord} piece of paper is page ${d.frontPage}.`
  const closeId =
    side === 'back'
      ? `Sisi belakang adalah nomor yang lebih besar, jadi sisi ${sideId} lembar ke-${sheets} adalah halaman ${d.backPage}.`
      : `Sisi depan adalah nomor yang lebih kecil, jadi sisi ${sideId} lembar ke-${sheets} adalah halaman ${d.frontPage}.`

  return {
    ...common,
    body_en:
      `${name} is numbering the pages of a ${book_en}. ` +
      `Each piece of paper takes 2 page numbers: the 1st piece of paper holds pages 1 and 2, the 2nd holds pages 3 and 4, the 3rd holds pages 5 and 6, and so on.` +
      `\n\nFind: Which page number is on the ${sideEn} of the ${ord} piece of paper?`,
    body_id:
      `${name} menomori halaman sebuah ${book_id}. ` +
      `Setiap lembar kertas memakai 2 nomor halaman: lembar ke-1 memuat halaman 1 dan 2, lembar ke-2 memuat halaman 3 dan 4, lembar ke-3 memuat halaman 5 dan 6, begitu seterusnya.` +
      `\n\nCari: Halaman berapa yang ada di sisi ${sideId} lembar ke-${sheets}?`,
    hint_en: `Each sheet eats 2 page numbers, so count how many numbers are gone by the end of sheet ${sheets}.`,
    hint_id: `Setiap lembar menghabiskan 2 nomor halaman, jadi hitung berapa nomor yang terpakai sampai lembar ke-${sheets}.`,
    hint_steps_en: [
      `Every piece of paper uses up 2 page numbers, so ${sheets} pieces of paper use up ${sheets} × 2 = ${d.backPage} numbers: pages 1 to ${d.backPage}.`,
      `The last two of those, ${d.frontPage} and ${d.backPage}, are the two faces of the ${ord} piece of paper: ${d.frontPage} on the front, ${d.backPage} on the back.`,
      closeEn,
    ],
    hint_steps_id: [
      `Setiap lembar kertas menghabiskan 2 nomor halaman, jadi ${sheets} lembar menghabiskan ${sheets} × 2 = ${d.backPage} nomor: halaman 1 sampai ${d.backPage}.`,
      `Dua nomor terakhir, ${d.frontPage} dan ${d.backPage}, adalah dua sisi lembar ke-${sheets}: ${d.frontPage} di depan, ${d.backPage} di belakang.`,
      closeId,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
