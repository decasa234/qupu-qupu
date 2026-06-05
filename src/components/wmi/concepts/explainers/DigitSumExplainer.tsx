import { useEffect, useMemo, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDigitSumSteps } from './digitSumSteps'

interface DigitSumParams {
  n: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const STEP_MS = 1200

// A single counting dot. layoutId lets the dot slide from its per-tile group
// into the merged group (magic-move); initial={false} so it slides, not pops.
function Dot({ color, layoutId }: { color: string; layoutId: string }) {
  return (
    <motion.span
      layout
      layoutId={layoutId}
      initial={false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="block h-5 w-5 rounded-full"
      style={{ background: color }}
    />
  )
}

// A rounded digit tile; a zero digit renders as a dashed empty outline.
function Tile({ digit, color }: { digit: number; color: string }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex h-14 w-14 items-center justify-center rounded-xl border-[3px] bg-white font-display text-3xl font-extrabold"
      style={{ borderColor: color, color, borderStyle: digit === 0 ? 'dashed' : 'solid' }}
    >
      {digit}
    </motion.div>
  )
}

export default function DigitSumExplainer({ params, lang = 'en' }: ExplainerProps) {
  const p = params as DigitSumParams
  const story = useMemo(() => buildDigitSumSteps(p.n, lang), [p.n, lang])
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
  const { tens, ones, sum, n } = story

  // Blue (tens) dots then orange (ones) dots; stable layoutIds across the merge.
  const blueDots = Array.from({ length: tens }, (_, i) => <Dot key={`b${i}`} color={BLUE} layoutId={`d-b-${i}`} />)
  const orangeDots = Array.from({ length: ones }, (_, j) => <Dot key={`o${j}`} color={ORANGE} layoutId={`d-o-${j}`} />)

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: pisahkan bilangan menjadi angka-angkanya, lalu jumlahkan.'
      : 'Strategy: split the number into its digits, then add them.'

  return (
    <LayoutGroup>
      <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
        <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
          {/* the whole number */}
          {step.showNumber && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-6xl font-extrabold"
              style={{ color: PURPLE }}
            >
              {n}
            </motion.div>
          )}

          {/* digit tiles (+ between them until they merge) */}
          {step.showTiles && (
            <div className="flex items-center gap-4">
              <Tile digit={tens} color={BLUE} />
              {!step.merged && <span className="font-display text-2xl font-extrabold text-qupu-muted">+</span>}
              <Tile digit={ones} color={ORANGE} />
            </div>
          )}

          {/* dots: two groups under the tiles, or one merged grid */}
          {step.showDots && !step.merged && (
            <div className="flex items-start gap-10">
              <div className="grid w-16 grid-cols-3 justify-items-center gap-1">{blueDots}</div>
              <div className="grid w-16 grid-cols-3 justify-items-center gap-1">{orangeDots}</div>
            </div>
          )}
          {step.showDots && step.merged && (
            <div className="flex max-w-[260px] flex-wrap justify-center gap-1.5">
              {blueDots}
              {orangeDots}
            </div>
          )}

          {/* number sentence on the result beat */}
          {step.showResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-xl font-extrabold"
            >
              <span style={{ color: BLUE }}>{tens}</span>
              <span className="text-qupu-muted"> + </span>
              <span style={{ color: ORANGE }}>{ones}</span>
              <span className="text-qupu-muted"> = </span>
              <span style={{ color: GREEN }}>{sum}</span>
            </motion.div>
          )}

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
    </LayoutGroup>
  )
}
