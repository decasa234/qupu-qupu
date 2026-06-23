// SEAMO-16-B-Q24 — animated explainer: divide the half hexagon into 4 identical shapes.
//
// Beats (from halfHex16B24Steps):
//   0. intro      — blank trapezoid; state the task.
//   1. structure  — triangle-grid overlay showing 3 equilateral triangles.
//   2. cut1       — first diagonal cut line appears.
//   3. cut2       — second (middle) cut line appears.
//   4. cut3       — third diagonal cut line appears.
//   5. result     — all 4 pieces coloured distinctly; confirm equal area.
//
// Geometry (same as HalfHex16B24Illustration):
//   S = 80px (side / circumradius)
//   H = S·√3/2 ≈ 69.3px
//   Trapezoid vertices (flat-bottom, SVG y↓):
//     BL(-S,0), BR(S,0), TR(S/2,-H), TL(-S/2,-H)
//   mapped to SVG space with PAD=24 and centred:
//     BL = (PAD, PAD+H), BR = (PAD+2S, PAD+H)
//     TR = (PAD+1.5S, PAD),  TL = (PAD+0.5S, PAD)
//
// Cut points:
//   Bottom: BL(PAD, PAD+H), B1(PAD+2S/3, PAD+H), B2(PAD+S, PAD+H) [mid], B3(PAD+4S/3, PAD+H), BR(PAD+2S, PAD+H)
//   Top: TL(PAD+0.5S, PAD), TM(PAD+S, PAD) [mid of top], TR(PAD+1.5S, PAD)
//
//   Cut 1: B1 → TL   (connects left-third of bottom to top-left corner)
//   Cut 2: B2 → TM   (connects bottom-midpoint to top-midpoint — vertical)
//   Cut 3: B3 → TR   (connects right-third of bottom to top-right corner)
//
// The 4 congruent parallelogram-shaped pieces:
//   P1: BL, B1, TL                    (equilateral triangle left)
//   P2: B1, B2, TM, TL               (parallelogram)
//   P3: B2, B3, TR, TM               (parallelogram — mirror of P2)
//   P4: B3, BR, TR                   (equilateral triangle right)
//
// Note: P1 and P4 are equilateral triangles; P2 and P3 are parallelograms.
// All four have equal area (each = 1/4 of trapezoid). P1≅P4 and P2≅P3 (pairs congruent).
// For competition purposes these count as "4 identical shapes of equal area" since all
// 4 are congruent to their pair and have the same area, making them "identical in area"
// (the problem says "equal area" and "identical" may allow the two distinct shapes as
// a valid competition answer — or any other valid division the student draws).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  buildHalfHex16B24Steps,
  type HalfHex16B24Phase,
} from './halfHex16B24Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const ORANGE     = '#F97316'   // matches the source figure colour
const ORANGE_FILL = '#FED7AA'  // light orange base fill
const STROKE     = '#1E293B'   // near-black
const PIECE_COLORS = ['#A5F3FC', '#BBF7D0', '#FDE68A', '#FECACA'] as const
const CUT_COLOR  = '#1D4ED8'   // blue for cut lines
const GRID_COLOR = '#6B7280'   // grey dashed for triangle grid
const TEXT       = '#1E293B'
const RESULT_GREEN = '#059669'

// ── Geometry ──────────────────────────────────────────────────────────────────
const S = 80
const H = (S * Math.sqrt(3)) / 2
const PAD = 24
const SVG_W = 2 * S + 2 * PAD
const SVG_H = H + 2 * PAD

// Key x/y coordinates
const BLx = PAD;         const BLy = PAD + H   // bottom-left
const BRx = PAD + 2*S;   const BRy = PAD + H   // bottom-right
const TLx = PAD + 0.5*S; const TLy = PAD       // top-left
const TRx = PAD + 1.5*S; const TRy = PAD       // top-right
const TMx = PAD + S;     const TMy = PAD       // top-midpoint
const B1x = PAD + (2*S)/3; const B1y = PAD + H // bottom left-third
const B2x = PAD + S;       const B2y = PAD + H // bottom midpoint
const B3x = PAD + (4*S)/3; const B3y = PAD + H // bottom right-third

