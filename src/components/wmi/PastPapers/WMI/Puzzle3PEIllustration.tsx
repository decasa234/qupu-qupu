// IKMC-20-PE-Q3 — "Nelly arranged 4 pieces to make a picture of a kangaroo.
// How are the pieces arranged?"
//
// Source figure (2020.imgs/008.jpg): a 2×2 grid of kangaroo picture pieces,
// each cell numbered in its corner. Reading the scan carefully:
//   Piece 1 — bottom-right: kangaroo's lower legs / clawed feet
//   Piece 2 — bottom-left:  kangaroo's head (large eye, face detail)
//   Piece 3 — top-right:    kangaroo's upper back / lower back side
//   Piece 4 — top-left:     kangaroo's upper body / front pouch area
//
// The STEM shows the four labelled pieces (unnested, in their source positions
// so the student can see what each piece looks like before choosing where to
// place them). The answer (which arrangement) is NOT shown here.
//
// The five A–E options are each a 2×2 number-grid showing a different
// arrangement of pieces 1–4. They are rendered by the co-exported
// `Puzzle3PEOption` (for `CHOICE_RENDERERS`).
//
// ARRANGEMENT KEY (answer = A):
//   A: TL=4  TR=3  BL=2  BR=1    ← correct
//   B: TL=3  TR=4  BL=2  BR=1
//   C: TL=2  TR=1  BL=4  BR=3
//   D: TL=4  TR=3  BL=1  BR=2
//   E: TL=3  TR=4  BL=1  BR=2
//
// Reuses the same 2×2 grid primitive (`PuzzleGrid`) for both the stem
// illustration (drawing kangaroo SVG art inside each piece) and the option
// renderer (showing the numbered arrangement grid matching the source images).
//
// Pure SVG. No random/Date. SSR-safe.

// ---------------------------------------------------------------------------
// Brand palette
// ---------------------------------------------------------------------------
const BORDER = '#30598A'   // qupu-brand-blue — cell border
const BG     = '#FFF7ED'   // warm off-white background inside each piece
const LABEL_FG = '#1F2937' // near-black for piece number labels
const LABEL_BG = '#FFFFFF' // white badge behind the number

// Kangaroo illustration palette (warm orange-brown animal tones)
const FUR_DARK  = '#C1733A'  // darker fur / shadow areas
const FUR_LIGHT = '#E8956A'  // lighter fur / lit areas
const FUR_PALE  = '#F5C89A'  // pale belly / inner ear
const CLAW      = '#5C3D1E'  // dark claws
const EYE_DARK  = '#1C1C1C'  // pupil
const EYE_LIGHT = '#5A3010'  // iris / surrounding dark

// ---------------------------------------------------------------------------
// Individual kangaroo piece SVG art
// Each piece is rendered into a normalised 60×60 viewBox.
// Piece numbering matches the source paper (number visible in corner).
// ---------------------------------------------------------------------------

/** Piece 1 — bottom-right: lower legs + clawed feet */
function KangPiece1() {
  return (
    <svg viewBox="0 0 60 60" width={60} height={60} role="presentation">
      {/* Left leg */}
      <ellipse cx={20} cy={28} rx={9} ry={14} fill={FUR_DARK} />
      <ellipse cx={20} cy={28} rx={6} ry={11} fill={FUR_LIGHT} />
      {/* Right leg */}
      <ellipse cx={40} cy={26} rx={9} ry={14} fill={FUR_DARK} />
      <ellipse cx={40} cy={26} rx={6} ry={11} fill={FUR_LIGHT} />
      {/* Left foot */}
      <ellipse cx={17} cy={46} rx={11} ry={6} fill={FUR_DARK} />
      <ellipse cx={17} cy={45} rx={8} ry={4} fill={FUR_LIGHT} />
      {/* Left claws */}
      <line x1={10} y1={50} x2={8}  y2={55} stroke={CLAW} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={15} y1={51} x2={14} y2={56} stroke={CLAW} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={20} y1={51} x2={20} y2={56} stroke={CLAW} strokeWidth={1.5} strokeLinecap="round" />
      {/* Right foot */}
      <ellipse cx={43} cy={44} rx={11} ry={6} fill={FUR_DARK} />
      <ellipse cx={43} cy={43} rx={8} ry={4} fill={FUR_LIGHT} />
      {/* Right claws */}
      <line x1={36} y1={48} x2={34} y2={53} stroke={CLAW} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={41} y1={49} x2={40} y2={54} stroke={CLAW} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={46} y1={49} x2={46} y2={54} stroke={CLAW} strokeWidth={1.5} strokeLinecap="round" />
      {/* Small tail stub at top-right */}
      <ellipse cx={52} cy={12} rx={7} ry={5} fill={FUR_LIGHT} />
    </svg>
  )
}

