// WMI-25F1A-Q23 (2025 Grade 1 Final) — students' homes map, FARTHEST Alex→Emma walk.
//
// "The map shows distances between some students' homes. If Alex walks from his
//  home to Emma's home, using each road at most once, what is the farthest
//  distance he can walk, in cm?"  Answer: 29 (fill-in).
//
// GRAPH (cm): Alex–Sam 8, Sam–Donald 6, Donald–Emma 4, Alex–Olivia 7,
//             Olivia–Leo 5, Leo–Donald 6, Leo–Emma 9.
//
// METHOD (deduce, then try-and-eliminate the tempting wrong turns — never jump
// to the answer). We want the LONGEST walk, not the shortest — so take the
// scenic route, extending the lit path one home per beat with a running total:
//   • Start Alex → Sam = 8.
//   • Sam → Donald = 6  → running 8 + 6 = 14 at Donald.
//   • At Donald there's a SHORT road straight to Emma (4 cm). TRY it:
//       Alex→Sam→Donald→Emma = 8 + 6 + 4 = 18 ✗ — stops short and strands the
//       big 9-cm Leo–Emma road. Reject and keep banking distance.
//   • The Olivia spur (Alex–Olivia–Leo) is a dead-end branch off the start; you
//       can't fold it in without re-using a road, so we skip it ✗.
//   • Stay on the scenic route: Donald → Leo = 6 → running 14 + 6 = 20 at Leo.
//   • Leo → Emma banks the long 9-cm road → 20 + 9 = 29.  ✓ farthest.
//   • Farthest = Alex → Sam → Donald → Leo → Emma = 8 + 6 + 6 + 9 = 29 cm.
//
// Each beat carries ONE concrete running sum and a node-id path to light up on
// the figure (the illustrator's HomeMap25G1 `litPath` prop), so the post-answer
// figure reads as the static map coming alive. The two wrong turns get a ✗ and
// linger; the winner lands last with hold 0.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Roads + the winning trail are bound here (and to the shared
// HomeMap25G1 primitive) so figure and arithmetic can't drift from the stem.

import { LONGEST_TRAIL, ANSWER } from './HomeMap25G1Illustration'

export type Lang = 'en' | 'id'

/** Road lengths in cm, keyed by sorted home pair "X-Y". */
export const ROADS: Record<string, number> = {
  'Alex-Sam': 8,
  'Donald-Sam': 6, // Sam–Donald
  'Donald-Emma': 4,
  'Alex-Olivia': 7,
  'Leo-Olivia': 5, // Olivia–Leo
  'Donald-Leo': 6, // Leo–Donald
  'Emma-Leo': 9, // Leo–Emma
}

/** Length of the road between two homes, in either order. */
export function road(a: string, b: string): number {
  const key = [a, b].sort().join('-')
  const d = ROADS[key]
  if (d == null) throw new Error(`no road for ${a}-${b}`)
  return d
}

/** Total length walked along a home-id trail (sum of its consecutive roads). */
export function trailLength(trail: string[]): number {
  let sum = 0
  for (let i = 0; i + 1 < trail.length; i++) sum += road(trail[i], trail[i + 1])
  return sum
}

// The trails we light on the figure.
export const WINNER_TRAIL = LONGEST_TRAIL // Alex→Sam→Donald→Leo→Emma = 29 ✓
export const SHORT_EXIT_TRAIL = ['Alex', 'Sam', 'Donald', 'Emma'] // 8+6+4 = 18 ✗
export const OLIVIA_SPUR = ['Alex', 'Olivia', 'Leo'] // dead-end branch 7+5 = 12 ✗

export { ANSWER }

export interface HomeMapStep {
  /** Home-id path to light up on the figure this beat (null on intro). */
  litPath: string[] | null
  /** Running distance walked so far, in cm (null when no sum yet). */
  runningTotal: number | null
  /** The arithmetic string for the badge, e.g. "8 + 6 = 14" (null on intro). */
  sumText: string | null
  /** True only on the final farthest-trail beat. */
  result: boolean
  /** True on a beat that rejects a wrong turn (lingers a touch longer). */
  reject: boolean
  caption: string
  hold: number
}

export interface HomeMapStoryboard {
  answer: number
  winnerTrail: string[]
  steps: HomeMapStep[]
  finalIndex: number
}

