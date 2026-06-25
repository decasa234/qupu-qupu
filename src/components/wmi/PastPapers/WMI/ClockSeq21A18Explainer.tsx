// SEAMO-21-A-Q18 — animated explainer for the clock sequence puzzle.
//
// "What comes next?"
// Sequence: 9:05 → 9:40 → 10:15 → ?   (each +35 minutes)
// Answer: C = 10:50 a.m.
//
// Reuses ClockSeq21A18 from the illustration for the 2×2 grid.
//
// Pure SSR-safe when beat-control hooks are not called (server renders beat 0).

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClockSeq21A18 } from './ClockSeq21A18Illustration'
import { buildClockSeq21A18Steps } from './clockSeq21A18Steps'

const BLUE       = '#2f6df0'
const ORANGE     = '#f0853a'
const ORANGE_DRK = '#9A3412'
const GREEN      = '#10B981'
const GREEN_DRK  = '#065F46'
const SHELL      = '#FFF9F4'
const PEACH      = '#FFD3B1'

export default function ClockSeq21A18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildClockSeq21A18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    'Clock sequence: 9:05, 9:40, 10:15 — each 35 minutes later. The next time is 10:50 a.m. Answer C.',
    'Urutan jam: 9:05, 9:40, 10:15 — masing-masing 35 menit kemudian. Waktu berikutnya adalah pukul 10.50 pagi. Jawaban C.',
  )

  const captionStyle =
    beat.tone === 'win'
      ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DRK }
      : beat.tone === 'check'
        ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DRK }
        : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE }

  const mathColor =
    beat.tone === 'win' ? GREEN_DRK : beat.tone === 'check' ? ORANGE_DRK : BLUE

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[400px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* goal legend */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T('What time comes next in the sequence?', 'Waktu apa berikutnya dalam urutan?')}
        </div>

        {/* running-arithmetic chip */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.math && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-base font-black tabular-nums"
                style={{ color: mathColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The 2×2 clock grid */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ClockSeq21A18
            highlightSlot={beat.highlightSlot}
            revealAnswer={beat.revealAnswer}
          />
        </div>

        {/* answer chip on winning beat */}
        <AnimatePresence initial={false}>
          {beat.result && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-black tabular-nums"
              style={{ color: GREEN_DRK }}
            >
              {T('10:50 a.m. ✓  (Answer C)', '10.50 pagi ✓  (Jawaban C)')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption box */}
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
