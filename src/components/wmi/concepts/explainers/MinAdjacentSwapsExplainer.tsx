import { useMemo, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { SwapRow } from '../min-adjacent-swaps'
import { buildMinAdjacentSwapsSteps } from './minAdjacentSwapsSteps'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'

// Warm brand palette — literal hex so the figure reads the same on any surface.
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

function Chip({
  bg,
  border,
  ink,
  children,
}: {
  bg: string
  border: string
  ink: string
  children: ReactNode
}) {
  return (
    <span
      className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
      style={{ background: bg, borderColor: border, color: ink }}
    >
      {children}
    </span>
  )
}

export default function MinAdjacentSwapsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildMinAdjacentSwapsSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  // The tally means "found so far" while counting and "still left" while
  // swapping, so it turns green only once it has actually reached zero.
  const tallyDone = beat.phase === 'swap' || beat.phase === 'result' ? beat.tally === 0 : false

  const ariaLabel = T(
    `Strategy: count every pair in the row that is the wrong way round, near or far, then watch one neighbour swap clear exactly one of those pairs at a time.`,
    `Strategi: hitung semua pasangan yang terbalik di baris ini, dekat maupun jauh, lalu lihat setiap tukar tetangga membereskan tepat satu pasang.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[16rem] flex-col items-center justify-start gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* what the finished row must look like — visible on every beat */}
        <Chip bg={GREEN_SOFT} border={GREEN} ink={GREEN_INK}>
          <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
            <path
              d="M2 9 L6 13 L14 4"
              fill="none"
              stroke={GREEN_INK}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {T(`Target ${story.target.join(', ')}`, `Target ${story.target.join(', ')}`)}
        </Chip>

        <div className="flex w-full justify-center py-1">
          <SwapRow
            values={beat.values}
            kind={story.kind}
            states={beat.states}
            link={beat.link}
            swap={beat.swap}
            rank={story.target}
            animate={!reduce}
          />
        </div>

        <div className="flex min-h-[1.75rem] w-full flex-wrap items-center justify-center gap-2">
          {beat.tallyLabel && !beat.trap && (
            <Chip
              bg={tallyDone ? GREEN_SOFT : AMBER_SOFT}
              border={tallyDone ? GREEN : AMBER}
              ink={tallyDone ? GREEN_INK : AMBER_INK}
            >
              {beat.tallyLabel}
            </Chip>
          )}
          {beat.swapsDone > 0 && (
            <Chip bg={BLUE_SOFT} border={BLUE} ink={BLUE}>
              {T(
                `${beat.swapsDone} ${beat.swapsDone === 1 ? 'swap' : 'swaps'} used`,
                `${beat.swapsDone} kali tukar`,
              )}
            </Chip>
          )}
          {beat.trap && beat.trapLabel && (
            <Chip bg={ROSE_SOFT} border={ROSE} ink={ROSE}>
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={ROSE} strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              {beat.trapLabel}
            </Chip>
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
