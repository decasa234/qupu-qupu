import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24P1A-Q15 storyboard.
//
// 5 two-sided sheets carry the 10 page numbers in printing order:
//   sheet 1 = (1, 2) · sheet 2 = (3, 4) · sheet 3 = (5, 6) ·
//   sheet 4 = (7, 8) · sheet 5 = (9, 10).
// The scan's four labeled sheets show faces 1, 5, 4, 9 — i.e. the sheets
// (1,2), (5,6), (3,4) and (9,10) are USED. The only sheet not in that list is
// sheet 4 = (7, 8). Its front + back = 7 + 8 = 15 → answer A.

/** The 5 sheets as front/back page pairs, in printing order. */
export const SHEET_PAGES: Array<[number, number]> = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8],
  [9, 10],
]

/** Index (0-based) of the unused sheet — sheet 4 = pages (7, 8). */
export const UNUSED_INDEX = 3
export const UNUSED_PAGES = SHEET_PAGES[UNUSED_INDEX]
export const ANSWER_SUM = UNUSED_PAGES[0] + UNUSED_PAGES[1] // 15

export type PagePhase = 'show' | 'pair' | 'used' | 'left' | 'result'

export interface PageStep {
  phase: PagePhase
  /** Which sheet indices to highlight as USED (struck through / dimmed). */
  usedSheets: number[]
  /** Highlight the unused sheet. */
  showUnused: boolean
  /** Show the front + back sum on the unused sheet. */
  showSum: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PageStoryboard {
  answerSum: number
  unusedPages: [number, number]
  steps: PageStep[]
  finalIndex: number
}

export function buildP24G1Q15Steps(lang: Lang): PageStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const [pa, pb] = UNUSED_PAGES

  const steps: PageStep[] = [
    {
      phase: 'show',
      usedSheets: [],
      showUnused: false,
      showSum: false,
      hold: 1700,
      result: false,
      caption: t(
        '5 two-sided sheets hold pages 1 to 10 — 2 pages per sheet.',
        '5 lembar bolak-balik memuat halaman 1 sampai 10 — 2 halaman per lembar.',
      ),
    },
    {
      phase: 'pair',
      usedSheets: [],
      showUnused: false,
      showSum: false,
      hold: 2100,
      result: false,
      caption: t(
        'In printing order the sheets pair up: (1,2) (3,4) (5,6) (7,8) (9,10).',
        'Sesuai urutan cetak, lembar berpasangan: (1,2) (3,4) (5,6) (7,8) (9,10).',
      ),
    },
    {
      phase: 'used',
      usedSheets: [0, 1, 2, 4],
      showUnused: false,
      showSum: false,
      hold: 2100,
      result: false,
      caption: t(
        'The 4 shown faces 1, 4, 5, 9 mark the used sheets: (1,2) (3,4) (5,6) (9,10).',
        'Keempat sisi terlihat 1, 4, 5, 9 menandai lembar terpakai: (1,2) (3,4) (5,6) (9,10).',
      ),
    },
    {
      phase: 'left',
      usedSheets: [0, 1, 2, 4],
      showUnused: true,
      showSum: false,
      hold: 1900,
      result: false,
      caption: t(
        `The only sheet left over is (${pa}, ${pb}) — the one she does not use.`,
        `Satu-satunya lembar yang tersisa adalah (${pa}, ${pb}) — yang tidak ia pakai.`,
      ),
    },
    {
      phase: 'result',
      usedSheets: [0, 1, 2, 4],
      showUnused: true,
      showSum: true,
      hold: 0,
      result: true,
      caption: t(
        `Front + back = ${pa} + ${pb} = ${ANSWER_SUM} — answer A.`,
        `Depan + belakang = ${pa} + ${pb} = ${ANSWER_SUM} — jawaban A.`,
      ),
    },
  ]

  return {
    answerSum: ANSWER_SUM,
    unusedPages: UNUSED_PAGES as [number, number],
    steps,
    finalIndex: steps.length - 1,
  }
}
