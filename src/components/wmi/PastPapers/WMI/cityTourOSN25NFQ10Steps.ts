// OSN-25-SD-NAS-FINAL-Q10 — city tour (Hamiltonian circuit) steps.
//
// "Pak Kartono tinggal di kota A akan berkunjung ke semua kota dan kembali ke A.
//  Jarak minimum yang dilewati Pak Kartono adalah … km."
//
// GRAPH EDGES (from figure):
//   A-B:2  A-H:2  B-C:3  B-F:5  C-D:2  C-F:2
//   D-E:8  D-F:4  E-F:3  E-G:4  F-G:2  F-H:3  G-H:3
//
// OPTIMAL HAMILTONIAN CIRCUIT:
//   A→B→C→D→F→E→G→H→A = 2+3+2+4+3+4+3+2 = 23 km
//   (Seed answer 38 km is flagged verify-answer; independent analysis gives 23.)
//
// Pure builder: (lang) => storyboard. No Math.random, no Date. SSR-safe.

import type { CityId } from './CityTourOSN25NFQ10Illustration'

export type Lang = 'en' | 'id'

/** Distance lookup by sorted city-pair key. */
export const DISTANCES: Record<string, number> = {
  'A-B': 2,
  'A-H': 2,
  'B-C': 3,
  'B-F': 5,
  'C-D': 2,
  'C-F': 2,
  'D-E': 8,
  'D-F': 4,
  'E-F': 3,
  'E-G': 4,
  'F-G': 2,
  'F-H': 3,
  'G-H': 3,
}

function dist(a: string, b: string): number {
  const key = [a, b].sort().join('-')
  const d = DISTANCES[key]
  if (d == null) throw new Error(`no edge ${a}-${b}`)
  return d
}

/** Optimal tour: A→B→C→D→F→E→G→H→A = 23 km. */
export const WINNER_TOUR: CityId[] = ['A', 'B', 'C', 'D', 'F', 'E', 'G', 'H', 'A']
/** Total km for the optimal tour. */
export const ANSWER = WINNER_TOUR.slice(0, -1).reduce(
  (sum, city, i) => sum + dist(city, WINNER_TOUR[i + 1]),
  0,
) // 23

export interface TourStep {
  /** Ordered node ids to highlight on the graph this beat (null = intro). */
  highlightPath: CityId[] | null
  /** Running total km (null = intro). */
  runningKm: number | null
  /** Arithmetic string, e.g. "2 + 3 = 5". */
  sumText: string | null
  /** True on the final winning beat. */
  result: boolean
  /** True on a beat showing a sub-optimal / eliminated branch. */
  reject: boolean
  caption: string
  hold: number
}

export interface TourStoryboard {
  answer: number
  winnerTour: CityId[]
  steps: TourStep[]
  finalIndex: number
}

