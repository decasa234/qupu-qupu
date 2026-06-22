import type { RingColour } from './Rings9ECIllustration'

type Lang = 'en' | 'id'

export interface Ring9ECStep {
  /** Which rings are coloured at this beat [outer→inner], length 5. */
  colours: readonly RingColour[]
  /** Number of red rings revealed so far (for the running tally badge). */
  redCount: number
  /** Whether this is the final beat (answer confirmed). */
  result: boolean
  /** Auto-advance hold duration in ms. */
  hold: number
  /** Caption text for this beat. */
  caption: string
  /** Short equation / tally badge (empty string = hide). */
  equation: string
}

export interface Ring9ECStory {
  steps: Ring9ECStep[]
  finalIndex: number
}

/**
 * Beat storyboard for IKMC-20-EC-Q9.
 *
 * Logic (bound to seed breakdown.quantities):
 *   Ring 1 (outer): red (given)
 *   Ring 2: not-red (blue / yellow — must differ from ring 1)
 *   Ring 3: red (must differ from ring 2)
 *   Ring 4: not-red
 *   Ring 5 (inner): red (must differ from ring 4)
 *   → 3 red rings → answer C (3).
 */
export function buildRings9ECSteps(lang: Lang): Ring9ECStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const W: RingColour = 'white'
  const R: RingColour = 'red'
  const N: RingColour = 'not-red'

  const steps: Ring9ECStep[] = [
    {
      colours: [W, W, W, W, W],
      redCount: 0,
      result: false,
      hold: 1600,
      equation: '',
      caption: t(
        'The pattern has 5 concentric rings. Adjacent rings must have different colours.',
        'Pola ini memiliki 5 cincin konsentris. Cincin yang berdekatan harus berwarna berbeda.',
      ),
    },
    {
      colours: [R, W, W, W, W],
      redCount: 1,
      result: false,
      hold: 1800,
      equation: 'Ring 1 = red',
      caption: t(
        'Ring 1 (outer) is given as red.',
        'Cincin 1 (terluar) sudah ditentukan merah.',
      ),
    },
    {
      colours: [R, N, W, W, W],
      redCount: 1,
      result: false,
      hold: 1800,
      equation: 'Ring 2 ≠ red',
      caption: t(
        'Ring 2 touches ring 1, so it cannot be red — blue or yellow.',
        'Cincin 2 bersentuhan dengan cincin 1, jadi tidak bisa merah — harus biru atau kuning.',
      ),
    },
    {
      colours: [R, N, R, W, W],
      redCount: 2,
      result: false,
      hold: 1800,
      equation: 'Ring 3 = red',
      caption: t(
        'Ring 3 touches ring 2 (not red), so ring 3 can be red again.',
        'Cincin 3 bersentuhan dengan cincin 2 (bukan merah), sehingga cincin 3 bisa merah lagi.',
      ),
    },
    {
      colours: [R, N, R, N, W],
      redCount: 2,
      result: false,
      hold: 1800,
      equation: 'Ring 4 ≠ red',
      caption: t(
        'Ring 4 touches ring 3 (red), so it cannot be red.',
        'Cincin 4 bersentuhan dengan cincin 3 (merah), sehingga tidak bisa merah.',
      ),
    },
    {
      colours: [R, N, R, N, R],
      redCount: 3,
      result: false,
      hold: 1800,
      equation: 'Ring 5 = red',
      caption: t(
        'Ring 5 (inner) touches ring 4 (not red), so ring 5 is red.',
        'Cincin 5 (terdalam) bersentuhan dengan cincin 4 (bukan merah), sehingga cincin 5 merah.',
      ),
    },
    {
      colours: [R, N, R, N, R],
      redCount: 3,
      result: true,
      hold: 0,
      equation: '1 + 1 + 1 = 3',
      caption: t(
        'Rings 1, 3, and 5 are red — 3 red regions. Answer C.',
        'Cincin 1, 3, dan 5 berwarna merah — 3 daerah merah. Jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
