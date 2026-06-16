import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberSquareCircleVenn } from './P23G1Q17Illustration'
import { buildP23G1Q17Steps } from './p23G1Q17Steps'

const GREEN = '#10B981'
const ORANGE = '#F59E0B'
const BLUE = '#30598A'

export default function P23G1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G1Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const sumLine = `${story.digits.join(' + ')} = ${story.total}`

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: angka yang di luar persegi tapi di dalam lingkaran adalah ${story.region.join(', ')}. Hitung jumlah angkanya: ${sumLine}. Jadi jawabannya ${story.answer}.`
      : `Explainer: the numbers outside the square but inside the circle are ${story.region.join(', ')}. Count their digits: ${sumLine}. So the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Reuse the static figure; ring the circle-only numbers from the region beat. */}
        <NumberSquareCircleVenn highlightCircleOnly={beat.highlight} />

        {/* The four circle-only numbers as chips; each shows its digit count once counting begins. */}
        <div className="flex flex-wrap justify-center gap-2">
          {story.region.map((n, i) => {
            const digits = story.digits[i]
            return (
              <motion.div
                key={n}
                layout
                animate={{ scale: beat.result ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-sm font-black tabular-nums"
                style={{
                  borderColor: beat.highlight ? ORANGE : BLUE,
                  color: beat.highlight ? ORANGE : BLUE,
                  background: '#FFFFFF',
                }}
              >
                <span>{n}</span>
                {beat.showDigits && (
                  <span
                    className="rounded-full px-1.5 text-xs"
                    style={{ background: '#FEF3C7', color: '#92400E' }}
                    aria-hidden
                  >
                    {digits === 1 ? (lang === 'id' ? '1 angka' : '1 digit') : lang === 'id' ? '2 angka' : '2 digits'}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: ORANGE }}
          >
            {sumLine}
          </motion.div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
