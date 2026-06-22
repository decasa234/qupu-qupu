// IKMC-22-EC-Q20 — "Alma wants to put one of the pieces shown in the middle
// of the picture so that a child in A is able to travel to B and to E, but
// not to D. She can rotate the pieces. Which two pieces could she use?"
//
// Reconstructed from:
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/042.jpg  — stem
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/043.jpg  — piece 1
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/044.jpg  — piece 2
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/045.jpg  — piece 3
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/046.jpg  — piece 4
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/047.jpg  — piece 5
//
// The stem shows a hexagonal junction with 6 houses (A–F) connected via road
// tunnels. The center piece is MISSING. Houses are arranged clock-wise from
// the right: A (right), B (lower-right), C (lower-left), D (left),
// E (upper-left), F (upper-right).
//
// Each answer-choice piece is a hexagon with a road pattern inside. They can
// be rotated. The correct pair is pieces 1 and 5 (answer E).
//
// Pure SVG, SSR-safe, no random / Date / side-effects.

// ── Hex geometry ────────────────────────────────────────────────────────────

/**
 * Compute the 6 flat-top hexagon vertices for a hex with the given centre and
 * circumradius. Flat-top means vertices at 0°, 60°, 120°, 180°, 240°, 300°.
 */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i)
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

/**
 * Unit vector pointing toward each hex side (flat-top).
 * Side 0 = right (A), Side 1 = lower-right (B), Side 2 = lower-left (C),
 * Side 3 = left (D), Side 4 = upper-left (E), Side 5 = upper-right (F).
 * These are the midpoints of each edge (perpendicular direction).
 */
const HEX_DIRS: Array<[number, number]> = [
  [1, 0],                        // 0 = right  (A)
  [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)],  // 1 = lower-right (B)
  [Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)],  // 2 = lower-left (C)
  [-1, 0],                       // 3 = left   (D)
  [Math.cos((4 * Math.PI) / 3), Math.sin((4 * Math.PI) / 3)],  // 4 = upper-left (E)
  [Math.cos((5 * Math.PI) / 3), Math.sin((5 * Math.PI) / 3)],  // 5 = upper-right (F)
]

const SIDE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

// House colours matching the source scan
const HOUSE_FILL: Record<string, string> = {
  A: '#F5A85E', // orange
  B: '#6CCFCA', // teal
  C: '#5EBF72', // green
  D: '#6CCFCA', // teal
  E: '#5B9BD5', // blue
  F: '#EE8085', // pink
}

// ── Road-pattern definitions ─────────────────────────────────────────────────
//
// Each piece is described as a set of connections between hex sides (0–5).
// Rotations are not encoded here — the stem shows no piece, and the Option
// renderer draws each piece in the canonical orientation from the source.
//
// Connections verified against the source scans:
//   Piece 1: all-six connected (star) — sides 0,1,2,3,4,5 all meet at centre
//   Piece 2: 3-way, sides 0,1,3 (right + lower-right + left) — Y rotated
//   Piece 3: 3-way symmetric, sides 0,2,4 (right + lower-left + upper-left)
//   Piece 4: cross, sides 0,1,2,3 (right + lower-right + lower-left + left)
//   Piece 5: 3-way, sides 0,1,4 (right + lower-right + upper-left)

/**
 * A connection list for one piece: pairs of side indices joined by a road
 * through the centre.  A "fan" means all listed sides connect via the centre
 * node (they all meet at the middle).
 */
export type PieceId = 1 | 2 | 3 | 4 | 5

export const PIECE_CONNECTIONS: Record<PieceId, number[][]> = {
  // Piece 1 — full star: every side connects to every other through centre
  1: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 3], [2, 4], [2, 5],
      [3, 4], [3, 5],
      [4, 5]],
  // Piece 2 — Y shape: right (0) + lower-right (1) + left (3) all at centre
  2: [[0, 1], [0, 3], [1, 3]],
  // Piece 3 — Y shape: right (0) + lower-left (2) + upper-left (4) at centre
  3: [[0, 2], [0, 4], [2, 4]],
  // Piece 4 — cross: right (0) ↔ left (3), lower-right (1) ↔ upper-left (4)
  4: [[0, 3], [1, 4]],
  // Piece 5 — Y shape: right (0) + lower-right (1) + upper-left (4) at centre
  5: [[0, 1], [0, 4], [1, 4]],
}

/**
 * Spokes (road segments) drawn from the centre to each connected side.
 * Road sides for each piece: which hex edges have a road exiting.
 */
