// OSN 2025 SD Nasional SemiFinal Q1 — animated explainer
//
// Imports the static primitives from the Illustration so the animation reads
// as the scene "coming alive":
//   Beat 0 — intro:  show the figure; highlight a single petak (½ cm²)
//   Beat 1 — count:  fade in "10 petaks" label over the triangle
//   Beat 2 — bound:  show bounding L-shape overlay + sub-region labels
//   Beat 3 — result: show 10 × ½ = 5 cm² answer badge

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL,
  COLS,
  ROWS,
  PAD,
  SVG_W,
  SVG_H,
  L_POLY,
  VA,
  VB,
  VC,
  TRI_POLY,
} from './GridCompositeOSN25NSFQ1Illustration'
import { buildGridCompositeOSN25NSFQ1Steps } from './gridCompositeOSN25NSFQ1Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN   = '#10B981'
const AMBER   = '#f59e0b'
const BLUE    = '#3b82f6'
const INK     = '#1e293b'
const FADE_IN = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

// ── sub-component: single unit-square highlight (beat 0) ──────────────────────
function UnitHighlight() {
  // Highlight the top-left cell of the right block as the "sample" petak
  const cx = 6 * CELL
  const cy = 2 * CELL
  return (
    <motion.g {...FADE_IN} transition={{ duration: 0.4 }}>
      <rect
        x={cx} y={cy} width={CELL} height={CELL}
        fill={AMBER} fillOpacity={0.4} stroke={AMBER} strokeWidth={2}
      />
      <text
        x={cx + CELL / 2} y={cy + CELL / 2 + 6}
        textAnchor="middle" fontSize={13} fontWeight="bold"
        fill={AMBER} fontFamily="sans-serif"
      >½ cm²</text>
    </motion.g>
  )
}

// ── sub-component: "10 petaks" count label inside triangle (beat 1) ───────────
function CountLabel() {
  // centroid of the triangle
  const cx = (VA.x + VB.x + VC.x) / 3
  const cy = (VA.y + VB.y + VC.y) / 3
  return (
    <motion.g {...FADE_IN} transition={{ duration: 0.4 }}>
      <rect
        x={cx - 44} y={cy - 20}
        width={88} height={38}
        rx={6} fill={GREEN} fillOpacity={0.92}
      />
      <text
        x={cx} y={cy - 3}
        textAnchor="middle" fontSize={12} fontWeight="bold"
        fill="white" fontFamily="sans-serif"
      >10 petak</text>
      <text
        x={cx} y={cy + 12}
        textAnchor="middle" fontSize={11}
        fill="white" fontFamily="sans-serif"
      >di dalam △ABC</text>
    </motion.g>
  )
}

// ── sub-component: bounding-box overlay (beat 2) ─────────────────────────────
function BoundOverlay() {
  return (
    <motion.g {...FADE_IN} transition={{ duration: 0.5 }}>
      {/* Big square: 6×6 (left block) — green dashed outline */}
      <rect
        x={0} y={0} width={6 * CELL} height={6 * CELL}
        fill="none" stroke={GREEN} strokeWidth={2} strokeDasharray="6 3"
      />
      <text x={2 * CELL} y={1.5 * CELL}
        fontSize={13} fontWeight="bold" fill={GREEN} fontFamily="sans-serif"
        textAnchor="middle"
      >Lb = 36</text>

      {/* Small square: 4×4 (right block) — amber dashed outline */}
      <rect
        x={6 * CELL} y={2 * CELL} width={4 * CELL} height={4 * CELL}
        fill="none" stroke={AMBER} strokeWidth={2} strokeDasharray="6 3"
      />
      <text x={8 * CELL} y={3 * CELL}
        fontSize={13} fontWeight="bold" fill={AMBER} fontFamily="sans-serif"
        textAnchor="middle"
      >Lk = 16</text>
    </motion.g>
  )
}

// ── sub-component: result badge (beat 3) ─────────────────────────────────────
function ResultBadge() {
  const cx = SVG_W / 2
  const cy = SVG_H / 2
  return (
    <motion.g
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <rect
        x={cx - 72} y={cy - 36}
        width={144} height={72}
        rx={12} fill={GREEN}
      />
      <text
        x={cx} y={cy - 8}
        textAnchor="middle" fontSize={20} fontWeight="bold"
        fill="white" fontFamily="sans-serif"
      >5 cm²</text>
      <text
        x={cx} y={cy + 16}
        textAnchor="middle" fontSize={13}
        fill="white" fontFamily="sans-serif"
      >10 × ½ = 5</text>
    </motion.g>
  )
}

