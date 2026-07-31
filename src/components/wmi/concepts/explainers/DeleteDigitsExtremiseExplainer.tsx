import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDeleteDigitsExtremiseSteps, type CellState } from './deleteDigitsExtremiseSteps'
import { useBeatControl } from './useBeatControl'

// A digit strip with strike-throughs. The source strip never changes length or
// order — cells only change colour and get crossed out — so the child can see
// with their own eyes that deleting thins the line without reordering it. The
// answer strip below grows one digit at a time as each slot is decided.

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
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const PAPER = '#FFFFFF'
const HAIR = '#E6D8C9'
const MUTED = '#9AA2AE'
const INK = '#341857'

const TONE: Record<CellState, { bg: string; border: string; ink: string }> = {
  idle: { bg: PAPER, border: HAIR, ink: INK },
  window: { bg: AMBER_SOFT, border: AMBER, ink: '#8A6100' },
  chosen: { bg: GREEN, border: GREEN, ink: '#FFFFFF' },
  kept: { bg: GREEN_SOFT, border: GREEN, ink: GREEN_INK },
  struck: { bg: '#F3EEE8', border: '#EADFD3', ink: MUTED },
  wrong: { bg: ROSE_SOFT, border: ROSE, ink: ROSE },
}

/** One cell of the source strip. The strike is drawn, never a text glyph. */
function Cell({ digit, state, still }: { digit: string; state: CellState; still: boolean }) {
  const tone = TONE[state]
  return (
    <motion.span
      className="relative inline-flex h-7 w-[1.375rem] items-center justify-center rounded-md border-2 font-display text-sm font-black tabular-nums"
      animate={{
        backgroundColor: tone.bg,
        borderColor: tone.border,
        color: tone.ink,
        scale: state === 'chosen' ? 1.12 : 1,
      }}
      transition={still ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.ink }}
    >
      {digit}
      {state === 'struck' && (
        <svg
          viewBox="0 0 22 28"
          className="pointer-events-none absolute inset-0 h-full w-full"
          role="presentation"
        >
          <path d="M2 22 L20 6" fill="none" stroke={ROSE} strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
        </svg>
      )}
    </motion.span>
  )
}

export default function DeleteDigitsExtremiseExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildDeleteDigitsExtremiseSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const cells = story.digits.split('')
  const keptChars = beat.kept.split('')
  const lit = new Set(beat.keptLit)

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: cross digits out of ${story.digits} without ever moving one. Each kept digit is the ${story.objective === 'max' ? 'biggest' : 'smallest'} one that still leaves enough digits behind it, which leaves ${story.result}.`,
    `Strategi: coret angka dari ${story.digits} tanpa pernah memindahkannya. Setiap angka yang disimpan adalah angka ${story.objective === 'max' ? 'terbesar' : 'terkecil'} yang masih menyisakan cukup angka di belakangnya, sehingga tersisa ${story.result}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Board header: what is on the strip, and how many deletions are left. */}
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
            {T('Board', 'Papan')}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
            style={{
              background: beat.budgetLeft === 0 ? GREEN_SOFT : AMBER_SOFT,
              borderColor: beat.budgetLeft === 0 ? GREEN : AMBER,
              color: beat.budgetLeft === 0 ? GREEN_INK : '#8A6100',
            }}
          >
            {T(`${beat.budgetLeft} deletions left`, `Sisa hapusan ${beat.budgetLeft}`)}
          </span>
        </div>

        {/* The source strip — same digits, same places, every single beat. */}
        <div className="flex w-full flex-wrap justify-center" style={{ gap: '0.1875rem' }}>
          {cells.map((d, i) => (
            <Cell key={i} digit={d} state={beat.cells[i] ?? 'idle'} still={still} />
          ))}
        </div>

        {/* The answer strip, growing left to right. */}
        <div className="flex min-h-[2.5rem] w-full flex-col items-center gap-1">
          <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
            {T('Left standing', 'Yang tersisa')}
          </span>
          <div className="flex items-center" style={{ gap: '0.1875rem', minHeight: '1.75rem' }}>
            {keptChars.length === 0 ? (
              <span className="font-display text-[0.6875rem] font-extrabold" style={{ color: MUTED }}>
                {T('nothing chosen yet', 'belum ada yang dipilih')}
              </span>
            ) : (
              keptChars.map((d, i) => (
                <motion.span
                  key={`${i}-${d}`}
                  initial={still ? false : { scale: 0.5, opacity: 0, y: -6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={still ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 26 }}
                  className="inline-flex h-7 w-[1.375rem] items-center justify-center rounded-md border-2 font-display text-sm font-black tabular-nums"
                  style={{
                    background: lit.has(i) ? AMBER_SOFT : GREEN_SOFT,
                    borderColor: lit.has(i) ? AMBER : GREEN,
                    color: lit.has(i) ? '#8A6100' : GREEN_INK,
                  }}
                >
                  {d}
                </motion.span>
              ))
            )}
          </div>
        </div>

        {/* The rose chip naming the tempting sorted-digits number, or the answer. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.trap && beat.trapNumber && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={ROSE} strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              {beat.trapNumber}
            </span>
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
