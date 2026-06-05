import { useEffect, useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMakeTenSteps } from './makeTenSteps'

interface AddParams {
  a: number
  b: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const EMPTY_BORDER = '#E6DCC6'
const STEP_MS = 900

function Chip({ color, layoutId }: { color: string; layoutId?: string }) {
  return (
    <motion.span
      layout
      layoutId={layoutId}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="block h-6 w-6 rounded-full"
      style={{ background: color }}
    />
  )
}

export default function SingleDigitAdditionExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as AddParams
  const story = useMemo(() => buildMakeTenSteps(p.a, p.b, lang), [p.a, p.b, lang])
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) {
      setIndex(story.finalIndex)
      return
    }
    setIndex(0)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      if (i > story.finalIndex) {
        window.clearInterval(id)
        return
      }
      setIndex(i)
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [story, reduce])

  const step = story.steps[index] ?? story.steps[story.finalIndex]

  // Ten-frame cells: blue chips, then orange (bridged) chips, then empty.
  // Orange cell chips share a layoutId with the loose pile chips so they
  // visibly slide from the pile into the frame when the bridge step fires.
  const cells = Array.from({ length: 10 }, (_, cellIndex) => {
    const isBlue = cellIndex < step.blue
    const orangeSlot = cellIndex - step.blue
    const isOrange = !isBlue && orangeSlot < step.orange
    const isEmpty = !isBlue && !isOrange
    return (
      <div
        key={cellIndex}
        className="flex h-9 w-9 items-center justify-center rounded-md border-2 bg-white"
        style={{ borderColor: isEmpty && step.highlightEmpty ? ORANGE : EMPTY_BORDER }}
      >
        {isBlue && <Chip color={BLUE} />}
        {isOrange && <Chip color={ORANGE} layoutId={`add-${orangeSlot}`} />}
      </div>
    )
  })

  // Loose pile: the second-addend chips not yet placed, indexed AFTER the
  // ones already in the frame so layoutIds stay unique across the swap.
  const loose = Array.from({ length: step.loose }, (_, k) => (
    <Chip key={k} color={ORANGE} layoutId={`add-${step.orange + k}`} />
  ))

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: jadikan sepuluh dulu, lalu tambah sisanya.'
      : 'Strategy: make a ten first, then add what is left.'

  return (
    <LayoutGroup>
      <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
        <div className="flex flex-col items-center gap-3">
          {/* Ten-frame */}
          <div className="grid grid-cols-5 gap-1.5">{cells}</div>

          {/* Number-bond split of the second addend */}
          {step.split && (
            <div className="flex items-center gap-2 font-display text-sm font-extrabold text-qupu-brand-blue">
              <span>{story.small}</span>
              <span className="text-qupu-muted">=</span>
              <span style={{ color: ORANGE }}>{step.split[0]}</span>
              <span className="text-qupu-muted">+</span>
              <span style={{ color: ORANGE }}>{step.split[1]}</span>
            </div>
          )}

          {/* Loose pile */}
          {step.loose > 0 && (
            <div className="flex min-h-[24px] items-center gap-1.5">{loose}</div>
          )}

          {/* Caption */}
          <div
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              step.result
                ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
            }
          >
            {step.caption}
          </div>
        </div>
      </div>
    </LayoutGroup>
  )
}
