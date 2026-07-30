import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildRankExpressionsSteps, type RankRow } from './rankExpressionsSteps'
import { useBeatControl } from './useBeatControl'

// A10 `rank-computed-expressions`. The child's instinct is to rank by looks —
// the option with the fattest numbers must be the biggest. So the board starts
// with four expressions and four empty bars: nothing is comparable yet. Each
// expression then collapses into its own number, one beat at a time, and only
// once every bar has a length do the rows slide into order. The biggest-looking
// option gets called out where its shortness is visible, and the choice label
// lands last.

const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F0853A'
const ORANGE_INK = '#8a4b1d'
const CREAM = '#FFF4E8'
const GREEN = '#58A700'
const GREEN_INK = '#3A6B00'
const GREEN_BG = '#EDF7E0'
const ROSE = '#D9534F'
const ROSE_BG = '#FDECEC'
const MUTED = '#9aa3b2'
const MUTED_LINE = '#E3E7ED'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'

type RowState = 'idle' | 'focus' | 'done' | 'trap' | 'win'

const ROW_SKIN: Record<RowState, { bg: string; border: string; ink: string; bar: string }> = {
  idle: { bg: SHELL, border: PEACH, ink: BLUE, bar: MUTED_LINE },
  focus: { bg: CREAM, border: ORANGE, ink: ORANGE_INK, bar: ORANGE },
  done: { bg: SHELL, border: PEACH, ink: BLUE, bar: BLUE },
  trap: { bg: ROSE_BG, border: ROSE, ink: ROSE, bar: ROSE },
  win: { bg: GREEN_BG, border: GREEN, ink: GREEN_INK, bar: GREEN },
}

function ExprRow({
  row,
  state,
  revealed,
  ratio,
  reduce,
}: {
  row: RankRow
  state: RowState
  /** Has this expression been worked out yet? Until it has, there is no number and no bar. */
  revealed: boolean
  /** Bar length as a fraction of the biggest value on the board. */
  ratio: number
  reduce: boolean
}) {
  const skin = ROW_SKIN[state]
  const lively = state === 'focus' || state === 'win' || state === 'trap'

  return (
    <motion.div
      layout={!reduce}
      className="flex items-center gap-1.5 rounded-xl border-2 px-2 py-1.5"
      style={{ background: skin.bg, borderColor: skin.border }}
      initial={false}
      animate={reduce ? { scale: 1 } : { scale: lively ? 1.02 : 1 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
    >
      {/* choice label — the thing the learner actually picks */}
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 font-display text-[0.625rem] font-black"
        style={{ background: state === 'win' ? GREEN : SHELL, borderColor: skin.border, color: state === 'win' ? '#FFFFFF' : skin.ink }}
      >
        {row.label}
      </span>

      {/* the expression, exactly as the choice shows it — fades once it has collapsed into a number */}
      <motion.span
        className="w-[4.4rem] shrink-0 text-right font-display text-[0.8125rem] font-extrabold tabular-nums"
        style={{ color: skin.ink }}
        initial={false}
        animate={{ opacity: revealed ? 0.5 : 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.35 }}
      >
        {row.text}
      </motion.span>

      <span className="shrink-0 font-display text-[0.75rem] font-extrabold" style={{ color: MUTED }}>
        =
      </span>

      {/* the value — a question mark until this row's own beat works it out */}
      <span className="w-[2.3rem] shrink-0 text-right font-display text-[0.9375rem] font-black tabular-nums" style={{ color: revealed ? skin.ink : MUTED }}>
        {revealed ? (
          <motion.span
            key={`v${row.value}`}
            className="inline-block"
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 20 }}
          >
            {row.value}
          </motion.span>
        ) : (
          '?'
        )}
      </span>

      {/* the value as a length — the only fair way to compare the four */}
      <div className="relative h-[0.6rem] min-w-[3rem] flex-1 overflow-hidden rounded-full" style={{ background: '#FFFFFF', border: `1px solid ${MUTED_LINE}` }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: skin.bar }}
          initial={false}
          animate={{ width: revealed ? `${Math.max(6, ratio * 100)}%` : '0%', background: skin.bar }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 150, damping: 22 }}
        />
      </div>
    </motion.div>
  )
}

export default function RankComputedExpressionsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const exprs = (params as { exprs?: unknown } | null | undefined)?.exprs
  const story = useMemo(() => buildRankExpressionsSteps({ exprs }, lang), [exprs, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const reduce = !!useReducedMotion()

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const revealed = useMemo(() => new Set(beat.revealed), [beat.revealed])

  const rowState = (i: number): RowState => {
    if (beat.win === i) return 'win'
    if (beat.trap === i) return 'trap'
    if (beat.focus === i) return 'focus'
    return revealed.has(i) ? 'done' : 'idle'
  }

  const ariaLabel = story.rows.length
    ? T(
        `Strategy: work out all ${story.rows.length} expressions before comparing anything, then line the values up biggest first. The largest is ${story.rows[story.answerIndex].value}, so the answer is ${story.answer}.`,
        `Strategi: hitung dulu ${story.rows.length} ekspresi sebelum membandingkan, lalu jajarkan nilainya dari terbesar. Nilai terbesar ${story.rows[story.answerIndex].value}, jadi jawabannya ${story.answer}.`,
      )
    : T('Work out each expression, then compare the values.', 'Hitung setiap ekspresi, lalu bandingkan nilainya.')

  const captionSkin = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.phase === 'trap'
      ? { background: ROSE_BG, borderColor: ROSE, color: ROSE }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[18.75rem] flex-col items-stretch gap-2">
        {/* the rule of the game, in the question's own words */}
        <div className="flex justify-center">
          <span
            className="rounded-lg border-2 px-2 py-1 text-center font-display text-[0.6875rem] font-extrabold"
            style={{ background: CREAM, borderColor: ORANGE, color: ORANGE_INK }}
          >
            {T('Which expression has the greatest value?', 'Ekspresi mana yang nilainya paling besar?')}
          </span>
        </div>

        {/* one row per option: expression, its value, and the value drawn as a length */}
        <div className="flex flex-col gap-1.5">
          {beat.order.map((i) => (
            <ExprRow
              key={story.rows[i].label}
              row={story.rows[i]}
              state={rowState(i)}
              revealed={revealed.has(i)}
              ratio={story.rows[i].value / story.maxValue}
              reduce={reduce}
            />
          ))}
        </div>

        {/* the values lined up, once every one of them exists */}
        <div className="flex min-h-[1.9rem] flex-wrap items-center justify-center gap-1 font-display text-sm font-black tabular-nums">
          {beat.chain !== null &&
            beat.chain.map((v, k) => (
              <motion.span
                key={`${k}-${v}`}
                className="flex items-center gap-1"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.3, delay: k * 0.08 }}
              >
                {k > 0 && (
                  <span className="text-[0.75rem]" style={{ color: MUTED }}>
                    &gt;
                  </span>
                )}
                <span style={{ color: beat.result && k === 0 ? GREEN : BLUE }}>{v}</span>
              </motion.span>
            ))}
        </div>

        {/* caption */}
        <div className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold" style={captionSkin}>
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
