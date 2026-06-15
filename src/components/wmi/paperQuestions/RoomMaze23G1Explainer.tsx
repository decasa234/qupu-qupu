import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { RoomMaze23G1 } from './RoomMaze23G1Illustration'
import { buildRoomMaze23G1Steps } from './roomMaze23G1Steps'

// Echo the qupu tokens the static maze already uses so the animation reads as the
// same scene coming alive. The traced route + the lit-even rooms are drawn by the
// RoomMaze23G1 primitive (route in fill-qupu-brand-orange #f0853a, even rooms in
// fill-qupu-peach with an orange ring).
const ORANGE = '#f0853a' // fill-qupu-brand-orange (even / route accent)
const BLUE = '#30598A' // fill-qupu-brand-blue (intro / odd accent)
const GREEN = '#10B981' // result accent

export default function RoomMaze23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRoomMaze23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // The counter shows once we start walking; turns green on the final reveal.
  const counting = beat.phase === 'step' || beat.result
  const accent = beat.result ? GREEN : beat.even ? ORANGE : BLUE

  const ariaLabel = t(
    `Explainer: walk through exactly ${story.roomCount} rooms in the maze, choosing a route that steps on as many even-numbered rooms as possible. Only the entrance room 9 and one room 5 are odd, so at most ${story.answer} even rooms can be passed.`,
    `Penjelasan: lewati tepat ${story.roomCount} kamar di labirin, memilih rute yang menginjak sebanyak mungkin kamar bernomor genap. Hanya kamar pintu masuk 9 dan satu kamar 5 yang ganjil, jadi paling banyak ${story.answer} kamar genap bisa dilewati.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RoomMaze23G1 path={beat.path} highlightEven={beat.highlightEven} />

        {/* Tally panel: rooms passed (out of 8) vs. even rooms counted. */}
        <div className="flex w-full items-stretch justify-center gap-2">
          <TallyChip
            color={BLUE}
            label={t('rooms passed', 'kamar dilewati')}
            value={`${beat.passed} / ${story.roomCount}`}
            active={beat.phase === 'step' || beat.phase === 'intro'}
          />
          <div className="flex items-center font-display text-lg font-black text-qupu-muted">→</div>
          <TallyChip
            color={ORANGE}
            label={t('even rooms', 'kamar genap')}
            value={`${beat.evenCount}`}
            active={counting}
          />
        </div>

        {/* Running even-room counter during the walk + final reveal. */}
        {counting && (
          <motion.div
            key={`count-${beat.evenCount}-${beat.result ? 'r' : 's'}-${index}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: accent }}
          >
            {beat.evenCount}
          </motion.div>
        )}

        {/* Caption box. */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'step' && beat.even
                ? { background: '#FFF1E6', borderColor: ORANGE, color: '#9a4a12' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

function TallyChip({
  color,
  label,
  value,
  active,
}: {
  color: string
  label: string
  value: string
  active: boolean
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.96, opacity: active ? 1 : 0.7 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-2 py-1.5"
      style={{ borderColor: color, background: '#FFFFFF' }}
    >
      <span className="font-display text-base font-black tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-center text-[10px] font-bold uppercase tracking-wide text-qupu-muted">{label}</span>
    </motion.div>
  )
}
