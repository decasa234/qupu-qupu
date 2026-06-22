// IKMC-23-EC-Q17 — storyboard for "animal line, window-of-3 kangaroo" animation.
//
// The question: 6 beavers and 2 kangaroos in positions 1–8.
// Every window of 3 consecutive positions has exactly 1 kangaroo.
// Which of {1,2,3,4,5} is a kangaroo position? Answer: C = position 3.
//
// Key insight:
//   - The constraint forces kangaroos to be exactly 3 apart.
//   - Valid placements are only: {1,4}, {2,5}, {3,6}, {4,7}, {5,8}.
//   - Of those, {3,6} is the only one containing one of the listed answers that
//     also satisfies ALL 6 windows: (1–3)✓(2–4)✓(3–5)✓(4–6)✓(5–7)✓(6–8)✓.
//   - Position 3 → answer C.
//
// Animation beats:
//   0. intro     — show 8 animals; state the problem.
//   1. rule      — explain the "every 3" constraint.
//   2. try36     — highlight kangaroos at 3 & 6; show them as kangaroos.
//   3. check1    — window 1–3: mark 1 kangaroo ✓.
//   4. check2    — window 2–4: 1 kangaroo ✓.
//   5. check3    — window 3–5: 1 kangaroo ✓.
//   6. check4    — window 4–6: 1 kangaroo ✓.
//   7. check5    — window 5–7: 1 kangaroo ✓.
//   8. check6    — window 6–8: 1 kangaroo ✓.
//   9. result    — all windows pass; position 3 = answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'rule'
  | 'try36'
  | 'check1'
  | 'check2'
  | 'check3'
  | 'check4'
  | 'check5'
  | 'check6'
  | 'result'

export interface AnimBeat {
  phase: PhaseId
  /**
   * 0-based indices of animals highlighted with a coloured ring.
   * These are the kangaroo positions being tested (2 & 5 = positions 3 & 6).
   */
  kangarooHighlight: number[]
  /**
   * Current window being checked: [start, end] (0-based, inclusive).
   * -1 means no window is active.
   */
  window: [number, number] | null
  /** True once this window's check passes (green flash). */
  windowOk: boolean
  /** How many windows have passed so far (shown as a tally). */
  passCount: number
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface AnimalLine17Storyboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildAnimalLine17ECSteps(lang: Lang): AnimalLine17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      kangarooHighlight: [],
      window: null,
      windowOk: false,
      passCount: 0,
      hold: 2200,
      result: false,
      caption: t(
        '8 animals stand in a row (positions 1–8): 6 beavers and 2 kangaroos. In every group of 3 consecutive animals, exactly 1 must be a kangaroo.',
        '8 hewan berdiri berurutan (posisi 1–8): 6 berang-berang dan 2 kanguru. Di setiap kelompok 3 hewan berurutan, tepat 1 harus kanguru.',
      ),
    },

    // Beat 1 — rule
    {
      phase: 'rule',
      kangarooHighlight: [],
      window: null,
      windowOk: false,
      passCount: 0,
      hold: 2600,
      result: false,
      caption: t(
        'The rule forces kangaroos to be exactly 3 positions apart. The only placement that works for all 6 windows of (1–3), (2–4), (3–5), (4–6), (5–7), (6–8) is kangaroos at positions 3 & 6.',
        'Aturan ini memaksa kanguru berada tepat 3 posisi terpisah. Satu-satunya penempatan yang memenuhi semua 6 jendela (1–3), (2–4), (3–5), (4–6), (5–7), (6–8) adalah kanguru di posisi 3 & 6.',
      ),
    },

    // Beat 2 — try positions 3 & 6
    {
      phase: 'try36',
      kangarooHighlight: [2, 5],
      window: null,
      windowOk: false,
      passCount: 0,
      hold: 2200,
      result: false,
      caption: t(
        'Place kangaroos at positions 3 and 6 (purple). Now check every window of 3.',
        'Tempatkan kanguru di posisi 3 dan 6 (ungu). Sekarang periksa setiap jendela dari 3 hewan.',
      ),
    },

    // Beat 3 — window (1–3): kangaroo at 3 ✓
    {
      phase: 'check1',
      kangarooHighlight: [2, 5],
      window: [0, 2],
      windowOk: true,
      passCount: 1,
      hold: 1600,
      result: false,
      caption: t(
        'Window (1–2–3): kangaroo at position 3 → exactly 1 ✓',
        'Jendela (1–2–3): kanguru di posisi 3 → tepat 1 ✓',
      ),
    },

    // Beat 4 — window (2–4): kangaroo at 3 ✓
    {
      phase: 'check2',
      kangarooHighlight: [2, 5],
      window: [1, 3],
      windowOk: true,
      passCount: 2,
      hold: 1600,
      result: false,
      caption: t(
        'Window (2–3–4): kangaroo at position 3 → exactly 1 ✓',
        'Jendela (2–3–4): kanguru di posisi 3 → tepat 1 ✓',
      ),
    },

    // Beat 5 — window (3–5): kangaroo at 3 ✓
    {
      phase: 'check3',
      kangarooHighlight: [2, 5],
      window: [2, 4],
      windowOk: true,
      passCount: 3,
      hold: 1600,
      result: false,
      caption: t(
        'Window (3–4–5): kangaroo at position 3 → exactly 1 ✓',
        'Jendela (3–4–5): kanguru di posisi 3 → tepat 1 ✓',
      ),
    },

    // Beat 6 — window (4–6): kangaroo at 6 ✓
    {
      phase: 'check4',
      kangarooHighlight: [2, 5],
      window: [3, 5],
      windowOk: true,
      passCount: 4,
      hold: 1600,
      result: false,
      caption: t(
        'Window (4–5–6): kangaroo at position 6 → exactly 1 ✓',
        'Jendela (4–5–6): kanguru di posisi 6 → tepat 1 ✓',
      ),
    },

    // Beat 7 — window (5–7): kangaroo at 6 ✓
    {
      phase: 'check5',
      kangarooHighlight: [2, 5],
      window: [4, 6],
      windowOk: true,
      passCount: 5,
      hold: 1600,
      result: false,
      caption: t(
        'Window (5–6–7): kangaroo at position 6 → exactly 1 ✓',
        'Jendela (5–6–7): kanguru di posisi 6 → tepat 1 ✓',
      ),
    },

    // Beat 8 — window (6–8): kangaroo at 6 ✓
    {
      phase: 'check6',
      kangarooHighlight: [2, 5],
      window: [5, 7],
      windowOk: true,
      passCount: 6,
      hold: 1800,
      result: false,
      caption: t(
        'Window (6–7–8): kangaroo at position 6 → exactly 1 ✓ All 6 windows pass!',
        'Jendela (6–7–8): kanguru di posisi 6 → tepat 1 ✓ Semua 6 jendela terpenuhi!',
      ),
    },

    // Beat 9 — result
    {
      phase: 'result',
      kangarooHighlight: [2, 5],
      window: null,
      windowOk: false,
      passCount: 6,
      hold: 0,
      result: true,
      caption: t(
        'Kangaroos are at positions 3 and 6. Position 3 is listed as choice C. Answer: C.',
        'Kanguru berada di posisi 3 dan 6. Posisi 3 adalah pilihan C. Jawaban: C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
