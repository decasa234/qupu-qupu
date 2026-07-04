// OSN-25-SD-NAS-SEMIFINAL-Q9 storyboard — village commuter flow.
//
// Problem: P=320, Q=400, R=380 residents.
//   P→Q=25%, Q→P=40%, P→R=15%, R→P=30%, Q→R=24%, R→Q=35%.
//   Workers in Q = (Q staying) + (P→Q) + (R→Q) = 144 + 80 + 133 = 357.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { NodeId } from './VillageFlowOSN25NSFQ9Illustration'

export type FlowPhase = 'intro' | 'q_stays' | 'p_to_q' | 'r_to_q' | 'result'

export interface VillageFlowStep {
  phase: FlowPhase
  highlightEdge?: string
  highlightNode?: NodeId
  sourceNode?: NodeId
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface VillageFlowStoryboard {
  steps: VillageFlowStep[]
  finalIndex: number
}

export function buildVillageFlowOSN25NSFQ9Steps(lang: Lang): VillageFlowStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: VillageFlowStep[] = [
    // Beat 0 — intro: full diagram, problem setup
    {
      phase: 'intro',
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Three villages P (320), Q (400), R (380). Arrows show what % of each village\'s residents work elsewhere. Find: how many people work in village Q?',
        'Tiga desa P (320), Q (400), R (380). Panah menunjukkan berapa % penduduk desa asal yang bekerja di desa lain. Pertanyaan: berapa orang yang bekerja di desa Q?',
      ),
    },

    // Beat 1 — Q residents who stay in Q
    // Q→P = 40%, Q→R = 24%, so Q→Q = 36%
    {
      phase: 'q_stays',
      highlightNode: 'Q',
      equation: '400 × 36% = 144',
      hold: 2600,
      result: false,
      caption: t(
        '400 people live in Q. 40% go to P, 24% go to R → 36% stay in Q: 400 × 0.36 = 144.',
        '400 penduduk tinggal di Q. 40% ke P, 24% ke R → 36% tetap di Q: 400 × 0,36 = 144.',
      ),
    },

    // Beat 2 — inflow from P → Q
    {
      phase: 'p_to_q',
      highlightEdge: 'P-Q',
      sourceNode: 'P',
      highlightNode: 'Q',
      equation: '320 × 25% = 80',
      hold: 2600,
      result: false,
      caption: t(
        '25% of P\'s 320 residents work in Q: 320 × 0.25 = 80.',
        '25% dari 320 penduduk P bekerja di Q: 320 × 0,25 = 80.',
      ),
    },

    // Beat 3 — inflow from R → Q
    {
      phase: 'r_to_q',
      highlightEdge: 'R-Q',
      sourceNode: 'R',
      highlightNode: 'Q',
      equation: '380 × 35% = 133',
      hold: 2600,
      result: false,
      caption: t(
        '35% of R\'s 380 residents work in Q: 380 × 0.35 = 133.',
        '35% dari 380 penduduk R bekerja di Q: 380 × 0,35 = 133.',
      ),
    },

    // Beat 4 — final sum
    {
      phase: 'result',
      highlightNode: 'Q',
      equation: '144 + 80 + 133 = 357',
      hold: 0,
      result: true,
      caption: t(
        'Workers in Q = 144 (from Q) + 80 (from P) + 133 (from R) = 357.',
        'Pekerja di Q = 144 (dari Q) + 80 (dari P) + 133 (dari R) = 357.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
