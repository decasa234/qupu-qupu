// IKMC-21-EC-Q18 — post-answer explainer for the two-row card flip question.
//
// Reuses UpsideCards18EC from UpsideCards18ECIllustration so the animation
// reads as the static scene coming alive. Walks through:
//   see the 7 cards → spot the gap (4) → find card G (b−t=2) →
//   flip G → both rows become 33 → answer E (card G).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { UpsideCards18EC } from './UpsideCards18ECIllustration'
import { buildUpsideCards18ECSteps } from './upsideCards18ECSteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
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

export default function UpsideCards18ECExplainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'en') as 'en' | 'id'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildUpsideCards18ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult    = beat.result
  const isHighlight = beat.highlightIdx !== null

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : isHighlight
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const ariaLabel = t(
    'Explainer: Top row sums to 31, bottom row sums to 35. ' +
    'Gap is 4. We need a card where bottom − top = 2. ' +
    'Card G has top=2, bottom=4, and 4−2=2. ' +
    'Flip card G: top row becomes 33, bottom row becomes 33. Answer E (card G).',
    'Penjelasan: Baris atas berjumlah 31, baris bawah berjumlah 35. ' +
    'Selisih 4. Kita perlu kartu dengan bawah − atas = 2. ' +
    'Kartu G memiliki atas=2, bawah=4, dan 4−2=2. ' +
    'Balik kartu G: baris atas menjadi 33, baris bawah menjadi 33. Jawaban E (kartu G).',
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* sum-state label above the cards */}
        <AnimatePresence mode="wait">
          {beat.sumLabel && (
            <motion.div
              key={beat.sumLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg px-3 py-1 font-display text-xs font-extrabold"
              style={{ background: isResult ? GREEN_BG : SLATE_BG, color: isResult ? GREEN_INK : SLATE_INK }}
            >
              {beat.sumLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG card-row primitive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${beat.highlightIdx}-${JSON.stringify(beat.flippedValues)}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <UpsideCards18EC
              highlightIdx={beat.highlightIdx}
              flippedValues={beat.flippedValues}
            />
          </motion.div>
        </AnimatePresence>

        {/* answer badge — appears on result beat */}
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
                {t('Answer E (card G)', 'Jawaban E (kartu G)')}
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
