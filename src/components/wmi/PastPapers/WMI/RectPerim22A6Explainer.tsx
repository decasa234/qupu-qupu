// Post-answer animation for SEAMO-22-A-Q6.
//
// Question: Four figures each made of 6 small rectangles — which has the largest perimeter?
// Answer C: Figure 1 (1×6 single row) has the largest perimeter.
//
// Teaching walk:
//   0. intro     — all four figures side-by-side.
//   1. principle — more linear = more outer edges = larger perimeter.
//   2. fig1      — Figure 1 highlighted in amber (most spread-out).
//   3. fig4      — Figure 4 highlighted; same perimeter as Fig 1.
//   4. compact   — Fig 2 & 3 have smaller perimeters.
//   5. result    — Figure 1 → answer C.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Polyomino } from './primitives/Polyomino'
import {
  FIG1_CELLS,
  FIG2_CELLS,
  FIG3_CELLS,
  FIG4_CELLS,
  CELL,
  PAD,
} from './RectPerim22A6Illustration'
import { buildRectPerim22A6Steps } from './rectPerim22A6Steps'

// Colour tokens
const BRAND_BLUE = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_DARK = '#065F46'
const AMBER      = '#F59E0B'
const AMBER_BG   = '#FEF3C7'
const SHELL      = '#FFF9F4'
const PEACH      = '#FFD3B1'
const FILL_BASE  = '#EFF6FF'
const STROKE     = '#1E3A5F'

interface FigPanelProps {
  cells: [number, number][]
  label: string
  highlighted: boolean
  result: boolean
}

function AnimatedFigPanel({ cells, label, highlighted, result }: FigPanelProps) {
  const fill = result && highlighted
    ? '#D1FAE5'
    : highlighted
    ? AMBER_BG
    : FILL_BASE
  const stroke = result && highlighted
    ? GREEN
    : highlighted
    ? AMBER
    : STROKE
  const labelColor = result && highlighted
    ? GREEN_DARK
    : highlighted
    ? '#92400E'
    : '#374151'

  return (
    <motion.div
      animate={{ scale: highlighted ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      <Polyomino
        cells={cells}
        cellSize={CELL}
        pad={PAD}
        fill={fill}
        stroke={stroke}
        strokeWidth={highlighted ? 2 : 1.5}
        showGrid={true}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: highlighted ? 800 : 600,
          color: labelColor,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

function EquationChip({ text, result }: { text: string; result: boolean }) {
  if (!text) return null
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.25 }}
        style={{
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 800,
          color: result ? GREEN_DARK : BRAND_BLUE,
          background: result ? GREEN_BG : BLUE_BG,
          border: `1.5px solid ${result ? GREEN : BRAND_BLUE}`,
          borderRadius: 8,
          padding: '3px 14px',
          letterSpacing: '0.02em',
          textAlign: 'center',
        }}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  )
}

export default function RectPerim22A6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildRectPerim22A6Steps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Four figures of 6 small rectangles. Figure 1 single row has the largest perimeter — answer C.',
    'Empat gambar dari 6 persegi panjang kecil. Gambar 1 satu baris memiliki keliling terbesar — jawaban C.',
  )

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DARK }
    : { background: BLUE_BG, borderColor: BRAND_BLUE, color: BRAND_BLUE }

  const figLabels = [
    t('Figure 1', 'Gambar 1'),
    t('Figure 2', 'Gambar 2'),
    t('Figure 3', 'Gambar 3'),
    t('Figure 4', 'Gambar 4'),
  ]
  const figCells = [FIG1_CELLS, FIG2_CELLS, FIG3_CELLS, FIG4_CELLS]

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Four figures row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {figCells.map((cells, i) => (
            <AnimatedFigPanel
              key={i}
              cells={cells}
              label={figLabels[i]}
              highlighted={beat.highlight === i + 1}
              result={beat.result}
            />
          ))}
        </div>

        {/* Equation chip */}
        <EquationChip text={beat.equation} result={beat.result} />

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

        {/* Final answer badge */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            style={{
              background: GREEN_BG,
              border: `2px solid ${GREEN}`,
              borderRadius: 10,
              padding: '4px 20px',
              fontSize: 20,
              fontWeight: 900,
              color: GREEN_DARK,
              letterSpacing: '0.03em',
            }}
          >
            {t('Figure 1 → C', 'Gambar 1 → C')}
          </motion.div>
        )}
      </div>
    </div>
  )
}
