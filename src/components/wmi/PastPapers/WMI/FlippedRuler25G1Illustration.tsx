// WMI-25F1A-Q5 (2025 Grade 1 Final) — "Isaac wants to measure the pencil, but
// the ruler is flipped over (its numbers run the other way). Find the correct
// length of the pencil, in cm."  Answer: 5 (choice D).
//
// READING THE SCAN (2025-final-g1-a-q5.jpg): the ruler is upside-down, so the
// printed numbers read left -> right as 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 AND
// every digit glyph is mirror-flipped; the "cm" label sits (mirrored) at the
// far right. The pencil lies on top with:
//   - its eraser end (left, pink ferrule) above the mark  11
//   - its sharpened tip (right) above the mark             6
//
// SOLVE: length = distance between the two ends on the scale = |11 - 6| = 5 cm.
// The flipped orientation does not change a DIFFERENCE of readings, so the
// answer is 5 regardless of which way the numbers run.
//
// The static figure draws ONLY the flipped ruler + the pencil as scanned. It
// NEVER labels the length or marks the gap as "5" — revealing the measurement
// is the animator's job, via the co-exported FlippedRuler25G1 primitive
// (showMeasure prop drops the two end markers + the connecting span, still
// without printing the answer number).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // ruler body outline + ticks + numerals ("ink")

/** Printed numbers, left -> right, as they appear on the flipped ruler. */
export const PRINTED_MARKS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const

/** Pencil end readings on the ruler scale (see scan). */
export const ERASER_MARK = 11
export const TIP_MARK = 6
export const ANSWER = Math.abs(ERASER_MARK - TIP_MARK) // 5

// ---- layout ----------------------------------------------------------------
const PAD_X = 18
const TOP = 14 // headroom above the pencil
const PENCIL_BAND = 30 // vertical room for the pencil
const GAP = 8 // space between pencil and ruler top edge
const RULER_TOP = TOP + PENCIL_BAND + GAP
const RULER_H = 46
const CM = 52 // svg px per printed centimetre
const FIRST = PRINTED_MARKS[0]
const LAST = PRINTED_MARKS[PRINTED_MARKS.length - 1]
const SPAN = LAST - FIRST // 9 cm shown
const RULER_W = SPAN * CM
const WIDTH = PAD_X * 2 + RULER_W
const HEIGHT = RULER_TOP + RULER_H + 16

/** Printed mark value -> SVG x (numbers run 4..13 left -> right as scanned). */
const markX = (m: number) => PAD_X + (m - FIRST) * CM

const PENCIL_Y = TOP + PENCIL_BAND / 2
const ERASER_X = markX(ERASER_MARK) // left end of pencil
const TIP_X = markX(TIP_MARK) // right end of pencil

/**
 * Shared layout so the animator can overlay annotations (end markers, the gap
 * bracket, arithmetic) in the SAME coordinate system the primitive draws in —
 * without redrawing the ruler. Pure constants, no answer revealed.
 */
export const RULER_GEOM = {
  WIDTH,
  HEIGHT,
  PAD_X,
  TOP,
  PENCIL_BAND,
  RULER_TOP,
  RULER_H,
  PENCIL_Y,
  /** Printed mark value -> SVG x. */
  markX,
  ERASER_X,
  TIP_X,
} as const

export interface FlippedRuler25G1Props {
  /**
   * Animator beat: drop a marker at each pencil end and draw the span between
   * them. Still does NOT print the length number — only the two readings and
   * the connecting bracket are shown.
   */
  showMeasure?: boolean
}

