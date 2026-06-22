// IKMC-21-EC-Q8 — "What is the weight of each white ball?"
//
// Three LEVEL balance scales, each showing coloured balls on the left pan and
// a kg reading on the right pan (a cast-iron weight block).  All pans are
// balanced (beams are horizontal).
//
//   Scale 1: 1 grey ball  +  1 black ball  = 6 kg
//   Scale 2: 3 white balls                 = 15 kg  (figure value; answer: 15÷3=5 kg)
//   Scale 3: 1 black ball + 3 white balls  = 10 kg
//
// Adapted from DogToys12ECIllustration (IKMC-19-EC-Q12) — same geometry
// (CELL_W/CELL_H, Pan, KgBlock, beam, blue pivot) with the dog-toy glyph
// replaced by coloured ball circles matching the scan palette.
//
// Pure render — no randomness, no Date, SSR-safe.

import React from 'react'

// ---- palette ---------------------------------------------------------------
const INK = '#1F2937'
const GREY_BALL = '#9CA3AF'   // grey ball
const BLACK_BALL = '#111827'  // black ball
const WHITE_BALL = '#FFFFFF'  // white ball (with dark stroke so it's visible)
const KG_FILL = '#1F2937'     // cast-iron weight block
const KG_TEXT = '#FFFFFF'
const BASE_FILL = '#5BC0EB'   // blue triangular pivot (same as DogToys12EC)
const BEAM_COLOR = '#9AA0A6'
const PAN_COLOR = '#FFFFFF'

// ---- one scale geometry ----------------------------------------------------
export const CELL_W = 310
export const CELL_H = 200

const PIVOT_Y = 108
const BEAM_HALF = 104
const TILT_DY = 0    // level beam — no tilt
const PAN_DROP = 14
const TRAY_W = 90
const TRAY_HALF = TRAY_W / 2

const BALL_R = 15  // radius of each coloured ball

// ---- ball colour type ------------------------------------------------------
export type BallColour = 'grey' | 'black' | 'white'

function ballFill(c: BallColour) {
  if (c === 'grey') return GREY_BALL
  if (c === 'black') return BLACK_BALL
  return WHITE_BALL
}

function Ball({ cx, baseY, colour }: { cx: number; baseY: number; colour: BallColour }) {
  return (
    <circle
      cx={cx}
      cy={baseY - BALL_R}
      r={BALL_R}
      fill={ballFill(colour)}
      stroke={INK}
      strokeWidth={2}
    />
  )
}

// ---- kg weight block (knob + rounded rect + label) -------------------------
function KgBlock({ cx, baseY, kg }: { cx: number; baseY: number; kg: number }) {
  const bw = 48
  const bh = 50
  const bx = cx - bw / 2
  const by = baseY - bh
  const knobH = 10
  const knobW = 12
  return (
    <g>
      <rect x={cx - knobW / 2} y={by - knobH} width={knobW} height={knobH + 4} rx={3} fill={KG_FILL} />
      <rect x={bx} y={by} width={bw} height={bh} rx={6} fill={KG_FILL} />
      <text x={cx} y={by + bh / 2 - 7} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={KG_TEXT}>
        {kg}
      </text>
      <text x={cx} y={by + bh / 2 + 11} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill={KG_TEXT}>
        kg
      </text>
    </g>
  )
}

