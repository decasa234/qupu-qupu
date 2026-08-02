import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildOddOneOutSteps, type OddOneOutParams, type OptionState } from './oddOneOutSteps'
import { useBeatControl } from './useBeatControl'

// Palette: qupu tokens, matching the other concept explainers.
const SHELL = '#FFF9F4' // qupu-shell
const CREAM = '#FFF2DF' // qupu-cream
const PEACH = '#FFD3B1' // qupu-peach
const BRAND_BLUE = '#30598A' // qupu-brand-blue
const BRAND_ORANGE = '#f0853a' // qupu-brand-orange
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_BG = '#ECFDF5'
const ROSE = '#e11d48'
const ROSE_BG = '#FFF1F2'
const MUTED = '#9aa3b2'

const TONE: Record<OptionState, { border: string; bg: string; ink: string }> = {
  idle: { border: PEACH, bg: CREAM, ink: BRAND_BLUE },
  pass: { border: GREEN, bg: GREEN_BG, ink: GREEN_INK },
  fail: { border: ROSE, bg: ROSE_BG, ink: ROSE },
}

// One option card: its letter on a chip, the number or shape name below, and a
// small drawn verdict once the rule has been tested on it.
function OptionCard({ label, text, state }: { label: string; text: string; state: OptionState }) {
  const tone = TONE[state]
  const tested = state !== 'idle'

  return (
    <motion.div
      animate={{ scale: tested ? 1.04 : 1, y: tested ? -2 : 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className="flex w-full min-w-[7rem] items-center gap-2 rounded-2xl border-2 px-3 py-2"
      style={{ borderColor: tone.border, background: tone.bg }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-black"
        style={{ background: tone.border, color: state === 'idle' ? BRAND_BLUE : SHELL }}
      >
        {label}
      </span>
      <span
        className="flex-1 text-center font-display text-lg font-extrabold leading-tight tabular-nums"
        style={{ color: tone.ink }}
      >
        {text}
      </span>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        {tested && (
          <motion.svg
            key={state}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            viewBox="0 0 24 24"
            width={22}
            height={22}
            aria-hidden
          >
            <circle cx={12} cy={12} r={11} fill={SHELL} stroke={tone.ink} strokeWidth={2} />
            {state === 'pass' ? (
              <path
                d="M7 12.5 L10.5 16 L17 8.5"
                fill="none"
                stroke={tone.ink}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path d="M8 8 L16 16 M16 8 L8 16" fill="none" stroke={tone.ink} strokeWidth={2.6} strokeLinecap="round" />
            )}
          </motion.svg>
        )}
      </span>
    </motion.div>
  )
}

export default function OddOneOutExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as OddOneOutParams
  const story = useMemo(() => buildOddOneOutSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: find the rule three of the four options share (${story.rule}), then name the one that breaks it — ${story.answerText}, choice ${story.answerLabel}.`,
    `Strategi: cari aturan yang dipatuhi tiga dari empat pilihan (${story.rule}), lalu sebut satu yang melanggar — ${story.answerText}, pilihan ${story.answerLabel}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the rule under test — blank until a rule has been proposed */}
        <div className="flex min-h-[2.25rem] w-full items-center justify-center">
          {beat.rule ? (
            <motion.div
              key={beat.rule}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl px-3 py-1.5 font-display text-sm font-extrabold"
              style={{ background: BRAND_BLUE, color: CREAM }}
            >
              {T('Rule under test: ', 'Aturan yang diuji: ')}
              {beat.rule}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-sm font-extrabold"
              style={{ color: MUTED }}
            >
              {T('The rule is not written down', 'Aturannya tidak ditulis')}
            </motion.div>
          )}
        </div>

        {/* the four options, in the order the child sees them */}
        <div className="grid w-full grid-cols-2 gap-x-3 gap-y-2">
          {story.options.map((option, i) => (
            <OptionCard key={option.label} label={option.label} text={option.text} state={beat.states[i]} />
          ))}
        </div>

        {/* the running tally of how many options have passed the rule so far */}
        <div className="flex items-center gap-1.5" aria-hidden>
          {story.options.map((option, i) => (
            <motion.span
              key={option.label}
              className="h-2 w-6 rounded-full"
              initial={false}
              animate={{
                background:
                  beat.states[i] === 'pass' ? GREEN : beat.states[i] === 'fail' ? ROSE : PEACH,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: CREAM, borderColor: BRAND_ORANGE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
