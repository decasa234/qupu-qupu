import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildOperatorFillSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

interface Params { nums: number[]; target: number; options: ('+' | '-')[][] }

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const RED = '#EF4444'

function NumBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border-2 px-1 font-display text-base font-extrabold tabular-nums"
      style={{ borderColor: '#CBD5E1', background: '#F8FAFC', color: BLUE }}
    >
      {children}
    </div>
  )
}

function OpChip({ sign, active }: { sign: '+' | '-'; active: boolean }) {
  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-black"
      style={{
        background: active ? ORANGE : '#E2E8F0',
        color: active ? '#fff' : '#64748B',
        border: active ? `2px solid ${ORANGE}` : '2px solid #CBD5E1',
      }}
    >
      {sign === '+' ? '+' : '−'}
    </div>
  )
}

export default function OperatorFillExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(
    () => buildOperatorFillSteps((params ?? {}) as Params, lang),
    [params, lang],
  )
  const { beat } = useLogicBeat(story, props)

  const nums = story.nums.length === 4 ? story.nums : [10, 3, 2, 1]

  // Phase helpers
  const isTarget = beat.phase === 'target'
  const isResult = beat.phase === 'result'

  return (
    <LogicFrame beat={beat} label="Operator fill — option checking">
      {/* Target header */}
      <motion.div
        key="target-header"
        className="flex items-center justify-center gap-1.5 rounded-xl border-2 px-4 py-2"
        style={{
          borderColor: isTarget ? ORANGE : '#CBD5E1',
          background: isTarget ? '#FFF7ED' : '#F8FAFC',
        }}
        animate={{ scale: isTarget ? 1.04 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <span
          className="font-display text-sm font-bold"
          style={{ color: '#64748B' }}
        >
          {nums[0]} □ {nums[1]} □ {nums[2]} □ {nums[3]} =
        </span>
        <span
          className="font-display text-xl font-black"
          style={{ color: isTarget ? ORANGE : BLUE }}
        >
          {story.target}
        </span>
      </motion.div>

      {/* Option rows */}
      <div className="flex w-full flex-col gap-2">
        {story.rows.map((row) => {
          const isActive = beat.phase === String(row.label)
          const isWinner = isResult && row.label === story.correctLabel
          const isLoser = isResult && row.label !== story.correctLabel
          // reveal result chip once that row has been visited or at 'result'
          const rowIndex = story.rows.indexOf(row)
          const activeRowIndex = story.rows.findIndex(
            (r) => r.label === beat.phase,
          )
          const revealed =
            isResult ||
            isActive ||
            (activeRowIndex !== -1 && rowIndex < activeRowIndex)

          return (
            <motion.div
              key={row.label}
              className="flex items-center gap-1.5 rounded-xl border-2 px-3 py-2"
              style={{
                borderColor: isWinner
                  ? GREEN
                  : isActive
                    ? ORANGE
                    : '#E2E8F0',
                background: isWinner
                  ? '#D1FAE5'
                  : isActive
                    ? '#FFF7ED'
                    : isLoser
                      ? '#F8FAFC'
                      : '#fff',
                opacity: isLoser ? 0.45 : 1,
              }}
              animate={
                isWinner
                  ? { scale: [1, 1.06, 1.03] }
                  : isActive
                    ? { scale: 1.02 }
                    : { scale: 1 }
              }
              transition={
                isWinner
                  ? { duration: 0.5, times: [0, 0.4, 1] }
                  : { type: 'spring', stiffness: 200, damping: 18 }
              }
            >
              {/* Label badge */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-display text-sm font-black"
                style={{
                  background: isWinner
                    ? GREEN
                    : isActive
                      ? ORANGE
                      : '#E2E8F0',
                  color: isWinner || isActive ? '#fff' : '#64748B',
                }}
              >
                {row.label}
              </div>

              {/* Equation: n0 [s0] n1 [s1] n2 [s2] n3 */}
              <div className="flex flex-1 items-center justify-center gap-1">
                <NumBox>{nums[0]}</NumBox>
                {row.signs[0] != null && (
                  <OpChip sign={row.signs[0]} active={isActive || isWinner} />
                )}
                <NumBox>{nums[1]}</NumBox>
                {row.signs[1] != null && (
                  <OpChip sign={row.signs[1]} active={isActive || isWinner} />
                )}
                <NumBox>{nums[2]}</NumBox>
                {row.signs[2] != null && (
                  <OpChip sign={row.signs[2]} active={isActive || isWinner} />
                )}
                <NumBox>{nums[3]}</NumBox>
                <span
                  className="font-display text-sm font-bold"
                  style={{ color: '#94A3B8' }}
                >
                  =
                </span>
                {/* Result, revealed progressively */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    revealed
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <NumBox>{row.result}</NumBox>
                </motion.div>
              </div>

              {/* ✓ / ✗ badge */}
              <motion.div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-black"
                style={{
                  background: !revealed
                    ? '#E2E8F0'
                    : row.matches
                      ? GREEN
                      : RED,
                  color: revealed ? '#fff' : '#94A3B8',
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={
                  revealed
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.6 }
                }
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              >
                {!revealed ? '?' : row.matches ? '✓' : '✗'}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </LogicFrame>
  )
}
