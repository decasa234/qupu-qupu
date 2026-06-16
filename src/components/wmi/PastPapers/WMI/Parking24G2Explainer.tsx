import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TOP_ROW,
  BOTTOM_ROW,
  PARKED_CARS,
  type CarColor,
} from './Parking24G2Illustration'

// ── colour tokens (mirror Parking24G2Illustration) ────────────────────────────
const CAR_FILLS: Record<CarColor, string> = {
  red: '#E63946',
  yellow: '#F4D03F',
  blue: '#2D9CDB',
}
const CAR_STROKE: Record<CarColor, string> = {
  red: '#9B1C25',
  yellow: '#B8860B',
  blue: '#1565A0',
}

// Row / space geometry — mirrors the illustration constants
const SPACE_W = 40
const SPACE_H = 56
const SPACE_GAP = 2
const ROW_GAP = 20
const PAD_X = 8
const PAD_Y = 10
const COLS_TOP = TOP_ROW.length   // 9
const COLS_BOT = BOTTOM_ROW.length // 8
const TOP_ROW_W = COLS_TOP * SPACE_W + (COLS_TOP - 1) * SPACE_GAP
const SVG_W = PAD_X * 2 + TOP_ROW_W
const SVG_H = PAD_Y + SPACE_H + ROW_GAP + SPACE_H + PAD_Y
const ROW_TOP_Y = PAD_Y
const ROW_BOT_Y = PAD_Y + SPACE_H + ROW_GAP
const WALL_W = 14
const WALL_H = SPACE_H + 12

// The target: space 21 (index 5 in TOP_ROW)
const TARGET = 21
const TARGET_IDX = TOP_ROW.indexOf(TARGET) // 5

// Left of 21: 11,13,15,17,19  Right of 21: 23,25,27
const LEFT_OF_21 = TOP_ROW.slice(0, TARGET_IDX)   // [11,13,15,17,19]
const RIGHT_OF_21 = TOP_ROW.slice(TARGET_IDX + 1) // [23,25,27]
const SUM_LEFT = LEFT_OF_21.reduce((a, b) => a + b, 0)  // 75
const SUM_RIGHT = RIGHT_OF_21.reduce((a, b) => a + b, 0) // 75

// Trap candidate: 19 (index 4)
const TRAP = 19
const TRAP_IDX = TOP_ROW.indexOf(TRAP) // 4
const TRAP_LEFT = TOP_ROW.slice(0, TRAP_IDX)          // [11,13,15,17]
const TRAP_RIGHT = TOP_ROW.slice(TRAP_IDX + 1)        // [21,23,25,27]
const TRAP_SUM_LEFT = TRAP_LEFT.reduce((a, b) => a + b, 0)   // 56
const TRAP_SUM_RIGHT = TRAP_RIGHT.reduce((a, b) => a + b, 0) // 96

// ── helpers ───────────────────────────────────────────────────────────────────
const t = (lang: 'en' | 'id', en: string, id: string) => (lang === 'id' ? id : en)

// ── sub-components ────────────────────────────────────────────────────────────
function MiniCar({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: CarColor }) {
  const fill = CAR_FILLS[color]
  const stroke = CAR_STROKE[color]
  const bw = w * 0.7
  const bx = x + (w - bw) / 2
  const windH = h * 0.22
  return (
    <g>
      <rect x={bx} y={y + h * 0.06} width={bw} height={h * 0.88} rx={bw * 0.3} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <rect x={bx + bw * 0.12} y={y + h * 0.1} width={bw * 0.76} height={windH} rx={3} fill="white" opacity={0.7} />
      <rect x={bx + bw * 0.12} y={y + h * 0.68} width={bw * 0.76} height={windH} rx={3} fill="white" opacity={0.5} />
      <circle cx={bx + bw * 0.1} cy={y + h * 0.22} r={bw * 0.1} fill="#1F2937" />
      <circle cx={bx + bw * 0.9} cy={y + h * 0.22} r={bw * 0.1} fill="#1F2937" />
      <circle cx={bx + bw * 0.1} cy={y + h * 0.78} r={bw * 0.1} fill="#1F2937" />
      <circle cx={bx + bw * 0.9} cy={y + h * 0.78} r={bw * 0.1} fill="#1F2937" />
    </g>
  )
}

