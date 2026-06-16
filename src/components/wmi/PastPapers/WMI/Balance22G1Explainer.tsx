import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FruitScale } from './Balance22G1Illustration'
import { buildBalance22G1Steps, BALANCE_ANSWER, BALANCE_ANSWER_ID } from './balance22G1Steps'

// Echoes the qupu tokens used in the static figure.
const GREEN = '#10B981' // fill-qupu-green (winning beat)
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue (working beats)
const BLUE_BG = '#E1EFFB'

export default function Balance22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalance22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pada Timbangan 1, ambil 1 pisang dari kedua sisi sehingga 3 pisang seimbang dengan 9 stroberi, jadi 1 pisang = 3 stroberi. Pada Timbangan 2, kelompok yang hilang seimbang dengan 6 stroberi, dan 6 = 3 + 3, jadi kelompok itu ${BALANCE_ANSWER_ID}.`
      : `Explainer: on Scale 1, take 1 banana off both sides so 3 bananas balance 9 strawberries, meaning 1 banana = 3 strawberries. On Scale 2 the missing group balances 6 strawberries, and 6 = 3 + 3, so the group is ${BALANCE_ANSWER}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Which scale + the fact deduced this beat. */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BLUE }}>
            {beat.scale === 1 ? T('Scale 1', 'Timbangan 1') : T('Scale 2', 'Timbangan 2')}
          </span>
          <motion.div
            key={`fact-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="rounded-full px-3 py-1 text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN, color: '#FFFFFF' }
                : { background: '#FFFFFF', border: `2px solid ${BLUE}`, color: BLUE }
            }
          >
            {beat.fact}
          </motion.div>
        </div>

        {/* The scale itself, redrawn each beat — mirrors the static figure. */}
        <motion.div
          key={`scale-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <FruitScale left={beat.left} right={beat.right} tilt={beat.tilt} />
        </motion.div>

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
