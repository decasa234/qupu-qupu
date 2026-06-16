// WMI-25P1A-Q11 (2025 Grade 1 Semifinal, Paper A) — "How many KINDS of shapes
// are there in the picture?"  Answer: 6 (choice C).
//
// Redrawn from db/seed/wmi/figures/2025-semifinal-g1-a-q11.jpg: a jumble of
// overlapping outlined shapes. The DISTINCT kinds present are:
//   1) rectangle   2) square   3) triangle
//   4) ellipse(oval) 5) circle  6) hexagon
// Each kind appears one or more times; the answer counts kinds, so 6.
//
// The static figure draws ALL shapes in the same neutral outline (no kind is
// singled out — that would leak the grouping). The explainer re-tints one kind
// per beat via the `highlightKind` prop.
//
// SSR-safe + deterministic: no window/document at module top, no Math.random,
// no Date.now.

export type ShapeKind = 'rectangle' | 'square' | 'triangle' | 'ellipse' | 'circle' | 'hexagon'

export const Q11_KINDS: ShapeKind[] = ['rectangle', 'square', 'triangle', 'ellipse', 'circle', 'hexagon']
export const Q11_NUM_KINDS = Q11_KINDS.length // 6

export const Q11_VIEW_W = 440
export const Q11_VIEW_H = 320

const OUTLINE = '#2E3192' // indigo outline, matching the original line art
const HILITE = '#F59E0B' // amber when a kind is being tallied
const HILITE_FILL = 'rgba(245, 158, 11, 0.16)'

interface ShapeDef {
  id: string
  kind: ShapeKind
  /** SVG element renderer given stroke + fill. */
  render: (stroke: string, fill: string) => JSX.Element
}

// Hand-placed to echo the overlapping cluster of the original figure, with
// enough viewBox headroom that nothing clips.
const SHAPES: ShapeDef[] = [
  // ----- rectangles (wide, non-square) -----
  {
    id: 'rect-left',
    kind: 'rectangle',
    render: (stroke, fill) => <rect x={14} y={92} width={92} height={48} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'rect-mid',
    kind: 'rectangle',
    render: (stroke, fill) => <rect x={262} y={64} width={104} height={56} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  // ----- squares -----
  {
    id: 'sq-top',
    kind: 'square',
    render: (stroke, fill) => <rect x={132} y={18} width={108} height={108} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'sq-low',
    kind: 'square',
    render: (stroke, fill) => <rect x={60} y={156} width={104} height={104} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'sq-small',
    kind: 'square',
    render: (stroke, fill) => <rect x={258} y={176} width={84} height={84} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  // ----- triangles -----
  {
    id: 'tri-top',
    kind: 'triangle',
    render: (stroke, fill) => <polygon points="124,40 84,128 164,128" fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'tri-mid',
    kind: 'triangle',
    render: (stroke, fill) => <polygon points="180,170 130,266 230,266" fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'tri-big',
    kind: 'triangle',
    render: (stroke, fill) => <polygon points="288,178 206,304 370,304" fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  // ----- ellipses (ovals, clearly wider than tall) -----
  {
    id: 'ell-mid',
    kind: 'ellipse',
    render: (stroke, fill) => <ellipse cx={242} cy={140} rx={56} ry={30} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'ell-right',
    kind: 'ellipse',
    render: (stroke, fill) => <ellipse cx={362} cy={158} rx={54} ry={28} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'ell-low',
    kind: 'ellipse',
    render: (stroke, fill) => <ellipse cx={132} cy={272} rx={56} ry={26} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'ell-right-low',
    kind: 'ellipse',
    render: (stroke, fill) => <ellipse cx={360} cy={238} rx={50} ry={26} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  // ----- circle (true round) -----
  {
    id: 'circ-low',
    kind: 'circle',
    render: (stroke, fill) => <circle cx={74} cy={224} r={50} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  {
    id: 'circ-mid',
    kind: 'circle',
    render: (stroke, fill) => <circle cx={286} cy={254} r={34} fill={fill} stroke={stroke} strokeWidth={3} />,
  },
  // ----- hexagon -----
  {
    id: 'hex',
    kind: 'hexagon',
    render: (stroke, fill) => (
      <polygon points="338,116 372,140 372,182 338,206 304,182 304,140" fill={fill} stroke={stroke} strokeWidth={3} />
    ),
  },
]

export interface Q11ClusterProps {
  /** When set, shapes of this kind are tinted/highlighted (used by the explainer). */
  highlightKind?: ShapeKind | null
  /** When true, kinds already tallied stay dimmed-confirmed (greyed) — used so each
   *  beat shows progress. Kinds in this set render with a confirmed tint. */
  confirmedKinds?: ShapeKind[]
}

export function Q11Cluster({ highlightKind = null, confirmedKinds = [] }: Q11ClusterProps) {
  return (
    <svg
      viewBox={`0 0 ${Q11_VIEW_W} ${Q11_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q11_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SHAPES.map((s) => {
        const isHi = highlightKind === s.kind
        const isConfirmed = confirmedKinds.includes(s.kind)
        const stroke = isHi ? HILITE : isConfirmed ? '#9CA3AF' : OUTLINE
        const fill = isHi ? HILITE_FILL : 'none'
        return <g key={s.id}>{s.render(stroke, fill)}</g>
      })}
    </svg>
  )
}

export default function P25G1Q11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A jumble of overlapping outlined shapes: rectangles, squares, triangles, ovals, circles and a hexagon."
    >
      <Q11Cluster />
    </div>
  )
}