export function buildCityTourSteps(lang: Lang): TourStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ab = dist('A','B') // 2
  const bc = dist('B','C') // 3
  const cd = dist('C','D') // 2
  const df = dist('D','F') // 4
  const fe = dist('F','E') // 3
  const eg = dist('E','G') // 4
  const gh = dist('G','H') // 3
  const ha = dist('H','A') // 2

  const steps: TourStep[] = [
    // 0 — intro: state the goal
    {
      highlightPath: null,
      runningKm: null,
      sumText: null,
      result: false,
      reject: false,
      hold: 2800,
      caption: t(
        'Pak Kartono must visit all 8 cities (A–H) and return to A. Find the shortest total distance.',
        'Pak Kartono harus mengunjungi semua 8 kota (A–H) dan kembali ke A. Cari jarak total terpendek.',
      ),
    },
    // 1 — A only connects to B and H → it must be between B and H in the circuit
    {
      highlightPath: ['A', 'B'],
      runningKm: ab,
      sumText: `${ab}`,
      result: false,
      reject: false,
      hold: 2600,
      caption: t(
        `A connects only to B and H, so A is between B and H in every circuit. Start A → B = ${ab} km.`,
        `A hanya terhubung ke B dan H, jadi A selalu diapit B dan H. Mulai A → B = ${ab} km.`,
      ),
    },
    // 2 — B → C
    {
      highlightPath: ['A', 'B', 'C'],
      runningKm: ab + bc,
      sumText: `${ab} + ${bc} = ${ab + bc}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `B → C = ${bc} km. Running total: ${ab} + ${bc} = ${ab + bc} km.`,
        `B → C = ${bc} km. Total sementara: ${ab} + ${bc} = ${ab + bc} km.`,
      ),
    },
    // 3 — C → D (not C → F first, to keep D near C)
    {
      highlightPath: ['A', 'B', 'C', 'D'],
      runningKm: ab + bc + cd,
      sumText: `${ab + bc} + ${cd} = ${ab + bc + cd}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `C → D = ${cd} km. Running: ${ab + bc} + ${cd} = ${ab + bc + cd} km. Now skip the long D→E (${dist('D','E')} km) and use D→F instead.`,
        `C → D = ${cd} km. Total: ${ab + bc} + ${cd} = ${ab + bc + cd} km. Lewati D→E yang panjang (${dist('D','E')} km), pilih D→F.`,
      ),
    },
    // 4 — D → F (avoid the costly D-E = 8 km)
    {
      highlightPath: ['A', 'B', 'C', 'D', 'F'],
      runningKm: ab + bc + cd + df,
      sumText: `${ab + bc + cd} + ${df} = ${ab + bc + cd + df}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `D → F = ${df} km. Running: ${ab + bc + cd} + ${df} = ${ab + bc + cd + df} km.`,
        `D → F = ${df} km. Total: ${ab + bc + cd} + ${df} = ${ab + bc + cd + df} km.`,
      ),
    },
    // 5 — F → E
    {
      highlightPath: ['A', 'B', 'C', 'D', 'F', 'E'],
      runningKm: ab + bc + cd + df + fe,
      sumText: `${ab + bc + cd + df} + ${fe} = ${ab + bc + cd + df + fe}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `F → E = ${fe} km. Running: ${ab + bc + cd + df} + ${fe} = ${ab + bc + cd + df + fe} km.`,
        `F → E = ${fe} km. Total: ${ab + bc + cd + df} + ${fe} = ${ab + bc + cd + df + fe} km.`,
      ),
    },
    // 6 — E → G
    {
      highlightPath: ['A', 'B', 'C', 'D', 'F', 'E', 'G'],
      runningKm: ab + bc + cd + df + fe + eg,
      sumText: `${ab + bc + cd + df + fe} + ${eg} = ${ab + bc + cd + df + fe + eg}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `E → G = ${eg} km. Running: ${ab + bc + cd + df + fe} + ${eg} = ${ab + bc + cd + df + fe + eg} km.`,
        `E → G = ${eg} km. Total: ${ab + bc + cd + df + fe} + ${eg} = ${ab + bc + cd + df + fe + eg} km.`,
      ),
    },
    // 7 — G → H
    {
      highlightPath: ['A', 'B', 'C', 'D', 'F', 'E', 'G', 'H'],
      runningKm: ab + bc + cd + df + fe + eg + gh,
      sumText: `${ab + bc + cd + df + fe + eg} + ${gh} = ${ab + bc + cd + df + fe + eg + gh}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `G → H = ${gh} km. Running: ${ab + bc + cd + df + fe + eg} + ${gh} = ${ab + bc + cd + df + fe + eg + gh} km.`,
        `G → H = ${gh} km. Total: ${ab + bc + cd + df + fe + eg} + ${gh} = ${ab + bc + cd + df + fe + eg + gh} km.`,
      ),
    },
    // 8 — H → A: complete the circuit
    {
      highlightPath: WINNER_TOUR,
      runningKm: ANSWER,
      sumText: `${ab} + ${bc} + ${cd} + ${df} + ${fe} + ${eg} + ${gh} + ${ha} = ${ANSWER}`,
      result: true,
      reject: false,
      hold: 0,
      caption: t(
        `H → A = ${ha} km. Circuit complete! A→B→C→D→F→E→G→H→A = ${ANSWER} km ✓`,
        `H → A = ${ha} km. Sirkuit selesai! A→B→C→D→F→E→G→H→A = ${ANSWER} km ✓`,
      ),
    },
  ]

  return {
    answer: ANSWER,
    winnerTour: WINNER_TOUR,
    steps,
    finalIndex: steps.length - 1,
  }
}
