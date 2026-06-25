// Step-by-step storyboard for SEAMOX-22-A-Q5 (marble funnel, 11 distinct paths).
//
// Strategy: count paths node-by-node using the Pascal-triangle / level-sum approach.
// At each junction, the count = sum of counts of all junctions that can reach it.
//
//   T  = 1
//   UL = 1   (from T)
//   UR = 1   (from T)
//   C  = 3   (1 from T-straight + 1 from UL + 1 from UR)
//   LL = 4   (1 from UL + 3 from C)
//   LR = 4   (1 from UR + 3 from C)
//   B  = 11  (4 from LL + 4 from LR + 3 from C-straight)

import type { NodeId } from './FunnelX22A5Illustration'

export type FunnelBeat = {
  /** Path-count labels shown inside each junction circle. */
  counts: Partial<Record<NodeId, number>>
  /** Fill-colour overrides for junction circles. */
  nodeColors: Partial<Record<NodeId, string>>
  /** Edge keys 'A-B' to draw highlighted (orange, thicker). */
  activeEdgeKeys: string[]
  /** Caption text for this beat. */
  caption: string
  /** Auto-advance hold time (ms). 0 on the final beat. */
  hold: number
  /** true → render caption in green (answer confirmed). */
  verdict: boolean
}

const YELLOW = '#ffdd55'   // active node — being processed this beat
const BLUE   = '#BFDBFE'   // newly revealed node count
const GREEN  = '#6EE7B7'   // final answer node

export function buildFunnelSteps(lang: 'en' | 'id' = 'en'): {
  beats: FunnelBeat[]
  finalIndex: number
} {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: FunnelBeat[] = [
    // ── Beat 0: Entry ────────────────────────────────────────────────────────
    {
      counts: { T: 1 },
      nodeColors: { T: YELLOW },
      activeEdgeKeys: [],
      caption: t(
        'The marble enters at the top junction. Exactly 1 path reaches here.',
        'Kelereng masuk di persimpangan atas. Tepat 1 jalur mencapai sini.',
      ),
      hold: 2400,
      verdict: false,
    },

    // ── Beat 1: T branches to UL, C, UR ──────────────────────────────────────
    {
      counts: { T: 1, UL: 1, UR: 1, C: 1 },
      nodeColors: { T: YELLOW, UL: BLUE, UR: BLUE, C: BLUE },
      activeEdgeKeys: ['T-UL', 'T-C', 'T-UR'],
      caption: t(
        'From T the marble chooses 3 channels: left → UL (1), straight → C (1 so far), right → UR (1).',
        'Dari T kelereng memilih 3 saluran: kiri → UL (1), lurus → C (1 dulu), kanan → UR (1).',
      ),
      hold: 3000,
      verdict: false,
    },

    // ── Beat 2: UL + UR each add 1 more path to C ────────────────────────────
    {
      counts: { T: 1, UL: 1, UR: 1, C: 3 },
      nodeColors: { T: YELLOW, UL: YELLOW, UR: YELLOW, C: YELLOW },
      activeEdgeKeys: ['UL-C', 'UR-C'],
      caption: t(
        'UL also feeds C (+1) and UR also feeds C (+1). Centre total: 1 + 1 + 1 = 3 paths.',
        'UL juga menuju C (+1) dan UR juga menuju C (+1). Total tengah: 1 + 1 + 1 = 3 jalur.',
      ),
      hold: 3000,
      verdict: false,
    },

    // ── Beat 3: LL and LR counts ──────────────────────────────────────────────
    {
      counts: { T: 1, UL: 1, UR: 1, C: 3, LL: 4, LR: 4 },
      nodeColors: { T: YELLOW, UL: YELLOW, UR: YELLOW, C: YELLOW, LL: BLUE, LR: BLUE },
      activeEdgeKeys: ['UL-LL', 'C-LL', 'UR-LR', 'C-LR'],
      caption: t(
        'LL = 1 (from UL) + 3 (from C) = 4.   LR = 1 (from UR) + 3 (from C) = 4.',
        'LL = 1 (dari UL) + 3 (dari C) = 4.   LR = 1 (dari UR) + 3 (dari C) = 4.',
      ),
      hold: 3000,
      verdict: false,
    },

    // ── Beat 4: Final exit B ─────────────────────────────────────────────────
    {
      counts: { T: 1, UL: 1, UR: 1, C: 3, LL: 4, LR: 4, B: 11 },
      nodeColors: {
        T: YELLOW, UL: YELLOW, UR: YELLOW,
        C: YELLOW, LL: YELLOW, LR: YELLOW,
        B: GREEN,
      },
      activeEdgeKeys: ['LL-B', 'LR-B', 'C-B'],
      caption: t(
        'Exit B: 4 (via LL) + 4 (via LR) + 3 (via centre straight) = 11 paths. ✓',
        'Keluar B: 4 (via LL) + 4 (via LR) + 3 (via tengah lurus) = 11 jalur. ✓',
      ),
      hold: 0,
      verdict: true,
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
