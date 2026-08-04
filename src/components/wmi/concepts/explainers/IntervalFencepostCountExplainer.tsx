import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildIntervalFencepostCountSteps } from './intervalFencepostCountSteps'
import { useBeatControl } from './useBeatControl'

// A row of numbered dots with the SPACES between them drawn as separate bars.
// The dots never move; only the bars light up. That is the whole argument made
// visible: the things and the spaces are two different sets of objects, and on
// a straight row there is always one fewer space than there are things. When
// the arrangement closes into a ring, one extra dashed bar runs back to a ghost
// copy of item 1 — the gap that a careless count forgets.

const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const AMBER_INK = '#8A6100'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const HAIR = '#E6D8C9'
const MUTED = '#9AA2AE'

/** One numbered thing standing in the row. */
function Dot({ n, ghost }: { n: number; ghost?: boolean }) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 font-display text-[0.625rem] font-black tabular-nums"
      style={{
        background: ghost ? '#FFFFFF' : BLUE_SOFT,
        borderColor: ghost ? HAIR : BLUE,
        color: ghost ? MUTED : BLUE,
        opacity: ghost ? 0.75 : 1,
      }}
    >
      {n}
    </span>
  )
}

/** One space between two things. This is what the question is really counting. */
function Gap({ on, dashed, still }: { on: boolean; dashed?: boolean; still: boolean }) {
  return (
    <motion.span
      className="inline-block h-[0.1875rem] w-4 shrink-0 rounded-full"
      animate={{ backgroundColor: on ? AMBER : HAIR, scaleY: on ? 1.6 : 1 }}
      transition={still ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 24 }}
      style={{
        backgroundColor: on ? AMBER : HAIR,
        border: dashed ? `1px dashed ${on ? AMBER : HAIR}` : undefined,
        opacity: dashed ? 0.9 : 1,
      }}
    />
  )
}

export default function IntervalFencepostCountExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildIntervalFencepostCountSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const lit = new Set(beat.lit)

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.reveal !== null
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: count the spaces between the things, not the things. A straight row of ${story.count} has ${story.ends === 'open' ? story.count - 1 : story.count} spaces, and ${story.span} shared out between them makes ${story.gapSize} each.`,
    `Strategi: hitung ruang di antara benda, bukan bendanya. Barisan ${story.count} benda punya ${story.ends === 'open' ? story.count - 1 : story.count} ruang, dan ${story.span} dibagi rata ke ruang itu menjadi ${story.gapSize} tiap ruang.`,
  )

  const dots: ReactNode[] = []
  for (let i = 0; i < beat.items; i++) {
    if (i > 0) dots.push(<Gap key={`g${i - 1}`} on={lit.has(i - 1)} still={still} />)
    dots.push(<Dot key={`d${i}`} n={i + 1} />)
  }
  if (beat.truncated) {
    dots.push(
      <span key="more" className="px-1 font-display text-xs font-extrabold" style={{ color: MUTED }}>
        …
      </span>,
    )
  }
  if (beat.ring) {
    dots.push(<Gap key="wrap" on={lit.has(beat.items - 1)} dashed still={still} />)
    dots.push(<Dot key="ghost" n={1} ghost />)
  }

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[15.625rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span
            className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {beat.ring ? T('Ring', 'Lingkaran') : T('Line', 'Barisan')}
          </span>
          <span
            className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
            style={{ color: AMBER_INK }}
          >
            {T('spaces in between', 'ruang di antaranya')}
          </span>
        </div>

        {/* The things and the spaces, side by side and never mixed up. */}
        <div className="flex w-full flex-wrap items-center justify-center" style={{ gap: '0.125rem' }}>
          {dots}
        </div>

        {/* Gap tally or the arithmetic for this beat. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.chip !== null && (
            <motion.span
              key={beat.chip}
              initial={still ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={still ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 26 }}
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={
                beat.trap
                  ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
                  : { background: AMBER_SOFT, borderColor: AMBER, color: AMBER_INK }
              }
            >
              {beat.chip}
            </motion.span>
          )}
          {beat.reveal !== null && (
            <motion.span
              initial={still ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }}
            >
              {T('Answer', 'Jawaban')} {beat.reveal}
            </motion.span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