// The main parking lot SVG used in beats
interface LotProps {
  /** Which top-row space Marcus is trying (highlight ring). undefined = no candidate shown. */
  candidate?: number
  /** Highlight top row spaces on the LEFT of candidate. */
  highlightLeft?: readonly number[]
  /** Highlight top row spaces on the RIGHT of candidate. */
  highlightRight?: readonly number[]
  /** When true, candidate box is green (balance found). */
  success?: boolean
  /** When true, candidate box is red (rejected). */
  reject?: boolean
  /** Dim the bottom row. */
  dimBottom?: boolean
}

function ParkingLot({ candidate, highlightLeft, highlightRight, success, reject, dimBottom }: LotProps) {
  const carMap = new Map<string, CarColor>()
  for (const car of PARKED_CARS) {
    carMap.set(`${car.row}-${car.space}`, car.color)
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(400, SVG_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── top row (odd) ─────────────────────────────────────────────── */}
      {TOP_ROW.map((num, i) => {
        const x = PAD_X + i * (SPACE_W + SPACE_GAP)
        const car = carMap.get(`0-${num}`)
        const isCandidate = num === candidate
        const isLeft = highlightLeft?.includes(num)
        const isRight = highlightRight?.includes(num)
        const spaceFill = isCandidate
          ? (success ? '#D1FAE5' : reject ? '#FEE2E2' : '#FEF9C3')
          : isLeft
          ? '#DBEAFE'
          : isRight
          ? '#FCE7F3'
          : car ? '#F0F0F0' : 'white'
        const spaceStroke = isCandidate
          ? (success ? '#10B981' : reject ? '#E63946' : '#F59E0B')
          : isLeft
          ? '#3B82F6'
          : isRight
          ? '#EC4899'
          : '#374151'
        return (
          <g key={`top-${num}`}>
            <rect
              x={x} y={ROW_TOP_Y}
              width={SPACE_W} height={SPACE_H}
              fill={spaceFill}
              stroke={spaceStroke}
              strokeWidth={isCandidate || isLeft || isRight ? 2.5 : 1.8}
            />
            {!car && (
              <text
                x={x + SPACE_W / 2} y={ROW_TOP_Y + SPACE_H / 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={12} fontWeight={700} fill="#1F2937"
              >
                {num}
              </text>
            )}
            {car && num !== candidate && (
              <MiniCar x={x + 3} y={ROW_TOP_Y + 4} w={SPACE_W - 6} h={SPACE_H - 8} color={car} />
            )}
            {/* Marcus's blue car shown in the candidate spot when success */}
            {isCandidate && success && (
              <MiniCar x={x + 3} y={ROW_TOP_Y + 4} w={SPACE_W - 6} h={SPACE_H - 8} color="blue" />
            )}
          </g>
        )
      })}

      {/* ── bottom row (even) ─────────────────────────────────────────── */}
      <g opacity={dimBottom ? 0.3 : 1}>
        {BOTTOM_ROW.map((num, i) => {
          const x = PAD_X + i * (SPACE_W + SPACE_GAP)
          const car = carMap.get(`1-${num}`)
          return (
            <g key={`bot-${num}`}>
              <rect x={x} y={ROW_BOT_Y} width={SPACE_W} height={SPACE_H} fill={car ? '#F0F0F0' : 'white'} stroke="#374151" strokeWidth={1.8} />
              {!car && (
                <text x={x + SPACE_W / 2} y={ROW_BOT_Y + SPACE_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill="#1F2937">
                  {num}
                </text>
              )}
              {car && (
                <MiniCar x={x + 3} y={ROW_BOT_Y + 4} w={SPACE_W - 6} h={SPACE_H - 8} color={car} />
              )}
            </g>
          )
        })}

        {/* wall */}
        {(() => {
          const wallX = PAD_X + COLS_BOT * (SPACE_W + SPACE_GAP)
          return (
            <g>
              <rect x={wallX} y={ROW_BOT_Y - 6} width={WALL_W} height={WALL_H} rx={2} fill="#374151" />
              <rect x={wallX - SPACE_W} y={ROW_BOT_Y + SPACE_H - 2} width={SPACE_W + WALL_W} height={8} fill="#374151" />
            </g>
          )
        })()}
      </g>

      {/* Row label: "ODD row" arrow on the top row when dimBottom */}
      {dimBottom && (
        <text
          x={PAD_X + TOP_ROW_W / 2}
          y={ROW_BOT_Y + SPACE_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          fill="#374151"
          opacity={0.4}
        >
          {/* intentionally left empty; dimming is the signal */}
        </text>
      )}
    </svg>
  )
}

// Sum badge shown below the lot
function SumBadge({ label, sum, color }: { label: string; sum: number; color: string }) {
  return (
    <div
      className="rounded-lg border-2 px-3 py-1 text-center font-display text-sm font-extrabold"
      style={{ borderColor: color, color }}
    >
      {label} = {sum}
    </div>
  )
}

// ── storyboard type ───────────────────────────────────────────────────────────
interface ParkingBeat {
  lotProps: LotProps
  /** Optional sum badges [{label, sum, color}] */
  badges?: Array<{ label: string; sum: number; color: string }>
  caption: string
  result: boolean
  hold: number
}

function buildBeats(lang: 'en' | 'id'): ParkingBeat[] {
  const _ = (en: string, id: string) => t(lang, en, id)
  return [
    // Beat 0 — intro: two rows, point out ODD vs EVEN
    {
      lotProps: {},
      caption: _('Marcus is in one row. The TOP row has ODD numbers (11, 13, 15 …) and the BOTTOM row has EVEN numbers (12, 14, 16 …). His numbers go up by 2s.', 'Marcus ada di satu baris. Baris ATAS bernomor GANJIL (11, 13, 15 …) dan baris BAWAH bernomor GENAP (12, 14, 16 …). Nomornya naik dua-dua.'),
      result: false,
      hold: 3000,
    },
    // Beat 1 — isolate the odd row
    {
      lotProps: { dimBottom: true },
      caption: _('Marcus watches the row he is in. His row: 11, 13, 15, 17, 19, 21, 23, 25, 27. We need a space where the sum on the LEFT equals the sum on the RIGHT.', 'Marcus memperhatikan barisnya sendiri. Barisnya: 11, 13, 15, 17, 19, 21, 23, 25, 27. Kita cari tempat di mana jumlah di KIRI sama dengan jumlah di KANAN.'),
      result: false,
      hold: 3200,
    },
    // Beat 2 — try the trap: 19
    {
      lotProps: { candidate: TRAP, dimBottom: true },
      caption: _('Try space 19 — it sits in the middle by count. Left: 11+13+15+17 = ?', 'Coba tempat 19 — letaknya di tengah secara jumlah tempat. Kiri: 11+13+15+17 = ?'),
      result: false,
      hold: 2400,
    },
    // Beat 3 — show left sum for trap, still computing right
    {
      lotProps: { candidate: TRAP, highlightLeft: TRAP_LEFT, dimBottom: true },
      badges: [{ label: _('Left / Kiri', 'Kiri'), sum: TRAP_SUM_LEFT, color: '#3B82F6' }],
      caption: _(`Left of 19: ${TRAP_LEFT.join('+')} = ${TRAP_SUM_LEFT}.`, `Kiri 19: ${TRAP_LEFT.join('+')} = ${TRAP_SUM_LEFT}.`),
      result: false,
      hold: 2200,
    },
    // Beat 4 — show right sum for trap, reveal mismatch
    {
      lotProps: { candidate: TRAP, highlightLeft: TRAP_LEFT, highlightRight: TRAP_RIGHT, reject: true, dimBottom: true },
      badges: [
        { label: _('Left / Kiri', 'Kiri'), sum: TRAP_SUM_LEFT, color: '#3B82F6' },
        { label: _('Right / Kanan', 'Kanan'), sum: TRAP_SUM_RIGHT, color: '#EC4899' },
      ],
      caption: _(`Right of 19: ${TRAP_RIGHT.join('+')} = ${TRAP_SUM_RIGHT}. ${TRAP_SUM_LEFT} ≠ ${TRAP_SUM_RIGHT} — NOT balanced! ✗`, `Kanan 19: ${TRAP_RIGHT.join('+')} = ${TRAP_SUM_RIGHT}. ${TRAP_SUM_LEFT} ≠ ${TRAP_SUM_RIGHT} — Tidak seimbang! ✗`),
      result: false,
      hold: 2800,
    },
    // Beat 5 — try 21
    {
      lotProps: { candidate: TARGET, dimBottom: true },
      caption: _('Try space 21. Left: 11+13+15+17+19 = ?', 'Coba tempat 21. Kiri: 11+13+15+17+19 = ?'),
      result: false,
      hold: 2200,
    },
    // Beat 6 — show left sum for 21
    {
      lotProps: { candidate: TARGET, highlightLeft: LEFT_OF_21, dimBottom: true },
      badges: [{ label: _('Left / Kiri', 'Kiri'), sum: SUM_LEFT, color: '#3B82F6' }],
      caption: _(`Left of 21: ${LEFT_OF_21.join('+')} = ${SUM_LEFT}.`, `Kiri 21: ${LEFT_OF_21.join('+')} = ${SUM_LEFT}.`),
      result: false,
      hold: 2200,
    },
    // Beat 7 — show right sum for 21, reveal match
    {
      lotProps: { candidate: TARGET, highlightLeft: LEFT_OF_21, highlightRight: RIGHT_OF_21, dimBottom: true },
      badges: [
        { label: _('Left / Kiri', 'Kiri'), sum: SUM_LEFT, color: '#3B82F6' },
        { label: _('Right / Kanan', 'Kanan'), sum: SUM_RIGHT, color: '#EC4899' },
      ],
      caption: _(`Right of 21: ${RIGHT_OF_21.join('+')} = ${SUM_RIGHT}. ${SUM_LEFT} = ${SUM_RIGHT} — BALANCED! ✓`, `Kanan 21: ${RIGHT_OF_21.join('+')} = ${SUM_RIGHT}. ${SUM_LEFT} = ${SUM_RIGHT} — Seimbang! ✓`),
      result: false,
      hold: 2600,
    },
    // Beat 8 — final answer
    {
      lotProps: { candidate: TARGET, highlightLeft: LEFT_OF_21, highlightRight: RIGHT_OF_21, success: true },
      badges: [
        { label: _('Left / Kiri', 'Kiri'), sum: SUM_LEFT, color: '#10B981' },
        { label: _('Right / Kanan', 'Kanan'), sum: SUM_RIGHT, color: '#10B981' },
      ],
      caption: _(`Marcus is in space 21 — the only spot where ${SUM_LEFT} = ${SUM_RIGHT}.`, `Marcus ada di tempat parkir 21 — satu-satunya tempat di mana ${SUM_LEFT} = ${SUM_RIGHT}.`),
      result: true,
      hold: 0,
    },
  ]
}

// ── main explainer ─────────────────────────────────────────────────────────────
export default function Parking24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const beats = useMemo(() => buildBeats(lang), [lang])
  const finalIndex = beats.length - 1

  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Marcus ada di baris ganjil: 11 sampai 27. Hanya tempat 21 yang menyeimbangkan: kiri ${SUM_LEFT} sama dengan kanan ${SUM_RIGHT}.`
      : `Marcus is in the odd row: 11 to 27. Only space 21 balances: left ${SUM_LEFT} equals right ${SUM_RIGHT}.`

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* parking lot SVG */}
        <motion.div
          key={index}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ParkingLot {...beat.lotProps} />
        </motion.div>

        {/* sum badges */}
        {beat.badges && beat.badges.length > 0 && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {beat.badges.map((b) => (
              <SumBadge key={b.label} label={b.label} sum={b.sum} color={b.color} />
            ))}
          </motion.div>
        )}

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
