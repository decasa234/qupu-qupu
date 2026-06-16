import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardLayout24G3, POSITIONS } from './CardLayout24G3Illustration'
import { buildCardLayout24G3Steps } from './cardLayout24G3Steps'

// Post-answer explainer for WMI-24F3A-Q22. It deduces one lettered card per
// beat from the players' picks, revealing the hidden digit through the shared
// CardLayout24G3 primitive (so the animation reads as the static scene coming
// alive) and assembling the 6-digit number A..F. Pure render of params + lang;
// deterministic and SSR-safe.

// Palette echoes the static illustration (qupu-* tokens via raw hex).
const INK = '#1F2937' // qupu ink / slate
const CREAM = '#FFF6E0' // qupu-cream card face
const CREAM_EDGE = '#E4C97A' // warm card border
const SHELL = '#FFF9F4' // qupu-shell panel
const PEACH = '#FFD3B1' // qupu-peach
const BLUE = '#2D7FB8' // qupu-brand-blue
const BLUE_DK = '#1E5C86'
const ORANGE = '#F2912B' // qupu-brand-orange
const ORANGE_DK = '#C56A12'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

// One slot in the A..F readout strip. Shows the position letter until its digit
// is decided, then flips to the digit; the just-decided slot pops + tints green.
function ReadoutSlot({
  letter,
  digit,
  decidedNow,
  win,
}: {
  letter: string
  digit: string // '?' until decided
  decidedNow: boolean
  win: boolean
}) {
  const decided = digit !== '?'
  const accent = win ? GREEN : decided ? BLUE : CREAM_EDGE
  const bg = win ? '#ECFDF5' : decided ? '#EAF3FA' : CREAM
  const ink = win ? GREEN_INK : decided ? BLUE_DK : INK

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-[10px] font-extrabold" style={{ color: decided ? BLUE_DK : '#9aa3b2' }}>
        {letter}
      </span>
      <motion.div
        className="flex h-9 w-8 items-center justify-center rounded-md border-2 font-display text-xl font-black tabular-nums"
        style={{ background: bg, borderColor: accent, color: ink }}
        animate={{ scale: decidedNow ? [1, 1.22, 1] : 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {decided ? digit : letter}
      </motion.div>
    </div>
  )
}

// The growing 6-digit answer chip; lights up green on the winning beat.
function AnswerChip({ readout, win }: { readout: string; win: boolean }) {
  return (
    <motion.div
      className="rounded-xl border-2 px-4 py-1.5 font-display text-2xl font-black tabular-nums tracking-[0.12em]"
      style={
        win
          ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
          : { background: SHELL, borderColor: PEACH, color: BLUE_DK }
      }
      animate={{ scale: win ? [1, 1.08, 1] : 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {readout}
    </motion.div>
  )
}

export default function CardLayout24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCardLayout24G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    `Strategy: pin A=2 and E=3 from Ava, use Donna's win and Bella's loss to get C=D=1, then Cindy's loss to place F=3 and B=2. The 6-digit number A to F is ${story.answer}.`,
    `Strategi: tetapkan A=2 dan E=3 dari Ava, pakai kemenangan Donna dan kekalahan Bella untuk mendapat C=D=1, lalu kekalahan Cindy untuk menempatkan F=3 dan B=2. Bilangan 6 angka A sampai F adalah ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* legend: which colour means which player this beat */}
        <div className="flex w-full items-center justify-center gap-4 font-display text-[11px] font-extrabold">
          <span className="flex items-center gap-1" style={{ color: BLUE_DK }}>
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: BLUE }} aria-hidden />
            {T('this card', 'kartu ini')}
          </span>
          <span className="flex items-center gap-1" style={{ color: ORANGE_DK }}>
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ORANGE }} aria-hidden />
            {T('the clue card', 'kartu petunjuk')}
          </span>
        </div>

        {/* the six lettered cards, reusing the static primitive so revealed
            digits + player tints animate the same scene */}
        <CardLayout24G3 reveal={beat.reveal} pickBlue={beat.pickBlue} pickOrange={beat.pickOrange} />

        {/* per-position A..F readout strip — flips letters to digits as we deduce */}
        <div className="flex items-end justify-center gap-1.5">
          {POSITIONS.map((p, i) => (
            <ReadoutSlot
              key={p}
              letter={p}
              digit={beat.readout[i]}
              decidedNow={beat.decide === p}
              win={beat.result}
            />
          ))}
        </div>

        {/* the growing 6-digit answer */}
        <AnswerChip readout={beat.readout} win={beat.result} />

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BLUE_DK, color: BLUE_DK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
