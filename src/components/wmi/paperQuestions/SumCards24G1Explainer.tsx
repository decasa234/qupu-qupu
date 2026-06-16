import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SumCards24G1 } from './SumCards24G1Illustration'
import { buildSumCards24G1Steps } from './sumCards24G1Steps'

// Mirror the static figure's qupu tokens.
const LEFT_LIT = '#30598A' // brand blue — □ (from the left)
const RIGHT_LIT = '#f0853a' // brand orange — △ (from the right)
const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE_BG = '#E1EFFB'

/**
 * WMI-24F1A-Q18 — post-answer explainer.
 *
 * Walks every card-pair whose VALUES add to 9, lighting the □-th card from the
 * left (blue) and the △-th from the right (orange), printing □ + △, and dropping
 * each total into a running set of DISTINCT values. Duplicates don't grow the
 * set. The distinct totals {4,6,8,10,12,14} → 6 land on the final beat.
 */
export default function SumCards24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSumCards24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Explainer: pair cards whose numbers add to 9, then count the different position sums □ + △ — the answer is ${story.answer}.`,
    `Penjelasan: pasangkan kartu yang angkanya berjumlah 9, lalu hitung beda nilai posisi □ + △ — jawabannya ${story.answer}.`,
  )

  // The caption box accent: green on the result, blue while framing/found.
  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.duplicate
      ? { background: '#FFFFFF', borderColor: RIGHT_LIT, color: RIGHT_LIT }
      : { background: BLUE_BG, borderColor: LEFT_LIT, color: LEFT_LIT }

  // The "different totals so far" chips. Always render the slots so the row's
  // height is stable; fill them as totals are discovered.
  const collected = beat.collected

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The eight-card row, lit for this beat — same scene as the static figure. */}
        <SumCards24G1 litLeft={beat.litLeft} litRight={beat.litRight} showSum={beat.showSum} />

        {/* Running set of DISTINCT □ + △ totals. */}
        <div className="flex w-full flex-col items-center gap-1">
          <div
            className="font-display text-[11px] font-bold uppercase tracking-wide"
            style={{ color: beat.result ? GREEN_INK : INK }}
          >
            {t('different □ + △', 'beda □ + △')}
          </div>
          <div className="flex min-h-[34px] flex-wrap items-center justify-center gap-1.5">
            <AnimatePresence initial={false}>
              {collected.map((value) => {
                const isNew = beat.sum === value && !beat.duplicate && !beat.result
                return (
                  <motion.div
                    key={value}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                    className="flex h-7 min-w-7 items-center justify-center rounded-lg px-2 font-display text-sm font-black tabular-nums"
                    style={{
                      background: beat.result ? GREEN_BG : isNew ? BLUE_BG : '#F3F4F6',
                      color: beat.result ? GREEN_INK : isNew ? LEFT_LIT : INK,
                      border: `2px solid ${beat.result ? GREEN : isNew ? LEFT_LIT : '#E5E7EB'}`,
                    }}
                  >
                    {value}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {collected.length === 0 && (
              <span className="font-display text-sm font-bold text-gray-300">—</span>
            )}
            {beat.result && (
              <motion.div
                key="count"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 460, damping: 22, delay: 0.12 }}
                className="ml-1 flex h-7 items-center justify-center rounded-lg px-2 font-display text-sm font-black"
                style={{ background: GREEN, color: 'white' }}
              >
                = {story.answer}
              </motion.div>
            )}
          </div>
        </div>

        {/* Kid-voice caption. */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
