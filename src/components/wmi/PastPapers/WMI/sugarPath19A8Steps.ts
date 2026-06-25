// Storyboard for SEAMO-19-A-Q8 — "How many ways are there to spell SUGAR?"
//
// The diamond graph has 9 nodes: S, Utop, Ubot, Gtop, Gctr, Gbot, Atop, Abot, R.
// We must count directed paths S→U→G→A→R following adjacency edges left-to-right.
//
// PATH ENUMERATION (shown beat by beat):
//   Path 1: S → Utop → Gtop → Atop → R
//   Path 2: S → Utop → Gctr → Atop → R
//   Path 3: S → Utop → Gctr → Abot → R
//   Path 4: S → Ubot → Gctr → Atop → R
//   Path 5: S → Ubot → Gctr → Abot → R
//   Path 6: S → Ubot → Gbot → Abot → R
//
// Total = 6 — Answer C.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { SugarNodeId } from './SugarPath19A8Illustration'

export const SUGAR_ANSWER = 6
export const SUGAR_CHOICE = 'C'

export interface SugarStep {
  /** Active (current-hop) edges rendered in amber. */
  activeEdges: Array<[SugarNodeId, SugarNodeId]>
  /** Done (completed-path) edges rendered in green. */
  doneEdges: Array<[SugarNodeId, SugarNodeId]>
  /** Nodes with a state override: 'active' = amber, 'done' = green. */
  nodeStates: Partial<Record<SugarNodeId, 'default' | 'active' | 'done'>>
  /** True only on the final winning beat. */
  result: boolean
  /** Running count label for the UI. */
  count: number
  caption: string
  hold: number
}

export interface SugarStoryboard {
  steps: SugarStep[]
  finalIndex: number
}

// Helper: build nodeStates coloring a full path green + an extra node amber
function pathStates(
  pathNodes: SugarNodeId[],
  active?: SugarNodeId,
): Partial<Record<SugarNodeId, 'default' | 'active' | 'done'>> {
  const out: Partial<Record<SugarNodeId, 'default' | 'active' | 'done'>> = {}
  for (const n of pathNodes) out[n] = 'done'
  if (active) out[active] = 'active'
  return out
}

// Helper: build edge pairs from a node sequence
function pathEdges(nodes: SugarNodeId[]): Array<[SugarNodeId, SugarNodeId]> {
  const edges: Array<[SugarNodeId, SugarNodeId]> = []
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push([nodes[i], nodes[i + 1]])
  }
  return edges
}

const PATH1: SugarNodeId[] = ['S', 'Utop', 'Gtop', 'Atop', 'R']
const PATH2: SugarNodeId[] = ['S', 'Utop', 'Gctr', 'Atop', 'R']
const PATH3: SugarNodeId[] = ['S', 'Utop', 'Gctr', 'Abot', 'R']
const PATH4: SugarNodeId[] = ['S', 'Ubot', 'Gctr', 'Atop', 'R']
const PATH5: SugarNodeId[] = ['S', 'Ubot', 'Gctr', 'Abot', 'R']
const PATH6: SugarNodeId[] = ['S', 'Ubot', 'Gbot', 'Abot', 'R']