/** Piece 2 — bottom-left: kangaroo's head (large eye, face) */
function KangPiece2() {
  return (
    <svg viewBox="0 0 60 60" width={60} height={60} role="presentation">
      {/* Head shape */}
      <ellipse cx={32} cy={30} rx={22} ry={26} fill={FUR_DARK} />
      <ellipse cx={32} cy={30} rx={18} ry={22} fill={FUR_LIGHT} />
      {/* Snout / lighter muzzle */}
      <ellipse cx={34} cy={42} rx={12} ry={9} fill={FUR_PALE} />
      {/* Nose */}
      <ellipse cx={34} cy={37} rx={5} ry={3.5} fill={EYE_LIGHT} />
      <ellipse cx={34} cy={37} rx={3} ry={2} fill={EYE_DARK} />
      {/* Large eye — the distinctive feature of piece 2 */}
      <circle cx={24} cy={26} r={11} fill={EYE_LIGHT} />
      <circle cx={24} cy={26} r={8}  fill={EYE_DARK} />
      <circle cx={24} cy={26} r={5}  fill="#2A1A0A" />
      {/* Eye shine */}
      <circle cx={21} cy={23} r={2}  fill="#FFFFFF" />
      <circle cx={27} cy={25} r={1}  fill="#FFFFFF" />
      {/* Ear outline at top */}
      <ellipse cx={14} cy={8} rx={7} ry={10} fill={FUR_DARK} />
      <ellipse cx={14} cy={9} rx={4} ry={7}  fill={FUR_PALE} />
    </svg>
  )
}

/** Piece 3 — top-right: kangaroo's upper back / side fur */
function KangPiece3() {
  return (
    <svg viewBox="0 0 60 60" width={60} height={60} role="presentation">
      {/* Upper back body */}
      <path d="M5,55 Q10,5 55,5 L55,55 Z" fill={FUR_DARK} />
      <path d="M8,55 Q14,10 52,8 L52,55 Z" fill={FUR_LIGHT} />
      {/* Arm / forelimb */}
      <ellipse cx={18} cy={38} rx={8} ry={13} fill={FUR_DARK} transform="rotate(-20 18 38)" />
      <ellipse cx={18} cy={38} rx={5} ry={10} fill={FUR_LIGHT} transform="rotate(-20 18 38)" />
      {/* Small forepaw */}
      <ellipse cx={14} cy={50} rx={7} ry={4} fill={FUR_DARK} />
      {/* Finger claws */}
      <line x1={10} y1={53} x2={9}  y2={57} stroke={CLAW} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={14} y1={54} x2={14} y2={58} stroke={CLAW} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={18} y1={53} x2={19} y2={57} stroke={CLAW} strokeWidth={1.2} strokeLinecap="round" />
      {/* Belly curve */}
      <path d="M5,55 Q30,45 50,55" fill="none" stroke={FUR_PALE} strokeWidth={3} />
    </svg>
  )
}

