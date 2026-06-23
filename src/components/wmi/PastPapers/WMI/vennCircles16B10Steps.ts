// SEAMO-16-B-Q10 — Inclusion-exclusion steps for three-circle Venn diagram.
//
// Answer: the official key records D = 1200, which equals the raw sum of the
// three circle areas (380+400+420). The inclusion-exclusion formula gives 900,
// but the key marks the "sum of areas" as the answer. The steps teach
// inclusion-exclusion; the trap note flags the discrepancy.
//
// Beat sequence:
//   0 — intro: "use the Venn formula"
//   1 — highlight A∩B region; show A∩B total = 70+30 = 100
//   2 — highlight A∩C region; show A∩C total = 90+30 = 120
//   3 — highlight B∩C region; show B∩C total = 80+30 = 110
//   4 — show A∩B∩C = 30 (triple centre)
//   5 — show sum of areas = 380+400+420 = 1200
//   6 — apply formula → 1200 − 100 − 120 − 110 + 30 = 900
//   7 — note: official key = D (1200); flag discrepancy

import type { VennRegion } from './VennCircles16B10Illustration'

export interface VennStep {
  caption: string
  highlightRegion: VennRegion
  result: boolean
  hold?: number   // extra ms to pause on this beat
}

export interface VennStory {
  steps: VennStep[]
  finalIndex: number
}

export function buildVennCircles16B10Steps(lang: 'en' | 'id'): VennStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: VennStep[] = [
    {
      caption: t(
        '|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|',
        '|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|',
      ),
      highlightRegion: null,
      result: false,
      hold: 600,
    },
    {
      caption: t(
        'A∩B region: 70 (only A∩B) + 30 (triple) = 100 cm²',
        'Daerah A∩B: 70 (hanya A∩B) + 30 (ketiganya) = 100 cm²',
      ),
      highlightRegion: 'AB',
      result: false,
    },
    {
      caption: t(
        'A∩C region: 90 (only A∩C) + 30 (triple) = 120 cm²',
        'Daerah A∩C: 90 (hanya A∩C) + 30 (ketiganya) = 120 cm²',
      ),
      highlightRegion: 'AC',
      result: false,
    },
    {
      caption: t(
        'B∩C region: 80 (only B∩C) + 30 (triple) = 110 cm²',
        'Daerah B∩C: 80 (hanya B∩C) + 30 (ketiganya) = 110 cm²',
      ),
      highlightRegion: 'BC',
      result: false,
    },
    {
      caption: t(
        'Triple overlap A∩B∩C = 30 cm² (added back once)',
        'Tumpang tindih tiga: A∩B∩C = 30 cm² (ditambahkan kembali sekali)',
      ),
      highlightRegion: 'ABC',
      result: false,
    },
    {
      caption: t(
        'Sum of areas: 380 + 400 + 420 = 1200 cm²',
        'Jumlah luas: 380 + 400 + 420 = 1200 cm²',
      ),
      highlightRegion: null,
      result: false,
    },
    {
      caption: t(
        '1200 − 100 − 120 − 110 + 30 = 900 cm²',
        '1200 − 100 − 120 − 110 + 30 = 900 cm²',
      ),
      highlightRegion: null,
      result: false,
    },
    {
      caption: t(
        'Official key: D (1200 cm²) — equals raw sum; formula gives 900 cm²',
        'Kunci resmi: D (1200 cm²) — sama dengan jumlah mentah; rumus memberi 900 cm²',
      ),
      highlightRegion: null,
      result: true,
      hold: 800,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
