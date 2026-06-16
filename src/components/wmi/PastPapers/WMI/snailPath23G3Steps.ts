// WMI-23F3A-Q5 (2023 Grade 3 Final) — snail crawl, shortest way back.
//
// "A snail starts at A, crawls north 14 cm, west 12 cm, east 29 cm, south 5 cm.
//  At least how many cm must it crawl to get back to A?"  Answer: D = 26.
//
// METHOD (track net displacement on each axis separately — the key trick):
//   Vertical (up/down): north 14, then south 5  → net 14 − 5 = 9 cm NORTH of A.
//   Horizontal (left/right): west 12, then east 29 → net 29 − 12 = 17 cm EAST of A.
// So the snail ends 9 cm north and 17 cm east of A. Crawling back with straight
// lines and right-angle turns (taxicab), the shortest return is
//   17 (go west) + 9 (go south) = 26 cm.
//
// Beat-by-beat we DEDUCE this — we never assert 26. First restate the goal and
// that up/down and left/right are tracked apart; then collapse the vertical
// moves, then the horizontal moves, then state where the snail sits, then add
// the two legs of the return for the answer (choice D). The dashed return path
// is revealed on the figure via the illustrator's `showReturn` prop.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic.

export type Lang = 'en' | 'id'

// The four crawl legs, in order (cm). Bound here so the figure + arithmetic
// never drift from the question stem.
export const MOVES = {
  north: 14,
  west: 12,
  east: 29,
  south: 5,
} as const

export const NET_NORTH = MOVES.north - MOVES.south // 14 − 5 = 9 cm north
export const NET_EAST = MOVES.east - MOVES.west // 29 − 12 = 17 cm east
export const ANSWER = NET_EAST + NET_NORTH // 17 + 9 = 26 cm  (choice D)
export const ANSWER_CHOICE = 'D'

/** Which axis a beat is focused on (drives the figure highlight). */
export type Axis = 'none' | 'vertical' | 'horizontal' | 'both' | 'return'

export interface SnailStep {
  /** Focus for this beat (which legs to spotlight on the figure). */
  axis: Axis
  /** Reveal the dashed return path (17 west + 9 south) on the figure. */
  showReturn: boolean
  /** True only on the final answer beat. */
  result: boolean
  caption: string
  /** Hold time in ms; 0 on the winner, longer on a lingering deduction. */
  hold: number
}

export interface SnailStoryboard {
  netNorth: number
  netEast: number
  answer: number
  answerChoice: string
  steps: SnailStep[]
  finalIndex: number
}

export function buildSnailPathSteps(lang: Lang): SnailStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SnailStep[] = [
    // 1 — restate the goal + the strategy (track up/down and left/right apart).
    {
      axis: 'none',
      showReturn: false,
      result: false,
      hold: 2600,
      caption: t(
        'The snail wanders, then must crawl home to A. Trick: track up–down and left–right on their own.',
        'Siput berjalan, lalu harus pulang ke A. Trik: lacak atas–bawah dan kiri–kanan secara terpisah.',
      ),
    },
    // 2 — vertical net: north 14, south 5 → 9 north.
    {
      axis: 'vertical',
      showReturn: false,
      result: false,
      hold: 2400,
      caption: t(
        `Up–down: north ${MOVES.north}, south ${MOVES.south}. ${MOVES.north} − ${MOVES.south} = ${NET_NORTH} cm north of A.`,
        `Atas–bawah: utara ${MOVES.north}, selatan ${MOVES.south}. ${MOVES.north} − ${MOVES.south} = ${NET_NORTH} cm di utara A.`,
      ),
    },
    // 3 — horizontal net: west 12, east 29 → 17 east.
    {
      axis: 'horizontal',
      showReturn: false,
      result: false,
      hold: 2400,
      caption: t(
        `Left–right: west ${MOVES.west}, east ${MOVES.east}. ${MOVES.east} − ${MOVES.west} = ${NET_EAST} cm east of A.`,
        `Kiri–kanan: barat ${MOVES.west}, timur ${MOVES.east}. ${MOVES.east} − ${MOVES.west} = ${NET_EAST} cm di timur A.`,
      ),
    },
    // 4 — where the snail sits now: 9 north & 17 east of A.
    {
      axis: 'both',
      showReturn: false,
      result: false,
      hold: 2400,
      caption: t(
        `So the snail ends ${NET_NORTH} cm north and ${NET_EAST} cm east of A. That's how far home is.`,
        `Jadi siput berakhir ${NET_NORTH} cm utara dan ${NET_EAST} cm timur A. Sejauh itu jarak pulang.`,
      ),
    },
    // 5 — the return: 17 west + 9 south = 26 cm  → choice D. (winner, holds)
    {
      axis: 'return',
      showReturn: true,
      result: true,
      hold: 0,
      caption: t(
        `Crawl back: ${NET_EAST} west + ${NET_NORTH} south = ${ANSWER} cm. Answer ${ANSWER_CHOICE}.`,
        `Merangkak pulang: ${NET_EAST} barat + ${NET_NORTH} selatan = ${ANSWER} cm. Jawaban ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return {
    netNorth: NET_NORTH,
    netEast: NET_EAST,
    answer: ANSWER,
    answerChoice: ANSWER_CHOICE,
    steps,
    finalIndex: steps.length - 1,
  }
}
