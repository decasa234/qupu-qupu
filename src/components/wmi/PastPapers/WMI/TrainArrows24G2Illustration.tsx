// In-card illustration for WMI-24F2A-Q14 (2024 Grade-2 Final).
//
// The printed stem shows a toy train running forward along a curving grey rail.
// Reading db/seed/wmi/figures/2024-final-g2-a-q14.jpg, the cars, in order along
// the track from the rear (bottom) engine forward to the front (top) engine, are:
//
//   rear engine  → arrow pointing RIGHT (the forward direction at the tail)
//   car          ▲ red triangle pointing UP
//   car          ◁ white triangle pointing LEFT
//   car          ▼ red triangle pointing DOWN
//   car          ◯ plain white circle (a head-/tail-light, no arrow)
//   car          ? hidden arrow  (lower ? box)
//   car          ? hidden arrow  (upper ? box)
//   front engine ← arrow pointing LEFT (the forward direction at the head)
//
// The rail bends between the cars; as the train moves forward each car turns the
// same way the rail bends, so the four KNOWN arrows fix the turning rule and the
// two "?" cars hide the arrows the reader must recover.
//
// House style: framed white card, monochrome ink, salmon car bodies with maroon
// outlines and red signal arrows, a grey rail with a grey dotted "track-ahead".
//
// The STATIC stem NEVER shows the hidden arrows or marks the answer — that is the
// animator's job after the answer (E) is revealed. The five printed options are
// arrow-pair pictures, so `TrainArrows24G2Option` renders ONE option's two
// circled arrows given its label, keyed off the co-exported OPTIONS24Q14 table.

import type { WmiChoice } from '../../../types/wmi'

const INK = '#1F2937'
const BODY = '#F7DAD6' // salmon car body
const BODY_EDGE = '#6E2B2B' // maroon outline
const WHEEL = '#2B2B2B'
const RAIL = '#C2C2C2'
const RAIL_DOT = '#BDBDBD'
const SIGNAL = '#D7263D' // red signal arrow
const SIGNAL_EDGE = '#6E2B2B'

export type Dir = 'up' | 'down' | 'left' | 'right'

