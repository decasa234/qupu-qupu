/**
 * IKMC-20-EC-Q8 — post-answer explainer.
 *
 * Animates the greedy "try from largest count downward" strategy:
 *   Beat 1 — introduce the 7 pieces and goal.
 *   Beat 2 — trial 7 pieces → sum 28 > 16 ✗
 *   Beat 3 — trial 6 pieces → sum 21 > 16 ✗
 *   Beat 4 — trial 5 pieces (1+2+3+4+6=16) → fits exactly ✓
 *   Beat 5 (result) — answer C = 5.
 *
 * Reuses StripTile and PIECE_SIZES from Pieces8ECIllustration.
 * Storyboard from buildPieces8ECSteps.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StripTile, TILE_FILL, TILE_STROKE } from './Pieces8ECIllustration'
import { buildPieces8ECSteps, WINNING_SIZES, type PieceBeat } from './pieces8ECSteps'

// ─── colour tokens ───────────────────────────────────────────────────────────

const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'
const RED_TXT   = '#991B1B'

// ─── strip grid preview ──────────────────────────────────────────────────────

/**
 * Shows the 1×16 target strip with the trial tiles placed from the left.
 * Tiles beyond the 16-cell limit are shown in red to make overflow visible.
 */
function StripPreview({
  trialSizes,
  fits,
}: {
  trialSizes: readonly number[]
  fits: boolean | null
}) {
  if (trialSizes.length === 0) return null

  const CELL_W = 14
  const CELL_H = 14
  const SKEW   = 4
  const GAP    = 3
  const LIMIT  = 16
  const PAD    = 6

  // place tiles from the left; accumulate positions
  const placements: { size: number; x: number; color: string }[] = []
  let cx = PAD
  let cumulative = 0
  for (const size of trialSizes) {
    const willOverflow = cumulative + size > LIMIT
    placements.push({
      size,
      x: cx,
      color: willOverflow ? RED : TILE_FILL,
    })
    cx += size * CELL_W + SKEW + GAP
    cumulative += size
  }

  // Background 16-cell ruler
  const rulerW = LIMIT * CELL_W + PAD * 2
  const svgW   = Math.max(cx + PAD, rulerW + PAD)
  const SVG_H  = CELL_H + PAD * 2 + 16 // extra for labels

  return (
    <svg
      viewBox={`0 0 ${svgW} ${SVG_H}`}
      width={Math.min(320, svgW)}
      role="presentation"
      style={{ overflow: 'visible' }}
    >
      {/* 16-cell ruler (light grey) */}
      {Array.from({ length: LIMIT }, (_, i) => (
        <rect
          key={`ruler-${i}`}
          x={PAD + i * CELL_W}
          y={PAD}
          width={CELL_W}
          height={CELL_H}
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth={0.5}
        />
      ))}
      {/* Tile strips */}
      {placements.map(({ size, x, color }, idx) => (
        <StripTile
          key={idx}
          n={size}
          x={x}
          y={PAD}
          cellW={CELL_W}
          cellH={CELL_H}
          skew={SKEW}
          fill={color}
          strokeWidth={1.2}
        />
      ))}
      {/* Sum label */}
      <text
        x={svgW / 2}
        y={SVG_H - 2}
        textAnchor="middle"
        fontSize={9}
        fill={fits === true ? GREEN : fits === false ? RED : BLUE}
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {`${trialSizes.join('+')} = ${trialSizes.reduce((a, b) => a + b, 0)}`}
        {fits === true ? ' ✓' : fits === false ? ' ✗' : ''}
      </text>
    </svg>
  )
}

// ─── piece row ───────────────────────────────────────────────────────────────

/**
 * Shows a horizontal row of strip tiles, highlighting the ones in `trialSizes`.
 * Tiles not in trial are dimmed.
 */