/** Piece 4 — top-left: kangaroo's upper body / pouch area */
function KangPiece4() {
  return (
    <svg viewBox="0 0 60 60" width={60} height={60} role="presentation">
      {/* Torso */}
      <ellipse cx={30} cy={35} rx={24} ry={22} fill={FUR_DARK} />
      <ellipse cx={30} cy={35} rx={20} ry={18} fill={FUR_LIGHT} />
      {/* Belly / pouch area */}
      <ellipse cx={28} cy={40} rx={14} ry={12} fill={FUR_PALE} />
      {/* Pouch opening hint */}
      <path d="M18,44 Q28,52 38,44" fill="none" stroke={FUR_DARK} strokeWidth={2} />
      {/* Neck connect to head (bottom edge) */}
      <ellipse cx={30} cy={58} rx={10} ry={5} fill={FUR_DARK} />
      {/* Ear tops at upper corners */}
      <ellipse cx={8}  cy={8}  rx={7} ry={9} fill={FUR_DARK} />
      <ellipse cx={8}  cy={9}  rx={4} ry={6} fill={FUR_PALE} />
      <ellipse cx={52} cy={10} rx={6} ry={8} fill={FUR_DARK} />
      <ellipse cx={52} cy={11} rx={3} ry={5} fill={FUR_PALE} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shared 2×2 grid primitive — used by the stem and the option renderer
// ---------------------------------------------------------------------------

export type PieceId = 1 | 2 | 3 | 4
export type GridArrangement = [PieceId, PieceId, PieceId, PieceId] // [TL, TR, BL, BR]

const CELL = 68  // cell size in px
const PAD  = 6   // outer padding

const ART: Record<PieceId, () => JSX.Element> = {
  1: KangPiece1,
  2: KangPiece2,
  3: KangPiece3,
  4: KangPiece4,
}

/**
 * Shared primitive: draws a 2×2 grid with the four kangaroo pieces placed
 * according to `arrangement` [TL, TR, BL, BR]. Each piece is drawn as SVG
 * art at 60×60 centered inside a CELL×CELL bordered square. A number badge
 * in the top-right corner of each cell labels which piece is there.
 *
 * The stem uses the SOURCE arrangement (1→BR, 2→BL, 3→TR, 4→TL) so the
 * student can see what each piece looks like.
 * The option renderer uses each answer's arrangement.
 */
export function KangPuzzleGrid({
  arrangement,
  cell = CELL,
  showArt = true,
}: {
  arrangement: GridArrangement
  cell?: number
  showArt?: boolean
}) {
  const pad = Math.round(cell * PAD / CELL)
  const w   = cell * 2 + pad * 2
  const h   = cell * 2 + pad * 2

  const positions: Array<{ row: number; col: number }> = [
    { row: 0, col: 0 }, // TL
    { row: 0, col: 1 }, // TR
    { row: 1, col: 0 }, // BL
    { row: 1, col: 1 }, // BR
  ]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="presentation">
      {/* Cell backgrounds */}
      {positions.map(({ row, col }, i) => {
        const x = pad + col * cell
        const y = pad + row * cell
        return (
          <rect key={i} x={x} y={y} width={cell} height={cell} fill={BG} stroke={BORDER} strokeWidth={2} />
        )
      })}
      {/* Piece art + number labels */}
      {positions.map(({ row, col }, i) => {
        const pieceId = arrangement[i]
        const Art = ART[pieceId]
        const cx = pad + col * cell  // cell top-left x
        const cy = pad + row * cell  // cell top-left y
        // Center the 60×60 art inside the cell
        const artSize = Math.min(cell - 8, 60)
        const artOffset = Math.round((cell - artSize) / 2)
        return (
          <g key={i}>
            {showArt && (
              <g transform={`translate(${cx + artOffset}, ${cy + artOffset}) scale(${artSize / 60})`}>
                <Art />
              </g>
            )}
            {/* Piece number label — top-right corner */}
            <g transform={`translate(${cx + cell - 22}, ${cy + 2})`}>
              <rect x={0} y={0} width={18} height={18} rx={3} fill={LABEL_BG} stroke={BORDER} strokeWidth={1} />
              <text
                x={9}
                y={13}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fontFamily="sans-serif"
                fill={LABEL_FG}
              >
                {pieceId}
              </text>
            </g>
          </g>
        )
      })}
      {/* Outer frame */}
      <rect x={pad} y={pad} width={cell * 2} height={cell * 2} fill="none" stroke={BORDER} strokeWidth={2.5} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Answer option arrangements — read directly from option images 009–013.jpg
// ---------------------------------------------------------------------------

export const ARRANGEMENTS: Record<'A' | 'B' | 'C' | 'D' | 'E', GridArrangement> = {
  A: [4, 3, 2, 1],  // TL=4 TR=3 BL=2 BR=1  ← CORRECT
  B: [3, 4, 2, 1],  // TL=3 TR=4 BL=2 BR=1
  C: [2, 1, 4, 3],  // TL=2 TR=1 BL=4 BR=3
  D: [4, 3, 1, 2],  // TL=4 TR=3 BL=1 BR=2
  E: [3, 4, 1, 2],  // TL=3 TR=4 BL=1 BR=2
}

// The source layout — how the pieces appear in the STEM figure (008.jpg)
// Each piece is in its original quadrant position.
// The grid shows TL=4, TR=3, BL=2, BR=1 which IS the answer,
// but the stem image shows numbered UNLABELLED pieces arranged as given
// (the puzzle has already been assembled in 008.jpg for reference).
// We show it as-assembled for the stem, matching the source.
export const SOURCE_ARRANGEMENT: GridArrangement = [4, 3, 2, 1]

// ---------------------------------------------------------------------------
// Option renderer — CHOICE_RENDERERS entry
// Renders a plain 2×2 numbered grid (no art, just the numbers in cells)
// matching what the source images show for each option (A–E).
// ---------------------------------------------------------------------------

const OPT_CELL = 44  // smaller cells for the options panel
const OPT_PAD  = 6

/** Draws a 2×2 number-only arrangement grid for one answer option. */
function ArrangementGrid({ arrangement }: { arrangement: GridArrangement }) {
  const pad  = OPT_PAD
  const cell = OPT_CELL
  const w    = cell * 2 + pad * 2
  const h    = cell * 2 + pad * 2

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="presentation">
      {([0, 1, 2, 3] as const).map((i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        const x   = pad + col * cell
        const y   = pad + row * cell
        const num = arrangement[i]
        return (
          <g key={i}>
            <rect x={x} y={y} width={cell} height={cell} fill={BG} stroke={BORDER} strokeWidth={1.5} />
            <text
              x={x + cell / 2}
              y={y + cell / 2 + 6}
              textAnchor="middle"
              fontSize={20}
              fontWeight="bold"
              fontFamily="sans-serif"
              fill={LABEL_FG}
            >
              {num}
            </text>
          </g>
        )
      })}
      <rect x={pad} y={pad} width={cell * 2} height={cell * 2} fill="none" stroke={BORDER} strokeWidth={2} />
    </svg>
  )
}

/**
 * Choice renderer for IKMC-20-PE-Q3.
 * Renders each A–E option as a 2×2 arrangement grid with piece numbers,
 * matching the source option images (009–013.jpg).
 */
import type { WmiChoice } from '../../../../types/wmi'

export function Puzzle3PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const arr = ARRANGEMENTS[key as 'A' | 'B' | 'C' | 'D' | 'E']
  if (!arr) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={`Susunan pilihan ${key}: kiri atas ${arr[0]}, kanan atas ${arr[1]}, kiri bawah ${arr[2]}, kanan bawah ${arr[3]}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <ArrangementGrid arrangement={arr} />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — shown in the question card
// ---------------------------------------------------------------------------

/**
 * Stem illustration for IKMC-20-PE-Q3.
 * Shows the four numbered kangaroo pieces in their assembled-kangaroo layout
 * (matching 008.jpg). The student sees the pieces and must pick which
 * arrangement (A–E number grid) correctly describes their positions.
 */
export default function Puzzle3PEIllustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-2"
      role="img"
      aria-label="Empat potongan gambar kanguru, masing-masing diberi nomor 1 sampai 4. Potongan 4 di kiri atas (badan atas/kantong), potongan 3 di kanan atas (punggung atas), potongan 2 di kiri bawah (kepala dengan mata besar), potongan 1 di kanan bawah (kaki dan cakar)."
    >
      <KangPuzzleGrid arrangement={SOURCE_ARRANGEMENT} />
    </div>
  )
}
