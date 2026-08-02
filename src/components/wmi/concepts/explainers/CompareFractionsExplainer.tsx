import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildCompareFractionsSteps,
  type CompareFractionsBar,
  type CompareFractionsParams,
} from './compareFractionsSteps'
import { useBeatControl } from './useBeatControl'

// qupu tokens, matched to the other concept explainers.
const SHELL = '#FFF9F4' // qupu-shell
const PEACH = '#FFD3B1' // qupu-peach
const CREAM = '#FFF2DF' // qupu-cream
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const ROSE = '#e11d48'
const MUTED = '#9aa3b2'

const BAR_W = 208
const BAR_H = 26

type BarState = 'idle' | 'focus' | 'out' | 'win'

/**
 * One fraction drawn as a bar: a whole cut into `den` equal pieces with `num` of
 * them shaded. On `recut` the SAME shaded length is re-cut into the shared piece
 * size — the length never moves, only the number of cuts, which is exactly what
 * "equivalent fraction" means.
 */
function FractionBar({
  bar,
  state,
  recut,
  half,
}: {
  bar: CompareFractionsBar
  state: BarState
  recut: boolean
  half: boolean
}) {
  const den = recut ? bar.scaledDen : bar.den
  const num = recut ? bar.scaledNum : bar.num
  const fillW = (BAR_W * num) / den

  const fill =
    state === 'win' ? GREEN : state === 'out' ? MUTED : state === 'focus' ? BRAND_BLUE : PEACH
  const stroke = state === 'win' ? GREEN_INK : state === 'out' ? MUTED : BRAND_BLUE
  const ink = state === 'win' ? GREEN_INK : state === 'out' ? MUTED : BRAND_BLUE

  return (
    <motion.div
      className="flex items-center gap-2"
      animate={{
        opacity: state === 'out' ? 0.5 : 1,
        scale: state === 'focus' || state === 'win' ? 1.03 : 1,
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
    >
      <span
        className="w-6 shrink-0 text-center font-display text-sm font-black"
        style={{ color: ink }}
      >
        {bar.label}
      </span>
      <span
        className="w-11 shrink-0 text-right font-display text-sm font-extrabold tabular-nums"
        style={{ color: ink }}
      >
        {`${bar.num}/${bar.den}`}
      </span>
      <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} width={BAR_W} height={BAR_H} role="presentation">
        <rect x={1} y={1} width={BAR_W - 2} height={BAR_H - 2} rx={7} fill={CREAM} />
        <motion.rect
          x={1}
          y={1}
          height={BAR_H - 2}
          rx={7}
          fill={fill}
          initial={false}
          animate={{ width: Math.max(0, fillW - 2), fill }}
          transition={{ type: 'spring', stiffness: 150, damping: 22 }}
        />
        {/* the cuts: one line between each pair of pieces */}
        {Array.from({ length: den - 1 }, (_, i) => (
          <motion.line
            key={`${den}-${i}`}
            x1={(BAR_W * (i + 1)) / den}
            y1={2}
            x2={(BAR_W * (i + 1)) / den}
            y2={BAR_H - 2}
            stroke={stroke}
            strokeWidth={1.2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ duration: 0.35 }}
          />
        ))}
        {/* the one-half mark, drawn only while the benchmark is in play */}
        {half && (
          <motion.line
            x1={BAR_W / 2}
            y1={-1}
            x2={BAR_W / 2}
            y2={BAR_H + 1}
            stroke={ROSE}
            strokeWidth={2.4}
            strokeDasharray="4 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <rect
          x={1}
          y={1}
          width={BAR_W - 2}
          height={BAR_H - 2}
          rx={7}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
        />
      </svg>
    </motion.div>
  )
}

export default function CompareFractionsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as CompareFractionsParams
  const story = useMemo(() => buildCompareFractionsSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.beats.map((b) => b.hold),
  })
  const beat = story.beats[index] ?? story.beats[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const barState = (i: number): BarState => {
    if (beat.result && i === story.answerIndex) return 'win'
    if (beat.rejected.includes(i)) return 'out'
    if (beat.focus === i) return 'focus'
    return 'idle'
  }

  const ariaLabel = T(
    `Fraction bars for ${story.bars.map((b) => `${b.num}/${b.den}`).join(', ')}. The winner is ${story.bars[story.answerIndex].num}/${story.bars[story.answerIndex].den}, answer ${story.answerLabel}.`,
    `Batang pecahan untuk ${story.bars.map((b) => `${b.num}/${b.den}`).join(', ')}. Pemenangnya ${story.bars[story.answerIndex].num}/${story.bars[story.answerIndex].den}, jawabannya ${story.answerLabel}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div className="flex w-full flex-col items-center gap-2">
          {story.bars.map((bar, i) => (
            <FractionBar
              key={bar.label}
              bar={bar}
              state={barState(i)}
              // Only the odd bar out is ever re-cut; the rest are already in the
              // shared piece size, so their drawing does not change.
              recut={beat.recut && bar.scaledDen !== bar.den}
              half={beat.half}
            />
          ))}
        </div>

        {beat.half && (
          <div className="font-display text-xs font-extrabold" style={{ color: ROSE }}>
            {T('dashed line = one half', 'garis putus-putus = setengah')}
          </div>
        )}

        <div
          className="mt-auto rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
