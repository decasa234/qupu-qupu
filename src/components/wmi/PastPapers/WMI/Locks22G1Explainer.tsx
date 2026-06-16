import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { LockRow } from './Locks22G1Illustration'
import { buildLocks22G1Steps } from './locks22G1Steps'

// Mirror the illustrator's tokens so the animation reads as the same scene.
const AMBER = '#F59E0B' // fill-qupu-amber — lock being checked this beat
const GREEN = '#10B981' // fill-qupu-grass — a lock that opens / winning state
const SLATE = '#64748B' // fill-qupu-slate — a lock that stays locked (rejected)

export default function Locks22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLocks22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: enam gembok bertuliskan 6+5=11, 14−4=10, 18−6=12, 7+9=16, 15−3−3=9, dan 4+6+4=14. Kunci hanya membuka gembok yang angkanya lebih dari 10 dan kurang dari 15. Periksa satu per satu: 11 terbuka, 10 tetap terkunci karena tidak lebih dari 10, 12 terbuka, 16 terlalu besar, 9 terlalu kecil, dan 14 terbuka. Jadi ada ${story.answer} gembok yang terbuka.`
      : `Explainer: six locks read 6+5=11, 14−4=10, 18−6=12, 7+9=16, 15−3−3=9, and 4+6+4=14. The key only opens a lock whose number is more than 10 and less than 15. Check them one by one: 11 opens, 10 stays locked because it is not more than 10, 12 opens, 16 is too big, 9 is too small, and 14 opens. So ${story.answer} locks open.`

  // Verdict chip colour: green when a lock opens, slate when it stays locked.
  const verdictColor = beat.pass ? GREEN : SLATE

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <LockRow openIndexes={beat.openIndexes} litIndex={beat.litIndex} />

        {beat.build && (
          <motion.div
            key={`build-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="flex items-center gap-2 font-display text-2xl font-black tabular-nums tracking-wide"
            style={{ color: beat.result ? GREEN : beat.fail ? SLATE : AMBER }}
          >
            <span>{beat.build}</span>
            {(beat.pass || beat.fail) && !beat.result && (
              <span style={{ color: verdictColor }}>{beat.pass ? '✓' : '✗'}</span>
            )}
          </motion.div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result || beat.pass
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.fail
                ? { background: '#F1F5F9', borderColor: SLATE, color: '#334155' }
                : { background: '#FEF3C7', borderColor: AMBER, color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
