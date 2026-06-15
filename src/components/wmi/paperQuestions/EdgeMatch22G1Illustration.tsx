// Edge-matching jigsaw for WMI-22F1A-Q25 (Grade 1).
//
// Source scans: wmiPastPaper/2022 WMI Final G01 Paper B/images/
//   board  = db40184234f35aa90f04aaa457ed76bb5260caae776fe7b3d31f49aefa213d0b.jpg
//   pieces = 523357385b71e3c07285355fe35e079b2771395f0add138c3d695926dd942329.jpg
//
// A 3×3 frame. The TOP row has pieces already placed; their bottom-edge bumps are
// the constraints for the cells directly below. The BOTTOM row has three empty
// cells labelled A, B, C that must be filled from seven candidate pieces. Each
// piece is a square with a coloured half-circle "notch" cut into each of its four
// edges (red, yellow, white-outline, striped/black, or a flat edge with none).
//
// RULE (from the paper): touching edges must carry the SAME colour, and pieces
// may be rotated (4 orientations). Two same-colour notches meet to form a full
// circle on the seam.
//
// SOLVER-VERIFIED (throwaway tsx brute force over 7 pieces × 4 rotations at A,B,C
// with seam + frame + the placed top-row constraints): the UNIQUE fit is
//   A = piece 7 (rotated 180°),  top notch Red
//   B = piece 2 (no rotation),   top notch Yellow
//   C = piece 5 (rotated 90° CW),top notch Yellow
// giving the 3-digit answer 725. Seams: A↔B yellow circle, B↔C white circle.
//
// This file draws ONLY the problem (placed top row + empty A/B/C + the 7 pieces);
// it never shows which piece goes where. The verified PIECES data, the SOLUTION,
// and an EdgeBoard primitive are co-exported so the animator can drop the answer
// pieces into A/B/C after the learner responds.

import type { JSX } from 'react'

// ---------------------------------------------------------------------------
// Verified data
// ---------------------------------------------------------------------------

/** Edge code: red / yellow / empty-flat / white-outline / striped-black. */
export type EdgeColor = 'red' | 'yellow' | 'empty' | 'outline' | 'striped'

/** The four edges of an unrotated piece (top, right, bottom, left). */
export interface PieceEdges {
  top: EdgeColor
  right: EdgeColor
  bottom: EdgeColor
  left: EdgeColor
}

/**
 * The seven candidate pieces, edges read from the scan as (top,right,bottom,left).
 * Verified by per-pixel colour sampling of the upscaled piece strip.
 */
export const PIECES: Record<number, PieceEdges> = {
  1: { top: 'striped', right: 'yellow', bottom: 'outline', left: 'red' },
  2: { top: 'yellow', right: 'outline', bottom: 'empty', left: 'yellow' },
  3: { top: 'striped', right: 'yellow', bottom: 'empty', left: 'yellow' },
  4: { top: 'outline', right: 'red', bottom: 'empty', left: 'yellow' },
  5: { top: 'empty', right: 'empty', bottom: 'outline', left: 'yellow' },
  6: { top: 'empty', right: 'empty', bottom: 'yellow', left: 'outline' },
  7: { top: 'empty', right: 'empty', bottom: 'red', left: 'yellow' },
}

/** A placement: which piece, and how many clockwise quarter-turns (0..3). */
export interface Placement {
  piece: number
  rot: number
}

/**
 * The solver-verified unique solution. `rot` = clockwise quarter-turns applied
 * to the piece as listed in PIECES.
 */
export const SOLUTION: { A: Placement; B: Placement; C: Placement } = {
  A: { piece: 7, rot: 2 },
  B: { piece: 2, rot: 0 },
  C: { piece: 5, rot: 1 },
}

/**
 * The placed top-row pieces' bottom-edge bumps — the constraints that sit
 * directly above cells A, B, C respectively. (Verified-consistent with the
 * unique solution above: A.top=red, B.top=yellow, C.top=yellow.)
 */
const TOP_ABOVE: [EdgeColor, EdgeColor, EdgeColor] = ['red', 'yellow', 'yellow']

/** Rotate a piece's edges clockwise by `rot` quarter-turns → (top,right,bottom,left). */
export function rotateEdges(p: PieceEdges, rot: number): PieceEdges {
  const seq: EdgeColor[] = [p.top, p.right, p.bottom, p.left]
  const r = ((rot % 4) + 4) % 4
  const out = [0, 1, 2, 3].map((i) => seq[(i - r + 4) % 4])
  return { top: out[0], right: out[1], bottom: out[2], left: out[3] }
}