// Rotation (deg, clockwise) that turns a base UP-pointing triangle into `dir`.
const DIR_ROT: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }
const DIR_ID: Record<Dir, string> = { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' }

// ---------------------------------------------------------------------------
// The five printed answer options, each a PAIR of arrows (first ? , second ?).
// Co-exported so the explainer and the per-option CHOICE renderer share one
// source of truth. The reconstructed answer key is E = (down, right).
export type ArrowPair = [Dir, Dir]
export const OPTIONS24Q14: Record<'A' | 'B' | 'C' | 'D' | 'E', ArrowPair> = {
  A: ['up', 'left'],
  B: ['left', 'down'],
  C: ['right', 'up'],
  D: ['up', 'right'],
  E: ['down', 'right'],
}
const OPTION_LABELS: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']

// ---------------------------------------------------------------------------
// Primitive glyphs.

// A small triangle arrow, base pointing UP, rotated to `dir`, centred at (cx,cy).
function ArrowGlyph({
  dir,
  cx,
  cy,
  r = 9,
  fill = SIGNAL,
  stroke = SIGNAL_EDGE,
  strokeWidth = 1.6,
}: {
  dir: Dir
  cx: number
  cy: number
  r?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  const pts = `${cx},${cy - r} ${cx + r * 0.86},${cy + r * 0.62} ${cx - r * 0.86},${cy + r * 0.62}`
  return (
    <polygon
      points={pts}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      transform={`rotate(${DIR_ROT[dir]} ${cx} ${cy})`}
    />
  )
}

// A square signal car: rounded salmon box with a white disc carrying one arrow
// (or a "?" when hidden, or nothing for the plain circle car).
function SignalCar({
  cx,
  cy,
  s = 30,
  dir,
  hidden,
  plain,
}: {
  cx: number
  cy: number
  s?: number
  dir?: Dir
  hidden?: boolean
  plain?: boolean
}) {
  const half = s / 2
  const discR = s * 0.34
  return (
    <g>
      <CarWheels cx={cx} cy={cy} s={s} />
      <rect
        x={cx - half}
        y={cy - half}
        width={s}
        height={s}
        rx={3}
        fill={BODY}
        stroke={BODY_EDGE}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy} r={discR} fill="white" stroke={INK} strokeWidth={1.8} />
      {hidden ? (
        <text
          x={cx}
          y={cy + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={s * 0.5}
          fontWeight={900}
          fill={INK}
          className="font-display"
        >
          ?
        </text>
      ) : plain ? null : dir ? (
        <ArrowGlyph dir={dir} cx={cx} cy={cy} r={discR * 0.7} />
      ) : null}
    </g>
  )
}

// Two stubby black wheels under a car, left and right.
function CarWheels({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const half = s / 2
  const ww = s * 0.26
  const wh = s * 0.42
  return (
    <g fill={WHEEL}>
      <rect x={cx - half - ww * 0.45} y={cy - wh / 2} width={ww} height={wh} rx={2} />
      <rect x={cx + half - ww * 0.55} y={cy - wh / 2} width={ww} height={wh} rx={2} />
    </g>
  )
}

// An engine: pentagon "house" pointing the way it travels (left or right).
function Engine({ cx, cy, s = 34, dir }: { cx: number; cy: number; s?: number; dir: 'left' | 'right' }) {
  const half = s / 2
  const w = s * 1.5
  const tip = w / 2
  // Build a left-pointing arrow-house, then mirror for right.
  const pts =
    dir === 'left'
      ? `${cx - tip},${cy} ${cx - tip * 0.35},${cy - half} ${cx + tip},${cy - half} ${cx + tip},${cy + half} ${cx - tip * 0.35},${cy + half}`
      : `${cx + tip},${cy} ${cx + tip * 0.35},${cy - half} ${cx - tip},${cy - half} ${cx - tip},${cy + half} ${cx + tip * 0.35},${cy + half}`
  return (
    <g>
      <CarWheels cx={cx} cy={cy} s={w * 0.7} />
      <polygon points={pts} fill={BODY} stroke={BODY_EDGE} strokeWidth={2} strokeLinejoin="round" />
    </g>
  )
}

// A short coupling stub (the little ball-and-bar between adjacent cars).
function Coupling({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={2} />
      <circle cx={mx} cy={my} r={2.4} fill={INK} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// The framed stem figure: the grey rail + the train with its two "?" cars.
export function TrainArrows24G2Illustration() {
  const W = 360
  const H = 220

  // Car centres traced from the scan (forward order: rear engine → front engine).
  const rearEngine = { x: 56, y: 184 }
  const carTriUp = { x: 116, y: 184 } // ▲
  const carTriLeft = { x: 158, y: 184 } // ◁
  const carTriDown = { x: 30, y: 184 } // ▼  (left-most, the very tail)
  const carCircle = { x: 232, y: 110 } // ◯ plain
  const lowerQ = { x: 188, y: 110 } // ?  (second hidden)
  const upperQ = { x: 150, y: 70 } // ?  (first hidden)
  const frontEngine = { x: 78, y: 44 }

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Kereta mainan berjalan maju di rel abu-abu yang berbelok. Berurutan dari belakang ke depan: ' +
        'lokomotif belakang dengan panah ke kanan, gerbong panah ke atas, gerbong panah ke kiri, ' +
        'gerbong panah ke bawah, gerbong lingkaran putih polos, dua gerbong bertanda tanya yang panahnya ' +
        'tersembunyi, lalu lokomotif depan dengan panah ke kiri. Tentukan arah dua panah bertanda tanya.'
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* ---- the grey rail (a wide band) drawn first, behind the cars ---- */}
        <path
          d={
            // upper straight in from the left to the front engine, curving down to
            // the ? ? ◯ row, sweeping right, then a U-bend back to the bottom row.
            'M -6 44 ' +
            'L 96 44 ' +
            'C 150 44 150 70 150 70 ' +
            'C 150 96 178 110 200 110 ' +
            'L 300 110 ' +
            'C 348 110 348 184 300 184 ' +
            'L -6 184'
          }
          fill="none"
          stroke={RAIL}
          strokeWidth={30}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ---- the dotted "track ahead" beads along the right / bottom rail ---- */}
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={`db-${i}`} cx={262 + i * 12} cy={110} r={4} fill={RAIL_DOT} />
        ))}
        {Array.from({ length: 6 }, (_, i) => {
          const t = i / 5
          const a = (-90 + t * 180) * (Math.PI / 180)
          return <circle key={`du-${i}`} cx={310 + Math.cos(a) * 37} cy={147 + Math.sin(a) * 37} r={4} fill={RAIL_DOT} />
        })}
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={`dl-${i}`} cx={300 - i * 13} cy={184} r={4} fill={RAIL_DOT} />
        ))}

        {/* ---- couplings between successive cars ---- */}
        <Coupling x1={carTriDown.x + 16} y1={184} x2={carTriUp.x - 16} y2={184} />
        <Coupling x1={carTriUp.x + 16} y1={184} x2={carTriLeft.x - 16} y2={184} />
        <Coupling x1={lowerQ.x + 16} y1={110} x2={carCircle.x - 16} y2={110} />
        <Coupling x1={upperQ.x + 8} y1={upperQ.y + 14} x2={lowerQ.x - 6} y2={lowerQ.y - 14} />
        <Coupling x1={frontEngine.x + 22} y1={frontEngine.y + 10} x2={upperQ.x - 14} y2={upperQ.y - 12} />

        {/* ---- the cars (drawn over the rail) ---- */}
        <Engine cx={rearEngine.x} cy={rearEngine.y} dir="right" />
        <SignalCar cx={carTriUp.x} cy={carTriUp.y} dir="up" />
        <SignalCar cx={carTriLeft.x} cy={carTriLeft.y} dir="left" />
        <SignalCar cx={carTriDown.x} cy={carTriDown.y} dir="down" />
        <SignalCar cx={carCircle.x} cy={carCircle.y} plain />
        <SignalCar cx={lowerQ.x} cy={lowerQ.y} hidden />
        <SignalCar cx={upperQ.x} cy={upperQ.y} hidden />
        <Engine cx={frontEngine.x} cy={frontEngine.y} dir="left" />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reusable: one option's pair of circled arrows, drawn as its own SVG. Shared by
