import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CircleSums25G1 } from './CircleSums25G1Illustration'
import { buildCircleSums25G1Steps } from './circleSums25G1Steps'

// Palette echoes the static ring illustration (same qupu tokens / glyphs).
const BRAND_BLUE = '#30598A' // qupu-brand-blue — neutral chrome + given numerals
const ORANGE = '#f0853a' // qupu-brand-orange — shaded-circle accent + reveal
const SHELL = '#FFF9F4' // qupu-shell (panel background)
const PEACH = '#FFD3B1' // qupu-peach (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#D1FAE5'
const PEACH_SOFT = '#FDE3CF' // matches the shaded-circle wash in the figure

// A compact equation strip "shaded + 1 = 11" used on the locate / result beats.
// The unknown term shows a "?" until the answer is revealed, then it fills in
// orange to match the circle that lights up in the ring.
function PairEquation({
  given,
  pairSum,
  answer,
  revealed,
  T,
}: {
  given: number
  pairSum: number
  answer: number
  revealed: boolean
  T: (en: string, id: string) => string
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ background: revealed ? GREEN_SOFT : PEACH_SOFT, borderColor: revealed ? GREEN : ORANGE }}
    >
      <div className="flex flex-col items-center">
        <span className="font-display text-[10px] font-bold" style={{ color: BRAND_BLUE }}>
          {T('shaded', 'diarsir')}
        </span>
        <motion.span
          key={revealed ? 'val' : 'q'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="font-display text-xl font-black tabular-nums"
          style={{ color: revealed ? GREEN_INK : ORANGE }}
        >
          {revealed ? answer : '?'}
        </motion.span>
      </div>
      <span className="pb-1 font-display text-lg font-black" style={{ color: BRAND_BLUE }}>
        +
      </span>
      <div className="flex flex-col items-center">
        <span className="font-display text-[10px] font-bold" style={{ color: BRAND_BLUE }}>
          {T('partner', 'pasangan')}
        </span>
        <span className="font-display text-xl font-black tabular-nums" style={{ color: BRAND_BLUE }}>
          {given}
        </span>
      </div>
      <span className="pb-1 font-display text-lg font-black" style={{ color: BRAND_BLUE }}>
        =
      </span>
      <div className="flex flex-col items-center">
        <span className="font-display text-[10px] font-bold" style={{ color: BRAND_BLUE }}>
          {T('pair sum', 'jumlah pasangan')}
        </span>
        <span className="font-display text-xl font-black tabular-nums" style={{ color: ORANGE }}>
          {pairSum}
        </span>
      </div>
    </div>
  )
}

export default function CircleSums25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCircleSums25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: 1 + 2 + … + 10 = ${story.total} splits into ${story.pairs} opposite pairs that all share one sum, so each pair adds to ${story.pairSum}. The shaded circle is opposite the ${story.given}, so it must be ${story.pairSum} − ${story.given} = ${story.answer}. That is its only possible value, so the sum of possibilities is ${story.answer}.`,
    `Strategi: 1 + 2 + … + 10 = ${story.total} terbagi menjadi ${story.pairs} pasangan berseberangan yang semuanya berjumlah sama, jadi tiap pasangan berjumlah ${story.pairSum}. Lingkaran diarsir berseberangan dengan ${story.given}, jadi nilainya ${story.pairSum} − ${story.given} = ${story.answer}. Itu satu-satunya nilai yang mungkin, jadi jumlah kemungkinannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[360px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* pair-sum chip — the keystone fact, present from beat 1 on */}
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-extrabold" style={{ color: BRAND_BLUE }}>
            {T('Each opposite pair =', 'Tiap pasangan berseberangan =')}
          </span>
          <motion.span
            key={beat.pairSum}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: ORANGE }}
          >
            {beat.pairSum}
          </motion.span>
        </div>

        {/* the ten-circle ring — bind the built primitive, do NOT redraw */}
        <CircleSums25G1 revealShaded={beat.revealShaded} />

        {/* equation strip — appears once we focus the shaded circle's pair */}
        {beat.phase !== 'pair-sum' && (
          <PairEquation
            given={story.given}
            pairSum={story.pairSum}
            answer={story.answer}
            revealed={beat.revealShaded}
            T={T}
          />
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'locate'
                ? { background: PEACH_SOFT, borderColor: ORANGE, color: '#9a4a14' }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
