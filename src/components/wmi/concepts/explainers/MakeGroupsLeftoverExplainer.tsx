import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMakeGroupsLeftoverSteps } from './makeGroupsLeftoverSteps'
import { useBeatControl } from './useBeatControl'

interface MakeGroupsLeftoverParams {
  total: number
  groupSize: number
}

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const GROUP_RING = '#2563EB'

// Dot colors per group index (cycles), plus orange for leftover.
const GROUP_FILLS = [
  '#2563EB', // blue
  '#7C3AED', // violet
  '#0891B2', // cyan
  '#059669', // teal
  '#D97706', // amber
  '#DC2626', // red
  '#DB2777', // pink
]

function groupFill(groupIndex: number): string {
  return GROUP_FILLS[groupIndex % GROUP_FILLS.length]
}

/**
 * Single dot element.  `filled` controls opacity, `color` the fill color,
 * `ring` whether to draw the group-ring border, `highlight` = leftover glow.
 */
function Dot({
  color,
  highlight,
}: {
  color: string
  highlight: boolean
}) {
  return (
    <motion.span
      layout
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 480, damping: 26 }}
      className="block rounded-full"
      style={{
        width: 18,
        height: 18,
        background: color,
        boxShadow: highlight ? `0 0 0 3px ${ORANGE}, 0 0 8px 2px ${ORANGE}66` : 'none',
      }}
    />
  )
}

/**
 * Renders one completed group as a row of `groupSize` dots surrounded by
 * a rounded ring.
 */
function GroupRing({
  groupIndex,
  groupSize,
  label,
}: {
  groupIndex: number
  groupSize: number
  label: number
}) {
  const fill = groupFill(groupIndex)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className="relative flex flex-wrap items-center justify-center gap-[0.1875rem] rounded-2xl border-2 px-2 py-2"
      style={{ borderColor: GROUP_RING, background: '#EFF6FF' }}
    >
      {/* Group number badge */}
      <span
        className="absolute -left-2 -top-2 grid h-5 w-5 place-items-center rounded-full text-[0.625rem] font-black text-white"
        style={{ background: fill }}
      >
        {label}
      </span>
      {Array.from({ length: groupSize }, (_, i) => (
        <Dot key={i} color={fill} highlight={false} />
      ))}
    </motion.div>
  )
}

/**
 * Renders a loose dot (ungrouped, possibly highlighted as leftover).
 */
function LooseDot({ index, highlight }: { index: number; highlight: boolean }) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 480, damping: 28, delay: index * 0.03 }}
    >
      <Dot color={highlight ? ORANGE : '#94A3B8'} highlight={highlight} />
    </motion.div>
  )
}

export default function MakeGroupsLeftoverExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as MakeGroupsLeftoverParams

  const story = useMemo(
    () => buildMakeGroupsLeftoverSteps(p.total, p.groupSize, lang),
    [p.total, p.groupSize, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { total, groupSize, groups, leftover } = story
  const { groupsFormed, highlightLeftover } = beat

  // Dots in completed groups: groupsFormed * groupSize
  const groupedCount = groupsFormed * groupSize
  // Remaining loose dots: total - groupedCount
  const looseCount = total - groupedCount

  const ariaLabel =
    lang === 'id'
      ? `Strategi: bagi ${total} benda ke kelompok berisi ${groupSize}. Dapat ${groups} kelompok, sisa ${leftover}.`
      : `Strategy: split ${total} counters into groups of ${groupSize}. Form ${groups} full groups, leftover is ${leftover}.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Visual area */}
        <div className="flex w-full flex-col items-center gap-3">

          {/* Completed groups as rings */}
          {groupsFormed > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: groupsFormed }, (_, gi) => (
                <GroupRing key={gi} groupIndex={gi} groupSize={groupSize} label={gi + 1} />
              ))}
            </div>
          )}

          {/* Loose / ungrouped dots */}
          {looseCount > 0 && (
            <div className="flex flex-wrap justify-center gap-[0.25rem]">
              {Array.from({ length: looseCount }, (_, i) => (
                <LooseDot
                  key={i}
                  index={i}
                  highlight={highlightLeftover}
                />
              ))}
            </div>
          )}

          {/* Running count badges */}
          {groupsFormed > 0 && (
            <motion.div
              key={groupsFormed}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-bold"
              style={{ borderColor: BLUE, color: BLUE, background: '#E1EFFB' }}
            >
              <span style={{ color: GROUP_RING }}>{groupsFormed} {lang === 'id' ? 'kelompok' : 'group'}{groupsFormed !== 1 ? 's' : ''}</span>
              {highlightLeftover && leftover > 0 && (
                <>
                  <span style={{ color: '#94A3B8' }}>+</span>
                  <span style={{ color: ORANGE }}>{leftover} {lang === 'id' ? 'sisa' : 'leftover'}</span>
                </>
              )}
            </motion.div>
          )}
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
