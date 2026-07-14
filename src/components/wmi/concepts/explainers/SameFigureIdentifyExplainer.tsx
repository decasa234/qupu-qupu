import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildSameFigureSteps } from './sameFigureSteps'
import { useBeatControl } from './useBeatControl'

// ─── constants ────────────────────────────────────────────────────────────────

/** Side length (px) of each grid cell in the polyomino renderer. */
const S = 18

const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'
const SHAPE_FILL = '#F6F1E7'
const SHAPE_STROKE = '#30598A'
const OPTION_FILL = '#EDF4FB'
const OPTION_STROKE = '#6B96C2'

// ─── helpers ──────────────────────────────────────────────────────────────────

type Cell = [number, number]

/** Bounding box of a cell list. */
function dims(cells: Cell[]): [number, number] {
  if (cells.length === 0) return [1, 1]
  const maxRow = Math.max(...cells.map((c) => c[0]))
  const maxCol = Math.max(...cells.map((c) => c[1]))
  return [maxRow + 1, maxCol + 1]
}

interface ShapeProps {
  cells: Cell[]
  /** Top-left pixel offset of the bounding box within the SVG. */
  ox: number
  oy: number
  fill: string
  stroke: string
  strokeWidth?: number
  keyPrefix: string
}

function renderCells({ cells, ox, oy, fill, stroke, strokeWidth = 1.5, keyPrefix }: ShapeProps) {
  return cells.map(([r, c], i) => (
    <rect
      key={`${keyPrefix}-${i}`}
      x={ox + c * S}
      y={oy + r * S}
      width={S - 1}
      height={S - 1}
      rx={2}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  ))
}

/** Centre-align cells into a slot of pixel dimensions slotW × slotH. */
function centeredOffset(cells: Cell[], slotW: number, slotH: number): [number, number] {
  const [rows, cols] = dims(cells)
  const ox = (slotW - cols * S) / 2
  const oy = (slotH - rows * S) / 2
  return [ox, oy]
}

// ─── component ────────────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D'] as const

export default function SameFigureIdentifyExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props

  const story = useMemo(() => buildSameFigureSteps(params, lang), [params, lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // ── layout constants ──────────────────────────────────────────────────────
  const refSlotH = 100
  const optSlotW = 78
  const optSlotH = 70
  const optLabelH = 20
  const svgW = 4 * optSlotW          // 312
  const svgH = refSlotH + 10 + optSlotH + optLabelH // 200

  // ── ref figure transform origin (centre of ref slot) ────────────────────
  const refCx = svgW / 2
  const refCy = refSlotH / 2

  const targetCells = story.params.target
  const [refOx, refOy] = centeredOffset(targetCells, svgW, refSlotH)

  // ── aria label ───────────────────────────────────────────────────────────
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan bentuk sama: putar bangun acuan, bandingkan dengan pilihan ${story.answerLabel}.`
      : `Same-figure explainer: rotate the reference and match it to option ${story.answerLabel}.`

  const isResult = beat.result

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          className="w-full max-w-[21.25rem] overflow-visible"
          aria-hidden="true"
        >
          {/* ── Reference figure (top half) ─────────────────────────────── */}
          <motion.g
            style={{ transformOrigin: `${refCx}px ${refCy}px` }}
            animate={{ rotate: beat.phase === 'rotate' || beat.phase === 'result' ? beat.rotateDeg : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            {renderCells({
              cells: targetCells,
              ox: refOx,
              oy: refOy,
              fill: isResult ? '#D1FAE5' : SHAPE_FILL,
              stroke: isResult ? GREEN_BORDER : SHAPE_STROKE,
              strokeWidth: 2,
              keyPrefix: 'ref',
            })}
          </motion.g>

          {/* Divider */}
          <line
            x1={8}
            y1={refSlotH + 4}
            x2={svgW - 8}
            y2={refSlotH + 4}
            stroke={BLUE_BORDER}
            strokeWidth={1}
            opacity={0.35}
          />

          {/* ── Options (bottom half) ────────────────────────────────────── */}
          {story.params.options.map((cells, i) => {
            const isCorrect = i === story.validIndex
            const isHighlighted = beat.highlightCorrect && isCorrect
            const optTopY = refSlotH + 10
            const slotX = i * optSlotW
            const [ox, oy] = centeredOffset(cells, optSlotW, optSlotH)

            return (
              <g key={i}>
                {/* Green highlight ring around correct option on result beat */}
                {isHighlighted && (
                  <motion.rect
                    x={slotX + 2}
                    y={optTopY + 2}
                    width={optSlotW - 4}
                    height={optSlotH - 4}
                    rx={6}
                    fill="none"
                    stroke={GREEN_BORDER}
                    strokeWidth={3}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ transformOrigin: `${slotX + optSlotW / 2}px ${optTopY + optSlotH / 2}px` }}
                  />
                )}

                {/* Option cells */}
                {renderCells({
                  cells,
                  ox: slotX + ox,
                  oy: optTopY + oy,
                  fill: isHighlighted ? '#D1FAE5' : OPTION_FILL,
                  stroke: isHighlighted ? GREEN_BORDER : OPTION_STROKE,
                  strokeWidth: 1.5,
                  keyPrefix: `opt${i}`,
                })}

                {/* Option label A/B/C/D */}
                <text
                  x={slotX + optSlotW / 2}
                  y={optTopY + optSlotH + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight="800"
                  fontFamily="Nunito, sans-serif"
                  fill={isHighlighted ? GREEN_TEXT : BLUE_TEXT}
                >
                  {LABELS[i]}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Caption strip */}
        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
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
