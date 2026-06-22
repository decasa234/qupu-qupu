// IKMC-22-PE-Q5 — post-answer animated explainer
//
// Walk: intro → scan rows (find row 2 is incomplete) → scan cols (find col 2 is incomplete)
// → intersect at D → reveal coin at D.
// Reuses the CoinGrid5PE primitive from the illustration.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CoinGrid5PE, VIEW_W } from './CoinGrid5PEIllustration'
import { buildCoinGrid5PESteps } from './coinGrid5PESteps'

const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER    = '#F59E0B'
const AMBER_BG = '#FEF3C7'

export default function CoinGrid5PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCoinGrid5PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: temukan sel D sebagai satu-satunya posisi yang memenuhi aturan 2 koin per baris dan kolom. Jawaban D.'
      : 'Explainer: find cell D as the only position satisfying the 2-coins-per-row-and-column rule. Answer D.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Phase heading */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: beat.result ? GREEN : BLUE }}
        >
          {beat.result
            ? T('Answer: D', 'Jawaban: D')
            : beat.phase === 'intro'
              ? T('The challenge', 'Tantangannya')
              : beat.phase === 'scan-rows'
                ? T('Scan rows', 'Periksa baris')
                : beat.phase === 'scan-cols'
                  ? T('Scan columns', 'Periksa kolom')
                  : T('Intersection', 'Perpotongan')}
        </div>

        {/* Grid */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <CoinGrid5PE
            highlightCells={beat.highlightCells}
            highlightRow={beat.highlightRow}
            highlightCol={beat.highlightCol}
            showAnswer={beat.showAnswer}
            dimOtherLabels={beat.dimOtherLabels}
          />
        </motion.div>

        {/* Equation badge */}
        <AnimatePresence mode="wait">
          {beat.equation && (
            <motion.div
              key={`eq-${index}`}
              className="rounded-lg px-4 py-1.5 font-display text-sm font-extrabold"
              style={{
                background: beat.result ? GREEN_BG : AMBER_BG,
                color: beat.result ? GREEN_INK : AMBER,
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {beat.equation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${index}`}
            className="w-full max-w-[360px] rounded-xl px-4 py-3 text-center text-sm leading-snug"
            style={{
              background: beat.result ? GREEN_BG : BLUE_BG,
              color: beat.result ? GREEN_INK : BLUE,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.05 }}
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>

        {/* Size reference for the primitive — keeps layout stable */}
        <div style={{ width: VIEW_W, height: 0, visibility: 'hidden' }} aria-hidden="true" />
      </div>
    </div>
  )
}
