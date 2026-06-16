// In-card figure for WMI-22P3A-Q22 (2022 WMI Semifinal Grade 3, Paper A, Q22).
//
// Reconstructed from db/seed/wmi/figures/2022-semifinal-g3-a-q22.jpg:
// a long horizontal row of red shape-tiles (rounded grey-blue tile behind each
// red glyph), with a dashed "?" box hiding ONE group of 4 shapes, then more
// tiles and "…". Below, an orange arrow points to 4 empty dashed answer slots.
//
// Visible glyphs read off the scan (S = square, P = pentagon):
//   before box (positions 1-3):  S  P  S
//   [ ? box hides positions 4-7 ]
//   after box  (positions 8-15): P  P  S  P  P  P  P  S        then  …
//
// The pattern is a GROWING run: squares separate runs of pentagons that grow by
// one each time —  S, P, S, PP, S, PPP, S, PPPP, S, …  So the hidden 4 shapes
// (positions 4-7) are  P P S P  → answer B. The static figure shows ONLY the
// problem (the visible row + the "?" + empty slots), never the filled answer.

export type Q22Shape = 'S' | 'P' // square | pentagon

// Full sequence, generated deterministically from the growing-run rule.
function buildSequence(n: number): Q22Shape[] {
  const seq: Q22Shape[] = ['S']
  let run = 1
  while (seq.length < n) {
    for (let i = 0; i < run && seq.length < n; i++) seq.push('P')
    if (seq.length < n) seq.push('S')
    run++
  }
  return seq.slice(0, n)
}

export const Q22_SEQUENCE: ReadonlyArray<Q22Shape> = buildSequence(15)
// Hidden positions 4-7 (0-indexed 3..6).
export const Q22_HIDDEN: ReadonlyArray<Q22Shape> = Q22_SEQUENCE.slice(3, 7) // P P S P
export const Q22_ANSWER = 'B'

const RED = '#C73A35'
const TILE = '#C6D4DE'      // grey-blue rounded tile behind each glyph
const DASH = '#3A3A3A'
const ORANGE = '#F08A1D'

// --- a single red shape glyph centred at (cx, cy) ----------------------------
export function Q22Glyph({ kind, cx, cy, r = 13 }: { kind: Q22Shape; cx: number; cy: number; r?: number }) {
  if (kind === 'S') {
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={2} fill={RED} />
  }
  // regular pentagon, flat-ish, point up
  const pts: string[] = []
  for (let i = 0; i < 5; i++) {
    const a = (-Math.PI / 2) + (i * 2 * Math.PI) / 5
    pts.push(`${(cx + r * 1.12 * Math.cos(a)).toFixed(2)},${(cy + r * 1.12 * Math.sin(a)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={RED} />
}

// --- a rounded tile holding one glyph ----------------------------------------
function Tile({ x, y, kind }: { x: number; y: number; kind: Q22Shape }) {
  return (
    <g>
      <rect x={x} y={y} width={TILE_W} height={TILE_W} rx={6} fill={TILE} />
      <Q22Glyph kind={kind} cx={x + TILE_W / 2} cy={y + TILE_W / 2} />
    </g>
  )
}

// --- geometry ----------------------------------------------------------------
const TILE_W = 38
const GAP = 6
const STEP = TILE_W + GAP
const ROW_Y = 14

// Layout: [tiles 1-3] [? box (4 wide)] [tiles 8-15] [ … ]
const PRE = 3          // tiles before the box
const HIDDEN = 4       // tiles inside the box
const POST = 8         // tiles after the box (positions 8-15)

const startX = 12
const preW = PRE * STEP
const boxW = HIDDEN * STEP - GAP
const postStartX = startX + preW + boxW + GAP

export const Q22_VIEW_W = postStartX + POST * STEP + 34
export const Q22_VIEW_H = 150

const boxX = startX + preW
const boxY = ROW_Y - 2
const boxH = TILE_W + 4

// Answer slots row (under the orange arrow), centred below the "?" box.
const slotW = 34
const slotGap = 6
const slotsTotal = HIDDEN * slotW + (HIDDEN - 1) * slotGap
const slotsX = boxX + boxW / 2 - slotsTotal / 2
const slotsY = 102

export interface Q22FigureProps {
  /** Reveal the hidden 4 shapes inside the "?" box and the answer slots. */
  revealHidden?: boolean
  /** Tint the answer slots (used on the result beat). */
  highlightSlots?: boolean
}

export function Q22Figure({ revealHidden = false, highlightSlots = false }: Q22FigureProps) {
  return (
    <svg
      viewBox={`0 0 ${Q22_VIEW_W} ${Q22_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* tiles before the box (positions 1-3) */}
      {Q22_SEQUENCE.slice(0, PRE).map((k, i) => (
        <Tile key={`pre${i}`} x={startX + i * STEP} y={ROW_Y} kind={k} />
      ))}

      {/* the "?" box (hidden group) */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={2} fill="#FFFFFF" stroke={DASH} strokeWidth={2} strokeDasharray="7 5" />
      {revealHidden ? (
        Q22_HIDDEN.map((k, i) => (
          <Tile key={`hid${i}`} x={boxX + 4 + i * STEP} y={ROW_Y} kind={k} />
        ))
      ) : (
        <text x={boxX + boxW / 2} y={boxY + boxH / 2} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={DASH}>
          ?
        </text>
      )}

      {/* tiles after the box (positions 8-15) */}
      {Q22_SEQUENCE.slice(PRE + HIDDEN, PRE + HIDDEN + POST).map((k, i) => (
        <Tile key={`post${i}`} x={postStartX + i * STEP} y={ROW_Y} kind={k} />
      ))}

      {/* trailing ellipsis */}
      <text x={postStartX + POST * STEP + 8} y={ROW_Y + TILE_W / 2} dominantBaseline="central" fontSize={22} fontWeight={900} fill={DASH}>
        …
      </text>

      {/* orange down-arrow from the box to the answer slots */}
      <g>
        <rect x={boxX + boxW / 2 - 6} y={boxY + boxH + 8} width={12} height={20} fill={ORANGE} />
        <polygon
          points={`${boxX + boxW / 2 - 14},${boxY + boxH + 28} ${boxX + boxW / 2 + 14},${boxY + boxH + 28} ${boxX + boxW / 2},${boxY + boxH + 44}`}
          fill={ORANGE}
        />
      </g>

      {/* the 4 answer slots */}
      {Array.from({ length: HIDDEN }).map((_, i) => {
        const x = slotsX + i * (slotW + slotGap)
        return (
          <g key={`slot${i}`}>
            <rect
              x={x}
              y={slotsY}
              width={slotW}
              height={slotW}
              rx={6}
              fill={highlightSlots ? '#D1FAE5' : '#FFFFFF'}
              stroke={highlightSlots ? '#10B981' : DASH}
              strokeWidth={2}
              strokeDasharray={highlightSlots ? undefined : '6 4'}
            />
            {revealHidden && <Q22Glyph kind={Q22_HIDDEN[i]} cx={x + slotW / 2} cy={slotsY + slotW / 2} />}
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G3Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A long row of red squares and pentagons in tiles. One group of four shapes is hidden behind a dashed question-mark box. An orange arrow points to four empty answer slots below. Find the four shapes that belong in the hidden box."
    >
      <Q22Figure />
    </div>
  )
}
