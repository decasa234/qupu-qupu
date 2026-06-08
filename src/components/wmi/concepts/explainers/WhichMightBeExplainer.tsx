import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildWhichMightBeSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

interface Params { lo: number; hi: number; k: number; options: number[] }

const BLUE = '#30598A'
const GREEN = '#10B981'
const ORANGE = '#F97316'
const RED = '#EF4444'

type RowData = { label: string; value: number; odd: boolean; range: boolean; digit: boolean }

function CheckMark({ pass, visible }: { pass: boolean; visible: boolean }) {
  return (
    <div className="flex items-center justify-center" style={{ width: 28, height: 28 }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={pass ? 'pass' : 'fail'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.25 }}
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: pass ? GREEN : RED,
              lineHeight: 1,
            }}
          >
            {pass ? '✓' : '✗'}
          </motion.span>
        )}
        {!visible && (
          <motion.span
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1 }}
          >
            –
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function TableRow({
  row,
  phase,
  correctLabel,
  isResult,
}: {
  row: RowData
  phase: string
  correctLabel: string
  isResult: boolean
}) {
  const isActive = phase === row.label
  const isWinner = isResult && row.label === correctLabel
  const isDimmed = isResult && row.label !== correctLabel

  // Reveal checkmarks: during the row's own phase, or after (result phase or later row phases)
  // We reveal all three checks when this row's phase has been shown or we are at result
  const rowPhaseOrder = ['A', 'B', 'C', 'D']
  const currentPhaseIdx = rowPhaseOrder.indexOf(phase)
  const rowIdx = rowPhaseOrder.indexOf(row.label)
  const rowRevealed = isResult || (currentPhaseIdx !== -1 && rowIdx <= currentPhaseIdx)

  return (
    <motion.tr
      animate={{
        opacity: isDimmed ? 0.35 : 1,
        scale: isWinner ? 1.03 : isActive ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      style={{
        background: isWinner
          ? '#D1FAE5'
          : isActive
          ? '#FFF7ED'
          : 'transparent',
        outline: isWinner
          ? `2px solid ${GREEN}`
          : isActive
          ? `2px solid ${ORANGE}`
          : '2px solid transparent',
        borderRadius: 10,
      }}
    >
      {/* Label */}
      <td
        className="py-2 pl-3 pr-2 text-center font-display text-sm font-black tabular-nums"
        style={{ color: isWinner ? GREEN : isActive ? ORANGE : BLUE }}
      >
        {row.label}
      </td>
      {/* Value */}
      <td
        className="py-2 px-2 text-center font-display text-base font-black tabular-nums"
        style={{ color: isWinner ? '#065F46' : isActive ? ORANGE : BLUE }}
      >
        {row.value}
      </td>
      {/* Odd */}
      <td className="py-2 px-2 text-center">
        {rowRevealed
          ? <CheckMark pass={row.odd} visible />
          : <CheckMark pass={false} visible={false} />}
      </td>
      {/* Range */}
      <td className="py-2 px-2 text-center">
        {rowRevealed
          ? <CheckMark pass={row.range} visible />
          : <CheckMark pass={false} visible={false} />}
      </td>
      {/* Digit */}
      <td className="py-2 pr-3 pl-2 text-center">
        {rowRevealed
          ? <CheckMark pass={row.digit} visible />
          : <CheckMark pass={false} visible={false} />}
      </td>
    </motion.tr>
  )
}

export default function WhichMightBeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = useMemo<Params>(() => (params ?? {}) as Params, [params])
  const lo = p.lo ?? 0
  const hi = p.hi ?? 99
  const k = p.k ?? 1
  const story = useMemo(() => buildWhichMightBeSteps(p, lang), [p, lang])
  const { beat } = useLogicBeat(story, props)
  const isResult = beat.phase === 'result'
  const isClues = beat.phase === 'clues'

  if (!story.rows || story.rows.length === 0) return null

  return (
    <LogicFrame beat={beat} label="Which might be — check table">
      <div className="w-full overflow-x-auto" style={{ maxWidth: 420 }}>
        <table
          className="w-full border-separate"
          style={{ borderSpacing: '0 4px' }}
          role="table"
        >
          <thead>
            <tr>
              <th className="pb-1 pl-3 pr-2 text-left font-display text-xs font-bold" style={{ color: '#64748B' }}>
                #
              </th>
              <th className="pb-1 px-2 text-center font-display text-xs font-bold" style={{ color: '#64748B' }}>
                Val
              </th>
              <motion.th
                className="pb-1 px-2 text-center font-display text-xs font-black"
                animate={{
                  color: isClues ? ORANGE : '#64748B',
                  scale: isClues ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                Odd?
              </motion.th>
              <motion.th
                className="pb-1 px-2 text-center font-display text-xs font-black"
                animate={{
                  color: isClues ? ORANGE : '#64748B',
                  scale: isClues ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {lo}&lt;v&lt;{hi}?
              </motion.th>
              <motion.th
                className="pb-1 px-2 text-center font-display text-xs font-black"
                animate={{
                  color: isClues ? ORANGE : '#64748B',
                  scale: isClues ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                d+d={k}?
              </motion.th>
            </tr>
          </thead>
          <tbody>
            {story.rows.map((row) => (
              <TableRow
                key={row.label}
                row={row}
                phase={beat.phase}
                correctLabel={story.correctLabel}
                isResult={isResult}
              />
            ))}
          </tbody>
        </table>
      </div>
    </LogicFrame>
  )
}
