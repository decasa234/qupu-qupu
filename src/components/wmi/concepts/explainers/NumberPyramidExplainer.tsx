import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPyramidSteps } from './pyramidSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#cbd5e1'

// SVG geometry — centres are aligned so each parent sits exactly over the two
// children it sums (so connectors always meet block centres, any digit count).
const VW = 300
const VH = 190
const BW = 54
const BH = 42
const HALF_W = BW / 2
const HALF_H = BH / 2

const BOTTOM = [60, 150, 240].map((x) => ({ x, y: 158 }))
const MIDDLE = [105, 195].map((x) => ({ x, y: 96 })) // midpoints of bottom pairs
const TOP = { x: 150, y: 34 } // midpoint of the middle pair

function Block({
  cx,
  cy,
  value,
  color,
  fill,
  textColor,
  delay = 0,
}: {
  cx: number
  cy: number
  value: number | string
  color: string
  fill: string
  textColor: string
  delay?: number
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, delay }}
    >
      <rect x={cx - HALF_W} y={cy - HALF_H} width={BW} height={BH} rx={10} fill={fill} stroke={color} strokeWidth={3} />
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={22} fontWeight={800} fill={textColor} fontFamily="system-ui, sans-serif">
        {value}
      </text>
    </motion.g>
  )
}

function Connector({ from, to, active }: { from: { x: number; y: number }; to: { x: number; y: number }; active: boolean }) {
  // from = child (lower) top edge → to = parent (upper) bottom edge
  return (
    <motion.line
      x1={from.x}
      y1={from.y - HALF_H}
      x2={to.x}
      y2={to.y + HALF_H}
      stroke={active ? ORANGE : MUTED}
      strokeWidth={active ? 3 : 2}
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, stroke: active ? ORANGE : MUTED }}
      transition={{ duration: 0.3 }}
    />
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
  const midActive = phase === 'middle'
  const topActive = phase === 'top'
  const topColor = phase === 'result' ? GREEN : BLUE
  const topFill = phase === 'result' ? '#D1FAE5' : '#fff'
  const topText = phase === 'result' ? '#065F46' : PURPLE

  const ariaLabel =
    lang === 'id'
      ? `Piramida bilangan: baris bawah ${a}, ${b}, ${c}. Setiap blok adalah jumlah dua blok di bawahnya. Puncak: ${top}.`
      : `Number pyramid: bottom row ${a}, ${b}, ${c}. Each block equals the sum of the two below it. Top: ${top}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: 320 }} aria-hidden="true">
          {/* Connectors bottom → middle (only once the middle row is shown) */}
          {showMiddle && (
            <>
              <Connector from={BOTTOM[0]} to={MIDDLE[0]} active={midActive} />
              <Connector from={BOTTOM[1]} to={MIDDLE[0]} active={midActive} />
              <Connector from={BOTTOM[1]} to={MIDDLE[1]} active={midActive} />
              <Connector from={BOTTOM[2]} to={MIDDLE[1]} active={midActive} />
            </>
          )}
          {/* Connectors middle → top */}
          {showTop && (
            <>
              <Connector from={MIDDLE[0]} to={TOP} active={topActive} />
              <Connector from={MIDDLE[1]} to={TOP} active={topActive} />
            </>
          )}

          {/* Bottom row — always visible */}
          <Block cx={BOTTOM[0].x} cy={BOTTOM[0].y} value={a} color={BLUE} fill="#EFF4FF" textColor={PURPLE} />
          <Block cx={BOTTOM[1].x} cy={BOTTOM[1].y} value={b} color={BLUE} fill="#EFF4FF" textColor={PURPLE} />
          <Block cx={BOTTOM[2].x} cy={BOTTOM[2].y} value={c} color={BLUE} fill="#EFF4FF" textColor={PURPLE} />

          {/* Middle row */}
          {showMiddle && (
            <>
              <Block cx={MIDDLE[0].x} cy={MIDDLE[0].y} value={mid[0]} color={ORANGE} fill="#FFF7ED" textColor={PURPLE} />
              <Block cx={MIDDLE[1].x} cy={MIDDLE[1].y} value={mid[1]} color={ORANGE} fill="#FFF7ED" textColor={PURPLE} delay={0.08} />
            </>
          )}

          {/* Top */}
          {showTop && <Block cx={TOP.x} cy={TOP.y} value={top} color={topColor} fill={topFill} textColor={topText} />}
        </svg>

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
