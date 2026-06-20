// IKMC-19-PE-Q24 — post-answer animated explainer.
//
// Strategy: slide a 2×2 window over the 4×5 number table (12 positions),
// display each block's sum, flag the two that exceed 63, then highlight
// that 14 is the only answer-choice number present in BOTH valid blocks.
//
// Reuses `NumberTable24Grid` from NumberTable24Illustration (same SVG primitive)
// and `buildNumberTable24Steps` for the beat storyboard.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberTable24Grid } from './NumberTable24Illustration'
import { buildNumberTable24Steps } from './numberTable24Steps'

// ── Colour tokens ──────────────────────────────────────────────────────────────
const BLUE   = '#30598A'
const ORANGE = '#f0853a'
const GREEN  = '#10B981'
const GREEN_INK = '#065F46'
const RED    = '#DC2626'

// ── Sum pill ──────────────────────────────────────────────────────────────────

interface SumPillProps {
  sum: number
  valid: boolean
}

function SumPill({ sum, valid }: SumPillProps) {
  return (
    <motion.div
      key={`sum-${sum}`}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="flex items-center gap-1 rounded-full border-2 px-4 py-1 font-display text-sm font-black tabular-nums"
      style={
        valid
          ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
          : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
      }
    >
      <span>Sum =</span>
      <span className="text-base font-black">{sum}</span>
      {valid && <span style={{ color: GREEN }}>{'> 63 ✓'}</span>}
      {!valid && <span style={{ color: RED }}>{'≤ 63'}</span>}
    </motion.div>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function NumberTable24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildNumberTable24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isFinal = beat.result

  const ariaLabel = t(
    'Explainer: sliding a 2×2 window over the 4×5 table finds two valid squares — {13,14,18,19} summing to 64 and {14,15,19,20} summing to 68. The number 14 is in both valid squares and is the only answer-choice that must be present. Answer: A (14).',
    'Penjelasan: menggeser jendela 2×2 di atas tabel 4×5 menemukan dua kotak yang valid — {13,14,18,19} berjumlah 64 dan {14,15,19,20} berjumlah 68. Angka 14 ada di kedua kotak valid dan satu-satunya pilihan jawaban yang pasti ada. Jawaban: A (14).',
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* instruction strip */}
        <div
          className="w-full rounded-lg px-3 py-1 text-center font-display text-xs font-bold"
          style={{ background: '#E1EFFB', color: BLUE, minHeight: 24 }}
        >
          {isFinal
            ? t('Both valid squares contain 14 — it must be there!', 'Kedua kotak valid mengandung 14 — pasti ada di sana!')
            : t('Sliding the 2×2 window…', 'Menggeser jendela 2×2…')}
        </div>

        {/* the grid — with sliding highlight or answer highlight */}
        <NumberTable24Grid
          highlight2x2={beat.highlight ?? undefined}
          highlightAnswer={beat.highlightAnswer}
        />

        {/* sum pill (visible when a block is highlighted) */}
        <div className="flex min-h-[2.5rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.sum !== null && (
              <SumPill key={`sum-${index}`} sum={beat.sum} valid={beat.valid} />
            )}
            {beat.sum === null && isFinal && (
              <motion.div
                key="answer-chip"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full border-2 px-5 py-1 font-display text-base font-black"
                style={{ background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }}
              >
                {t('Answer A: 14 must be in the square', 'Jawaban A: 14 pasti ada di kotak')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              isFinal
                ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
                : beat.valid
                  ? { background: '#ECFDF5', borderColor: ORANGE, color: '#9A3412' }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
