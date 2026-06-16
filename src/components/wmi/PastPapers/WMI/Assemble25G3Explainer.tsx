import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BOARDS, TARGET_CELLS, PolyBoard, type Cell } from './Assemble25G3Illustration'
import { buildAssemble25G3Story, PLACEMENTS } from './assemble25G3Steps'

// WMI-25F3A-Q11 — post-answer explainer (answer E = the trio A, B, D).
// Mirrors Assemble25G3Diagram: the SAME five labelled boards across the top and
// the SAME 14-cell target below. The animation counts the target, adds the
// option trios (dropping the 13-cell ones), and slides A, B, D into the target
// one board per beat to show they tile it exactly → option E.

const CELL_STROKE = '#1F2937'
const GREEN = '#10B981' // echoes fill-qupu-success
const TARGET_EMPTY = '#F4EEE2' // unfilled target cell (qupu cream)

// One distinct fill per winning board so the assembled tiling reads clearly.
const PIECE_FILL: Record<string, string> = {
  A: '#FBCF9C', // peach   (fill-qupu-peach)
  B: '#A7D3F0', // sky     (fill-qupu-brand-blue light)
  D: '#C9E4B4', // sage    (fill-qupu-success light)
}

const VIEW_W = 340
const VIEW_H = 300
const SLOT_W = VIEW_W / 5
const BOARD_CELL = 17

function cellSpan(cells: Cell[]) {
  return {
    rows: Math.max(...cells.map(([r]) => r)) + 1,
    cols: Math.max(...cells.map(([, c]) => c)) + 1,
  }
}

function boardOrigin(cells: Cell[], slotIndex: number, topY: number) {
  const { rows, cols } = cellSpan(cells)
  const w = cols * BOARD_CELL
  const h = rows * BOARD_CELL
  const cx = slotIndex * SLOT_W + SLOT_W / 2
  return { x: cx - w / 2, y: topY + (66 - h) / 2 }
}

// Target geometry (lower band), matching the illustration's centring.
const TARGET_CELL = 28
const TARGET_COLS = cellSpan(TARGET_CELLS).cols
const TARGET_X = (VIEW_W - TARGET_COLS * TARGET_CELL) / 2
const TARGET_Y = 158

function targetXY(r: number, c: number) {
  return { x: TARGET_X + c * TARGET_CELL, y: TARGET_Y + r * TARGET_CELL }
}

export default function Assemble25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildAssemble25G3Story(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const trying = beat.trying
  // Cells already laid into the target by this beat (A, then B, then D).
  const laidPlacements = PLACEMENTS.slice(0, beat.laid)

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t(
        'Counting cells and testing each trio: only boards A, B and D fill the 14-cell target exactly, so the answer is E.',
        'Menghitung sel dan menguji tiap trio: hanya papan A, B, dan D yang mengisi target 14 sel dengan pas, jadi jawabannya E.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Five labelled boards across the top (same as the static figure). */}
          {BOARDS.map((b, i) => {
            const { x, y } = boardOrigin(b.cells, i, 12)
            const inTrio = trying != null && trying.includes(b.label)
            const dim = trying != null && !inTrio
            const fill = PIECE_FILL[b.label] ?? '#FBCF9C'
            return (
              <g key={b.label} opacity={dim ? 0.25 : 1}>
                <PolyBoard cells={b.cells} x={x} y={y} cell={BOARD_CELL} fill={fill} />
                {/* highlight ring on boards in the trio being weighed */}
                {inTrio && (
                  <circle
                    cx={i * SLOT_W + SLOT_W / 2}
                    cy={108}
                    r={11}
                    fill={beat.reject ? '#FDE2E1' : '#E1EFFB'}
                    stroke={beat.reject ? '#C0392B' : '#30598A'}
                    strokeWidth={2}
                  />
                )}
                <text
                  x={i * SLOT_W + SLOT_W / 2}
                  y={108}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill={inTrio ? (beat.reject ? '#C0392B' : '#30598A') : CELL_STROKE}
                  className="font-display"
                >
                  {b.label}
                </text>
              </g>
            )
          })}

          {/* Divider + target caption. */}
          <line x1={20} y1={126} x2={VIEW_W - 20} y2={126} stroke="#D6CBB8" strokeWidth={1.5} />
          <text
            x={VIEW_W / 2}
            y={142}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill="#6B7280"
          >
            {t('target — 14 cells', 'target — 14 sel')}
          </text>

          {/* Empty target outline. */}
          {TARGET_CELLS.map(([r, c], i) => {
            const { x, y } = targetXY(r, c)
            return (
              <rect
                key={`tgt-${i}`}
                x={x}
                y={y}
                width={TARGET_CELL}
                height={TARGET_CELL}
                fill={beat.result ? GREEN : TARGET_EMPTY}
                opacity={beat.result ? 0.12 : 1}
                stroke="#C9BDA6"
                strokeWidth={2}
              />
            )
          })}

          {/* Laid boards slide in over the target, one placement per beat. */}
          {laidPlacements.map((p) => (
            <motion.g
              key={`laid-${p.label}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {p.cells.map(([r, c], i) => {
                const { x, y } = targetXY(r, c)
                return (
                  <rect
                    key={`${p.label}-${i}`}
                    x={x}
                    y={y}
                    width={TARGET_CELL}
                    height={TARGET_CELL}
                    fill={PIECE_FILL[p.label]}
                    stroke={CELL_STROKE}
                    strokeWidth={2}
                  />
                )
              })}
            </motion.g>
          ))}

          {/* "Fits!" check mark on the winning beat. */}
          {beat.result && (
            <text
              x={VIEW_W / 2}
              y={TARGET_Y - 4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
            >
              ✅
            </text>
          )}

          {/* Fill the whole target outline boundary for the win to read clearly. */}
          {beat.result &&
            TARGET_CELLS.map(([r, c], i) => {
              const { x, y } = targetXY(r, c)
              return (
                <rect
                  key={`win-${i}`}
                  x={x}
                  y={y}
                  width={TARGET_CELL}
                  height={TARGET_CELL}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={2.5}
                />
              )
            })}
        </svg>

        {/* Trying / verdict label. */}
        {trying != null && !beat.result && (
          <div
            className="font-display text-xs font-bold"
            style={{ color: beat.reject ? '#C0392B' : '#30598A' }}
          >
            {t('trying', 'mencoba')} {trying.join(', ')}
          </div>
        )}

        {/* Caption box. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FDE2E1', borderColor: '#C0392B', color: '#9B2C20' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
