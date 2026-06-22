// IKMC-22-PE-Q20 — step-by-step solution storyboard for the Dino rooms animation.
//
// The question: Dino moves from the entrance to the exit through numbered rooms
// (1–8 in a 2-row × 4-column grid), visiting each room at most once and adding
// up the room numbers. What is the highest total?
//
// Room layout:
//   Row 0 (top):    1  2  3  4
//   Row 1 (bottom): 5  6  7  8
//   Entrance: left of room 1.   Exit: right of room 8.
//
// All adjacent rooms share a passable doorway (dashed walls in the original scan).
// The grid is fully connected — every room is reachable from every other room.
//
// Key paths (verified by enumeration):
//   • 1→5→6→7→8                 = 27  (answer A — fewest rooms)
//   • 1→2→6→7→8                 = 24  (not a choice — shorter)
//   • 1→5→6→2→3→7→8             = 32  (answer C, 7 rooms skipping 4)
//   • 1→5→6→7→3→4→8             = 34  (answer D — BEST PATH, skips room 2)
//   • All 8 rooms: 1→2→3→4→8→7→6→5→... ends at 5, NOT at 8 ✗
//     Or: 1→5→6→7→8→4→3→2→... ends at 2, NOT at 8 ✗
//     → No Hamiltonian path from 1 to 8 exists, so sum=36 is impossible.
//
// Best valid path: 1 → 5 → 6 → 7 → 3 → 4 → 8
//   (go down to bottom row, snake right, jump up at col 3, finish top-right→exit)
//   Total = 1 + 5 + 6 + 7 + 3 + 4 + 8 = 34 → answer D.
//
// Animation beats (one step per room entered):
//   0. intro    — show grid; Dino at entrance; "Start!"
//   1. room 1   — enter room 1;  running total:  1
//   2. room 5   — enter room 5;  running total:  6
//   3. room 6   — enter room 6;  running total: 12
//   4. room 7   — enter room 7;  running total: 19
//   5. room 3   — enter room 3;  running total: 22
//   6. room 4   — enter room 4;  running total: 26
//   7. room 8   — enter room 8;  running total: 34 → answer D
//   8. result   — reveal total 34; all rooms on winning path glow green
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type RoomPhase = 'intro' | 'walk' | 'result'

export interface RoomBeat {
  /** Animation phase. */
  phase: RoomPhase
  /** Room numbers visited so far (for trail overlay), as "n1-n2-..." string. */
  litPath: string
  /** Most recent room entered (highlighted). */
  activeRoom: number | null
  /** Running sum of room numbers visited. */
  total: number
  /** Equation / maths line shown below the figure. */
  equation: string
  /** Caption / explanation text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
  /** Show answer circle on room 8. */
  showAnswer: boolean
}

export interface RoomStoryboard {
  steps: RoomBeat[]
  finalIndex: number
}

// The winning route, in visit order.
const WINNING_ROOMS = [1, 5, 6, 7, 3, 4, 8] as const

export function buildRooms20PESteps(lang: Lang): RoomStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: RoomBeat[] = []

  // ── Beat 0: intro ────────────────────────────────────────────────────────
  steps.push({
    phase: 'intro',
    litPath: '',
    activeRoom: null,
    total: 0,
    equation: '',
    hold: 2200,
    result: false,
    showAnswer: false,
    caption: t(
      'Dino enters room 1 from the left. He adds each room\'s number to his total. Which path gives the highest total?',
      'Dino masuk dari kiri ke ruangan 1. Ia menjumlahkan angka setiap ruangan yang dilewatinya. Jalur mana yang memberikan total tertinggi?',
    ),
  })

  // ── Beats 1–7: one room per beat ─────────────────────────────────────────
  const visited: number[] = []
  let running = 0

  for (let i = 0; i < WINNING_ROOMS.length; i++) {
    const room = WINNING_ROOMS[i]
    visited.push(room)
    running += room
    const isLast = i === WINNING_ROOMS.length - 1

    const eqText = isLast
      ? t(`${running} → D`, `${running} → D`)
      : `${t('Total', 'Total')}: ${running}`

    const captionText = isLast
      ? t(
          `Room 8: +8. Total = ${running}. Dino exits — highest total is 34! Answer D.`,
          `Ruangan 8: +8. Total = ${running}. Dino keluar — total tertinggi adalah 34! Jawaban D.`,
        )
      : i === 0
        ? t(
            `Room 1: +1. Dino enters from the entrance. Total: ${running}.`,
            `Ruangan 1: +1. Dino masuk dari pintu masuk. Total: ${running}.`,
          )
        : t(
            `Room ${room}: +${room}. Total so far: ${running}.`,
            `Ruangan ${room}: +${room}. Total sejauh ini: ${running}.`,
          )

    steps.push({
      phase: isLast ? 'result' : 'walk',
      litPath: visited.join('-'),
      activeRoom: room,
      total: running,
      equation: eqText,
      hold: isLast ? 0 : 2000,
      result: isLast,
      showAnswer: isLast,
      caption: captionText,
    })
  }

  // ── Beat 8: result summary ────────────────────────────────────────────────
  // (last walk beat already has result: true, so no separate beat needed;
  //  the explainer treats result:true as the final hold-forever state)

  return { steps, finalIndex: steps.length - 1 }
}
