// SEAMO-18-A-Q7 — "Find the missing figure below."
//
// A 3×3 matrix where each cell is a square containing small circle-dots
// arranged in different positions. The bottom-middle cell is missing (?).
//
// Dot arrangements observed from the original paper images:
//   Row 1: [TR,BL] (2)  | [TR,C,BL] (3)   | [TL,TR,BL,BR] (4 corners)
//   Row 2: [TL,TR,BL,BR](4)| [C] (1)        | [TL,TR,C,BL,BR] (5)
//   Row 3: [TL,ML,BL,TR,MR,BR] (6)| [?]    | [3×3 grid] (9)
//
// The missing answer is B = 4 corners [TL,TR,BL,BR].
//
// Co-exports SEAMO18A7Option for CHOICE_RENDERERS (options A–D).
// Default export is the stem illustration (the 3×3 matrix with ?).
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Dot layout definitions
// ---------------------------------------------------------------------------

// Each cell is a unit square [0,0]→[1,1].
// Dot positions as fractions: TL=(.2,.2) TR=(.8,.2) BL=(.2,.8) BR=(.8,.8)
// ML=(.2,.5) MR=(.8,.5) C=(.5,.5)
// Grid positions: rows of 3 columns at (.2,.5,.8) each row (.2,.5,.8)

type DotPos = [number, number]  // [x, y] in unit coords

// Named positions (unit square 0→1)
const TL: DotPos = [0.2, 0.2]
const TR: DotPos = [0.8, 0.2]
const BL: DotPos = [0.2, 0.8]
const BR: DotPos = [0.8, 0.8]
const C: DotPos  = [0.5, 0.5]
const ML: DotPos = [0.2, 0.5]
const MR: DotPos = [0.8, 0.5]
// 3×3 grid positions
const G11: DotPos = [0.2, 0.2]
const G12: DotPos = [0.5, 0.2]
const G13: DotPos = [0.8, 0.2]
const G21: DotPos = [0.2, 0.5]
const G22: DotPos = [0.5, 0.5]
const G23: DotPos = [0.8, 0.5]
const G31: DotPos = [0.2, 0.8]
const G32: DotPos = [0.5, 0.8]
const G33: DotPos = [0.8, 0.8]

// ---------------------------------------------------------------------------
// The 3×3 matrix content
// Each entry is either an array of dots or null for the missing cell
// ---------------------------------------------------------------------------

const MATRIX_DOTS: (DotPos[] | null)[][] = [
  // Row 1
  [
    [TR, BL],           // 2 dots: diagonal
    [TR, C, BL],        // 3 dots: staircase diagonal
    [TL, TR, BL, BR],   // 4 dots: corners
  ],
  // Row 2
  [
    [TL, TR, BL, BR],         // 4 dots: corners
    [C],                      // 1 dot: center
    [TL, TR, C, BL, BR],      // 5 dots: 4 corners + center
  ],
  // Row 3
  [
    [TL, ML, BL, TR, MR, BR], // 6 dots: 2 columns × 3 rows
    null,                     // MISSING (?)
    [G11, G12, G13, G21, G22, G23, G31, G32, G33], // 9 dots: 3×3 grid
  ],
]

// Option arrangements for A–E choices
// Answer key: B (from SEAMO 2018 Paper A answer sheet)
const OPTION_DOTS: Record<string, DotPos[]> = {
  A: [TR, C, BL],          // 3 diagonal dots
  B: [TL, TR, BL, BR],     // 4 corner dots — CORRECT ANSWER
  C: [TL, TR, C, BL, BR],  // 5 dots: 4 corners + center
  D: [TL, ML, BL, TR, MR, BR], // 6 dots: 2 columns
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: box with 3 dots arranged diagonally.',
    id: 'Pilihan A: kotak dengan 3 titik diagonal.',
  },
  B: {
    en: 'Option B: box with 4 dots at the corners.',
    id: 'Pilihan B: kotak dengan 4 titik di setiap sudut.',
  },
  C: {
    en: 'Option C: box with 5 dots (four corners and centre).',
    id: 'Pilihan C: kotak dengan 5 titik (empat sudut dan tengah).',
  },
  D: {
    en: 'Option D: box with 6 dots in two columns of three.',
    id: 'Pilihan D: kotak dengan 6 titik dalam dua kolom tiga.',
  },
}

// ---------------------------------------------------------------------------
// DotCell — renders a bordered square with dots
// ---------------------------------------------------------------------------

interface DotCellProps {
  dots: DotPos[] | null   // null → render "?" label
  size: number            // cell px size
  isMissing?: boolean     // draws a question mark instead
  fontSize?: number
}

function DotCell({ dots, size, isMissing = false, fontSize = 16 }: DotCellProps) {
  const r = size * 0.065   // dot radius proportional to cell
  const stroke = '#222'
  const fill = '#222'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1 1"
      style={{ display: 'block', border: '1.5px solid #333', boxSizing: 'border-box' }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="1" height="1" fill="#fff" />
      {isMissing || dots === null ? (
        <text
          x="0.5"
          y="0.62"
          textAnchor="middle"
          fontSize={fontSize / size}
          fill={stroke}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ?
        </text>
      ) : (
        dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={0.01} />
        ))
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// DotBox — a standalone SVG-only version (for option renderer — no DOM border)
// ---------------------------------------------------------------------------

interface DotBoxProps {
  dots: DotPos[]
  size: number
}

function DotBox({ dots, size }: DotBoxProps) {
  const r = size * 0.065
  const stroke = '#222'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1 1"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <rect x="0.02" y="0.02" width="0.96" height="0.96" fill="#fff" stroke="#333" strokeWidth={0.04} />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={stroke} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — the 3×3 matrix with a "?" in the missing cell
// ---------------------------------------------------------------------------

const CELL = 72   // px per cell in the stem

/**
 * DotMatrix18A7Illustration — the 3×3 dot-matrix pattern with the
 * bottom-middle cell showing "?". Used as the stem figure for SEAMO-18-A-Q7.
 */
export default function DotMatrix18A7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A 3 by 3 matrix of squares each containing small dots in different arrangements. ' +
        'The bottom-middle square is missing and shows a question mark.'
      }
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${CELL}px)`, gap: 6 }}
        aria-hidden="true"
      >
        {MATRIX_DOTS.flatMap((row, r) =>
          row.map((dots, c) => (
            <DotCell
              key={`${r}-${c}`}
              dots={dots}
              size={CELL}
              isMissing={dots === null}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE A/B/C/D choice box
// ---------------------------------------------------------------------------

/**
 * SEAMO18A7Option — renders one A/B/C/D choice as a bordered square with dots.
 * Registered in CHOICE_RENDERERS for SEAMO-18-A-Q7.
 */
export function SEAMO18A7Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const dots = OPTION_DOTS[k]
  const aria = OPTION_ARIA[k]

  if (!dots) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <DotBox dots={dots} size={72} />
    </span>
  )
}
