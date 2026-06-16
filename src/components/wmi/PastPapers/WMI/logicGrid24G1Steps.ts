import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SHADED_CELLS, SHADED_SUM, SOLVED } from './LogicGrid24G1Illustration'

// WMI-24F1A-Q21 (2024 Grade 1 Final) — fill 1–9 into a 3×3 grid by six clues,
// then add the two shaded squares. The unique grid is
//
//        9 1 6
//        4 3 5
//        8 2 7
//
// Shaded cells r0c0 = 9 and r1c1 = 3 → 9 + 3 = 12.
//
// The storyboard walks the clues with `litClue` (1..6) to deduce the cross of
// the 1-2-3 column and the 3-4-5 row, anchors them with the remaining clues,
// then flips the whole grid `solved` and lands on the shaded sum. It never
// jumps straight to the answer — each beat shows why a digit lands where it does.

export interface LogicGridStep {
  /** Show the full solved grid (all nine digits). */
  solved: boolean
  /** Highlight one clue (1..6) by its index+1; null = none. */
  litClue: number | null
  /** Spotlight the two shaded cells + their digits in the caption/badge. */
  spotlightShaded: boolean
  caption: string
  hold: number
  /** Final beat: green verdict styling + the sum read-out. */
  result: boolean
}

export interface LogicGridStoryboard {
  /** "12" — the sum of the two shaded squares. */
  answer: string
  steps: LogicGridStep[]
  finalIndex: number
}

export function buildLogicGrid24G1Steps(lang: Lang): LogicGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const a = SOLVED.r0c0 // 9 — shaded top-left
  const b = SOLVED.r1c1 // 3 — shaded centre
  const answer = String(SHADED_SUM) // "12"

  const steps: LogicGridStep[] = [
    {
      solved: false,
      litClue: null,
      spotlightShaded: false,
      hold: 2600,
      result: false,
      caption: t(
        'Put 1–9 into the grid so every clue is true. Then add the two grey squares.',
        'Isi 1–9 ke kisi agar semua petunjuk benar. Lalu jumlahkan dua kotak abu-abu.',
      ),
    },
    {
      solved: false,
      litClue: 1,
      spotlightShaded: false,
      hold: 2800,
      result: false,
      caption: t(
        'Clue 1: 1, 2, 3 share one column. Clue 2: 3, 4, 5 share one row. They both use 3 — so the 3 sits where that column and row cross: the middle.',
        'Petunjuk 1: 1, 2, 3 satu kolom. Petunjuk 2: 3, 4, 5 satu baris. Keduanya memakai 3 — jadi 3 ada di perpotongan kolom dan baris itu: bagian tengah.',
      ),
    },
    {
      solved: false,
      litClue: 3,
      spotlightShaded: false,
      hold: 3000,
      result: false,
      caption: t(
        'Clue 3: 6 is above 2, and 2 is below 3. So down the middle column it goes 1 on top, 3 in the centre, 2 at the bottom.',
        'Petunjuk 3: 6 di atas 2, dan 2 di bawah 3. Jadi di kolom tengah dari atas: 1, lalu 3 di tengah, lalu 2 di bawah.',
      ),
    },
    {
      solved: false,
      litClue: 4,
      spotlightShaded: false,
      hold: 2800,
      result: false,
      caption: t(
        'Clue 4: 3 and 4 are left of 5. In the middle row that puts 5 on the right, 4 on the left, with 3 between them.',
        'Petunjuk 4: 3 dan 4 di sebelah kiri 5. Di baris tengah berarti 5 di kanan, 4 di kiri, dan 3 di antaranya.',
      ),
    },
    {
      solved: false,
      litClue: 5,
      spotlightShaded: false,
      hold: 2800,
      result: false,
      caption: t(
        'Clue 5: 2 and 6 are right of 8 — so 8 must hug the left column, in the bottom-left square.',
        'Petunjuk 5: 2 dan 6 di sebelah kanan 8 — jadi 8 berada di kolom kiri, di kotak kiri-bawah.',
      ),
    },
    {
      solved: false,
      litClue: 6,
      spotlightShaded: false,
      hold: 2800,
      result: false,
      caption: t(
        'Clue 6: 9 is above 3. The only spot left above the 3 is the top-left corner — so 9 goes there.',
        'Petunjuk 6: 9 di atas 3. Satu-satunya tempat di atas 3 adalah pojok kiri-atas — jadi 9 di situ.',
      ),
    },
    {
      solved: true,
      litClue: null,
      spotlightShaded: false,
      hold: 2600,
      result: false,
      caption: t(
        'Two squares are left: 6 must stay right of 8 and above 2, so 6 goes top-right and 7 fills the last spot. Every clue checks out!',
        'Tersisa dua kotak: 6 harus di kanan 8 dan di atas 2, jadi 6 di kanan-atas dan 7 mengisi kotak terakhir. Semua petunjuk cocok!',
      ),
    },
    {
      solved: true,
      litClue: null,
      spotlightShaded: true,
      hold: 0,
      result: true,
      caption: t(
        `Add the two grey squares: ${a} + ${b} = ${answer}.`,
        `Jumlahkan dua kotak abu-abu: ${a} + ${b} = ${answer}.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}

export { SHADED_CELLS }
