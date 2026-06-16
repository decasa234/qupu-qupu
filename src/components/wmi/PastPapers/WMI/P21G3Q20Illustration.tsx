// Pinwheel-square figure for WMI-21P3A-Q20 (2021 WMI Semifinal Grade 3, Paper A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g3-a-q20.jpg: a large square
// (side 22 cm) is tiled by 4 identical rectangles arranged in a "pinwheel" so a
// small white square is left in the middle. The problem gives:
//   big square side  = 22 cm
//   centre hole side =  6 cm  (a square whose side is 6 cm)
// and asks for the WIDTH of each rectangle.
//
// Pinwheel relations (length L, width w of each rectangle):
//   L + w = 22   (one big side = a rectangle's long edge + the next one's short edge)
//   L - w =  6   (the long edge overshoots the short edge by the hole's side)
// => L = 14, w = 8.  Answer A (8).
//
// The STATIC figure shows ONLY the problem: the outer 22 label, the inner square
// (unlabelled hole), the four blank rectangles. It never shows L, w or the answer.

export const BIG_SIDE = 22
export const HOLE_SIDE = 6
export const RECT_LONG = (BIG_SIDE + HOLE_SIDE) / 2 // 14
export const RECT_WIDE = (BIG_SIDE - HOLE_SIDE) / 2 // 8  (the answer)

// qupu palette echoes (the scan is a warm yellow/amber tiling).
const AMBER = '#F2B705'
const AMBER_EDGE = '#B8860B'
const HOLE = '#FFFFFF'
const INK = '#1F2937'

export interface PinwheelSquareProps {
  /** Outline + light-tint the centre hole so the "side 6" square reads. */
  markHole?: boolean
  /** Highlight one rectangle's WIDTH (the queried dimension) with a brace + w. */
  showWidth?: boolean
  /** Highlight one rectangle's LENGTH with a brace + L. */
  showLength?: boolean
  /** Reveal the numeric answer (w = 8) — explainer only, never the static figure. */
  showAnswer?: boolean
}

// One geometry, shared by figure + explainer. Drawn on a 0..22 unit board that we
// scale up; an outer margin gives the dimension labels breathing room (no clip).
const UNIT = 12 // px per cm
const PAD = 34 // outer margin for labels
const BOARD = BIG_SIDE * UNIT // 264
export const PIN_VIEW = BOARD + PAD * 2 // 332 (square viewBox)

// Pinwheel placement of the 4 congruent rectangles (in cm, board-local x,y with
// y DOWN). Long side L=14, short side w=8, hole 6×6 centred.
//   top    : horizontal, sits along the top, left-justified  -> w tall, L wide
//   right  : vertical,    sits along the right, top-justified -> L tall, w wide
//   bottom : horizontal, sits along the bottom, right-justified
//   left   : vertical,    sits along the left, bottom-justified
const L = RECT_LONG
const w = RECT_WIDE
const RECTS: Array<{ key: string; x: number; y: number; rw: number; rh: number }> = [
  { key: 'top', x: 0, y: 0, rw: L, rh: w },
  { key: 'right', x: BIG_SIDE - w, y: 0, rw: w, rh: L },
  { key: 'bottom', x: BIG_SIDE - L, y: BIG_SIDE - w, rw: L, rh: w },
  { key: 'left', x: 0, y: BIG_SIDE - L, rw: w, rh: L },
]

// Centre hole (left after the pinwheel): a w..L band on both axes -> 6×6 square.
const HOLE_X = w // 8
const HOLE_Y = w // 8

function px(cm: number) {
  return PAD + cm * UNIT
}

export function PinwheelSquare({
  markHole = false,
  showWidth = false,
  showLength = false,
  showAnswer = false,
}: PinwheelSquareProps) {
  return (
    <svg
      viewBox={`0 0 ${PIN_VIEW} ${PIN_VIEW}`}
      width="100%"
      style={{ maxWidth: 332, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* the four pinwheel rectangles */}
      {RECTS.map((r) => (
        <rect
          key={r.key}
          x={px(r.x)}
          y={px(r.y)}
          width={r.rw * UNIT}
          height={r.rh * UNIT}
          fill={AMBER}
          stroke={AMBER_EDGE}
          strokeWidth={2}
        />
      ))}

      {/* centre hole */}
      <rect
        x={px(HOLE_X)}
        y={px(HOLE_Y)}
        width={HOLE_SIDE * UNIT}
        height={HOLE_SIDE * UNIT}
        fill={HOLE}
        stroke={markHole ? '#2f6df0' : AMBER_EDGE}
        strokeWidth={markHole ? 3 : 2}
      />
      {markHole && (
        <text
          x={px(HOLE_X + HOLE_SIDE / 2)}
          y={px(HOLE_Y + HOLE_SIDE / 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={900}
          fill="#2f6df0"
        >
          6
        </text>
      )}

      {/* outer square outline (drawn last so corners stay crisp) */}
      <rect
        x={px(0)}
        y={px(0)}
        width={BOARD}
        height={BOARD}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* big-side label "22 cm" along the bottom, in the margin */}
      <g>
        <line x1={px(0)} y1={PIN_VIEW - 12} x2={px(BIG_SIDE)} y2={PIN_VIEW - 12} stroke={INK} strokeWidth={1.5} />
        <line x1={px(0)} y1={PIN_VIEW - 17} x2={px(0)} y2={PIN_VIEW - 7} stroke={INK} strokeWidth={1.5} />
        <line x1={px(BIG_SIDE)} y1={PIN_VIEW - 17} x2={px(BIG_SIDE)} y2={PIN_VIEW - 7} stroke={INK} strokeWidth={1.5} />
        <text x={px(BIG_SIDE / 2)} y={PIN_VIEW - 19} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
          22 cm
        </text>
      </g>

      {/* explainer-only: brace the WIDTH of the top rectangle (its short side) */}
      {showWidth && (
        <g>
          <line x1={px(L) + 8} y1={px(0)} x2={px(L) + 8} y2={px(w)} stroke="#10B981" strokeWidth={3} />
          <line x1={px(L) + 4} y1={px(0)} x2={px(L) + 12} y2={px(0)} stroke="#10B981" strokeWidth={3} />
          <line x1={px(L) + 4} y1={px(w)} x2={px(L) + 12} y2={px(w)} stroke="#10B981" strokeWidth={3} />
          <text x={px(L) + 26} y={px(w / 2)} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#065F46">
            {showAnswer ? '8' : 'w'}
          </text>
        </g>
      )}

      {/* explainer-only: brace the LENGTH of the top rectangle (its long side) */}
      {showLength && (
        <g>
          <line x1={px(0)} y1={px(0) - 10} x2={px(L)} y2={px(0) - 10} stroke="#f0853a" strokeWidth={3} />
          <line x1={px(0)} y1={px(0) - 14} x2={px(0)} y2={px(0) - 6} stroke="#f0853a" strokeWidth={3} />
          <line x1={px(L)} y1={px(0) - 14} x2={px(L)} y2={px(0) - 6} stroke="#f0853a" strokeWidth={3} />
          <text x={px(L / 2)} y={px(0) - 20} textAnchor="middle" fontSize={15} fontWeight={900} fill="#9A3412">
            {showAnswer ? '14' : 'L'}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P21G3Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A large square of side 22 cm tiled by four identical rectangles in a pinwheel, leaving a small square hole in the centre."
    >
      <PinwheelSquare />
    </div>
  )
}
