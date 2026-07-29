import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { asLeadingZero, buildCountTwoDigitSteps } from './countTwoDigitSteps'
import { useBeatControl } from './useBeatControl'

// N17 `count-two-digit-numbers`. The whole lesson is systematic enumeration, so
// the figure is a decade grid: nine rows of ten (10-19, 20-29, ... 90-99). Rows
// a rule can never rescue go grey, surviving ones digits get scanned, the hits
// go green, and only then are they counted. A greyed "0-" ghost row appears when
// the leading-zero over-count is the trap, so "08" can be shown to be outside
// the grid rather than merely asserted to be.

const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F0853A'
const CREAM = '#FFF4E8'
const ORANGE_INK = '#8a4b1d'
const GREEN = '#58A700'
const GREEN_INK = '#3A6B00'
const GREEN_BG = '#EDF7E0'
const ROSE = '#D9534F'
const ROSE_BG = '#FDECEC'
const MUTED = '#9aa3b2'
const MUTED_BG = '#F1F3F6'
const MUTED_LINE = '#E3E7ED'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'

const TENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const UNITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

type CellState = 'live' | 'dim' | 'hit' | 'trap'

const CELL_SKIN: Record<CellState, { bg: string; border: string; ink: string }> = {
  live: { bg: SHELL, border: PEACH, ink: BLUE },
  dim: { bg: MUTED_BG, border: MUTED_LINE, ink: MUTED },
  hit: { bg: GREEN_BG, border: GREEN, ink: GREEN_INK },
  trap: { bg: ROSE_BG, border: ROSE, ink: ROSE },
}

function Cell({
  label,
  state,
  focused,
  struck,
  delay,
  reduce,
}: {
  label: string
  state: CellState
  focused: boolean
  struck: boolean
  delay: number
  reduce: boolean
}) {
  const skin = CELL_SKIN[state]
  return (
    <motion.div
      className="flex h-[1.4rem] flex-1 items-center justify-center rounded-[0.25rem] border text-[0.5625rem] font-extrabold tabular-nums"
      style={{
        background: skin.bg,
        borderColor: focused ? BLUE : skin.border,
        color: skin.ink,
        borderWidth: focused ? 2 : 1,
        textDecoration: struck ? 'line-through' : 'none',
      }}
      initial={false}
      animate={reduce ? { scale: 1, opacity: 1 } : { scale: focused ? 1.22 : 1, opacity: state === 'dim' ? 0.75 : 1 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 26, delay }}
    >
      {label}
    </motion.div>
  )
}

export default function CountTwoDigitNumbersExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { constraints?: unknown; ask?: unknown }
  const story = useMemo(
    () => buildCountTwoDigitSteps(p.constraints, p.ask, lang),
    [p.constraints, p.ask, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const reduce = !!useReducedMotion()

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const deadRows = useMemo(() => new Set(beat.deadRows), [beat.deadRows])
  const deadCols = useMemo(() => new Set(beat.deadCols), [beat.deadCols])
  const marked = useMemo(() => new Set(beat.marked), [beat.marked])
  const focus = useMemo(() => new Set(beat.focus), [beat.focus])
  const phantomUnits = useMemo(() => new Set(beat.zeroRowUnits ?? []), [beat.zeroRowUnits])

  const cellState = (n: number): CellState => {
    if (beat.marksShown) return marked.has(n) ? 'hit' : 'dim'
    if (deadRows.has(Math.floor(n / 10)) || deadCols.has(n % 10)) return 'dim'
    return 'live'
  }

  const parts = story.rowCounts.filter((c) => c > 0)

  const ariaLabel = T(
    `Strategy: cross out the tens rows no rule allows, scan the ones digit in the rows that survive, then count the ${story.qualifying.length} numbers that fit. Answer: ${story.answer}.`,
    `Strategi: coret baris puluhan yang tidak mungkin, telusuri angka satuan di baris yang tersisa, lalu hitung ${story.qualifying.length} bilangan yang cocok. Jawaban: ${story.answer}.`,
  )

  const isTrap = beat.phase === 'trap'
  const captionSkin = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : isTrap
      ? { background: ROSE_BG, borderColor: ROSE, color: ROSE }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[18.75rem] flex-col items-stretch gap-2">
        {/* the rules, in the same words the question uses */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {story.rules.map((rule, i) => (
            <span
              key={i}
              className="rounded-lg border-2 px-2 py-1 text-center font-display text-[0.6875rem] font-extrabold"
              style={{ background: CREAM, borderColor: ORANGE, color: ORANGE_INK }}
            >
              {rule}
            </span>
          ))}
        </div>

        {/* the decade grid: nine rows of ten */}
        <div className="flex flex-col gap-[0.15rem]">
          {/* ghost "0-" row — only drawn when the leading-zero over-count is the trap */}
          {story.showZeroRow && (
            <div className="flex items-center gap-[0.15rem] pb-[0.15rem]">
              {UNITS.map((u) => {
                const flagged = phantomUnits.has(u)
                return (
                  <Cell
                    key={`z${u}`}
                    label={asLeadingZero(u)}
                    state={flagged ? 'trap' : 'dim'}
                    focused={false}
                    struck
                    delay={reduce ? 0 : u * 0.03}
                    reduce={reduce}
                  />
                )
              })}
              <div className="w-6 shrink-0" />
            </div>
          )}

          {TENS.map((tens, rowIndex) => {
            const count = beat.rowCounts ? beat.rowCounts[rowIndex] : null
            return (
              <div key={tens} className="flex items-center gap-[0.15rem]">
                {UNITS.map((u) => {
                  const n = tens * 10 + u
                  return (
                    <Cell
                      key={n}
                      label={String(n)}
                      state={cellState(n)}
                      focused={focus.has(n)}
                      struck={false}
                      delay={reduce ? 0 : rowIndex * 0.05 + u * 0.012}
                      reduce={reduce}
                    />
                  )
                })}
                {/* per-decade tally badge */}
                <div className="flex w-6 shrink-0 justify-center">
                  {count !== null && count > 0 && (
                    <motion.span
                      key={`c${tens}`}
                      className="inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full px-1 font-display text-[0.625rem] font-black tabular-nums"
                      style={{ background: GREEN, color: '#FFFFFF' }}
                      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 22, delay: rowIndex * 0.06 }}
                    >
                      {count}
                    </motion.span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* readout: the running sum of decade tallies, or the two ends */}
        <div className="flex min-h-[2rem] flex-wrap items-center justify-center gap-2 font-display text-sm font-extrabold tabular-nums">
          {story.ask === 'how-many' && beat.rowCounts !== null && (
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.3 }}
              style={{ color: GREEN_INK }}
            >
              {parts.join(' + ')}
              {beat.result && <span style={{ color: GREEN }}>{` = ${story.answer}`}</span>}
            </motion.span>
          )}

          {story.ask === 'largest-minus-smallest' && (beat.showSmallest || beat.showLargest) && (
            <>
              {beat.showSmallest && (
                <span
                  className="rounded-lg border-2 px-2 py-0.5 text-[0.75rem]"
                  style={{ background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }}
                >
                  {T(`smallest ${story.smallest}`, `terkecil ${story.smallest}`)}
                </span>
              )}
              {beat.showLargest && (
                <span
                  className="rounded-lg border-2 px-2 py-0.5 text-[0.75rem]"
                  style={{ background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }}
                >
                  {T(`biggest ${story.largest}`, `terbesar ${story.largest}`)}
                </span>
              )}
              {beat.result && (
                <motion.span
                  initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22 }}
                  style={{ color: GREEN }}
                >
                  {`${story.largest} − ${story.smallest} = ${story.answer}`}
                </motion.span>
              )}
            </>
          )}
        </div>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionSkin}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
