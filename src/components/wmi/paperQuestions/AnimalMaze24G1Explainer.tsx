import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AnimalMaze24G1, ANIMAL_GLYPH, type AnimalKey } from './AnimalMaze24G1Illustration'
import { buildAnimalMaze24G1Steps } from './animalMaze24G1Steps'

// Echo the qupu tokens the static maze already uses so the animation reads as the
// same scene coming alive. The traced route is drawn by the AnimalMaze24G1
// primitive in its TRAIL orange (#F59E0B). We tint the running distance / record
// chips to match: orange for the current measure, green for the winner.
const ORANGE = '#F59E0B' // route + current-measure accent (matches the maze TRAIL)
const BLUE = '#30598A' // fill-qupu-brand-blue (intro / goal accent)
const GREEN = '#10B981' // result + "slowest so far" record accent
const GREY = '#C9CBD1' // not-yet-measured chips

// The same five letters the maze starts label, in measure order, so the chip
// rail mirrors the scene.
const RAIL_ORDER: AnimalKey[] = ['A', 'D', 'E', 'B', 'C']

export default function AnimalMaze24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAnimalMaze24G1Steps(props.correctAnswer, lang), [props.correctAnswer, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const accent = beat.result ? GREEN : beat.phase === 'intro' ? BLUE : beat.isNewLeader ? GREEN : ORANGE

  const ariaLabel = t(
    `Explainer: every animal moves at the same speed, so the one with the longest shortest route arrives last. Measuring each route — monkey ${story.distances.A}, lion ${story.distances.E}, dog ${story.distances.D}, chick ${story.distances.B}, tiger ${story.distances.C}. The tiger is boxed in and walks the farthest, so it arrives last. Answer ${story.answer}.`,
    `Penjelasan: semua hewan bergerak dengan kecepatan sama, jadi yang rute terpendeknya paling panjang tiba paling akhir. Mengukur tiap rute — monyet ${story.distances.A}, singa ${story.distances.E}, anjing ${story.distances.D}, anak ayam ${story.distances.B}, harimau ${story.distances.C}. Harimau terkurung dan berjalan paling jauh, jadi tiba paling akhir. Jawaban ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The maze coming alive: trace the current animal's shortest route. */}
        <AnimalMaze24G1 litPath={beat.litPath} />

        {/* Distance rail: one chip per animal, filling in as we measure. The
            chip holding the current "arrives last" record glows green. */}
        <div className="flex w-full items-stretch justify-center gap-1.5">
          {RAIL_ORDER.map((k) => {
            const at = story.steps.findIndex((s) => s.phase === 'measure' && s.animal === k)
            const revealed = at !== -1 && at <= index
            const dist = story.distances[k]
            const isCurrent = beat.animal === k
            const isRecord = revealed && beat.bestAnimal === k
            const color = !revealed ? GREY : isRecord ? GREEN : ORANGE
            return (
              <DistanceChip
                key={k}
                glyph={ANIMAL_GLYPH[k]}
                letter={k}
                value={revealed ? dist : null}
                color={color}
                active={isCurrent}
                record={isRecord}
              />
            )
          })}
        </div>

        {/* Running "arrives last so far" reveal — the biggest distance. */}
        {beat.phase !== 'intro' && (
          <motion.div
            key={`best-${beat.bestDistance}-${beat.result ? 'r' : 'm'}-${index}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="flex items-center gap-2 font-display text-2xl font-black tabular-nums"
            style={{ color: accent }}
          >
            <span>{beat.bestAnimal ? ANIMAL_GLYPH[beat.bestAnimal] : ''}</span>
            <span>
              {beat.bestDistance} {t('steps', 'langkah')}
            </span>
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
              : beat.phase === 'measure' && beat.isNewLeader
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : beat.phase === 'measure'
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

function DistanceChip({
  glyph,
  letter,
  value,
  color,
  active,
  record,
}: {
  glyph: string
  letter: AnimalKey
  value: number | null
  color: string
  active: boolean
  record: boolean
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1.06 : 1, opacity: value === null ? 0.55 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-1.5"
      style={{ borderColor: color, background: record ? '#ECFDF5' : '#FFFFFF' }}
    >
      <span className="text-lg leading-none" aria-hidden>
        {glyph}
      </span>
      <span className="font-display text-base font-black tabular-nums" style={{ color }}>
        {value === null ? '·' : value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-qupu-muted">{letter}</span>
    </motion.div>
  )
}
