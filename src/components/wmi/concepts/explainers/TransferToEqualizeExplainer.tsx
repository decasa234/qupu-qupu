import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildTransferEqualizeSteps, type TransferBeat } from './transferEqualizeSteps'
import { useBeatControl } from './useBeatControl'

// Warm brand palette — literal hex so the figure reads the same on any surface.
const BLUE = '#30598A' // giver's own counters
const BLUE_SOFT = '#E1EFFB'
const ORANGE = '#F0853A' // receiver's own counters
const ORANGE_SOFT = '#FFEBDA'
const GREEN = '#58A700' // settled / just landed
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F' // the tempting-but-wrong beat
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000' // the bracketed gap
const AMBER_SOFT = '#FFF3D4'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#8B94A3'

const DOT = 15 // counter diameter, px
const DOT_GAP = 4
const PER_LINE = 10

type Ring = 'none' | 'glow' | 'gap' | 'wrong'

/**
 * One counter. `id` is a stable token index, so the same counter keeps its
 * identity (and its owner's colour) as it travels between the rows — framer
 * animates the hand-over instead of popping it in a new place.
 */
function Counter({ id, tone, ring, still }: { id: string; tone: 'A' | 'B' | 'ghost'; ring: Ring; still: boolean }) {
  const fill = tone === 'A' ? BLUE : tone === 'B' ? ORANGE : ROSE_SOFT
  const ringColor = ring === 'glow' ? GREEN : ring === 'gap' ? AMBER : ring === 'wrong' ? ROSE : null

  return (
    <motion.span
      layoutId={still ? undefined : `tq-${id}`}
      initial={still ? false : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={still ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
      style={{
        width: DOT,
        height: DOT,
        borderRadius: '50%',
        background: fill,
        border: tone === 'ghost' ? `2px dashed ${ROSE}` : `1px solid rgba(0,0,0,0.12)`,
        boxShadow: ringColor ? `0 0 0 3px ${ringColor}55` : undefined,
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

/** One child's row: name, running count, and their counters. */
function CounterRow({
  name,
  side,
  count,
  tokens,
  startA,
  glow,
  gapCount,
  phantom,
  trap,
  settled,
  lines,
  still,
}: {
  name: string
  side: 'A' | 'B'
  count: number
  tokens: number[]
  startA: number
  glow: Set<number>
  gapCount: number
  phantom: number
  trap: boolean
  settled: boolean
  lines: number
  still: boolean
}) {
  const accent = trap ? ROSE : settled ? GREEN : side === 'A' ? BLUE : ORANGE
  const bg = trap ? ROSE_SOFT : settled ? GREEN_SOFT : side === 'A' ? BLUE_SOFT : ORANGE_SOFT
  const ink = trap ? ROSE : settled ? GREEN_INK : side === 'A' ? BLUE : '#A8500F'
  // The gap is the tail of the leader's row: the counters they hold over the
  // other child. Highlighting the tail (not the head) keeps the just-arrived
  // counters at the head readable as "new".
  const gapFrom = tokens.length - Math.min(gapCount, tokens.length)

  return (
    <div
      className="flex w-full items-center gap-2 rounded-2xl border-2 px-2.5 py-2"
      style={{ background: bg, borderColor: accent }}
    >
      <div className="w-[4.5rem] shrink-0">
        <div className="truncate font-display text-[0.6875rem] font-extrabold" style={{ color: ink }}>
          {name}
        </div>
        <div className="font-display text-[1.375rem] font-black leading-none tabular-nums" style={{ color: ink }}>
          {count}
        </div>
      </div>
      <div
        className="flex flex-1 flex-wrap content-center items-center"
        style={{ gap: DOT_GAP, minHeight: lines * (DOT + DOT_GAP) }}
      >
        {tokens.map((id, i) => (
          <Counter
            key={`t${id}`}
            id={String(id)}
            tone={id < startA ? 'A' : 'B'}
            ring={glow.has(id) ? 'glow' : gapCount > 0 && i >= gapFrom ? 'gap' : 'none'}
            still={still}
          />
        ))}
        {Array.from({ length: phantom }, (_, i) => (
          <Counter key={`ph${i}`} id={`ph${i}`} tone="ghost" ring="wrong" still />
        ))}
      </div>
    </div>
  )
}

/** The band between the rows: which way things travel, and what is mid-air. */
function FlightBand({
  beat,
  startA,
  still,
  label,
}: {
  beat: TransferBeat
  startA: number
  still: boolean
  label: string | null
}) {
  const down = beat.direction !== 'BtoA'
  const color = beat.trap ? ROSE : beat.direction ? GREEN : MUTED
  const arrow = down ? 'M6 1 L6 15 M1.5 10 L6 15 L10.5 10' : 'M6 15 L6 1 M1.5 6 L6 1 L10.5 6'

  return (
    <div className="flex min-h-[1.75rem] items-center justify-center gap-2">
      {beat.direction && (
        <svg viewBox="0 0 12 16" width={11} height={15} role="presentation">
          <path d={arrow} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {beat.flight.length > 0 && (
        <div className="flex items-center" style={{ gap: DOT_GAP }}>
          {beat.flight.map((id) => (
            <Counter key={`f${id}`} id={String(id)} tone={id < startA ? 'A' : 'B'} ring="wrong" still={still} />
          ))}
        </div>
      )}
      {label && (
        <span
          className="rounded-full px-2 py-[0.0625rem] font-display text-[0.625rem] font-extrabold"
          style={{ background: beat.trap ? ROSE_SOFT : GREEN_SOFT, color: beat.trap ? ROSE : GREEN_INK }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export default function TransferToEqualizeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildTransferEqualizeSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const still = !!reduce

  // Counters that changed hands on THIS beat. Going out, the newcomer sits at
  // the head of the receiver's row; coming back, at the tail of the giver's.
  const glow = useMemo(() => {
    const set = new Set<number>()
    if (beat.moved <= 0 || !beat.direction) return set
    if (beat.direction === 'AtoB') beat.rowB.slice(0, beat.moved).forEach((id) => set.add(id))
    else beat.rowA.slice(Math.max(0, beat.rowA.length - beat.moved)).forEach((id) => set.add(id))
    return set
  }, [beat])

  const lines = Math.max(1, Math.ceil(story.capacity / PER_LINE))
  const gapA = beat.gap && beat.gap.side === 'A' ? beat.gap.count : 0
  const gapB = beat.gap && beat.gap.side === 'B' ? beat.gap.count : 0

  const bandLabel =
    beat.flight.length > 0
      ? T(`${beat.flight.length} in the air`, `${beat.flight.length} melayang`)
      : beat.movedTotal > 0
        ? story.ask === 'find-original'
          ? T(`${beat.movedTotal} put back`, `${beat.movedTotal} dikembalikan`)
          : T(`${beat.movedTotal} moved`, `${beat.movedTotal} pindah`)
        : null

  // Gap read-out, always the difference actually on screen. It is introduced on
  // the gap beat (not the bare setup), and on a trap beat it steps aside for the
  // rose chip naming the tempting number.
  const gapValue = Math.abs(beat.countA - beat.countB)
  const showGapChip = beat.phase !== 'setup' && !beat.trap
  const gapSettled = gapValue === 0 || beat.result
  const gapTone = gapSettled ? GREEN : AMBER
  const gapBg = gapSettled ? GREEN_SOFT : AMBER_SOFT

  const rowFlag = (row: 'A' | 'B', field: 'A' | 'B' | 'both' | null) => field === row || field === 'both'

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: move counters between ${story.nameA} and ${story.nameB} one at a time. Each item that changes hands moves the gap by 2, because one child loses it and the other gains it.`,
    `Strategi: pindahkan benda antara ${story.nameA} dan ${story.nameB} satu per satu. Setiap benda yang pindah mengubah selisih sebanyak 2, karena satu anak berkurang dan satu lagi bertambah.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <CounterRow
          name={story.nameA}
          side="A"
          count={beat.countA}
          tokens={beat.rowA}
          startA={story.startA}
          glow={glow}
          gapCount={gapA}
          phantom={0}
          trap={rowFlag('A', beat.trapRow)}
          settled={rowFlag('A', beat.highlightRow)}
          lines={lines}
          still={still}
        />

        <FlightBand beat={beat} startA={story.startA} still={still} label={bandLabel} />

        <CounterRow
          name={story.nameB}
          side="B"
          count={beat.countB}
          tokens={beat.rowB}
          startA={story.startA}
          glow={glow}
          gapCount={gapB}
          phantom={beat.phantomB}
          trap={rowFlag('B', beat.trapRow)}
          settled={rowFlag('B', beat.highlightRow)}
          lines={lines}
          still={still}
        />

        {/* Gap read-out + the rose chip naming the tempting number. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {showGapChip && (
            <span
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: gapBg, borderColor: gapTone, color: gapTone }}
            >
              {T(`Gap ${gapValue}`, `Selisih ${gapValue}`)}
            </span>
          )}
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
