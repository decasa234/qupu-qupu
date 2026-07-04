import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ItemScale } from './P22G3Q3Illustration'
import { buildP22G3Q3Steps, ANSWER_CHOICE } from './p22G3Q3Steps'

// WMI-22P3A-Q3 (2022 Grade 3 Semifinal) — pick the balanced scale.
// Answer A: 1 juice (5 apples) balances 1 bottle + 2 apples (3 + 2 = 5).
//
// The animation converts everything to apples, reads off juice = 5 and bottle =
// 3, sees the juice is heavier by 2 apples, then adds 2 apples to the bottle pan
// so both sides read 5 — a level scale. That matched picture is option A. Each
// beat re-uses the ItemScale primitive (juice / apple / bottle on a beam) so the
// animation reads as the figure coming alive. The balanced result lands last
// with hold 0.

const BLUE = '#30598A'
const GREEN = '#10B981'

/** Small "= N apples" badge for a pan tally. */
function AppleBadge({ n, result }: { n: number; result: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-0.5 font-display text-xs font-black tabular-nums"
      style={{
        background: result ? '#D1FAE5' : '#FFF7ED',
        borderColor: result ? GREEN : '#f0853a',
        color: result ? '#065F46' : '#9A3412',
      }}
    >
      {n}
      <svg width={11} height={11} viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M10 6 C 4.5 2.5 3 12 10 15 C 17 12 15.5 2.5 10 6 Z"
          fill="#E0533B"
          stroke="#A8341F"
          strokeWidth={1.2}
        />
        <line x1={10} y1={5} x2={10} y2={2} stroke="#6B4A2B" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function P22G3Q3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildP22G3Q3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: in apples, juice = 5 and bottle = 3, so juice = bottle + 2 apples. The balanced scale is choice ${ANSWER_CHOICE}.`,
    `Penjelasan: dalam apel, jus = 5 dan botol = 3, jadi jus = botol + 2 apel. Timbangan yang seimbang adalah pilihan ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The scale for this beat. */}
        <motion.div
          key={`fig-${index}`}
          initial={{ opacity: 0.7, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="w-full"
        >
          <ItemScale left={beat.left} right={beat.right} lit={beat.result} />
        </motion.div>

        {/* Apple tally under the two pans. */}
        {beat.appleTally && (
          <div className="flex w-full items-center justify-around">
            <AppleBadge n={beat.appleTally[0]} result={beat.result} />
            <span className="font-display text-base font-black" style={{ color: beat.result ? GREEN : BLUE }}>
              {beat.appleTally[0] === beat.appleTally[1] ? '=' : beat.appleTally[0] > beat.appleTally[1] ? '>' : '<'}
            </span>
            <AppleBadge n={beat.appleTally[1]} result={beat.result} />
          </div>
        )}

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
