import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMoreLessSteps } from './moreLessSteps'
import { useBeatControl } from './useBeatControl'

interface MoreLessParams {
  x: number
  k: number
  dir: 'more' | 'less'
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const MUTED = '#9aa3b2'
const STEP_MS = 1900

// A ten-rod: one tall stick divided into 10 segments (= ten ones).
function Rod({ glow }: { glow?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className="flex flex-col gap-[0.0625rem] rounded-[0.1875rem] p-[0.125rem]"
      style={{ background: glow ? GREEN : BLUE }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="block h-[0.25rem] w-3 rounded-[0.0625rem]" style={{ background: '#ffffff66' }} />
      ))}
    </motion.div>
  )
}

// A single ones-cube.
function Cube({ glow }: { glow?: boolean }) {
  return (
    <motion.span
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className="block h-3 w-3 rounded-[0.125rem]"
      style={{ background: glow ? GREEN : ORANGE }}
    />
  )
}

// A pile of `tens` rods + `ones` cubes. The last `glowTens` rods and last
// `glowOnes` cubes glow green (the just-regrouped/just-broken pieces).
function Pile({
  tens,
  ones,
  glowTens = 0,
  glowOnes = 0,
  dim = false,
}: {
  tens: number
  ones: number
  glowTens?: number
  glowOnes?: number
  dim?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-2" style={{ opacity: dim ? 0.8 : 1 }}>
      {tens > 0 && (
        <div className="flex max-w-[9.375rem] flex-wrap items-end gap-1">
          {Array.from({ length: tens }, (_, i) => (
            <Rod key={`r${i}`} glow={i >= tens - glowTens} />
          ))}
        </div>
      )}
      {ones > 0 && (
        <div className="grid max-w-[4.5rem] grid-cols-5 gap-1">
          {Array.from({ length: ones }, (_, i) => (
            <Cube key={`o${i}`} glow={i >= ones - glowOnes} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MoreLessExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as MoreLessParams
  const story = useMemo(() => buildMoreLessSteps(p.x, p.k, p.dir, lang), [p.x, p.k, p.dir, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { main, delta } = beat

  const glowTens = beat.phase === 'regroup' ? 1 : 0
  const glowOnes = beat.phase === 'borrow' ? 10 : 0

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: tunjukkan dengan balok puluhan dan satuan, lalu tambah atau kurang dan kelompokkan ulang.'
      : 'Strategy: show it with ten-rods and ones, then add or take away and regroup.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-5">
        <div className="flex flex-wrap items-end justify-center gap-4">
          <Pile tens={main.tens} ones={main.ones} glowTens={glowTens} glowOnes={glowOnes} />
          {delta && (
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl font-extrabold" style={{ color: MUTED }}>
                {delta.sign}
              </span>
              <Pile tens={delta.tens} ones={delta.ones} dim />
            </div>
          )}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