// ---------------------------------------------------------------------------
// Palette — puzzle colours are problem semantics (not decorative). qupu tokens
// are used for the cell surface / ink where they exist.
// ---------------------------------------------------------------------------

const RED = '#E32129'
const YELLOW = '#FCD100'
const INK = '#1F2430' // dark outline
const CELL = '#FFFFFF' // cell interior (paper white)

function notchFill(c: EdgeColor): string {
  if (c === 'red') return RED
  if (c === 'yellow') return YELLOW
  return CELL // outline + empty + striped use a white interior (stripes drawn on top)
}

// ---------------------------------------------------------------------------
// Notch primitive — a half-circle cut into one edge of a cell, curving inward.
// `side`: which edge of the cell the notch sits on.
// ---------------------------------------------------------------------------

interface NotchProps {
  cx: number // cell top-left x
  cy: number // cell top-left y
  size: number // cell size
  side: 'top' | 'right' | 'bottom' | 'left'
  color: EdgeColor
  r?: number // notch radius
  keyPrefix: string
}

function Notch({ cx, cy, size, side, color, r = 13, keyPrefix }: NotchProps): JSX.Element | null {
  if (color === 'empty') return null

  // Midpoint of the chosen edge.
  let mx = cx + size / 2
  let my = cy + size / 2
  if (side === 'top') my = cy
  else if (side === 'bottom') my = cy + size
  else if (side === 'left') mx = cx
  else mx = cx + size

  // The flat side of the half-circle lies on the edge; the arc bulges inward.
  // Build the path: start at one end of the chord, arc to the other end.
  // sweep direction chosen so the bulge points into the cell.
  let d: string
  if (side === 'top') {
    d = `M ${mx - r} ${my} A ${r} ${r} 0 0 0 ${mx + r} ${my} Z`
  } else if (side === 'bottom') {
    d = `M ${mx - r} ${my} A ${r} ${r} 0 0 1 ${mx + r} ${my} Z`
  } else if (side === 'left') {
    d = `M ${mx} ${my - r} A ${r} ${r} 0 0 1 ${mx} ${my + r} Z`
  } else {
    d = `M ${mx} ${my - r} A ${r} ${r} 0 0 0 ${mx} ${my + r} Z`
  }

  const fill = notchFill(color)

  return (
    <g key={`${keyPrefix}-${side}`}>
      <path d={d} fill={fill} stroke={INK} strokeWidth={1.6} />
      {color === 'striped' && (
        // vertical black stripes inside the half-circle (clipped to the notch)
        <g clipPath={`url(#clip-${keyPrefix}-${side})`}>
          <defs>
            <clipPath id={`clip-${keyPrefix}-${side}`}>
              <path d={d} />
            </clipPath>
          </defs>
          {[-r * 0.55, -r * 0.18, r * 0.18, r * 0.55].map((off, i) => {
            // stripes run perpendicular to the edge
            if (side === 'top' || side === 'bottom') {
              return (
                <line
                  key={i}
                  x1={mx + off}
                  y1={my}
                  x2={mx + off}
                  y2={side === 'top' ? my + r : my - r}
                  stroke={INK}
                  strokeWidth={3}
                />
              )
            }
            return (
              <line
                key={i}
                x1={mx}
                y1={my + off}
                x2={side === 'left' ? mx + r : mx - r}
                y2={my + off}
                stroke={INK}
                strokeWidth={3}
              />
            )
          })}
        </g>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// One puzzle cell: a square with up to four notches, optionally a centre label.
// ---------------------------------------------------------------------------

interface CellProps {
  x: number
  y: number
  size: number
  edges?: PieceEdges
  label?: string
  labelColor?: string
  keyPrefix: string
  strong?: boolean // thicker frame border
}

function PuzzleCell({ x, y, size, edges, label, labelColor, keyPrefix, strong }: CellProps): JSX.Element {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={CELL}
        stroke={INK}
        strokeWidth={strong ? 3 : 2}
      />
      {edges && (
        <>
          <Notch cx={x} cy={y} size={size} side="top" color={edges.top} keyPrefix={keyPrefix} />
          <Notch cx={x} cy={y} size={size} side="right" color={edges.right} keyPrefix={keyPrefix} />
          <Notch cx={x} cy={y} size={size} side="bottom" color={edges.bottom} keyPrefix={keyPrefix} />
          <Notch cx={x} cy={y} size={size} side="left" color={edges.left} keyPrefix={keyPrefix} />
        </>
      )}
      {label && (
        <text
          x={x + size / 2}
          y={y + size / 2 + 9}
          textAnchor="middle"
          fontSize={26}
          fontWeight="bold"
          fill={labelColor ?? INK}
        >
          {label}
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// EdgeBoard primitive — draws the 3×3 board. The top row shows the placed
// pieces (their bottom bumps = the A/B/C constraints). The bottom row shows A/B/C,
// optionally filled with dropped-in pieces via `placed`.
// ---------------------------------------------------------------------------

const BOARD_CELL = 78
const BOARD_PAD = 10

/** Edges for a placed top-row cell whose bottom bump is `bottomColor`. */
function topRowEdges(bottomColor: EdgeColor): PieceEdges {
  return { top: 'empty', right: 'empty', bottom: bottomColor, left: 'empty' }
}

export function EdgeBoard({
  placed,
}: {
  placed?: Partial<Record<'A' | 'B' | 'C', { piece: number; rot: number }>>
}): JSX.Element {
  const size = BOARD_CELL
  const gridW = size * 3
  const gridH = size * 3
  const width = gridW + BOARD_PAD * 2
  const height = gridH + BOARD_PAD * 2
  const ox = BOARD_PAD
  const oy = BOARD_PAD

  const labels: ('A' | 'B' | 'C')[] = ['A', 'B', 'C']

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(240, width)} style={{ display: 'block' }}>
      {/* top row — placed pieces (only their bottom bumps matter as constraints) */}
      {[0, 1, 2].map((c) => (
        <PuzzleCell
          key={`top-${c}`}
          x={ox + c * size}
          y={oy}
          size={size}
          edges={topRowEdges(TOP_ABOVE[c])}
          keyPrefix={`top-${c}`}
        />
      ))}

      {/* middle row — empty cells */}
      {[0, 1, 2].map((c) => (
        <PuzzleCell key={`mid-${c}`} x={ox + c * size} y={oy + size} size={size} keyPrefix={`mid-${c}`} />
      ))}

      {/* bottom row — A / B / C, filled if a placement is given, else labelled */}
      {labels.map((lab, c) => {
        const place = placed?.[lab]
        const edges = place ? rotateEdges(PIECES[place.piece], place.rot) : undefined
        return (
          <PuzzleCell
            key={`abc-${lab}`}
            x={ox + c * size}
            y={oy + size * 2}
            size={size}
            edges={edges}
            label={edges ? undefined : lab}
            labelColor="#1F9E6B"
            keyPrefix={`abc-${lab}`}
          />
        )
      })}

      {/* outer frame border on top of everything */}
      <rect x={ox} y={oy} width={gridW} height={gridH} fill="none" stroke={INK} strokeWidth={3.5} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Candidate-pieces strip — the seven numbered pieces below the board.
// ---------------------------------------------------------------------------

function PiecesStrip(): JSX.Element {
  const size = 60
  const gap = 12
  const pad = 8
  const count = 7
  const stripW = pad * 2 + count * size + (count - 1) * gap
  const stripH = pad * 2 + size
  return (
    <svg viewBox={`0 0 ${stripW} ${stripH}`} width={Math.min(360, stripW)} style={{ display: 'block' }}>
      {Array.from({ length: count }, (_, i) => {
        const n = i + 1
        const x = pad + i * (size + gap)
        return (
          <PuzzleCell
            key={`piece-${n}`}
            x={x}
            y={pad}
            size={size}
            edges={PIECES[n]}
            label={String(n)}
            keyPrefix={`piece-${n}`}
          />
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// In-card illustration (default export) — board + candidate pieces, no answer.
// ---------------------------------------------------------------------------

/**
 * EdgeMatch22G1Illustration — in-card SVG for WMI-22F1A-Q25.
 *
 * Pure function — SSR-safe, no hooks, no random, no Date. Takes no params; the
 * board and pieces are fixed from the verified scan data.
 */
export default function EdgeMatch22G1Illustration(): JSX.Element {
  return (
    <div
      className="my-4 flex flex-col items-center gap-4"
      role="img"
      aria-label={
        'Teka-teki jigsaw 3×3. Baris atas sudah terisi: tonjolan setengah lingkaran berwarna ' +
        '(merah, kuning, kuning) menghadap ke bawah sebagai petunjuk untuk kotak A, B, C di baris ' +
        'bawah yang masih kosong. Di bawahnya ada tujuh potongan bernomor 1 sampai 7, masing-masing ' +
        'persegi dengan tonjolan berwarna pada keempat sisinya. Sisi yang bersentuhan harus berwarna ' +
        'sama, dan potongan boleh diputar. Pilih potongan untuk A, B, C lalu tulis nomornya dari kiri ' +
        'ke kanan menjadi bilangan tiga angka.'
      }
    >
      <EdgeBoard />
      <PiecesStrip />
    </div>
  )
}
