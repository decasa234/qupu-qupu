import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-25F1A-Q20 (2025 G1 final). A row of 12 seats. Wherever Lisa sits she ends
// up next to an occupied seat — so EVERY empty seat must already have an
// occupied neighbour. One person "covers" their own seat plus the two seats
// beside it (3 seats), so people spaced every 3rd seat cover the whole row with
// no gaps: seats 2, 5, 8, 11 (1-based). That's 4 people, the fewest possible
// (3 people can cover at most 9 seats, leaving a gap in a row of 12).
//
// The storyboard adds one person per beat and shows the empty seats each newly
// seated person covers, building occupied [1] → [1,4] → [1,4,7] → [1,4,7,10]
// (0-based) until every seat is covered. Result beat lands on 4.

export const SEAT_COUNT = 12

/** 0-based seat indices where people sit, spaced every 3rd seat. */
export const PLAN = [1, 4, 7, 10] // 1-based seats 2, 5, 8, 11
export const ANSWER = PLAN.length // 4

export type TheaterPhase = 'goal' | 'place' | 'gap' | 'result'

export interface TheaterStep {
  phase: TheaterPhase
  /** 0-based seats with a person, after this beat's placement. */
  occupied: number[]
  /** 0-based empty seats that have an occupied neighbour (covered) this beat. */
  covered: number[]
  /** The seat (0-based) just added this beat, or null on goal/result. */
  placed: number | null
  /** How many people are seated so far. */
  count: number
  /** Total seats covered so far (occupied + their covered empties). */
  coveredCount: number
  caption: string
  hold: number
  result: boolean
}

export interface TheaterStoryboard {
  answer: number
  steps: TheaterStep[]
  finalIndex: number
}

/** Empty seats adjacent to any occupied seat, given an occupied set. */
function coveredEmpties(occupied: number[]): number[] {
  const occ = new Set(occupied)
  const out: number[] = []
  for (let i = 0; i < SEAT_COUNT; i++) {
    if (occ.has(i)) continue
    if (occ.has(i - 1) || occ.has(i + 1)) out.push(i)
  }
  return out
}

export function buildTheaterSeats25G1Steps(lang: Lang): TheaterStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TheaterStep[] = [
    {
      phase: 'goal',
      occupied: [],
      covered: [],
      placed: null,
      count: 0,
      coveredCount: 0,
      hold: 2100,
      result: false,
      caption: t(
        'Every empty seat needs an occupied neighbour. Use the fewest people.',
        'Setiap kursi kosong butuh tetangga yang terisi. Pakai orang paling sedikit.',
      ),
    },
    {
      phase: 'goal',
      occupied: [],
      covered: [],
      placed: null,
      count: 0,
      coveredCount: 0,
      hold: 2100,
      result: false,
      caption: t(
        'One person guards their own seat and the seat on each side — 3 seats.',
        'Satu orang menjaga kursinya sendiri dan kursi di kedua sisinya — 3 kursi.',
      ),
    },
  ]

  // Add people one per beat, spaced every 3rd seat, showing newly-covered seats.
  const occ: number[] = []
  PLAN.forEach((seat) => {
    occ.push(seat)
    const covered = coveredEmpties(occ)
    const coveredCount = occ.length + covered.length
    const seat1 = seat + 1
    steps.push({
      phase: 'place',
      occupied: [...occ],
      covered,
      placed: seat,
      count: occ.length,
      coveredCount,
      hold: 2100,
      result: false,
      caption: t(
        `Person ${occ.length} sits in seat ${seat1} — now ${coveredCount} seats are safe.`,
        `Orang ke-${occ.length} duduk di kursi ${seat1} — kini ${coveredCount} kursi aman.`,
      ),
    })
  })

  // Why 3 cannot work: 3 people guard at most 9 seats, leaving a gap in a row of 12.
  steps.push({
    phase: 'gap',
    occupied: [...PLAN],
    covered: coveredEmpties(PLAN),
    placed: null,
    count: ANSWER,
    coveredCount: SEAT_COUNT,
    hold: 2100,
    result: false,
    caption: t(
      'Only 3 people guard at most 9 seats — a row of 12 would still have a gap.',
      'Hanya 3 orang menjaga paling banyak 9 kursi — baris 12 masih ada celah.',
    ),
  })

  // Result: every seat covered with 4 people spaced every 3rd seat.
  steps.push({
    phase: 'result',
    occupied: [...PLAN],
    covered: coveredEmpties(PLAN),
    placed: null,
    count: ANSWER,
    coveredCount: SEAT_COUNT,
    hold: 0,
    result: true,
    caption: t(
      `Seats 2, 5, 8, 11 cover all 12 — the fewest is ${ANSWER} people.`,
      `Kursi 2, 5, 8, 11 menutup semua 12 — paling sedikit ${ANSWER} orang.`,
    ),
  })

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
