import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { WmiAngleLetters } from './Angles23G3Illustration'
import { buildAngles23G3Steps, ANSWER_LABEL, ANSWER_CHOICE } from './angles23G3Steps'

// WMI-23F3A-Q2 (2023 Grade 3 Final) — order ∠1, ∠2, ∠3, ∠4 by eye.
// Answer C: ∠4 > ∠3 > ∠2 > ∠1. The four angles live in the letters W M I.
//
// The animation never asserts the order — it deduces it. First it spotlights
// ∠4's right-angle square (90°, the only right angle ⇒ biggest), then ranks the
// remaining three by how open they are: ∠3 (M's wide V) > ∠2 (M's upper-left) >
// ∠1 (W's sharp point). Each beat re-uses the WmiAngleLetters primitive so the
// animation reads as the static figure coming alive, and a rank chain fills in
// left → right as angles are placed. The winner lands last with hold 0.

const BLUE = '#30598A' // fill-qupu-brand-blue — neutral / in-progress
const ORANGE = '#f0853a' // fill-qupu-brand-orange — the spotlighted angle
const GREEN = '#10B981' // a placed / confirmed angle

// One pill per angle, matching the colour the figure highlights it with.
function RankPill({
  n,
  isNewest,
  result,
}: {
  n: 1 | 2 | 3 | 4
  isNewest: boolean
  result: boolean
}) {
  const bg = result ? '#D1FAE5' : isNewest ? '#FFF7ED' : '#E1EFFB'
  const border = result ? GREEN : isNewest ? ORANGE : BLUE
  const color = result ? '#065F46' : isNewest ? '#9A3412' : BLUE
  return (
    <motion.div
      layout
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      className="rounded-lg border-2 px-2.5 py-1 font-display text-sm font-black tabular-nums"
      style={{ background: bg, borderColor: border, color }}
    >
      {`∠${n}`}
    </motion.div>
  )
}

export default function Angles23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildAngles23G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: ∠4 is the only right angle (90°), so it's the largest; then the openings shrink — the M's wide V (∠3), the M's upper-left (∠2), and the W's sharp point (∠1). Order: ${ANSWER_LABEL}, choice ${ANSWER_CHOICE}.`,
    `Penjelasan: ∠4 satu-satunya sudut siku-siku (90°), jadi terbesar; lalu bukaannya mengecil — lembah V lebar M (∠3), kiri-atas M (∠2), dan ujung lancip W (∠1). Urutan: ${ANSWER_LABEL}, pilihan ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The letters, with the current angle spotlit by the shared primitive. */}
        <motion.div
          key={`fig-${beat.highlight ?? 0}-${beat.showValues ? 'v' : ''}`}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <WmiAngleLetters highlight={beat.highlight} showValues={beat.showValues} />
        </motion.div>

        {/* Rank chain: largest → smallest, filling in left to right with ">". */}
        <div className="flex min-h-[2.25rem] flex-wrap items-center justify-center gap-1.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.placed.map((n, i) => (
              <div className="flex items-center gap-1.5" key={`slot-${n}`}>
                {i > 0 && (
                  <span className="font-display text-sm font-black" style={{ color: BLUE }}>
                    {'>'}
                  </span>
                )}
                <RankPill n={n} isNewest={i === beat.placed.length - 1} result={beat.result} />
              </div>
            ))}
          </AnimatePresence>
          {beat.placed.length === 0 && (
            <span className="font-display text-xs font-bold" style={{ color: BLUE }}>
              {t('largest → smallest', 'terbesar → terkecil')}
            </span>
          )}
        </div>

        {/* Caption: kid-first, bilingual; green when we land the answer. */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