// ---- pan (shallow tray with V-hanger) --------------------------------------
function Pan({ px, py, children }: { px: number; py: number; children: React.ReactNode }) {
  const trayTop = py + PAN_DROP
  return (
    <g>
      <line x1={px} y1={py} x2={px - TRAY_HALF + 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={px} y1={py} x2={px + TRAY_HALF - 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      {children}
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

// ---- per-scale data --------------------------------------------------------
export interface BallScaleDef {
  /** Balls on the left pan, left → right. */
  balls: BallColour[]
  /** Total kg shown on the right pan's weight block. */
  kg: number
}

export const BALL_SCALES_8: BallScaleDef[] = [
  // Scale 1: 1 grey + 1 black = 6 kg
  { balls: ['grey', 'black'], kg: 6 },
  // Scale 2: 3 white = 15 kg  (figure value)
  { balls: ['white', 'white', 'white'], kg: 15 },
  // Scale 3: 1 black + 3 white = 10 kg
  { balls: ['black', 'white', 'white', 'white'], kg: 10 },
]

/** One balance scale drawn inside its cell; ox is the cell's left edge offset. */
export function BallScaleRow8({
  def,
  ox,
  dim = false,
  highlight = false,
}: {
  def: BallScaleDef
  ox: number
  dim?: boolean
  highlight?: boolean
}) {
  const pivotX = ox + CELL_W / 2
  // Always level (TILT_DY = 0)
  const leftY = PIVOT_Y + TILT_DY
  const rightY = PIVOT_Y - TILT_DY
  const leftX = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  const groundY = CELL_H - 10

  const trayTop = leftY + PAN_DROP
  const ballBase = trayTop - 2   // balls sit just above tray surface

  // Lay out balls side by side, centred on leftX
  const spacing = BALL_R * 2 + 3
  const totalW = (def.balls.length - 1) * spacing
  const ballStartX = leftX - totalW / 2

  // For 4 balls, use a 2-row layout (2 bottom + 2 top-offset) to avoid pans
  // being too wide. Split at 3+ balls with a 2+rest arrangement.
  const useTwoRows = def.balls.length === 4

  const placements: Array<{ colour: BallColour; cx: number; baseY: number }> = []
  if (useTwoRows) {
    // bottom row: 2 balls (indices 0,1), centred; top row: 2 balls (indices 2,3)
    const bSpacing = BALL_R * 2 + 4
    const rowCx = leftX
    const bottomBase = ballBase
    const topBase = ballBase - BALL_R * 1.8
    placements.push({ colour: def.balls[0], cx: rowCx - bSpacing / 2, baseY: bottomBase })
    placements.push({ colour: def.balls[1], cx: rowCx + bSpacing / 2, baseY: bottomBase })
    placements.push({ colour: def.balls[2], cx: rowCx - bSpacing / 2, baseY: topBase })
    placements.push({ colour: def.balls[3], cx: rowCx + bSpacing / 2, baseY: topBase })
  } else {
    def.balls.forEach((colour, i) => {
      placements.push({ colour, cx: ballStartX + i * spacing, baseY: ballBase })
    })
  }

  const kgBase = (rightY + PAN_DROP) - 2

  return (
    <g opacity={dim ? 0.25 : 1}>
      {/* highlight ring around the scale cell */}
      {highlight && (
        <rect
          x={ox + 4}
          y={4}
          width={CELL_W - 8}
          height={CELL_H - 8}
          rx={12}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          opacity={0.6}
        />
      )}

      {/* left pan — balls */}
      <Pan px={leftX} py={leftY}>
        {placements.map((p, i) => (
          <Ball key={i} cx={p.cx} baseY={p.baseY} colour={p.colour} />
        ))}
      </Pan>

      {/* right pan — kg block */}
      <Pan px={rightX} py={rightY}>
        <KgBlock cx={rightX} baseY={kgBase} kg={def.kg} />
      </Pan>

      {/* beam (horizontal, level) */}
      <line
        x1={leftX}
        y1={leftY}
        x2={rightX}
        y2={rightY}
        stroke={BEAM_COLOR}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* triangular blue pivot base */}
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
const GAP = 12
const PAD = 10
export const VIEW_W = PAD * 2 + CELL_W * 3 + GAP * 2  // 958
export const VIEW_H = CELL_H

export interface BallScales8Props {
  /** Spotlight one scale (1, 2, or 3); others dim. null = all neutral. */
  litScale?: 1 | 2 | 3 | null
}

/**
 * Three balanced scales, optionally spotlighting one.
 * aria-hidden — must sit inside a labelled wrapper.
 */
export function BallScales8({ litScale = null }: BallScales8Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 720, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {BALL_SCALES_8.map((def, i) => (
        <BallScaleRow8
          key={i}
          def={def}
          ox={PAD + i * (CELL_W + GAP)}
          dim={litScale !== null && litScale !== (i + 1 as 1 | 2 | 3)}
          highlight={litScale === (i + 1 as 1 | 2 | 3)}
        />
      ))}
    </svg>
  )
}

// ---- default export: the question stem figure ------------------------------
export default function BallScales8ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga timbangan seimbang. ' +
        'Timbangan 1: 1 bola abu-abu dan 1 bola hitam = 6 kg. ' +
        'Timbangan 2: 3 bola putih = 15 kg. ' +
        'Timbangan 3: 1 bola hitam dan 3 bola putih = 10 kg. ' +
        'Berapakah berat setiap bola putih?'
      }
    >
      <BallScales8 />
    </div>
  )
}
