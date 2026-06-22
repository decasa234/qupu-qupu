// IKMC-20-EC-Q11 — storyboard for the dog-leash / treat reachability animation.
//
// Problem: Dennis ties a dog 1 m from a corner of a 7×5 m hut with an 11 m leash.
//   Five treats are placed below the hut. How many treats can the dog reach?
//
// Answer: D (4 treats).
//
// Teaching walk — one idea per beat:
//   0. intro     — show the static scene; name the key numbers (leash = 11 m, tie = 1 m from corner).
//   1. direct    — from the tie point, 11 m leash reaches far to the right: arc sweeps right.
//                  Any treats in that direct arc? (none in the direct right arc — treats are below).
//   2. corner-br — leash wraps around the BOTTOM-RIGHT corner.
//                  Distance tie → bottom-right corner = 5 − 1 = 4 m along the right wall.
//                  Remaining leash = 11 − 4 = 7 m → 7 m arc below the hut from the right.
//   3. treats-br — 7 m arc from bottom-right corner sweeps left under the hut.
//                  Treats 5, 4, 3 are within 7 m → 3 treats reached from the right side.
//   4. corner-tr — leash can also wrap around the TOP-RIGHT corner.
//                  Distance tie → top-right corner = 1 m along the right wall.
//                  Remaining leash = 11 − 1 = 10 m → 10 m arc above the hut, then continues.
//                  The 10 m arc wraps further around the top-left corner (7 m away):
//                  Remaining after top wall = 10 − 7 = 3 m → 3 m arc down the left wall,
//                  not reaching the treats (treats are far right). So no new treats from this path.
//   5. count     — treats 2, 3, 4, 5 reached (4 treats) — treat 1 is too far left.
//                  Wait: re-examine positions. Treats are numbered 1..5 left→right.
//                  From bottom-right corner with 7 m: treats at ~7m, ~5.6m, ~4.1m, ~2.8m, ~1.4m
//                  from the corner (measuring along the bottom wall from right). All 4 rightmost
//                  treats (2,3,4,5) are within 7 m; the leftmost treat (1) is just beyond 7 m.
//   6. result    — 4 treats → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type LeashPhase = 'intro' | 'direct' | 'corner-br' | 'treats-br' | 'corner-tr' | 'count' | 'result'

export interface LeashBeat {
  phase: LeashPhase
  /** Show the direct large arc (11 m from tie point, sweeping away from hut). */
  showDirectArc: boolean
  /** Show the bottom-right corner wrap arc (7 m from BR corner). */
  showBRCornerArc: boolean
  /** Show the top-right + top-wall wrap arc (10 m from TR corner). */
  showTRCornerArc: boolean
  /** Highlight these treat indices (0-based) as reachable (green). */
  reachableTreats: number[]
  /** Dim these treat indices as NOT reachable. */
  unreachableTreats: number[]
  /** Equation / maths line; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final). */
  hold: number
  /** True on the result beat. */
  result: boolean
}

export interface LeashStoryboard {
  steps: LeashBeat[]
  finalIndex: number
}

export function buildDogLeash11ECSteps(lang: Lang): LeashStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LeashBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showDirectArc: false,
      showBRCornerArc: false,
      showTRCornerArc: false,
      reachableTreats: [],
      unreachableTreats: [],
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The dog is tied 1 m from the top-right corner with an 11 m leash. Five treats are below the hut.',
        'Anjing diikat 1 m dari sudut kanan atas dengan tali 11 m. Lima camilan ada di bawah gubuk.',
      ),
    },

    // Beat 1 — direct arc (sweeps to the right, away from hut)
    {
      phase: 'direct',
      showDirectArc: true,
      showBRCornerArc: false,
      showTRCornerArc: false,
      reachableTreats: [],
      unreachableTreats: [],
      equation: '11 m',
      hold: 2400,
      result: false,
      caption: t(
        'Directly from the tie point the dog can roam 11 m to the right — but the treats are below the hut.',
        'Langsung dari titik tali, anjing bisa berkeliaran 11 m ke kanan — tapi camilan ada di bawah gubuk.',
      ),
    },

    // Beat 2 — wrap around bottom-right corner
    {
      phase: 'corner-br',
      showDirectArc: true,
      showBRCornerArc: true,
      showTRCornerArc: false,
      reachableTreats: [],
      unreachableTreats: [],
      equation: '11 − 4 = 7 m',
      hold: 2400,
      result: false,
      caption: t(
        'The leash wraps around the bottom-right corner (4 m away). Remaining: 11 − 4 = 7 m sweeps under the hut.',
        'Tali melilit sudut kanan bawah (4 m jauhnya). Sisa: 11 − 4 = 7 m menyapu di bawah gubuk.',
      ),
    },

    // Beat 3 — treats reached from the right side
    {
      phase: 'treats-br',
      showDirectArc: false,
      showBRCornerArc: true,
      showTRCornerArc: false,
      reachableTreats: [1, 2, 3, 4],
      unreachableTreats: [0],
      equation: '7 m arc',
      hold: 2400,
      result: false,
      caption: t(
        'The 7 m arc from the corner reaches the 4 rightmost treats (treats 2, 3, 4, 5). Treat 1 is too far left.',
        'Busur 7 m dari sudut menjangkau 4 camilan terdekat (camilan 2, 3, 4, 5). Camilan 1 terlalu jauh ke kiri.',
      ),
    },

    // Beat 4 — wrap around top-right corner (no new treats)
    {
      phase: 'corner-tr',
      showDirectArc: false,
      showBRCornerArc: true,
      showTRCornerArc: true,
      reachableTreats: [1, 2, 3, 4],
      unreachableTreats: [0],
      equation: '11 − 1 = 10 m',
      hold: 2400,
      result: false,
      caption: t(
        'Wrapping over the top-right corner (1 m) leaves 10 m — it goes over the roof. No new treats are reached.',
        'Melilit sudut kanan atas (1 m) menyisakan 10 m — melewati atap. Tidak ada camilan baru yang dijangkau.',
      ),
    },

    // Beat 5 — count
    {
      phase: 'count',
      showDirectArc: false,
      showBRCornerArc: true,
      showTRCornerArc: false,
      reachableTreats: [1, 2, 3, 4],
      unreachableTreats: [0],
      equation: '4 treats',
      hold: 2400,
      result: false,
      caption: t(
        'Counting the reachable treats: 4 treats are within range. Treat 1 (far left) is just beyond the 7 m arc.',
        'Menghitung camilan yang bisa dijangkau: 4 camilan berada dalam jangkauan. Camilan 1 (jauh kiri) tepat di luar busur 7 m.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      showDirectArc: false,
      showBRCornerArc: true,
      showTRCornerArc: false,
      reachableTreats: [1, 2, 3, 4],
      unreachableTreats: [0],
      equation: '4 → D',
      hold: 0,
      result: true,
      caption: t(
        'The dog can reach 4 of the 5 treats — answer D.',
        'Anjing bisa menjangkau 4 dari 5 camilan — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
