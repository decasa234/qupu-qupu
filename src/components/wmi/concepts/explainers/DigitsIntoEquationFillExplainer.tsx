import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildDigitsIntoEquationFillSteps,
  type CardState,
  type SlotTone,
} from './digitsIntoEquationFillSteps'
import { useBeatControl } from './useBeatControl'

// Three stacked things, every beat: the card rail (what you may use), the boxes
// (what you are filling), and the LEDGER (which candidates are already dead).
// The ledger is the teaching surface — the child watches an exhaustive list get
// crossed off until exactly one line is left, which is precisely the argument
// the hint steps make in words.

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
const INK = '#341857'

const SLOT_TONE: Record<SlotTone, { bg: string; border: string; ink: string }> = {
  empty: { bg: PAPER, border: HAIR, ink: MUTED },
  trial: { bg: AMBER_SOFT, border: AMBER, ink: AMBER_INK },
  good: { bg: GREEN, border: GREEN, ink: '#FFFFFF' },
  bad: { bg: ROSE_SOFT, border: ROSE, ink: ROSE },
}

const CARD_TONE: Record<CardState, { bg: string; border: string; ink: string }> = {
  idle: { bg: PAPER, border: HAIR, ink: INK },
  trial: { bg: AMBER_SOFT, border: AMBER, ink: AMBER_INK },
  used: { bg: GREEN_SOFT, border: GREEN, ink: GREEN_INK },
  out: { bg: '#F3EEE8', border: '#EADFD3', ink: MUTED },
}

export default function DigitsIntoEquationFillExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildDigitsIntoEquationFillSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const lit = new Set(beat.litRows)
  const spring = still ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 26 }

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: read one column of the equation, list every arrangement it still allows, then cross them off one by one until a single one is left. The answer is ${story.answer}.`,
    `Strategi: baca satu kolom persamaan, daftar semua susunan yang masih mungkin, lalu coret satu per satu sampai tersisa satu. Jawabannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The pile of cards the child may draw from. */}
        <div className="flex w-full flex-col items-center gap-1">
          <span
            className="self-start font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {T('Cards', 'Kartu')}
          </span>
          <div className="flex w-full flex-wrap justify-center gap-1">
            {story.cards.map((card, i) => {
              const tone = CARD_TONE[beat.cards[i] ?? 'idle']
              return (
                <motion.span
                  key={card}
                  className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border-2 px-1 font-display text-[0.6875rem] font-black tabular-nums"
                  animate={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.ink }}
                  transition={spring}
                  style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.ink }}
                >
                  {card}
                </motion.span>
              )
            })}
          </div>
        </div>

        {/* The equation frame: boxes the cards drop into, plus its operators. */}
        <div className="flex w-full flex-wrap items-center justify-center gap-1 py-0.5">
          {story.tokens.map((token, i) => {
            if (token.kind === 'op') {
              return (
                <span
                  key={`op-${i}`}
                  className="px-0.5 font-display text-base font-black"
                  style={{ color: INK }}
                >
                  {token.text}
                </span>
              )
            }
            const slot = beat.slots[token.index] ?? { text: '', tone: 'empty' as SlotTone }
            const tone = SLOT_TONE[slot.tone]
            return (
              <motion.span
                key={`box-${token.index}`}
                className="inline-flex h-8 min-w-[1.75rem] items-center justify-center rounded-lg border-2 px-1 font-display text-sm font-black tabular-nums"
                animate={{
                  backgroundColor: tone.bg,
                  borderColor: tone.border,
                  color: tone.ink,
                  scale: slot.tone === 'good' ? 1.06 : 1,
                }}
                transition={spring}
                style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.ink }}
              >
                {slot.text === '' ? '□' : slot.text}
              </motion.span>
            )
          })}
        </div>

        {/* The sweep, filling in one beat at a time. */}
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center justify-between">
            <span
              className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
              style={{ color: MUTED }}
            >
              {T('Every possibility', 'Semua kemungkinan')}
            </span>
            <span
              className="rounded-full border-2 px-2 py-[0.0625rem] font-display text-[0.625rem] font-extrabold tabular-nums"
              style={{ background: PAPER, borderColor: HAIR, color: MUTED }}
            >
              {beat.rows.filter((r) => !r.ok).length} {T('ruled out', 'dicoret')}
            </span>
          </div>
          <div className="flex max-h-[7.5rem] min-h-[3.25rem] w-full flex-col gap-[0.1875rem] overflow-y-auto">
            {beat.rows.length === 0 ? (
              <span className="font-display text-[0.6875rem] font-extrabold" style={{ color: MUTED }}>
                {T('nothing tested yet', 'belum ada yang diuji')}
              </span>
            ) : (
              beat.rows.map((row, i) => (
                <motion.span
                  key={`${i}-${row.text}`}
                  initial={still ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={still ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
                  className="rounded-md border-2 px-2 py-[0.0625rem] text-left font-display text-[0.625rem] font-extrabold leading-tight tabular-nums"
                  style={{
                    background: row.ok ? GREEN_SOFT : lit.has(i) ? ROSE_SOFT : PAPER,
                    borderColor: row.ok ? GREEN : lit.has(i) ? ROSE : HAIR,
                    color: row.ok ? GREEN_INK : lit.has(i) ? ROSE : MUTED,
                  }}
                >
                  {row.text}
                </motion.span>
              ))
            )}
          </div>
        </div>

        {/* The answer, only once the sweep has actually finished. */}
        <div className="flex min-h-[1.5rem] w-full items-center justify-center">
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
