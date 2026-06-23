// SEAMO-18-A-Q23 — "The masses below are measured in grams. What is the mass of A?"
//
// Three BALANCED level-beam balance scales with two symbol types:
//   ○ circle  (yellow) = sphere objects
//   □ square  (yellow) = rectangular blocks
//   ▦ "48"   (black)  = cast-iron reference weight
//
// Scale 1 (top):    3 circles (left)  = 2 circles + "48" weight block (right)  → C = 48
// Scale 2 (middle): 3 squares (left)  = 2 circles  (right)                     → 3S = 96 → S = 32
// Scale 3 (bottom): 1 circle  "A" (left) = 4 squares  (right)                 → A = 128
//
// Adapted from ThreeScales24ECIllustration — same 3-stacked-scale layout.
// Uses the BalanceScale primitive from ./primitives/BalanceScale.
// SSR-safe: pure SVG, no framer-motion, no hooks, no randomness, no Date.

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'

// ── Palette (matches original scan colours) ────────────────────────────────
const CIRCLE_FILL   = '#FCD34D'  // yellow ball
const CIRCLE_STROKE = '#D97706'
const SQ_FILL       = '#FDE68A'  // pale yellow square
const SQ_STROKE     = '#B45309'
const WEIGHT_FILL   = '#1F2937'  // cast-iron black
const WHITE         = '#FFFFFF'

// ── Shared geometry ────────────────────────────────────────────────────────
const CR = 16   // circle radius
const SQ = 26   // square side
const SP = 38   // horizontal gap between items on same pan

// ── Pan content helpers (coords relative to BalanceScale pan tray-top-centre) ─

/** N yellow circles, horizontally centred at x=0. */
function Circles({ count }: { count: number }) {
  const total = (count - 1) * SP
  const start = -total / 2
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={start + i * SP}
          cy={-CR}
          r={CR}
          fill={CIRCLE_FILL}
          stroke={CIRCLE_STROKE}
          strokeWidth={2}
        />
      ))}
    </>
  )
}

/** N yellow squares, horizontally centred at x=0. */
function Squares({ count }: { count: number }) {
  const total = (count - 1) * SP
  const start = -total / 2
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x={start + i * SP - SQ / 2}
          y={-SQ}
          width={SQ}
          height={SQ}
          rx={3}
          fill={SQ_FILL}
          stroke={SQ_STROKE}
          strokeWidth={2}
        />
      ))}
    </>
  )
}

/**
 * Right pan of Scale 1: 2 circles + "48" weight block side by side.
 * Three items spaced SP apart, centred at x=0.
 */
function TwoCirclesAndWeight48() {
  const xs = [-SP, 0, SP] // 3 items centred
  const bw = 40, bh = 40, knobW = 10, knobH = 7
  return (
    <>
      {/* circles */}
      <circle cx={xs[0]} cy={-CR} r={CR} fill={CIRCLE_FILL} stroke={CIRCLE_STROKE} strokeWidth={2} />
      <circle cx={xs[1]} cy={-CR} r={CR} fill={CIRCLE_FILL} stroke={CIRCLE_STROKE} strokeWidth={2} />
      {/* "48" weight block */}
      <g transform={`translate(${xs[2]}, 0)`}>
        <rect x={-knobW / 2} y={-(bh + knobH)} width={knobW} height={knobH + 3} rx={2} fill={WEIGHT_FILL} />
        <rect x={-bw / 2} y={-bh} width={bw} height={bh} rx={5} fill={WEIGHT_FILL} />
        <text
          x={0}
          y={-bh / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={900}
          fill={WHITE}
        >
          48
        </text>
      </g>
    </>
  )
}

/** Single yellow circle labelled "A". */
function CircleA() {
  return (
    <g>
      <circle cx={0} cy={-CR} r={CR} fill={CIRCLE_FILL} stroke={CIRCLE_STROKE} strokeWidth={2} />
      <text
        x={0}
        y={-CR}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={900}
        fill={WEIGHT_FILL}
      >
        A
      </text>
    </g>
  )
}

// ── Co-exported sub-figure (for explainer spotlighting) ───────────────────

export interface MassScales18A23Props {
  /** Spotlight one scale (1=top, 2=middle, 3=bottom); others dim. null=all neutral. */
  litScale?: 1 | 2 | 3 | null
}

export function MassScales18A23({ litScale = null }: MassScales18A23Props) {
  const scales: Array<{ ariaLabel: string; left: React.ReactNode; right: React.ReactNode; panW: number }> = [
    {
      ariaLabel: 'Timbangan 1: 3 lingkaran = 2 lingkaran + beban 48 gram',
      left: <Circles count={3} />,
      right: <TwoCirclesAndWeight48 />,
      panW: 130,
    },
    {
      ariaLabel: 'Timbangan 2: 3 persegi = 2 lingkaran',
      left: <Squares count={3} />,
      right: <Circles count={2} />,
      panW: 110,
    },
    {
      ariaLabel: 'Timbangan 3: lingkaran A = 4 persegi',
      left: <CircleA />,
      right: <Squares count={4} />,
      panW: 130,
    },
  ]

  return (
    <div className="flex flex-col gap-1 w-full" style={{ maxWidth: 380, margin: '0 auto' }}>
      {scales.map((s, i) => {
        const idx = (i + 1) as 1 | 2 | 3
        const dim = litScale !== null && litScale !== idx
        const lit = litScale === idx
        return (
          <div
            key={i}
            role="img"
            aria-label={s.ariaLabel}
            style={{
              opacity: dim ? 0.25 : 1,
              outline: lit ? '2.5px dashed #2563EB' : undefined,
              borderRadius: lit ? 12 : undefined,
              padding: lit ? 4 : undefined,
            }}
          >
            <BalanceScale
              tilt={0}
              left={s.left}
              right={s.right}
              panW={s.panW}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Default export: question stem illustration ─────────────────────────────

export default function MassScales18A23Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga timbangan seimbang yang menunjukkan hubungan massa. ' +
        'Timbangan 1: 3 lingkaran = 2 lingkaran + beban 48 gram, sehingga 1 lingkaran = 48 gram. ' +
        'Timbangan 2: 3 persegi = 2 lingkaran = 96 gram, sehingga 1 persegi = 32 gram. ' +
        'Timbangan 3: lingkaran A = 4 persegi = 128 gram.'
      }
    >
      <MassScales18A23 />
    </div>
  )
}