export function buildSugarPath19A8Steps(lang: Lang): SugarStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SugarStep[] = [
    // 0 — intro: show blank graph
    {
      activeEdges: [],
      doneEdges: [],
      nodeStates: {},
      result: false,
      count: 0,
      hold: 2400,
      caption: t(
        'We need to trace S → U → G → A → R by moving along connected lines. How many different routes exist?',
        'Kita harus menelusuri S → U → G → A → R bergerak melalui garis-garis yang terhubung. Berapa banyak rute berbeda yang ada?',
      ),
    },
    // 1 — Path 1: S→Utop→Gtop→Atop→R
    {
      activeEdges: pathEdges(PATH1),
      doneEdges: [],
      nodeStates: pathStates(PATH1),
      result: false,
      count: 1,
      hold: 2200,
      caption: t(
        'Path 1: S → U(top) → G(top) → A(top) → R. Count: 1.',
        'Jalur 1: S → U(atas) → G(atas) → A(atas) → R. Jumlah: 1.',
      ),
    },
    // 2 — Path 2: S→Utop→Gctr→Atop→R
    {
      activeEdges: pathEdges(PATH2),
      doneEdges: pathEdges(PATH1),
      nodeStates: pathStates(PATH2, undefined),
      result: false,
      count: 2,
      hold: 2200,
      caption: t(
        'Path 2: S → U(top) → G(centre) → A(top) → R. Count: 2.',
        'Jalur 2: S → U(atas) → G(tengah) → A(atas) → R. Jumlah: 2.',
      ),
    },
    // 3 — Path 3: S→Utop→Gctr→Abot→R
    {
      activeEdges: pathEdges(PATH3),
      doneEdges: [...pathEdges(PATH1), ...pathEdges(PATH2)],
      nodeStates: pathStates(PATH3),
      result: false,
      count: 3,
      hold: 2200,
      caption: t(
        'Path 3: S → U(top) → G(centre) → A(bottom) → R. Count: 3.',
        'Jalur 3: S → U(atas) → G(tengah) → A(bawah) → R. Jumlah: 3.',
      ),
    },
    // 4 — Path 4: S→Ubot→Gctr→Atop→R
    {
      activeEdges: pathEdges(PATH4),
      doneEdges: [...pathEdges(PATH1), ...pathEdges(PATH2), ...pathEdges(PATH3)],
      nodeStates: pathStates(PATH4),
      result: false,
      count: 4,
      hold: 2200,
      caption: t(
        'Path 4: S → U(bottom) → G(centre) → A(top) → R. Count: 4.',
        'Jalur 4: S → U(bawah) → G(tengah) → A(atas) → R. Jumlah: 4.',
      ),
    },
    // 5 — Path 5: S→Ubot→Gctr→Abot→R
    {
      activeEdges: pathEdges(PATH5),
      doneEdges: [
        ...pathEdges(PATH1), ...pathEdges(PATH2),
        ...pathEdges(PATH3), ...pathEdges(PATH4),
      ],
      nodeStates: pathStates(PATH5),
      result: false,
      count: 5,
      hold: 2200,
      caption: t(
        'Path 5: S → U(bottom) → G(centre) → A(bottom) → R. Count: 5.',
        'Jalur 5: S → U(bawah) → G(tengah) → A(bawah) → R. Jumlah: 5.',
      ),
    },
    // 6 — Path 6: S→Ubot→Gbot→Abot→R
    {
      activeEdges: pathEdges(PATH6),
      doneEdges: [
        ...pathEdges(PATH1), ...pathEdges(PATH2), ...pathEdges(PATH3),
        ...pathEdges(PATH4), ...pathEdges(PATH5),
      ],
      nodeStates: pathStates(PATH6),
      result: false,
      count: 6,
      hold: 2200,
      caption: t(
        'Path 6: S → U(bottom) → G(bottom) → A(bottom) → R. Count: 6.',
        'Jalur 6: S → U(bawah) → G(bawah) → A(bawah) → R. Jumlah: 6.',
      ),
    },
    // 7 — Result
    {
      activeEdges: [],
      doneEdges: [
        ...pathEdges(PATH1), ...pathEdges(PATH2), ...pathEdges(PATH3),
        ...pathEdges(PATH4), ...pathEdges(PATH5), ...pathEdges(PATH6),
      ],
      nodeStates: {
        S: 'done', Utop: 'done', Ubot: 'done',
        Gtop: 'done', Gctr: 'done', Gbot: 'done',
        Atop: 'done', Abot: 'done', R: 'done',
      },
      result: true,
      count: 6,
      hold: 0,
      caption: t(
        `All 6 paths traced! There are ${SUGAR_ANSWER} ways to spell SUGAR — Answer ${SUGAR_CHOICE}.`,
        `Semua 6 jalur sudah ditelusuri! Ada ${SUGAR_ANSWER} cara mengeja SUGAR — Jawaban ${SUGAR_CHOICE}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