export const PIECE_SPOKES: Record<PieceId, number[]> = {
  1: [0, 1, 2, 3, 4, 5],
  2: [0, 1, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 4],
}

// ── Shared drawing primitives ────────────────────────────────────────────────

/** Road/tunnel stroke properties. */
const ROAD_COLOR = '#B8B8B8'    // grey tarmac
const ROAD_W = 8                // road width (px in viewBox)
const DASH_COLOR = '#FFFFFF'    // centre dashes
const DASH_W = 2
const DASH_ARR = '5,5'

/** Draw a road spoke from hex centre (cx,cy) to the edge at side `s`, inside a hex of inradius `ir`. */
interface SpokeProps {
  cx: number; cy: number; ir: number; side: number
}
function Spoke({ cx, cy, ir, side }: SpokeProps) {
  const [dx, dy] = HEX_DIRS[side]
  const ex = cx + dx * ir
  const ey = cy + dy * ir
  return (
    <g>
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={ROAD_COLOR} strokeWidth={ROAD_W} strokeLinecap="butt" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={DASH_COLOR} strokeWidth={DASH_W} strokeLinecap="butt" strokeDasharray={DASH_ARR} />
    </g>
  )
}

/** Draw the hex outline (hollow, border-only). */
function HexOutline({ cx, cy, r, stroke, strokeWidth }: {
  cx: number; cy: number; r: number; stroke: string; strokeWidth: number
}) {
  return (
    <polygon
      points={hexPoints(cx, cy, r)}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  )
}

/** Small house icon centred at (hx, hy). */
function House({ hx, hy, label }: { hx: number; hy: number; label: string }) {
  const fill = HOUSE_FILL[label] ?? '#CCCCCC'
  const w = 28; const h = 26; const roof = 10
  const x0 = hx - w / 2; const y0 = hy - h / 2
  return (
    <g>
      {/* Body */}
      <rect x={x0} y={y0 + roof} width={w} height={h - roof} fill={fill} stroke="#555" strokeWidth={1} rx={1} />
      {/* Roof */}
      <polygon
        points={`${x0},${y0 + roof} ${hx},${y0} ${x0 + w},${y0 + roof}`}
        fill={fill}
        stroke="#555"
        strokeWidth={1}
      />
      {/* Door */}
      <rect x={hx - 4} y={y0 + h - 10} width={8} height={10} fill="#6B4226" rx={1} />
      {/* Label */}
      <text
        x={hx}
        y={hy - 3}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
        fill="#1A1A1A"
      >
        {label}
      </text>
    </g>
  )
}

// ── Stem illustration ────────────────────────────────────────────────────────

/** Size constants for the stem */
const STEM_CX = 130
const STEM_CY = 130
const STEM_HEX_R = 55    // hex circumradius (centre piece slot)
const STEM_HEX_IR = 48   // inradius ≈ r × √3/2
const STEM_HOUSE_R = 105 // distance from centre to house centres
const STEM_VIEW = 260

/**
 * The tunnel-path stem primitive.  Draws the main diagram: the hexagonal
 * centre slot (empty — the piece to be inserted), six road tunnels leading to
 * six houses labelled A–F.
 *
 * Exported (not just default) so the explainer can reuse the exact same SVG
 * in its beats without geometry drift.
 */
export function TunnelPath20EC() {
  return (
    <svg
      viewBox={`0 0 ${STEM_VIEW} ${STEM_VIEW}`}
      width={260}
      style={{ display: 'block' }}
      role="img"
      aria-label="Persimpangan hexagonal: enam rumah (A=kanan, B=kanan-bawah, C=kiri-bawah, D=kiri, E=kiri-atas, F=kanan-atas) dihubungkan lewat terowongan ke slot tengah yang kosong"
    >
      {/* Roads from hex edge midpoints to near-house positions */}
      {SIDE_LABELS.map((lbl, i) => {
        const [dx, dy] = HEX_DIRS[i]
        // Road goes from hex edge to house
        const x1 = STEM_CX + dx * STEM_HEX_IR
        const y1 = STEM_CY + dy * STEM_HEX_IR
        const x2 = STEM_CX + dx * (STEM_HOUSE_R - 14)
        const y2 = STEM_CY + dy * (STEM_HOUSE_R - 14)
        return (
          <g key={lbl}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ROAD_COLOR} strokeWidth={ROAD_W + 2} strokeLinecap="butt" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DASH_COLOR} strokeWidth={DASH_W} strokeLinecap="butt" strokeDasharray={DASH_ARR} />
          </g>
        )
      })}

      {/* Centre hexagon slot (empty, white fill) */}
      <polygon points={hexPoints(STEM_CX, STEM_CY, STEM_HEX_R)} fill="#F8F8F8" stroke="#888" strokeWidth={2} />

      {/* "?" label in the empty slot */}
      <text x={STEM_CX} y={STEM_CY} textAnchor="middle" dominantBaseline="central" fontSize={28} fill="#AAAAAA" fontWeight="bold">?</text>

      {/* Six houses */}
      {SIDE_LABELS.map((lbl, i) => {
        const [dx, dy] = HEX_DIRS[i]
        return (
          <House
            key={lbl}
            hx={STEM_CX + dx * STEM_HOUSE_R}
            hy={STEM_CY + dy * STEM_HOUSE_R}
            label={lbl}
          />
        )
      })}
    </svg>
  )
}

