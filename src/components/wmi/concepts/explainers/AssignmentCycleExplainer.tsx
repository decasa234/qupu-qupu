import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildAssignmentCycleSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const SLATE = '#CBD5E1'

interface Params { cycle: number; n: number }

/** Convert a 0-based slot index (0 = top, clockwise) to (cx, cy) on a circle of the given radius. */
function slotCoords(index: number, total: number, radius: number, cx: number, cy: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

export default function AssignmentCycleExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildAssignmentCycleSteps((params ?? {}) as Params, lang), [params, lang])
  const { beat } = useLogicBeat(story, props)

  const { cycle, labels, fullTrips, lastFull, leftover, answerSeat } = story
  const phase = beat.phase

  // SVG layout
  const SIZE = 220
  const CX = SIZE / 2
  const CY = SIZE / 2
  const RING_R = 78
  const SLOT_R = 18
  const TOKEN_R = 10

  // Token walks: starts at top, sits on the last letter after the full trips,
  // then steps forward onto the answer seat as we count on the leftover.
  const tokenSlotIndex =
    phase === 'rounds' ? cycle - 1 : phase === 'count' || phase === 'result' ? answerSeat : 0
  const tokenPos = slotCoords(tokenSlotIndex, cycle, RING_R, CX, CY)

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  return (
    <LogicFrame beat={beat} label={T('Repeating cycle', 'Pola berulang')}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Ring connector */}
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke={SLATE} strokeWidth={2} strokeDasharray="4 3" />

        {/* Seat circles + labels */}
        {labels.map((label, i) => {
          const isLastInTrip = phase === 'rounds' && i === cycle - 1
          const isCounting = phase === 'count' && i === answerSeat
          const isResult = phase === 'result' && i === answerSeat
          const active = isLastInTrip || isCounting
          const fillColor = isResult ? '#D1FAE5' : active ? '#FFF7ED' : '#fff'
          const strokeColor = isResult ? GREEN : active ? ORANGE : SLATE
          const textColor = isResult ? '#065F46' : active ? ORANGE : BLUE
          const pos = slotCoords(i, cycle, RING_R, CX, CY)

          // Student number landing under a seat: lastFull on the last seat during
          // 'rounds'; the leftover student numbers during 'count'.
          let underNum: number | null = null
          if (phase === 'rounds' && i === cycle - 1 && fullTrips >= 1) underNum = lastFull
          if (phase === 'count' && i < leftover) underNum = lastFull + i + 1

          return (
            <g key={label}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={SLOT_R}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={active || isResult ? 2.5 : 1.5}
                animate={{ r: active || isResult ? SLOT_R + 2 : SLOT_R, fill: fillColor, stroke: strokeColor }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={13} fontWeight="800" fill={textColor} fontFamily="system-ui, sans-serif">
                {label}
              </text>
              {underNum !== null && (
                <text x={pos.x} y={pos.y + SLOT_R + 12} textAnchor="middle" fontSize={10} fontWeight="800" fill={ORANGE} fontFamily="system-ui, sans-serif">
                  {underNum}
                </text>
              )}
            </g>
          )
        })}

        {/* Walking token */}
        <AnimatePresence>
          {(phase === 'rounds' || phase === 'count' || phase === 'result') && (
            <motion.circle
              key="token"
              r={TOKEN_R}
              fill={phase === 'result' ? GREEN : ORANGE}
              opacity={0.82}
              initial={{ cx: slotCoords(0, cycle, RING_R, CX, CY).x, cy: slotCoords(0, cycle, RING_R, CX, CY).y, scale: 0.6, opacity: 0 }}
              animate={{ cx: tokenPos.x, cy: tokenPos.y, scale: 1, opacity: 0.82 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
            />
          )}
        </AnimatePresence>

        {/* Center display */}
        {phase === 'pattern' && (
          <>
            <text x={CX} y={CY - 4} textAnchor="middle" fontSize={11} fill={BLUE} fontFamily="system-ui, sans-serif" fontWeight="700">
              {labels.join(', ')}
            </text>
            <text x={CX} y={CY + 11} textAnchor="middle" fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">
              {T('repeats…', 'berulang…')}
            </text>
          </>
        )}
        {phase === 'rounds' && (
          <>
            <text x={CX} y={CY - 4} textAnchor="middle" fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif" fontWeight="700">
              {T('full trips', 'putaran penuh')}
            </text>
            <text x={CX} y={CY + 13} textAnchor="middle" fontSize={16} fill={ORANGE} fontFamily="system-ui, sans-serif" fontWeight="900">
              {lastFull}
            </text>
          </>
        )}
        {phase === 'count' && (
          <text x={CX} y={CY + 6} textAnchor="middle" fontSize={12} fill={ORANGE} fontFamily="system-ui, sans-serif" fontWeight="800">
            +{leftover}
          </text>
        )}
        {phase === 'result' && (
          <text x={CX} y={CY + 6} textAnchor="middle" fontSize={20} fill={GREEN} fontFamily="system-ui, sans-serif" fontWeight="900">
            {story.answer}
          </text>
        )}
      </svg>
    </LogicFrame>
  )
}
