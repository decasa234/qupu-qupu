import { useMemo } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMakeTenSteps } from './makeTenSteps'
import { useBeatControl } from './useBeatControl'

interface AddParams {
  a: number
  b: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const EMPTY_BORDER = '#E6DCC6'

function Chip({ color, layoutId }: { color: string; layoutId?: string }) {
  return (
    <motion.span
      layout
      layoutId={layoutId}
      initial={layoutId ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="block h-6 w-6 rounded-full"
      style={{ background: color }}
    />
  )
}

export default function SingleDigitAdditionExplainer({ params, lang = 'en', step, playing, onStepCount, onStepChange, onPlayEnd }: ExplainerProps) {
  const p = params as AddParams
  const story = useMemo(() => buildMakeTenSteps(p.a, p.b, lang), [p.a, p.b, lang])
  const index = useBeatControl(story.finalIndex, { step, playing, onStepCount, onStepChange, onPlayEnd, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const tenFull = beat.blue + beat.orange === 10
  const [splitFills, splitLeft] = beat.split ?? [0, 0]

  // Ten-frame cells: blue chips, then orange (bridged) chips, then empty.
  // Orange cell chips share a layoutId with the loose pile chips so they
  // visibly slide from the pile into the frame when the bridge step fires.
  const cells = Array.from({ length: 10 }, (_, cellIndex) => {
    const isBlue = cellIndex < beat.blue
    const orangeSlot = cellIndex - beat.blue
    const isOrange = !isBlue && orangeSlot < beat.orange
    const isEmpty = !isBlue && !isOrange
    return (
      <div
        key={cellIndex}
        className="flex h-9 w-9 items-center justify-center rounded-md border-2 bg-white"
        style={{ borderColor: isEmpty && beat.highlightEmpty ? ORANGE : EMPTY_BORDER }}
      >
        {isBlue && <Chip color={BLUE} />}
        {isOrange && <Chip color={ORANGE} layoutId={`add-${orangeSlot}`} />}
      </div>
    )
  })

  // A loose chip carrying a stable layoutId so it can slide into the frame.
  const looseChip = (id: number) => <Chip key={`add-${id}`} color={ORANGE} layoutId={`add-${id}`} />

  // During the split beat the loose chips become two labelled groups — the
  // part that completes the ten (ringed) and the leftover — so the breakdown
  // of a sum over ten is concrete. Otherwise they sit in one row.
  const showSplitGroups = beat.split !== null && beat.orange === 0
  const looseArea = showSplitGroups ? (
    <div className="flex items-end gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1.5 rounded-lg p-1.5 ring-2 ring-qupu-brand-orange">
          {Array.from({ length: splitFills }, (_, k) => looseChip(k))}
        </div>
        <span className="text-[0.6875rem] font-extrabold" style={{ color: ORANGE }}>
          {splitFills} {lang === 'id' ? '→ isi sepuluh' : '→ fills ten'}
        </span>
      </div>
      <span className="pb-4 font-display text-base font-extrabold text-qupu-muted">+</span>
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1.5 p-1.5">
          {Array.from({ length: splitLeft }, (_, k) => looseChip(splitFills + k))}
        </div>
        <span className="text-[0.6875rem] font-extrabold text-qupu-muted">
          {splitLeft} {lang === 'id' ? 'sisa' : 'left'}
        </span>
      </div>
    </div>
  ) : (
    <div className="flex min-h-[1.5rem] items-center gap-1.5">
      {Array.from({ length: beat.loose }, (_, k) => looseChip(beat.orange + k))}
    </div>
  )

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: jadikan sepuluh dulu, lalu tambah sisanya.'
      : 'Strategy: make a ten first, then add what is left.'

  // LayoutGroup scopes the shared `layoutId`s so the bridge-chip slide stays
  // isolated if more than one explainer ever renders on the same page.
  return (
    <LayoutGroup>
      <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
        <div className="flex flex-col items-center gap-3">
          {/* Ten-frame, with a "10" badge once it is full */}
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-5 gap-1.5">{cells}</div>
            {tenFull && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-black text-white"
                style={{ background: '#10B981' }}
              >
                10
              </motion.div>
            )}
          </div>

          {/* Loose chips (grouped into the split during the breakdown beat) */}
          {beat.loose > 0 && looseArea}

          {/* Caption */}
          <div
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
            }
          >
            {beat.caption}
          </div>
        </div>
      </div>
    </LayoutGroup>
  )
}
