// SEAMO-20-A-Q4 — U-shaped rectilinear figure perimeter.
//
// The figure (from paper-a/2020.imgs/004.jpg):
//   A 20 × 20 outer square with a 10 × 10 rectangular slot cut from the top
//   centre. Three sides are labeled: bottom = 20 cm, right outer = 20 cm,
//   inner slot wall = 10 cm. The student must deduce unlabeled sides to find
//   the perimeter = 100 cm (answer B).
//
// Coordinates (SVG units, 1 unit = 9 px):
//   Outer: 20 wide × 20 tall. Slot: 10 wide × 10 deep, centred at top.
//   8 vertices (clockwise from bottom-left, y measured UP from bottom):
//     (0,0) → (20,0) → (20,20) → (15,20) → (15,10) → (5,10) → (5,20) → (0,20) → close
//
// Phase highlights:
//   null      – static outline + three labels (problem state)
//   'labeled' – colored outer-bottom (20), outer-right (20), slot-wall (10)
//   'deduced' – colored unlabeled sides (left, inner slot, top segments)
//   'total'   – full perimeter highlighted green
//
// Adapted from: StairPerimeterG3Illustration (same rectilinear-perimeter teach
// pattern; co-exports figure shape for re-use in explainer).

const INK = '#1F2937'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const GREEN = '#10B981'
const GREY = '#CBD5E1'

// Grid geometry
export const VIEW_W = 300
export const VIEW_H = 280
const SCALE = 9        // px per cm-unit
const OX = 50          // left margin
const OY = 20          // top margin (SVG y increases downward)
const UNITS_W = 20
const UNITS_H = 20
const SLOT_W = 10
const SLOT_D = 10      // depth (height of slot)
const SLOT_L = (UNITS_W - SLOT_W) / 2   // = 5

/** Convert grid x (cm) to SVG x. */
const px = (u: number) => OX + u * SCALE
/** Convert grid y (cm, measured UP from bottom) to SVG y. */
const py = (v: number) => OY + (UNITS_H - v) * SCALE

// 8 vertices (x, y in cm-units, y measured up from bottom-left)
export const OUTLINE: ReadonlyArray<[number, number]> = [
  [0, 0],
  [UNITS_W, 0],
  [UNITS_W, UNITS_H],
  [SLOT_L + SLOT_W, UNITS_H],
  [SLOT_L + SLOT_W, UNITS_H - SLOT_D],
  [SLOT_L, UNITS_H - SLOT_D],
  [SLOT_L, UNITS_H],
  [0, UNITS_H],
]

interface Seg { x1: number; y1: number; x2: number; y2: number; id: string }

// Build segment list by walking the outline
export const SEGS: ReadonlyArray<Seg> = OUTLINE.map((p, i) => {
  const q = OUTLINE[(i + 1) % OUTLINE.length]
  const ids = ['bottom', 'right', 'top-right', 'slot-right-wall', 'slot-bottom', 'slot-left-wall', 'top-left', 'left']
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1], id: ids[i] }
})

// Which sides are LABELED in the original figure
const LABELED_IDS = new Set(['bottom', 'right', 'slot-right-wall'])
// Which sides are to be DEDUCED (unlabeled)
const DEDUCED_IDS = new Set(['left', 'top-right', 'slot-bottom', 'slot-left-wall', 'top-left'])

export type RectPhase = 'labeled' | 'deduced' | 'total' | null

function segColor(s: Seg, phase: RectPhase): string {
  if (phase === null) return INK
  if (phase === 'labeled') return LABELED_IDS.has(s.id) ? BLUE : GREY
  if (phase === 'deduced') return DEDUCED_IDS.has(s.id) ? AMBER : GREY
  if (phase === 'total') return GREEN
  return INK
}
function segWidth(s: Seg, phase: RectPhase): number {
  if (phase === null) return 2.5
  const hot =
    (phase === 'labeled' && LABELED_IDS.has(s.id)) ||
    (phase === 'deduced' && DEDUCED_IDS.has(s.id)) ||
    phase === 'total'
  return hot ? 4.5 : 2
}

export interface RectFigureProps {
  phase?: RectPhase
}

/** Shared figure — used by both Illustration and Explainer. */
export function RectilinearUFigure({ phase = null }: RectFigureProps) {
  const pts = OUTLINE.map(([u, v]) => `${px(u)},${py(v)}`).join(' ')
  const bottomMidX = px(UNITS_W / 2)
  const bottomY    = py(0) + 20
  const rightX     = px(UNITS_W) + 22
  const rightMidY  = py(UNITS_H / 2)
  const slotWallX  = px(SLOT_L + SLOT_W) + 12
  const slotWallY  = py(UNITS_H - SLOT_D / 2)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Outline drawn as individual segments so each can be styled */}
      {SEGS.map((s, i) => (
        <line
          key={i}
          x1={px(s.x1)} y1={py(s.y1)}
          x2={px(s.x2)} y2={py(s.y2)}
          stroke={segColor(s, phase)}
          strokeWidth={segWidth(s, phase)}
          strokeLinecap="square"
        />
      ))}

      {/* ── Dimension labels (always shown) ── */}
      {/* bottom = 20 cm */}
      <text
        x={bottomMidX} y={bottomY}
        textAnchor="middle" fontSize={15} fontWeight={900}
        fill={phase === 'labeled' || phase === 'total' ? BLUE : INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >20cm</text>

      {/* right outer = 20 cm */}
      <text
        x={rightX} y={rightMidY}
        textAnchor="start" dominantBaseline="central"
        fontSize={15} fontWeight={900}
        fill={phase === 'labeled' || phase === 'total' ? BLUE : INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >20cm</text>

      {/* inner slot wall = 10 cm (right wall of slot, labeled in original) */}
      <text
        x={slotWallX} y={slotWallY}
        textAnchor="start" dominantBaseline="central"
        fontSize={15} fontWeight={900}
        fill={phase === 'labeled' || phase === 'total' ? BLUE : INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >10cm</text>

      {/* deduced sum label */}
      {phase === 'deduced' && (
        <text
          x={px(UNITS_W / 2)} y={py(UNITS_H) - 14}
          textAnchor="middle" fontSize={13} fontWeight={900}
          fill={AMBER}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >? = 50 cm</text>
      )}

      {/* total label */}
      {phase === 'total' && (
        <text
          x={px(UNITS_W / 2)} y={py(-1.5)}
          textAnchor="middle" fontSize={15} fontWeight={900}
          fill={GREEN}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >100 cm</text>
      )}
    </svg>
  )
}

/** Default export — static stem illustration for SEAMO-20-A-Q4. */
export default function Rectilinear20A4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'U-shaped rectilinear figure: outer 20 cm wide and 20 cm tall, with a 10 cm wide by 10 cm deep rectangular slot cut from the top centre. ' +
        'Labeled sides: bottom 20 cm, right 20 cm, slot inner wall 10 cm. Find the perimeter.'
      }
    >
      <RectilinearUFigure />
    </div>
  )
}
