import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDiceNetSteps } from './diceNetSteps'
import { useBeatControl } from './useBeatControl'

// ─── colours ─────────────────────────────────────────────────────────────────

const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'

// Net cell fill colours
const CELL_FILL_NORMAL = '#F6F1E7'     // qupu-shell equivalent
const CELL_FILL_WINNER = '#D1FAE5'     // green for valid net
const CELL_FILL_ELIMINATED = '#FEE2E2' // red tint for eliminated nets
const CELL_STROKE_NORMAL = '#30598A'
const CELL_STROKE_WINNER = '#10B981'
const CELL_STROKE_ELIMINATED = '#EF4444'

// Grid cell size in px (matches the illustration component's S=14)
const S = 14

// ─── net drawing helper ───────────────────────────────────────────────────────

type Cell = [number, number]

interface NetDims {
  width: number
  height: number
}

function getNetDims(cells: Cell[]): NetDims {
  if (!cells.length) return { width: S, height: S }
  const maxCol = Math.max(...cells.map(([c]) => c))
  const maxRow = Math.max(...cells.map(([, r]) => r))
  return { width: (maxCol + 1) * S, height: (maxRow + 1) * S }
}

type NetState = 'normal' | 'eliminated' | 'winner'

function NetSvg({
  cells,
  label,
  state,
}: {
  cells: Cell[]
  label: string
  state: NetState
}) {
  const { width, height } = getNetDims(cells)
  const fill =
    state === 'winner'
      ? CELL_FILL_WINNER
      : state === 'eliminated'
        ? CELL_FILL_ELIMINATED
        : CELL_FILL_NORMAL
  const stroke =
    state === 'winner'
      ? CELL_STROKE_WINNER
      : state === 'eliminated'
        ? CELL_STROKE_ELIMINATED
        : CELL_STROKE_NORMAL
  const labelColor =
    state === 'winner'
      ? GREEN_TEXT
      : state === 'eliminated'
        ? '#EF4444'
        : BLUE_TEXT

  // Pad around the net cells so label fits below
  const PAD = 4
  const LABEL_H = 16
  const svgW = width + PAD * 2
  const svgH = height + PAD * 2 + LABEL_H

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      aria-hidden="true"
    >
      {cells.map(([col, row], i) => (
        <rect
          key={i}
          x={PAD + col * S}
          y={PAD + row * S}
          width={S}
          height={S}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      ))}
      {/* Label below the net */}
      <text
        x={svgW / 2}
        y={height + PAD * 2 + LABEL_H - 3}
        textAnchor="middle"
        fontSize={12}
        fontWeight="800"
        fontFamily="Nunito, sans-serif"
        fill={labelColor}
      >
        {label}
      </text>
      {/* X mark for eliminated nets */}
      {state === 'eliminated' && (
        <>
          <line
            x1={PAD}
            y1={PAD}
            x2={PAD + width}
            y2={PAD + height}
            stroke="#EF4444"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.45}
          />
          <line
            x1={PAD + width}
            y1={PAD}
            x2={PAD}
            y2={PAD + height}
            stroke="#EF4444"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.45}
          />
        </>
      )}
    </svg>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

interface DiceNetParams {
  nets?: Cell[][]
  validIndex?: number
}

export default function DiceNetFoldExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as DiceNetParams

  const rawNets = p.nets
  const nets = useMemo(
    () => (Array.isArray(rawNets) ? rawNets : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawNets)],
  )

  const story = useMemo(
    () => buildDiceNetSteps(nets, p.validIndex, lang),
    [nets, p.validIndex, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const LABELS = ['A', 'B', 'C', 'D'] as const

  const ariaLabel =
    lang === 'id'
      ? `Penjelas jaring-jaring kubus: jaring ${story.answerLabel} membentuk kubus.`
      : `Cube net explainer: net ${story.answerLabel} folds into a cube.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* 2×2 grid of nets */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {story.nets.map((cells, i) => {
            const label = LABELS[i] ?? String(i)
            const isEliminated = beat.eliminated.includes(i)
            const isWinner = beat.winner === i
            const state: NetState = isWinner
              ? 'winner'
              : isEliminated
                ? 'eliminated'
                : 'normal'

            return (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                animate={
                  isEliminated
                    ? { opacity: 0.45 }
                    : isWinner
                      ? { opacity: 1, scale: 1.08 }
                      : { opacity: 1, scale: 1 }
                }
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <NetSvg cells={cells} label={label} state={state} />
              </motion.div>
            )
          })}
        </div>

        {/* Caption strip */}
        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
