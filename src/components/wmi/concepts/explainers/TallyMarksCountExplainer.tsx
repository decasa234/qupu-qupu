import { useMemo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildTallySteps } from './tallySteps'
import { useBeatControl } from './useBeatControl'

interface TallyParams {
  n: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'

export default function TallyMarksCountExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as TallyParams
  const story = useMemo(() => buildTallySteps(p?.n, lang), [p?.n, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const top = 10
  const bottom = 58
  const gap = 9
  const pitch = 4 * gap + 26
  const padX = 12
  const totalBlocks = story.fullGroups + (story.leftover > 0 ? 1 : 0)
  const width = padX * 2 + Math.max(1, totalBlocks) * pitch

  // Each mark draws itself in (pathLength). Stable keys keep already-drawn
  // marks static while a newly-revealed group animates.
  const vline = (key: string, x: number, color: string, delay = 0) => (
    <motion.line
      key={key}
      x1={x}
      y1={top}
      x2={x}
      y2={bottom}
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.22, delay }}
    />
  )

  const lines: ReactNode[] = []
  for (let g = 0; g < beat.groups; g++) {
    const gx = padX + g * pitch
    for (let i = 0; i < 4; i++) lines.push(vline(`g${g}-v${i}`, gx + i * gap, BLUE, i * 0.05))
    lines.push(
      <motion.line
        key={`g${g}-d`}
        x1={gx - 4}
        y1={bottom}
        x2={gx + 3 * gap + 4}
        y2={top}
        stroke={ORANGE}
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.22 }}
      />,
    )
  }
  if (beat.leftover > 0) {
    const gx = padX + beat.groups * pitch
    for (let i = 0; i < beat.leftover; i++) lines.push(vline(`lo-v${i}`, gx + i * gap, BLUE, i * 0.06))
  }

  const total = beat.groups * 5 + beat.leftover
  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: hitung kelompok turus lima-lima, lalu tambahkan sisanya.'
      : 'Strategy: count tally groups by fives, then add the leftover marks.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="font-display text-3xl font-black tabular-nums" style={{ color: beat.result ? GREEN : BLUE }}>
          {total}
        </div>
        <svg viewBox={`0 0 ${width} 68`} width={Math.min(360, width)} role="img" aria-hidden="true">
          {lines}
        </svg>
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
