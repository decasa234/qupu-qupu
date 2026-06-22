// IKMC-19-EC-Q12 — "The weight of a dog toy is a whole number. How much does one
// dog toy weigh?"
//
// Two tilted balance scales (adapted from BalanceScales25G1Illustration):
//   Scale 1 (right/12 kg DOWN):  1 dog toy (left, UP)  vs  12 kg weight (right, DOWN)
//                                 → toy < 12 kg
//   Scale 2 (left/toys DOWN):    2 dog toys (left, DOWN) vs  20 kg weight (right, UP)
//                                 → 2 × toy > 20 kg  → toy > 10 kg
//
// Together: 10 < toy < 12 and toy is a whole number → toy = 11 kg  (answer E).
//
// The STEM figure shows ONLY the problem: the two scales. The answer is never drawn.
// Pure render — no randomness, no Date, SSR-safe.

// ---- palette ---------------------------------------------------------------
const INK = '#1F2937'
const TOY_FILL = '#F9A8D4' // pink dog toy body
const TOY_STROKE = '#BE185D'
const KG_FILL = '#1F2937' // black cast-iron weight block
const KG_TEXT = '#FFFFFF'
const BASE_FILL = '#5BC0EB' // blue triangular pivot base (matches BalanceScales25G1)
const BEAM_COLOR = '#9AA0A6'
const PAN_COLOR = '#FFFFFF'

// ---- one scale geometry (drawn inside CELL_W × CELL_H) --------------------
export const CELL_W = 320
export const CELL_H = 200

const PIVOT_Y = 110
const BEAM_HALF = 106
const TILT_DY = 30 // vertical rise/fall of beam ends when tilted
const PAN_DROP = 14 // pan hangs this far below the beam end

