// Storyboard for IKMC-22-EC-Q1 (2022 IKMC Ecolier, Q1).
//
// Question: Buzz the bee starts at (col 0, row 0) on a 4×4 grid.
// The flower is at (col 3, row 3). Which direction sequence reaches the flower?
//   A: → ↓ → ↓ ↓ →   (6 moves, ends at (3,3) ✓)
//   B: ↓ ↓ → ↓ ↓     (5 moves, ends at (1,3) ✗)
//   C: → ↓ → ↓ →     (5 moves, ends at (3,2) ✗)
//   D: → → ↓ ↓       (4 moves, ends at (2,2) ✗)
//   E: ↓ → → ↓ ↓ ↓   (6 moves, ends at (2,3) but row 4 is off-grid — stops (2,3) ✗)
//
// Strategy taught: "trace and check" — follow each sequence on the grid and
// confirm whether you land on the flower. Wrong options are shown briefly in
// red; route A is traced in green and confirmed.
//
// Beats:
//   0  intro     — state the task: follow each arrow sequence step by step
//   1  check B   — trace B, land at (1,3) — not the flower, eliminated
//   2  check C   — trace C, land at (3,2) — not the flower, eliminated
//   3  check D   — trace D, land at (2,2) — not the flower, eliminated
//   4  check E   — trace E, ends at (2,3) — not the flower, eliminated
//   5  trace A   — trace A step by step, land at (3,3) — the flower!
//   6  result    — Answer A confirmed
//
// Pure (lang) => storyboard. No Math.random / Date. SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ROUTE_A, ROUTE_B, ROUTE_C, ROUTE_D, ROUTE_E } from './BeeMaze1ECIllustration'

export type BeeMaze1Phase = 'intro' | 'eliminate' | 'trace' | 'result'

export interface BeeMaze1Step {
  phase: BeeMaze1Phase
  /** Which option letter this beat covers (null on intro). */
  option: string | null
  /** Route to highlight on the grid (null on intro/eliminate-no-path beats). */
  litPath: string | null
  /** True when the highlighted route is the correct one. */
  isValid: boolean
  /** Trail colour: green for valid, red for eliminated. */
  trailColor: string
  caption: string
  hold: number
  result: boolean
}

export interface BeeMaze1Storyboard {
  steps: BeeMaze1Step[]
  finalIndex: number
}

const GREEN_TRAIL = '#10B981'
const RED_TRAIL   = '#EF4444'
const AMBER_TRAIL = '#F59E0B'

export function buildBeeMaze1ECSteps(lang: Lang): BeeMaze1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BeeMaze1Step[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    option: null,
    litPath: null,
    isValid: false,
    trailColor: AMBER_TRAIL,
    hold: 2000,
    result: false,
    caption: t(
      'Buzz starts at the top-left. Follow each direction set on the grid and see which one reaches the flower.',
      'Buzz mulai dari pojok kiri atas. Ikuti setiap urutan arah di kotak dan lihat mana yang mencapai bunga.',
    ),
  })

  // Beats 1–4 — eliminated options (B, C, D, E)
  const eliminated: Array<{ letter: string; litPath: string; endEn: string; endId: string }> = [
    {
      letter: 'B',
      litPath: ROUTE_B,
      endEn: 'Route B (↓↓→↓↓) ends far from the flower — wrong.',
      endId: 'Rute B (↓↓→↓↓) berakhir jauh dari bunga — salah.',
    },
    {
      letter: 'C',
      litPath: ROUTE_C,
      endEn: 'Route C (→↓→↓→) ends one row too high — wrong.',
      endId: 'Rute C (→↓→↓→) berakhir satu baris terlalu tinggi — salah.',
    },
    {
      letter: 'D',
      litPath: ROUTE_D,
      endEn: 'Route D (→→↓↓) stops in the middle of the grid — wrong.',
      endId: 'Rute D (→→↓↓) berhenti di tengah kotak — salah.',
    },
    {
      letter: 'E',
      litPath: ROUTE_E,
      endEn: 'Route E (↓→→↓↓↓) misses the flower — wrong.',
      endId: 'Rute E (↓→→↓↓↓) melewatkan bunga — salah.',
    },
  ]

  for (const { letter, litPath, endEn, endId } of eliminated) {
    steps.push({
      phase: 'eliminate',
      option: letter,
      litPath,
      isValid: false,
      trailColor: RED_TRAIL,
      hold: 1800,
      result: false,
      caption: t(endEn, endId),
    })
  }

  // Beat 5 — trace route A (correct)
  steps.push({
    phase: 'trace',
    option: 'A',
    litPath: ROUTE_A,
    isValid: true,
    trailColor: GREEN_TRAIL,
    hold: 2200,
    result: false,
    caption: t(
      'Route A (→↓→↓↓→): right, down, right, down, down, right — lands exactly on the flower!',
      'Rute A (→↓→↓↓→): kanan, bawah, kanan, bawah, bawah, kanan — tepat mendarat di bunga!',
    ),
  })

  // Beat 6 — result
  steps.push({
    phase: 'result',
    option: 'A',
    litPath: ROUTE_A,
    isValid: true,
    trailColor: GREEN_TRAIL,
    hold: 0,
    result: true,
    caption: t(
      'Buzz reaches the flower via route A (→↓→↓↓→). Answer A.',
      'Buzz mencapai bunga melalui rute A (→↓→↓↓→). Jawaban A.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
