/**
 * IKMC-21-PE-Q17 — post-answer explainer: which piece was not used?
 *
 * Shows the five piece options (A–E). Each beat highlights a piece to show
 * it CAN fit (or in D's case, CANNOT fit). Lands on: D was not used.
 *
 * Reuses PieceShape and CompletedSquare from SquarePieces17PEIllustration
 * so the animation reads as the same scene coming alive.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PIECES, CompletedSquare, type PieceDef } from './SquarePieces17PEIllustration'
import { buildSquarePieces17PESteps } from './squarePieces17PESteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE = '#2563EB'
const BLUE_BG = '#EFF6FF'
const BLUE_TEXT = '#1E40AF'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED = '#EF4444'
const RED_BG = '#FEE2E2'
const RED_TEXT = '#991B1B'
const ORANGE = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const ORANGE_TEXT = '#92400E'
const INK = '#1F2937'
const GRID_FILL = '#FFFBF5'

// ---------------------------------------------------------------------------
// Symbol kind type (matches Illustration)
// ---------------------------------------------------------------------------
type SymbolKind = 'star' | 'diamond' | 'square' | 'arrow'

/** Draws a symbol glyph centred at (cx, cy) within a cell of size `cs`. */
function CellSymbol({ cx, cy, kind, cs }: { cx: number; cy: number; kind: SymbolKind; cs: number }) {
  const r = cs * 0.3
  if (kind === 'star') {
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = (i * 72 - 90) * (Math.PI / 180)
      const b = (i * 72 - 90 + 36) * (Math.PI / 180)
      return [
        cx + r * Math.cos(a), cy + r * Math.sin(a),
        cx + r * 0.4 * Math.cos(b), cy + r * 0.4 * Math.sin(b),
      ]
    })
    const d =
      pts
        .flatMap(([ox, oy, ix, iy], i) =>
          i === 0
            ? [`M${ox.toFixed(1)},${oy.toFixed(1)}L${ix.toFixed(1)},${iy.toFixed(1)}`]
            : [`L${ox.toFixed(1)},${oy.toFixed(1)}L${ix.toFixed(1)},${iy.toFixed(1)}`],
        )
        .join('') + 'Z'
    return <path d={d} fill="#F59E0B" stroke="#B45309" strokeWidth={0.8} />
  }
  if (kind === 'diamond') {
    const hw = r * 0.85
    const hh = r
    const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
    return <polygon points={pts} fill="#60A5FA" stroke="#1D4ED8" strokeWidth={0.8} />
  }
  if (kind === 'square') {
    const s = r * 1.2
    return (
      <rect
        x={cx - s / 2}
        y={cy - s / 2}
        width={s}
        height={s}
        fill="#A3E635"
        stroke="#3F6212"
        strokeWidth={0.8}
      />
    )
  }
  if (kind === 'arrow') {
    const aw = r * 0.5
    const ah = r * 0.9
    const shaft = aw * 0.4
    return (
      <path
        d={[
          `M${cx},${cy + ah}`,
          `L${cx - aw},${cy}`,
          `L${cx - shaft},${cy}`,
          `L${cx - shaft},${cy - ah}`,
          `L${cx + shaft},${cy - ah}`,
          `L${cx + shaft},${cy}`,
          `L${cx + aw},${cy}`,
          'Z',
        ].join(' ')}
        fill="#F472B6"
        stroke="#9D174D"
        strokeWidth={0.8}
      />
    )
  }
  return null
}

// ---------------------------------------------------------------------------
// PiecePanel — one labelled piece with optional highlight
// ---------------------------------------------------------------------------

interface PiecePanelProps {
  piece: PieceDef
  state: 'idle' | 'active-ok' | 'active-missing' | 'answer'
}

