// IKMC-19-PE-Q12 — storyboard for the Maya Bee flowers animation.
//
// The question: Maya Bee gathers pollen from flowers that are inside the
// rectangle but outside the triangle. How many? → Answer A (9).
//
// Teaching walk, one idea per beat:
//   0. intro        — show the static scene; name the two regions.
//   1. highlight-tri — shade the triangle to show the EXCLUDED region.
//   2–10. count      — reveal and count qualifying flowers one per beat (9 beats),
//                      running counter shown.
//   11. result       — counter lands on 9 → answer A (green).
//
// The qualifying flower indices (from FLOWERS array in illustration):
//   indices 0-8 are the 9 A-region flowers.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type BeePhaseId =
  | 'intro'
  | 'highlight-tri'
  | `count-${number}`
  | 'result'

export interface BeeBeat {
  phase: BeePhaseId
  /** Show the filled triangle overlay (excluded region). */
  showTriFill: boolean
  /** How many qualifying flowers to show with their reveal ring. */
  revealedCount: number
  /** Running counter to display (0 = hidden). */
  counter: number
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface BeeStoryboard {
  steps: BeeBeat[]
  finalIndex: number
}

export function buildMayaBeeFlowers12Steps(lang: Lang): BeeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BeeBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showTriFill: false,
      revealedCount: 0,
      counter: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Maya Bee collects pollen only from flowers inside the rectangle but outside the triangle.',
        'Maya Bee mengumpulkan serbuk sari hanya dari bunga di dalam persegi panjang tetapi di luar segitiga.',
      ),
    },

    // Beat 1 — highlight triangle as excluded zone
    {
      phase: 'highlight-tri',
      showTriFill: true,
      revealedCount: 0,
      counter: 0,
      hold: 2000,
      result: false,
      caption: t(
        'The blue triangle is the EXCLUDED zone — flowers there don\'t count.',
        'Segitiga biru adalah zona yang DIKECUALIKAN — bunga di sana tidak dihitung.',
      ),
    },

    // Beats 2–10 — reveal 9 qualifying flowers one per beat
    ...Array.from({ length: 9 }, (_, i) => ({
      phase: `count-${i + 1}` as BeePhaseId,
      showTriFill: true,
      revealedCount: i + 1,
      counter: i + 1,
      hold: 1400,
      result: false,
      caption: t(
        `Flower ${i + 1} — inside the rectangle, outside the triangle. Count: ${i + 1}`,
        `Bunga ${i + 1} — di dalam persegi panjang, di luar segitiga. Jumlah: ${i + 1}`,
      ),
    })),

    // Beat 11 — result
    {
      phase: 'result',
      showTriFill: true,
      revealedCount: 9,
      counter: 9,
      hold: 0,
      result: true,
      caption: t(
        '9 flowers qualify — answer A!',
        '9 bunga yang memenuhi syarat — jawaban A!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
