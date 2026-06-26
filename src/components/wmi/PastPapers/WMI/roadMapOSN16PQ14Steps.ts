// OSN-16-SD-PROV-Q14 — storyboard for the road-map shortest-path animation.
//
// Two 2×2 grids connected at corner B; find the number of shortest paths
// from A (bottom-left) to C (top-right). Answer: 36.
//
// DP walk (right or up only), 7 beats:
//   0. intro        — show the map; explain right-or-up rule.
//   1. lower-bottom — bottom row: A=1, →1, →1.
//   2. lower-mid    — middle row: 1, 2, 3.
//   3. lower-top    — top row: 1, 3, B=6.
//   4. upper-bottom — upper bottom row: 6, 6.
//   5. upper-mid    — upper middle row: 6, 12, 18.
//   6. result       — upper top row: 6, 18, C=36.

export type Lang = 'en' | 'id'

export type RoadMapPhase =
  | 'intro'
  | 'lower-bottom'
  | 'lower-mid'
  | 'lower-top'
  | 'upper-bottom'
  | 'upper-mid'
  | 'result'

export interface RoadMapBeat {
  phase: RoadMapPhase
  /** Partial map of node id → path count; omitted keys show no bubble yet. */
  labels: Record<string, number>
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface RoadMapStoryboard {
  steps: RoadMapBeat[]
  finalIndex: number
}

export function buildRoadMapOSN16PQ14Steps(lang: Lang): RoadMapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RoadMapBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      labels: {},
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Shortest paths only move RIGHT or UP — never back. Label each junction with the number of paths reaching it.',
        'Lintasan terpendek hanya bergerak KE KANAN atau KE ATAS. Beri label setiap persimpangan dengan jumlah lintasan yang mencapainya.',
      ),
    },
    // Beat 1 — bottom row of lower grid
    {
      phase: 'lower-bottom',
      labels: { A: 1, l10: 1, l20: 1 },
      equation: 'A = 1',
      hold: 2000,
      result: false,
      caption: t(
        'Start: A = 1. Moving right along the bottom row each corner has exactly 1 path.',
        'Mulai: A = 1. Bergerak ke kanan di baris bawah, setiap sudut hanya memiliki 1 lintasan.',
      ),
    },
    // Beat 2 — middle row of lower grid
    {
      phase: 'lower-mid',
      labels: { A: 1, l10: 1, l20: 1, l01: 1, l11: 2, l21: 3 },
      equation: '1+1=2  ·  2+1=3',
      hold: 2000,
      result: false,
      caption: t(
        'Each junction = (left) + (below). Middle row: 1, 1+1=2, 2+1=3.',
        'Setiap simpul = (kiri) + (bawah). Baris tengah: 1, 1+1=2, 2+1=3.',
      ),
    },
    // Beat 3 — top row of lower grid, reaches B
    {
      phase: 'lower-top',
      labels: { A: 1, l10: 1, l20: 1, l01: 1, l11: 2, l21: 3, l02: 1, l12: 3, B: 6 },
      equation: '3 + 3 = 6 paths to B',
      hold: 2400,
      result: false,
      caption: t(
        'Top row of lower grid: 1, 3, and B = 3+3 = 6 paths from A to B.',
        'Baris atas grid bawah: 1, 3, dan B = 3+3 = 6 lintasan dari A ke B.',
      ),
    },
    // Beat 4 — bottom row of upper grid
    {
      phase: 'upper-bottom',
      labels: {
        A: 1, l10: 1, l20: 1,
        l01: 1, l11: 2, l21: 3,
        l02: 1, l12: 3, B: 6,
        u10: 6, u20: 6,
      },
      equation: 'B=6 → 6 → 6',
      hold: 2000,
      result: false,
      caption: t(
        'All 6 paths enter the upper grid at B. Moving right along the bottom row: still 6, 6.',
        'Semua 6 lintasan masuk ke grid atas di B. Bergerak ke kanan: tetap 6, 6.',
      ),
    },
    // Beat 5 — middle row of upper grid
    {
      phase: 'upper-mid',
      labels: {
        A: 1, l10: 1, l20: 1,
        l01: 1, l11: 2, l21: 3,
        l02: 1, l12: 3, B: 6,
        u10: 6, u20: 6,
        u01: 6, u11: 12, u21: 18,
      },
      equation: '6+6=12  ·  12+6=18',
      hold: 2000,
      result: false,
      caption: t(
        'Upper middle row: 6, 6+6=12, 12+6=18.',
        'Baris tengah atas: 6, 6+6=12, 12+6=18.',
      ),
    },
    // Beat 6 — result: top row of upper grid, C=36
    {
      phase: 'result',
      labels: {
        A: 1, l10: 1, l20: 1,
        l01: 1, l11: 2, l21: 3,
        l02: 1, l12: 3, B: 6,
        u10: 6, u20: 6,
        u01: 6, u11: 12, u21: 18,
        u02: 6, u12: 18, C: 36,
      },
      equation: '18 + 18 = 36',
      hold: 0,
      result: true,
      caption: t(
        'C = 18 + 18 = 36 shortest paths from A to C.',
        'C = 18 + 18 = 36 lintasan terpendek dari A ke C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
