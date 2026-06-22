// IKMC-23-PE-Q8 — storyboard for the road-map crossing animation.
//
// The question: Steven drives from X to Y. At each crossing he stops before
// going straight ahead. How many times does he stop? → Answer D (14 stops).
//
// Teaching walk, one idea per beat:
//   0. intro     — show the static road map; state the rule.
//   1. first-4   — highlight the first 4 crossings on the outer loop.
//   2. next-4    — highlight crossings 5–8 on the middle loop.
//   3. next-4    — highlight crossings 9–12 on the inner loop.
//   4. last-2    — highlight the final 2 crossings near Y.
//   5. result    — total = 14 → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'first-4' | 'next-4' | 'inner-4' | 'last-2' | 'result'

export interface MapBeat {
  phase: PhaseId
  /** How many crossing dots to highlight (cumulative). */
  litCount: number
  /** Equation / running tally shown below the figure; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface MapStoryboard {
  steps: MapBeat[]
  finalIndex: number
}

export function buildRoadMap8PESteps(lang: Lang): MapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MapBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      litCount: 0,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Steven drives from X to Y. He stops only when going straight through a crossing — not when turning.',
        'Steven berkendara dari X ke Y. Dia berhenti hanya saat melanjutkan lurus di persimpangan — bukan saat berbelok.',
      ),
    },

    // Beat 1 — first 4 stops
    {
      phase: 'first-4',
      litCount: 4,
      equation: '4',
      hold: 2200,
      result: false,
      caption: t(
        'Along the outer loop: 4 straight-through crossings → 4 stops so far.',
        'Di putaran luar: 4 persimpangan lurus → sudah 4 berhenti.',
      ),
    },

    // Beat 2 — stops 5–8
    {
      phase: 'next-4',
      litCount: 8,
      equation: '4 + 4 = 8',
      hold: 2200,
      result: false,
      caption: t(
        'Continuing on the middle loop: 4 more straight crossings → 8 stops total.',
        'Melanjutkan di putaran tengah: 4 persimpangan lurus lagi → total 8 berhenti.',
      ),
    },

    // Beat 3 — stops 9–12
    {
      phase: 'inner-4',
      litCount: 12,
      equation: '8 + 4 = 12',
      hold: 2200,
      result: false,
      caption: t(
        'Inner loop: 4 more straight crossings → 12 stops total.',
        'Putaran dalam: 4 persimpangan lurus lagi → total 12 berhenti.',
      ),
    },

    // Beat 4 — last 2 stops
    {
      phase: 'last-2',
      litCount: 14,
      equation: '12 + 2 = 14',
      hold: 2200,
      result: false,
      caption: t(
        '2 final straight crossings approaching Y → 14 stops total.',
        '2 persimpangan lurus terakhir menuju Y → total 14 berhenti.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      litCount: 14,
      equation: '14 → D',
      hold: 0,
      result: true,
      caption: t(
        'Steven stops 14 times in total — answer D.',
        'Steven berhenti 14 kali secara total — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
