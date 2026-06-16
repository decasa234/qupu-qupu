// WMI-24F1A-Q13 (2024 Grade 1 Final).
//
// "A picture is drawn on the minute hand of a clock showing 11:50. What does
// the picture look like, seen from the front, at 3:30?"  Answer: D.
//
// Geometry (the anti-drift spine of this question):
//   - At 11:50 the minute hand points to the 10  → 300° clockwise from 12.
//   - At  3:30 the minute hand points to the  6  → 180° clockwise from 12.
//   - So the hand (and the picture painted on it) turns 300° → 180°, i.e. by
//     -120° (120° counter-clockwise).
//
// The picture is a SQUARE FRAME containing a "\" diagonal plus a "lollipop"
// (a small circle on a short stick). It is defined ONCE, axis-aligned, in the
// 3:30 orientation (= option D). Everything else is that one picture rotated:
//   - The stem clock paints it on the 11:50 hand  → +120° from D (the answer
//     orientation is therefore never revealed in the stem; only the setup is).
//   - The animator can flip `rotated` to swing it from 11:50 to 3:30.
// Because the stem and option D are literally the same <ClockPicture> group at
// two angles, they can never drift apart.

const INK = '#3a3438' // dark charcoal outline, matching the scanned line art
const GRAY = '#b9b2b0' // outer ring fill

/** Convert a clock angle (degrees clockwise from 12 o'clock) + radius to an SVG point on a face centred at (cx,cy). */
function facePoint(cx: number, cy: number, angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

/**
 * The picture painted on the minute hand, drawn in a 100×100 local box whose
 * top-left corner is the local origin. In its native (un-rotated) orientation
 * this is exactly OPTION D: a square frame, a "\" diagonal (top-left → bottom
 * -right), and a lollipop — a circle near the top with a stick down to the
 * bottom-right corner.
 *
 * The caller positions/rotates the whole group, so the same shape is reused
 * for the stem, every option, and the animation. `size` scales the 100-box.
 */
export function ClockPicture({
  size = 100,
  stroke = INK,
  strokeWidth = 6,
}: {
  size?: number
  stroke?: string
  strokeWidth?: number
}) {
  const s = size / 100
  return (
    <g
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      transform={`scale(${s})`}
    >
      {/* Square frame */}
      <rect x={3} y={3} width={94} height={94} />
      {/* "\" diagonal: top-left → bottom-right */}
      <line x1={3} y1={3} x2={97} y2={97} />
      {/* Lollipop stick: from the bottom-right corner up to the circle */}
      <line x1={92} y1={92} x2={61} y2={33} />
      {/* Lollipop head: circle near the top, right of centre */}
      <circle cx={61} cy={22} r={12} fill="#ffffff" />
    </g>
  )
}

/**
 * The full stem clock at 11:50, with the picture painted on the minute hand.
 * `rotated` is for the animator: false = 11:50 (hand to the 10, picture +120°
 * from D), true = 3:30 (hand to the 6, picture in the D orientation).
 */
export function ClockPic24G1({ rotated = false }: { rotated?: boolean }) {
  const cx = 150
  const cy = 150
  const faceR = 92
  const ringR = 128
  // Minute-hand angle (clockwise from 12): 11:50 → 300° (the 10); 3:30 → 180° (the 6).
  const handAngle = rotated ? 180 : 300
  // Hour-hand angle: 11:50 → ~355° (just shy of 12); 3:30 → ~105° (between 3 and 4).
  const hourAngle = rotated ? 105 : 355

  const handLen = 78 // minute hand reaches near the rim, where the picture sits
  const handTip = facePoint(cx, cy, handAngle, handLen)
  const hourTip = facePoint(cx, cy, hourAngle, 50)

  // The picture box (100 local units) is centred on the hand tip and rotated so
  // its "root" corner faces the clock centre. In the D orientation the root is
  // the top-left corner; we add the hand angle so the square rides the hand.
  const picSize = 96
  // Screen rotation of the picture group: the picture's native orientation is D
  // (hand pointing straight down = 180°). Offset from that gives the spin.
  const picRotation = handAngle - 180

  return (
    <svg
      viewBox="0 0 300 300"
      width={Math.min(280, 300)}
      height={Math.min(280, 300)}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={ringR} fill={GRAY} stroke={INK} strokeWidth={3} />
      {/* White face */}
      <circle cx={cx} cy={cy} r={faceR} fill="#ffffff" stroke={INK} strokeWidth={3} />

      {/* 12 hour dots — the multiples of 3 are a touch larger, as in the scan */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = i * 30
        const p = facePoint(cx, cy, a, faceR - 12)
        const big = i % 3 === 0
        return <circle key={i} cx={p.x} cy={p.y} r={big ? 5.5 : 3.5} fill={INK} />
      })}

      {/* Hour hand (short, thick) */}
      <line x1={cx} y1={cy} x2={hourTip.x} y2={hourTip.y} stroke={INK} strokeWidth={9} strokeLinecap="round" />

      {/* Minute hand (long, thick) reaching toward the picture */}
      <line x1={cx} y1={cy} x2={handTip.x} y2={handTip.y} stroke={INK} strokeWidth={9} strokeLinecap="round" />

      {/* Centre cap */}
      <circle cx={cx} cy={cy} r={7} fill={INK} />

      {/* The picture, riding the minute hand. Translate to the hand tip, rotate
          with the hand, then offset so the box's root corner sits on the tip. */}
      <g transform={`translate(${handTip.x} ${handTip.y}) rotate(${picRotation}) translate(${-picSize / 2} ${-picSize / 2})`}>
        <ClockPicture size={picSize} strokeWidth={6} />
      </g>
    </svg>
  )
}

const ARIA =
  'Jam menunjukkan pukul 11.50: jarum menit menunjuk ke angka 10. Pada jarum menit ' +
  'ada gambar — sebuah bingkai persegi berisi garis diagonal dan sebuah lingkaran ' +
  'kecil bertangkai. Pertanyaannya: bagaimana gambar itu terlihat dari depan pada pukul 3.30?'

export default function ClockPic24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ClockPic24G1 />
    </div>
  )
}