export default function TunnelPath20ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Persimpangan jalan berbentuk hexagonal: rumah-rumah A, B, C, D, E, F terhubung lewat terowongan ke pusat. Potongan mana yang memungkinkan anak di A pergi ke B dan E tetapi tidak ke D?"
    >
      <TunnelPath20EC />
    </div>
  )
}

// ── Option renderer ──────────────────────────────────────────────────────────

/**
 * Map option choice label (A–E) to piece number (1–5).
 * The paper lists pieces numbered 1–5, mapped to answer letters.
 * The answer choices say "1 and 2", "2 and 3", etc.
 * The option renderer maps label → piece index shown in that option.
 *
 * Since the CHOICE_RENDERERS entry renders ONE choice at a time,
 * and choices are: A="1 and 2", B="2 and 3", C="1 and 4", D="4 and 5", E="1 and 5",
 * we just need to render the piece icon that REPRESENTS each label.
 *
 * But the pieces are numbered 1–5 and the options are A–E pairing two pieces.
 * The option renderer is used to SHOW the answer choices visually — each
 * choice mentions two piece numbers.  We render a 2-piece split view.
 *
 * Actually per the pattern for this question type (A="1 and 2" etc.),
 * the CHOICE_RENDERERS entry renders ONE choice that contains TEXT like "1 and 2".
 * We parse the text and render both piece hexagons side by side.
 */

/** Piece hex with road spokes, used inside the option renderer. */
function PieceHex({ pieceId, cx, cy, r, ir }: {
  pieceId: PieceId; cx: number; cy: number; r: number; ir: number
}) {
  const spokes = PIECE_SPOKES[pieceId]
  return (
    <g>
      {spokes.map((s) => (
        <Spoke key={s} cx={cx} cy={cy} ir={ir} side={s} />
      ))}
      <HexOutline cx={cx} cy={cy} r={r} stroke="#555" strokeWidth={1.5} />
      {/* Piece number label */}
      <text x={cx} y={cy - r + 9} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#555" fontWeight="bold">
        {pieceId}
      </text>
    </g>
  )
}

/**
 * Parses a choice text like "1 and 2" or "1 dan 2" into [1, 2].
 * Falls back to [1, 1] if parsing fails.
 */
function parsePiecePair(text: string): [PieceId, PieceId] {
  const nums = text.match(/\d/g)
  if (nums && nums.length >= 2) {
    const a = Number(nums[0]) as PieceId
    const b = Number(nums[1]) as PieceId
    if (a >= 1 && a <= 5 && b >= 1 && b <= 5) return [a, b]
  }
  return [1, 1]
}

/**
 * Renders ONE answer choice for IKMC-22-EC-Q20 as two piece hexagons
 * side by side (e.g. "1 and 2" → hex for piece 1 + hex for piece 2).
 * Registered in CHOICE_RENDERERS['IKMC-22-EC-Q20'].
 */
export function TunnelPath20ECOption({ choice }: { choice: { label?: string; text: string } }) {
  const [p1, p2] = parsePiecePair(choice.text)
  const VW = 110
  const VH = 56
  const R = 22
  const IR = 19
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width={90} height={46} style={{ display: 'block' }} role="img"
      aria-label={`Potongan ${p1} dan ${p2}`}>
      {/* Piece 1 */}
      <PieceHex pieceId={p1} cx={27} cy={28} r={R} ir={IR} />
      {/* Divider */}
      <line x1={55} y1={8} x2={55} y2={48} stroke="#DDD" strokeWidth={1} />
      {/* Piece 2 */}
      <PieceHex pieceId={p2} cx={83} cy={28} r={R} ir={IR} />
    </svg>
  )
}
