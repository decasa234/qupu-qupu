/**
 * ShapeMatrixSIMOC19G2Q13Illustration — SIMOC-19-G2-Q13
 *
 * "What is x in the figure below?"
 * 3×3 matrix where shapes in each row share a geometry family and each column
 * strips outer layers: row 0 = hexagonal, row 1 = square, row 2 = circular.
 * Bottom row (circle family) DECREASES in complexity left→right:
 *   [2,0] circle+petals+X  →  [2,1] circle+X  →  [2,2] x (missing)
 * Both row and column 3 patterns converge to: X alone.
 * Answer per OCR: B (X alone / 017.jpg).
 *
 * Source crops (docs/reference/ocr-res/simoc/contest/g2/2019.imgs/):
 *   015.jpg — 3×3 stem grid with "x" label in bottom-right cell
 *   016.jpg — choice A: circle-with-X stacked above plain circle
 *   017.jpg — choice B: X alone
 *   018.jpg — choice C: landscape rectangle with X
 *   (D = "None of the above", no image)
 *
 * No primitive matches (custom geometry per cell). Fresh SVG.
 * ShapeMatrixGrid is also exported for use by the Explainer.
 */

import type { WmiChoice } from '../../../../types/wmi'

const INK = '#1E293B'

export const CELL = 64
export const PAD  = 4
export const VW   = PAD * 2 + CELL * 3   // 200

// ── Private shape helpers (function declarations → hoisted) ─────────────────

function ShapeTriangle({ cx, cy }: { cx: number; cy: number }) {
  // Equilateral triangle, pointing up, circumradius 20
  const r = 20
  const pts = `${cx},${cy - r} ${cx + r * 0.866},${cy + r * 0.5} ${cx - r * 0.866},${cy + r * 0.5}`
  return <polygon points={pts} fill="none" stroke={INK} strokeWidth={2} />
}

