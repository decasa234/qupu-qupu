import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildComparisonChainSteps, type ChainBeat, type ChainStoryboard } from './comparisonChainSolveSteps'
import { useBeatControl } from './useBeatControl'

// Warm brand palette — literal hex so the figure reads the same on any surface.
const BLUE = '#30598A' // a count already pinned
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700' // pinned on THIS beat / the answer
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F' // the tempting-but-wrong beat
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000' // the one printed count
const AMBER_SOFT = '#FFF3D4'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#8B94A3'
const MUTED_SOFT = '#F1F0EE'

type Tone = 'unknown' | 'given' | 'pinned' | 'fresh' | 'trap' | 'result'

const TONE: Record<Tone, { bar: string; bg: string; ink: string; border: string }> = {
  unknown: { bar: MUTED_SOFT, bg: '#FFFFFF', ink: MUTED, border: '#E3E0DC' },
  given: { bar: AMBER, bg: AMBER_SOFT, ink: '#8A6300', border: AMBER },
  pinned: { bar: BLUE, bg: BLUE_SOFT, ink: BLUE, border: BLUE },
  fresh: { bar: GREEN, bg: GREEN_SOFT, ink: GREEN_INK, border: GREEN },
  trap: { bar: ROSE, bg: ROSE_SOFT, ink: ROSE, border: ROSE },
  result: { bar: GREEN, bg: GREEN_SOFT, ink: GREEN_INK, border: GREEN },
}

/**
 * One child's row: name, the relation they are described by, and a bar whose
 * length is their count. Until the beat that pins them the bar is a dashed
 * empty track with a question mark — the figure never shows a count the story
 * has not yet earned.
 */
function ChainRow({
  name,
  relation,
  value,
  max,
  tone,
  still,
}: {
  name: string
  relation: string | null
  value: number | null
  max: number
  tone: Tone
  still: boolean
}) {
  const t = TONE[tone]
  const pct = value === null ? 0 : Math.max(6, Math.round((value / max) * 100))

  return (
    <div
      className="flex w-full items-center gap-2 rounded-2xl border-2 px-2.5 py-1.5"
      style={{ background: t.bg, borderColor: t.border }}
    >
      <div className="w-[4.75rem] shrink-0">
        <div className="truncate font-display text-[0.6875rem] font-extrabold" style={{ color: t.ink }}>
          {name}
        </div>
        <div className="truncate font-display text-[0.5625rem] font-bold tabular-nums" style={{ color: MUTED }}>
          {relation ?? ' '}
        </div>
      </div>

      <div
        className="relative h-5 flex-1 overflow-hidden rounded-full"
        style={{
          background: value === null ? 'transparent' : MUTED_SOFT,
          border: value === null ? `2px dashed ${t.border}` : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {value !== null && (
          <motion.div
            className="h-full rounded-full"
            initial={still ? false : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={still ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}
            style={{ background: t.bar }}
          />
        )}
      </div>

      <div
        className="w-[2.5rem] shrink-0 text-right font-display text-[1.0625rem] font-black leading-none tabular-nums"
        style={{ color: value === null ? MUTED : t.ink }}
      >
        {value === null ? '?' : value}
      </div>
    </div>
  )
}

function toneFor(story: ChainStoryboard, beat: ChainBeat, i: number): Tone {
  if (beat.trap && beat.trapIdx.includes(i)) return 'trap'
  if (beat.result && beat.resultIdx.includes(i)) return 'result'
  if (beat.known[i] === null) return 'unknown'
  if (beat.focus === i) return 'fresh'
  if (i === story.givenIndex) return 'given'
  return 'pinned'
}

export default function ComparisonChainSolveExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildComparisonChainSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const still = !!reduce

  const pinnedCount = beat.known.filter((v) => v !== null).length
  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: one bar per child. Only ${story.names[story.givenIndex]}'s count is printed, so each remaining bar is built from the one before it, one link at a time.`,
    `Strategi: satu batang untuk tiap anak. Cuma jumlah ${story.names[story.givenIndex]} yang tertulis, jadi batang lain dibangun dari batang sebelumnya, satu langkah demi satu langkah.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-1.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {story.names.map((name, i) => (
          <ChainRow
            key={name}
            name={name}
            relation={story.relations[i]}
            value={beat.known[i]}
            max={story.max}
            tone={toneFor(story, beat, i)}
            still={still}
          />
        ))}

        {/* Progress + the rose chip naming the tempting number. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2 pt-0.5">
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
            style={
              beat.result
                ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
                : { background: AMBER_SOFT, borderColor: AMBER, color: '#8A6300' }
            }
          >
            {T(
              `${pinnedCount} of ${story.names.length} pinned`,
              `${pinnedCount} dari ${story.names.length} terkunci`,
            )}
          </span>
          {beat.trap && beat.trapLabel && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={ROSE} strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              {beat.trapLabel}
            </span>
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
