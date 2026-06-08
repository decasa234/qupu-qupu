import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildNetProgressCyclesSteps } from './netProgressCyclesSteps'
import { useBeatControl } from './useBeatControl'

interface NetProgressCyclesParams {
  up: number
  down: number
  cycles: number
}

// Brand colors
const GREEN = '#10B981'
const ORANGE = '#F97316'
const BLUE = '#30598A'
const TRACK_BG = '#EFF6FF'
const TRACK_BORDER = '#BFDBFE'
const RUNG_COLOR = '#93C5FD'
const MUTED = '#9aa3b2'

// SVG / layout constants
const TRACK_W = 72
const TRACK_H = 260
const TRACK_X = 0   // left edge of the track column (centred via flex)
const RUNG_COUNT = 10 // visual rungs on the ladder

/** Map a position value (0..trackMax) to a y-pixel inside the track SVG (bottom = 0). */
function toY(pos: number, trackMax: number): number {
  const usable = TRACK_H - 20 // leave 10px padding top and bottom
  const clamped = Math.max(0, Math.min(trackMax, pos))
  // y=0 is SVG top; we want pos=trackMax → y≈10 (near top), pos=0 → y≈TRACK_H-10
  return TRACK_H - 10 - (clamped / trackMax) * usable
}

/** A small climber emoji token. */
function Token({ y, color, label }: { y: number; color: string; label: string }) {
  return (
    <motion.g
      animate={{ cy: y }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      {/* Shadow */}
      <motion.ellipse
        cx={TRACK_W / 2}
        animate={{ cy: y + 14 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        rx={12}
        ry={4}
        fill="#00000020"
      />
      {/* Circle */}
      <motion.circle
        cx={TRACK_W / 2}
        animate={{ cy: y }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        r={13}
        fill={color}
        stroke="#fff"
        strokeWidth={2.5}
      />
      {/* Label */}
      <motion.text
        x={TRACK_W / 2}
        animate={{ y: y + 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill="#fff"
        fontFamily="Nunito, sans-serif"
      >
        {label}
      </motion.text>
    </motion.g>
  )
}

export default function NetProgressCyclesExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as NetProgressCyclesParams

  const story = useMemo(
    () => buildNetProgressCyclesSteps(p.up, p.down, p.cycles, lang),
    [p.up, p.down, p.cycles, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { up, down, net, cycles, trackMax } = story

  // Token color: green on result, orange while sliding down, green-blue while climbing
  const tokenColor = beat.result ? GREEN : beat.substep === 'down' ? ORANGE : BLUE

  const tokenY = toY(beat.tokenPos, trackMax)

  // Build tick marks: every `net` position and top (= answer)
  const tickPositions = new Set<number>([0])
  for (let c = 1; c <= cycles; c++) tickPositions.add(net * c)
  // also tick the peak of each up-move for context
  for (let c = 1; c <= cycles; c++) tickPositions.add(net * (c - 1) + up)

  const ariaLabel =
    lang === 'id'
      ? `Animasi tangga: naik ${up} turun ${down} sebanyak ${cycles} kali, total ${story.answer} anak tangga.`
      : `Ladder animation: up ${up} down ${down} for ${cycles} cycles, total ${story.answer} steps.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Main visual: ladder track + cycle info */}
        <div className="flex items-start justify-center gap-5">
          {/* Left info column */}
          <div className="flex flex-col items-end gap-2 pt-2 text-xs font-bold" style={{ minWidth: 80 }}>
            {/* Up arrow indicator */}
            <div
              className="flex items-center gap-1 rounded-lg border-2 px-2 py-1"
              style={{ borderColor: GREEN, background: '#D1FAE5', color: '#065F46' }}
            >
              <span>&#8679;</span>
              <span>+{up}</span>
            </div>
            {/* Down arrow indicator */}
            <div
              className="flex items-center gap-1 rounded-lg border-2 px-2 py-1"
              style={{ borderColor: ORANGE, background: '#FFF7ED', color: '#9a3412' }}
            >
              <span>&#8681;</span>
              <span>-{down}</span>
            </div>
            {/* Net indicator */}
            <div
              className="flex items-center gap-1 rounded-lg border-2 px-2 py-1"
              style={{ borderColor: BLUE, background: '#EFF6FF', color: BLUE }}
            >
              <span>=</span>
              <span>+{net}</span>
            </div>
          </div>

          {/* Ladder SVG */}
          <svg
            viewBox={`${TRACK_X} 0 ${TRACK_W} ${TRACK_H}`}
            width={TRACK_W}
            height={TRACK_H}
            aria-hidden="true"
            style={{ overflow: 'visible', flexShrink: 0 }}
          >
            {/* Track background */}
            <rect
              x={TRACK_X + 4}
              y={10}
              width={TRACK_W - 8}
              height={TRACK_H - 20}
              rx={8}
              fill={TRACK_BG}
              stroke={TRACK_BORDER}
              strokeWidth={2}
            />

            {/* Ladder rungs */}
            {Array.from({ length: RUNG_COUNT }, (_, i) => {
              const y = 10 + ((TRACK_H - 20) / (RUNG_COUNT + 1)) * (i + 1)
              return (
                <line
                  key={i}
                  x1={TRACK_X + 12}
                  y1={y}
                  x2={TRACK_X + TRACK_W - 12}
                  y2={y}
                  stroke={RUNG_COLOR}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )
            })}

            {/* Position tick marks on left rail */}
            {Array.from(tickPositions).map((pos) => {
              const y = toY(pos, trackMax)
              const isAnswer = pos === story.answer
              const isNetMark = pos > 0 && pos % net === 0
              return (
                <g key={pos}>
                  <line
                    x1={TRACK_X + 4}
                    y1={y}
                    x2={TRACK_X + 14}
                    y2={y}
                    stroke={isAnswer ? GREEN : isNetMark ? BLUE : MUTED}
                    strokeWidth={isAnswer ? 2.5 : 1.5}
                  />
                  <text
                    x={TRACK_X + 2}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={9}
                    fontWeight={isAnswer ? 800 : 600}
                    fill={isAnswer ? GREEN : isNetMark ? BLUE : MUTED}
                    fontFamily="Nunito, sans-serif"
                  >
                    {pos}
                  </text>
                </g>
              )
            })}

            {/* Token */}
            <Token y={tokenY} color={tokenColor} label={String(beat.tokenPos)} />
          </svg>

          {/* Right: cycle counter */}
          <div className="flex flex-col items-start gap-2 pt-2 text-xs font-bold" style={{ minWidth: 72 }}>
            {Array.from({ length: cycles }, (_, i) => {
              const cycleNum = i + 1
              const done = beat.cycleNum > cycleNum || (beat.cycleNum === cycleNum && beat.substep === 'down') || beat.substep === 'total'
              const active = beat.cycleNum === cycleNum && (beat.substep === 'up' || beat.substep === 'down')
              return (
                <div
                  key={cycleNum}
                  className="flex items-center gap-1 rounded-lg border-2 px-2 py-1 transition-all"
                  style={{
                    borderColor: beat.result ? GREEN : active ? BLUE : done ? '#10B981' : TRACK_BORDER,
                    background: beat.result ? '#D1FAE5' : active ? '#EFF6FF' : done ? '#D1FAE5' : '#fff',
                    color: beat.result ? '#065F46' : active ? BLUE : done ? '#065F46' : MUTED,
                    fontWeight: active ? 800 : 600,
                    opacity: done || active || beat.result ? 1 : 0.4,
                  }}
                >
                  <span>#{cycleNum}</span>
                  {(done || beat.result) && <span style={{ color: GREEN }}>+{net}</span>}
                </div>
              )
            })}
            {/* Running total label */}
            <div
              className="rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition-all"
              style={
                beat.result
                  ? { borderColor: GREEN, background: '#D1FAE5', color: '#065F46' }
                  : { borderColor: BLUE, background: '#EFF6FF', color: BLUE }
              }
            >
              ={beat.tokenPos}
            </div>
          </div>
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
