// WMI-24F3A-Q22 (2024 Grade 3 Final).
// Six number cards 1, 1, 2, 2, 3, 3 lie face-down behind six labelled cards
// arranged in a 2x3 grid:  A B C  /  D E F.
//
// Four players each flip two cards; the one who flips a matching pair WINS:
//   Ava   -> A=2, E=3   (Lose)
//   Bella -> A, C       (Lose)
//   Cindy -> A, F       (Lose)
//   Donna -> C, D       (Win)
// Deducing: A=2, E=3, then C=D=1 (Donna's win, C!=2 from Bella), then F!=2 from
// Cindy gives F=3, B=2. The 6-digit number ABCDEF = 221133 (fill-in).
//
// The default export draws ONLY the six lettered cards face-down — no digit
// values, no win/lose marks, no answer. The `CardLayout24G3` primitive is
// co-exported so the post-answer animator can reveal the hidden digit on any
// card and tint players' picks. SOLUTION + POSITIONS are co-exported so the
// step-explainer binds to the same values.
//
// Pure render, SSR-safe, deterministic — no random, no dates, no effects.

export const POSITIONS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
export type Position = (typeof POSITIONS)[number]

// The hidden digit behind each lettered card (answer — NEVER drawn statically).
export const SOLUTION: Record<Position, number> = {
  A: 2,
  B: 2,
  C: 1,
  D: 1,
  E: 3,
  F: 3,
}
// ABCDEF = 221133
export const ANSWER = POSITIONS.map((p) => SOLUTION[p]).join('')

// --- palette (qupu-* tokens via raw hex, per the card reference) -------------
const INK = '#1F2937' // qupu ink / slate
const CREAM = '#FFF6E0' // qupu-cream card face (matches the scan's yellow card)
const CREAM_EDGE = '#E4C97A' // warm border on the card face
const ORANGE = '#F2912B' // qupu-brand-orange
const ORANGE_DK = '#C56A12'
const ORANGE_FILL = 'rgba(242,145,43,0.16)'
const BLUE = '#2D7FB8' // qupu-brand-blue
const BLUE_DK = '#1E5C86'
const BLUE_FILL = 'rgba(45,127,184,0.14)'

// --- layout ------------------------------------------------------------------
const CARD_W = 64
const CARD_H = 84
const COL_GAP = 18
const ROW_GAP = 18
const PAD_X = 16
const PAD_TOP = 16
const PAD_BOTTOM = 16
const COLS = 3
const ROWS = 2

const GRID_W = COLS * CARD_W + (COLS - 1) * COL_GAP
const GRID_H = ROWS * CARD_H + (ROWS - 1) * ROW_GAP
export const CL_VIEW_W = PAD_X * 2 + GRID_W
export const CL_VIEW_H = PAD_TOP + GRID_H + PAD_BOTTOM

/** Top-left corner of the card at grid index i (0..5), row-major A B C / D E F. */
export function cardXY(i: number): { x: number; y: number } {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  return {
    x: PAD_X + col * (CARD_W + COL_GAP),
    y: PAD_TOP + row * (CARD_H + ROW_GAP),
  }
}

type Tone = 'pick-blue' | 'pick-orange' | null

/**
 * One lettered card. By default it shows its position letter (A..F). When
 * `reveal` is set the hidden digit replaces the letter (animator reveal only).
 * `tone` tints the card for a player's pick.
 */
function LetterCard({
  letter,
  x,
  y,
  reveal,
  tone,
  faded,
}: {
  letter: Position
  x: number
  y: number
  reveal?: number | null
  tone: Tone
  faded: boolean
}) {
  let stroke = CREAM_EDGE
  let fill = CREAM
  let textColor = INK
  let strokeW = 2.5
  if (tone === 'pick-blue') {
    stroke = BLUE
    fill = BLUE_FILL
    textColor = BLUE_DK
    strokeW = 3.5
  } else if (tone === 'pick-orange') {
    stroke = ORANGE
    fill = ORANGE_FILL
    textColor = ORANGE_DK
    strokeW = 3.5
  }
  const opacity = faded ? 0.4 : 1
  const shown = reveal != null ? String(reveal) : letter
  return (
    <g opacity={opacity}>
      {/* card face */}
      <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={6} fill={fill} stroke={stroke} strokeWidth={strokeW} />
      {/* inner hairline frame, reads as a printed card border */}
      <rect
        x={x + 5}
        y={y + 5}
        width={CARD_W - 10}
        height={CARD_H - 10}
        rx={3}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        opacity={0.45}
      />
      <text
        x={x + CARD_W / 2}
        y={y + CARD_H / 2 + 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={38}
        fontStyle={reveal == null ? 'italic' : 'normal'}
        fontWeight={700}
        fill={textColor}
      >
        {shown}
      </text>
    </g>
  )
}

export interface CardLayout24G3Props {
  /** Position letters whose hidden digit should be revealed (animator only). */
  reveal?: Position[]
  /** Position letters to tint blue (e.g. one player's pick). */
  pickBlue?: Position[]
  /** Position letters to tint orange (e.g. another player's pick). */
  pickOrange?: Position[]
}

/**
 * Primitive for the animator. Default render (no props) = six face-down
 * lettered cards A..F. Props let the post-answer animator reveal digits and
 * tint players' picks; nothing here is shown in the static figure.
 */
export function CardLayout24G3({ reveal, pickBlue, pickOrange }: CardLayout24G3Props = {}) {
  const revealSet = new Set(reveal ?? [])
  const blueSet = new Set(pickBlue ?? [])
  const orangeSet = new Set(pickOrange ?? [])
  const anyPick = blueSet.size > 0 || orangeSet.size > 0

  const toneFor = (p: Position): Tone => {
    if (blueSet.has(p)) return 'pick-blue'
    if (orangeSet.has(p)) return 'pick-orange'
    return null
  }

  return (
    <svg
      viewBox={`0 0 ${CL_VIEW_W} ${CL_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {POSITIONS.map((letter, i) => {
        const { x, y } = cardXY(i)
        const tone = toneFor(letter)
        const faded = anyPick && tone === null
        const rev = revealSet.has(letter) ? SOLUTION[letter] : null
        return <LetterCard key={letter} letter={letter} x={x} y={y} reveal={rev} tone={tone} faded={faded} />
      })}
    </svg>
  )
}

export default function CardLayout24G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Enam kartu angka terbalik di belakang enam kartu berlabel A, B, C di baris atas dan D, E, F di baris bawah."
    >
      <CardLayout24G3 />
    </div>
  )
}
