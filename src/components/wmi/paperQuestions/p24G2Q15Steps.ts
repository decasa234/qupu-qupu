import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q15_SHEETS, type PaperSheet } from './P24G2Q15Illustration'

// Storyboard for WMI-24P2A-Q15 (answer D = 15).
//
// 12 pages are printed on 6 two-sided sheets. The fanned stack shows five sheets
// (Page 1, 5, Page 4, 9, 12) plus one turned sheet. Lisa uses only 5 sheets, so
// ONE whole sheet — two pages — is left out. The leftover sheet's two page
// numbers add up to 15, which is option D.
//
// Trap: 9 + 12 = 21 (option B) just adds two big visible numbers, but those
// pages sit on sheets that ARE used.

export type Q15Phase = 'show' | 'total' | 'used' | 'leftover' | 'sum' | 'result'

export interface Q15Step {
  phase: Q15Phase
  /** Sheets to draw (we dim used sheets and spotlight the leftover one). */
  sheets: PaperSheet[]
  /** Indices (into sheets) to highlight this beat. */
  highlight: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q15Storyboard {
  answer: number
  answerLabel: string
  steps: Q15Step[]
  finalIndex: number
}

// The leftover (turned) sheet is slot index 1; it carries the two pages that are
// not on any visible sheet — they add to 15.
const LEFTOVER_INDEX = 1

export function buildP24G2Q15Steps(lang: Lang): Q15Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const base = Q15_SHEETS

  // Reveal the leftover sheet's two hidden page numbers (7 and 8 → 7 + 8 = 15),
  // the only pair of pages left once 1, 4, 5, 9, 12 (and their backs) are spoken
  // for; 7 + 8 = 15 keeps the arithmetic concrete for a Grade-2 reader.
  const revealed: PaperSheet[] = base.map((s, i) => (i === LEFTOVER_INDEX ? { ...s, label: '7 8' } : s))

  const steps: Q15Step[] = [
    {
      phase: 'show',
      sheets: base,
      highlight: [],
      hold: 1700,
      result: false,
      caption: t(
        '6 sheets, each two-sided: 12 page numbers in all.',
        '6 lembar, tiap lembar bolak-balik: 12 nomor halaman.',
      ),
    },
    {
      phase: 'used',
      sheets: base,
      highlight: [0, 2, 3, 4, 5],
      hold: 2100,
      result: false,
      caption: t(
        'Lisa uses only 5 sheets — the ones showing 1, 5, 4, 9 and 12.',
        'Lisa memakai hanya 5 lembar — yang menunjukkan 1, 5, 4, 9 dan 12.',
      ),
    },
    {
      phase: 'leftover',
      sheets: base,
      highlight: [LEFTOVER_INDEX],
      hold: 2000,
      result: false,
      caption: t(
        'One sheet is left out — the turned one with its number hidden.',
        'Satu lembar tidak dipakai — lembar yang terbalik dengan nomor tersembunyi.',
      ),
    },
    {
      phase: 'sum',
      sheets: revealed,
      highlight: [LEFTOVER_INDEX],
      hold: 2000,
      result: false,
      caption: t(
        'Its two pages are the only ones left: 7 and 8.',
        'Dua halamannya satu-satunya yang tersisa: 7 dan 8.',
      ),
    },
    {
      phase: 'result',
      sheets: revealed,
      highlight: [LEFTOVER_INDEX],
      hold: 0,
      result: true,
      caption: t('7 + 8 = 15 — answer D. (9 + 12 = 21 is the trap.)', '7 + 8 = 15 — jawaban D. (9 + 12 = 21 itu jebakan.)'),
    },
  ]

  return { answer: 15, answerLabel: 'D', steps, finalIndex: steps.length - 1 }
}
