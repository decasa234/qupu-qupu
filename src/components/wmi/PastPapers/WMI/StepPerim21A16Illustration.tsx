// SEAMO-21-A-Q16 — "Find the perimeter of the staircase-shaped figure."
//
// Source figure (2021.imgs/025.jpg): a 4-step staircase descending right, with
// "4 cm" labelled on the left wall. The question text supplies "7 cm" for the
// total width. All corners are right angles.
//
// Key insight (seed breakdown):
//   Perimeter = 2 × (height + width) = 2 × (4 + 7) = 22 cm.
//   All horizontal pieces slide up to form one full top of 7 cm;
//   all vertical pieces collapse to one left-side column of 4 cm.
//   So perimeter = 7 + 7 + 4 + 4 = 22.
//
// The 4-step staircase (grid units, y measured UP from bottom-left):
//   (0,0)→(0,4)→(1,4)→(1,3)→(3,3)→(3,2)→(5,2)→(5,1)→(7,1)→(7,0)→close
//
// Adapted from StairPerimeterG3Illustration — same segment-kind approach
// and slide/pair animation phases.

const INK = '#1F2937'
const BLUE = '#2563EB'
const GREEN = '#10B981'

/** Closed polygon points (grid units, y = 0 at bottom). */
export const SP21_POINTS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [0, 4],
  [1, 4],
  [1, 3],
  [3, 3],
  [3, 2],
  [5, 2],
  [5, 1],
  [7, 1],
  [7, 0],
]

export const SP21_HEIGHT = 4
export const SP21_WIDTH = 7
export const SP21_PERIMETER = 2 * (SP21_HEIGHT + SP21_WIDTH) // 22

export const SP21_VIEW_W = 360
export const SP21_VIEW_H = 220
const SCALE = 28
const OX = 48
const OY = 16
const px = (u: number) => OX + u * SCALE
const py = (v: number) => OY + (SP21_HEIGHT - v) * SCALE

type SegKind = 'right' | 'bottom' | 'up' | 'down'
interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
  kind: SegKind
}

export const SP21_SEGS: ReadonlyArray<Seg> = SP21_POINTS.map((p, i) => {
  const q = SP21_POINTS[(i + 1) % SP21_POINTS.length]
  const kind: SegKind =
    q[0] > p[0] ? 'right' : q[0] < p[0] ? 'bottom' : q[1] > p[1] ? 'up' : 'down'
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1], kind }
})

export type StepPerimPhase = 'flat' | 'pair' | null

export interface StepPerimFigureProps {
  /** 'flat' highlights the horizontals and slides ghost copies to the top;
   *  'pair' highlights all verticals in green (left wall up 4 + steps down 4);
   *  null = plain outline. */
  phase?: StepPerimPhase
}

export function StepPerim21A16Figure({ phase = null }: StepPerimFigureProps) {
  const GHOST_Y = py(SP21_HEIGHT) - 18 // assembly line above the figure

  const hotSeg = (s: Seg): boolean => {
    if (phase === 'flat') return s.kind === 'right' || s.kind === 'bottom'
    if (phase === 'pair') return s.kind === 'up' || s.kind === 'down'
    return false
  }

  const colorSeg = (s: Seg) => {
    if (phase === null) return INK
    if (hotSeg(s)) return phase === 'flat' ? BLUE : GREEN
    return '#CBD5E1'
  }
  const widthSeg = (s: Seg) => (hotSeg(s) ? 4 : 2.5)

  const tops = SP21_SEGS.filter((s) => s.kind === 'right')

  return (
    <svg
      viewBox={`0 0 ${SP21_VIEW_W} ${SP21_VIEW_H}`}
      width="100%"
      style={{ maxWidth: SP21_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ghost slide: top pieces slide straight up and tile 0..7 */}
      {phase === 'flat' && (
        <g>
          {tops.map((s, i) => (
            <g key={`g-${i}`}>
              <line
                x1={px(s.x1)}
                y1={GHOST_Y}
                x2={px(s.x2)}
                y2={GHOST_Y}
                stroke={i % 2 === 0 ? BLUE : '#93C5FD'}
                strokeWidth={6}
                strokeLinecap="butt"
              />
              <line
                x1={px((s.x1 + s.x2) / 2)}
                y1={py(s.y1)}
                x2={px((s.x1 + s.x2) / 2)}
                y2={GHOST_Y + 4}
                stroke="#93C5FD"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            </g>
          ))}
          {/* total label */}
          <text
            x={px(SP21_WIDTH / 2)}
            y={GHOST_Y - 9}
            textAnchor="middle"
            fontSize={15}
            fontWeight={900}
            fill={BLUE}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {SP21_WIDTH}
          </text>
        </g>
      )}

      {/* main outline */}
      {SP21_SEGS.map((s, i) => (
        <line
          key={i}
          x1={px(s.x1)}
          y1={py(s.y1)}
          x2={px(s.x2)}
          y2={py(s.y2)}
          stroke={colorSeg(s)}
          strokeWidth={widthSeg(s)}
          strokeLinecap="square"
        />
      ))}

      {/* close the bottom-right back to origin */}
      <line
        x1={px(7)}
        y1={py(0)}
        x2={px(0)}
        y2={py(0)}
        stroke={phase === 'flat' ? BLUE : phase === null ? INK : '#CBD5E1'}
        strokeWidth={phase === 'flat' ? 4 : 2.5}
        strokeLinecap="square"
      />

      {/* dimension labels */}
      <text
        x={px(0) - 10}
        y={py(SP21_HEIGHT / 2)}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={900}
        fill={phase === 'pair' ? GREEN : INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        4 cm
      </text>
      <text
        x={px(SP21_WIDTH / 2)}
        y={py(0) + 22}
        textAnchor="middle"
        fontSize={16}
        fontWeight={900}
        fill={phase === 'flat' ? BLUE : INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        7 cm
      </text>
    </svg>
  )
}

export default function StepPerim21A16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A staircase-shaped figure, 4 cm tall on the left and 7 cm wide at the bottom. Find its perimeter.`}
    >
      <StepPerim21A16Figure />
    </div>
  )
}