function ShapeHex3({ cx, cy }: { cx: number; cy: number }) {
  // Hexagon outline + 3 through-diagonals (vertex → opposite vertex)
  const r = 21
  const vs = Array.from({ length: 6 }, (_, k) => {
    const a = -Math.PI / 2 + k * (Math.PI / 3)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
  return (
    <g>
      <polygon
        points={vs.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      {[0, 1, 2].map(i => (
        <line
          key={i}
          x1={vs[i][0]}
          y1={vs[i][1]}
          x2={vs[i + 3][0]}
          y2={vs[i + 3][1]}
          stroke={INK}
          strokeWidth={1.5}
        />
      ))}
    </g>
  )
}

function ShapeHex6({ cx, cy }: { cx: number; cy: number }) {
  // Hexagon outline + 6 spokes from center + inner hexagon
  const r = 21, ri = 10
  const vs = Array.from({ length: 6 }, (_, k) => {
    const a = -Math.PI / 2 + k * (Math.PI / 3)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
  const vi = Array.from({ length: 6 }, (_, k) => {
    const a = -Math.PI / 2 + k * (Math.PI / 3)
    return [cx + ri * Math.cos(a), cy + ri * Math.sin(a)] as [number, number]
  })
  return (
    <g>
      <polygon
        points={vs.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      {vs.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={INK} strokeWidth={1.5} />
      ))}
      <polygon
        points={vi.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke={INK}
        strokeWidth={1}
      />
    </g>
  )
}

function ShapeLSquare({ cx, cy }: { cx: number; cy: number }) {
  // Square drawn as four L-shaped corner brackets only
  const h = 20, c = 8
  return (
    <path
      d={
        `M${cx - h},${cy - h + c} L${cx - h},${cy - h} L${cx - h + c},${cy - h}` +
        ` M${cx + h - c},${cy - h} L${cx + h},${cy - h} L${cx + h},${cy - h + c}` +
        ` M${cx + h},${cy + h - c} L${cx + h},${cy + h} L${cx + h - c},${cy + h}` +
        ` M${cx - h + c},${cy + h} L${cx - h},${cy + h} L${cx - h},${cy + h - c}`
      }
      fill="none"
      stroke={INK}
      strokeWidth={2}
    />
  )
}

function ShapeSquareX({ cx, cy }: { cx: number; cy: number }) {
  const h = 20
  return (
    <g>
      <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} fill="none" stroke={INK} strokeWidth={2} />
      <line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={INK} strokeWidth={1.5} />
      <line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

function ShapeSquareXCircle({ cx, cy }: { cx: number; cy: number }) {
  const h = 20
  return (
    <g>
      <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} fill="none" stroke={INK} strokeWidth={2} />
      <line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={INK} strokeWidth={1.5} />
      <line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={INK} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={13} fill="none" stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

function ShapeCirclePetalX({ cx, cy }: { cx: number; cy: number }) {
  // Outer circle + 4 inward-curving quadratic bezier arcs (petal pattern) + X diagonals.
  // Each arc connects adjacent cardinal points of the outer circle, curving toward center.
  const r = 22, q = r * 0.38, d = r * Math.SQRT2 / 2
  const path = [
    `M${cx},${cy - r} Q${cx + q},${cy - q} ${cx + r},${cy}`,
    `M${cx + r},${cy} Q${cx + q},${cy + q} ${cx},${cy + r}`,
    `M${cx},${cy + r} Q${cx - q},${cy + q} ${cx - r},${cy}`,
    `M${cx - r},${cy} Q${cx - q},${cy - q} ${cx},${cy - r}`,
  ].join(' ')
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2} />
      <path d={path} fill="none" stroke={INK} strokeWidth={1.5} />
      <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} stroke={INK} strokeWidth={1.5} />
      <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

function ShapeCircleX({ cx, cy }: { cx: number; cy: number }) {
  const r = 22, d = r * Math.SQRT2 / 2
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2} />
      <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} stroke={INK} strokeWidth={1.5} />
      <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

// ── Grid component (exported for Explainer) ──────────────────────────────────

export interface GridHighlight {
  cells: Array<[number, number]>
  color: string
  borderColor: string
}

/** SSR-safe 3×3 shape-matrix SVG. Accepts optional cell highlights. */
export function ShapeMatrixGrid({ highlight }: { highlight?: GridHighlight }) {
  const hlSet = new Set((highlight?.cells ?? []).map(([r, c]) => `${r},${c}`)  )
  const cc = (r: number, c: number): [number, number] => [
    PAD + c * CELL + CELL / 2,
    PAD + r * CELL + CELL / 2,
  ]

  return (
    <svg viewBox={`0 0 ${VW} ${VW}`} width="100%" style={{ maxWidth: VW }}>
      {/* Cell backgrounds */}
      {[0, 1, 2].flatMap(r =>
        [0, 1, 2].map(c => {
          const key = `${r},${c}`
          const hl = hlSet.has(key)
          return (
            <rect
              key={key}
              x={PAD + c * CELL}
              y={PAD + r * CELL}
              width={CELL}
              height={CELL}
              fill={hl && highlight ? highlight.color : 'white'}
              stroke={hl && highlight ? highlight.borderColor : '#CBD5E1'}
              strokeWidth={hl && highlight ? 2 : 0.5}
            />
          )
        }),
      )}

      {/* Outer border */}
      <rect
        x={PAD}
        y={PAD}
        width={CELL * 3}
        height={CELL * 3}
        fill="none"
        stroke={INK}
        strokeWidth={1.5}
      />

      {/* Row 0 — hexagonal family */}
      <ShapeTriangle     cx={cc(0, 0)[0]} cy={cc(0, 0)[1]} />
      <ShapeHex3         cx={cc(0, 1)[0]} cy={cc(0, 1)[1]} />
      <ShapeHex6         cx={cc(0, 2)[0]} cy={cc(0, 2)[1]} />

      {/* Row 1 — square family */}
      <ShapeLSquare      cx={cc(1, 0)[0]} cy={cc(1, 0)[1]} />
      <ShapeSquareX      cx={cc(1, 1)[0]} cy={cc(1, 1)[1]} />
      <ShapeSquareXCircle cx={cc(1, 2)[0]} cy={cc(1, 2)[1]} />

      {/* Row 2 — circle family */}
      <ShapeCirclePetalX cx={cc(2, 0)[0]} cy={cc(2, 0)[1]} />
      <ShapeCircleX      cx={cc(2, 1)[0]} cy={cc(2, 1)[1]} />

      {/* [2,2] Missing cell — italic x label */}
      <text
        x={cc(2, 2)[0]}
        y={cc(2, 2)[1] + 8}
        textAnchor="middle"
        fontSize={30}
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontWeight="bold"
        fill={INK}
      >
        x
      </text>
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

export default function ShapeMatrixSIMOC19G2Q13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Matriks 3×3 bentuk: baris atas keluarga segi enam, baris tengah keluarga persegi, ' +
        'baris bawah keluarga lingkaran. Sel kanan bawah berlabel "x" — temukan pola kekomplekan.'
      }
    >
      <ShapeMatrixGrid />
    </div>
  )
}

// ── Named export: option renderer for picture choices A–C ────────────────────

const OW = 80, OH = 80   // option viewBox dimensions

export function ShapeMatrixSIMOC19G2Q13Option({ choice }: { choice: WmiChoice }) {
  const cx = OW / 2, cy = OH / 2

  // Choice A (016.jpg): circle+X on top, plain circle below (stacked, tangent)
  if (choice.label === 'A') {
    const r = 16, d = r * Math.SQRT2 / 2
    const cy1 = cy - r, cy2 = cy + r
    return (
      <svg viewBox={`0 0 ${OW} ${OH}`} width="100%">
        <circle cx={cx} cy={cy1} r={r} fill="none" stroke={INK} strokeWidth={2} />
        <line x1={cx - d} y1={cy1 - d} x2={cx + d} y2={cy1 + d} stroke={INK} strokeWidth={1.5} />
        <line x1={cx + d} y1={cy1 - d} x2={cx - d} y2={cy1 + d} stroke={INK} strokeWidth={1.5} />
        <circle cx={cx} cy={cy2} r={r} fill="none" stroke={INK} strokeWidth={2} />
      </svg>
    )
  }

  // Choice B (017.jpg): X alone — large diagonal cross
  if (choice.label === 'B') {
    const s = 22
    return (
      <svg viewBox={`0 0 ${OW} ${OH}`} width="100%">
        <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} stroke={INK} strokeWidth={3} />
        <line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy + s} stroke={INK} strokeWidth={3} />
      </svg>
    )
  }

  // Choice C (018.jpg): landscape rectangle with X diagonals
  if (choice.label === 'C') {
    const w = 44, h = 30
    return (
      <svg viewBox={`0 0 ${OW} ${OH}`} width="100%">
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke={INK} strokeWidth={2.5} />
        <line x1={cx - w / 2} y1={cy - h / 2} x2={cx + w / 2} y2={cy + h / 2} stroke={INK} strokeWidth={2} />
        <line x1={cx + w / 2} y1={cy - h / 2} x2={cx - w / 2} y2={cy + h / 2} stroke={INK} strokeWidth={2} />
      </svg>
    )
  }

  // D: "None of the above" — no picture renderer
  return null
}
