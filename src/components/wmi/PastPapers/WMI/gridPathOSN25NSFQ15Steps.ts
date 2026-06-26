// OSN-25-SD-NAS-SEMIFINAL-Q15 storyboard — lattice-path counting.
//
// Grid: 4 East × 3 North from A=(0,0) to B=(4,3). P=(2,2) forbidden.
//   Total paths A→B = C(7,3) = 35
//   Paths A→P     = C(4,2) = 6
//   Paths P→B     = C(3,1) = 3
//   Paths through P = 6 × 3 = 18
//   Answer         = 35 − 18 = 17

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { GridBubble } from './GridPathOSN25NSFQ15Illustration'

export type GridPathPhase = 'intro' | 'total' | 'aToP' | 'pToB' | 'forbidden' | 'result'

export interface GridPathStep {
  phase: GridPathPhase
  bubbles: Record<string, GridBubble>
  forbiddenP: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface GridPathStoryboard {
  steps: GridPathStep[]
  finalIndex: number
}

const BLUE:  GridBubble = { fill: '#EFF6FF', stroke: '#3B82F6',  textFill: '#1D4ED8' }
const AMBER: GridBubble = { fill: '#FEF3C7', stroke: '#F59E0B',  textFill: '#92400E' }
const RED:   GridBubble = { fill: '#FEE2E2', stroke: '#EF4444',  textFill: '#DC2626' }
const GREEN: GridBubble = { fill: '#D1FAE5', stroke: '#10B981',  textFill: '#065F46' }

export function buildGridPathOSN25NSFQ15Steps(lang: Lang): GridPathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridPathStep[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      bubbles: {},
      forbiddenP: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Robot travels from A to B on a 4×3 grid, only East or North. Point P is forbidden.',
        'Robot bergerak dari A ke B di kisi 4×3, hanya ke Timur atau Utara. Titik P dilarang.',
      ),
    },

    // Beat 1 — total paths A→B = C(7,3) = 35
    {
      phase: 'total',
      bubbles: { '4,3': { ...BLUE, label: '35' } },
      forbiddenP: false,
      equation: 'C(7,3) = 35',
      hold: 2400,
      result: false,
      caption: t(
        'Total paths A→B: choose 3 North moves from 7 steps = C(7,3) = 35.',
        'Total jalur A→B: pilih 3 langkah Utara dari 7 = C(7,3) = 35.',
      ),
    },

    // Beat 2 — paths A→P = C(4,2) = 6
    {
      phase: 'aToP',
      bubbles: { '2,2': { ...AMBER, label: '6' } },
      forbiddenP: false,
      equation: 'C(4,2) = 6',
      hold: 2400,
      result: false,
      caption: t(
        'Paths A→P (2 East + 2 North): C(4,2) = 6.',
        'Jalur A→P (2 Timur + 2 Utara): C(4,2) = 6.',
      ),
    },

    // Beat 3 — paths P→B = C(3,1) = 3
    {
      phase: 'pToB',
      bubbles: {
        '2,2': { ...AMBER, label: '6' },
        '4,3': { ...RED, label: '3' },
      },
      forbiddenP: false,
      equation: 'C(3,1) = 3',
      hold: 2400,
      result: false,
      caption: t(
        'Paths P→B (2 East + 1 North): C(3,1) = 3.',
        'Jalur P→B (2 Timur + 1 Utara): C(3,1) = 3.',
      ),
    },

    // Beat 4 — paths through P = 18 (subtract these)
    {
      phase: 'forbidden',
      bubbles: { '4,3': { ...RED, label: '18' } },
      forbiddenP: true,
      equation: '6 × 3 = 18',
      hold: 2400,
      result: false,
      caption: t(
        'Forbidden paths (through P): 6 × 3 = 18.',
        'Jalur terlarang (melalui P): 6 × 3 = 18.',
      ),
    },

    // Beat 5 — answer
    {
      phase: 'result',
      bubbles: { '4,3': { ...GREEN, label: '17' } },
      forbiddenP: true,
      equation: '35 − 18 = 17',
      hold: 0,
      result: true,
      caption: t(
        'Valid paths avoiding P = 35 − 18 = 17.',
        'Jalur yang menghindari P = 35 − 18 = 17.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
