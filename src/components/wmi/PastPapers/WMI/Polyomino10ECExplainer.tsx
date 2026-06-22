/**
 * IKMC-19-EC-Q10 — post-answer explainer.
 *
 * Systematically removes each cell of the 5-cell source shape and checks
 * whether the resulting tetromino matches any of the five option shapes.
 * Three options (A, B, D) match → answer C = 3.
 *
 * Reuses StemShape, PolyShape, OPTION_CELLS, STEM_CELLS from
 * Polyomino10ECIllustration and the storyboard from polyomino10ECSteps.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StemShape,
  PolyShape,
  OPTION_CELLS,
  CELL_FILL,
  CELL_STROKE,
  HIT_FILL,
  MISS_FILL,
  MISS_STROKE,
  cellSpan,
  type Cell,
} from './Polyomino10ECIllustration'
import { buildPolyomino10ECSteps, type RemovalBeat } from './polyomino10ECSteps'

// ─── colour tokens ──────────────────────────────────────────────────────────

const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const AMBER = '#F59E0B'
const AMBER_BG = '#FFF7ED'
const AMBER_TEXT = '#92400E'

// ─── option mini-card ────────────────────────────────────────────────────────

/**
 * Shows one tetromino option (A–E) as a small card with a hit/miss verdict.
 * `state`: 'hit' = green, 'miss' = red, 'neutral' = blue.
 */
function OptionCard({ label, state }: { label: string; state: 'hit' | 'miss' | 'neutral' }) {
  const cells = OPTION_CELLS[label]
  if (!cells) return null
  const span = cellSpan(cells)
  const cell = 18
  const pad = 4
  const w = span.cols * cell + pad * 2
  const h = span.rows * cell + pad * 2

  const borderColor = state === 'hit' ? GREEN : state === 'miss' ? RED : BLUE
  const bg = state === 'hit' ? GREEN_BG : state === 'miss' ? RED_BG : BLUE_BG
  const textColor = state === 'hit' ? GREEN_TEXT : state === 'miss' ? '#991B1B' : BLUE
  const shapeFill = state === 'hit' ? HIT_FILL : state === 'miss' ? MISS_FILL : CELL_FILL
  const shapeStroke = state === 'miss' ? MISS_STROKE : CELL_STROKE

  return (
    <div
      className="flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-1.5"
      style={{ borderColor, background: bg }}
    >
      <span className="font-display text-xs font-black" style={{ color: textColor }}>
        {label} {state === 'hit' ? '✓' : state === 'miss' ? '✗' : ''}
      </span>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} role="presentation">
        <PolyShape
          cells={cells}
          x={pad}
          y={pad}
          cell={cell}
          fill={shapeFill}
          stroke={shapeStroke}
          strokeWidth={1.5}
        />
      </svg>
    </div>
  )
}

// ─── remaining shape mini-preview ───────────────────────────────────────────

/**
 * Shows the 4-cell shape that remains after a removal.
 * Drawn in brand colours so it reads as a new candidate tetromino.
 */
function RemainingShape({ remaining }: { remaining: Cell[] }) {
  const span = cellSpan(remaining)
  const cell = 28
  const pad = 6
  const w = span.cols * cell + pad * 2
  const h = span.rows * cell + pad * 2

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} role="presentation">
      <PolyShape
        cells={remaining}
        x={pad}
        y={pad}
        cell={cell}
        fill={CELL_FILL}
        stroke={CELL_STROKE}
        strokeWidth={2}
      />
    </svg>
  )
}

// ─── match-count badge ───────────────────────────────────────────────────────

function MatchBadge({ count, lang }: { count: number; lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return (
    <motion.div
      key={count}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="rounded-full px-3 py-0.5 font-display text-sm font-black text-white shadow"
      style={{ background: BLUE }}
    >
      {t(`${count} match${count === 1 ? '' : 'es'}`, `${count} cocok`)}
    </motion.div>
  )
}

// ─── main explainer ─────────────────────────────────────────────────────────

export default function Polyomino10ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPolyomino10ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat: RemovalBeat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : beat.disconnects
      ? { background: RED_BG, borderColor: RED, color: '#991B1B' }
      : beat.hit
        ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
        : beat.miss
          ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_TEXT }
          : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel = t(
    `Explainer: try removing each of the 5 cells. Removing the top-middle gives option A ✓, removing top-right gives option B ✓, removing bottom-left gives option D ✓. Removing bottom-right gives a J-shape not in the options. Removing the bottom-middle disconnects the shape. Total matches = 3, so the answer is C = 3.`,
    `Penjelasan: coba hapus masing-masing dari 5 kotak. Hapus atas-tengah → pilihan A ✓, hapus atas-kanan → pilihan B ✓, hapus bawah-kiri → pilihan D ✓. Hapus bawah-kanan → bentuk J yang tidak ada di pilihan. Hapus bawah-tengah → bentuk terputus. Total kecocokan = 3, jadi jawaban adalah C = 3.`,
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Intro banner */}
        <div className="w-full rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Remove 1 cell — which tetrominos (4-cell shapes) from the options can you get?',
            'Hapus 1 kotak — tetromino mana (bentuk 4 kotak) dari pilihan yang bisa didapat?',
          )}
        </div>

        {/* Source shape with removed cell faded */}
        <div className="relative flex items-center justify-center">
          <StemShape
            cell={36}
            pad={8}
            highlightCell={beat.removeCell}
            highlightColor={RED}
          />
          {beat.matchCount > 0 && (
            <div className="pointer-events-none absolute -top-2 right-0">
              <MatchBadge count={beat.matchCount} lang={lang} />
            </div>
          )}
        </div>

        {/* Remaining shape (after removal) */}
        <AnimatePresence mode="wait">
          {beat.remaining && beat.remaining.length > 0 && (
            <motion.div
              key={`rem-${beat.removeCell ? beat.removeCell.join('-') : 'none'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-display text-[0.65rem] font-bold text-gray-500">
                {t('Result:', 'Hasil:')}
              </span>
              <RemainingShape remaining={beat.remaining} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Option verdict cards — only show matched options (cumulative) */}
        {!beat.result && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['A', 'B', 'C', 'D', 'E'].map((label) => {
              // Show options that have been judged on or before this beat
              const stepsSoFar = story.steps.slice(0, index + 1)
              const matchedLabels = new Set(
                stepsSoFar.filter((s) => s.hit && s.matchesOption).map((s) => s.matchesOption!),
              )
              if (!matchedLabels.has(label)) return null
              return (
                <motion.div
                  key={`hit-${label}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <OptionCard label={label} state="hit" />
                </motion.div>
              )
            })}
          </div>
        )}

        {/* On the result beat, show all 5 options with their verdicts */}
        {beat.result && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['A', 'B', 'C', 'D', 'E'].map((label) => (
              <motion.div
                key={`final-${label}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20, delay: ['A', 'B', 'C', 'D', 'E'].indexOf(label) * 0.08 }}
              >
                <OptionCard
                  label={label}
                  state={['A', 'B', 'D'].includes(label) ? 'hit' : 'miss'}
                />
              </motion.div>
            ))}
          </div>
        )}

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