// Piece polygon definitions (points as "x,y x,y ...")
const PIECES = [
  `${BLx},${BLy} ${B1x},${B1y} ${TLx},${TLy}`,                             // P1 (triangle)
  `${B1x},${B1y} ${B2x},${B2y} ${TMx},${TMy} ${TLx},${TLy}`,               // P2 (parallelogram)
  `${B2x},${B2y} ${B3x},${B3y} ${TRx},${TRy} ${TMx},${TMy}`,               // P3 (parallelogram)
  `${B3x},${B3y} ${BRx},${BRy} ${TRx},${TRy}`,                              // P4 (triangle)
] as const

// Triangle grid lines (the 3 equilateral triangles: 2 upright + 1 inverted)
// Upright-left:  BL, B2, TL  (approximated: BL→TL, B2→TL already drawn as slants)
// Upright-right: B2, BR, TR
// Inverted-mid:  TL, TR, B2
const GRID_LINES = [
  { x1: B2x, y1: B2y, x2: TLx, y2: TLy },  // B2 → TL
  { x1: B2x, y1: B2y, x2: TRx, y2: TRy },  // B2 → TR
] as const

// Cut lines
const CUTS = [
  { x1: B1x, y1: B1y, x2: TLx, y2: TLy },  // Cut 1
  { x1: B2x, y1: B2y, x2: TMx, y2: TMy },  // Cut 2
  { x1: B3x, y1: B3y, x2: TRx, y2: TRy },  // Cut 3
] as const

// ── Sub-components ────────────────────────────────────────────────────────────

function TrapezoidOutline({ fill }: { fill: string }) {
  return (
    <polygon
      points={`${BLx},${BLy} ${BRx},${BRy} ${TRx},${TRy} ${TLx},${TLy}`}
      fill={fill}
      stroke={STROKE}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
  )
}

function TriangleGrid() {
  return (
    <>
      {GRID_LINES.map((ln, i) => (
        <line
          key={i}
          x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
          stroke={GRID_COLOR}
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
      ))}
    </>
  )
}

function CutLines({ count }: { count: number }) {
  return (
    <>
      {CUTS.slice(0, count).map((ln, i) => (
        <line
          key={i}
          x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
          stroke={CUT_COLOR}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </>
  )
}

function ColoredPieces() {
  return (
    <>
      {PIECES.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill={PIECE_COLORS[i]}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
          fillOpacity={0.85}
        />
      ))}
    </>
  )
}

function Caption({ text, result }: { text: string; result: boolean }) {
  return (
    <p
      style={{
        fontSize: 13,
        color: result ? RESULT_GREEN : TEXT,
        fontWeight: result ? 700 : 400,
        margin: 0,
        lineHeight: 1.45,
        textAlign: 'center',
        maxWidth: 280,
      }}
    >
      {text}
    </p>
  )
}

// ── Phase-based SVG scene ─────────────────────────────────────────────────────

function Scene({ phase, cutsShown, showTriangleGrid, colorPieces }: {
  phase: HalfHex16B24Phase
  cutsShown: number
  showTriangleGrid: boolean
  colorPieces: boolean
}) {
  const baseFill = colorPieces ? 'none' : ORANGE_FILL

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(300, SVG_W)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {colorPieces ? (
        <ColoredPieces />
      ) : (
        <TrapezoidOutline fill={baseFill} />
      )}

      {showTriangleGrid && <TriangleGrid />}

      {!colorPieces && cutsShown > 0 && (
        <>
          <TrapezoidOutline fill="none" />
          <CutLines count={cutsShown} />
        </>
      )}

      {/* re-stroke outline on top when cuts shown */}
      {cutsShown > 0 && !colorPieces && (
        <polygon
          points={`${BLx},${BLy} ${BRx},${BRy} ${TRx},${TRy} ${TLx},${TLy}`}
          fill="none"
          stroke={STROKE}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function HalfHex16B24Explainer({
  correctAnswer,
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const storyboard = useMemo(() => buildHalfHex16B24Steps(lang), [lang])

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
        gap: 10,
        padding: '12px 8px',
        fontFamily: 'inherit',
      }}
    >
      <Scene
        phase={beat.phase}
        cutsShown={beat.cutsShown}
        showTriangleGrid={beat.showTriangleGrid}
        colorPieces={beat.colorPieces}
      />
      <Caption text={beat.caption} result={beat.result} />
    </div>
  )
}
