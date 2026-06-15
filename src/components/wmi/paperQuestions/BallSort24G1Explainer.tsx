import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BallSort24G1, type BallColor } from './BallSort24G1Illustration'
import { buildBallSort24G1Steps } from './ballSort24G1Steps'

// Mirror the static figure's ball palette so the caption chip reads as the same
// scene (echoing the BallSort24G1Illustration fills).
const BALL_FILL: Record<BallColor, string> = {
  Y: '#ffdd55',
  R: '#E23B3B',
  W: '#FFFFFF',
}
const BALL_RIM: Record<BallColor, string> = {
  Y: '#C9A200',
  R: '#A11E1E',
  W: '#B7C2CC',
}

const INK = '#1F2937'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const POP = '#F59E0B' // amber accent on a "3-of-a-colour pops" beat

export default function BallSort24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBallSort24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const chipStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.cleared
      ? { background: '#FEF3C7', borderColor: POP, color: '#92400E' }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const countColor = beat.result ? GREEN : beat.cleared ? POP : BLUE

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pindahkan bola satu per satu agar tiga bola sewarna berkumpul dan hilang — langkah minimum ${story.answer}.`
      : `Explainer: move balls one at a time so three of a colour gather and pop — the fewest moves is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The board comes alive: each beat passes the state after its move. */}
        <BallSort24G1 state={beat.state} step={beat.move ?? undefined} />

        {/* Step tally + the ball that moved this beat. */}
        <div className="flex items-center gap-2 font-display text-2xl font-black tabular-nums" style={{ color: countColor }}>
          <AnimatePresence mode="popLayout">
            {beat.color && (
              <motion.svg
                key={`${index}-${beat.color}`}
                width={26}
                height={26}
                viewBox="0 0 26 26"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                aria-hidden="true"
              >
                <circle cx={13} cy={13} r={10} fill={BALL_FILL[beat.color]} stroke={BALL_RIM[beat.color]} strokeWidth={2} />
                <ellipse cx={9.7} cy={9.2} rx={3.4} ry={2.2} fill="#FFFFFF" opacity={0.5} />
              </motion.svg>
            )}
          </AnimatePresence>
          <motion.span key={beat.count} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 360, damping: 20 }}>
            {beat.count > 0 ? beat.count : ''}
          </motion.span>
          {beat.count > 0 && (
            <span className="text-sm font-bold" style={{ color: INK, opacity: 0.7 }}>
              {lang === 'id' ? 'langkah' : beat.count === 1 ? 'move' : 'moves'}
            </span>
          )}
        </div>

        {/* Pop badge on a clearing move (deduce: this triple just got removed). */}
        <AnimatePresence>
          {beat.cleared && !beat.result && (
            <motion.div
              key={`pop-${index}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="rounded-full px-3 py-0.5 font-display text-xs font-extrabold"
              style={{ background: POP, color: '#FFFFFF' }}
            >
              {lang === 'id' ? '3 sewarna → hilang!' : '3 of a colour → pop!'}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={chipStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
