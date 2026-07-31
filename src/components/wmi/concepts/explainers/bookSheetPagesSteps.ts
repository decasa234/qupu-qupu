import type { Lang } from './makeTenSteps'

// N18 `book-sheet-pages`. One idea sits under all four ask forms: a two-sided
// sheet k carries page 2k − 1 on its FRONT and page 2k on its BACK, so odd
// pages are fronts and even pages are backs.
//
// A six-year-old's instinct is "one sheet, one page" (or, once burned by that,
// "always double"), so this storyboard never asserts the rule. It builds sheet 1
// with both faces on screen, walks the pattern out to the sheet the question
// asks about, parks the tempting stop on its own rose beat, and only then reads
// the answer off the picture the child has been watching.
export type BookSheetAsk =
  | 'pages-from-sheets'
  | 'sheets-from-pages'
  | 'which-page-shares-the-sheet'
  | 'page-on-the-back'
export type BookSheetSided = 'one' | 'two'
export type BookSheetSide = 'front' | 'back'
export type BookSheetPhase = 'rule' | 'pairing' | 'trap' | 'work' | 'result'

const ASKS: readonly BookSheetAsk[] = [
  'pages-from-sheets',
  'sheets-from-pages',
  'which-page-shares-the-sheet',
  'page-on-the-back',
]

/** Mirrors the generator's params (api/services/wmi/concepts/book-sheet-pages). */
export interface BookSheetParams {
  ask: BookSheetAsk
  name: string
  sided: BookSheetSided
  sheets: number
  page: number
  side: BookSheetSide
  book_en: string
  book_id: string
}

/** How one printed face is drawn on this beat. */
export type FaceMark =
  | 'none' // printed, resting
  | 'lit' // the face being talked about
  | 'given' // the page the story handed over
  | 'answer' // the page the story lands on
  | 'wrong' // the tempting misread
  | 'blank' // never printed (the back of a one-sided sheet)

export type SheetSlot =
  | {
      kind: 'sheet'
      index: number
      front: number | null
      back: number | null
      frontMark: FaceMark
      backMark: FaceMark
      /** Shown under the card when the beat is about this sheet. */
      focus: boolean
    }
  | { kind: 'gap' }

export interface BookSheetBeat {
  phase: BookSheetPhase
  caption: string
  slots: SheetSlot[]
  /** Running read-out chip, already in `lang`. */
  chip: string | null
  chipTone: 'neutral' | 'good' | 'bad'
  /** Show the "depan / belakang" face captions under the focused card. */
  showFaceLabels: boolean
  trap: boolean
  /** Short rose chip naming the tempting number. */
  trapLabel: string | null
  result: boolean
  hold: number
}

export interface BookSheetStoryboard {
  ask: BookSheetAsk
  sided: BookSheetSided
  perSheet: 1 | 2
  name: string
  bookLabel: string
  sheets: number
  page: number
  side: BookSheetSide
  focusSheet: number
  frontPage: number
  backPage: number
  totalPages: number
  partnerPage: number
  givenIsFront: boolean
  answer: number
  steps: BookSheetBeat[]
  finalIndex: number
}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

/** The relation, kept identical to the generator's. */
export function pagesOnSheet(k: number, perSheet: 1 | 2): number[] {
  return perSheet === 2 ? [2 * k - 1, 2 * k] : [k]
}
export function sheetOfPage(p: number, perSheet: 1 | 2): number {
  return perSheet === 2 ? Math.ceil(p / 2) : p
}

