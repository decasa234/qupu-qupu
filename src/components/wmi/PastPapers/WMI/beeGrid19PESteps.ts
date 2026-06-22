// Storyboard for IKMC-20-PE-Q19 (2020 IKMC Pre-Ecolier, question 19).
//
// The problem: a flat-top honeycomb grid of 13 hexagons.
// 7 are already grey (including A and B), 6 are white (candidates).
// Color exactly 2 white cells grey so Mark the bee can walk from A to B.
//
// Grid (col, row), odd cols shifted DOWN by half a hex:
//   Grey:  A(0,1), G1(1,1), G2(2,0), G3(3,2), G4(4,0), G5(4,2), B(5,1)
//   White: w1(1,0), w2(2,1), w3(2,2), w4(3,0), w5(3,1), w6(4,1)
//
// Key insight: w3(2,2) is the ONLY white cell adjacent to both the A-cluster
// {A, G1} and the B-cluster {G3, G5, B}. Every valid pair contains w3.
//
// The 5 valid pairs (all pairs containing w3):
//   1. {w1, w3}  — path A → G1 → w3 → G3 → G5 → B
//   2. {w2, w3}  — path A → G1 → w3 → G3 → G5 → B
//   3. {w3, w4}  — path A → G1 → w3 → G3 → G5 → B
//   4. {w3, w5}  — path A → G1 → w3 → G3 → G5 → B (w5 also links G3–G5)
//   5. {w3, w6}  — path A → G1 → w3 → G3 → G5 → B

export type Lang = 'en' | 'id'

/** White cell (col, row) coordinates used across storyboard beats. */
export const W3: [number, number] = [2, 2]
export const W1: [number, number] = [1, 0]
export const W2: [number, number] = [2, 1]
export const W4: [number, number] = [3, 0]
export const W5: [number, number] = [3, 1]
export const W6: [number, number] = [4, 1]

/** The walking path from A to B through grey + the w3 bridge. */
export const BASE_PATH: Array<[number, number]> = [
  [0, 1],  // A
  [1, 1],  // G1
  [2, 2],  // w3 (bridge)
  [3, 2],  // G3
  [4, 2],  // G5
  [5, 1],  // B
]

export interface BeeStep {
  /** Which pair of white cells is highlighted this beat (both cells drawn in amber). */
  highlightedPair: [[number, number], [number, number]] | null
  /** Whether to draw the bee walking path on this beat. */
  showPath: boolean
  /** Pair index 1-5 (null for intro / result beats). */
  pairIndex: number | null
  /** Caption bilingual. */
  caption: string
  /** Auto-advance hold in ms. */
  hold: number
  /** True only on the final result beat. */
  result: boolean
  /** Running valid-pair count shown on the beat (for the result badge). */
  count: number | null
}

export interface BeeStoryboard {
  steps: BeeStep[]
  finalIndex: number
}

export function buildBeeGrid19PESteps(lang: Lang): BeeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BeeStep[] = [
    // Beat 0 — intro
    {
      highlightedPair: null,
      showPath: false,
      pairIndex: null,
      hold: 2500,
      result: false,
      count: null,
      caption: t(
        'Mark the bee walks only on grey cells. We must colour exactly 2 white cells grey so he can walk from A to B.',
        'Lebah Mark hanya bisa berjalan di sel abu-abu. Kita harus mewarnai tepat 2 sel putih menjadi abu-abu agar ia bisa berjalan dari A ke B.',
      ),
    },

    // Beat 1 — pair 1: {w1, w3}
    {
      highlightedPair: [W1, W3],
      showPath: true,
      pairIndex: 1,
      hold: 2200,
      result: false,
      count: 1,
      caption: t(
        'Pair 1: colour cells at top-left and the bridge cell. Path: A → G1 → bridge → G3 → G5 → B. ✓',
        'Pasangan 1: warnai sel kiri-atas dan sel penghubung. Jalur: A → G1 → jembatan → G3 → G5 → B. ✓',
      ),
    },

    // Beat 2 — pair 2: {w2, w3}
    {
      highlightedPair: [W2, W3],
      showPath: true,
      pairIndex: 2,
      hold: 2200,
      result: false,
      count: 2,
      caption: t(
        'Pair 2: colour the centre-left cell and the bridge cell. The path still works through the bridge. ✓',
        'Pasangan 2: warnai sel tengah-kiri dan sel penghubung. Jalur tetap berjalan melalui jembatan. ✓',
      ),
    },

    // Beat 3 — pair 3: {w3, w4}
    {
      highlightedPair: [W3, W4],
      showPath: true,
      pairIndex: 3,
      hold: 2200,
      result: false,
      count: 3,
      caption: t(
        'Pair 3: colour the bridge cell and the top-centre cell. Path from A to B still goes via the bridge. ✓',
        'Pasangan 3: warnai sel penghubung dan sel atas-tengah. Jalur dari A ke B tetap lewat jembatan. ✓',
      ),
    },

    // Beat 4 — pair 4: {w3, w5}
    {
      highlightedPair: [W3, W5],
      showPath: true,
      pairIndex: 4,
      hold: 2200,
      result: false,
      count: 4,
      caption: t(
        'Pair 4: bridge cell + centre cell. The second cell even adds a shortcut between G3 and G5. ✓',
        'Pasangan 4: sel penghubung + sel tengah. Sel kedua bahkan menambah jalur pintas antara G3 dan G5. ✓',
      ),
    },

    // Beat 5 — pair 5: {w3, w6}
    {
      highlightedPair: [W3, W6],
      showPath: true,
      pairIndex: 5,
      hold: 2200,
      result: false,
      count: 5,
      caption: t(
        'Pair 5: bridge cell + centre-right cell. Mark can still reach B via the bridge and G3 → G5. ✓',
        'Pasangan 5: sel penghubung + sel tengah-kanan. Mark masih bisa mencapai B lewat jembatan dan G3 → G5. ✓',
      ),
    },

    // Beat 6 — result
    {
      highlightedPair: null,
      showPath: false,
      pairIndex: null,
      hold: 0,
      result: true,
      count: 5,
      caption: t(
        'Every valid pair contains the bridge cell. There are exactly 5 ways to colour two white cells. Answer: C = 5.',
        'Setiap pasangan yang valid mengandung sel penghubung. Ada tepat 5 cara mewarnai dua sel putih. Jawaban: C = 5.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
