// SEAMO-16-B-Q18 — animated explainer: solve for the hypotenuse of a right
// triangle with perimeter 12 cm and area 6 cm².
//
// Reuses the triangle geometry from RightTriangle16B18Illustration.
// Beats (from rightTriangle16B18Steps):
//   0. intro   — unlabelled triangle; given data.
//   1. eq1     — label sides a, b, h; write a+b+h=12.
//   2. eq2     — area equation ab=12.
//   3. pythag  — substitute into Pythagoras.
//   4. solve   — expand and solve h=5.
//   5. verify  — show 3-4-5 labels; check perimeter & area.
//   6. result  — confirm h=5 cm = answer B.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  buildRightTriangle16B18Steps,
  type RightTriangle16B18Phase,
} from './rightTriangle16B18Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const FILL_BASE   = '#EFF6FF'
const FILL_VERIFY = '#D1FAE5'  // green tint when 3-4-5 confirmed
const STROKE_BASE = '#1D4ED8'
const STROKE_OK   = '#059669'
const SW          = 2
const TEXT        = '#1E293B'
const DIM         = '#6B7280'
const BLUE        = '#1D4ED8'
const GREEN       = '#059669'
const AMBER       = '#D97706'

// ── SVG constants (same triangle as Illustration) ─────────────────────────────
const VBW = 200
const VBH = 160
const A = { x: 30,  y: 130 }
const B = { x: 130, y: 130 }
const C = { x: 130, y: 50  }
const SQ = 10

// ── Right-angle marker ────────────────────────────────────────────────────────
function RightAngleMarker({ stroke }: { stroke: string }) {
  const { x, y } = A
  return (
    <path
      d={`M ${x + SQ},${y} L ${x + SQ},${y - SQ} L ${x},${y - SQ}`}
      fill="none"
      stroke={stroke}
      strokeWidth={1.5}
    />
  )
}

// ── Triangle with phase-aware labels ─────────────────────────────────────────
function PhaseTriangle({ phase }: { phase: RightTriangle16B18Phase }) {
  const isVerify = phase === 'verify' || phase === 'result'
  const fill   = isVerify ? FILL_VERIFY : FILL_BASE
  const stroke = isVerify ? STROKE_OK   : STROKE_BASE
  const showLetters = phase === 'eq1' || phase === 'eq2' || phase === 'pythag' || phase === 'solve'

  return (
    <g>
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <RightAngleMarker stroke={stroke} />

      {/* Generic letter labels (phases eq1–solve) */}
      {showLetters && (
        <>
          <text x={(A.x + B.x) / 2} y={A.y + 16} textAnchor="middle" fontSize={12} fill={DIM} fontStyle="italic">a</text>
          <text x={B.x + 12} y={(B.y + C.y) / 2 + 4} textAnchor="start" fontSize={12} fill={DIM} fontStyle="italic">b</text>
          <text x={(A.x + C.x) / 2 - 14} y={(A.y + C.y) / 2} textAnchor="middle" fontSize={12} fill={DIM} fontStyle="italic">h</text>
        </>
      )}

      {/* Numeric labels (verify + result) */}
      {isVerify && (
        <>
          <text x={(A.x + B.x) / 2} y={A.y + 16} textAnchor="middle" fontSize={13} fill={GREEN} fontWeight="700">4</text>
          <text x={B.x + 12} y={(B.y + C.y) / 2 + 4} textAnchor="start" fontSize={13} fill={GREEN} fontWeight="700">3</text>
          <text x={(A.x + C.x) / 2 - 16} y={(A.y + C.y) / 2} textAnchor="middle" fontSize={13} fill={AMBER} fontWeight="700">5</text>
        </>
      )}
    </g>
  )
}

// ── Equation chip ─────────────────────────────────────────────────────────────
function EqChip({ text }: { text: string }) {
  if (!text) return null
  return (
    <div
      style={{
        background: '#EFF6FF',
        border: '1.5px solid #93C5FD',
        borderRadius: 8,
        padding: '4px 10px',
        fontSize: 13,
        fontWeight: 600,
        color: BLUE,
        textAlign: 'center',
        margin: '0 auto 6px',
        display: 'inline-block',
      }}
    >
      {text}
    </div>
  )
}

// ── Caption ───────────────────────────────────────────────────────────────────
function Caption({ text, result }: { text: string; result: boolean }) {
  return (
    <p
      style={{
        fontSize: 13,
        color: result ? GREEN : TEXT,
        fontWeight: result ? 700 : 400,
        margin: 0,
        lineHeight: 1.45,
        textAlign: 'center',
      }}
    >
      {text}
    </p>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────
export default function RightTriangle16B18Explainer({
  correctAnswer,
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const storyboard = useMemo(() => buildRightTriangle16B18Steps(lang), [lang])

  const holds = useMemo(
    () => storyboard.steps.map((s) => s.hold),
    [storyboard.steps],
  )

  const currentIndex = useBeatControl(storyboard.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds,
  })

  const beat = storyboard.steps[currentIndex]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 8px',
        fontFamily: 'inherit',
      }}
    >
      {/* SVG triangle */}
      <svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        width={VBW}
        height={VBH}
        aria-hidden="true"
      >
        {/* Given data box — always visible */}
        <rect x={2} y={2} width={140} height={38} rx={5} fill="#DBEAFE" stroke="#93C5FD" strokeWidth={1} />
        <text x={10} y={17} fontSize={11} fill={TEXT} fontWeight="600">Perimeter = 12 cm</text>
        <text x={10} y={33} fontSize={11} fill={TEXT} fontWeight="600">Area = 6 cm²</text>

        <PhaseTriangle phase={beat.phase} />
      </svg>

      {/* Equation chip */}
      {beat.equation && <EqChip text={beat.equation} />}

      {/* Caption */}
      <Caption text={beat.caption} result={beat.result} />
    </div>
  )
}
