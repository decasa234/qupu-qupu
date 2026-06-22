// Storyboard for IKMC-22-PE-Q11 (2022 IKMC Pre-Ecolier, Q11).
//
// Question: Kanga wants to reach the koala without going through any of the
// coloured (blue) squares. Which route could she take? (Answer A)
//
// Strategy taught: "trace and eliminate" — trace each option to check whether
// it hits a coloured square; only route A avoids them all.
//
// Beats:
//   0  intro  — state the constraint: "must avoid every blue square"
//   1  check  — route B: hits a blue square (eliminated)
//   2  check  — route C: hits a blue square (eliminated)
//   3  check  — route D: hits a blue square (eliminated)
//   4  check  — route E: hits a blue square (eliminated)
//   5  trace  — route A: trace the valid path step by step
//   6  result — Kanga reaches the koala! Answer A.
//
// Only beat 5 (and 6) pass a litPath — the BFS-computed route A.
// Pure (lang) => storyboard; no Math.random, no Date. SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ROUTE_A } from './MazeGrid11PEIllustration'

export type MazeGrid11Phase = 'intro' | 'eliminate' | 'trace' | 'result'

export interface MazeGrid11Step {
  phase: MazeGrid11Phase
  /** Which option letter this beat is about (null on intro). */
  option: string | null
  /** Route to highlight on the maze (null when not tracing a valid path). */
  litPath: string | null
  /** True when we are tracing route A in an "eliminated" style (amber). */
  isValid: boolean
  caption: string
  hold: number
  result: boolean
}

export interface MazeGrid11Storyboard {
  steps: MazeGrid11Step[]
  finalIndex: number
}

export function buildMazeGrid11PESteps(lang: Lang): MazeGrid11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MazeGrid11Step[] = []

  // Beat 0 — intro: state the constraint
  steps.push({
    phase: 'intro',
    option: null,
    litPath: null,
    isValid: false,
    hold: 2000,
    result: false,
    caption: t(
      'Kanga must reach the koala without stepping on any blue square. Trace each route to check.',
      'Kanga harus mencapai koala tanpa menginjak satu pun kotak biru. Telusuri setiap rute untuk memeriksa.',
    ),
  })

  // Beats 1–4 — eliminate routes B, C, D, E (each hits a blue square)
  const eliminated = [
    {
      letter: 'B',
      en: 'Route B passes through a blue square — eliminated.',
      id: 'Rute B melewati kotak biru — dieliminasi.',
    },
    {
      letter: 'C',
      en: 'Route C steps on a blue square — eliminated.',
      id: 'Rute C menginjak kotak biru — dieliminasi.',
    },
    {
      letter: 'D',
      en: 'Route D enters a blue square — eliminated.',
      id: 'Rute D masuk ke kotak biru — dieliminasi.',
    },
    {
      letter: 'E',
      en: 'Route E hits a blue square too — eliminated.',
      id: 'Rute E juga menabrak kotak biru — dieliminasi.',
    },
  ]

  for (const { letter, en, id } of eliminated) {
    steps.push({
      phase: 'eliminate',
      option: letter,
      litPath: null,
      isValid: false,
      hold: 1800,
      result: false,
      caption: t(en, id),
    })
  }

  // Beat 5 — trace route A: step through the valid path
  steps.push({
    phase: 'trace',
    option: 'A',
    litPath: ROUTE_A,
    isValid: true,
    hold: 2200,
    result: false,
    caption: t(
      'Route A: right along the bottom, then up and across — avoids every blue square!',
      'Rute A: ke kanan sepanjang bagian bawah, lalu ke atas dan menyeberang — menghindari semua kotak biru!',
    ),
  })

  // Beat 6 — result
  steps.push({
    phase: 'result',
    option: 'A',
    litPath: ROUTE_A,
    isValid: true,
    hold: 0,
    result: true,
    caption: t(
      'Kanga reaches the koala via route A — the only route that avoids all blue squares. Answer A.',
      'Kanga mencapai koala melalui rute A — satu-satunya rute yang menghindari semua kotak biru. Jawaban A.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
