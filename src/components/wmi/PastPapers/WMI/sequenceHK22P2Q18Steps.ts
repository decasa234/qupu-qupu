import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRI_GROUPS, QUESTION_IDX } from './SequenceHK22P2Q18Illustration'

// Storyboard for HKIMO-22-P2H-Q18 — circle/triangle sequence.
//
// Three beats:
//   1. Focus on first three ▲-runs: 1▲, 2▲, 3▲.
//   2. Extend to fourth and fifth runs: 4▲, 5▲ (with ? still hidden).
//   3. Reveal ? = ▲ — the 5th ▲ completing the 5th run.

export interface SHK22Q18Step {
  /** Indices into TRI_GROUPS to show brackets for */
  showGroups: number[]
  /** 0-based SEQUENCE indices to highlight */
  highlightIdx: number[]
  /** Replace the ? slot with a filled ▲ */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SHK22Q18Storyboard {
  steps: SHK22Q18Step[]
  finalIndex: number
}

export function buildSequenceHK22P2Q18Steps(lang: Lang): SHK22Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // All triangle-run index ranges, flattened
  const triIdx = TRI_GROUPS.flatMap(({ start, end }) => {
    const out: number[] = []
    for (let i = start; i <= end; i++) out.push(i)
    return out
  })

  const steps: SHK22Q18Step[] = [
    // Beat 1 — first three ▲-runs
    {
      showGroups: [0, 1, 2],
      highlightIdx: [1, 3, 4, 7, 8, 9],
      revealAnswer: false,
      hold: 2500,
      result: false,
      caption: t(
        'Look at the ▲-runs: 1▲, then 2▲, then 3▲ — each run grows by one.',
        'Perhatikan kelompok ▲: 1▲, lalu 2▲, lalu 3▲ — setiap kelompok bertambah satu.',
      ),
    },
    // Beat 2 — fourth and fifth runs (? still hidden)
    {
      showGroups: [0, 1, 2, 3, 4],
      highlightIdx: triIdx,
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        'Fourth run: 4▲. Fifth run: 4▲ shown + ? — the count goes 1→2→3→4→5.',
        'Kelompok 4: 4▲. Kelompok 5: sudah ada 4▲ + ? — hitungannya 1→2→3→4→5.',
      ),
    },
    // Beat 3 — reveal
    {
      showGroups: [0, 1, 2, 3, 4],
      highlightIdx: [QUESTION_IDX],
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        '? must be ▲ — the 5th triangle in the 5th run. Answer: ▲',
        '? harus ▲ — segitiga ke-5 di kelompok ke-5. Jawaban: ▲',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
