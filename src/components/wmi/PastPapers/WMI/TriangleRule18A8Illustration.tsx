// SEAMO-18-A-Q8 — "Find the missing number."
//
// Three triangles are shown. Each triangle has:
//   - two numbers at the base corners (left and right)
//   - a number at the apex (top)
//   - a number inside a central inverted triangle
//
// The hidden rule: apex = (left × right) − centre
//   T1 (pink):  4 × 7 = 28 ;  28 − 15 = 13 ✓
//   T2 (olive): 6 × 8 = 48 ;  48 − 17 = 31 ✓
//   T3 (teal):  7 × 9 = 63 ;  63 − 32 = 31 → answer A
//
// The static illustration shows all three triangles, with "?" at T3's apex.
//
// Layout: two triangles on the top row, one centred below.
// Each triangle unit is ~130 wide × 115 tall; grid origin PAD=20.
//
// Primitives used: none imported — fresh bespoke SVG (triangle puzzle glyph).
//
// SSR-safe: pure render, no hooks, no framer-motion.
//
// Exports:
//   TriangleRule18A8Figure — shared primitive (accepts showAnswer prop)
//   default                — static stem illustration
//   VISUALS                — record keyed 'SEAMO-18-A-Q8' for the registry

import type { JSX } from 'react'

// ── Triangle geometry ────────────────────────────────────────────────────────

/** Half-width and height of one triangle unit (in SVG px). */
const TW = 65   // half-width (full base = 130)
const TH = 110  // height from base to apex

/**
 * TrianglePuzzle — draws a single triangle puzzle unit at (cx, topY).
 *
 * cx:     horizontal centre of the triangle
 * topY:   y-coordinate of the apex
 * left:   left base corner value
 * right:  right base corner value
 * apex:   apex value (string so we can pass '?')
 * centre: centre inverted-triangle value
 * fill:   outer triangle fill colour
 * innerFill: inner inverted triangle fill colour
 * textOnFill: text colour for numbers on the outer fill (apex/corners)
 */
