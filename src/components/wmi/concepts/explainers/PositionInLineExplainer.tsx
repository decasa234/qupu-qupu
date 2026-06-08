import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPositionLineSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

interface Params { name: string; fromFront: number; fromBack: number }

const BLUE   = '#30598A'
const ORANGE = '#F97316'
const GREEN  = '#10B981'
const SLATE  = '#CBD5E1'

// Layout constants
const SVG_W = 400
const SVG_H = 130
const ROW_Y  = 54  // centre of circles
const NAME_Y = 18  // top name label

function circleColor(idx: number, frontCount: number, backCount: number, phase: string): string {
  const selfIdx = frontCount
  const isFront = idx < selfIdx
  const isSelf  = idx === selfIdx
  const isBack  = idx > selfIdx

  if (phase === 'result') return GREEN
  if (phase === 'front'  && isFront) return ORANGE
  if (phase === 'self'   && isSelf)  return BLUE
  if (phase === 'back'   && isBack)  return ORANGE
  return SLATE
}

function circleStroke(color: string): string {
  if (color === SLATE) return '#94A3B8'
  return color
}

export default function PositionInLineExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildPositionLineSteps((params ?? {}) as Params, lang), [params, lang])
  const { beat } = useLogicBeat(story, props)

  // Guard: ensure sane counts
  const frontCount = Math.max(0, story.frontCount ?? 0)
  const backCount  = Math.max(0, story.backCount  ?? 0)
  const total      = frontCount + 1 + backCount
  const selfIdx    = frontCount

  // Dynamic sizing: shrink circles when total is large
  const r  = total <= 9 ? 18 : total <= 15 ? 13 : 9
  const gap = total <= 9 ? 44 : total <= 15 ? 32 : 22

  const totalWidth = total * gap - (gap - r * 2)
  const startX = (SVG_W - totalWidth) / 2 + r

  const circles = Array.from({ length: total }, (_, i) => ({
    idx  : i,
    cx   : startX + i * gap,
    cy   : ROW_Y,
    r,
    isSelf: i === selfIdx,
  }))

  const phase = beat.phase as string

  // Bracket helpers
  function bracketPath(fromIdx: number, toIdx: number): string {
    if (fromIdx > toIdx) return ''
    const x1 = circles[fromIdx].cx - r
    const x2 = circles[toIdx].cx + r
    const by = ROW_Y + r + 14
    return `M${x1},${by - 8} L${x1},${by} L${x2},${by} L${x2},${by - 8}`
  }

  const showFrontBracket  = phase === 'front'  && frontCount > 0
  const showBackBracket   = phase === 'back'   && backCount  > 0
  const showSelfPlus      = phase === 'self'
  const showResultTotal   = phase === 'result'

  const frontBracketPath = bracketPath(0, selfIdx - 1)
  const backBracketPath  = bracketPath(selfIdx + 1, total - 1)

  // Bracket midpoint x for label
  const frontMidX = frontCount > 0
    ? (circles[0].cx + circles[selfIdx - 1].cx) / 2
    : 0
  const backMidX  = backCount > 0
    ? (circles[selfIdx + 1]?.cx ?? 0 + circles[total - 1].cx) / 2
    : 0

  const bracketLabelY = ROW_Y + r + 30

  return (
    <LogicFrame beat={beat} label="Line position strategy">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        style={{ overflow: 'visible', display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* Person circles */}
        {circles.map(({ idx, cx, cy, r: cr, isSelf }) => {
          const fill = circleColor(idx, frontCount, backCount, phase)
          const stroke = circleStroke(fill)
          const isActiveOrange =
            (phase === 'front' && idx < selfIdx) ||
            (phase === 'back'  && idx > selfIdx)
          const isActiveSelf = phase === 'self' && isSelf
          const isResult     = phase === 'result'

          return (
            <motion.circle
              key={idx}
              cx={cx}
              cy={cy}
              r={cr}
              fill={fill === SLATE ? '#F8FAFC' : fill + '22'}
              stroke={stroke}
              strokeWidth={2}
              initial={false}
              animate={{
                scale       : isActiveSelf ? 1.18 : isActiveOrange || isResult ? 1.06 : 1,
                opacity     : 1,
                fill        : fill === SLATE ? '#F8FAFC' : fill + '22',
                stroke,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          )
        })}

        {/* Circle number labels (1-based) */}
        {circles.map(({ idx, cx, cy, r: cr }) => {
          const fill = circleColor(idx, frontCount, backCount, phase)
          const textColor = fill === SLATE ? '#64748B' : fill
          const fontSize  = cr >= 18 ? 11 : cr >= 13 ? 9 : 7
          return (
            <text
              key={`num-${idx}`}
              x={cx}
              y={cy + fontSize * 0.4}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight="700"
              fill={textColor}
            >
              {idx + 1}
            </text>
          )
        })}

        {/* Name label above the self circle */}
        {circles[selfIdx] && (
          <motion.text
            x={circles[selfIdx].cx}
            y={NAME_Y}
            textAnchor="middle"
            fontSize={r >= 18 ? 12 : r >= 13 ? 10 : 8}
            fontWeight="800"
            fill={phase === 'result' ? GREEN : BLUE}
            initial={false}
            animate={{ opacity: 1, fill: phase === 'result' ? GREEN : BLUE }}
            transition={{ duration: 0.25 }}
          >
            {story.name}
          </motion.text>
        )}

        {/* Tick mark from name to self circle */}
        {circles[selfIdx] && (
          <line
            x1={circles[selfIdx].cx}
            y1={NAME_Y + 3}
            x2={circles[selfIdx].cx}
            y2={ROW_Y - r - 2}
            stroke={phase === 'result' ? GREEN : BLUE}
            strokeWidth={1.5}
            strokeDasharray="3 2"
          />
        )}

        {/* Front bracket */}
        {showFrontBracket && frontCount > 0 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d={frontBracketPath} stroke={ORANGE} strokeWidth={2} fill="none" strokeLinecap="round" />
            <text
              x={frontMidX}
              y={bracketLabelY}
              textAnchor="middle"
              fontSize={10}
              fontWeight="700"
              fill={ORANGE}
            >
              {frontCount} front
            </text>
          </motion.g>
        )}

        {/* Back bracket */}
        {showBackBracket && backCount > 0 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d={backBracketPath} stroke={ORANGE} strokeWidth={2} fill="none" strokeLinecap="round" />
            <text
              x={backMidX}
              y={bracketLabelY}
              textAnchor="middle"
              fontSize={10}
              fontWeight="700"
              fill={ORANGE}
            >
              {backCount} back
            </text>
          </motion.g>
        )}

        {/* "+1" badge on self circle during 'self' phase */}
        {showSelfPlus && circles[selfIdx] && (
          <motion.g
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            style={{ transformOrigin: `${circles[selfIdx].cx + r + 6}px ${circles[selfIdx].cy - r - 2}px` }}
          >
            <rect
              x={circles[selfIdx].cx + r - 2}
              y={circles[selfIdx].cy - r - 14}
              width={22}
              height={14}
              rx={4}
              fill={BLUE}
            />
            <text
              x={circles[selfIdx].cx + r + 9}
              y={circles[selfIdx].cy - r - 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight="800"
              fill="#fff"
            >
              +1
            </text>
          </motion.g>
        )}

        {/* Result: equation banner */}
        {showResultTotal && (
          <motion.g
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <text
              x={SVG_W / 2}
              y={bracketLabelY + 2}
              textAnchor="middle"
              fontSize={11}
              fontWeight="800"
              fill={GREEN}
            >
              {frontCount} + 1 + {backCount} = {total}
            </text>
          </motion.g>
        )}
      </svg>
    </LogicFrame>
  )
}
