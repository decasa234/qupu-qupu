// In-card illustration for WMI-25F3A-Q10 (2025 Grade-3 Final).
//
// Reconstructed from db/seed/wmi/figures/2025-final-g3-a-q10.jpg.
//
// The stem shows a horizontal RECTANGLE of paper on the left of a dashed
// divider, and five filled lime-green shapes A-E on the right. The question:
// "Rotate the rectangle freely and fold it once — how many of A-E can result?"
// (answer A = 5 — every shape is reachable with a single straight fold).
//
// We redraw the rectangle and each option as polygons read straight from the
// scan, in the same lime-green the original uses:
//   A = square with one corner folded over (irregular pentagon)
//   B = wide shape with a V-notch bitten out of the bottom (concave hexagon)
//   C = block with a stepped/clipped corner (hexagon)
//   D = upward-pointing pentagon (house)
//   E = small square
//
// The static figure NEVER reveals which options work (all do) — that count is
// the answer, surfaced only by the animator after reveal. This component is a
// pure, deterministic, SSR-safe render with no params, no random, no effects.

import type { WmiChoice } from '../../../../types/wmi'

const INK = '#1F2937'
// The scan fills every shape with the same bright lime-green. No qupu token
// matches this hue; the reconstructed paper figures in this folder use literal
// fills by convention (see puzzles20G2Illustrations).
const LIME = '#A4C520'
const LIME_DARK = '#7A9415'

export type FoldLabel = 'A' | 'B' | 'C' | 'D' | 'E'

// Each option as a polygon in its own 0..100 local box, read from the scan.
// Co-exported so the explainer and the per-option CHOICE renderer bind to the
// same single source of truth and can't drift from the figure.
export const FOLD_SHAPES: Record<FoldLabel, { points: Array<[number, number]>; aria_id: string }> = {
  // Square with the top-left corner folded down, leaving a slanted notch.
  A: {
    points: [
      [30, 4],
      [86, 10],
      [90, 86],
      [10, 90],
      [12, 22],
    ],
    aria_id: 'persegi dengan satu sudut terlipat',
  },
  // Wide banner with a deep V-notch cut up into the bottom centre.
  B: {
    points: [
      [8, 16],
      [92, 6],
      [86, 78],
      [50, 50],
      [14, 80],
    ],
    aria_id: 'bentuk lebar dengan takik V di bawah',
  },
  // Block with a stepped / clipped corner on the lower-right (hexagon).
  C: {
    points: [
      [14, 8],
      [80, 4],
      [92, 30],
      [92, 62],
      [60, 92],
      [10, 80],
    ],
    aria_id: 'balok dengan sudut terpotong',
  },
  // Upward-pointing pentagon (house).
  D: {
    points: [
      [50, 6],
      [92, 40],
      [76, 92],
      [24, 92],
      [8, 40],
    ],
    aria_id: 'segilima mengarah ke atas',
  },
  // Small square.
  E: {
    points: [
      [12, 12],
      [88, 12],
      [88, 88],
      [12, 88],
    ],
    aria_id: 'persegi kecil',
  },
}

export const FOLD_LABELS: FoldLabel[] = ['A', 'B', 'C', 'D', 'E']

// One option's shape, drawn at (ox, oy) scaled into a `size`-wide box, with an
// optional letter label inside it. Reused by the framed figure and the CHOICE
// renderer so colours and proportions stay identical.
export function FoldGlyph({
  label,
  ox = 0,
  oy = 0,
  size = 100,
  showLabel = false,
  strokeWidth = 2,
}: {
  label: FoldLabel
  ox?: number
  oy?: number
  size?: number
  showLabel?: boolean
  strokeWidth?: number
}) {
  const shape = FOLD_SHAPES[label] ?? FOLD_SHAPES.A
  const s = size / 100
  const pts = shape.points.map(([x, y]) => `${ox + x * s},${oy + y * s}`).join(' ')
  // Label centred on the shape's bounding box midpoint.
  const cx = ox + size / 2
  const cy = oy + size / 2
  return (
    <g>
      <polygon
        points={pts}
        fill={LIME}
        stroke={LIME_DARK}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {showLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.26}
          fontStyle="italic"
          fontWeight={700}
          fill={INK}
          className="font-display"
        >
          {label}
        </text>
      )}
    </g>
  )
}

// The framed figure for the problem card: the rectangle of paper on the left,
// a dashed vertical divider, then the five labelled shapes on the right in the
// scan's two-row layout (A B C across the top, D E below). Never marks the
// answer.
export function Folding25G3Illustration() {
  const W = 420
  const H = 200

  // Right-side shape placements (ox, oy, size) in the 420x200 viewBox.
  const placements: Array<{ label: FoldLabel; ox: number; oy: number; size: number }> = [
    { label: 'A', ox: 150, oy: 14, size: 76 },
    { label: 'B', ox: 238, oy: 16, size: 92 },
    { label: 'C', ox: 338, oy: 12, size: 74 },
    { label: 'D', ox: 184, oy: 104, size: 84 },
    { label: 'E', ox: 300, oy: 116, size: 64 },
  ]

  const ariaParts = FOLD_LABELS.map((l) => `${l}: ${FOLD_SHAPES[l].aria_id}`)

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Sebuah persegi panjang kertas di sebelah kiri, lalu lima bentuk di sebelah kanan. ${ariaParts.join('. ')}. Berapa banyak bentuk yang dapat dibuat dengan satu lipatan?`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Left: the original rectangle of paper. */}
        <rect x={14} y={70} width={96} height={60} fill={LIME} stroke={LIME_DARK} strokeWidth={2} />

        {/* Dashed vertical divider, as in the scan. */}
        <line
          x1={130}
          y1={12}
          x2={130}
          y2={H - 12}
          stroke={INK}
          strokeWidth={1.6}
          strokeDasharray="4 6"
          strokeLinecap="round"
        />

        {/* Right: the five candidate shapes, each with its letter inside. */}
        {placements.map((p) => (
          <FoldGlyph key={p.label} label={p.label} ox={p.ox} oy={p.oy} size={p.size} showLabel />
        ))}
      </svg>
    </div>
  )
}

// CHOICE_RENDERERS-style component: draws ONE option's shape given its label so
// the answer chips can show the figure. The numeric `choice.text` (5/4/3/2/1)
// is used as the accessible fallback for any label we don't draw, keeping
// previews safe.
export function Folding25G3Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as FoldLabel
  const shape = FOLD_SHAPES[label]
  if (!shape) return <span>{choice?.text}</span>
  const SIZE = 52
  const PAD = 4
  const box = SIZE + PAD * 2
  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: ${shape.aria_id}.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box} style={{ display: 'block' }} aria-hidden="true">
        <FoldGlyph label={label} ox={PAD} oy={PAD} size={SIZE} strokeWidth={1.8} />
      </svg>
    </span>
  )
}

export default Folding25G3Illustration
