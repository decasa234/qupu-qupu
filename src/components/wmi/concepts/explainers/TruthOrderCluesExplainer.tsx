import { useMemo } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildTruthOrderSteps } from './truthOrderSteps'
import { useBeatControl } from './useBeatControl'

interface TruthOrderParams {
  order: string[]
}

const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_DARK = '#065F46'
const MUTED_BG = '#F8FAFC'
const MUTED_BORDER = '#CBD5E1'
const MUTED_TEXT = '#64748B'

const SPRING = { type: 'spring', stiffness: 360, damping: 30 } as const

/** A single name card, highlighted differently when it is the "new" card or the answer. */
function NameCard({
  name,
  isNew,
  isAnswer,
  position,
}: {
  name: string
  isNew: boolean
  isAnswer: boolean
  position: number
}) {
  const borderColor = isAnswer ? GREEN : isNew ? ORANGE : BLUE
  const bgColor = isAnswer ? GREEN_BG : isNew ? '#FFF4E8' : BLUE_BG
  const textColor = isAnswer ? GREEN_DARK : isNew ? '#9A3412' : BLUE

  return (
    <motion.div
      layout
      layoutId={`card-${name}`}
      transition={SPRING}
      className="flex flex-col items-center gap-1"
    >
      {/* Position badge (1st, 2nd, 3rd) */}
      <motion.div
        layout
        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold"
        style={{
          background: isAnswer ? GREEN : BLUE,
          color: '#fff',
        }}
      >
        {position}
      </motion.div>

      {/* Name chip */}
      <motion.div
        initial={false}
        animate={{
          scale: isNew || isAnswer ? [1, 1.12, 1] : 1,
          boxShadow: isAnswer
            ? '0 0 0 3px #10B981'
            : isNew
              ? '0 0 0 3px #F97316'
              : '0 0 0 0px transparent',
        }}
        transition={SPRING}
        className="flex h-11 min-w-[72px] items-center justify-center rounded-xl border-2 px-3 font-display text-base font-extrabold"
        style={{
          borderColor,
          background: bgColor,
          color: textColor,
        }}
      >
        {name}
      </motion.div>
    </motion.div>
  )
}

/** Arrow between cards showing the "before" relationship. */
function Arrow() {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      className="self-center pb-5 font-display text-xl font-extrabold"
      style={{ color: MUTED_TEXT }}
    >
      {'→'}
    </motion.span>
  )
}

/** Small placeholder card shown before an item is revealed. */
function PlaceholderCard({ position }: { position: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold"
        style={{ background: MUTED_BORDER, color: '#fff' }}
      >
        {position}
      </div>
      <div
        className="flex h-11 min-w-[72px] items-center justify-center rounded-xl border-2 border-dashed px-3 font-display text-base font-extrabold"
        style={{
          borderColor: MUTED_BORDER,
          background: MUTED_BG,
          color: MUTED_TEXT,
        }}
      >
        ?
      </div>
    </div>
  )
}

export default function TruthOrderCluesExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as TruthOrderParams

  const story = useMemo(
    () => buildTruthOrderSteps(Array.isArray(p.order) ? p.order : [], lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(p.order), lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { placed } = beat

  // How many total slots to render (always 3 to keep layout stable)
  const totalSlots = story.order.length

  const ariaLabel =
    lang === 'id'
      ? `Cara berpikir: rangkaikan petunjuk untuk menentukan urutan. ${story.answer} yang pertama.`
      : `Strategy: chain the clues to build the order. ${story.answer} is first.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">
        {/* Card row */}
        <div className="flex min-h-[88px] items-center justify-center">
          <LayoutGroup>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlots }).map((_, slotIdx) => {
                const name = placed[slotIdx]
                if (!name) {
                  return (
                    <div key={`slot-${slotIdx}`} className="flex items-center gap-2">
                      {slotIdx > 0 && placed.length > slotIdx && <Arrow />}
                      <PlaceholderCard position={slotIdx + 1} />
                    </div>
                  )
                }
                const isNew = beat.newIndex === slotIdx
                const isAnswer = beat.result && slotIdx === 0
                return (
                  <div key={name} className="flex items-center gap-2">
                    {slotIdx > 0 && <Arrow />}
                    <NameCard
                      name={name}
                      isNew={isNew}
                      isAnswer={isAnswer}
                      position={slotIdx + 1}
                    />
                  </div>
                )
              })}
            </div>
          </LayoutGroup>
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DARK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
