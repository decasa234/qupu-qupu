// Storyboard for SASMO-19-G2-Q21 — pictograph stamps, equal distribution.
//
// Quantities (seed-verified):
//   Anthony  1 △ =  3 stamps
//   Brandon  2 △ =  6 stamps
//   Carol    4 △ = 12 stamps  → distributes 12 ÷ 4 = 3 to each of the other 4
//   Dennis   3 △ =  9 stamps
//   Elizabeth 4 △ = 12 stamps
//
// After distribution:
//   Anthony   3 + 3 =  6
//   Elizabeth 12 + 3 = 15
//   Elizabeth − Anthony = 9  ← ANSWER
//
// Key insight: because EVERYONE receives the same +3, the difference between
// any two children is UNCHANGED from the start.  Elizabeth − Anthony = 12−3=9
// from the very first beat.
//
// Beat plan:
//   0  intro — show full pictograph, label stamps
//   1  carol — highlight Carol's row (she is giving away 12 stamps)
//   2  divide — show 12 ÷ 4 = 3 per child
//   3  add — add 3 to Anthony and Elizabeth (greyed Carol row)
//   4  diff — show 15 − 6 = 9  (answer)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const STAMP_ANSWER = 9

export type StampPhase = 'intro' | 'carol' | 'divide' | 'add' | 'diff'

export interface StampStep {
  phase: StampPhase
  /** Triangle counts to display for all five children. */
  counts: { Anthony: number; Brandon: number; Carol: number; Dennis: number; Elizabeth: number }
  highlightCarol: boolean
  grayCarol: boolean
  caption: string
  hold: number
  result: boolean
}

export interface StampStoryboard {
  steps: StampStep[]
  finalIndex: number
}

export function buildStampGraphSASMO19G2Q21Steps(lang: Lang): StampStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const initial = { Anthony: 1, Brandon: 2, Carol: 4, Dennis: 3, Elizabeth: 4 }
  // After distribution Carol has 0; others unchanged in triangle display
  // (we show stamps as numbers in captions, triangles unchanged except Carol → 0)
  const afterCarol = { Anthony: 1, Brandon: 2, Carol: 0, Dennis: 3, Elizabeth: 4 }

  const steps: StampStep[] = [
    {
      phase: 'intro',
      counts: initial,
      highlightCarol: false,
      grayCarol: false,
      hold: 2500,
      result: false,
      caption: t(
        'Picture graph: each △ = 3 stamps. Read the rows — Anthony has 1×3 = 3 stamps, Elizabeth has 4×3 = 12 stamps.',
        'Diagram gambar: setiap △ = 3 prangko. Baca barisnya — Anthony punya 1×3 = 3 prangko, Elizabeth punya 4×3 = 12 prangko.',
      ),
    },
    {
      phase: 'carol',
      counts: initial,
      highlightCarol: true,
      grayCarol: false,
      hold: 2300,
      result: false,
      caption: t(
        'Carol has 4×3 = 12 stamps. She gives ALL of them away — equally to Anthony, Brandon, Dennis and Elizabeth (4 children).',
        'Carol punya 4×3 = 12 prangko. Dia membagikan SEMUANYA — secara merata kepada Anthony, Brandon, Dennis, dan Elizabeth (4 anak).',
      ),
    },
    {
      phase: 'divide',
      counts: initial,
      highlightCarol: true,
      grayCarol: false,
      hold: 2400,
      result: false,
      caption: t(
        '12 ÷ 4 = 3. Each of the four children receives exactly 3 stamps from Carol.',
        '12 ÷ 4 = 3. Masing-masing dari empat anak menerima tepat 3 prangko dari Carol.',
      ),
    },
    {
      phase: 'add',
      counts: afterCarol,
      highlightCarol: false,
      grayCarol: true,
      hold: 2400,
      result: false,
      caption: t(
        'Anthony: 3 + 3 = 6 stamps. Elizabeth: 12 + 3 = 15 stamps. Carol now has 0. Everyone else +3.',
        'Anthony: 3 + 3 = 6 prangko. Elizabeth: 12 + 3 = 15 prangko. Carol kini punya 0. Semua yang lain +3.',
      ),
    },
    {
      phase: 'diff',
      counts: afterCarol,
      highlightCarol: false,
      grayCarol: true,
      hold: 0,
      result: true,
      caption: t(
        'Elizabeth − Anthony = 15 − 6 = 9. (Shortcut: equal sharing never changes the gap — 12 − 3 = 9 from the start!) Answer: 9.',
        'Elizabeth − Anthony = 15 − 6 = 9. (Jalan pintas: berbagi merata tidak mengubah selisih — 12 − 3 = 9 dari awal!) Jawaban: 9.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
