// SASMO 2019 G3 Q15 — Three balance scales comparing toy weights.
// Scale 1: 1 Train (left, ↓ heavier) vs 2 Cars (right)    → 1 Train > 2 Cars
// Scale 2: 3 Ships (left) vs 3 Cars (right, ↓ heavier)    → 1 Car > 1 Ship
// Scale 3: 2 Trains (left) vs 1 Submarine (right, ↓)      → 1 Submarine > 2 Trains
// Full chain: Submarine > Train > Car > Ship → Submarine is heaviest. Answer: B.
// Primitive: BalanceScale (./primitives/BalanceScale) — three instances stacked.
// SSR-safe: no hooks, no framer-motion, no randomness, no Date.

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'

// ── palette ────────────────────────────────────────────────────────────────
const INK         = '#1F2937'
const TRAIN_FILL  = '#F97316'   // orange
const TRAIN_DARK  = '#EA580C'
const CAR_FILL    = '#C084FC'   // purple
const CAR_DARK    = '#A855F7'
const SHIP_FILL   = '#60A5FA'   // sky-blue
const SHIP_DARK   = '#3B82F6'
const SUB_FILL    = '#FBBF24'   // amber/gold
const SUB_DARK    = '#F59E0B'
const WHEEL       = '#374151'

// ── Toy glyphs ─────────────────────────────────────────────────────────────
// Pan-coordinate convention: (0,0) = tray top-centre. Items extend upward (negative y).
// All shapes have their bottom at y = 0 (sits on the tray surface).

function TrainGlyph({ cx = 0 }: { cx?: number }) {
  return (
    <g>
      {/* chimney */}
      <rect x={cx - 16} y={-30} width={5} height={8} rx={1} fill={WHEEL} />
      {/* cab */}
      <rect x={cx + 4} y={-32} width={12} height={12} rx={2} fill={TRAIN_DARK} stroke={INK} strokeWidth={1.5} />
      {/* body */}
      <rect x={cx - 18} y={-23} width={36} height={15} rx={3} fill={TRAIN_FILL} stroke={INK} strokeWidth={1.5} />
      {/* wheels */}
      <circle cx={cx - 10} cy={-4} r={5} fill={WHEEL} />
      <circle cx={cx + 10} cy={-4} r={5} fill={WHEEL} />
    </g>
  )
}

function CarGlyph({ cx = 0 }: { cx?: number }) {
  return (
    <g>
      {/* roof */}
      <rect x={cx - 8} y={-26} width={16} height={10} rx={3} fill={CAR_DARK} stroke={INK} strokeWidth={1.5} />
      {/* body */}
      <rect x={cx - 13} y={-18} width={26} height={11} rx={3} fill={CAR_FILL} stroke={INK} strokeWidth={1.5} />
      {/* wheels */}
      <circle cx={cx - 8} cy={-3} r={4} fill={WHEEL} />
      <circle cx={cx + 8} cy={-3} r={4} fill={WHEEL} />
    </g>
  )
}

function ShipGlyph({ cx = 0 }: { cx?: number }) {
  return (
    <g>
      {/* hull */}
      <path
        d={`M ${cx - 19},${-4} L ${cx - 21},${0} L ${cx + 21},${0} L ${cx + 19},${-4} Z`}
        fill={SHIP_FILL} stroke={INK} strokeWidth={1.5}
      />
      {/* body */}
      <rect x={cx - 16} y={-14} width={32} height={10} rx={1} fill={SHIP_FILL} stroke={INK} strokeWidth={1.5} />
      {/* bridge */}
      <rect x={cx - 8} y={-24} width={16} height={10} rx={2} fill={SHIP_DARK} stroke={INK} strokeWidth={1.5} />
      {/* flag pole + flag */}
      <line x1={cx + 6} y1={-24} x2={cx + 6} y2={-30} stroke={INK} strokeWidth={1.5} />
      <polygon points={`${cx + 6},-30 ${cx + 12},-27 ${cx + 6},-24`} fill="#EF4444" />
    </g>
  )
}