function PieceRow({
  trialSizes,
  result,
}: {
  trialSizes: readonly number[]
  result: boolean
}) {
  const ALL_SIZES = [1, 2, 3, 4, 5, 6, 7]
  const trialSet  = new Set(trialSizes)
  const winSet    = new Set<number>(result ? WINNING_SIZES : [])

  const CELL_W = 16
  const CELL_H = 12
  const SKEW   = 4
  const GAP    = 6
  const PAD    = 4

  // Compute total width
  let totalW = PAD
  ALL_SIZES.forEach((s) => { totalW += s * CELL_W + SKEW + GAP })
  totalW += PAD
  const SVG_H = CELL_H + PAD * 2 + 14

  let cx = PAD
  const placements: { size: number; x: number }[] = []
  ALL_SIZES.forEach((size) => {
    placements.push({ size, x: cx })
    cx += size * CELL_W + SKEW + GAP
  })

  return (
    <svg
      viewBox={`0 0 ${totalW} ${SVG_H}`}
      width={Math.min(340, totalW)}
      role="presentation"
      style={{ overflow: 'visible' }}
    >
      {placements.map(({ size, x }) => {
        const active  = trialSet.has(size) || winSet.has(size)
        const winning = winSet.has(size)
        const fill    = winning ? '#A7F3D0' : active ? TILE_FILL : '#F3F4F6'
        const stroke  = winning ? GREEN : active ? TILE_STROKE : '#D1D5DB'
        const opacity = active ? 1 : 0.4
        return (
          <g key={size} opacity={opacity}>
            <StripTile
              n={size}
              x={x}
              y={PAD}
              cellW={CELL_W}
              cellH={CELL_H}
              skew={SKEW}
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
            />
            <text
              x={x + (size * CELL_W + SKEW) / 2}
              y={PAD + CELL_H + 9}
              textAnchor="middle"
              fontSize={8}
              fill={winning ? GREEN_TXT : active ? BLUE : '#9CA3AF'}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {size}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── caption pill ────────────────────────────────────────────────────────────

function CaptionPill({ beat }: { beat: PieceBeat }) {
  let bg    = BLUE_BG
  let bdr   = BLUE
  let color = BLUE

  if (beat.result || beat.fits === true) {
    bg    = GREEN_BG
    bdr   = GREEN
    color = GREEN_TXT
  } else if (beat.fits === false) {
    bg    = RED_BG
    bdr   = RED
    color = RED_TXT
  }

  return (
    <div
      className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={{ background: bg, borderColor: bdr, color }}
    >
      {beat.caption}
    </div>
  )
}

// ─── main explainer ──────────────────────────────────────────────────────────

export default function Pieces8ECExplainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'en') as 'en' | 'id'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPieces8ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat: PieceBeat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: trying all 7 pieces gives sum 28 (too big). Trying 6 pieces gives sum 21 (still too big). Trying 5 pieces (1+2+3+4+6=16) fits exactly. Answer: 5 pieces.',
    'Penjelasan: mencoba 7 potongan memberi jumlah 28 (terlalu besar). Mencoba 6 potongan memberi jumlah 21 (masih terlalu besar). Mencoba 5 potongan (1+2+3+4+6=16) pas tepat. Jawaban: 5 potongan.',
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Header */}
        <div className="w-full rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Use as many DIFFERENT pieces as possible — sizes must sum to exactly 16.',
            'Gunakan POTONGAN BERBEDA sebanyak mungkin — ukurannya harus berjumlah tepat 16.',
          )}
        </div>

        {/* Piece row with active highlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`row-${beat.attempt}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
          >
            <PieceRow trialSizes={beat.trialSizes} result={beat.result} />
          </motion.div>
        </AnimatePresence>

        {/* Strip preview (only on trial beats) */}
        <AnimatePresence mode="wait">
          {beat.trialSizes.length > 0 && (
            <motion.div
              key={`strip-${beat.attempt}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <StripPreview trialSizes={beat.trialSizes} fits={beat.fits} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <CaptionPill beat={beat} />
      </div>
    </div>
  )
}