export function buildHomeMap25G1Steps(lang: Lang): HomeMapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // road lengths for the captions, drawn straight from ROADS (no drift).
  const as = road('Alex', 'Sam') // 8
  const sd = road('Sam', 'Donald') // 6
  const de = road('Donald', 'Emma') // 4
  const dl = road('Donald', 'Leo') // 6
  const le = road('Leo', 'Emma') // 9
  const ao = road('Alex', 'Olivia') // 7
  const ol = road('Olivia', 'Leo') // 5

  const atSam = as // 8
  const atDonald = as + sd // 14
  const shortExit = atDonald + de // 18 ✗ (stops short)
  const spur = ao + ol // 12 ✗ (dead-end branch)
  const atLeo = atDonald + dl // 20
  const total = atLeo + le // 29 ✓

  const steps: HomeMapStep[] = [
    // 1 — restate the goal: we want the LONGEST walk, not the shortest.
    {
      litPath: null,
      runningTotal: null,
      sumText: null,
      result: false,
      reject: false,
      hold: 2600,
      caption: t(
        'Alex walks to Emma, each road at most once. We want the FARTHEST walk — so take the long, scenic route! Add up the cm.',
        'Alex berjalan ke rumah Emma, tiap jalan paling banyak sekali. Kita mau jalan TERJAUH — jadi ambil rute panjang! Jumlahkan cm-nya.',
      ),
    },
    // 2 — first hop: Alex → Sam = 8.
    {
      litPath: ['Alex', 'Sam'],
      runningTotal: atSam,
      sumText: `${as}`,
      result: false,
      reject: false,
      hold: 2200,
      caption: t(
        `Start Alex → Sam: that's ${as} cm. Now we're at Sam.`,
        `Mulai Alex → Sam: itu ${as} cm. Sekarang di Sam.`,
      ),
    },
    // 3 — second hop: Sam → Donald = 6, running 14 at Donald.
    {
      litPath: ['Alex', 'Sam', 'Donald'],
      runningTotal: atDonald,
      sumText: `${as} + ${sd} = ${atDonald}`,
      result: false,
      reject: false,
      hold: 2300,
      caption: t(
        `Sam → Donald is ${sd} cm. So far ${as} + ${sd} = ${atDonald} cm. From Donald, two roads go on.`,
        `Sam → Donald ${sd} cm. Sejauh ini ${as} + ${sd} = ${atDonald} cm. Dari Donald ada dua jalan lanjut.`,
      ),
    },
    // 4 — TRY the short Donald → Emma road = 4 → 18 ✗ (stops short, linger).
    {
      litPath: SHORT_EXIT_TRAIL,
      runningTotal: shortExit,
      sumText: `${as} + ${sd} + ${de} = ${shortExit}`,
      result: false,
      reject: true,
      hold: 2100,
      caption: t(
        `The short road Donald → Emma is only ${de} cm: ${atDonald} + ${de} = ${shortExit}. That ends too soon and wastes the long Leo → Emma road ✗.`,
        `Jalan pendek Donald → Emma cuma ${de} cm: ${atDonald} + ${de} = ${shortExit}. Itu berhenti terlalu cepat dan menyia-nyiakan jalan panjang Leo → Emma ✗.`,
      ),
    },
    // 5 — note the Olivia spur is a dead-end branch ✗ (linger).
    {
      litPath: OLIVIA_SPUR,
      runningTotal: spur,
      sumText: `${ao} + ${ol} = ${spur}`,
      result: false,
      reject: true,
      hold: 2100,
      caption: t(
        `The Olivia spur (Alex → Olivia → Leo = ${ao} + ${ol}) hangs off the start. We can't add it without re-using a road, so skip it ✗.`,
        `Cabang Olivia (Alex → Olivia → Leo = ${ao} + ${ol}) menggantung di awal. Tak bisa dipakai tanpa mengulang jalan, jadi lewati ✗.`,
      ),
    },
    // 6 — stay on the scenic route: Donald → Leo = 6 → 20 at Leo.
    {
      litPath: ['Alex', 'Sam', 'Donald', 'Leo'],
      runningTotal: atLeo,
      sumText: `${atDonald} + ${dl} = ${atLeo}`,
      result: false,
      reject: false,
      hold: 2300,
      caption: t(
        `Stay scenic: Donald → Leo is ${dl} cm. ${atDonald} + ${dl} = ${atLeo} cm. Leo still has the long road to Emma!`,
        `Tetap rute panjang: Donald → Leo ${dl} cm. ${atDonald} + ${dl} = ${atLeo} cm. Leo masih punya jalan panjang ke Emma!`,
      ),
    },
    // 7 — land on the answer: Leo → Emma = 9 → 29. (winner, holds)
    {
      litPath: WINNER_TRAIL,
      runningTotal: total,
      sumText: `${as} + ${sd} + ${dl} + ${le} = ${total}`,
      result: true,
      reject: false,
      hold: 0,
      caption: t(
        `Leo → Emma banks the long ${le} cm: ${atLeo} + ${le} = ${total}. Farthest walk = ${as} + ${sd} + ${dl} + ${le} = ${total} cm!`,
        `Leo → Emma menambah ${le} cm yang panjang: ${atLeo} + ${le} = ${total}. Jalan terjauh = ${as} + ${sd} + ${dl} + ${le} = ${total} cm!`,
      ),
    },
  ]

  return {
    answer: ANSWER,
    winnerTrail: WINNER_TRAIL,
    steps,
    finalIndex: steps.length - 1,
  }
}
