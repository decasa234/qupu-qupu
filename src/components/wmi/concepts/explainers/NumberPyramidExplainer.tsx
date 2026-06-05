import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPyramidSteps } from './pyramidSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Block({
  value,
  color = BLUE,
  visible = true,
}: {
  value: number | string
  color?: string
  visible?: boolean
}) {
  if (!visible) {
    return <div className="h-12 min-w-[3rem]" />
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex h-12 min-w-[3rem] items-center justify-center rounded-xl border-[3px] bg-white px-3 font-display text-2xl font-extrabold"
      style={{ borderColor: color, color: PURPLE }}
    >
      {value}
    </motion.div>
  )
}

function ConnectorLine({ left, right }: { left?: boolean; right?: boolean }) {
  return (
    <div className="flex items-end justify-center gap-0" style={{ width: '4.5rem', height: '1.25rem' }}>
      {left && (
        <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
          <line x1="18" y1="0" x2="0" y2="20" stroke={MUTED} strokeWidth="2" />
        </svg>
      )}
      {right && (
        <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
          <line x1="18" y1="0" x2="36" y2="20" stroke={MUTED} strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}

export default function NumberPyramidExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { a: number; b: number; c: number }
  const story = useMemo(() => buildPyramidSteps(p.a, p.b, p.c, lang), [p.a, p.b, p.c, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { a, b, c, mid, top } = story
  const phase = beat.phase

  const showMiddle = phase === 'middle' || phase === 'top' || phase === 'result'
  const showTop = phase === 'top' || phase === 'result'
  const topColor = phase === 'result' ? GREEN : BLUE

  const ariaLabel =
    lang === 'id'
      ? `Piramida bilangan: baris bawah ${a}, ${b}, ${c}. Setiap blok adalah jumlah dua blok di bawahnya. Puncak: ${top}.`
      : `Number pyramid: bottom row ${a}, ${b}, ${c}. Each block equals the sum of the two below it. Top: ${top}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        {/* Pyramid visual */}
        <div className="flex flex-col items-center gap-0">
          {/* Top row — 1 block */}
          <div className="flex items-center justify-center" style={{ minHeight: '3rem' }}>
            {showTop ? (
              <Block value={top} color={topColor} />
            ) : (
              <div className="h-12 min-w-[3rem]" />
            )}
          </div>

          {/* Connector lines: top to middle */}
          {showTop && showMiddle && (
            <div className="flex items-end" style={{ gap: '3rem' }}>
              <ConnectorLine left />
              <ConnectorLine right />
            </div>
          )}

          {/* Middle row — 2 blocks */}
          <div className="flex items-center justify-center gap-6" style={{ minHeight: '3rem' }}>
            {showMiddle ? (
              <>
                <Block value={mid[0]} color={ORANGE} />
                <Block value={mid[1]} color={ORANGE} />
              </>
            ) : (
              <>
                <div className="h-12 min-w-[3rem]" />
                <div className="h-12 min-w-[3rem]" />
              </>
            )}
          </div>

          {/* Connector lines: middle to bottom */}
          <div className="flex items-end" style={{ gap: '1.5rem' }}>
            <ConnectorLine left />
            <ConnectorLine left right />
            <ConnectorLine right />
          </div>

          {/* Bottom row — 3 blocks (always visible) */}
          <div className="flex items-center justify-center gap-3">
            <Block value={a} color={BLUE} />
            <Block value={b} color={BLUE} />
            <Block value={c} color={BLUE} />
          </div>
        </div>

        {/* Caption */}
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
