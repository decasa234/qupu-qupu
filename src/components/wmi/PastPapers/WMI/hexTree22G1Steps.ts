// Storyboard for WMI-22F1A-Q18 (Grade 1) — the two hexagon "trees".
//
// Rule discovered from tree 1: each hexagon = SUM of the two below it.
//   TREE 1: top 7; middle 3, 4; bottom 2, 1, 3.  (2+1=3, 1+3=4, 3+4=7.)
//   TREE 2: top 14; middle a, b; bottom 5, c, 1.  We must find a, b, c.
//     a = 5 + c,  b = c + 1,  and 14 = a + b = (5+c)+(c+1) = 6 + 2c
//     → 2c = 8 → c = 4 → a = 5+4 = 9, b = 4+1 = 5.
//   The three found numbers 9, 5, 4 → smallest→largest → 4, 5, 9 → answer 459.
//
// `rows` are the hexagon labels TOP→BOTTOM ('' = empty hexagon). `highlight`
// is the [rowIndex, colIndex] of the freshly-filled hexagon for that beat.
// These are fed straight into the illustrator's <HexTree rows highlight/>.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const HEX_TREE_ANSWER = 459

export type HexTreePhase = 'rule' | 'tree2' | 'set-up' | 'solve-c' | 'solve-a' | 'solve-b' | 'result'

export interface HexTreeStep {
  phase: HexTreePhase
  /** Hexagon labels, TOP→BOTTOM. '' = empty hexagon. */
  rows: string[][]
  /** [rowIndex, colIndex] of the freshly-filled hexagon (amber ring), or null. */
  highlight: [number, number] | null
  /** Which tree the beat is about (drives the heading). */
  tree: 1 | 2
  caption: string
  hold: number
  result: boolean
}

export interface HexTreeStoryboard {
  answer: number
  steps: HexTreeStep[]
  finalIndex: number
}

// Tree 1 is always fully shown (it teaches the rule).
const TREE1: string[][] = [['7'], ['3', '4'], ['2', '1', '3']]

// Tree 2 fills in progressively.
const T2_BLANK: string[][] = [['14'], ['', ''], ['5', '', '1']]
const T2_C: string[][] = [['14'], ['', ''], ['5', '4', '1']]
const T2_A: string[][] = [['14'], ['9', ''], ['5', '4', '1']]
const T2_B: string[][] = [['14'], ['9', '5'], ['5', '4', '1']]

export function buildHexTree22G1Steps(lang: Lang): HexTreeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HexTreeStep[] = [
    {
      phase: 'rule',
      tree: 1,
      rows: TREE1,
      highlight: null,
      hold: 2300,
      result: false,
      caption: t(
        'Look at tree 1: 2 + 1 = 3, 1 + 3 = 4, 3 + 4 = 7. Each hexagon is the two below it added up!',
        'Lihat pohon 1: 2 + 1 = 3, 1 + 3 = 4, 3 + 4 = 7. Setiap segi enam adalah jumlah dua di bawahnya!',
      ),
    },
    {
      phase: 'tree2',
      tree: 2,
      rows: T2_BLANK,
      highlight: null,
      hold: 2100,
      result: false,
      caption: t(
        'Tree 2 has blanks. Top is 14, bottom corners are 5 and 1. Use the same rule to fill them in.',
        'Pohon 2 ada yang kosong. Atas 14, sudut bawah 5 dan 1. Pakai aturan yang sama untuk mengisinya.',
      ),
    },
    {
      phase: 'set-up',
      tree: 2,
      rows: T2_BLANK,
      highlight: null,
      hold: 2400,
      result: false,
      caption: t(
        'The middle blank is shared: left = 5 + ?, right = ? + 1. So 14 = (5 + ?) + (? + 1) = 6 + two ?s.',
        'Kotak tengah dipakai bersama: kiri = 5 + ?, kanan = ? + 1. Jadi 14 = (5 + ?) + (? + 1) = 6 + dua ?.',
      ),
    },
    {
      phase: 'solve-c',
      tree: 2,
      rows: T2_C,
      highlight: [2, 1],
      hold: 2100,
      result: false,
      caption: t(
        '14 - 6 = 8, and 8 split into two equal parts is 4. So the bottom middle is 4!',
        '14 - 6 = 8, dan 8 dibagi dua sama besar adalah 4. Jadi bawah tengah adalah 4!',
      ),
    },
    {
      phase: 'solve-a',
      tree: 2,
      rows: T2_A,
      highlight: [1, 0],
      hold: 2000,
      result: false,
      caption: t(
        'Left middle = 5 + 4 = 9.',
        'Tengah kiri = 5 + 4 = 9.',
      ),
    },
    {
      phase: 'solve-b',
      tree: 2,
      rows: T2_B,
      highlight: [1, 1],
      hold: 2200,
      result: false,
      caption: t(
        'Right middle = 4 + 1 = 5. Check the top: 9 + 5 = 14. It works!',
        'Tengah kanan = 4 + 1 = 5. Cek atas: 9 + 5 = 14. Cocok!',
      ),
    },
    {
      phase: 'result',
      tree: 2,
      rows: T2_B,
      highlight: null,
      hold: 0,
      result: true,
      caption: t(
        `The found numbers are 9, 5, 4. Smallest to largest: 4, 5, 9. The answer is ${HEX_TREE_ANSWER}.`,
        `Angka yang ditemukan 9, 5, 4. Terkecil ke terbesar: 4, 5, 9. Jawabannya ${HEX_TREE_ANSWER}.`,
      ),
    },
  ]

  return { answer: HEX_TREE_ANSWER, steps, finalIndex: steps.length - 1 }
}
