// SEAMO-16-A-Q11 — animated explainer for the two-clock duration puzzle.
//
// "Jennifer's party started and ended at the times shown.
//  How long was her party in minutes?"  Answer: C = 310.
//
// Reuses AnalogClock20 from ClockMatch20Illustration (same copy-adapt source
// used by Opts20ECIllustration for clock rendering).
//
// Pure SSR-safe when beat-control hooks are not called (server renders beat 0).

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AnalogClock20 } from './ClockMatch20Illustration'
import { buildPartyClocks16A11Steps } from './partyClocks16A11Steps'

const BLUE       = '#30598A'
const ORANGE     = '#f0853a'
const ORANGE_DRK = '#9A3412'
const GREEN      = '#10B981'
const GREEN_DRK  = '#065F46'
const SHELL      = '#FFF9F4'
const PEACH      = '#FFD3B1'

export default function PartyClocks16A11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPartyClocks16A11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    'Party started at 12:10, ended at 5:20. Duration = 5 hours 10 minutes = 310 minutes. Answer C.',
    'Pesta dimulai pukul 12:10, selesai pukul 5:20. Durasi = 5 jam 10 menit = 310 menit. Jawaban C.',
  )

  const captionStyle =
    beat.tone === 'win'
      ? { background: '#D1FAE5', borderColor: GREEN,  color: GREEN_DRK  }
      : beat.tone === 'check'
        ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DRK }
        : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE }

  const mathColor =
    beat.tone === 'win' ? GREEN_DRK : beat.tone === 'check' ? ORANGE_DRK : BLUE

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[360px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* goal legend */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T('How long was the party in minutes?', 'Berapa lama pesta dalam menit?')}
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
                className="font-display text-lg font-black tabular-nums"
                style={{ color: mathColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* two clocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Start clock */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ opacity: beat.highlightStart ? 1 : 0.6, transition: 'opacity 0.3s' }}>
              <AnalogClock20
                time={beat.startTime}
                size={110}
                emphasizeMinute={beat.highlightStart}
                emphasizeHour={beat.highlightStart}
              />
            </div>
            <span
              className="font-display text-xs font-bold"
              style={{ color: beat.highlightStart ? BLUE : '#94A3B8' }}
            >
              {T('Start', 'Mulai')}
            </span>
          </div>

          {/* Arrow */}
          <div className="font-display text-2xl font-black" style={{ color: '#CBD5E1' }}>
            →
          </div>

          {/* End clock */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ opacity: beat.highlightEnd ? 1 : 0.6, transition: 'opacity 0.3s' }}>
              <AnalogClock20
                time={beat.endTime}
                size={110}
                emphasizeMinute={beat.highlightEnd}
                emphasizeHour={beat.highlightEnd}
              />
            </div>
            <span
              className="font-display text-xs font-bold"
              style={{ color: beat.highlightEnd ? BLUE : '#94A3B8' }}
            >
              {T('End', 'Selesai')}
            </span>
          </div>
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
              {T('310 minutes ✓', '310 menit ✓')}
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
