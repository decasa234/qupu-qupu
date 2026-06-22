// IKMC-23-EC-Q3 — gray disc with 2 circular holes placed over a clock face.
//
// "A gray circle with 2 large holes in it is put on top of a clock-face, as
// shown. The gray circle is turned around its center. Which 2 numbers is it
// possible to see at the same time?"   Answer: B = 5 and 9.
//
// SOURCE FIGURE (2023.imgs/003.jpg):
//   Left panel: a light-blue clock face with 12 numbers arranged as a clock.
//   Right panel: a dark-gray disc with two circular holes at roughly the
//   "1 o'clock" and "5 o'clock" positions — 4 clock-positions apart.
//
// The holes are always diametrically opposite along the chord connecting the
// two hole centres (they are NOT 180° opposite — they are 4 positions = 120°
// apart).  Any pair of numbers that are 4 clock-steps apart can show at the
// same time: (1,5) (2,6) (3,7) (4,8) (5,9) (6,10) (7,11) (8,12) etc.
// 5 and 9 (choice B) is one such valid pair.
//
// The STATIC illustration shows the disc overlaid on the clock in the
// STARTING POSITION from the figure: holes at 1 and 5.  It never reveals
// the answer (no "5 and 9" highlighted).
//
// Bound quantities from breakdown.quantities:
//   GAP = 4  (holes are 4 clock-positions apart)
//   HOLE_A = 1, HOLE_B = 5  (starting position from figure)
//
// Pure render: no Math.random, no Date — SSR-safe and deterministic.

const GAP = 4 // clock positions between the two holes (from figure)
export const HOLE_A = 1 // starting hole A clock-number (from figure)
export const HOLE_B = 5 // starting hole B clock-number (from figure)

/** Clock angle (degrees clockwise from 12) + radius → SVG point. */
function polar(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

/** Angle (degrees cw from 12) for clock-number n (1–12). */
function clockAngle(n: number): number {
  return ((n % 12) * 30)
}

// ── shared primitive props ───────────────────────────────────────────────────
export interface ClockHoles3ECProps {
  /**
   * The clock position (1–12) that hole A is currently pointing at.
   * Hole B is always GAP positions later (clockwise).
   * Default = HOLE_A (starting position from the figure).
   */
  holeA?: number
  /**
   * When true, draw highlighted rings around the two visible numbers
   * (used in the explainer to emphasize the revealed pair).
   */
  highlightVisible?: boolean
  /**
   * When set, draw a green "answer" ring around these two clock numbers
   * (used only on the winning beat).
   */
  answerPair?: [number, number] | null
}

/**
 * Primitive.  Draws the clock-face on the left and the grey disc (with 2
 * holes) overlaid on the right.  Props control which pair of numbers is
 * currently visible through the holes.
 *
 * Re-exported as the default illustration (holeA = 1, no highlights).
 */
export function ClockHoles3EC({ holeA = HOLE_A, highlightVisible = false, answerPair = null }: ClockHoles3ECProps = {}) {
  // Hole positions
  const holeB = ((holeA - 1 + GAP) % 12) + 1

  // Layout constants
  const PANEL_W = 160   // width of each panel
  const GAP_W = 20      // gap between panels
  const TOTAL_W = PANEL_W * 2 + GAP_W
  const H = 180
  const CX = 80         // centre of each panel (relative to panel origin)
  const CY = 90
  const CLOCK_R = 70    // clock face radius
  const NUM_R = 54      // radius where numbers sit
  const DISC_R = 72     // grey disc radius
  const HOLE_R = 14     // radius of each circular hole
  const HOLE_OFFSET = 42 // how far hole centre is from disc centre

  // Offsets for each panel
  const leftOX = 0
  const rightOX = PANEL_W + GAP_W

  // clock face centre
  const cxL = leftOX + CX
  const cyL = CY
  // disc centre
  const cxR = rightOX + CX
  const cyR = CY

  // Compute hole SVG positions (disc-space, then shifted to absolute)
  const aAngle = clockAngle(holeA)
  const bAngle = clockAngle(holeB)
  const hA = polar(aAngle, HOLE_OFFSET, cxR, cyR)
  const hB = polar(bAngle, HOLE_OFFSET, cxR, cyR)

  // answer-pair highlight set
  const answerSet = answerPair ? new Set(answerPair) : null

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${H}`}
      width={Math.min(340, TOTAL_W)}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* ── LEFT PANEL: clock face ── */}
      <circle cx={cxL} cy={cyL} r={CLOCK_R} className="fill-sky-100 stroke-qupu-brand-blue" strokeWidth={2.5} />

      {/* clock numbers 1–12 */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const pos = polar(clockAngle(n), NUM_R, cxL, cyL)
        const isAnswer = answerSet?.has(n)
        return (
          <text
            key={n}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            className={isAnswer ? 'fill-qupu-brand-orange' : 'fill-qupu-brand-blue'}
          >
            {n}
          </text>
        )
      })}

      {/* centre dot on clock */}
      <circle cx={cxL} cy={cyL} r={3} className="fill-qupu-brand-blue" />

      {/* ── RIGHT PANEL: grey disc with holes ── */}
      {/* grey disc */}
      <circle cx={cxR} cy={cyR} r={DISC_R} fill="#707070" stroke="#484848" strokeWidth={2} />

      {/* holes — cut-outs rendered as filled circles matching background */}
      {/* We use a clipPath approach: render the hole positions as white/light circles */}
      {/* In SVG we punch them with a foreignObject clip or just draw them white with */}
      {/* a slight border.  Since the background is white, a white circle works. */}
      <circle cx={hA.x} cy={hA.y} r={HOLE_R} fill="white" stroke="#aaa" strokeWidth={1.5} />
      <circle cx={hB.x} cy={hB.y} r={HOLE_R} fill="white" stroke="#aaa" strokeWidth={1.5} />

      {/* tiny number labels inside the holes showing which numbers peek through */}
      {/* Highlight ring around visible numbers if requested */}
      {highlightVisible && (
        <>
          <circle cx={hA.x} cy={hA.y} r={HOLE_R + 3} fill="none" stroke="#f0853a" strokeWidth={2.5} />
          <circle cx={hB.x} cy={hB.y} r={HOLE_R + 3} fill="none" stroke="#f0853a" strokeWidth={2.5} />
        </>
      )}

      {/* number that appears in each hole */}
      <text x={hA.x} y={hA.y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} className="fill-qupu-brand-blue">
        {holeA}
      </text>
      <text x={hB.x} y={hB.y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} className="fill-qupu-brand-blue">
        {holeB}
      </text>

      {/* centre dot on disc */}
      <circle cx={cxR} cy={cyR} r={3} fill="white" />
    </svg>
  )
}

/**
 * Default export: the static stem illustration — clock face on the left,
 * grey disc with holes at positions 1 and 5 (from the source figure) on the
 * right.  No answer highlighted.
 */
export default function ClockHoles3ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah jam dengan angka 1 sampai 12 dan sebuah lingkaran abu-abu dengan 2 lubang besar diletakkan di atasnya; lubang-lubang berada di posisi angka 1 dan 5."
    >
      <ClockHoles3EC />
    </div>
  )
}