/** One mirror-flipped numeral, rotated 180 deg about its own centre. */
function FlippedNumber({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <text
      x={x}
      y={y}
      transform={`rotate(180 ${x} ${y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={value >= 10 ? 16 : 18}
      fontWeight="bold"
      fill={INK}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {value}
    </text>
  )
}

/**
 * Bare flipped-ruler + pencil primitive. By itself it reveals nothing about the
 * answer; pass showMeasure to add the post-answer end markers + span.
 */
export function FlippedRuler25G1({ showMeasure = false }: FlippedRuler25G1Props = {}) {
  const tickTop = RULER_TOP // ticks hang from the top edge of the ruler
  const numY = RULER_TOP + RULER_H * 0.62

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={Math.min(300, WIDTH)} aria-hidden="true">
      {/* ---- ruler body ---- */}
      <rect
        x={PAD_X}
        y={RULER_TOP}
        width={RULER_W}
        height={RULER_H}
        rx={4}
        fill="#DBEAFE"
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* ticks: a full + half + 4 small subdivisions per centimetre */}
      {PRINTED_MARKS.map((m, i) => {
        const x = markX(m)
        const parts: JSX.Element[] = []
        // full cm tick
        parts.push(
          <line key={`f-${m}`} x1={x} y1={tickTop} x2={x} y2={tickTop + 16} stroke={INK} strokeWidth={2} />,
        )
        // millimetre ticks toward the next mark (skip after the last mark)
        if (i < PRINTED_MARKS.length - 1) {
          for (let k = 1; k < 10; k++) {
            const tx = x + (k / 10) * CM
            const len = k === 5 ? 11 : 6
            parts.push(
              <line key={`s-${m}-${k}`} x1={tx} y1={tickTop} x2={tx} y2={tickTop + len} stroke={INK} strokeWidth={1.25} />,
            )
          }
        }
        return <g key={`tk-${m}`}>{parts}</g>
      })}

      {/* mirror-flipped printed numbers (the "upside-down ruler") */}
      {PRINTED_MARKS.map((m) => (
        <FlippedNumber key={`n-${m}`} x={markX(m)} y={numY} value={m} />
      ))}

      {/* flipped "cm" label at the far right edge of the scale */}
      <text
        x={PAD_X + RULER_W - 16}
        y={numY}
        transform={`rotate(180 ${PAD_X + RULER_W - 16} ${numY})`}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fontWeight="bold"
        fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        cm
      </text>

      {/* ---- the pencil (eraser at mark 11 -> tip at mark 6) ---- */}
      <PencilGlyph leftX={TIP_X} rightX={ERASER_X} y={PENCIL_Y} />

      {/* ---- post-answer measurement overlay (no number printed) ---- */}
      {showMeasure && (
        <g>
          {[ERASER_X, TIP_X].map((ex, i) => (
            <line
              key={`end-${i}`}
              x1={ex}
              y1={TOP - 2}
              x2={ex}
              y2={RULER_TOP + 20}
              stroke="#f0853a"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          ))}
          {/* span bracket between the two ends, sitting just below the pencil */}
          <line
            x1={TIP_X}
            y1={TOP + PENCIL_BAND - 1}
            x2={ERASER_X}
            y2={TOP + PENCIL_BAND - 1}
            stroke="#f0853a"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {[TIP_X, ERASER_X].map((ex, i) => (
            <circle key={`dot-${i}`} cx={ex} cy={TOP + PENCIL_BAND - 1} r={3.5} fill="#f0853a" />
          ))}
        </g>
      )}
    </svg>
  )
}

/** A simple drawn pencil: eraser ferrule on the right, sharpened tip on left. */
function PencilGlyph({ leftX, rightX, y }: { leftX: number; rightX: number; y: number }) {
  const h = 16
  const top = y - h / 2
  const tipLen = 16 // wooden point on the LEFT (tip end, lower reading)
  const ferruleLen = 12 // metal band + eraser block on the RIGHT (eraser end)
  const bodyLeft = leftX + tipLen
  const bodyRight = rightX - ferruleLen
  return (
    <g>
      {/* sharpened wooden tip (left) */}
      <path
        d={`M ${leftX} ${y} L ${bodyLeft} ${top} L ${bodyLeft} ${top + h} Z`}
        fill="#F5C77E"
        stroke={INK}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* graphite point */}
      <path d={`M ${leftX} ${y} L ${leftX + 6} ${y - 3} L ${leftX + 6} ${y + 3} Z`} fill={INK} />
      {/* painted barrel */}
      <rect x={bodyLeft} y={top} width={bodyRight - bodyLeft} height={h} fill="#EF4444" stroke={INK} strokeWidth={1.5} />
      {/* metal ferrule */}
      <rect x={bodyRight} y={top} width={6} height={h} fill="#FBBF24" stroke={INK} strokeWidth={1.5} />
      {/* eraser block (right end) */}
      <rect
        x={bodyRight + 6}
        y={top}
        width={ferruleLen - 6}
        height={h}
        rx={2}
        fill="#F9A8D4"
        stroke={INK}
        strokeWidth={1.5}
      />
    </g>
  )
}

/** Default export: bare flipped ruler + pencil, no answer revealed. */
export default function FlippedRuler25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Penggaris terbalik dengan angka tercetak terbalik berurutan 4 sampai 13 dari kiri ke kanan, dan sebuah pensil tergeletak di atasnya: ujung penghapus berada di angka 11 dan ujung runcing di angka 6. Tentukan panjang pensil dalam cm."
    >
      <FlippedRuler25G1 />
    </div>
  )
}
