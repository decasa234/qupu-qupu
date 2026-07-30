import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import {
  ASK_DASH,
  CRYPTA_INK,
  buildCryptaMapping,
  cryptaGeometry,
  cryptaSlots,
  normalizeCryptaParams,
} from '../cryptarithmetic-addition'
import {
  buildCryptarithmeticSteps,
  type CryptaDomain,
  type CryptaStep,
  type CryptaTone,
} from './cryptarithmeticSteps'

// The written sum, its palette and every coordinate come from the static figure
// (`../cryptarithmetic-addition`), so the animation is that same picture coming
// alive and cannot drift when the figure is redrawn. Only the beat inks below —
// the warm shell, the panel edges and the darker inks used on filled chips —
// belong to the animation alone.
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

const TONE: Record<CryptaTone, { ink: string; edge: string; fill: string }> = {
  plan: { ink: BLUE_INK, edge: CRYPTA_INK.letter, fill: BLUE_FILL },
  work: { ink: BLUE_INK, edge: CRYPTA_INK.letter, fill: BLUE_FILL },
  reject: { ink: ROSE_INK, edge: CRYPTA_INK.reject, fill: ROSE_FILL },
  win: { ink: GREEN_INK, edge: CRYPTA_INK.settled, fill: GREEN_FILL },
}

// ── candidate tray geometry ────────────────────────────────────────────────
const BOARD_W = 300
const TRAY_X = 15
const CHIP_W = 26
const CHIP_GAP = 6
const CELL_W = 22
const CELL_PITCH = 24
const ROW_H = 20
const ROW_PITCH = 24
const TRAY_GAP = 12

type CellState = 'settled' | 'alive' | 'struck' | 'gone'

function cellState(domain: CryptaDomain, digit: number): CellState {
  if (domain.settled === digit) return 'settled'
  if (domain.alive.includes(digit)) return 'alive'
  return domain.cut.includes(digit) ? 'struck' : 'gone'
}

/**
 * One digit of the 0-9 strip under a letter. Alive digits stay bright, the ones
 * this beat just ruled out flash red with a line through them, and older
 * rejects fade back so the shrinking of the choices is legible at a glance.
 */
function CandidateCell({
  x,
  y,
  digit,
  state,
  asked,
  dur,
}: {
  x: number
  y: number
  digit: number
  state: CellState
  asked: boolean
  dur: number
}) {
  const look =
    state === 'settled'
      ? { fill: GREEN_FILL, stroke: CRYPTA_INK.settled, ink: GREEN_INK, opacity: 1, width: 2.4 }
      : state === 'alive'
        ? asked
          ? { fill: '#FFFFFF', stroke: CRYPTA_INK.ask, ink: ORANGE_INK, opacity: 1, width: 1.8 }
          : { fill: '#FFFFFF', stroke: CRYPTA_INK.tileEdge, ink: CRYPTA_INK.letter, opacity: 1, width: 1.6 }
        : state === 'struck'
          ? { fill: ROSE_FILL, stroke: CRYPTA_INK.reject, ink: ROSE_INK, opacity: 1, width: 1.8 }
          : { fill: '#FFFFFF', stroke: CRYPTA_INK.tileEdge, ink: CRYPTA_INK.muted, opacity: 0.32, width: 1 }
  const dead = state === 'struck' || state === 'gone'
  return (
    <motion.g initial={false} animate={{ opacity: look.opacity }} transition={{ duration: dur }}>
      <motion.rect
        x={x}
        y={y}
        width={CELL_W}
        height={ROW_H}
        rx={5}
        initial={false}
        animate={{ fill: look.fill, stroke: look.stroke, strokeWidth: look.width }}
        transition={{ duration: dur }}
      />
      <motion.text
        x={x + CELL_W / 2}
        y={y + ROW_H / 2 + 4.6}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
        initial={false}
        animate={{ fill: look.ink }}
        transition={{ duration: dur }}
      >
        {digit}
      </motion.text>
      {dead && (
        <motion.line
          x1={x + 3}
          y1={y + ROW_H - 3.5}
          x2={x + CELL_W - 3}
          y2={y + 3.5}
          stroke={state === 'struck' ? CRYPTA_INK.reject : CRYPTA_INK.muted}
          strokeWidth={state === 'struck' ? 2 : 1.4}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: 1 }}
          transition={{ duration: dur }}
        />
      )}
    </motion.g>
  )
}

