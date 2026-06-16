import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ChildrenChairs25G1 } from './ChildrenChairs25G1Illustration'
import { buildChildrenChairs25G1Steps } from './childrenChairs25G1Steps'

// Palette echoes the static children/chairs illustration (qupu tokens).
const INK = '#1F2937'
const BRAND_BLUE = '#30598A' // qupu-brand-blue — running seat total
const ORANGE = '#f0853a' // qupu-brand-orange — standing children / answer accent
const SHELL = '#FFF9F4' // qupu-shell (panel)
const CREAM = '#FFF2DF' // qupu-cream
const TRAY_SIDE = '#E4DACB' // warm grey (panel border)
const WOOD_EDGE = '#B8895A' // chair edge, for the "+ seats" chip
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function ChildrenChairs25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildChildrenChairs25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: add up the chair sizes (1 + 1 + 1 + 2 + 2 + 1 + 3 = ${story.totalSeats} seats), then ${story.childCount} children − ${story.totalSeats} seats = ${story.answer} children with no seat.`,
    `Strategi: jumlahkan ukuran kursi (1 + 1 + 1 + 2 + 2 + 1 + 3 = ${story.totalSeats} tempat), lalu ${story.childCount} anak − ${story.totalSeats} tempat = ${story.answer} anak tidak kebagian kursi.`,
  )

  const adding = beat.phase === 'addChair' && beat.chairSeats != null

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: TRAY_SIDE }}
      >
        {/* counting ribbon — the chair being added + its seats */}
        <div className="flex h-7 items-center gap-2">
          {adding ? (
            <>
              <span className="font-display text-sm font-extrabold" style={{ color: WOOD_EDGE }}>
                {T('+ seats:', '+ tempat:')}
              </span>
              <motion.span
                key={`add-${index}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="font-display text-2xl font-black tabular-nums"
                style={{ color: ORANGE }}
              >
                +{beat.chairSeats}
              </motion.span>
            </>
          ) : (
            <span className="font-display text-sm font-extrabold" style={{ color: INK }}>
              {beat.phase === 'goal'
                ? T(`${story.childCount} children, 7 chairs`, `${story.childCount} anak, 7 kursi`)
                : beat.phase === 'result'
                  ? T('Answer found!', 'Jawaban ketemu!')
                  : T(`${story.totalSeats} seats in all`, `${story.totalSeats} tempat semuanya`)}
            </span>
          )}
        </div>

        {/* the scene — bind the built primitive, do NOT redraw */}
        <ChildrenChairs25G1 seated={beat.seated} />

        {/* the running seat total, or the subtraction once seats are full */}
        <div className="flex h-12 items-center gap-3">
          {beat.showSubtract ? (
            <>
              <Chip label={T('children', 'anak')} value={story.childCount} tone="ink" />
              <span className="font-display text-2xl font-black" style={{ color: INK }}>
                −
              </span>
              <Chip label={T('seats', 'tempat')} value={story.totalSeats} tone="blue" />
              {beat.result && (
                <>
                  <span className="font-display text-2xl font-black" style={{ color: INK }}>
                    =
                  </span>
                  <motion.span
                    key={`answer-${story.answer}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                    className="font-display text-3xl font-black tabular-nums"
                    style={{ color: ORANGE }}
                  >
                    {story.answer}
                  </motion.span>
                </>
              )}
            </>
          ) : beat.running > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xs font-extrabold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>
                {T('seats', 'tempat')}
              </span>
              <motion.span
                key={`run-${beat.running}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="font-display text-3xl font-black tabular-nums"
                style={{ color: BRAND_BLUE }}
              >
                {beat.running}
              </motion.span>
            </div>
          ) : null}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : adding
                ? { background: '#FFFFFF', borderColor: BRAND_BLUE, color: BRAND_BLUE }
                : { background: CREAM, borderColor: ORANGE, color: '#9A4A12' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

function Chip({ label, value, tone }: { label: string; value: number; tone: 'ink' | 'blue' }) {
  const color = tone === 'blue' ? BRAND_BLUE : INK
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-black tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="font-display text-[10px] font-extrabold uppercase tracking-wide" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
