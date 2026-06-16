import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FRUIT_SETS, FruitGroup } from './Fruit22G1Option'
import { buildFruit22G1Steps } from './fruit22G1Steps'

// Mirror the illustrator's qupu tokens so the animation reads as the same scene.
const BLUE = '#30598A' // fill-qupu-brand-blue — building / neutral state
const RED = '#EF4444' // fill-qupu-red — a rejected option
const GREEN = '#10B981' // fill-qupu-grass — the winning set

// The static option figure uses a 100×100 viewBox with a circular frame
// (Fruit22G1Option). FruitGroup returns a bare <g>, so we re-create the same
// frame here so the animated set reads as the same scene coming alive.
const VIEW = 100

export default function Fruit22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFruit22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const rejected = beat.optionLabel != null && beat.pass === false
  const accent = beat.result ? GREEN : rejected ? RED : BLUE

  const heading =
    beat.optionLabel != null
      ? t(`Check option ${beat.optionLabel}`, `Cek pilihan ${beat.optionLabel}`)
      : beat.phase === 'goal'
        ? t('Build the rule', 'Bangun aturannya')
        : t('Follow the rule', 'Ikuti aturannya')

  // Build the strategy summary straight from FRUIT_SETS so the spoken label can
  // never drift from the option pictures the animation actually checks.
  const desc = (s: { strawberry: number; banana: number; apple: number }) =>
    lang === 'id'
      ? `${s.strawberry} stroberi, ${s.banana} pisang, ${s.apple} apel`
      : `${s.strawberry} strawberry, ${s.banana} bananas, ${s.apple} apples`
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: aturannya pisang dua kali stroberi, dan apel satu lebih banyak daripada pisang. Mulai dari 1 stroberi, jadi 2 pisang, lalu 3 apel — kelompok yang benar adalah ${desc(FRUIT_SETS.D)}. Pilihan A (${desc(FRUIT_SETS.A)}), B (${desc(FRUIT_SETS.B)}), dan C (${desc(FRUIT_SETS.C)}) tidak cocok dengan aturan, hanya D yang cocok. Jawabannya D.`
      : `Explainer: the rule is twice as many bananas as strawberries and one more apple than bananas. Start with 1 strawberry, so 2 bananas, then 3 apples — the correct set is ${desc(FRUIT_SETS.D)}. Options A (${desc(FRUIT_SETS.A)}), B (${desc(FRUIT_SETS.B)}), and C (${desc(FRUIT_SETS.C)}) all break the rule; only D matches. The answer is D.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* heading chip — names what this beat is doing */}
        <motion.div
          key={`head-${index}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="font-display text-xs font-bold uppercase tracking-wide"
          style={{ color: accent }}
        >
          {heading}
          {beat.optionLabel != null && (rejected ? '  ✗' : beat.result ? '  ✓' : '')}
        </motion.div>

        {/* the fruit set being built or checked, framed so a rejection reads */}
        <motion.div
          key={`frame-${index}`}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="rounded-2xl border-2 p-2"
          style={{
            borderColor: accent,
            background: beat.result ? '#ECFDF5' : rejected ? '#FEF2F2' : '#F2F7FC',
          }}
        >
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            width={160}
            height={160}
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW / 2 - 4} fill="#FFFFFF" stroke={accent} strokeWidth={3} />
            <FruitGroup counts={beat.counts} />
          </svg>
        </motion.div>

        {/* winning answer chip */}
        <AnimatePresence>
          {beat.result && (
            <motion.div
              key="answer-chip"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="font-display text-2xl font-black tracking-wide"
              style={{ color: GREEN }}
            >
              {t('Answer: D', 'Jawaban: D')}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : rejected
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
