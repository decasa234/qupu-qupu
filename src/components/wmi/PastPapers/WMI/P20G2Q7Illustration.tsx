// WMI-20P2A-Q7 (2020 Grade 2 Semifinal) — "As in the figure, how long is the
// pencil in cm?"  Answer: 6 (choice C).
//
// READING THE SCAN (2020-semifinal-g2-a-q7.jpg): a normal ruler labelled in cm,
// the printed numbers reading left -> right 8, 9, 10, 11, 12, 13, 14, 15 with
// the "cm" label at the far left. A pencil lies above the ruler; two dashed
// vertical guide lines drop from the pencil's two ends down to the scale:
//   - the eraser end (left) sits over the mark   8
//   - the sharpened tip (right) sits over the mark 14
//
// SOLVE: length = distance between the two ends on the scale = 14 - 8 = 6 cm.
//
// The static figure draws ONLY the ruler + pencil + the two dashed end guides as
// scanned. It NEVER labels the length or marks the gap as "6" — revealing the
// measurement is the animator's job, via the co-exported PencilRuler20 primitive
// (showMeasure prop drops the two end markers + the connecting span, still
// without printing the answer number).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // ruler body outline + ticks + numerals ("ink")

/** Printed numbers, left -> right, as they appear on the ruler. */
export const PRINTED_MARKS = [8, 9, 10, 11, 12, 13, 14, 15] as const

/** Pencil end readings on the ruler scale (see scan). */
export const ERASER_MARK = 8 // left end (eraser)
export const TIP_MARK = 14 // right end (sharpened tip)
export const ANSWER = Math.abs(TIP_MARK - ERASER_MARK) // 6

// ---- layout ----------------------------------------------------------------
const PAD_X = 22
const TOP = 14 // headroom above the dashed guides
const GUIDE_BAND = 18 // dashed-guide headroom above the pencil
const PENCIL_BAND = 28 // vertical room for the pencil
const GAP = 10 // space between pencil and ruler top edge
const PENCIL_TOP = TOP + GUIDE_BAND
const RULER_TOP = PENCIL_TOP + PENCIL_BAND + GAP
const RULER_H = 46
const CM = 50 // svg px per printed centimetre
const FIRST = PRINTED_MARKS[0]
const LAST = PRINTED_MARKS[PRINTED_MARKS.length - 1]
const SPAN = LAST - FIRST // 7 cm shown
const RULER_W = SPAN * CM
const WIDTH = PAD_X * 2 + RULER_W
const HEIGHT = RULER_TOP + RULER_H + 16

/** Printed mark value -> SVG x (numbers run 8..15 left -> right). */
const markX = (m: number) => PAD_X + (m - FIRST) * CM

const PENCIL_Y = PENCIL_TOP + PENCIL_BAND / 2
const ERASER_X = markX(ERASER_MARK) // left end of pencil
const TIP_X = markX(TIP_MARK) // right end of pencil

/**
 * Shared layout so the animator can overlay annotations (end markers, the span
 * bracket, arithmetic) in the SAME coordinate system the primitive draws in —
 * without redrawing the ruler. Pure constants, no answer revealed.
 */
export const PENCIL_GEOM = {
  WIDTH,
  HEIGHT,
  PAD_X,
  TOP,
  PENCIL_TOP,
  PENCIL_BAND,
  RULER_TOP,
  RULER_H,
  PENCIL_Y,
  /** Printed mark value -> SVG x. */
  markX,
  ERASER_X,
  TIP_X,
} as const

export interface PencilRuler20Props {
  /**
   * Animator beat: drop a marker at each pencil end and draw the span between
   * them. Still does NOT print the length number — only the two readings and the
   * connecting bracket are shown.
   */
  showMeasure?: boolean
}

/**
 * Bare ruler + pencil primitive (with the scanned dashed end guides). By itself
 * it reveals nothing about the answer; pass showMeasure to add the post-answer
 * end markers + span.
 */
