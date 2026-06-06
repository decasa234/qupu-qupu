import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildRopeWrapsRatioSteps } from './ropeWrapsRatioSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const MUTED = '#94a3b8'
const BAR_A_COLOR = BLUE
const BAR_B_COLOR = ORANGE

interface BarRowProps {
  label: string
  value: number
  frac: number
  color: string
  dimmed?: boolean
  highlighted?: boolean
  isResult?: boolean
}

function BarRow({ label, value, frac, color, dimmed = false, highlighted = false, isResult = false }: BarRowProps) {
  const opacity = dimmed ? 0.35 : 1
  const borderColor = isResult ? GREEN : highlighted ? color : MUTED
  const bgColor = isResult ? '#D1FAE5' : '#F8FAFC'
  const valueColor = isResult ? '#065F46' : color

  return (
    <motion.div
      className="flex w-full items-center gap-2"
      animate={{ opacity }}
      transition={{ duration: 0.3 }}
    >
      {/* Label chip */}
      <div
        className="w-8 shrink-0 rounded-lg border-2 py-0.5 text-center font-display text-xs font-extrabold"
        style={{ borderColor, color: isResult ? '#065F46' : color, background: bgColor }}
      >
        {label}
      </div>

      {/* Bar track */}
      <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: isResult ? GREEN : color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(1, frac)) * 100}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        />
      </div>

      {/* Value badge */}
      <motion.div
        className="w-9 shrink-0 rounded-lg border-2 py-0.5 text-center font-display text-sm font-extrabold"
        style={{ borderColor, color: valueColor, background: bgColor }}
        animate={{ scale: highlighted || isResult ? [1, 1.14, 1] : 1 }}
        transition={{ duration: 0.4 }}
      >
        {value}
      </motion.div>
    </motion.div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-2 py-0.5">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

export default function RopeWrapsRatioExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { aWraps?: number; bWraps?: number; bSecond?: number }

  const story = useMemo(
    () => buildRopeWrapsRatioSteps(p.aWraps ?? 2, p.bWraps ?? 4, p.bSecond ?? 8, lang),
    [p.aWraps, p.bWraps, p.bSecond, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase
  const isRatio = phase === 'ratio'
  const isScale = phase === 'scale'
  const isResult = phase === 'result'

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Rope wraps ratio: A wraps ${story.aWraps} times, B wraps ${story.bWraps} times. When B wraps ${story.bSecond} times, A wraps ${story.answer} times.`,
    `Rasio lilitan tali: A melilit ${story.aWraps} kali, B melilit ${story.bWraps} kali. Saat B melilit ${story.bSecond} kali, A melilit ${story.answer} kali.`,
  )

  const rope1Label = T('Rope 1', 'Tali 1')
  const rope2Label = T('Rope 2', 'Tali 2')

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Proportion bars panel */}
        <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-2">

            {/* Rope 1 — the reference ratio */}
            <Divider label={rope1Label} />
            <BarRow
              label="A"
              value={story.aWraps}
              frac={beat.barAFrac}
              color={BAR_A_COLOR}
              highlighted={isRatio}
              dimmed={false}
            />
            <BarRow
              label="B"
              value={story.bWraps}
              frac={beat.barBFrac}
              color={BAR_B_COLOR}
              highlighted={isRatio}
              dimmed={false}
            />

            {/* Rope 2 — the scaled version */}
            <Divider label={rope2Label} />
            <BarRow
              label="B"
              value={story.bSecond}
              frac={beat.barBScaledFrac}
              color={BAR_B_COLOR}
              highlighted={isScale}
              dimmed={isRatio}
            />
            <BarRow
              label="A"
              value={story.answer}
              frac={beat.barAScaledFrac}
              color={BAR_A_COLOR}
              highlighted={isResult}
              isResult={isResult}
              dimmed={isRatio || isScale}
            />

          </div>
        </div>

        {/* Scale factor badge — shown from 'scale' onward */}
        <motion.div
          animate={{ opacity: isRatio ? 0 : 1, y: isRatio ? 6 : 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 font-display text-sm font-extrabold"
          style={{ borderColor: ORANGE, color: '#92400E', background: '#FFF7ED' }}
        >
          <span style={{ color: BAR_B_COLOR }}>B</span>
          <span style={{ color: MUTED }}>×</span>
          <span style={{ color: ORANGE }}>{story.scaleFactor}</span>
          <span style={{ color: MUTED }}>→</span>
          <span style={{ color: BAR_A_COLOR }}>A</span>
          <span style={{ color: MUTED }}>×</span>
          <span style={{ color: ORANGE }}>{story.scaleFactor}</span>
        </motion.div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
