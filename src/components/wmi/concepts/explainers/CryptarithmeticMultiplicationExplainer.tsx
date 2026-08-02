import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import { ASK_DASH, CRYPTA_INK, cryptaGeometry, cryptaSlots } from '../cryptarithmetic-addition'
import {
  buildCryptarithmeticMultiplicationSteps,
  type MulStep,
  type MulTone,
} from './cryptarithmeticMultiplicationSteps'

// The written multiplication borrows the addition puzzle's column geometry and
// palette (`../cryptarithmetic-addition`) rather than keeping a second copy of
// those numbers — the two written sums must line up identically for a child, and
// a private copy silently desyncs when either figure moves.
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const BLUE_FILL = '#E1EFFB'
const BLUE_INK = '#234668'
const GREEN_FILL = '#EEF7E0'
const GREEN_INK = '#3B6F00'
const ORANGE_FILL = '#FFF2DF'
const ORANGE_INK = '#9A4A12'
const ROSE_FILL = '#FFF1F2'
const ROSE_INK = '#9F1239'

const TONE: Record<MulTone, { ink: string; edge: string; fill: string }> = {
  plan: { ink: BLUE_INK, edge: CRYPTA_INK.letter, fill: BLUE_FILL },
  work: { ink: BLUE_INK, edge: CRYPTA_INK.letter, fill: BLUE_FILL },
  win: { ink: GREEN_INK, edge: CRYPTA_INK.settled, fill: GREEN_FILL },
}

const BOARD_W = 300
const STRIP_X = 15
const CHIP_W = 26
const CHIP_GAP = 6
const CELL_W = 22
const CELL_PITCH = 24
const ROW_H = 20
const STRIP_GAP = 12

/** The carry written above a column: dashed and dimmed while it is not yet worked out. */
function CarryChip({ cx, y, value, dur }: { cx: number; y: number; value: number | null; dur: number }) {
  const known = value !== null
  const w = 22
  const h = 19
  return (
    <motion.g initial={false} animate={{ opacity: known ? 1 : 0.5 }} transition={{ duration: dur }}>
      <rect
        x={cx - w / 2}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={known ? ORANGE_FILL : '#FFFFFF'}
        stroke={known ? CRYPTA_INK.ask : CRYPTA_INK.tileEdge}
        strokeWidth={known ? 2.2 : 1.4}
        strokeDasharray={known ? undefined : '3 3'}
      />
      <text
        x={cx}
        y={y + h / 2 + 4.6}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
        fill={known ? CRYPTA_INK.ask : CRYPTA_INK.muted}
      >
        {known ? value : '?'}
      </text>
    </motion.g>
  )
}

/**
 * The board: the written multiplication on the addition figure's own geometry,
 * with the beat's column spotlighted, its carry drawn above it, and — on the
 * beat where a covered top digit is being hunted — a 0-9 strip showing every
 * digit the column just threw out.
 */
