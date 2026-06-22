import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { LawnShape } from './Lawns18PEIllustration'
import { buildLawns18PESteps } from './lawns18PESteps'
import type { LawnLabel } from './lawns18PESteps'

// IKMC-22-PE-Q18 — "Which lawn is the smallest?" explainer.
//
// Strategy taught: count grid squares inside each lawn; the one with the
// fewest squares is the smallest. Lawn A (crown shape, ~7 sq) wins.
//
// Animation flow:
//   Beat 0 — intro caption; no lawn highlighted.
//   Beats 1–5 — each lawn A→E shown prominently; area tally fills in.
//   Beat 6 — result: A highlighted in green, confirmed as the answer.

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const GRAY = '#9CA3AF'
const GRAY_BG = '#F9FAFB'

const ALL_LABELS: LawnLabel[] = ['A', 'B', 'C', 'D', 'E']

interface TallyPillProps {
  label: LawnLabel
  area: number | undefined
  isActive: boolean
  isAnswer: boolean
}

function TallyPill({ label, area, isActive, isAnswer }: TallyPillProps) {
  const hasArea = area !== undefined
  const bg = isAnswer && hasArea ? GREEN_BG : isActive ? ORANGE_BG : hasArea ? GRAY_BG : '#F1F5F9'
  const ink = isAnswer && hasArea ? GREEN_INK : isActive ? '#92400E' : hasArea ? '#374151' : GRAY
  const border = isAnswer && hasArea ? GREEN : isActive ? ORANGE : hasArea ? '#D1D5DB' : '#E5E7EB'

  return (
    <motion.div
      layout
      className="flex min-w-[52px] flex-col items-center rounded-xl border-2 px-2 py-1"
      style={{ background: bg, borderColor: border, color: ink }}
      animate={{ scale: isActive ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <span className="font-display text-sm font-black">{label}</span>
      {hasArea ? (
        <span className="font-display text-xs font-bold">{area}</span>
      ) : (
        <span className="font-display text-xs font-bold" style={{ color: GRAY }}>?</span>
      )}
    </motion.div>
  )
}

export default function Lawns18PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLawns18PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const activeLawn = beat.activeLabel ?? null
  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Hitung kotak petak di dalam setiap halaman. Halaman A memiliki sekitar 7 kotak petak — paling sedikit — jadi jawabannya A.'
      : 'Explainer: Count grid squares inside each lawn. Lawn A has about 7 grid squares — the fewest — so the answer is A.'

  // Choose which lawn to show large in the centre panel.
  const featuredLabel: LawnLabel = activeLawn ?? 'A'
  const featuredIsAnswer = featuredLabel === story.answer && isResult

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Featured lawn (centre) */}
        <motion.div
          key={`lawn-${featuredLabel}-${index}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-1 rounded-2xl border-2 bg-white px-4 py-3"
          style={{
            borderColor: featuredIsAnswer ? GREEN : activeLawn ? ORANGE : '#E2E8F0',
          }}
        >
          {activeLawn && (
            <span
              className="font-display text-base font-black"
              style={{ color: featuredIsAnswer ? GREEN_INK : BLUE }}
            >
              {lang === 'id' ? 'Halaman' : 'Lawn'} {featuredLabel}
            </span>
          )}
          <LawnShape
            label={featuredLabel}
            width={130}
            highlightColor={featuredIsAnswer ? GREEN : undefined}
          />
        </motion.div>

        {/* Tally row — fills in as each lawn is examined */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {ALL_LABELS.map((lbl) => (
            <TallyPill
              key={lbl}
              label={lbl}
              area={beat.counted[lbl]}
              isActive={lbl === activeLawn && !isResult}
              isAnswer={lbl === story.answer && isResult}
            />
          ))}
        </div>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
