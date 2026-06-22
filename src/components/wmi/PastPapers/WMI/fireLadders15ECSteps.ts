// IKMC-21-EC-Q15 — storyboard for the fire-escape ladder animation.
//
// Problem: A tall building has 4 fire-escape ladders. The tops of 3 ladders are
// labelled (48, 36, 32). The 4th (shortest) is unlabelled. Use the building's
// uniform floor grid to read off the missing height. Answer: D (20).
//
// Teaching walk, one idea per beat:
//   0. intro    — show the static building + all 4 ladders; label the three known heights.
//   1. scale    — highlight the grid: each floor is 4 units; count the floors.
//   2. locate   — zoom in on the shortest ladder; show it reaches floor 5 = 20 units.
//   3. verify   — confirm 20 is shorter than 32, 36, 48.
//   4. result   — 20 → answer D (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type LadderPhaseId = 'intro' | 'scale' | 'locate' | 'verify' | 'result'

export interface LadderBeat {
  phase: LadderPhaseId
  /** Highlight the floor grid lines with unit labels */
  showGrid: boolean
  /** Highlight the shortest (unlabelled) ladder */
  highlightShortest: boolean
  /** Show a bracket annotating the shortest ladder's height */
  showShortestBracket: boolean
  /** Show the comparison row (shortest < 32, 36, 48) */
  showComparison: boolean
  /** Equation / maths line; '' to hide */
  equation: string
  /** Caption text */
  caption: string
  /** Auto-hold in ms (0 = final / manual) */
  hold: number
  /** True only on the result beat */
  result: boolean
}

export interface LadderStoryboard {
  steps: LadderBeat[]
  finalIndex: number
}

export function buildFireLadders15ECSteps(lang: Lang): LadderStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LadderBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showGrid: false,
      highlightShortest: false,
      showShortestBracket: false,
      showComparison: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A building has 4 fire-escape ladders. Three ladder heights are labelled: 48, 36 and 32.',
        'Sebuah gedung memiliki 4 tangga darurat. Ketinggian 3 tangga diberi label: 48, 36, dan 32.',
      ),
    },

    // Beat 1 — show the grid scale
    {
      phase: 'scale',
      showGrid: true,
      highlightShortest: false,
      showShortestBracket: false,
      showComparison: false,
      equation: '1 floor = 4 units',
      hold: 2200,
      result: false,
      caption: t(
        'The building grid shows equal floors. Each floor is 4 units tall. Count 12 floors → top of building = 48 units.',
        'Kisi bangunan menunjukkan lantai yang sama tinggi. Setiap lantai = 4 satuan. Hitung 12 lantai → puncak = 48 satuan.',
      ),
    },

    // Beat 2 — locate the shortest ladder
    {
      phase: 'locate',
      showGrid: true,
      highlightShortest: true,
      showShortestBracket: true,
      showComparison: false,
      equation: '5 floors × 4 = 20',
      hold: 2200,
      result: false,
      caption: t(
        'The unlabelled (shortest) ladder reaches 5 floors up. 5 × 4 = 20 units.',
        'Tangga yang tidak diberi label (terpendek) mencapai 5 lantai. 5 × 4 = 20 satuan.',
      ),
    },

    // Beat 3 — verify it is the shortest
    {
      phase: 'verify',
      showGrid: false,
      highlightShortest: true,
      showShortestBracket: true,
      showComparison: true,
      equation: '20 < 32 < 36 < 48',
      hold: 2200,
      result: false,
      caption: t(
        '20 is indeed less than 32, 36, and 48 — so it is the shortest ladder.',
        '20 memang kurang dari 32, 36, dan 48 — jadi itulah tangga yang paling pendek.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showGrid: false,
      highlightShortest: true,
      showShortestBracket: true,
      showComparison: false,
      equation: '20 → D',
      hold: 0,
      result: true,
      caption: t(
        'The shortest ladder is 20 units tall — answer D.',
        'Tinggi tangga terpendek adalah 20 satuan — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