function PiecePanel({ piece, state }: PiecePanelProps) {
  const rows = Math.max(...piece.cells.map(([r]) => r)) + 1
  const cols = Math.max(...piece.cells.map(([, c]) => c)) + 1
  const cs = 20

  let borderColor = '#D1D5DB'
  let bgColor = GRID_FILL
  let labelColor = INK
  let tagText = ''
  let tagBg = ''
  let tagColor = ''
  let tagBorder = ''

  if (state === 'active-ok') {
    borderColor = GREEN
    bgColor = GREEN_BG
    labelColor = GREEN_TEXT
    tagText = 'fits ✓'
    tagBg = GREEN_BG
    tagColor = GREEN_TEXT
    tagBorder = GREEN
  } else if (state === 'active-missing') {
    borderColor = ORANGE
    bgColor = ORANGE_BG
    labelColor = ORANGE_TEXT
    tagText = 'no space!'
    tagBg = ORANGE_BG
    tagColor = ORANGE_TEXT
    tagBorder = ORANGE
  } else if (state === 'answer') {
    borderColor = RED
    bgColor = RED_BG
    labelColor = RED_TEXT
    tagText = 'NOT used ✗'
    tagBg = RED_BG
    tagColor = RED_TEXT
    tagBorder = RED
  }

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: cols * cs + 12,
        transition: 'border-color 0.2s',
      }}
    >
      <svg
        viewBox={`-2 -2 ${cols * cs + 4} ${rows * cs + 4}`}
        width={cols * cs + 4}
        height={rows * cs + 4}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {piece.cells.map(([r, c], i) => {
          const x = c * cs
          const y = r * cs
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={cs}
                height={cs}
                fill={bgColor}
                stroke={borderColor}
                strokeWidth={state !== 'idle' ? 1.8 : 1.2}
                rx={2}
              />
              <CellSymbol cx={x + cs / 2} cy={y + cs / 2} kind={piece.symbols[i]} cs={cs} />
            </g>
          )
        })}
      </svg>

      {/* label */}
      <span
        className="font-display text-xs font-bold"
        style={{ color: labelColor }}
      >
        {piece.label}
      </span>

      {/* tag */}
      <AnimatePresence>
        {tagText && (
          <motion.div
            key={`tag-${piece.label}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display font-bold"
            style={{
              fontSize: 9,
              background: tagBg,
              color: tagColor,
              border: `1.5px solid ${tagBorder}`,
            }}
          >
            {tagText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function SquarePieces17PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSquarePieces17PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: RED_BG, borderColor: RED, color: RED_TEXT }
    : beat.phase === 'pieceD'
    ? { background: ORANGE_BG, borderColor: ORANGE, color: ORANGE_TEXT }
    : beat.phase === 'intro'
    ? { background: BLUE_BG, borderColor: BLUE, color: BLUE_TEXT }
    : { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Potongan A, B, C, E bisa mengisi persegi 4×4. Potongan D tidak bisa masuk karena tidak ada ruang tersisa — jawaban D.'
      : 'Explainer: Pieces A, B, C, E fill the 4×4 square. Piece D cannot fit because no space remains — answer D.'

  function getPieceState(label: string): 'idle' | 'active-ok' | 'active-missing' | 'answer' {
    if (!beat.highlighted.includes(label)) return 'idle'
    if (beat.result) return 'answer'
    if (beat.phase === 'pieceD') return 'active-missing'
    return 'active-ok'
  }

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Completed square — small, as context */}
        <div className="rounded-lg border border-gray-200 bg-white p-2">
          <svg
            viewBox={`0 0 ${28 * 4} ${28 * 4}`}
            width={28 * 4}
            height={28 * 4}
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <CompletedSquare cellSize={28} />
          </svg>
        </div>

        {/* Five piece panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {PIECES.map((piece) => (
            <PiecePanel
              key={piece.label}
              piece={piece}
              state={getPieceState(piece.label)}
            />
          ))}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{
                  background: isResult ? RED : beat.phase === 'pieceD' ? ORANGE : GREEN,
                }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
