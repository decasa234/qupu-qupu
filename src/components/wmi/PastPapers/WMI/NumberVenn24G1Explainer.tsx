import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberVenn24G1 } from './NumberVenn24G1Illustration'
import { buildNumberVenn24G1Steps } from './numberVenn24G1Steps'

// Mirror the illustrator's qupu tokens so the animation reads as the same scene.
const GREEN = '#10B981' // fill-qupu-emerald — kept / the winning verdict
const ORANGE = '#F59E0B' // fill-qupu-brand-orange — matches the figure's amber rings
const BLUE = '#30598A' // working-state caption border
const GRAY = '#9CA3AF' // dropped chips

export default function NumberVenn24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberVenn24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const keptSet = new Set(beat.kept)
  const dropSet = new Set(beat.dropped)
  const conjoin = (xs: number[]) => {
    if (xs.length <= 1) return xs.join('')
    const word = lang === 'id' ? ' dan ' : ' and '
    return xs.slice(0, -1).join(', ') + word + xs[xs.length - 1]
  }
  const answerLine = `${story.keepers.join(', ')} → ${story.answer}`
  const keepList = story.keepers.join(', ')
  const dropList = conjoin(story.dropped)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: cari angka yang ada di dalam persegi dan lingkaran tapi bukan di segitiga. Angka itu adalah ${story.region.join(', ')}. Simpan yang lebih besar dari 40: ${keepList}; buang ${dropList} karena terlalu kecil. Tersisa ${story.answer} angka, jadi jawabannya ${story.answer}.`
      : `Explainer: find the numbers inside both the square and circle but not the triangle. Those are ${story.region.join(', ')}. Keep the ones bigger than 40: ${keepList}; drop ${dropList} because they are too small. ${story.answer} numbers remain, so the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Reuse the static figure; ring 90, 58, 44 only on the result beat. */}
        <NumberVenn24G1 highlightQualifying={beat.highlight} />

        {/* The six region numbers as chips — kept (green), dropped (gray) once filtered. */}
        <div className="flex flex-wrap justify-center gap-2">
          {beat.candidates.map((n) => {
            const isKept = keptSet.has(n)
            const isDropped = dropSet.has(n)
            const color = isKept ? GREEN : isDropped ? GRAY : BLUE
            return (
              <motion.div
                key={n}
                layout
                animate={{ opacity: isDropped ? 0.45 : 1, scale: isKept && beat.result ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="flex items-center gap-1 rounded-full border-2 px-2.5 py-1 font-display text-sm font-black tabular-nums"
                style={{ borderColor: color, color, background: '#FFFFFF' }}
              >
                <span>{n}</span>
                {isKept && <span aria-hidden>{'✓'}</span>}
                {isDropped && <span aria-hidden>{'✗'}</span>}
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
            {answerLine}
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
