import { Fragment, useEffect, useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCompareOrderSteps } from './compareOrderSteps'

interface CompareParams {
  x: number
  y: number
  z: number
}

const BLUE = '#2f6df0'
const GREEN = '#10B981'
const MUTED = '#9aa3b2'
const PURPLE = '#341857'
const STEP_MS = 1900
const MAX_BAR = 104

// A number card with a value-proportional bar above it. layoutId lets the card
// slide to its sorted position when the order changes (magic-move).
function Card({ value, showBar }: { value: number; showBar: boolean }) {
  const h = Math.round((value / 98) * MAX_BAR) + 8
  return (
    <motion.div
      layout
      layoutId={`c-${value}`}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex items-end" style={{ height: MAX_BAR + 8 }}>
        <motion.div
          initial={false}
          animate={{ height: showBar ? h : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="w-7 rounded-t-md"
          style={{ background: BLUE }}
        />
      </div>
      <div
        className="flex h-9 w-12 items-center justify-center rounded-lg border-2 bg-white font-display text-lg font-extrabold"
        style={{ borderColor: BLUE, color: PURPLE }}
      >
        {value}
      </div>
    </motion.div>
  )
}

function Gt() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="self-end pb-2 font-display text-2xl font-extrabold"
      style={{ color: MUTED }}
    >
      &gt;
    </motion.span>
  )
}

export default function CompareOrderExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as CompareParams
  const story = useMemo(() => buildCompareOrderSteps(p.x, p.y, p.z, lang), [p.x, p.y, p.z, lang])
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
  const display = step.ordered ? story.ordered : story.given

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: urutkan bilangan dari terbesar ke terkecil.'
      : 'Strategy: order the numbers from largest to smallest.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[230px] flex-col items-center justify-center gap-5">
        <LayoutGroup>
          <div className="flex items-end justify-center gap-3">
            {display.map((value, i) => (
              <Fragment key={value}>
                {i > 0 && step.showGt && <Gt />}
                <Card value={value} showBar={step.showBars} />
              </Fragment>
            ))}
          </div>
        </LayoutGroup>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            step.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {step.caption}
        </div>
      </div>
    </div>
  )
}
