import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMastermindCodeDeduceSteps } from './mastermindCodeDeduceSteps'
import { useBeatControl } from './useBeatControl'

// Post-answer animation for `mastermind-code-deduce`. Replays the elimination:
// the digit strip loses the digits the "nothing correct" report knocked out, the
// list of possible orders appears, and each later report strikes more of them
// through until one is left. The code is only ever *shown* on the final beat,
// and by then every other order has been visibly crossed off.

const SHELL = '#FFF9F4' // qupu-shell
const PEACH = '#FFD3B1' // qupu-peach
const CREAM = '#FFF2DF' // qupu-cream
const ORANGE = '#f0853a' // qupu-brand-orange
const BRAND_BLUE = '#30598A' // qupu-brand-blue
const GREEN = '#10B981'
const GREEN_TINT = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER = '#D97706'
const AMBER_TINT = '#FEF3C7'
const AMBER_INK = '#92400E'
const ROSE = '#e11d48'
const MUTED = '#9aa3b2'

function CountChip({ value, tone }: { value: string; tone: 'placed' | 'present' }) {
  const placed = tone === 'placed'
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-md border-2 font-display text-xs font-black tabular-nums"
      style={{
        background: placed ? GREEN_TINT : AMBER_TINT,
        borderColor: placed ? GREEN : AMBER,
        color: placed ? GREEN_INK : AMBER_INK,
      }}
    >
      {value}
    </span>
  )
}

/** One tried code with the two counts the lock reported beside it. */
function GuessRow({
  guess,
  placed,
  present,
  active,
  read,
}: {
  guess: number[]
  placed: number
  present: number
  active: boolean
  read: boolean
}) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : read ? 0.55 : 0.85, scale: active ? 1.03 : 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      className="flex items-center gap-2 rounded-xl border-2 px-2 py-1"
      style={{
        background: active ? CREAM : 'transparent',
        borderColor: active ? ORANGE : 'transparent',
      }}
    >
      <span className="flex gap-1">
        {guess.map((d, i) => (
          <span
            key={i}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border-2 font-display text-sm font-black tabular-nums"
            style={{ background: '#FFFFFF', borderColor: PEACH, color: BRAND_BLUE }}
          >
            {d}
          </span>
        ))}
      </span>
      <CountChip value={String(placed)} tone="placed" />
      <CountChip value={String(present)} tone="present" />
    </motion.div>
  )
}

export default function MastermindCodeDeduceExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { code: number[]; guesses: number[][]; poolSize?: number }
  const poolSize = p.poolSize ?? 6
  const story = useMemo(
    () => buildMastermindCodeDeduceSteps(p.code, p.guesses, poolSize, lang),
    [p.code, p.guesses, poolSize, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const pool = Array.from({ length: poolSize }, (_, i) => i + 1)
  const killed = new Set(beat.killed)

  const ariaLabel = T(
    `Strategy: cross codes off the list report by report. Only ${story.answer} survives all of them.`,
    `Strategi: coret kemungkinan kode laporan demi laporan. Hanya ${story.answer} yang bertahan.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the lock's code — question marks until the last beat */}
        <div className="flex items-center gap-2">
          {p.code.map((d, i) => (
            <motion.span
              key={i}
              animate={{ scale: beat.result ? 1.06 : 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: i * 0.08 }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 font-display text-2xl font-black tabular-nums"
              style={{
                background: beat.result ? GREEN_TINT : CREAM,
                borderColor: beat.result ? GREEN : ORANGE,
                color: beat.result ? GREEN_INK : ORANGE,
              }}
            >
              {beat.result ? d : '?'}
            </motion.span>
          ))}
        </div>

        {/* which digits are still in play */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {pool.map((d) => {
            const out = beat.ruledOutDigits.includes(d)
            return (
              <motion.span
                key={d}
                animate={{ opacity: out ? 0.4 : 1 }}
                transition={{ duration: 0.35 }}
                className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-sm font-black tabular-nums"
                style={{
                  background: out ? '#FFFFFF' : CREAM,
                  borderColor: out ? MUTED : ORANGE,
                  color: out ? MUTED : BRAND_BLUE,
                  textDecoration: out ? 'line-through' : 'none',
                }}
              >
                {d}
              </motion.span>
            )
          })}
        </div>

        {/* the guesses and their reports */}
        <div className="flex w-full flex-col items-center gap-1">
          {story.guesses.map((g, i) => (
            <GuessRow
              key={i}
              guess={g}
              placed={story.reports[i].placed}
              present={story.reports[i].present}
              active={beat.clueIndex === i}
              read={beat.clueIndex !== null && i < beat.clueIndex}
            />
          ))}
        </div>

        {/* every order still on the list; the ones this report kills strike out */}
        <div className="flex min-h-[3rem] flex-wrap items-center justify-center gap-1.5">
          {beat.candidates.length === 0 ? (
            <span className="font-display text-sm font-extrabold" style={{ color: MUTED }}>
              {T('Which digits first, then which order', 'Cari angkanya dulu, baru urutannya')}
            </span>
          ) : (
            beat.candidates.map((c) => {
              const out = killed.has(c)
              const win = beat.result
              return (
                <motion.span
                  key={c}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: out ? 0.45 : 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="rounded-lg border-2 px-2 py-1 font-display text-sm font-black tabular-nums"
                  style={{
                    background: out ? '#FFF1F2' : win ? GREEN_TINT : '#FFFFFF',
                    borderColor: out ? ROSE : win ? GREEN : PEACH,
                    color: out ? ROSE : win ? GREEN_INK : BRAND_BLUE,
                    textDecoration: out ? 'line-through' : 'none',
                  }}
                >
                  {c}
                </motion.span>
              )
            })
          )}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_TINT, borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
