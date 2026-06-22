// IKMC-21-EC-Q16 — post-answer explainer for the cup-flip cycle question.
//
// Reuses CupRow from Cups16ECIllustration so the animated sequence reads as
// the static scene coming alive. Walks through:
//   initial [U,U,U] → move 1 [U,U,D] → move 2 [U,D,D] → move 3 [D,D,D]
//   → moves 4-6 back to [U,U,U] (cycle = 6) → 10 mod 6 = 4 → [D,D,U] = B.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CupRow } from './Cups16ECIllustration'
import { buildCups16ECSteps } from './cups16ECSteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE_BG   = '#E1EFFB'
const BLUE_INK  = '#30598A'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#78350F'
const SLATE_BG  = '#F1F5F9'
const SLATE_INK = '#475569'

export default function Cups16ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCups16ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult   = beat.result
  const hasHighlight = beat.highlightIndex !== null

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : hasHighlight
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const ariaLabel = t(
    'Explainer: Three cups start upright. Each move takes the leftmost cup, flips it, and places it on the right. ' +
    'The pattern cycles every 6 moves. After 10 moves (10 mod 6 = 4), the state matches move 4: [D D U] = answer B.',
    'Penjelasan: Tiga cangkir dimulai tegak. Setiap gerakan mengambil cangkir paling kiri, membaliknya, dan meletakkannya di kanan. ' +
    'Pola berulang setiap 6 gerakan. Setelah 10 gerakan (10 mod 6 = 4), keadaannya sama dengan gerakan ke-4: [D D U] = jawaban B.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* state label above the cups */}
        <AnimatePresence mode="wait">
          {beat.stateLabel && (
            <motion.div
              key={beat.stateLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg px-3 py-1 font-display text-xs font-extrabold"
              style={{ background: SLATE_BG, color: SLATE_INK }}
            >
              {beat.stateLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* cup row SVG primitive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(beat.state)}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <CupRow
              state={beat.state}
              highlightIndex={beat.highlightIndex}
            />
          </motion.div>
        </AnimatePresence>

        {/* orientation chips — show U/D label per position */}
        <div className="flex items-center justify-center gap-2">
          {beat.state.map((orientation, i) => {
            const isHighlighted = beat.highlightIndex === i
            const bg     = isHighlighted ? AMBER_BG : SLATE_BG
            const border = isHighlighted ? AMBER     : '#CBD5E1'
            const ink    = isHighlighted ? AMBER_INK : SLATE_INK
            const label  = t(
              ['Left', 'Mid', 'Right'][i],
              ['Kiri', 'Tengah', 'Kanan'][i],
            )
            const cupLabel = orientation === 'U'
              ? t('↑ up', '↑ tegak')
              : t('↓ down', '↓ terbalik')
            return (
              <motion.div
                key={`chip-${i}`}
                className="flex flex-col items-center gap-0.5"
                animate={{ scale: isHighlighted ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <span className="font-display text-[9px] font-extrabold" style={{ color: ink }}>
                  {label}
                </span>
                <div
                  className="flex h-8 w-16 items-center justify-center rounded-lg border-2 font-display text-xs font-black"
                  style={{ background: bg, borderColor: border, color: ink }}
                >
                  {cupLabel}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* answer badge — only on the result beat */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence>
            {isResult && (
              <motion.div
                key="result"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {t('Answer B', 'Jawaban B')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
