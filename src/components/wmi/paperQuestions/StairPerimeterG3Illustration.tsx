// Rectilinear "staircase with a deep slot" for WMI-19F3A-Q14.
// Reconstructed from db/seed/wmi/figures/2019-final-g3-a-q14.jpg: height 12,
// width 20, with a slot whose labelled wall is 10 deep. All corners are right
// angles. Perimeter = 2×(20+12) + 2×10 = 84.
//
// Outline (grid units, y measured UP from the bottom-left corner):
//   (0,0)→(0,12)→(3,12)→(3,8)→(6,8)→(6,5)→(9,5)→(9,2)→(13,2)→(13,12)
//   →(16,12)→(16,4)→(20,4)→(20,0)→close
// Horizontal runs total 2×20 = 40; verticals total 2×12 + 2×10 = 44.

export const SP_PERIMETER = 84

export const SP_POINTS: ReadonlyArray<[number, number]> = [
  [0, 0], [0, 12], [3, 12], [3, 8], [6, 8], [6, 5], [9, 5], [9, 2],
  [13, 2], [13, 12], [16, 12], [16, 4], [20, 4], [20, 0],
]

const INK = '#1F2937'
const BLUE = '#2563EB'
const GREEN = '#10B981'
const AMBER = '#D97706'

export const SP_VIEW_W = 392
export const SP_VIEW_H = 252
const SCALE = 15.5
const OX = 42
const OY = 18
const px = (u: number) => OX + u * SCALE
const py = (v: number) => OY + (12 - v) * SCALE

// Walking the outline clockwise from (0,0): 'right' = the top pieces (they
// tile the full width 0..20 with no overlap!), 'bottom' = the floor, 'up' = the
// only two climbs (the left wall 12 and the slot wall 10), 'down' = the steps
// back down (which must also total 12 + 10).
type SegKind = 'right' | 'bottom' | 'up' | 'down'
interface Seg { x1: number; y1: number; x2: number; y2: number; kind: SegKind }

export const SP_SEGS: ReadonlyArray<Seg> = SP_POINTS.map((p, i) => {
  const q = SP_POINTS[(i + 1) % SP_POINTS.length]
  const kind: SegKind = q[0] > p[0] ? 'right' : q[0] < p[0] ? 'bottom' : q[1] > p[1] ? 'up' : 'down'
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1], kind }
})

export type StairPhase = 'flat' | 'pair12' | 'pair10' | null

// The standing edges pair up: the LEFT wall's climb of 12 is matched by the
// rightmost descents 8 + 4 = 12; the SLOT wall's climb of 10 is matched by the
// stair descents 4 + 3 + 3 = 10.
const PAIR12_X = new Set([0, 16, 20])
const PAIR10_X = new Set([13, 3, 6, 9])

export interface StairPerimeterFigureProps {
  /** 'flat' lights the horizontals + slides ghost copies onto one top line;
   *  'pair12' lights the left wall and its matching right descents (12 + 12);
   *  'pair10' lights the slot wall and its matching stair descents (10 + 10). */
  phase?: StairPhase
}

export function StairPerimeterFigure({ phase = null }: StairPerimeterFigureProps) {
  const hotSeg = (s: Seg) =>
    phase === 'flat'
      ? s.kind === 'right' || s.kind === 'bottom'
      : phase === 'pair12'
        ? (s.kind === 'up' || s.kind === 'down') && PAIR12_X.has(s.x1)
        : phase === 'pair10'
          ? (s.kind === 'up' || s.kind === 'down') && PAIR10_X.has(s.x1)
          : false
  const colorSeg = (s: Seg) =>
    phase === null ? INK : hotSeg(s) ? (phase === 'flat' ? BLUE : phase === 'pair12' ? GREEN : AMBER) : '#CBD5E1'
  const widthSeg = (s: Seg) => (hotSeg(s) ? 4.5 : 2.5)
  const GHOST_Y = py(12) - 16 // the assembly line the top pieces slide up to
  const tops = SP_SEGS.filter((s) => s.kind === 'right')
  return (
    <svg viewBox={`0 0 ${SP_VIEW_W} ${SP_VIEW_H}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* ghost slide: copies of every top piece moved straight up — they tile 0..20 */}
      {phase === 'flat' && (
        <g>
          {tops.map((s, i) => (
            <g key={`g-${i}`}>
              <line x1={px(s.x1)} y1={GHOST_Y} x2={px(s.x2)} y2={GHOST_Y} stroke={i % 2 === 0 ? BLUE : '#93C5FD'} strokeWidth={6} strokeLinecap="butt" />
              <line x1={px((s.x1 + s.x2) / 2)} y1={py(s.y1)} x2={px((s.x1 + s.x2) / 2)} y2={GHOST_Y + 4} stroke="#93C5FD" strokeWidth={1.5} strokeDasharray="3 3" />
            </g>
          ))}
          <text x={px(10)} y={GHOST_Y - 8} textAnchor="middle" fontSize={14} fontWeight={900} fill={BLUE} className="font-display">20</text>
        </g>
      )}

      {SP_SEGS.map((s, i) => (
        <line key={i} x1={px(s.x1)} y1={py(s.y1)} x2={px(s.x2)} y2={py(s.y2)} stroke={colorSeg(s)} strokeWidth={widthSeg(s)} strokeLinecap="square" />
      ))}

      {/* per-segment lengths for the highlighted vertical pair */}
      {(phase === 'pair12' || phase === 'pair10') &&
        SP_SEGS.filter((s) => hotSeg(s) && s.kind === 'down').map((s, i) => (
          <text
            key={`len-${i}`}
            x={px(s.x1) + 8}
            y={py((s.y1 + s.y2) / 2)}
            dominantBaseline="central"
            fontSize={14}
            fontWeight={900}
            fill={phase === 'pair12' ? GREEN : AMBER}
            className="font-display"
          >
            {Math.abs(s.y1 - s.y2)}
          </text>
        ))}

      {/* labels: 12 left, 20 bottom, 10 at the slot wall */}
      <text x={px(0) - 12} y={py(6)} textAnchor="end" dominantBaseline="central" fontSize={17} fontWeight={900} fill={phase === 'pair12' ? GREEN : INK} className="font-display">12</text>
      <text x={px(10)} y={py(0) + 20} textAnchor="middle" fontSize={17} fontWeight={900} fill={phase === 'flat' ? BLUE : INK} className="font-display">20</text>
      <text x={px(13) - 10} y={py(7)} textAnchor="end" dominantBaseline="central" fontSize={17} fontWeight={900} fill={phase === 'pair10' ? AMBER : INK} className="font-display">10</text>
    </svg>
  )
}

export default function StairPerimeterG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A staircase-shaped figure with right angles only: 12 tall on the left, 20 wide along the bottom, and a slot 10 deep. Its perimeter is ${SP_PERIMETER}.`}
    >
      <StairPerimeterFigure />
    </div>
  )
}
