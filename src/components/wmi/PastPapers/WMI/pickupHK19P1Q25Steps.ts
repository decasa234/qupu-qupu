// Beat-by-beat solution steps for HKIMO 2019 Heat P1 Q25.
// Ming's optimal 19-metre route through all 19 apples.

export type Lang = 'en' | 'id'

export interface PickupStep {
  /** Number of PATH edges to draw (0 = only start dot visible). */
  pathLen: number
  caption: string
  hold: number
  result: boolean
}

export interface PickupStory {
  steps: PickupStep[]
  finalIndex: number
}

/**
 * Full optimal path: 20 positions defining 19 steps.
 *
 * Strategy:
 *   (0,0)→row-top-right   4 steps
 *   →(4,1)→(4,2)           2 steps  (right column down to middle)
 *   →row-middle-left       4 steps
 *   →(0,1)                 1 step   (side apple)
 *   backtrack (0,1)→(0,2)  1 step   ← forced; no Hamiltonian path exists
 *   →(0,3)→(0,4)           2 steps
 *   →row-bottom-right      4 steps
 *   →(4,3)                 1 step   (last side apple)
 *   Total = 19 metres ✓
 */
export const PATH: [number, number][] = [
  [0,0],[1,0],[2,0],[3,0],[4,0],   // top row
  [4,1],[4,2],                      // right column
  [3,2],[2,2],[1,2],[0,2],          // middle row (right→left)
  [0,1],                            // left side apple row 1
  [0,2],[0,3],[0,4],                // backtrack + left column down
  [1,4],[2,4],[3,4],[4,4],          // bottom row
  [4,3],                            // right side apple row 3
]

export function buildPickupHK19P1Q25Steps(lang: Lang): PickupStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PickupStep[] = [
    {
      pathLen: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Ming starts at the top-left. 19 apples to collect.',
        'Ming mulai di pojok atas-kiri. Ada 19 apel yang harus diambil.',
      ),
    },
    {
      pathLen: 4,
      hold: 1600,
      result: false,
      caption: t(
        'Sweep the top row → right: 4 steps, 5 apples.',
        'Sapu baris atas ke kanan: 4 langkah, 5 apel.',
      ),
    },
    {
      pathLen: 10,
      hold: 1800,
      result: false,
      caption: t(
        'Down the right column (2 steps), sweep the middle row ← left (4 steps): 6 more steps.',
        'Turun sisi kanan (2 langkah), sapu baris tengah ke kiri (4 langkah): 6 langkah lagi.',
      ),
    },
    {
      pathLen: 11,
      hold: 1500,
      result: false,
      caption: t(
        'Up 1 step to collect the left-side apple at row 1.',
        'Naik 1 langkah untuk ambil apel sisi kiri baris 1.',
      ),
    },
    {
      pathLen: 14,
      hold: 1800,
      result: false,
      caption: t(
        'Forced backtrack 1 step ↓ (no shortcut), then continue down the left column: 3 steps.',
        'Berbalik wajib 1 langkah ↓ (tidak ada jalan pintas), lalu turun kolom kiri: 3 langkah.',
      ),
    },
    {
      pathLen: 18,
      hold: 1600,
      result: false,
      caption: t(
        'Sweep the bottom row → right: 4 steps, 5 more apples.',
        'Sapu baris bawah ke kanan: 4 langkah, 5 apel lagi.',
      ),
    },
    {
      pathLen: 19,
      hold: 2200,
      result: true,
      caption: t(
        'Up 1 step — last apple! 4 + 6 + 1 + 3 + 4 + 1 = 19 metres.',
        'Naik 1 langkah — apel terakhir! 4 + 6 + 1 + 3 + 4 + 1 = 19 meter.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
