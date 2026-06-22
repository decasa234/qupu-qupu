// IKMC-21-EC-Q23 — beat-by-beat solution storyboard.
//
// Strategy: trace arrow chains from known values 5 and 7, then narrow the
// range for ? using inequality chains. Landing: ? = 6, answer D.
//
// Beats:
//   0. Intro — static puzzle; read the rule.
//   1. Anchor 5 and 7 — spotlight the two givens; arrow 5→7 (upward) is locked.
//   2. Deduce (0,0) — 7 < (0,0) because arrow (1,0)→(0,0). So (0,0) > 7, i.e., {8 or 9}.
//   3. Deduce (0,1) — two arrows point INTO (0,1): (0,0)→(0,1) and (0,2)→(0,1).
//                     So (0,1) is bigger than both (0,0) and ?. Since (0,0)≥8, (0,1)=9.
//                     And (0,0)=8.
//   4. Narrow ? from above — (0,2)→(0,1)=9 means ? < 9. (easy, all do)
//   5. Narrow ? from below — arrow (1,2)→(0,2)=? means (1,2) < ?.
//                           Arrow chains show (1,2) is small (< 5). So ? ≥ 2 at least.
//   6. Narrow ? by elimination — 1,2,3,4 fill the small cells (<5) and 5,7,8,9 are placed.
//                                The only remaining number is 6 → ? = 6, answer D.
//   7. Reveal ? = 6 — solution beat.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { NA_EDGES } from './NumberArrows23ECIllustration'

export interface NumberArrows23ECStep {
  solved: Record<string, number>
  activeKeys: string[]
  activeEdges: number[]
  caption: string
  hold: number
  result: boolean
}

export interface NumberArrows23ECStory {
  steps: NumberArrows23ECStep[]
  finalIndex: number
  answer: string
}

// Edge indices (see NA_EDGES in the illustration for the canonical list):
//   0: (2,0)→(1,0)  — 5→7 upward
//   1: (1,0)→(0,0)  — 7→(0,0) upward
//   2: (0,0)→(0,1)  — rightward
//   3: (0,2)→(0,1)  — leftward (? < (0,1))
//   4: (1,2)→(1,1)
//   5: (1,1)→(1,0)
//   6: (1,1)→(0,1)
//   7: (1,1)→(2,1)
//   8: (1,2)→(0,2)  — (1,2) < ?
//   9: (1,2)→(2,2)
//  10: (2,2)→(2,1)
//  11: (2,1)→(2,0)

// Validate edge count at runtime for type-safety.
const _edgeCheck: 12 = NA_EDGES.length as 12
void _edgeCheck

export function buildNumberArrows23ECSteps(lang: Lang): NumberArrows23ECStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const answer = 'D'

  // Cumulative solved maps (givens are always painted by NA_GIVEN inside the figure)
  const s0: Record<string, number> = {}
  const s1 = { ...s0 }                              // givens spotlit; no new fills
  const s2 = { ...s1, '0-0': 8 }                   // (0,0) deduced = 8
  const s3 = { ...s2, '0-1': 9 }                   // (0,1) deduced = 9
  const s4 = { ...s3 }                              // narrow ? from above (no new fill)
  const s5 = { ...s4 }                              // narrow ? from below (no new fill)
  const s6 = { ...s5, '0-2': 6 }                   // ? revealed = 6

  const steps: NumberArrows23ECStep[] = [
    // Beat 0 — intro
    {
      solved: s0,
      activeKeys: [],
      activeEdges: [],
      hold: 2800,
      result: false,
      caption: t(
        'Arrows always point from a smaller number to a larger one. Two squares are filled: 5 (bottom-left) and 7 (middle-left). Find the number for the "?" square (top-right).',
        'Anak panah selalu menunjuk dari angka yang lebih kecil ke angka yang lebih besar. Dua kotak terisi: 5 (kiri bawah) dan 7 (kiri tengah). Temukan angka untuk kotak "?" (kanan atas).',
      ),
    },
    // Beat 1 — anchor the two givens; the 5→7 arrow is locked
    {
      solved: s1,
      activeKeys: ['2-0', '1-0'],
      activeEdges: [0],
      hold: 2400,
      result: false,
      caption: t(
        'The arrow from 5 → 7 confirms 5 < 7. Now follow the chain upward from 7.',
        'Anak panah 5 → 7 memastikan 5 < 7. Ikuti rantai ke atas dari 7.',
      ),
    },
    // Beat 2 — deduce (0,0) = 8
    {
      solved: s2,
      activeKeys: ['0-0'],
      activeEdges: [1],
      hold: 2600,
      result: false,
      caption: t(
        '7 → top-left: the top-left square must be LARGER than 7. The only unused values above 7 are 8 and 9, so it is 8 or 9.',
        '7 → kiri atas: kotak kiri atas harus LEBIH BESAR dari 7. Nilai yang belum digunakan di atas 7 adalah 8 dan 9.',
      ),
    },
    // Beat 3 — deduce (0,1) = 9 (and lock (0,0) = 8)
    {
      solved: s3,
      activeKeys: ['0-1'],
      activeEdges: [2, 3],
      hold: 2800,
      result: false,
      caption: t(
        'TWO arrows point INTO the top-centre square: one from top-left and one from "?". It must be bigger than both — the only value bigger than 8 is 9. So top-centre = 9 and top-left = 8.',
        'DUA anak panah menunjuk ke kotak tengah atas: satu dari kiri atas dan satu dari "?". Nilainya harus lebih besar dari keduanya — satu-satunya nilai yang lebih besar dari 8 adalah 9. Jadi tengah atas = 9 dan kiri atas = 8.',
      ),
    },
    // Beat 4 — narrow ? from above: ? < 9
    {
      solved: s4,
      activeKeys: ['0-2'],
      activeEdges: [3],
      hold: 2400,
      result: false,
      caption: t(
        '"?" → 9: the question mark is smaller than 9. Already placed: 5, 7, 8, 9. Remaining: 1, 2, 3, 4, 6.',
        '"?" → 9: tanda tanya lebih kecil dari 9. Sudah ditempatkan: 5, 7, 8, 9. Sisa: 1, 2, 3, 4, 6.',
      ),
    },
    // Beat 5 — narrow ? from below: (1,2) < ?
    {
      solved: s5,
      activeKeys: ['0-2'],
      activeEdges: [8, 4, 5, 9, 10, 11],
      hold: 2800,
      result: false,
      caption: t(
        'The middle-right arrow points UP to "?": some value < "?". The bottom-right chain (rows 1 and 2) only uses values smaller than 5. Those fill 4 cells, using numbers {1, 2, 3, 4}. That leaves only 6 for "?"!',
        'Anak panah kanan tengah menunjuk ke ATAS ke "?": ada nilai < "?". Rantai kanan bawah (baris 1 dan 2) hanya menggunakan nilai lebih kecil dari 5. Empat kotak itu menggunakan {1, 2, 3, 4}. Hanya tersisa 6 untuk "?"!',
      ),
    },
    // Beat 6 — reveal ? = 6 (answer D)
    {
      solved: s6,
      activeKeys: ['0-2'],
      activeEdges: [],
      hold: 0,
      result: true,
      caption: t(
        '? = 6 — the only unused number that fits every arrow constraint. Answer: D.',
        '? = 6 — satu-satunya angka yang belum digunakan yang memenuhi semua batasan anak panah. Jawaban: D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer }
}
