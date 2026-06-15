import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  BP_LINKS,
  BP_VIEW_W,
  BP_VIEW_H,
  BP_WHEELS,
  CrossedBelt,
  Pulley,
  SpinArrow,
  bpSpins,
} from './BeltPulley19P1Illustration'
import type { Spin } from './BeltPulley19P1Illustration'
import { buildBeltPulley19P1Steps } from './beltPulley19P1Steps'

// WMI-19P1A-Q14 — propagate the spin from the marked wheel along the chain of
// crossed belts (each crossing flips the direction): CCW → CW → CCW → CW, so
// wheel A spins clockwise = direction B.

const BLUE = '#30598A'
const GREEN = '#10B981'
const ORANGE = '#F97316'
const INK = '#1F2937'
const MUTED = '#9CA3AF'

/** A small direction-option chip glyph by label. B is the correct spin. */
function DirectionOption({ label, cx, cy, color }: { label: 'A' | 'B' | 'C' | 'D'; cx: number; cy: number; color: string }) {
  const r = 16
  switch (label) {
    case 'A':
      // counter-clockwise rotation
      return <SpinArrow cx={cx} cy={cy} r={r} spin="ccw" color={color} />
    case 'B':
      // clockwise rotation (correct)
      return <SpinArrow cx={cx} cy={cy} r={r} spin="cw" color={color} />
    case 'C':
      // straight up linear arrow (decoy)
      return (
        <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1={cx} y1={cy + r} x2={cx} y2={cy - r} />
          <path d={`M ${cx - 7} ${cy - r + 8} L ${cx} ${cy - r} L ${cx + 7} ${cy - r + 8}`} />
        </g>
      )
    case 'D':
      // straight down linear arrow (decoy)
      return (
        <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
          <path d={`M ${cx - 7} ${cy + r - 8} L ${cx} ${cy + r} L ${cx + 7} ${cy + r - 8}`} />
        </g>
      )
    default:
      return null
  }
}

export default function BeltPulley19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBeltPulley19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const spins: Spin[] = bpSpins()

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bawa arah putaran sepanjang sabuk menyilang; tiap silang membalik arah, sehingga roda A berputar searah jarum jam — arah B.'
      : 'Explainer: carry the spin along the crossed belts; each crossing flips it, so wheel A spins clockwise — direction B.'

  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  const CHIP_W = 90
  const CHIP_H = 56

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${BP_VIEW_W} ${BP_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={2} y={2} width={BP_VIEW_W - 4} height={BP_VIEW_H - 4} rx={20} fill="#FFFFFF" stroke="#9CA3AF" strokeWidth={2} />

          {/* belts — highlight the one being crossed on this beat */}
          {BP_LINKS.map((lnk, i) => {
            const justCrossed = lnk.to === beat.activeIndex && beat.resolved === lnk.to + 1 && !beat.result && !beat.showOptions
            return (
              <g key={`belt${i}`} opacity={lnk.to <= beat.resolved - 1 ? 1 : 0.35}>
                <CrossedBelt a={BP_WHEELS[lnk.from]} b={BP_WHEELS[lnk.to]} />
                {justCrossed && (
                  <motion.circle
                    cx={(BP_WHEELS[lnk.from].cx + BP_WHEELS[lnk.to].cx) / 2}
                    cy={(BP_WHEELS[lnk.from].cy + BP_WHEELS[lnk.to].cy) / 2}
                    r={9}
                    fill={ORANGE}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </g>
            )
          })}

          {/* wheels — resolved ones tinted, the active one accented */}
          {BP_WHEELS.map((w, i) => {
            const isResolved = i <= beat.resolved - 1
            const isActive = i === beat.activeIndex
            const isA = i === BP_WHEELS.length - 1
            const accent = !isResolved ? MUTED : isActive ? (beat.result && isA ? GREEN : ORANGE) : INK
            return <Pulley key={w.id} cx={w.cx} cy={w.cy} r={w.r} accent={accent} />
          })}

          {/* spin arrows for every resolved wheel */}
          {BP_WHEELS.map((w, i) => {
            if (i > beat.resolved - 1) return null
            const isA = i === BP_WHEELS.length - 1
            const col = beat.result && isA ? GREEN : i === 0 ? INK : BLUE
            return <SpinArrow key={`spin${i}`} cx={w.cx} cy={w.cy} r={w.r} spin={spins[i]} color={col} />
          })}

          {/* "A" label */}
          {(() => {
            const a = BP_WHEELS[BP_WHEELS.length - 1]
            return (
              <text x={a.cx + a.r + 18} y={a.cy + 8} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>
                A
              </text>
            )
          })()}
        </svg>

        {/* direction option chips */}
        {beat.showOptions && (
          <svg viewBox={`0 0 ${4 * (CHIP_W + 6)} ${CHIP_H + 26}`} width="100%" style={{ maxWidth: 384, display: 'block' }} aria-hidden="true">
            {labels.map((lab, i) => {
              const x = i * (CHIP_W + 6) + 3
              const isWinner = beat.highlightWinner && lab === story.answer
              const cx = x + CHIP_W / 2
              const cy = CHIP_H / 2 + 2
              const col = isWinner ? GREEN : '#374151'
              return (
                <g key={lab}>
                  <motion.rect
                    x={x}
                    y={2}
                    width={CHIP_W}
                    height={CHIP_H}
                    rx={10}
                    fill={isWinner ? '#D1FAE5' : '#FFFFFF'}
                    stroke={isWinner ? GREEN : MUTED}
                    strokeWidth={isWinner ? 3 : 1.5}
                    animate={{ scale: isWinner ? 1.05 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                  <DirectionOption label={lab} cx={cx} cy={cy} color={col} />
                  <text x={cx} y={CHIP_H + 18} textAnchor="middle" fontSize={13} fontWeight={800} fill={isWinner ? '#065F46' : '#6B7280'}>
                    {lab}
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