export function PencilRuler20({ showMeasure = false }: PencilRuler20Props = {}) {
  const tickTop = RULER_TOP // ticks hang from the top edge of the ruler
  const numY = RULER_TOP + RULER_H * 0.66

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={Math.min(320, WIDTH)} aria-hidden="true">
      {/* ---- dashed guide lines from each pencil end down to the scale ---- */}
      {[ERASER_X, TIP_X].map((gx, i) => (
        <line
          key={`g-${i}`}
          x1={gx}
          y1={TOP}
          x2={gx}
          y2={RULER_TOP - 2}
          stroke={INK}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      ))}

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

      {/* ticks: a full + half + small subdivisions per centimetre */}
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

      {/* printed numbers */}
      {PRINTED_MARKS.map((m) => (
        <text
          key={`n-${m}`}
          x={markX(m)}
          y={numY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={m >= 10 ? 14 : 16}
          fontWeight="bold"
          fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {m}
        </text>
      ))}

      {/* "cm" label at the far left edge of the scale */}
      <text
        x={PAD_X - 6}
        y={numY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontStyle="italic"
        fontWeight="bold"
        fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        cm
      </text>

      {/* ---- the pencil (eraser at mark 8 -> tip at mark 14) ---- */}
      <PencilGlyph leftX={ERASER_X} rightX={TIP_X} y={PENCIL_Y} />

      {/* ---- post-answer measurement overlay (no number printed) ---- */}
      {showMeasure && (
        <g>
          {[ERASER_X, TIP_X].map((ex, i) => (
            <circle key={`dot-${i}`} cx={ex} cy={PENCIL_TOP + PENCIL_BAND + 4} r={3.5} fill="#f0853a" />
          ))}
          {/* span bracket between the two ends, just below the pencil */}
          <line
            x1={ERASER_X}
            y1={PENCIL_TOP + PENCIL_BAND + 4}
            x2={TIP_X}
            y2={PENCIL_TOP + PENCIL_BAND + 4}
            stroke="#f0853a"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  )
}

/** A simple drawn pencil: sharpened tip on the RIGHT, eraser ferrule on the LEFT. */
function PencilGlyph({ leftX, rightX, y }: { leftX: number; rightX: number; y: number }) {
  const h = 15
  const top = y - h / 2
  const tipLen = 18 // wooden point on the RIGHT (tip end, higher reading)
  const ferruleLen = 12 // metal band + eraser block on the LEFT (eraser end)
  const bodyLeft = leftX + ferruleLen
  const bodyRight = rightX - tipLen
  return (
    <g>
      {/* eraser block (left end) */}
      <rect x={leftX} y={top} width={ferruleLen - 6} height={h} rx={2} fill="#F9A8D4" stroke={INK} strokeWidth={1.5} />
      {/* metal ferrule */}
      <rect x={leftX + ferruleLen - 6} y={top} width={6} height={h} fill="#FBBF24" stroke={INK} strokeWidth={1.5} />
      {/* painted barrel */}
      <rect x={bodyLeft} y={top} width={bodyRight - bodyLeft} height={h} fill="#EF4444" stroke={INK} strokeWidth={1.5} />
      {/* sharpened wooden tip (right) */}
      <path
        d={`M ${rightX} ${y} L ${bodyRight} ${top} L ${bodyRight} ${top + h} Z`}
        fill="#F5C77E"
        stroke={INK}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* graphite point */}
      <path d={`M ${rightX} ${y} L ${rightX - 6} ${y - 3} L ${rightX - 6} ${y + 3} Z`} fill={INK} />
    </g>
  )
}

/** Default export: bare ruler + pencil with dashed end guides, no answer revealed. */
export default function P20G2Q7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah penggaris dengan angka tercetak 8 sampai 15 dari kiri ke kanan, dan sebuah pensil tergeletak di atasnya: garis putus-putus menunjukkan ujung penghapus tepat di angka 8 dan ujung runcing tepat di angka 14. Tentukan panjang pensil dalam cm."
    >
      <PencilRuler20 />
    </div>
  )
}
