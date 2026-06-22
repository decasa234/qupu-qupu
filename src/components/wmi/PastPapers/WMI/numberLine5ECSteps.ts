// IKMC-22-EC-Q5 — storyboard for Kengu's number-line jump animation.
//
// Problem: Kengu starts at 0. Each cycle = one large jump (+2) then two small
// jumps (+1 each) = +4 per cycle. From 0 to 16 needs 16 ÷ 4 = 4 cycles.
// Total jumps = 4 cycles × 3 jumps = 12. Answer E.
//
// Quantities bound to seed breakdown.quantities:
//   largeJump = 2, smallJump = 1, distPerCycle = 4, cycles = 4, totalJumps = 12
//
// Teaching walk, one idea per beat:
//   0. intro         — show the number line, Kengu at 0, no arcs yet.
//   1. cycle-pattern — show one full cycle (2+1+1=4) landing at 4.
//   2. cycles-count  — show 16 ÷ 4 = 4 cycles (positions 0,4,8,12,16 labelled).
//   3. jumps-per     — highlight 3 jumps in the first cycle.
//   4. total         — 4 × 3 = 12 total jumps → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'cycle-pattern' | 'cycles-count' | 'jumps-per' | 'total'

export interface KenguBeat {
  phase: PhaseId
  /** How many complete cycles to render (0‥4). */
  cyclesShown: number
  /** Highlight the cycle-0 arc labels (+2, +1, +1). */
  showCycleLabels: boolean
  /** Show the jump-count badge in cycle 0 (circled 1, 2, 3). */
  showJumpBadges: boolean
  /** Equation / maths line to display; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface KenguStoryboard {
  steps: KenguBeat[]
  finalIndex: number
}

export function buildNumberLine5ECSteps(lang: Lang): KenguStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KenguBeat[] = [
    // Beat 0 — intro: show the number line, Kengu at 0, no arcs
    {
      phase: 'intro',
      cyclesShown: 0,
      showCycleLabels: false,
      showJumpBadges: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Kengu starts at 0. Each cycle: one large jump (+2) then two small jumps (+1 each).',
        'Kengu mulai dari 0. Setiap siklus: satu lompatan besar (+2) lalu dua lompatan kecil (+1 masing-masing).',
      ),
    },

    // Beat 1 — show one full cycle (large + small + small = +4)
    {
      phase: 'cycle-pattern',
      cyclesShown: 1,
      showCycleLabels: true,
      showJumpBadges: false,
      equation: '2 + 1 + 1 = 4',
      hold: 2400,
      result: false,
      caption: t(
        'One cycle covers 2 + 1 + 1 = 4 on the number line.',
        'Satu siklus mencakup 2 + 1 + 1 = 4 pada garis bilangan.',
      ),
    },

    // Beat 2 — show all 4 cycles reaching 16
    {
      phase: 'cycles-count',
      cyclesShown: 4,
      showCycleLabels: false,
      showJumpBadges: false,
      equation: '16 ÷ 4 = 4 cycles',
      hold: 2400,
      result: false,
      caption: t(
        'Kengu goes from 0 to 16 → 16 ÷ 4 = 4 cycles.',
        'Kengu pergi dari 0 ke 16 → 16 ÷ 4 = 4 siklus.',
      ),
    },

    // Beat 3 — highlight 3 jumps in cycle 0
    {
      phase: 'jumps-per',
      cyclesShown: 1,
      showCycleLabels: false,
      showJumpBadges: true,
      equation: '3 jumps per cycle',
      hold: 2400,
      result: false,
      caption: t(
        'Each cycle has 3 jumps: 1 large + 2 small.',
        'Setiap siklus memiliki 3 lompatan: 1 besar + 2 kecil.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'total',
      cyclesShown: 4,
      showCycleLabels: false,
      showJumpBadges: false,
      equation: '4 × 3 = 12',
      hold: 0,
      result: true,
      caption: t(
        '4 cycles × 3 jumps = 12 total jumps → answer E.',
        '4 siklus × 3 lompatan = 12 lompatan total → jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
