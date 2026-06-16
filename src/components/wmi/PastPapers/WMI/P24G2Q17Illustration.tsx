// "Cut the cake fairly" figure for WMI-24P2A-Q17 (2024 Grade 2 Semifinal, Paper A).
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g2-a-q17.jpg: a square "cake"
// with a dotted inner diamond joining the four edge midpoints. The diamond plus
// the two diagonals of that diamond mark the dotted cut lines. Five numbers sit
// in the regions:
//   8  top-left      22 top-right
//   16 bottom-left    9 bottom-right
//   5  centre (inside the diamond)
//
// Total = 8 + 22 + 16 + 9 + 5 = 60, so a fair cut must put 30 on each piece
// (answer E). The static figure shows ONLY the cake and its numbers — never
// which dotted line is the correct cut.

const CAKE = '#FFF7CC'
const EDGE = '#3A352B'
const DOT = '#B7AE93'
const INK = '#3A352B'

export const Q17_NUMBERS = { tl: 8, tr: 22, bl: 16, br: 9, mid: 5 }
export const Q17_TOTAL = Q17_NUMBERS.tl + Q17_NUMBERS.tr + Q17_NUMBERS.bl + Q17_NUMBERS.br + Q17_NUMBERS.mid // 60
export const Q17_HALF = Q17_TOTAL / 2 // 30

// Square geometry (a centred 200×200 cake inside a 260×260 viewBox with headroom).
export const Q17_VIEW = 260
const PAD = 30
const S = Q17_VIEW - 2 * PAD // 200
const L = PAD // left/top edge
const R = PAD + S // right/bottom edge
const M = PAD + S / 2 // midline

// Edge midpoints (the diamond's corners).
const TOPm = { x: M, y: L }
const RGTm = { x: R, y: M }
const BOTm = { x: M, y: R }
const LFTm = { x: L, y: M }

export interface CakeProps {
  /** Optional region highlight: 'a' tints {tl,tr}, 'b' tints {bl,br,mid}. */
  shade?: 'none' | 'a' | 'b'
  /** Draw the correct dotted cut (diamond edges separating the two halves). */
  showCut?: boolean
}

/**
 * The numbered square cake with its dotted diamond guide lines.
 * `shade` tints the two fair-cut groups; `showCut` thickens the cut path.
 */
export function CakeSquare({ shade = 'none', showCut = false }: CakeProps) {
  const tintA = shade === 'a' ? '#FDE68A' : 'transparent'
  const tintB = shade === 'b' ? '#BBF7D0' : 'transparent'
  return (
    <svg viewBox={`0 0 ${Q17_VIEW} ${Q17_VIEW}`} width="100%" style={{ maxWidth: 260, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* fair-cut group tints (drawn under the cake outline) */}
      {shade === 'a' && (
        // {tl, tr} = the top band above the dotted diagonal TOPm→? — shown as the
        // triangle {top-left + top-right corners}: corners (L,L)-(R,L) with the
        // two side midpoints.
        <polygon points={`${L},${L} ${R},${L} ${RGTm.x},${RGTm.y} ${M},${M} ${LFTm.x},${LFTm.y}`} fill={tintA} />
      )}
      {shade === 'b' && (
        <polygon
          points={`${L},${R} ${R},${R} ${RGTm.x},${RGTm.y} ${M},${M} ${LFTm.x},${LFTm.y}`}
          fill={tintB}
        />
      )}

      {/* cake outline */}
      <rect x={L} y={L} width={S} height={S} rx={6} fill={shade === 'none' ? CAKE : 'transparent'} stroke={EDGE} strokeWidth={3} />

      {/* dotted diamond joining edge midpoints */}
      <polygon
        points={`${TOPm.x},${TOPm.y} ${RGTm.x},${RGTm.y} ${BOTm.x},${BOTm.y} ${LFTm.x},${LFTm.y}`}
        fill="none"
        stroke={DOT}
        strokeWidth={2}
        strokeDasharray="3 5"
        strokeLinejoin="round"
      />
      {/* dotted diagonals of the diamond (corner-to-corner of the inner diamond) */}
      <line x1={TOPm.x} y1={TOPm.y} x2={BOTm.x} y2={BOTm.y} stroke={DOT} strokeWidth={2} strokeDasharray="3 5" />
      <line x1={LFTm.x} y1={LFTm.y} x2={RGTm.x} y2={RGTm.y} stroke={DOT} strokeWidth={2} strokeDasharray="3 5" />

      {/* the correct cut: separate {tl,tr} from {bl,br,mid} along the dotted path
          LFTm → M(centre) → RGTm  (a "V" that puts the two top corners on one
          side and the rest on the other). */}
      {showCut && (
        <polyline
          points={`${LFTm.x},${LFTm.y} ${M},${M} ${RGTm.x},${RGTm.y}`}
          fill="none"
          stroke="#E11D48"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* numbers */}
      <text x={L + 28} y={L + 30} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
        {Q17_NUMBERS.tl}
      </text>
      <text x={R - 30} y={L + 30} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
        {Q17_NUMBERS.tr}
      </text>
      <text x={L + 30} y={R - 30} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
        {Q17_NUMBERS.bl}
      </text>
      <text x={R - 28} y={R - 30} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
        {Q17_NUMBERS.br}
      </text>
      <text x={M} y={M} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
        {Q17_NUMBERS.mid}
      </text>
    </svg>
  )
}

export default function P24G2Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A square cake with a dotted diamond joining the edge midpoints. The numbers 8 (top-left), 22 (top-right), 16 (bottom-left), 9 (bottom-right) sit in the corners and 5 is in the centre."
    >
      <CakeSquare />
    </div>
  )
}
