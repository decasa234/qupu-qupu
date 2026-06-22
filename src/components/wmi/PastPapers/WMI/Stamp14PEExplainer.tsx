// IKMC-22-PE-Q14 — post-answer explainer for the stamp mirror-flip question.
//
// Reuses Stamp14PE from Stamp14PEIllustration so the animation reads as the
// static scene coming alive. Walks through:
//   stamp face (apple | banana | pear) →
//   identify pear on right → identify apple on left →
//   printed result (pear | banana | apple) = answer D.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Stamp14PE } from './Stamp14PEIllustration'
import { buildStamp14PESteps } from './stamp14PESteps'

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

export default function Stamp14PEExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildStamp14PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult    = beat.result
  const hasHighlight = beat.highlightSlot !== null

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : hasHighlight
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const fruitName = (f: 'apple' | 'banana' | 'pear') =>
    t(
      { apple: 'Apple', banana: 'Banana', pear: 'Pear' }[f],
      { apple: 'Apel', banana: 'Pisang', pear: 'Pir' }[f],
    )

  const ariaLabel = t(
    'Explainer: The stamp shows apple (left), banana (middle), pear (right). ' +
    'Pressing the stamp flips left and right. ' +
    'The printed result is pear (left), banana (middle), apple (right). ' +
    'Answer D.',
    'Penjelasan: Cap menampilkan apel (kiri), pisang (tengah), pir (kanan). ' +
    'Menekan cap membalik kiri dan kanan. ' +
    'Hasil cetak adalah pir (kiri), pisang (tengah), apel (kanan). ' +
    'Jawaban D.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* state label */}
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

        {/* stamp SVG primitive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${JSON.stringify(beat.fruits)}-${beat.showHandle}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Stamp14PE
              fruits={beat.fruits}
              showHandle={beat.showHandle}
              highlightSlot={beat.highlightSlot}
            />
          </motion.div>
        </AnimatePresence>

        {/* fruit label chips — left / middle / right */}
        <div className="flex items-center justify-center gap-2">
          {beat.fruits.map((fruit, i) => {
            const isHighlighted = beat.highlightSlot === i
            const bg     = isHighlighted ? AMBER_BG : SLATE_BG
            const border = isHighlighted ? AMBER     : '#CBD5E1'
            const ink    = isHighlighted ? AMBER_INK : SLATE_INK
            const position = t(
              ['Left', 'Middle', 'Right'][i],
              ['Kiri', 'Tengah', 'Kanan'][i],
            )
            return (
              <motion.div
                key={`chip-${i}`}
                className="flex flex-col items-center gap-0.5"
                animate={{ scale: isHighlighted ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <span className="font-display text-[9px] font-extrabold" style={{ color: ink }}>
                  {position}
                </span>
                <div
                  className="flex h-8 w-16 items-center justify-center rounded-lg border-2 font-display text-xs font-black"
                  style={{ background: bg, borderColor: border, color: ink }}
                >
                  {fruitName(fruit)}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* answer badge — result beat only */}
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
                {t('Answer D', 'Jawaban D')}
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