// ---- dog toy glyph ---------------------------------------------------------
// A simplified side-view dog silhouette: oval body + round head + small ear + tail + 4 legs.
// Centred at (cx, baseY) where baseY is the pan surface.
function DogToy({ cx, baseY }: { cx: number; baseY: number }) {
  // body oval centre sits one body-height above the pan
  const bodyR = 20
  const bodyX = cx
  const bodyY = baseY - bodyR - 4

  // head
  const headR = 11
  const headX = bodyX + bodyR - 2
  const headY = bodyY - headR + 3

  // ear (floppy, right side of head)
  const earX = headX + headR - 4
  const earY = headY - 6

  // tail (left end of body)
  const tailX = bodyX - bodyR + 2
  const tailY = bodyY - 4

  // legs: two pairs, evenly spaced under the body
  const legW = 5
  const legH = 14
  const legs = [
    { lx: bodyX - 12, ly: bodyY + bodyR - 5 },
    { lx: bodyX - 3, ly: bodyY + bodyR - 5 },
    { lx: bodyX + 5, ly: bodyY + bodyR - 5 },
    { lx: bodyX + 14, ly: bodyY + bodyR - 5 },
  ]

  return (
    <g>
      {/* legs */}
      {legs.map((l, i) => (
        <rect key={i} x={l.lx - legW / 2} y={l.ly} width={legW} height={legH} rx={2} fill={TOY_FILL} stroke={TOY_STROKE} strokeWidth={1.2} />
      ))}
      {/* body */}
      <ellipse cx={bodyX} cy={bodyY} rx={bodyR} ry={bodyR - 4} fill={TOY_FILL} stroke={TOY_STROKE} strokeWidth={1.8} />
      {/* head */}
      <circle cx={headX} cy={headY} r={headR} fill={TOY_FILL} stroke={TOY_STROKE} strokeWidth={1.8} />
      {/* ear */}
      <ellipse cx={earX} cy={earY} rx={5} ry={8} fill={TOY_FILL} stroke={TOY_STROKE} strokeWidth={1.5} />
      {/* eye dot */}
      <circle cx={headX + 4} cy={headY - 3} r={2} fill={INK} />
      {/* nose */}
      <circle cx={headX + headR - 3} cy={headY + 1} r={2} fill={TOY_STROKE} />
      {/* tail (curved path) */}
      <path
        d={`M ${tailX} ${tailY} Q ${tailX - 14} ${tailY - 20} ${tailX - 8} ${tailY - 32}`}
        fill="none"
        stroke={TOY_STROKE}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

// ---- kg weight block glyph -------------------------------------------------
// A rounded rectangle with the kg value printed inside, plus a knob on top.
// baseY is the pan surface; the block sits on it.
function KgBlock({ cx, baseY, kg }: { cx: number; baseY: number; kg: number }) {
  const bw = 46
  const bh = 52
  const bx = cx - bw / 2
  const by = baseY - bh
  const knobH = 10
  const knobW = 12
  return (
    <g>
      {/* knob */}
      <rect x={cx - knobW / 2} y={by - knobH} width={knobW} height={knobH + 4} rx={3} fill={KG_FILL} />
      {/* body */}
      <rect x={bx} y={by} width={bw} height={bh} rx={6} fill={KG_FILL} />
      {/* label */}
      <text x={cx} y={by + bh / 2 - 6} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={KG_TEXT}>
        {kg}
      </text>
      <text x={cx} y={by + bh / 2 + 11} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill={KG_TEXT}>
        kg
      </text>
    </g>
  )
}

// ---- pan geometry ----------------------------------------------------------
const TRAY_W = 88
const TRAY_HALF = TRAY_W / 2

function Pan({ px, py, children }: { px: number; py: number; children: React.ReactNode }) {
  const trayTop = py + PAN_DROP
  return (
    <g>
      {/* V-hanger */}
      <line x1={px} y1={py} x2={px - TRAY_HALF + 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={px} y1={py} x2={px + TRAY_HALF - 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      {/* items sit just above the tray */}
      {children}
      {/* shallow bowl rim */}
      <path
        d={`M ${px - TRAY_HALF} ${trayTop} Q ${px} ${trayTop + 14} ${px + TRAY_HALF} ${trayTop}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={px} cy={trayTop} rx={TRAY_HALF} ry={4.5} fill={PAN_COLOR} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

// ---- ScaleDef & ScaleRow ---------------------------------------------------
export interface ScaleDef12 {
  /** 1 = left pan down (left heavier); -1 = right pan down (right heavier). */
  tilt: 1 | -1
  /** Number of dog toys on the left pan. */
  toysLeft: number
  /** Kg value of the weight block on the right pan. */
  kgRight: number
}

export const SCALES_12: ScaleDef12[] = [
  // Scale 1: 12 kg DOWN, dog toy UP  →  12 > toy
  { tilt: -1, toysLeft: 1, kgRight: 12 },
  // Scale 2: 2 toys DOWN, 20 kg UP  →  2×toy > 20  →  toy > 10
  { tilt: 1, toysLeft: 2, kgRight: 20 },
]

/** One balance scale rendered inside its cell (offset ox from the viewBox left). */
export function ScaleRow12({
  def,
  ox,
  dim = false,
}: {
  def: ScaleDef12
  ox: number
  dim?: boolean
}) {
  const pivotX = ox + CELL_W / 2
  const leftY = PIVOT_Y + def.tilt * TILT_DY
  const rightY = PIVOT_Y - def.tilt * TILT_DY
  const leftX = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  const groundY = CELL_H - 10

  // Pan tray tops (where items sit ON)
  const leftTrayTop = leftY + PAN_DROP
  const rightTrayTop = rightY + PAN_DROP
  // Items' baseY is tray surface
  const leftBase = leftTrayTop - 2
  const rightBase = rightTrayTop - 2

  // Position multiple toys side by side on the left pan
  const toySpacing = 52
  const totalToysW = def.toysLeft === 1 ? 0 : (def.toysLeft - 1) * toySpacing
  const toyStartX = leftX - totalToysW / 2

  return (
    <g opacity={dim ? 0.28 : 1}>
      {/* Left pan items (dog toys) */}
      <Pan px={leftX} py={leftY}>
        {Array.from({ length: def.toysLeft }, (_, i) => (
          <DogToy key={i} cx={toyStartX + i * toySpacing} baseY={leftBase} />
        ))}
      </Pan>

      {/* Right pan items (kg block) */}
      <Pan px={rightX} py={rightY}>
        <KgBlock cx={rightX} baseY={rightBase} kg={def.kgRight} />
      </Pan>

      {/* Beam (drawn on top so it overlaps the pan hangers) */}
      <line x1={leftX} y1={leftY} x2={rightX} y2={rightY} stroke={BEAM_COLOR} strokeWidth={8} strokeLinecap="round" />

      {/* Blue triangular pivot base */}
      <polygon
        points={`${pivotX},${PIVOT_Y - 4} ${pivotX - 32},${groundY} ${pivotX + 32},${groundY}`}
        fill={BASE_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* pivot bolt */}
      <circle cx={pivotX} cy={PIVOT_Y} r={6} fill={PAN_COLOR} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

// ---- whole-figure SVG primitive (co-exported for the explainer) ------------
const GAP = 16
const PAD = 10
export const VIEW_W = PAD * 2 + CELL_W * 2 + GAP // 686
export const VIEW_H = CELL_H

export interface DogToys12Props {
  /** Emphasise one scale (1 or 2); the other dims. null = all neutral. */
  litScale?: 1 | 2 | null
}

/**
 * The two balance scales, optionally spotlighting one.
 * aria-hidden — meant to sit inside a labelled wrapper.
 */
export function DogToys12Scales({ litScale = null }: DogToys12Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 640, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SCALES_12.map((def, i) => (
        <ScaleRow12
          key={i}
          def={def}
          ox={PAD + i * (CELL_W + GAP)}
          dim={litScale !== null && litScale !== i + 1}
        />
      ))}
    </svg>
  )
}

// ---- default export: the question figure -----------------------------------
export default function DogToys12ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua timbangan. Timbangan pertama: satu mainan anjing lebih ringan dari beban 12 kg (sisi 12 kg lebih rendah). ' +
        'Timbangan kedua: dua mainan anjing lebih berat dari beban 20 kg (sisi mainan anjing lebih rendah). ' +
        'Berat setiap mainan anjing adalah bilangan bulat.'
      }
    >
      <DogToys12Scales />
    </div>
  )
}