function SubmarineGlyph({ cx = 0 }: { cx?: number }) {
  return (
    <g>
      {/* conning tower */}
      <rect x={cx - 5} y={-26} width={10} height={14} rx={3} fill={SUB_DARK} stroke={INK} strokeWidth={1.5} />
      {/* periscope */}
      <line x1={cx + 2} y1={-26} x2={cx + 2} y2={-30} stroke={INK} strokeWidth={2} />
      <rect x={cx} y={-30} width={5} height={2} rx={1} fill={INK} />
      {/* body */}
      <ellipse cx={cx} cy={-12} rx={24} ry={10} fill={SUB_FILL} stroke={INK} strokeWidth={1.5} />
      {/* portholes */}
      <circle cx={cx - 9} cy={-12} r={3} fill="#FFF" stroke={INK} strokeWidth={1} />
      <circle cx={cx + 6} cy={-12} r={3} fill="#FFF" stroke={INK} strokeWidth={1} />
      {/* tail fin */}
      <path
        d={`M ${cx + 22},${-14} L ${cx + 30},${-20} L ${cx + 30},${-8} Z`}
        fill={SUB_DARK} stroke={INK} strokeWidth={1.5}
      />
    </g>
  )
}

// ── Shared three-scale component (supports per-beat highlighting) ──────────

export interface ToyScalesSASMO19G3Q15Props {
  /** 1–3 highlights that scale; null = all neutral */
  litScale?: 1 | 2 | 3 | null
}

export function ToyScalesSASMO19G3Q15({ litScale = null }: ToyScalesSASMO19G3Q15Props) {
  const opacity = (n: 1 | 2 | 3) =>
    litScale === null ? 1 : litScale === n ? 1 : 0.2

  // Scale 1: 1 Train (left, heavier) vs 2 Cars (right)
  const s1Left  = <TrainGlyph />
  const s1Right = <><CarGlyph cx={-20} /><CarGlyph cx={20} /></>

  // Scale 2: 3 Ships (left) vs 3 Cars (right, heavier)
  const s2Left  = <><ShipGlyph cx={-28} /><ShipGlyph /><ShipGlyph cx={28} /></>
  const s2Right = <><CarGlyph cx={-28} /><CarGlyph /><CarGlyph cx={28} /></>

  // Scale 3: 2 Trains (left) vs 1 Submarine (right, heavier)
  const s3Left  = <><TrainGlyph cx={-22} /><TrainGlyph cx={22} /></>
  const s3Right = <SubmarineGlyph />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 360, margin: '0 auto' }}>
      <div style={{ opacity: opacity(1), transition: 'opacity 0.3s' }}>
        <BalanceScale tilt={1}  left={s1Left}  right={s1Right} panW={90}  />
      </div>
      <div style={{ opacity: opacity(2), transition: 'opacity 0.3s' }}>
        <BalanceScale tilt={-1} left={s2Left}  right={s2Right} panW={110} />
      </div>
      <div style={{ opacity: opacity(3), transition: 'opacity 0.3s' }}>
        <BalanceScale tilt={-1} left={s3Left}  right={s3Right} panW={110} />
      </div>
    </div>
  )
}

// ── Default export — stem illustration ────────────────────────────────────

export default function ToyScalesSASMO19G3Q15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three balance scales. ' +
        'Scale 1: 1 train (left, heavier) vs 2 cars (right). ' +
        'Scale 2: 3 ships (left) vs 3 cars (right, heavier). ' +
        'Scale 3: 2 trains (left) vs 1 submarine (right, heavier). ' +
        'Chain: Submarine > Train > Car > Ship — submarine is the heaviest toy.'
      }
    >
      <ToyScalesSASMO19G3Q15 />
    </div>
  )
}