// the CHOICE renderer (and available to the explainer).
export function ArrowPairFigure({
  pair,
  r = 14,
  gap = 14,
  pad = 8,
  maxWidth,
}: {
  pair: ArrowPair
  r?: number
  gap?: number
  pad?: number
  maxWidth?: number
}) {
  const safe: ArrowPair =
    Array.isArray(pair) && pair.length === 2 && (['up', 'down', 'left', 'right'] as string[]).includes(pair[0])
      ? pair
      : OPTIONS24Q14.E
  const cell = 2 * r
  const w = pad * 2 + 2 * cell + gap
  const h = pad * 2 + cell
  const cap = maxWidth ?? Math.min(120, w)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={cap} style={{ display: 'block' }} aria-hidden="true">
      {safe.map((d, i) => {
        const cx = pad + r + i * (cell + gap)
        const cy = h / 2
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="white" stroke={INK} strokeWidth={1.8} />
            <ArrowGlyph dir={d} cx={cx} cy={cy} r={r * 0.62} />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// CHOICE_RENDERERS component: draws ONE option's two arrows given its label, so
// the answer chips show the arrow pair instead of a bare letter. Falls back to
// plain text for any unexpected label so previews stay safe.
export function TrainArrows24G2Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const pair = OPTIONS24Q14[label]
  if (!pair) return <span>{choice?.text}</span>
  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: panah ${DIR_ID[pair[0]]} lalu ${DIR_ID[pair[1]]}.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <ArrowPairFigure pair={pair} />
    </span>
  )
}

// A framed five-option strip — not registered, but handy for previews and for the
// explainer to show the full option set. Never marks which option is correct.
export function TrainArrows24G2Options() {
  const R = 13
  const GAP = 12
  const cell = 2 * R
  const labelW = 26
  const colGap = 18
  const pad = 8
  const colW = labelW + 2 * cell + GAP
  const W = pad * 2 + OPTION_LABELS.length * colW + (OPTION_LABELS.length - 1) * colGap
  const H = pad * 2 + cell + 16
  return (
    <div className="my-4 flex justify-center" role="img" aria-label="Lima pilihan pasangan panah A sampai E.">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: Math.min(360, W), display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {OPTION_LABELS.map((l, idx) => {
          const x0 = pad + idx * (colW + colGap)
          const cy = pad + 16 + cell / 2
          const pair = OPTIONS24Q14[l]
          return (
            <g key={l}>
              <text
                x={x0 + labelW / 2}
                y={pad + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={900}
                fill={INK}
                className="font-display"
              >
                {`(${l})`}
              </text>
              {pair.map((d, i) => {
                const cx = x0 + labelW + R + i * (cell + GAP)
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r={R} fill="white" stroke={INK} strokeWidth={1.8} />
                    <ArrowGlyph dir={d} cx={cx} cy={cy} r={R * 0.62} />
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default TrainArrows24G2Illustration
