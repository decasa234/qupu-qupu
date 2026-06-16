import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { MOVES } from './FruitMaze20Illustration'

export type FruitMazePhase = 'intro' | 'walk' | 'result'

export interface FruitMazeStep {
  phase: FruitMazePhase
  /** How many of the 8 moves have been taken on this beat (0..8). */
  visitedCount: number
  caption: string
  hold: number
  result: boolean
}

export interface FruitMazeStoryboard {
  moveCount: number
  steps: FruitMazeStep[]
  finalIndex: number
}

export function buildFruitMaze20Steps(lang: Lang): FruitMazeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FruitMazeStep[] = [
    {
      phase: 'intro',
      visitedCount: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Each arrow moves the car one stop along the road.',
        'Setiap tanda panah menggerakkan mobil satu perhentian di jalan.',
      ),
    },
    {
      phase: 'walk',
      visitedCount: 2,
      hold: 2100,
      result: false,
      caption: t(
        'Moves 1–2: → banana, then ↑ grapes.',
        'Langkah 1–2: → pisang, lalu ↑ anggur.',
      ),
    },
    {
      phase: 'walk',
      visitedCount: 4,
      hold: 2100,
      result: false,
      caption: t(
        'Moves 3–4: → strawberry, then ↓ grapes.',
        'Langkah 3–4: → stroberi, lalu ↓ anggur.',
      ),
    },
    {
      phase: 'walk',
      visitedCount: 6,
      hold: 2100,
      result: false,
      caption: t(
        'Moves 5–6: ← banana, then ↓ green apple.',
        'Langkah 5–6: ← pisang, lalu ↓ apel hijau.',
      ),
    },
    {
      phase: 'walk',
      visitedCount: 8,
      hold: 2100,
      result: false,
      caption: t(
        'Moves 7–8: → banana, then ↓ green apple.',
        'Langkah 7–8: → pisang, lalu ↓ apel hijau.',
      ),
    },
    {
      phase: 'result',
      visitedCount: 8,
      hold: 0,
      result: true,
      caption: t(
        'After the last arrow the car is on the green apple (D).',
        'Setelah panah terakhir, mobil berhenti di apel hijau (D).',
      ),
    },
  ]

  return { moveCount: MOVES.length, steps, finalIndex: steps.length - 1 }
}
