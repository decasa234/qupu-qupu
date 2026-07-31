import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCountNumbersFromDigitsSteps, type ChipState } from './countNumbersFromDigitsSteps'
import { useBeatControl } from './useBeatControl'

// C8 `count-numbers-from-digits`. The figure is the METHOD, not the total: a
// place-frame with the first slot locked and the rest still open, so every beat
// answers "with THIS digit in front, what can follow?". The branch's numbers
// land as chips underneath — the ones that obey the rule stay green, the ones
// that do not go grey and get a drawn strike — and the tally only ever counts
// chips already on screen. Nothing announces a total until the last beat.

// Warm brand palette, literal hex so the figure reads the same on any surface.
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
const PAPER = '#FFFFFF'
const HAIR = '#E6D8C9'
const MUTED = '#9AA2AE'
const MUTED_SOFT = '#F3EEE8'
const INK = '#341857'

type TileState = 'idle' | 'chosen' | 'wrong'

const TILE: Record<TileState, { bg: string; border: string; ink: string }> = {
  idle: { bg: PAPER, border: HAIR, ink: INK },
  chosen: { bg: GREEN, border: GREEN, ink: '#FFFFFF' },
  wrong: { bg: ROSE_SOFT, border: ROSE, ink: ROSE },
}

const CHIP: Record<ChipState, { bg: string; border: string; ink: string }> = {
  kept: { bg: GREEN_SOFT, border: GREEN, ink: GREEN_INK },
  dropped: { bg: MUTED_SOFT, border: '#EADFD3', ink: MUTED },
  answer: { bg: AMBER_SOFT, border: AMBER, ink: AMBER_INK },
  more: { bg: PAPER, border: HAIR, ink: MUTED },
}

/** A diagonal strike, drawn over the whole box rather than typed as a glyph. */
function Strike() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      role="presentation"
    >
      <path d="M6 82 L94 18" fill="none" stroke={ROSE} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
    </svg>
  )
}

/**
 * The place-frame: `length` slots, the first one holding the digit this beat has
 * locked, the rest still open under a bracket. This is the picture of the
 * method — fix the front, then count what can follow.
 */
function SlotFrame({ length, first, restLabel, still }: {
  length: number
  first: number | null
  restLabel: string
  still: boolean
}) {
  const BOX_W = 38
  const BOX_H = 46
  const GAP = 8
  const width = length * BOX_W + (length - 1) * GAP
  const height = BOX_H + 26
  const x = (i: number) => i * (BOX_W + GAP)
  const restFrom = x(1)
  const restTo = x(length - 1) + BOX_W
  const locked = first !== null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="max-w-full"
      role="presentation"
    >
      {Array.from({ length }, (_, i) => {
        const isFirst = i === 0
        const filled = isFirst && locked
        return (
          <g key={i}>
            <rect
              x={x(i)}
              y={0}
              width={BOX_W}
              height={BOX_H}
              rx={9}
              fill={filled ? GREEN : PAPER}
              stroke={filled ? GREEN : isFirst ? BLUE : HAIR}
              strokeWidth={2.5}
              strokeDasharray={filled ? undefined : '5 4'}
            />
            {filled ? (
              <motion.text
                key={`d${first}`}
                x={x(i) + BOX_W / 2}
                y={BOX_H / 2 + 7}
                textAnchor="middle"
                fontSize={22}
                fontWeight={900}
                fill="#FFFFFF"
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={still ? { duration: 0 } : { duration: 0.25 }}
              >
                {first}
              </motion.text>
            ) : (
              <text
                x={x(i) + BOX_W / 2}
                y={BOX_H / 2 + 6}
                textAnchor="middle"
                fontSize={19}
                fontWeight={900}
                fill={isFirst ? BLUE : MUTED}
              >
                ?
              </text>
            )}
          </g>
        )
      })}
      {/* Bracket under every slot after the first: "and the rest can still change". */}
      <path
        d={`M ${restFrom} ${BOX_H + 4} v 5 H ${restTo} v -5`}
        fill="none"
        stroke={MUTED}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={(restFrom + restTo) / 2}
        y={height - 3}
        textAnchor="middle"
        fontSize={9}
        fontWeight={800}
        fill={MUTED}
      >
        {restLabel}
      </text>
    </svg>
  )
}

