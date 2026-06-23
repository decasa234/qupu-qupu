// SEAMO-18-B-Q2 — descending 3-step staircase perimeter.
//
// Reconstructed from docs/reference/ocr-res/seamo/contest/paper-b/2018.imgs/002.jpg:
//   Top: 5 cm (right), step down: 2 cm, second horizontal: 5 cm,
//   step down: 2 cm, third horizontal: 5 cm, right wall: 4 cm,
//   bottom: unlabeled 15 cm, left wall: unlabeled 8 cm.
//   Perimeter = (5+2+5+2+5+4) + (15+8) = 23 + 23 = 46 cm.
//
// Shape outline (grid units, y measured UP from bottom-left):
//   (0,8)→(5,8)→(5,6)→(10,6)→(10,4)→(15,4)→(15,0)→(0,0)→close
//
// Adapted from StairPerimeterG3Illustration (same technique, simpler shape).

export const SP2_PERIMETER = 46

// [x,y] corners in grid units (y measured UP from bottom-left)
export const SP2_POINTS: ReadonlyArray<[number, number]> = [
  [0, 0],   // bottom-left
  [0, 8],   // top-left
  [5, 8],   // top of step 1 (labeled 5)
  [5, 6],   // after drop 2
  [10, 6],  // after second 5
  [10, 4],  // after drop 2
  [15, 4],  // after third 5
  [15, 0],  // bottom-right (right wall 4)
]

const INK = '#1F2937'
const BLUE = '#2563EB'
const GREEN = '#10B981'

export const SP2_VIEW_W = 340
export const SP2_VIEW_H = 240
const SCALE = 17
const OX = 36
const OY = 16
const px = (u: number) => OX + u * SCALE
const py = (v: number) => OY + (8 - v) * SCALE

type SegKind = 'right' | 'bottom' | 'up' | 'down'
interface Seg { x1: number; y1: number; x2: number; y2: number; kind: SegKind; labeled: boolean; labelValue: number | null }

// Walking the outline: label the 6 given sides; unlabeled are bottom (15) and left (8).
// Labeled segments: up-left (y: 0→8 at x=0 — this is the LEFT wall, unlabeled),
// right-top (y=8, x: 0→5, labeled 5), down-step1 (x=5, y:8→6, labeled 2),
// right-mid1 (y=6, x:5→10, labeled 5), down-step2 (x=10, y:6→4, labeled 2),
// right-mid2 (y=4, x:10→15, labeled 5), down-right (x=15, y:4→0, labeled 4),
// bottom (y=0, x:15→0, unlabeled 15).
const LABELED_SEGS = new Map<string, number>([
  ['0,8,5,8', 5],    // top horizontal
  ['5,8,5,6', 2],    // first step down
  ['5,6,10,6', 5],   // second horizontal
  ['10,6,10,4', 2],  // second step down
  ['10,4,15,4', 5],  // third horizontal
  ['15,4,15,0', 4],  // right wall
])

export const SP2_SEGS: ReadonlyArray<Seg> = SP2_POINTS.map((p, i) => {
  const q = SP2_POINTS[(i + 1) % SP2_POINTS.length]
  const kind: SegKind = q[0] > p[0] ? 'right' : q[0] < p[0] ? 'bottom' : q[1] > p[1] ? 'up' : 'down'
  const key = `${p[0]},${p[1]},${q[0]},${q[1]}`
  const labelValue = LABELED_SEGS.get(key) ?? null
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1], kind, labeled: labelValue !== null, labelValue }
})

export type Stair2Phase = 'flat' | 'standing' | null

export interface StairPerim18B2FigureProps {
  phase?: Stair2Phase
}

function labelOffset(s: Seg): { dx: number; dy: number; anchor: string } {
  if (s.kind === 'right')  return { dx: 0, dy: -10, anchor: 'middle' }
  if (s.kind === 'bottom') return { dx: 0, dy: 14, anchor: 'middle' }
  if (s.kind === 'up')     return { dx: -14, dy: 0, anchor: 'end' }
  return { dx: 12, dy: 0, anchor: 'start' }
}

