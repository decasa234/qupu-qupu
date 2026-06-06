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

  const { cycle, labels, shifted, remainder } = story
  const phase = beat.phase

  // SVG layout
  const SIZE = 220
  const CX = SIZE / 2
  const CY = SIZE / 2
  const RING_R = 78
  const SLOT_R = 18
  const TOKEN_R = 10

  // Token position: starts at slot 0 (top), hops to `remainder` during 'remainder' phase
  const tokenSlotIndex = phase === 'pattern' || phase === 'shift' ? 0 : remainder
  const tokenPos = slotCoords(tokenSlotIndex, cycle, RING_R, CX, CY)

  return (
    <LogicFrame beat={beat} label="Repeating cycle strategy">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Ring connector */}
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke={SLATE}
          strokeWidth={2}
          strokeDasharray="4 3"
        />

        {/* Slot circles + labels */}
        {labels.map((label, i) => {
          const pos = slotCoords(i, cycle, RING_R, CX, CY)
          const isActive = phase === 'remainder' && i === remainder
          const isResult = (phase === 'result') && i === remainder
          const fillColor = isResult ? '#D1FAE5' : isActive ? '#FFF7ED' : '#fff'
          const strokeColor = isResult ? GREEN : isActive ? ORANGE : SLATE
          const textColor = isResult ? '#065F46' : isActive ? ORANGE : BLUE

          return (
            <g key={label}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={SLOT_R}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isActive || isResult ? 2.5 : 1.5}
                animate={{
                  r: isActive || isResult ? SLOT_R + 2 : SLOT_R,
                  fill: fillColor,
                  stroke: strokeColor,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fontSize={13}
                fontWeight="800"
                fill={textColor}
                fontFamily="system-ui, sans-serif"
              >
                {label}
              </text>
              {/* Position index hint (0-based) shown during pattern phase */}
              {phase === 'pattern' && (
                <text
                  x={pos.x}
                  y={pos.y + SLOT_R + 10}
                  textAnchor="middle"
                  fontSize={9}
                  fill={SLATE}
                  fontFamily="system-ui, sans-serif"
                >
                  {i}
                </text>
              )}
            </g>
          )
        })}

        {/* Token — animated to correct slot */}
        <AnimatePresence>
          {(phase === 'remainder' || phase === 'result') && (
            <motion.circle
              key="token"
              cx={tokenPos.x}
              cy={tokenPos.y}
              r={TOKEN_R}
              fill={phase === 'result' ? GREEN : ORANGE}
              opacity={0.82}
              initial={{ cx: slotCoords(0, cycle, RING_R, CX, CY).x, cy: slotCoords(0, cycle, RING_R, CX, CY).y, scale: 0.6, opacity: 0 }}
              animate={{ cx: tokenPos.x, cy: tokenPos.y, scale: 1, opacity: 0.82 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16, duration: 0.55 }}
            />
          )}
        </AnimatePresence>

        {/* Center display — changes per phase */}
        {phase === 'pattern' && (
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={9} fill={BLUE} fontFamily="system-ui, sans-serif" fontWeight="700">
            {labels.join(',')}
          </text>
        )}
        {phase === 'pattern' && (
          <text x={CX} y={CY + 7} textAnchor="middle" fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">
            repeats…
          </text>
        )}

        {phase === 'shift' && (
          <>
            <text x={CX} y={CY - 8} textAnchor="middle" fontSize={10} fill={BLUE} fontFamily="system-ui, sans-serif" fontWeight="700">
              n − 1
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" fontSize={13} fill={ORANGE} fontFamily="system-ui, sans-serif" fontWeight="900">
              = {shifted}
            </text>
          </>
        )}

        {phase === 'remainder' && (
          <>
            <text x={CX} y={CY - 8} textAnchor="middle" fontSize={9} fill={BLUE} fontFamily="system-ui, sans-serif" fontWeight="700">
              {shifted} mod {cycle}
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" fontSize={13} fill={ORANGE} fontFamily="system-ui, sans-serif" fontWeight="900">
              = {remainder}
            </text>
          </>
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
