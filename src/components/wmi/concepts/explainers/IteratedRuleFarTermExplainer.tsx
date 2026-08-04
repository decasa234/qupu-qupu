import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildIteratedRuleFarTermSteps,
  type IteratedRuleFarTermParams,
} from './iteratedRuleFarTermSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#30598A'
const PALE = '#E1EFFB'
const ORANGE = '#F97316'
const PEACH = '#FFE1C2'
const RUST = '#9A3412'
const GREEN = '#10B981'
const MINT = '#D1FAE5'
const FOREST = '#065F46'
const MUTED = '#9CA3AF'

const SIZE = 172
const CENTER = SIZE / 2
const RADIUS = 58
const NODE = 17

/**
 * Shows the two things a far-term question turns on: the strip of numbers with
 * its run-up marked off, and the block that repeats drawn as a ring so the
 * "coming round again" is literally visible. The final beat lights the slot the
 * remainder lands on.
 */
export default function IteratedRuleFarTermExplainer({
  params,
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const p = params as IteratedRuleFarTermParams
  const story = useMemo(() => buildIteratedRuleFarTermSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: tulis daftarnya, tandai bilangan awalan yang tidak kembali, lalu pakai sisa pembagian pada blok yang berulang.'
      : 'Strategy: write the list, mark off the run-up that never returns, then use the remainder on the repeating block.'

  const litSet = new Set(beat.lit)

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">
        {/* The list, with the run-up greyed once it has been spotted. */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          {story.strip.map((n, i) => {
            const inTail = beat.markTail && i < story.tailLength
            const inBlock =
              beat.markTail || beat.showRing ? i >= story.tailLength : false
            return (
              <motion.span
                key={i}
                initial={false}
                animate={{ opacity: i < beat.visible ? 1 : 0.15 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg px-2 py-1 font-display text-base font-black tabular-nums"
                style={
                  inTail
                    ? { background: '#F3F4F6', color: MUTED, boxShadow: `inset 0 0 0 2px ${MUTED}` }
                    : inBlock
                      ? { background: PEACH, color: RUST, boxShadow: `inset 0 0 0 2px ${ORANGE}` }
                      : { background: PALE, color: BLUE, boxShadow: `inset 0 0 0 2px ${BLUE}` }
                }
              >
                {n}
              </motion.span>
            )
          })}
          <span className="px-1 font-display text-base font-black" style={{ color: BLUE }}>
            …
          </span>
        </div>

        {beat.markTail && story.tailLength > 0 && (
          <div className="font-display text-xs font-extrabold" style={{ color: MUTED }}>
            {lang === 'id'
              ? `${story.tailLength} bilangan awalan tidak ikut berulang`
              : `${story.tailLength} run-up ${story.tailLength === 1 ? 'number' : 'numbers'} never repeat`}
          </div>
        )}

        {/* The repeating block as a ring: the picture of "it comes round again". */}
        <motion.div
          initial={false}
          animate={{ opacity: beat.showRing ? 1 : 0.18, scale: beat.showRing ? 1 : 0.92 }}
          transition={{ duration: 0.35 }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={beat.result ? GREEN : ORANGE}
              strokeWidth={3}
              strokeDasharray="7 6"
            />
            {story.cycleTerms.map((n, i) => {
              const angle = (-90 + (360 / story.cycleTerms.length) * i) * (Math.PI / 180)
              const cx = CENTER + RADIUS * Math.cos(angle)
              const cy = CENTER + RADIUS * Math.sin(angle)
              const lit = litSet.has(i + 1)
              return (
                <g key={i}>
                  <motion.circle
                    initial={false}
                    animate={{ r: lit ? NODE + 3 : NODE }}
                    transition={{ duration: 0.3 }}
                    cx={cx}
                    cy={cy}
                    fill={lit ? MINT : '#FFFFFF'}
                    stroke={lit ? GREEN : ORANGE}
                    strokeWidth={lit ? 3 : 2}
                  />
                  <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fontSize={15}
                    fontWeight={900}
                    fill={lit ? FOREST : RUST}
                  >
                    {n}
                  </text>
                </g>
              )
            })}
            <text
              x={CENTER}
              y={CENTER + 5}
              textAnchor="middle"
              fontSize={13}
              fontWeight={800}
              fill={BLUE}
            >
              {lang === 'id' ? `blok ${story.cycleLength}` : `block of ${story.cycleLength}`}
            </text>
          </svg>
        </motion.div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: MINT, borderColor: GREEN, color: FOREST }
              : { background: PALE, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