function MulBoard({
  topMask,
  prodMask,
  multiplier,
  askLetter,
  step,
  reduce,
}: {
  topMask: string
  prodMask: string
  multiplier: number
  askLetter: string | null
  step: MulStep
  reduce: boolean
}) {
  const geom = cryptaGeometry(prodMask.length)
  const dur = reduce ? 0 : 0.34
  // Centre the DIGIT COLUMNS, not the block: the block carries a wide left
  // margin for the × sign, and centring on that pushes the board off to the right.
  const blockX = BOARD_W / 2 - (geom.colX(0) + geom.colX(geom.cols - 1) + geom.cellW) / 2
  const blockY = geom.carryH
  const stripY = blockY + geom.blockHeight + STRIP_GAP
  const height = stripY + ROW_H + 4

  // Column j (0 = ones, counted from the right) is drawn at slot k from the left.
  const slotOf = (j: number) => geom.cols - 1 - j

  const tile = (key: string, k: number, rowY: number, ch: string) => {
    const x = blockX + geom.colX(k)
    const isLetter = /[A-Z]/.test(ch)
    const value = isLetter ? step.revealed[ch] : undefined
    const known = !isLetter || value !== undefined
    const settled = isLetter && value !== undefined
    const isAsk = isLetter && ch === askLetter
    const landed = step.justRevealed.includes(ch)
    const edge = settled ? CRYPTA_INK.settled : isAsk ? CRYPTA_INK.ask : CRYPTA_INK.tileEdge
    const ink = settled
      ? GREEN_INK
      : isLetter
        ? isAsk
          ? CRYPTA_INK.ask
          : CRYPTA_INK.letter
        : CRYPTA_INK.letter
    return (
      <g key={key}>
        {landed && !reduce && (
          // A ring blooming outward marks the moment this box was uncovered. The
          // digit itself never animates in — a digit that has been earned must be
          // readable the instant the beat appears.
          <motion.rect
            x={x - 3}
            y={rowY - 3}
            width={geom.cellW + 6}
            height={geom.cellH + 6}
            rx={13}
            fill="none"
            stroke={CRYPTA_INK.settled}
            strokeWidth={2}
            initial={{ opacity: 0.85, scale: 0.86 }}
            animate={{ opacity: 0, scale: 1.12 }}
            style={{ transformOrigin: `${x + geom.cellW / 2}px ${rowY + geom.cellH / 2}px` }}
            transition={{ duration: 0.7 }}
          />
        )}
        <motion.rect
          x={x}
          y={rowY}
          width={geom.cellW}
          height={geom.cellH}
          rx={10}
          initial={false}
          animate={{
            fill: settled ? GREEN_FILL : CRYPTA_INK.tile,
            stroke: edge,
            strokeWidth: settled || isAsk ? 3 : 2,
          }}
          strokeDasharray={isLetter && !settled ? ASK_DASH : '0 0'}
          transition={{ duration: dur }}
        />
        {settled && (
          // Tiny reminder of which letter used to cover this box.
          <text x={x + 8} y={rowY + 13} textAnchor="middle" fontSize={10} fontWeight="bold" fill={CRYPTA_INK.muted}>
            {ch}
          </text>
        )}
        <motion.text
          x={x + geom.cellW / 2}
          y={rowY + geom.cellH / 2 + 9}
          textAnchor="middle"
          fontSize={26}
          fontWeight="bold"
          initial={false}
          animate={{ fill: ink }}
          transition={{ duration: dur }}
        >
          {known && isLetter ? value : ch}
        </motion.text>
      </g>
    )
  }

  const cand = step.candidates

  return (
    <svg viewBox={`0 0 ${BOARD_W} ${height}`} width="100%" role="presentation" aria-hidden>
      {/* spotlight band down the column this beat is working on */}
      {step.focus !== null && step.focus < geom.cols && (
        <motion.rect
          initial={false}
          animate={{ x: blockX + geom.colX(slotOf(step.focus)) - 5, opacity: 1 }}
          y={2}
          width={geom.cellW + 10}
          height={blockY + geom.blockHeight - 4}
          rx={12}
          fill={CRYPTA_INK.ask}
          fillOpacity={0.12}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        />
      )}

      {/* the carries, written above the column they feed */}
      {step.carries.map((value, j) =>
        j >= 1 && j < geom.cols ? (
          <CarryChip
            key={`carry${j}`}
            cx={blockX + geom.colX(slotOf(j)) + geom.cellW / 2}
            y={4}
            value={value}
            dur={dur}
          />
        ) : null,
      )}

      <g transform={`translate(0 ${blockY})`}>
        {cryptaSlots(topMask, geom.cols).map((s) => tile(`t${s.k}`, s.k, geom.rowAY, s.letter))}
        {cryptaSlots(String(multiplier), geom.cols).map((s) =>
          tile(`m${s.k}`, s.k, geom.rowBY, s.letter),
        )}
        <text
          x={blockX + geom.plusX}
          y={geom.rowBY + geom.cellH / 2 + 9}
          textAnchor="middle"
          fontSize={26}
          fontWeight="bold"
          fill={CRYPTA_INK.muted}
        >
          ×
        </text>
        <line
          x1={blockX + 6}
          y1={geom.ruleY}
          x2={blockX + geom.width - 6}
          y2={geom.ruleY}
          stroke={CRYPTA_INK.rule}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {cryptaSlots(prodMask, geom.cols).map((s) => tile(`p${s.k}`, s.k, geom.rowSY, s.letter))}
      </g>

      {/* which digits this column has just thrown out, and the one left standing */}
      {cand && (
        <g>
          <rect
            x={STRIP_X}
            y={stripY}
            width={CHIP_W}
            height={ROW_H}
            rx={6}
            fill={ORANGE_FILL}
            stroke={CRYPTA_INK.ask}
            strokeWidth={2}
          />
          <text
            x={STRIP_X + CHIP_W / 2}
            y={stripY + ROW_H / 2 + 4.8}
            textAnchor="middle"
            fontSize={13}
            fontWeight="bold"
            fill={CRYPTA_INK.ask}
          >
            {cand.letter}
          </text>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
            const x = STRIP_X + CHIP_W + CHIP_GAP + digit * CELL_PITCH
            const out = cand.cut.includes(digit)
            return (
              <g key={digit}>
                <rect
                  x={x}
                  y={stripY}
                  width={CELL_W}
                  height={ROW_H}
                  rx={5}
                  fill={out ? ROSE_FILL : GREEN_FILL}
                  stroke={out ? CRYPTA_INK.reject : CRYPTA_INK.settled}
                  strokeWidth={out ? 1.6 : 2.4}
                />
                <text
                  x={x + CELL_W / 2}
                  y={stripY + ROW_H / 2 + 4.6}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill={out ? ROSE_INK : GREEN_INK}
                >
                  {digit}
                </text>
                {out && (
                  <motion.line
                    x1={x + 3}
                    y1={stripY + ROW_H - 3.5}
                    x2={x + CELL_W - 3}
                    y2={stripY + 3.5}
                    stroke={CRYPTA_INK.reject}
                    strokeWidth={2}
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduce ? 0 : 0.3 }}
                  />
                )}
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}

export default function CryptarithmeticMultiplicationExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(
    () => buildCryptarithmeticMultiplicationSteps(params, lang),
    [params, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const step = story.steps[index] ?? story.steps[story.finalIndex]
  const reduce = !!useReducedMotion()
  const tone = TONE[step.tone]
  const z = story.puzzle

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: write ${z.topMask} × ${z.multiplier} = ${z.prodMask} in columns and work from the ones ` +
      `column leftwards, carrying as you go, until every covered box is forced. The answer is ${story.answer}.`,
    `Strategi: tulis ${z.topMask} × ${z.multiplier} = ${z.prodMask} bersusun lalu kerjakan dari kolom satuan ` +
      `ke kiri sambil membawa simpanan, sampai semua kotak tertutup terpaksa terisi. Jawabannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* phase chip — names the move this beat is making */}
        <div
          className="rounded-full border-2 px-3 py-1 font-display text-[0.6875rem] font-extrabold uppercase tracking-wide"
          style={{ background: tone.fill, borderColor: tone.edge, color: tone.ink }}
        >
          {step.phase}
        </div>

        {/* the written multiplication, coming alive */}
        <div className="w-full max-w-[21rem]">
          <MulBoard
            topMask={z.topMask}
            prodMask={z.prodMask}
            multiplier={z.multiplier}
            askLetter={story.askLetter}
            step={step}
            reduce={reduce}
          />
        </div>

        {/* the working-out line for this beat */}
        <div
          className="flex w-full max-w-[18.75rem] flex-col items-center rounded-xl border-2 px-3 py-1.5"
          style={{ background: tone.fill, borderColor: tone.edge }}
        >
          <span className="font-display text-lg font-black tabular-nums" style={{ color: tone.ink }}>
            {step.work}
          </span>
          {step.workSub && (
            <span
              className="font-display text-[0.6875rem] font-bold opacity-75"
              style={{ color: tone.ink }}
            >
              {step.workSub}
            </span>
          )}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: tone.fill, borderColor: tone.edge, color: tone.ink }}
        >
          {step.caption}
        </div>
      </div>
    </div>
  )
}