/** The carry written above a column: "?" while it could still be 0 or 1. */
function CarryChip({ cx, y, value, dur }: { cx: number; y: number; value: number | null; dur: number }) {
  const known = value !== null
  const w = 22
  const h = 19
  return (
    <motion.g initial={false} animate={{ opacity: known ? 1 : 0.55 }} transition={{ duration: dur }}>
      <motion.rect
        x={cx - w / 2}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={known ? ORANGE_FILL : '#FFFFFF'}
        stroke={known ? CRYPTA_INK.ask : CRYPTA_INK.tileEdge}
        strokeWidth={known ? 2.2 : 1.4}
        strokeDasharray={known ? undefined : '3 3'}
        initial={false}
        animate={{ scale: known ? 1 : 0.92 }}
        style={{ transformOrigin: `${cx}px ${y + h / 2}px` }}
        transition={{ duration: dur }}
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
 * The board: the written sum on the figure's own geometry with the beat's column
 * spotlighted and its carry drawn above it, plus a 0-9 strip per letter showing
 * exactly which digits are still standing.
 */
function CryptaBoard({
  wordA,
  wordB,
  wordS,
  askLetter,
  step,
  reduce,
}: {
  wordA: string
  wordB: string
  wordS: string
  askLetter: string
  step: CryptaStep
  reduce: boolean
}) {
  const geom = cryptaGeometry(wordS.length)
  const dur = reduce ? 0 : 0.34
  // Centre the DIGIT COLUMNS, not the block: the block carries a wide left
  // margin for the plus sign, and centring on that pushes the sum off to the
  // right of the candidate tray underneath it.
  const blockX =
    BOARD_W / 2 - (geom.colX(0) + geom.colX(geom.cols - 1) + geom.cellW) / 2
  const blockY = geom.carryH
  const trayY = blockY + geom.blockHeight + TRAY_GAP
  const height = trayY + step.domains.length * ROW_PITCH + 4

  const byLetter = new Map(step.domains.map((d) => [d.letter, d]))
  const valueOf = (letter: string) => byLetter.get(letter)?.settled ?? null
  const struckThisBeat = (letter: string) => (byLetter.get(letter)?.cut.length ?? 0) > 0

  // Column j (0 = ones, counted from the right) is drawn at slot k from the left.
  const slotOf = (j: number) => geom.cols - 1 - j

  const tile = (key: string, k: number, rowY: number, letter: string) => {
    const x = blockX + geom.colX(k)
    const settled = valueOf(letter)
    const isAsk = letter === askLetter
    const landed = settled !== null && struckThisBeat(letter)
    const edge =
      settled !== null ? CRYPTA_INK.settled : isAsk ? CRYPTA_INK.ask : CRYPTA_INK.tileEdge
    const ink = settled !== null ? GREEN_INK : isAsk ? CRYPTA_INK.ask : CRYPTA_INK.letter
    return (
      <g key={key}>
        {landed && !reduce && (
          // A ring blooming outward marks the moment this letter was pinned
          // down. The digit itself is never animated in — a digit that has been
          // earned must be readable the instant the beat appears.
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
            fill: settled !== null ? GREEN_FILL : CRYPTA_INK.tile,
            stroke: edge,
            strokeWidth: settled !== null || isAsk ? 3 : 2,
          }}
          strokeDasharray={settled === null && isAsk ? ASK_DASH : '0 0'}
          transition={{ duration: dur }}
        />
        {settled !== null && (
          // Tiny reminder of which letter this digit came from.
          <text
            x={x + 8}
            y={rowY + 13}
            textAnchor="middle"
            fontSize={10}
            fontWeight="bold"
            fill={CRYPTA_INK.muted}
          >
            {letter}
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
          {settled !== null ? settled : letter}
        </motion.text>
      </g>
    )
  }

  return (
    <svg viewBox={`0 0 ${BOARD_W} ${height}`} width="100%" role="presentation" aria-hidden>
      {/* spotlight band down the column this beat is working on */}
      {step.focus !== null && step.focus < geom.cols && (
        <motion.rect
          initial={false}
          animate={{
            x: blockX + geom.colX(slotOf(step.focus)) - 5,
            opacity: 1,
          }}
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
        {cryptaSlots(wordA, geom.cols).map((s) => tile(`a${s.k}`, s.k, geom.rowAY, s.letter))}
        {cryptaSlots(wordB, geom.cols).map((s) => tile(`b${s.k}`, s.k, geom.rowBY, s.letter))}
        <text
          x={blockX + geom.plusX}
          y={geom.rowBY + geom.cellH / 2 + 9}
          textAnchor="middle"
          fontSize={26}
          fontWeight="bold"
          fill={CRYPTA_INK.muted}
        >
          +
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
        {cryptaSlots(wordS, geom.cols).map((s) => tile(`s${s.k}`, s.k, geom.rowSY, s.letter))}
      </g>

      {/* what is still possible for each letter */}
      {step.domains.map((domain, row) => {
        const y = trayY + row * ROW_PITCH
        const settled = domain.settled !== null
        const chipEdge = settled
          ? CRYPTA_INK.settled
          : domain.asked
            ? CRYPTA_INK.ask
            : CRYPTA_INK.letter
        const chipInk = settled ? GREEN_INK : domain.asked ? CRYPTA_INK.ask : CRYPTA_INK.letter
        return (
          <g key={domain.letter}>
            <motion.rect
              x={TRAY_X}
              y={y}
              width={CHIP_W}
              height={ROW_H}
              rx={6}
              initial={false}
              animate={{
                fill: settled ? GREEN_FILL : domain.asked ? ORANGE_FILL : BLUE_FILL,
                stroke: chipEdge,
              }}
              strokeWidth={2}
              transition={{ duration: dur }}
            />
            <motion.text
              x={TRAY_X + CHIP_W / 2}
              y={y + ROW_H / 2 + 4.8}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              initial={false}
              animate={{ fill: chipInk }}
              transition={{ duration: dur }}
            >
              {domain.letter}
            </motion.text>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <CandidateCell
                key={digit}
                x={TRAY_X + CHIP_W + CHIP_GAP + digit * CELL_PITCH}
                y={y}
                digit={digit}
                state={cellState(domain, digit)}
                asked={domain.asked}
                dur={dur}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export default function CryptarithmeticAdditionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildCryptarithmeticSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const step = story.steps[index] ?? story.steps[story.finalIndex]
  const reduce = !!useReducedMotion()
  const tone = TONE[step.tone]
  const p = normalizeCryptaParams(params)
  const m = useMemo(() => buildCryptaMapping(p.addend1, p.addend2), [p.addend1, p.addend2])

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: write ${m.wordA} + ${m.wordB} = ${m.wordS} in columns and work from the ones column, ` +
      `carrying left, crossing off every digit a column rules out. The letter ${story.askLetter} is ${story.answer}.`,
    `Strategi: tulis ${m.wordA} + ${m.wordB} = ${m.wordS} bersusun lalu kerjakan dari kolom satuan, ` +
      `bawa simpanan ke kiri, coret setiap angka yang ditolak kolom. Huruf ${story.askLetter} adalah ${story.answer}.`,
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

        {/* the written sum, coming alive */}
        <div className="w-full max-w-[21rem]">
          <CryptaBoard
            wordA={m.wordA}
            wordB={m.wordB}
            wordS={m.wordS}
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
          <span
            className="font-display text-lg font-black tabular-nums"
            style={{ color: tone.ink }}
          >
            {step.work}
          </span>
          {step.workSub && (
            <span className="font-display text-[0.6875rem] font-bold opacity-75" style={{ color: tone.ink }}>
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