export default function CountNumbersFromDigitsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildCountNumbersFromDigitsSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const tileState = (d: number): TileState => {
    if (beat.lockedFirst === d) return 'chosen'
    if (beat.trap && d === 0) return 'wrong'
    return 'idle'
  }

  // Reserve the chip area so the caption does not jump between branches.
  const chipRows = Math.max(2, Math.ceil(story.capacity / 6))

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Method: lock one digit into the front place, list every ${story.length}-digit number that can follow it, keep only the ones that are ${story.ruleLabel}, then do the same for the next allowed front digit and add the branch counts together.`,
    `Metode: kunci satu angka di tempat pertama, tulis semua bilangan ${story.length} angka yang bisa mengikutinya, simpan yang ${story.ruleLabel} saja, lalu ulangi untuk angka depan berikutnya dan jumlahkan hitungan tiap cabang.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The pool we may draw from, and the rule every number has to obey. */}
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
            {T('Digit pool', 'Kumpulan angka')}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{ background: AMBER_SOFT, borderColor: AMBER, color: AMBER_INK }}
          >
            {story.ruleLabel}
          </span>
        </div>

        <div className="flex w-full flex-wrap justify-center" style={{ gap: '0.25rem' }}>
          {story.digits.map((d) => {
            const tone = TILE[tileState(d)]
            return (
              <motion.span
                key={d}
                className="inline-flex h-7 w-[1.5rem] items-center justify-center rounded-md border-2 font-display text-sm font-black tabular-nums"
                animate={{
                  backgroundColor: tone.bg,
                  borderColor: tone.border,
                  color: tone.ink,
                  scale: beat.lockedFirst === d ? 1.12 : 1,
                }}
                transition={still ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
                style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.ink }}
              >
                {d}
              </motion.span>
            )
          })}
        </div>

        {/* The method itself: first place locked, the rest still open. */}
        <SlotFrame
          length={story.length}
          first={beat.lockedFirst}
          restLabel={T('what can follow', 'yang bisa mengikuti')}
          still={still}
        />

        {/* Branch output: illegal leading-zero shapes first, then this branch's numbers. */}
        <div
          className="flex w-full flex-wrap content-start items-start justify-center gap-1"
          style={{ minHeight: `${chipRows * 1.85}rem` }}
        >
          {beat.struck.map((s) => (
            <span
              key={`x${s}`}
              className="relative inline-flex h-6 items-center justify-center rounded-md border-2 px-1.5 font-display text-[0.6875rem] font-black tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              {s}
              <Strike />
            </span>
          ))}
          {beat.chips.map((chip) => {
            const tone = CHIP[chip.state]
            return (
              <motion.span
                key={chip.key}
                initial={still ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={still ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 26 }}
                className="relative inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md border-2 px-1.5 font-display text-[0.6875rem] font-black tabular-nums"
                style={{ background: tone.bg, borderColor: tone.border, color: tone.ink }}
              >
                {chip.label}
                {chip.state === 'dropped' && <Strike />}
              </motion.span>
            )
          })}
        </div>

        {/* The running tally, and — on the last beat only — the answer. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.tally && (
            <span
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{
                background: beat.result ? GREEN_SOFT : BLUE_SOFT,
                borderColor: beat.result ? GREEN : BLUE,
                color: beat.result ? GREEN_INK : BLUE,
              }}
            >
              {beat.tally}
            </span>
          )}
          {beat.reveal !== null && (
            <motion.span
              data-answer="1"
              initial={still ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={still ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22 }}
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