// ── equation bar ─────────────────────────────────────────────────────────────
function EquationBar({ text }: { text: string }) {
  if (!text) return null
  return (
    <motion.g {...FADE_IN} transition={{ duration: 0.35 }}>
      <rect
        x={0} y={SVG_H + 6}
        width={SVG_W} height={28}
        rx={4} fill="#f1f5f9"
      />
      <text
        x={SVG_W / 2} y={SVG_H + 24}
        textAnchor="middle" fontSize={13} fontWeight="600"
        fill={INK} fontFamily="monospace"
      >{text}</text>
    </motion.g>
  )
}

// ── main explainer ────────────────────────────────────────────────────────────
export default function GridCompositeOSN25NSFQ1Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const sb = useMemo(() => buildGridCompositeOSN25NSFQ1Steps(lang as 'en' | 'id'), [lang])

  const holds = useMemo(() => sb.steps.map(s => s.hold), [sb])

  const beatIndex = useBeatControl(sb.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds,
  })

  const beat = sb.steps[beatIndex]

  const eqBarH = beat.equation ? 40 : 0
  const totalH = SVG_H + PAD * 2 + eqBarH

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${SVG_W + PAD * 2} ${totalH}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block' }}
    >
      {/* ── static base ──────────────────────────────────────────────────── */}
      {/* grid background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
      {Array.from({ length: COLS + 1 }, (_, i) => (
        <line key={`v${i}`}
          x1={i * CELL} y1={0} x2={i * CELL} y2={SVG_H}
          stroke="#cbd5e1" strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: ROWS + 1 }, (_, i) => (
        <line key={`h${i}`}
          x1={0} y1={i * CELL} x2={SVG_W} y2={i * CELL}
          stroke="#cbd5e1" strokeWidth={0.5}
        />
      ))}

      {/* L-shape fill */}
      <polygon points={L_POLY} fill="#dbeafe" />

      {/* inner grid lines */}
      <g clipPath="url(#l-clip-osn25nsfq1-ex)">
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <line key={`lv${i}`}
            x1={i * CELL} y1={0} x2={i * CELL} y2={SVG_H}
            stroke="#93c5fd" strokeWidth={0.7}
          />
        ))}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line key={`lh${i}`}
            x1={0} y1={i * CELL} x2={SVG_W} y2={i * CELL}
            stroke="#93c5fd" strokeWidth={0.7}
          />
        ))}
      </g>
      <defs>
        <clipPath id="l-clip-osn25nsfq1-ex">
          <polygon points={L_POLY} />
        </clipPath>
      </defs>

      {/* triangle fill */}
      <polygon points={TRI_POLY} fill="#fef9c3" fillOpacity={0.6} />
      <polygon points={TRI_POLY} fill="none" stroke={INK} strokeWidth={2} />

      {/* L-shape border */}
      <polygon points={L_POLY} fill="none" stroke={BLUE} strokeWidth={2.5} />

      {/* vertex dots + labels */}
      {[VA, VB, VC].map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={INK} />
      ))}
      <text x={VA.x - 18} y={VA.y + 6} fontSize={14} fontWeight="bold" fill={INK} fontFamily="sans-serif">A</text>
      <text x={VB.x + 8}  y={VB.y + 6} fontSize={14} fontWeight="bold" fill={INK} fontFamily="sans-serif">B</text>
      <text x={VC.x + 8}  y={VC.y + 6} fontSize={14} fontWeight="bold" fill={INK} fontFamily="sans-serif">C</text>

      {/* ── animated overlays ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {beat.showUnit   && <UnitHighlight  key="unit"   />}
        {beat.showCount  && <CountLabel     key="count"  />}
        {beat.showBound  && <BoundOverlay   key="bound"  />}
        {beat.showResult && <ResultBadge    key="result" />}
      </AnimatePresence>

      {/* ── equation bar ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {beat.equation && <EquationBar key={beat.phase} text={beat.equation} />}
      </AnimatePresence>
    </svg>
  )
}
