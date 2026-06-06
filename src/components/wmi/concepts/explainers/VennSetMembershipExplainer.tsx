import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildVennSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

interface Params { aOnly: number[]; both: number[]; bOnly: number[] }

// Layout constants
const SVG_W = 420
const SVG_H = 220
const CY = SVG_H / 2            // 110
const R = 80                    // circle radius
const GAP = 32                  // half-overlap distance
const CX_A = SVG_W / 2 - GAP   // left circle centre-x
const CX_B = SVG_W / 2 + GAP   // right circle centre-x

// Colours
const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const SLATE = '#94A3B8'

// Clamp & guard helpers
function safeArray(v: unknown): number[] {
  return Array.isArray(v) ? (v as number[]) : []
}
function cap(arr: number[], max = 5): number[] {
  return arr.slice(0, max)
}

// Spread numbers in a region with simple vertical stacking
function regionPositions(cx: number, cy: number, count: number): { x: number; y: number }[] {
  if (count === 0) return []
  const spacing = 22
  const startY = cy - ((count - 1) * spacing) / 2
  return Array.from({ length: count }, (_, i) => ({ x: cx, y: startY + i * spacing }))
}

// A-only crescent centre: to the left of lens midpoint
const AONLY_CX = CX_A - 26
const BOTH_CX = (CX_A + CX_B) / 2   // lens centre x
const BONLY_CX = CX_B + 26

interface VennNumberProps {
  x: number
  y: number
  value: number
  dimmed?: boolean
  highlighted?: boolean
  good?: boolean
  phase: string
}

function VennNumber({ x, y, value, dimmed, highlighted, good }: VennNumberProps) {
  const color = good ? GREEN : highlighted ? ORANGE : dimmed ? SLATE : BLUE
  const opacity = dimmed ? 0.35 : 1
  const scale = highlighted || good ? 1.25 : 1

  return (
    <motion.text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="inherit"
      fontWeight="900"
      fontSize={15}
      fill={color}
      initial={false}
      animate={{ opacity, scale }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ originX: x + 'px', originY: y + 'px' }}
    >
      {value}
    </motion.text>
  )
}

interface RegionHighlightProps {
  active: boolean
  good?: boolean
}

// Highlight the A-only crescent using a mask approach via two rects trick
function AOnlyCrescent({ active, good }: RegionHighlightProps) {
  const fill = good ? GREEN : ORANGE
  return (
    <motion.g>
      <defs>
        <mask id="aonly-mask">
          <circle cx={CX_A} cy={CY} r={R} fill="white" />
          <circle cx={CX_B} cy={CY} r={R} fill="black" />
        </mask>
      </defs>
      <motion.ellipse
        cx={AONLY_CX}
        cy={CY}
        rx={R * 0.62}
        ry={R * 0.88}
        mask="url(#aonly-mask)"
        fill={fill}
        animate={{ opacity: active ? (good ? 0.28 : 0.32) : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.g>
  )
}

// Overlap (lens) highlight
function LensHighlight({ active }: { active: boolean }) {
  // Lens path: intersection of two circles
  // We approximate with a simple ellipse centered at lens midpoint
  const lensRx = Math.abs(CX_B - CX_A) * 0.72
  const lensRy = R * 0.72
  return (
    <motion.ellipse
      cx={BOTH_CX}
      cy={CY}
      rx={lensRx}
      ry={lensRy}
      fill={SLATE}
      animate={{ opacity: active ? 0.18 : 0 }}
      transition={{ duration: 0.3 }}
    />
  )
}

export default function VennSetMembershipExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildVennSteps((params ?? {}) as Params, lang), [params, lang])
  const { beat } = useLogicBeat(story, props)
  const p = (params ?? {}) as Params

  const aOnly = cap(safeArray(p.aOnly), 5)
  const both = cap(safeArray(p.both), 5)
  const bOnly = cap(safeArray(p.bOnly), 5)

  const phase = beat.phase

  // Compute positions
  const aOnlyPos = regionPositions(AONLY_CX, CY, aOnly.length)
  const bothPos = regionPositions(BOTH_CX, CY, both.length)
  const bOnlyPos = regionPositions(BONLY_CX, CY, bOnly.length)

  // State flags
  const highlightAOnly = phase === 'aOnly'
  const excludeOverlap = phase === 'exclude'
  const showResult = phase === 'result'

  const aOnlyActive = highlightAOnly || showResult
  const aOnlyGood = showResult
  const overlapDimmed = excludeOverlap || showResult
  const circleAStroke = aOnlyActive ? (aOnlyGood ? GREEN : ORANGE) : BLUE
  const circleAWidth = aOnlyActive ? 2.5 : 1.5

  return (
    <LogicFrame beat={beat} label="Venn A-only sum">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        style={{ maxWidth: '100%', display: 'block', margin: '0 auto', overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Region highlights — drawn below circles */}
        <AOnlyCrescent active={aOnlyActive} good={aOnlyGood} />
        <LensHighlight active={overlapDimmed} />

        {/* Circle B */}
        <motion.circle
          cx={CX_B}
          cy={CY}
          r={R}
          fill="none"
          strokeWidth={1.5}
          animate={{ stroke: BLUE }}
          transition={{ duration: 0.3 }}
        />

        {/* Circle A — highlighted when A-only phase */}
        <motion.circle
          cx={CX_A}
          cy={CY}
          r={R}
          fill="none"
          animate={{ stroke: circleAStroke, strokeWidth: circleAWidth }}
          transition={{ duration: 0.3 }}
        />

        {/* Circle labels */}
        <text
          x={CX_A - R + 10}
          y={CY - R + 16}
          fontFamily="inherit"
          fontWeight="800"
          fontSize={16}
          fill={aOnlyActive ? (aOnlyGood ? GREEN : ORANGE) : BLUE}
        >
          A
        </text>
        <text
          x={CX_B + R - 18}
          y={CY - R + 16}
          fontFamily="inherit"
          fontWeight="800"
          fontSize={16}
          fill={BLUE}
        >
          B
        </text>

        {/* A-only numbers */}
        {aOnly.map((val, i) => (
          <VennNumber
            key={`aonly-${i}`}
            x={aOnlyPos[i]?.x ?? AONLY_CX}
            y={aOnlyPos[i]?.y ?? CY}
            value={val}
            highlighted={highlightAOnly}
            good={showResult}
            phase={phase}
          />
        ))}

        {/* Overlap numbers */}
        {both.map((val, i) => (
          <VennNumber
            key={`both-${i}`}
            x={bothPos[i]?.x ?? BOTH_CX}
            y={bothPos[i]?.y ?? CY}
            value={val}
            dimmed={overlapDimmed}
            phase={phase}
          />
        ))}

        {/* B-only numbers */}
        {bOnly.map((val, i) => (
          <VennNumber
            key={`bonly-${i}`}
            x={bOnlyPos[i]?.x ?? BONLY_CX}
            y={bOnlyPos[i]?.y ?? CY}
            value={val}
            dimmed={excludeOverlap || showResult}
            phase={phase}
          />
        ))}

        {/* Result annotation: show sum equation below A-only region */}
        {showResult && (
          <motion.text
            x={AONLY_CX}
            y={CY + R - 10}
            textAnchor="middle"
            fontFamily="inherit"
            fontWeight="900"
            fontSize={13}
            fill={GREEN}
            initial={{ opacity: 0, y: CY + R }}
            animate={{ opacity: 1, y: CY + R - 10 }}
            transition={{ duration: 0.35 }}
          >
            {story.add} = {story.answer}
          </motion.text>
        )}

      </svg>
    </LogicFrame>
  )
}
