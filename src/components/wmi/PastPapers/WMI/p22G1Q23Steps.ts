import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PATH } from './P22G1Q23Illustration'

export type ArrowGrid23Phase = 'intro' | 'walk' | 'exit' | 'result'

export interface ArrowGrid23Step {
  phase: ArrowGrid23Phase
  /** Path nodes lit so far (0..PATH.length); > PATH.length means the chick has exited. */
  visitedNodes: number
  showTrail: boolean
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ArrowGrid23Storyboard {
  nodeCount: number
  steps: ArrowGrid23Step[]
  finalIndex: number
}

export function buildP22G1Q23Steps(lang: Lang): ArrowGrid23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const nodeCount = PATH.length // 10

  const steps: ArrowGrid23Step[] = [
    {
      phase: 'intro',
      visitedNodes: 1,
      showTrail: true,
      revealAnswer: false,
      caption: t(
        'Start at row 3, far left. Read the arrow under the chick each time.',
        'Mulai di baris 3, paling kiri. Baca panah di bawah anak ayam setiap kali.',
      ),
      hold: 1800,
      result: false,
    },
    {
      phase: 'walk',
      visitedNodes: 3,
      showTrail: true,
      revealAnswer: false,
      caption: t(
        '→1 step to (3,2), then ▲ 2 steps up to (1,2).',
        '→1 langkah ke (3,2), lalu ▲ 2 langkah naik ke (1,2).',
      ),
      hold: 2100,
      result: false,
    },
    {
      phase: 'walk',
      visitedNodes: 6,
      showTrail: true,
      revealAnswer: false,
      caption: t(
        '↓1 to (2,2), →1 to (2,3), then ← 2 steps to (2,1).',
        '↓1 ke (2,2), →1 ke (2,3), lalu ← 2 langkah ke (2,1).',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'walk',
      visitedNodes: 8,
      showTrail: true,
      revealAnswer: false,
      caption: t(
        '↓ 2 steps to (4,1), then ↓ 2 more to (6,1) — the bottom row.',
        '↓ 2 langkah ke (4,1), lalu ↓ 2 lagi ke (6,1) — baris bawah.',
      ),
      hold: 2100,
      result: false,
    },
    {
      phase: 'walk',
      visitedNodes: 10,
      showTrail: true,
      revealAnswer: false,
      caption: t(
        '→ 3 steps to (6,4), then →1 to (6,5).',
        '→ 3 langkah ke (6,4), lalu →1 ke (6,5).',
      ),
      hold: 2100,
      result: false,
    },
    {
      phase: 'exit',
      visitedNodes: nodeCount + 1,
      showTrail: true,
      revealAnswer: false,
      caption: t(
        'The last arrow points ↓ 1 step — the chick walks off the bottom, below column 5.',
        'Panah terakhir menunjuk ↓ 1 langkah — anak ayam keluar lewat bawah, di bawah kolom 5.',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'result',
      visitedNodes: nodeCount + 1,
      showTrail: true,
      revealAnswer: true,
      caption: t(
        'Below column 5 sits the pineapple — the chick reaches the pineapple (C).',
        'Di bawah kolom 5 ada nanas — anak ayam mencapai nanas (C).',
      ),
      hold: 0,
      result: true,
    },
  ]

  return { nodeCount, steps, finalIndex: steps.length - 1 }
}