export function buildBookSheetPagesSteps(raw: unknown, lang: Lang): BookSheetStoryboard {
  const p = (raw ?? {}) as Partial<BookSheetParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ask: BookSheetAsk = ASKS.includes(p.ask as BookSheetAsk)
    ? (p.ask as BookSheetAsk)
    : 'page-on-the-back'
  const counting = ask === 'pages-from-sheets' || ask === 'sheets-from-pages'
  const sided: BookSheetSided = counting && p.sided === 'one' ? 'one' : 'two'
  const perSheet: 1 | 2 = sided === 'two' ? 2 : 1
  const side: BookSheetSide = p.side === 'front' ? 'front' : 'back'
  const name = str(p.name, 'Lisa')
  const bookLabel = lang === 'id' ? str(p.book_id, 'buku tulis') : str(p.book_en, 'notebook')

  const sheets = clampInt(p.sheets, 1, 30, 5)
  // Keep the page on the sheet the params claim, exactly as the schema does, so
  // a stale stored row can never draw a sheet whose two faces disagree.
  const rawPage = clampInt(p.page, 1, 60, perSheet * sheets)
  const page = sheetOfPage(rawPage, perSheet) === sheets ? rawPage : perSheet * sheets

  const onSheet = pagesOnSheet(sheets, perSheet)
  const totalPages = onSheet[onSheet.length - 1]
  const [frontPage, backPage] = pagesOnSheet(sheets, 2)

  const givenSheet = sheetOfPage(page, 2)
  const givenPair = pagesOnSheet(givenSheet, 2)
  const givenIsFront = givenPair[0] === page
  const partnerPage = givenIsFront ? givenPair[1] : givenPair[0]

  const answer =
    ask === 'pages-from-sheets'
      ? totalPages
      : ask === 'sheets-from-pages'
        ? sheetOfPage(totalPages, perSheet)
        : ask === 'which-page-shares-the-sheet'
          ? partnerPage
          : side === 'back'
            ? backPage
            : frontPage

  const focusSheet = ask === 'which-page-shares-the-sheet' ? givenSheet : sheets

  // ── Slot builders ─────────────────────────────────────────────────────────
  type Marks = Record<number, { front?: FaceMark; back?: FaceMark }>

  const slotsFor = (indices: number[], marks: Marks = {}): SheetSlot[] => {
    const list = Array.from(new Set(indices.filter((k) => k >= 1))).sort((a, b) => a - b)
    const out: SheetSlot[] = []
    let prev: number | null = null
    for (const k of list) {
      if (prev !== null && k - prev > 1) out.push({ kind: 'gap' })
      const pair = pagesOnSheet(k, 2)
      const m = marks[k] ?? {}
      out.push({
        kind: 'sheet',
        index: k,
        front: pair[0],
        back: perSheet === 2 ? pair[1] : null,
        frontMark: m.front ?? 'none',
        backMark: m.back ?? (perSheet === 2 ? 'none' : 'blank'),
        focus: k === focusSheet,
      })
      prev = k
    }
    return out
  }

  /** Sheets 1-3 as the worked example, plus the sheet under discussion. */
  const walk = (extra: number[] = []): number[] => [1, 2, 3, focusSheet, ...extra]

  const steps: BookSheetBeat[] = []
  const push = (
    beat: Omit<BookSheetBeat, 'chip' | 'chipTone' | 'showFaceLabels' | 'trap' | 'trapLabel' | 'result' | 'hold'> &
      Partial<Pick<BookSheetBeat, 'chip' | 'chipTone' | 'showFaceLabels' | 'trap' | 'trapLabel' | 'result' | 'hold'>>,
  ) => {
    steps.push({
      chip: null,
      chipTone: 'neutral',
      showFaceLabels: false,
      trap: false,
      trapLabel: null,
      result: false,
      hold: 2400,
      ...beat,
    })
  }

  // ── Beat 1: one sheet, two faces. The whole concept in one picture. ───────
  push({
    phase: 'rule',
    slots: slotsFor([1], { 1: { front: 'lit', back: perSheet === 2 ? 'lit' : 'blank' } }),
    showFaceLabels: true,
    caption:
      perSheet === 2
        ? T(
            `A piece of paper has two sides. Printed on both, sheet 1 carries page 1 on the front and page 2 on the back — one sheet, two page numbers.`,
            `Satu lembar kertas punya dua sisi. Kalau dicetak bolak-balik, lembar ke-1 memuat halaman 1 di depan dan halaman 2 di belakang — satu lembar, dua nomor halaman.`,
          )
        : T(
            `This machine prints the front only. Sheet 1 carries page 1, and its back is left blank — one sheet, one page number.`,
            `Mesin ini hanya mencetak bagian depan. Lembar ke-1 memuat halaman 1, dan belakangnya dibiarkan kosong — satu lembar, satu nomor halaman.`,
          ),
    hold: 2800,
  })

  // ── Beat 2: keep the pattern going out to the sheet in question. ──────────
  push({
    phase: 'pairing',
    slots: slotsFor(walk()),
    caption:
      perSheet === 2
        ? T(
            `The next sheets carry on: sheet 2 takes pages 3 and 4, sheet 3 takes 5 and 6. Sheet n always takes 2×n − 1 and 2×n, so sheet ${focusSheet} takes ${2 * focusSheet - 1} and ${2 * focusSheet}.`,
            `Lembar berikutnya meneruskan: lembar ke-2 memuat halaman 3 dan 4, lembar ke-3 memuat 5 dan 6. Lembar ke-n selalu memuat 2×n − 1 dan 2×n, jadi lembar ke-${focusSheet} memuat ${2 * focusSheet - 1} dan ${2 * focusSheet}.`,
          )
        : T(
            `The next sheets carry on: sheet 2 takes page 2, sheet 3 takes page 3. Nothing pairs up, so the sheet number and the page number stay equal.`,
            `Lembar berikutnya meneruskan: lembar ke-2 memuat halaman 2, lembar ke-3 memuat halaman 3. Tidak ada yang berpasangan, jadi nomor lembar dan nomor halaman selalu sama.`,
          ),
    hold: 3000,
  })

  // ── Beat 3: the trap, drawn rather than described. ────────────────────────
  if (ask === 'pages-from-sheets' && perSheet === 2) {
    const wrong = sheets
    push({
      phase: 'trap',
      slots: slotsFor(walk(), Object.fromEntries(walk().map((k) => [k, { back: 'wrong' as FaceMark }]))),
      trap: true,
      trapLabel: T(`${wrong} pages?`, `${wrong} halaman?`),
      chip: T(`${wrong} sheets`, `${wrong} lembar`),
      chipTone: 'bad',
      caption: T(
        `The tempting answer counts the sheets: "${sheets} sheets, so ${wrong} pages." But look at the rose faces — every back is numbered too, and none of them has been counted.`,
        `Jawaban godaan menghitung lembarnya: "${sheets} lembar, jadi ${wrong} halaman." Tapi lihat sisi merah muda itu — setiap belakang juga bernomor, dan belum ada yang dihitung.`,
      ),
      hold: 3400,
    })
  } else if (ask === 'pages-from-sheets') {
    const wrong = 2 * sheets
    push({
      phase: 'trap',
      slots: slotsFor(walk(), Object.fromEntries(walk().map((k) => [k, { back: 'wrong' as FaceMark }]))),
      trap: true,
      trapLabel: T(`${wrong} pages?`, `${wrong} halaman?`),
      caption: T(
        `The tempting answer doubles out of habit: "${sheets} × 2 = ${wrong}." But the rose faces are blank — this machine never printed them, so there is nothing there to count.`,
        `Jawaban godaan langsung mengalikan 2: "${sheets} × 2 = ${wrong}." Tapi sisi merah muda itu kosong — mesin ini tidak pernah mencetaknya, jadi tidak ada yang bisa dihitung.`,
      ),
      hold: 3400,
    })
  } else if (ask === 'sheets-from-pages' && perSheet === 2) {
    const wrong = totalPages
    push({
      phase: 'trap',
      slots: slotsFor(walk(), Object.fromEntries(walk().map((k) => [k, { front: 'wrong' as FaceMark, back: 'wrong' as FaceMark }]))),
      trap: true,
      trapLabel: T(`${wrong} sheets?`, `${wrong} lembar?`),
      caption: T(
        `The tempting answer gives every page its own sheet: "${wrong} pages, so ${wrong} sheets." But each card here already holds TWO numbers — pages ${totalPages - 1} and ${totalPages} are on one sheet, not two.`,
        `Jawaban godaan memberi tiap halaman satu lembar: "${wrong} halaman, jadi ${wrong} lembar." Padahal tiap kartu di sini sudah memuat DUA nomor — halaman ${totalPages - 1} dan ${totalPages} ada di satu lembar, bukan dua.`,
      ),
      hold: 3400,
    })
  } else if (ask === 'sheets-from-pages') {
    const wrong = Math.floor(totalPages / 2)
    push({
      phase: 'trap',
      slots: slotsFor(walk(), Object.fromEntries(walk().map((k) => [k, { back: 'wrong' as FaceMark }]))),
      trap: true,
      trapLabel: T(`${wrong} sheets?`, `${wrong} lembar?`),
      caption: T(
        `The tempting answer halves out of habit: "${totalPages} ÷ 2 = ${wrong}." But halving needs pages to pair up, and here every back is blank, so no two pages ever share a sheet.`,
        `Jawaban godaan langsung membagi 2: "${totalPages} ÷ 2 = ${wrong}." Padahal membagi 2 butuh halaman yang berpasangan, dan di sini setiap belakang kosong, jadi tidak ada dua halaman yang satu lembar.`,
      ),
      hold: 3400,
    })
  } else if (ask === 'which-page-shares-the-sheet') {
    const wrong = givenIsFront ? page - 1 : page + 1
    const wrongSheet = sheetOfPage(wrong, 2)
    push({
      phase: 'trap',
      slots: slotsFor(walk([givenSheet - 1, givenSheet + 1]), {
        [givenSheet]: givenIsFront ? { front: 'given' } : { back: 'given' },
        [wrongSheet]: givenIsFront ? { back: 'wrong' } : { front: 'wrong' },
      }),
      trap: true,
      trapLabel: T(`Page ${wrong}?`, `Halaman ${wrong}?`),
      caption: givenIsFront
        ? T(
            `The tempting answer grabs the neighbour: "${page} is next to ${wrong}." But ${wrong} sits on a different card — sheet ${wrongSheet}, not sheet ${givenSheet}.`,
            `Jawaban godaan mengambil tetangganya: "${page} bersebelahan dengan ${wrong}." Tapi ${wrong} ada di kartu lain — lembar ke-${wrongSheet}, bukan lembar ke-${givenSheet}.`,
          )
        : T(
            `The tempting answer grabs the neighbour: "${page} is next to ${wrong}." But ${wrong} sits on a different card — sheet ${wrongSheet}, not sheet ${givenSheet}.`,
            `Jawaban godaan mengambil tetangganya: "${page} bersebelahan dengan ${wrong}." Tapi ${wrong} ada di kartu lain — lembar ke-${wrongSheet}, bukan lembar ke-${givenSheet}.`,
          ),
      hold: 3400,
    })
  } else {
    const wrong = side === 'back' ? frontPage : backPage
    push({
      phase: 'trap',
      slots: slotsFor(walk(), {
        [sheets]: side === 'back' ? { front: 'wrong' } : { back: 'wrong' },
      }),
      trap: true,
      trapLabel: T(`Page ${wrong}?`, `Halaman ${wrong}?`),
      showFaceLabels: true,
      caption:
        side === 'back'
          ? T(
              `Careful: ${wrong} is on this very sheet, but it is the FRONT. The question asks for the back.`,
              `Hati-hati: ${wrong} memang ada di lembar ini, tetapi itu sisi DEPAN. Yang ditanya adalah sisi belakang.`,
            )
          : T(
              `Careful: ${wrong} is on this very sheet, but it is the BACK. The question asks for the front.`,
              `Hati-hati: ${wrong} memang ada di lembar ini, tetapi itu sisi BELAKANG. Yang ditanya adalah sisi depan.`,
            ),
      hold: 3200,
    })
  }

  // ── Beat 4: land the answer on the card the child has been watching. ──────
  if (ask === 'pages-from-sheets') {
    push({
      phase: 'result',
      slots: slotsFor(walk(), {
        [sheets]: perSheet === 2 ? { front: 'lit', back: 'answer' } : { front: 'answer' },
      }),
      chip: T(`${answer} pages`, `${answer} halaman`),
      chipTone: 'good',
      showFaceLabels: true,
      caption:
        perSheet === 2
          ? T(
              `Sheet ${sheets} ends on page ${backPage}, and the numbers 1, 2, 3, … , ${backPage} skip nothing. So there are ${answer} pages.`,
              `Lembar ke-${sheets} berhenti di halaman ${backPage}, dan nomor 1, 2, 3, …, ${backPage} tidak ada yang terlewat. Jadi ada ${answer} halaman.`,
            )
          : T(
              `Sheet ${sheets} ends on page ${sheets}, and every back stayed blank. So there are ${answer} pages, not double.`,
              `Lembar ke-${sheets} berhenti di halaman ${sheets}, dan semua belakangnya tetap kosong. Jadi ada ${answer} halaman, bukan dua kali lipat.`,
            ),
      result: true,
      hold: 0,
    })
  } else if (ask === 'sheets-from-pages') {
    push({
      phase: 'result',
      slots: slotsFor(walk(), {
        [sheets]: perSheet === 2 ? { front: 'answer', back: 'answer' } : { front: 'answer' },
      }),
      chip: T(`${answer} sheets`, `${answer} lembar`),
      chipTone: 'good',
      caption:
        perSheet === 2
          ? T(
              `The last pair, ${totalPages - 1} and ${totalPages}, fills the ${answer}th card — and every card before it held a pair too. Counting the cards: ${totalPages} ÷ 2 = ${answer} sheets.`,
              `Pasangan terakhir, ${totalPages - 1} dan ${totalPages}, mengisi kartu ke-${answer} — dan setiap kartu sebelumnya juga memuat sepasang. Menghitung kartunya: ${totalPages} ÷ 2 = ${answer} lembar.`,
            )
          : T(
              `Page ${totalPages} needs its own card, and so did every page before it. Counting the cards: ${answer} sheets.`,
              `Halaman ${totalPages} butuh kartunya sendiri, begitu juga semua halaman sebelumnya. Menghitung kartunya: ${answer} lembar.`,
            ),
      result: true,
      hold: 0,
    })
  } else if (ask === 'which-page-shares-the-sheet') {
    push({
      phase: 'result',
      slots: slotsFor(walk([givenSheet - 1, givenSheet + 1]), {
        [givenSheet]: givenIsFront
          ? { front: 'given', back: 'answer' }
          : { front: 'answer', back: 'given' },
      }),
      chip: T(`Page ${answer}`, `Halaman ${answer}`),
      chipTone: 'good',
      showFaceLabels: true,
      caption: givenIsFront
        ? T(
            `${page} is odd, so it is the FRONT of sheet ${givenSheet}, and that card is (${page}, ${partnerPage}). Turn it over: the other side is page ${partnerPage}.`,
            `${page} itu ganjil, jadi ia sisi DEPAN lembar ke-${givenSheet}, dan kartu itu (${page}, ${partnerPage}). Balik kartunya: sisi sebaliknya adalah halaman ${partnerPage}.`,
          )
        : T(
            `${page} is even, so it is the BACK of sheet ${givenSheet}, and that card is (${partnerPage}, ${page}). Turn it over: the other side is page ${partnerPage}.`,
            `${page} itu genap, jadi ia sisi BELAKANG lembar ke-${givenSheet}, dan kartu itu (${partnerPage}, ${page}). Balik kartunya: sisi sebaliknya adalah halaman ${partnerPage}.`,
          ),
      result: true,
      hold: 0,
    })
  } else {
    push({
      phase: 'result',
      slots: slotsFor(walk(), {
        [sheets]: side === 'back' ? { front: 'lit', back: 'answer' } : { front: 'answer', back: 'lit' },
      }),
      chip: T(`Page ${answer}`, `Halaman ${answer}`),
      chipTone: 'good',
      showFaceLabels: true,
      caption:
        side === 'back'
          ? T(
              `${sheets} sheets use up ${sheets} × 2 = ${backPage} numbers, so sheet ${sheets} is the card (${frontPage}, ${backPage}). Its back is the later number: page ${answer}.`,
              `${sheets} lembar menghabiskan ${sheets} × 2 = ${backPage} nomor, jadi lembar ke-${sheets} adalah kartu (${frontPage}, ${backPage}). Sisi belakangnya nomor yang lebih besar: halaman ${answer}.`,
            )
          : T(
              `${sheets} sheets use up ${sheets} × 2 = ${backPage} numbers, so sheet ${sheets} is the card (${frontPage}, ${backPage}). Its front is the earlier number: page ${answer}.`,
              `${sheets} lembar menghabiskan ${sheets} × 2 = ${backPage} nomor, jadi lembar ke-${sheets} adalah kartu (${frontPage}, ${backPage}). Sisi depannya nomor yang lebih kecil: halaman ${answer}.`,
            ),
      result: true,
      hold: 0,
    })
  }

  return {
    ask,
    sided,
    perSheet,
    name,
    bookLabel,
    sheets,
    page,
    side,
    focusSheet,
    frontPage,
    backPage,
    totalPages,
    partnerPage,
    givenIsFront,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
