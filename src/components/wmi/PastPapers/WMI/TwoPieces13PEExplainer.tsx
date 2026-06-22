/**
 * IKMC-21-PE-Q13 — post-answer explainer: puzzle-piece fitting.
 *
 * Animates checking each option A–E against the two Z-shaped pieces, then
 * shows how the pieces fit into figure A (the answer).
 *
 * Beat sequence (from twoPieces13PESteps):
 *   0  pieces   — show both Z-pieces.
 *   1  count    — count: 4 + 4 = 8 squares.
 *   2  reject_B — B has 9 squares → eliminated.
 *   3  check_C  — C cannot be tiled → eliminated.
 *   4  check_D  — D cannot be tiled → eliminated.
 *   5  check_E  — E cannot be tiled → eliminated.
 *   6  fit1     — slide piece 1 into A.
 *   7  fit2     — turn piece 2 around and fill.
 *   8  answer   — result: A!
 *
 * Reuses PolyShape and exported cell constants from TwoPieces13PEIllustration.
 * Pure SVG animation. No random, no Date, SSR-safe.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import type { Cell } from './TwoPieces13PEIllustration'
import {
  PolyShape,
  PIECE_CELLS,
  PIECE_FILL_1,
  PIECE_FILL_2,
  ANSWER_A_CELLS,
  FIT_PIECE1_CELLS,
  FIT_PIECE2_CELLS,
  OPTION_CELLS,
} from './TwoPieces13PEIllustration'
import type { TwoPieces13Stage } from './twoPieces13PESteps'
import { buildTwoPieces13PESteps } from './twoPieces13PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const RED       = '#EF4444'
const INK       = '#1F2937'
const GREY_DASH = '#94A3B8'

const VIEW_W = 320
const VIEW_H = 180
const CELL   = 34

// ── Scene helpers ─────────────────────────────────────────────────────────────

/** Both pieces side by side with optional square-count labels. */
function PiecesScene({ showCounts }: { showCounts: boolean }) {
  const cell = 26
  const pieceW = 3 * cell
  const pieceH = 2 * cell
  const gap = 40
  const x0 = (VIEW_W - (pieceW * 2 + gap)) / 2
  const y0 = showCounts ? 24 : (VIEW_H - pieceH) / 2

  return (
    <g>
      <PolyShape cells={PIECE_CELLS} x={x0} y={y0} cell={cell} />
      <text
        x={x0 + pieceW + gap / 2}
        y={y0 + pieceH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        fontWeight={900}
        fill={INK}
      >
        +
      </text>
      <PolyShape cells={PIECE_CELLS} x={x0 + pieceW + gap} y={y0} cell={cell} />
      {showCounts && (
        <>
          <text x={x0 + pieceW / 2} y={y0 + pieceH + 20} textAnchor="middle" fontSize={16} fontWeight={900} fill={INK}>
            4
          </text>
          <text x={x0 + pieceW + gap + pieceW / 2} y={y0 + pieceH + 20} textAnchor="middle" fontSize={16} fontWeight={900} fill={INK}>
            4
          </text>
          <text x={VIEW_W / 2} y={y0 + pieceH + 46} textAnchor="middle" fontSize={17} fontWeight={900} fill="#2563EB">
            4 + 4 = 8
          </text>
        </>
      )}
    </g>
  )
}

/** A grid shape with dashed outlines and an optional red cross-out. */
function RejectScene({ cells, label }: { cells: Cell[]; label: string }) {
  const cell = 28
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  const w = cols * cell
  const h = rows * cell
  const x0 = (VIEW_W - w) / 2
  const y0 = (VIEW_H - h) / 2 - 12

  return (
    <g>
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={x0 + c * cell}
          y={y0 + r * cell}
          width={cell}
          height={cell}
          fill="#FFFFFF"
          stroke={GREY_DASH}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}
      <line x1={x0 - 8} y1={y0 - 8} x2={x0 + w + 8} y2={y0 + h + 8} stroke={RED} strokeWidth={4} strokeLinecap="round" />
      <line x1={x0 + w + 8} y1={y0 - 8} x2={x0 - 8} y2={y0 + h + 8} stroke={RED} strokeWidth={4} strokeLinecap="round" />
      <text x={VIEW_W / 2} y={y0 + h + 30} textAnchor="middle" fontSize={14} fontWeight={900} fill={RED}>
        {label}
      </text>
    </g>
  )
}

/** Option A with pieces being slotted in, one at a time. */
function FitScene({ showPiece1, showPiece2, showAnswer }: {
  showPiece1: boolean
  showPiece2: boolean
  showAnswer: boolean
}) {
  const w = 3 * CELL
  const h = 3 * CELL
  const x0 = (VIEW_W - w) / 2
  const y0 = (VIEW_H - h) / 2 - 8

  return (
    <g>
      {ANSWER_A_CELLS.map(([r, c], i) => (
        <rect
          key={i}
          x={x0 + c * CELL}
          y={y0 + r * CELL}
          width={CELL}
          height={CELL}
          fill="#FFFFFF"
          stroke={GREY_DASH}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}
      {showPiece1 && (
        <PolyShape cells={FIT_PIECE1_CELLS} x={x0} y={y0} cell={CELL} solidFill={PIECE_FILL_1} />
      )}
      {showPiece2 && (
        <PolyShape cells={FIT_PIECE2_CELLS} x={x0} y={y0} cell={CELL} solidFill={PIECE_FILL_2} />
      )}
      {showAnswer && (
        <text
          x={x0 + w + 22}
          y={y0 + h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fontWeight={900}
          fill={GREEN}
        >
          A
        </text>
      )}
    </g>
  )
}

function Scene({ stage }: { stage: TwoPieces13Stage }) {
  switch (stage) {
    case 'pieces':  return <PiecesScene showCounts={false} />
    case 'count':   return <PiecesScene showCounts={true} />
    case 'reject_B': return <RejectScene cells={OPTION_CELLS.B} label="B: 9 ≠ 8" />
    case 'check_C':  return <RejectScene cells={OPTION_CELLS.C} label="C: Z-pieces don't fit" />
    case 'check_D':  return <RejectScene cells={OPTION_CELLS.D} label="D: Z-pieces don't fit" />
    case 'check_E':  return <RejectScene cells={OPTION_CELLS.E} label="E: Z-pieces don't fit" />
    case 'fit1':    return <FitScene showPiece1={true}  showPiece2={false} showAnswer={false} />
    case 'fit2':    return <FitScene showPiece1={true}  showPiece2={true}  showAnswer={false} />
    case 'answer':  return <FitScene showPiece1={true}  showPiece2={true}  showAnswer={true}  />
    default:        return <PiecesScene showCounts={false} />
  }
}

// ── Main Explainer ─────────────────────────────────────────────────────────────

export default function TwoPieces13PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTwoPieces13PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dua potongan Z (4 + 4 = 8 kotak) diputar dan digeser hingga membentuk gambar A — 3×3 tanpa sudut kanan atas.'
      : 'Explainer: two Z-pieces (4 + 4 = 8 squares) slide and turn to fill figure A — 3×3 minus the top-right corner.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <Scene stage={beat.stage} />
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
