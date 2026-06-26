/**
 * PolyominoOSN24NEKQ5Explainer — post-answer explainer for OSN-24-SD-NAS-EKSPERIMEN-Q5.
 *
 * "Dalam petak 4×5, hubungkan 10 petak satuan menjadi satu daerah poliomino.
 * Berapa perimeter maksimum?" — answer: 22.
 *
 * Animation beats (5 total):
 *   Beat 0 (intro)    — blank 4×5 grid; problem statement.
 *   Beat 1 (isolated) — 10 tree-shaped cells highlighted amber; "10×4=40" badge.
 *   Beat 2 (tree)     — cells turn blue; spanning-tree label.
 *   Beat 3 (edges)    — orange markers on 9 shared edges; "9×2=18" badge.
 *   Beat 4 (result)   — cells green; "40−18=22" answer badge.
 *
 * Tree-shaped 10-cell polyomino used (exactly 9 shared edges = spanning tree):
 *   Row 0: cols 0-4 (all 5 cells)
 *   Row 1: col 0 only
 *   Row 2: col 0 only
 *   Row 3: cols 0-2 (3 cells)
 *
 * Reuses: GridBoard from ./primitives/GridBoard.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { buildPolyominoOSN24NEKQ5Steps, type PerimeterPhase } from './polyominoOSN24NEKQ5Steps'

// ─── Geometry ────────────────────────────────────────────────────────────────
const ROWS = 4
const COLS = 5
const CELL = 44
const VB   = gridBoardViewBox(ROWS, COLS, CELL)

// ─── Tree-shaped 10-cell polyomino (spanning tree: exactly 9 shared edges) ───
const TREE_SET = new Set([
  '0,0','0,1','0,2','0,3','0,4',  // row 0: all 5
  '1,0',                           // row 1: col 0
  '2,0',                           // row 2: col 0
  '3,0','3,1','3,2',               // row 3: first 3
])

// ─── 9 shared edges as [r1,c1,r2,c2] ─────────────────────────────────────────
const TREE_EDGES: readonly [number, number, number, number][] = [
  // row 0 horizontals (4 edges)
  [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],
  // col 0 verticals (3 edges)
  [0,0,1,0],[1,0,2,0],[2,0,3,0],
  // row 3 horizontals (2 edges)
  [3,0,3,1],[3,1,3,2],
]

// ─── Colour tokens ────────────────────────────────────────────────────────────
const AMBER_BG  = '#FEF3C7'
const AMBER     = '#D97706'
const BLUE_BG   = '#DBEAFE'
const BRAND     = '#30598A'
const BRAND_BG  = '#E1EFFB'
const GREEN_BG  = '#D1FAE5'
const GREEN     = '#10B981'
const GREEN_TXT = '#065F46'
const EDGE_CLR  = '#F97316'  // orange-500 for edge markers

// ─── Edge midpoint helper ─────────────────────────────────────────────────────
function edgeMid(
  r1: number, c1: number,
  r2: number, c2: number,
): { mx: number; my: number } {
  if (r1 === r2) {
    // horizontal adjacency → boundary is vertical at x = max(c1,c2)*CELL
    return { mx: Math.max(c1, c2) * CELL, my: (r1 + 0.5) * CELL }
  }
  // vertical adjacency → boundary is horizontal at y = max(r1,r2)*CELL
  return { mx: (c1 + 0.5) * CELL, my: Math.max(r1, r2) * CELL }
}

// ─── Per-phase cell fill ──────────────────────────────────────────────────────
function phaseFill(phase: PerimeterPhase, r: number, c: number): string | undefined {
  if (!TREE_SET.has(`${r},${c}`)) return undefined // non-tree cells: white
  switch (phase) {
    case 'isolated': return AMBER_BG
    case 'tree':     return BLUE_BG
    case 'edges':    return BLUE_BG
    case 'result':   return GREEN_BG
    default:         return undefined
  }
}

// ─── Explainer ───────────────────────────────────────────────────────────────
export default function PolyominoOSN24NEKQ5Explainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'id') as 'en' | 'id'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPolyominoOSN24NEKQ5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]
  const phase = beat.phase

  const captionStyle =
    phase === 'result'
      ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
      : phase === 'isolated'
        ? { background: AMBER_BG, borderColor: AMBER, color: '#92400E' }
        : { background: BRAND_BG, borderColor: BRAND, color: BRAND }

  const ariaLabel = t(
    'Explainer: 10 isolated cells = perimeter 40. Spanning tree needs 9 shared edges → 9×2=18 lost. Maximum perimeter = 40−18=22.',
    'Penjelasan: 10 sel terisolasi = keliling 40. Pohon rentang perlu 9 sisi bersama → 9×2=18 hilang. Keliling maks = 40−18=22.',
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 4×5 grid with phase-coloured tree cells + edge markers */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <svg viewBox={VB} width={COLS * CELL} aria-hidden="true">
            <GridBoard
              rows={ROWS}
              cols={COLS}
              cellSize={CELL}
              gridStroke="#6B7280"
              fill={(r, c) => phaseFill(phase, r, c)}
            />
            {/* Orange circles at the 9 shared-edge midpoints (edges beat only) */}
            {phase === 'edges' && TREE_EDGES.map(([r1, c1, r2, c2], i) => {
              const { mx, my } = edgeMid(r1, c1, r2, c2)
              return (
                <circle
                  key={i}
                  cx={mx}
                  cy={my}
                  r={6}
                  fill={EDGE_CLR}
                  stroke="white"
                  strokeWidth={2}
                />
              )
            })}
          </svg>
        </div>

        {/* Formula badge — phase-specific */}
        {phase === 'isolated' && (
          <motion.div
            key="badge-40"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: AMBER }}
          >
            10 × 4 = 40
          </motion.div>
        )}
        {phase === 'edges' && (
          <motion.div
            key="badge-18"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: EDGE_CLR }}
          >
            9 × 2 = 18
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div
            key="badge-result"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            40 − 18 = 22
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
