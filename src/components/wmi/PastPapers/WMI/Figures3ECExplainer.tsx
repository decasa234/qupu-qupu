/**
 * IKMC-19-EC-Q3 — post-answer explainer: layered cube + cylinder construction.
 *
 * Teaches the "read layer by layer" strategy:
 *   Beat 0 — intro: the construction has 3 layers.
 *   Beat 1 — bottom layer: 3 cubes.
 *   Beat 2 — middle layer: 2 cylinders.
 *   Beat 3 — top layer: 1 cube.
 *   Beat 4 — result: only A matches all three layers → answer A.
 *
 * Reuses ShapeGroup + SHAPE_PIECES from Figures3ECIllustration so the panels
 * read as the same scene the student just saw in the choices.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeGroup, SHAPE_PIECES, SHAPE_ARIA } from './Figures3ECIllustration'
import { buildFigures3ECSteps } from './figures3ECSteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const ORANGE    = '#F59E0B'
const RED       = '#EF4444'
const RED_BG    = '#FEF2F2'
const INK       = '#1F2937'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ---------------------------------------------------------------------------
// OptionPanel — shows one labelled option shape with an optional highlight ring
// ---------------------------------------------------------------------------

interface OptionPanelProps {
  label: string
  /** Dim: not the answer, not highlighted */
  dim: boolean
  /** Is this the correct answer? */
  isAnswer: boolean
  /** Is this panel highlighted in this beat? */
  active: boolean
}

function OptionPanel({ label, dim, isAnswer, active }: OptionPanelProps) {
  const pieces = SHAPE_PIECES[label]
  if (!pieces) return null
  const aria = SHAPE_ARIA[label]

  let borderColor = '#E5E7EB'
  if (active && isAnswer) borderColor = GREEN
  else if (active) borderColor = ORANGE
  else if (dim) borderColor = '#E5E7EB'

  return (
    <motion.div
      layout
      role="img"
      aria-label={aria?.en}
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 70,
        opacity: dim ? 0.38 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <ShapeGroup pieces={pieces} width={64} pad={7} />
      <span
        className="font-display text-xs font-bold"
        style={{
          color: active && isAnswer ? GREEN : active ? ORANGE : INK,
        }}
      >
        {label}
      </span>
      <AnimatePresence>
        {active && (
          <motion.div
            key={`tag-${label}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[9px] font-bold"
            style={{
              background: isAnswer ? GREEN_BG : RED_BG,
              color: isAnswer ? GREEN_TEXT : RED,
              border: `1.5px solid ${isAnswer ? GREEN : RED}`,
            }}
          >
            {isAnswer ? '✓' : '✗'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Layer badge strip — shows the three layer counts as chips, illuminating the
// current beat's layer
// ---------------------------------------------------------------------------

interface LayerChipProps {
  label: string
  value: string
  active: boolean
}

function LayerChip({ label, value, active }: LayerChipProps) {
  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1, opacity: active ? 1 : 0.5 }}
      transition={{ type: 'spring', stiffness: 350, damping: 24 }}
      className="flex flex-col items-center gap-0.5 rounded-lg border-2 px-2 py-1"
      style={{
        borderColor: active ? BLUE : '#D1D5DB',
        background: active ? BLUE_BG : '#F9FAFB',
      }}
    >
      <span className="font-display text-[10px] font-bold" style={{ color: active ? BLUE : '#6B7280' }}>
        {label}
      </span>
      <span className="font-display text-sm font-black" style={{ color: active ? BLUE : INK }}>
        {value}
      </span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function Figures3ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFigures3ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Baca tiga lapisan. Bawah: 3 kubus. Tengah: 2 silinder. Atas: 1 kubus. Hanya gambar A yang sesuai — jawaban A.'
      : 'Explainer: Read three layers. Bottom: 3 cubes. Middle: 2 cylinders. Top: 1 cube. Only figure A matches — answer A.'

  // Which labels are highlighted / dimmed?
  const highlightLabel = beat.highlight  // null or 'A'

  // Layer badge activations
  const layerActive = {
    bottom: beat.phase === 'layer1' || beat.phase === 'result',
    middle: beat.phase === 'layer2' || beat.phase === 'result',
    top:    beat.phase === 'layer3' || beat.phase === 'result',
  }

  const layerLabels =
    lang === 'id'
      ? { bottom: 'Bawah', middle: 'Tengah', top: 'Atas' }
      : { bottom: 'Bottom', middle: 'Middle', top: 'Top' }

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Layer badge strip */}
        <div className="flex items-center gap-2">
          <LayerChip
            label={layerLabels.bottom}
            value={lang === 'id' ? '3 kubus' : '3 cubes'}
            active={layerActive.bottom}
          />
          <span className="font-display text-base font-black" style={{ color: '#9CA3AF' }}>→</span>
          <LayerChip
            label={layerLabels.middle}
            value={lang === 'id' ? '2 silinder' : '2 cylinders'}
            active={layerActive.middle}
          />
          <span className="font-display text-base font-black" style={{ color: '#9CA3AF' }}>→</span>
          <LayerChip
            label={layerLabels.top}
            value={lang === 'id' ? '1 kubus' : '1 cube'}
            active={layerActive.top}
          />
        </div>

        {/* Five option panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const isAnswer = label === 'A'
            const active = highlightLabel === label || (isResult && label === 'A')
            const dim = isResult && label !== 'A'
            return (
              <OptionPanel
                key={label}
                label={label}
                dim={dim}
                isAnswer={isAnswer}
                active={active}
              />
            )
          })}
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
                style={{ background: isResult ? GREEN : BLUE }}
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