function TrianglePuzzle({
  cx,
  topY,
  left,
  right,
  apex,
  centre,
  fill,
  innerFill,
}: {
  cx: number
  topY: number
  left: number | string
  right: number | string
  apex: number | string
  centre: number | string
  fill: string
  innerFill: string
}) {
  const baseY = topY + TH
  // Three outer vertices
  const apexPt  = { x: cx,        y: topY   }
  const leftPt  = { x: cx - TW,   y: baseY  }
  const rightPt = { x: cx + TW,   y: baseY  }

  // Inner inverted triangle — sits in the lower half
  // Midpoints of left-side, right-side, and base
  const midLeft  = { x: (apexPt.x + leftPt.x) / 2,  y: (apexPt.y + leftPt.y) / 2  }
  const midRight = { x: (apexPt.x + rightPt.x) / 2, y: (apexPt.y + rightPt.y) / 2 }
  const midBase  = { x: (leftPt.x + rightPt.x) / 2,  y: (leftPt.y + rightPt.y) / 2 }

  // Centre of the inner triangle (for the label)
  const innerCx = (midLeft.x + midRight.x + midBase.x) / 3
  const innerCy = (midLeft.y + midRight.y + midBase.y) / 3

  // Font sizes
  const apexFs  = 18
  const cornerFs = 16
  const centreFs = 16

  const outerPts  = `${apexPt.x},${apexPt.y} ${leftPt.x},${leftPt.y} ${rightPt.x},${rightPt.y}`
  // Inverted inner triangle: top-left mid, top-right mid, bottom mid
  const innerPts  = `${midLeft.x},${midLeft.y} ${midRight.x},${midRight.y} ${midBase.x},${midBase.y}`

  return (
    <g>
      {/* Outer triangle */}
      <polygon points={outerPts} fill={fill} stroke="none" />
      {/* Inner inverted triangle */}
      <polygon points={innerPts} fill={innerFill} stroke="none" />

      {/* Apex label */}
      <text
        x={apexPt.x}
        y={apexPt.y + 20}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={apexFs}
        fontWeight={800}
        fill="white"
        className="font-display"
      >
        {apex}
      </text>

      {/* Left base corner label */}
      <text
        x={leftPt.x + 22}
        y={leftPt.y - 16}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={cornerFs}
        fontWeight={800}
        fill="white"
        className="font-display"
      >
        {left}
      </text>

      {/* Right base corner label */}
      <text
        x={rightPt.x - 22}
        y={rightPt.y - 16}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={cornerFs}
        fontWeight={800}
        fill="white"
        className="font-display"
      >
        {right}
      </text>

      {/* Centre label (inside inverted triangle) */}
      <text
        x={innerCx}
        y={innerCy + 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={centreFs}
        fontWeight={800}
        fill="#1F2937"
        className="font-display"
      >
        {centre}
      </text>
    </g>
  )
}

// ── SVG canvas dimensions ────────────────────────────────────────────────────

const PAD   = 20
const GAP   = 30   // horizontal gap between the two top triangles
// Full triangle base = 2 × TW = 130; two triangles side-by-side + gap
const SVG_W = PAD * 2 + 2 * (2 * TW) + GAP   // 20+130+30+130+20 = 330
const ROW_H = TH + 24                          // row height with bottom margin
const SVG_H = PAD + ROW_H + 16 + ROW_H + PAD  // two rows

// Horizontal centres for each triangle
const CX1 = PAD + TW               // left triangle of top row
const CX2 = PAD + 2 * TW + GAP + TW  // right triangle of top row
const CX3 = SVG_W / 2              // bottom triangle centred

// Top Y for each triangle
const TOP_Y1 = PAD
const TOP_Y2 = PAD
const TOP_Y3 = PAD + ROW_H + 16

// ── Exported figure primitive ─────────────────────────────────────────────────

export interface TriangleRule18A8FigureProps {
  /** When true, show the solved answer (31) instead of '?' at T3's apex. */
  showAnswer?: boolean
}

/**
 * TriangleRule18A8Figure — shared primitive for illustration and explainer.
 *
 * Draws the three triangle puzzle units. By default the third triangle's apex
 * shows '?'. Pass `showAnswer` to reveal 31.
 */
export function TriangleRule18A8Figure({ showAnswer = false }: TriangleRule18A8FigureProps) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* T1 — pink/crimson — base 4 & 7, apex 13, centre 15 */}
      <TrianglePuzzle
        cx={CX1}
        topY={TOP_Y1}
        left={4}
        right={7}
        apex={13}
        centre={15}
        fill="#E91E8C"
        innerFill="#F8BBD9"
      />

      {/* T2 — olive/yellow-green — base 6 & 8, apex 31, centre 17 */}
      <TrianglePuzzle
        cx={CX2}
        topY={TOP_Y2}
        left={6}
        right={8}
        apex={31}
        centre={17}
        fill="#8B9B2A"
        innerFill="#E8EDA0"
      />

      {/* T3 — teal — base 7 & 9, apex ?, centre 32 */}
      <TrianglePuzzle
        cx={CX3}
        topY={TOP_Y3}
        left={7}
        right={9}
        apex={showAnswer ? 31 : '?'}
        centre={32}
        fill="#00838F"
        innerFill="#80DEEA"
      />
    </svg>
  )
}

// ── Default export: static stem illustration ──────────────────────────────────

/**
 * TriangleRule18A8Illustration
 *
 * SEAMO 2018 Paper A Q8 — three coloured triangles.
 * Each triangle has numbers at the two base corners, the apex, and the centre.
 * The third triangle's apex is unknown (?). Find the rule and compute it.
 */
export default function TriangleRule18A8Illustration({ params }: { params?: unknown }) {
  void params // fully determined by the question
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Tiga segitiga berpola. Segitiga merah: sudut 4 dan 7, puncak 13, tengah 15. ' +
        'Segitiga hijau-kuning: sudut 6 dan 8, puncak 31, tengah 17. ' +
        'Segitiga biru-hijau: sudut 7 dan 9, puncak ?, tengah 32. ' +
        'Temukan angka yang menggantikan tanda tanya.'
      }
    >
      <TriangleRule18A8Figure />
    </div>
  )
}

// ── VISUALS export ─────────────────────────────────────────────────────────────

/**
 * Registry loaders for SEAMO-2018-A-Q8.
 * Add this entry to VISUALS in registry.ts:
 *
 *   'SEAMO-18-A-Q8': {
 *     illustration: () => import('./TriangleRule18A8Illustration'),
 *   },
 */
// (registry wiring is centralized in registry.ts)
