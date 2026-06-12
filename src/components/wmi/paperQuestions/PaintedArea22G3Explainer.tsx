/**
 * WMI-22F3A-Q5 — Painted-area explainer.
 *
 * Teaches the π-parity strategy: two figures match painted area only when they
 * share the same number of unit quarter-circles AND the same straight-edge area.
 * Beats walk example → key idea → options A/B/C/D → answer D.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  PaintedGrid,
  EXAMPLE_GRID,
  OPTION_A_GRID,
  OPTION_B_GRID,
  OPTION_C_GRID,
  OPTION_D_GRID,
} from './PaintedArea22G3Illustration'
import type { Grid3x3 } from './PaintedArea22G3Illustration'
import { buildPaintedArea22G3Steps } from './paintedArea22G3Steps'
import type { OptionKey } from './paintedArea22G3Steps'

// ---------------------------------------------------------------------------
// Colour tokens (echo fill-qupu-* palette)
// ---------------------------------------------------------------------------
const ORANGE = '#ef8a2b'
const GREEN = '#10B981'
const RED = '#EF4444'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = GREEN
const GREEN_TEXT = '#065F46'
const RED_BG = '#FEE2E2'
const RED_BORDER = '#DC2626'
const RED_TEXT = '#991B1B'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function t(lang: 'en' | 'id', en: string, id: string): string {
  return lang === 'id' ? id : en
}

const OPTION_GRIDS: Record<NonNullable<OptionKey>, Grid3x3> = {
  A: OPTION_A_GRID,
  B: OPTION_B_GRID,
  C: OPTION_C_GRID,
  D: OPTION_D_GRID,
}

const OPTION_LABELS: Record<NonNullable<OptionKey>, string> = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface TupleTagProps {
  qcCount: number
  straightArea: number
  /** Whether to render the tag as a verdict badge vs a neutral info tag. */
  verdict: boolean | null
  lang: 'en' | 'id'
}

function TupleTag({ qcCount, straightArea, verdict, lang }: TupleTagProps) {
  const qcLabel = t(lang, 'quarter-circles', 'sep. lingkaran')
  const areaLabel = t(lang, 'straight area', 'luas lurus')

  let bg = BLUE_BG
  let border = BLUE_BORDER
  let color = BLUE_TEXT

  if (verdict === true) {
    bg = GREEN_BG
    border = GREEN_BORDER
    color = GREEN_TEXT
  } else if (verdict === false) {
    bg = RED_BG
    border = RED_BORDER
    color = RED_TEXT
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="rounded-lg border-2 px-3 py-1 text-center font-display text-xs font-bold"
      style={{ background: bg, borderColor: border, color }}
    >
      {qcCount} {qcLabel} · {areaLabel} {straightArea}
      {verdict === true && ' ✓'}
      {verdict === false && ' ✗'}
    </motion.div>
  )
}

interface GridPanelProps {
  label: string
  grid: Grid3x3
  verdict: boolean | null
  /** Whether this is the example (no verdict border). */
  isExample?: boolean
}

function GridPanel({ label, grid, verdict, isExample = false }: GridPanelProps) {
  let borderColor = '#d1d5db' // neutral gray
  if (!isExample) {
    if (verdict === true) borderColor = GREEN
    if (verdict === false) borderColor = RED
  }

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{
        borderRadius: 10,
        border: `2.5px solid ${borderColor}`,
        padding: '6px 8px',
        background: '#fff',
        minWidth: 80,
      }}
    >
      <span
        className="font-display text-xs font-bold"
        style={{ color: BLUE_TEXT }}
      >
        {label}
      </span>
      <PaintedGrid grid={grid} cellSize={28} pad={3} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function PaintedArea22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPaintedArea22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    lang,
    'Strategy: quarter-circle areas contain π (irrational), so two figures match only when they have the same number of quarter-circles and the same straight area. Option D is the only choice that shares (2 quarter-circles, straight area 2) with the example. Answer: D.',
    'Strategi: luas seperempat lingkaran mengandung π (irasional), jadi dua gambar cocok hanya jika memiliki jumlah seperempat lingkaran dan luas lurus yang sama. Pilihan D satu-satunya yang memiliki (2 sep. lingkaran, luas lurus 2) sama seperti contoh. Jawaban: D.',
  )

  // Caption box styling
  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
    : beat.option !== null && beat.verdict === false
      ? { background: RED_BG, borderColor: RED_BORDER, color: RED_TEXT }
      : beat.option !== null && beat.verdict === true
        ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
        : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }

  // Which grids to show
  const showExample = beat.option === null
  const activeOption = beat.option

  return (
    <div
      className="mx-auto w-full max-w-[340px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Top row: example always present; active option appears alongside */}
        <div className="flex items-start justify-center gap-4">
          {/* Example grid — always shown */}
          <div className="flex flex-col items-center gap-1">
            <GridPanel
              label={t(lang, 'Example', 'Contoh')}
              grid={EXAMPLE_GRID}
              verdict={null}
              isExample
            />
            {/* Show example tuple only on intro beats */}
            {showExample && (
              <motion.div
                key="example-tuple"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border-2 px-2 py-0.5 text-center font-display text-xs font-bold"
                style={{ background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }}
              >
                (2, 2)
              </motion.div>
            )}
          </div>

          {/* Active option grid */}
          <AnimatePresence mode="wait">
            {activeOption && (
              <motion.div
                key={activeOption}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex flex-col items-center gap-1"
              >
                <GridPanel
                  label={`${t(lang, 'Option', 'Pilihan')} ${OPTION_LABELS[activeOption]}`}
                  grid={OPTION_GRIDS[activeOption]}
                  verdict={beat.verdict}
                />
                {/* Tuple tag for the option */}
                {beat.option !== 'C' && (
                  <TupleTag
                    qcCount={beat.qcCount}
                    straightArea={beat.straightArea}
                    verdict={beat.verdict}
                    lang={lang}
                  />
                )}
                {/* For option C, show incompatibility label instead */}
                {beat.option === 'C' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border-2 px-2 py-1 text-center font-display text-xs font-bold"
                    style={{ background: RED_BG, borderColor: RED_BORDER, color: RED_TEXT }}
                  >
                    {t(lang, 'Large arc ≠ small arcs ✗', 'Busur besar ≠ busur kecil ✗')}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key-idea banner — shown on beat 1 only */}
        {index === 1 && (
          <motion.div
            key="key-idea"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full rounded-xl border-2 px-3 py-1.5 text-center font-display text-xs font-bold"
            style={{
              background: '#FFF7ED',
              borderColor: ORANGE,
              color: '#92400E',
            }}
          >
            {t(lang, 'π is irrational → match needs same arc count AND same straight area.', 'π irasional → cocok perlu jumlah busur SAMA dan luas lurus SAMA.')}
          </motion.div>
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