export function StairPerim18B2Figure({ phase = null }: StairPerim18B2FigureProps) {
  const hotSeg = (s: Seg) => {
    if (phase === 'flat') return s.kind === 'right' || s.kind === 'bottom'
    if (phase === 'standing') return s.kind === 'up' || s.kind === 'down'
    return false
  }
  const colorSeg = (s: Seg) => {
    if (phase === null) return INK
    return hotSeg(s) ? (phase === 'flat' ? BLUE : GREEN) : '#CBD5E1'
  }
  const widthSeg = (s: Seg) => (hotSeg(s) ? 4.5 : 2.5)

  // Ghost line: when phase === 'flat', slide all horizontal pieces up to show they total 15
  const GHOST_Y = py(8) - 18
  const hSegs = SP2_SEGS.filter((s) => s.kind === 'right' || s.kind === 'bottom')

  return (
    <svg
      viewBox={`0 0 ${SP2_VIEW_W} ${SP2_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Ghost slide showing horizontals tile to 15 */}
      {phase === 'flat' && (
        <g>
          {hSegs.filter((s) => s.kind === 'right').map((s, i) => (
            <g key={`g-${i}`}>
              <line
                x1={px(s.x1)} y1={GHOST_Y}
                x2={px(s.x2)} y2={GHOST_Y}
                stroke={BLUE} strokeWidth={5} strokeLinecap="butt"
              />
              <line
                x1={px((s.x1 + s.x2) / 2)} y1={py(s.y1)}
                x2={px((s.x1 + s.x2) / 2)} y2={GHOST_Y + 4}
                stroke="#93C5FD" strokeWidth={1.5} strokeDasharray="3 3"
              />
            </g>
          ))}
          <text x={px(7.5)} y={GHOST_Y - 8} textAnchor="middle" fontSize={13} fontWeight={900} fill={BLUE} className="font-display">
            15
          </text>
        </g>
      )}

      {/* Main outline */}
      {SP2_SEGS.map((s, i) => (
        <line
          key={i}
          x1={px(s.x1)} y1={py(s.y1)}
          x2={px(s.x2)} y2={py(s.y2)}
          stroke={colorSeg(s)} strokeWidth={widthSeg(s)} strokeLinecap="square"
        />
      ))}

      {/* Side labels */}
      {SP2_SEGS.map((s, i) => {
        const mid = { x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2 }
        const off = labelOffset(s)
        const text = s.labeled ? `${s.labelValue} cm` : (s.kind === 'bottom' ? '?' : s.kind === 'up' ? '?' : null)
        if (text === null) return null
        const fill = s.labeled ? (phase === null ? INK : hotSeg(s) ? (phase === 'flat' ? BLUE : GREEN) : '#94A3B8') : '#94A3B8'
        return (
          <text
            key={`lbl-${i}`}
            x={px(mid.x) + off.dx}
            y={py(mid.y) + off.dy}
            textAnchor={off.anchor as 'start' | 'middle' | 'end'}
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill={fill}
            className="font-display"
          >
            {text}
          </text>
        )
      })}

      {/* Unlabeled sides annotation */}
      {phase === 'standing' && (
        <>
          <text x={px(0) - 14} y={py(4)} textAnchor="end" dominantBaseline="central" fontSize={13} fontWeight={900} fill={GREEN} className="font-display">8</text>
          <text x={px(7.5)} y={py(0) + 16} textAnchor="middle" fontSize={13} fontWeight={900} fill="#94A3B8" className="font-display">15</text>
        </>
      )}
    </svg>
  )
}

export default function StairPerim18B2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A descending 3-step staircase with labeled sides: 5 cm (top), 2 cm, 5 cm, 2 cm, 5 cm (horizontal steps), 4 cm (right wall). Perimeter = ${SP2_PERIMETER} cm.`}
    >
      <StairPerim18B2Figure />
    </div>
  )
}
