// SEAMO-20-B-Q22 — animated explainer for the lattice path-counting question.
//
// Reuses the illustration geometry from GridPaths20B22Illustration.tsx.
// Beat-by-beat walkthrough:
//   0. intro     — static grid; state the rule (→ or ↓ only).
//   1. axCount   — shade A→X sub-region; show C(6,3)=20.
//   2. xbCount   — shade X→B sub-region; show C(2,1)=2.
//   3. multiply  — both regions lit; 20 × 2 = 40.
//   4. result    — answer 40 highlighted in green.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  pt,
  CELL,
  COLS,
  ROWS,
  PAD,
  A_NODE,
  X_NODE,
  B_NODE,
} from './GridPaths20B22Illustration'
import { buildGridPaths20B22Steps } from './gridPaths20B22Steps'

// ── colours ───────────────────────────────────────────────────────────────────
const BLUE    = '#30598A'
const GREEN   = '#10B981'
const ORANGE  = '#f0853a'
const INK     = '#1F2937'
const AX_FILL = 'rgba(48, 89, 138, 0.12)'   // blue tint for A→X sub-grid
const XB_FILL = 'rgba(240, 133, 58, 0.15)'   // orange tint for X→B sub-grid
const GRID_STROKE = '#9CA3AF'

const SVG_W = PAD * 2 + COLS * CELL
const SVG_H = PAD * 2 + ROWS * CELL
const FIG_W = Math.min(280, SVG_W)

// ── grid lines ────────────────────────────────────────────────────────────────
function GridLines() {
  const lines: React.ReactNode[] = []
  for (let c = 0; c <= COLS; c++) {
    const [x, y0] = pt(c, 0)
    const [, y1]  = pt(c, ROWS)
    lines.push(<line key={`v${c}`} x1={x} y1={y0} x2={x} y2={y1} stroke={GRID_STROKE} strokeWidth={1.5} />)
  }
  for (let r = 0; r <= ROWS; r++) {
    const [x0, y] = pt(0, r)
    const [x1]    = pt(COLS, r)
    lines.push(<line key={`h${r}`} x1={x0} y1={y} x2={x1} y2={y} stroke={GRID_STROKE} strokeWidth={1.5} />)
  }
  return <g>{lines}</g>
}

// ── node labels (always visible) ──────────────────────────────────────────────
function StaticLabels() {
  const [ax, ay] = pt(...A_NODE)
  const [xx, xy] = pt(...X_NODE)
  const [bx, by] = pt(...B_NODE)
  return (
    <g>
      {/* A */}
      <circle cx={ax} cy={ay} r={5} fill={INK} />
      <text x={ax - 10} y={ay - 10} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} fill={INK}>A</text>
      {/* X */}
      <circle cx={xx} cy={xy} r={6} fill={INK} />
      <text x={xx + 14} y={xy} textAnchor="start" dominantBaseline="central" fontSize={16} fontWeight={700} fill={INK} fontStyle="italic">X</text>
      {/* B */}
      <text x={bx + 10} y={by + 10} textAnchor="start" dominantBaseline="hanging" fontSize={16} fontWeight={700} fill={INK}>B</text>
    </g>
  )
}

// ── A→X shaded rectangle ─────────────────────────────────────────────────────
function AXRegion() {
  const [x0, y0] = pt(...A_NODE)
  const [x1, y1] = pt(...X_NODE)
  return (
    <rect
      x={x0} y={y0}
      width={x1 - x0} height={y1 - y0}
      fill={AX_FILL}
      stroke={BLUE}
      strokeWidth={2}
      strokeDasharray="5,4"
      rx={3}
    />
  )
}

// ── X→B shaded rectangle ─────────────────────────────────────────────────────
function XBRegion() {
  const [x0, y0] = pt(...X_NODE)
  const [x1, y1] = pt(...B_NODE)
  return (
    <rect
      x={x0} y={y0}
      width={x1 - x0} height={y1 - y0}
      fill={XB_FILL}
      stroke={ORANGE}
      strokeWidth={2}
      strokeDasharray="5,4"
      rx={3}
    />
  )
}

// ── floating count badges ─────────────────────────────────────────────────────
function AXCountBadge() {
  const [x0, y0] = pt(...A_NODE)
  const [x1, y1] = pt(...X_NODE)
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  return (
    <g>
      <rect x={cx - 28} y={cy - 14} width={56} height={28} rx={6} fill={BLUE} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="white">
        20 paths
      </text>
    </g>
  )
}

function XBCountBadge() {
  const [x0, y0] = pt(...X_NODE)
  const [x1, y1] = pt(...B_NODE)
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  return (
    <g>
      <rect x={cx - 26} y={cy - 14} width={52} height={28} rx={6} fill={ORANGE} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="white">
        2 paths
      </text>
    </g>
  )
}

// ── main explainer ────────────────────────────────────────────────────────────
export default function GridPaths20B22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildGridPaths20B22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jalur A ke X ada C(6,3)=20, jalur X ke B ada C(2,1)=2, total = 40 jalur.'
      : 'Explainer: paths A to X = C(6,3) = 20; paths X to B = C(2,1) = 2; total = 40 paths.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* shaded regions behind the grid */}
          <AnimatePresence>
            {beat.highlightAX && (
              <motion.g key="ax-region" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AXRegion />
              </motion.g>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {beat.highlightXB && (
              <motion.g key="xb-region" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <XBRegion />
              </motion.g>
            )}
          </AnimatePresence>

          <GridLines />
          <StaticLabels />

          {/* count badges */}
          <AnimatePresence>
            {beat.showAXLabel && (
              <motion.g key="ax-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ transformOrigin: 'center' }}>
                <AXCountBadge />
              </motion.g>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {beat.showXBLabel && (
              <motion.g key="xb-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ transformOrigin: 'center' }}>
                <XBCountBadge />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation */}
        {beat.equation && (
          <div
            className="rounded-lg px-5 py-2 text-center font-mono text-base font-bold"
            style={isResult
              ? { background: '#D1FAE5', color: '#065F46', border: `2px solid ${GREEN}` }
              : { background: '#FEF3C7', color: '#92400E', border: '2px solid #F59E0B' }
            }
          >
            {beat.equation}
          </div>
        )}

        {/* caption */}
        <div
          className="w-full rounded-lg border px-4 py-2 text-center text-sm leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
