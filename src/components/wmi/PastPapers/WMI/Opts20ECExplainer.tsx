// IKMC-23-EC-Q20 — Five wall clocks: which shows the correct time?
//
// Answer: D (3:30). Clock B (2:30) is 1h slow, clock E (4:30) is 1h fast;
// A (12:30) and C (9:15) are the two stopped clocks.
//
// Beat-by-beat: show all five clocks, highlight the B→D→E chain one step at
// a time, mark A and C as stopped, then declare D as the correct clock.
//
// Reuses AnalogClock20 from ClockMatch20Illustration.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AnalogClock20 } from './ClockMatch20Illustration'
import { buildClocks20ECSteps } from './opts20ECSteps'

const BLUE = '#30598A'
const ORANGE = '#f0853a'
const ORANGE_DARK = '#9A3412'
const GREEN = '#10B981'
const GREEN_DARK = '#065F46'
const RED = '#EF4444'
const RED_DARK = '#991B1B'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'

/** Times shown on each option clock (matches source crops). */
const CLOCK_TIMES: Record<string, string> = {
  A: '12:30',
  B: '2:30',
  C: '9:15',
  D: '3:30',
  E: '4:30',
}

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function Opts20ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildClocks20ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    'Explainer: clocks B (2:30), D (3:30), and E (4:30) form a chain each 1 hour apart. D is in the middle — the correct time. Answer: D.',
    'Penjelasan: jam B (2:30), D (3:30), dan E (4:30) membentuk rantai berjarak 1 jam. D berada di tengah — waktu yang benar. Jawaban: D.',
  )

  const captionStyle =
    beat.tone === 'win'
      ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DARK }
      : beat.tone === 'check'
        ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DARK }
        : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const mathColor =
    beat.tone === 'win' ? GREEN_DARK : beat.tone === 'check' ? ORANGE_DARK : BLUE

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[360px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* strategy legend */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T('Find the clock 1 hour between two others', 'Temukan jam yang berjarak 1 jam dari dua lainnya')}
        </div>

        {/* running arithmetic chip */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.math && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-sm font-black tabular-nums"
                style={{ color: mathColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* five clocks in a row */}
        <div className="flex items-end justify-center gap-2 flex-wrap">
          {LABELS.map((label) => {
            const isHighlighted = beat.highlightLabels.includes(label)
            const isGreen = beat.greenLabel === label
            const isRed = beat.redLabels.includes(label)
            const size = isHighlighted ? 80 : 68

            const borderColor = isGreen
              ? GREEN
              : isRed
                ? RED
                : isHighlighted
                  ? ORANGE
                  : '#CBD5E1'

            const labelStyle = isGreen
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DARK }
              : isRed
                ? { background: '#FEE2E2', borderColor: RED, color: RED_DARK }
                : isHighlighted
                  ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DARK }
                  : { background: '#FFFFFF', borderColor: '#CBD5E1', color: '#64748B' }

            return (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5"
                style={{ transition: 'opacity 0.2s', opacity: isHighlighted || beat.highlightLabels.length === 0 ? 1 : 0.45 }}
              >
                <div
                  style={{
                    borderRadius: '50%',
                    border: `2.5px solid ${borderColor}`,
                    padding: 2,
                    transition: 'border-color 0.25s',
                    position: 'relative',
                  }}
                >
                  <AnalogClock20 time={CLOCK_TIMES[label]} size={size} />
                  {/* stopped clock X overlay */}
                  {isRed && (
                    <svg
                      viewBox="0 0 80 80"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                      }}
                    >
                      <line x1={16} y1={16} x2={64} y2={64} stroke={RED} strokeWidth={5} strokeLinecap="round" />
                      <line x1={64} y1={16} x2={16} y2={64} stroke={RED} strokeWidth={5} strokeLinecap="round" />
                    </svg>
                  )}
                  {/* correct clock checkmark overlay */}
                  {isGreen && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: GREEN,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#fff',
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <span
                  className="rounded-full border-2 px-2 text-xs font-extrabold"
                  style={labelStyle}
                >
                  {label}
                </span>
                {/* time label shown when highlighted */}
                {isHighlighted && (
                  <span
                    className="font-display text-xs font-bold tabular-nums"
                    style={{ color: isGreen ? GREEN_DARK : isRed ? RED_DARK : ORANGE_DARK }}
                  >
                    {CLOCK_TIMES[label]}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* answer reveal */}
        <AnimatePresence initial={false}>
          {beat.result && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-black tabular-nums"
              style={{ color: GREEN_DARK }}
            >
              {T('B (2:30) ← 1h → D (3:30) ← 1h → E (4:30)', 'B (2:30) ← 1j → D (3:30) ← 1j → E (4:30)')}
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
