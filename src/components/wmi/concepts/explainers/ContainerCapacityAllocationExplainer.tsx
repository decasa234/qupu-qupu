import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import { buildContainerSteps, type ContainerBeat, type ContainerStoryboard } from './containerCapacitySteps'

// House palette — literal hex so the animation reads the same everywhere.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const GREEN_INK = '#3B6B00'
const YELLOW = '#E0A000'
const YELLOW_INK = '#7A5A00'
const ROSE = '#D9534F'
const ROSE_INK = '#8C2F2C'
const CREAM = '#FFF2DF'
const PACKED_EGG = '#FFE1BC' // a packed egg sits a shade warmer than the carton
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const INK_MUTED = '#8A93A3'

const W = 400
const CELL = 26
const CARTON_Y = 92
const MINI_W = 22
const MINI_H = 17
const MINI_GAP = 4

interface Geometry {
  cols: number
  rows: number
  cartonW: number
  cartonH: number
  cartonX: number
  /** Centre of every egg slot, in board coordinates. */
  cells: { cx: number; cy: number }[]
  shelfY: number
  height: number
}

/** Carton + shelf geometry — pure, so the board renders identically on the
 * server and in the browser. Capacities over ten wrap onto a second row, split
 * evenly so a 12-egg carton reads 6 + 6 rather than 10 + 2. */
export function containerGeometry(capacity: number): Geometry {
  const n = Math.max(1, capacity)
  const cols = n <= 10 ? n : Math.ceil(n / 2)
  const rows = Math.ceil(n / cols)
  const cartonW = cols * CELL + 14
  const cartonH = rows * CELL + 14
  const cartonX = (W - cartonW) / 2

  const cells: { cx: number; cy: number }[] = []
  for (let row = 0; row < rows; row++) {
    const inRow = Math.min(cols, n - row * cols)
    // Centre a short last row instead of letting it hang off to the left.
    const rowX = cartonX + (cartonW - inRow * CELL) / 2
    for (let col = 0; col < inRow; col++) {
      cells.push({ cx: rowX + col * CELL + CELL / 2, cy: CARTON_Y + 7 + row * CELL + CELL / 2 })
    }
  }

  const shelfY = CARTON_Y + cartonH + 34
  return { cols, rows, cartonW, cartonH, cartonX, cells, shelfY, height: shelfY + 44 }
}

/** One egg. Cream shell with a coloured outline — rose while it is stranded
 * outside a box, orange once it is packed. */
function Egg({ x, y, r, stroke, fill }: { x: number; y: number; r: number; stroke: string; fill: string }) {
  return <ellipse cx={x} cy={y} rx={r * 0.82} ry={r} fill={fill} stroke={stroke} strokeWidth={1.6} />
}

/** A small stacked-box glyph for the shelf. */
function MiniBox({ x, y, tone, ring }: { x: number; y: number; tone: 'full' | 'bench' | 'partial'; ring: boolean }) {
  const stroke = tone === 'full' ? GREEN : tone === 'partial' ? YELLOW : ORANGE
  const fill = tone === 'full' ? '#E4F3D2' : tone === 'partial' ? '#FBF1D2' : '#FDECDD'
  return (
    <g>
      {ring && (
        <rect
          x={x - 3.5}
          y={y - 3.5}
          width={MINI_W + 7}
          height={MINI_H + 7}
          rx={6}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      )}
      <rect x={x} y={y} width={MINI_W} height={MINI_H} rx={3.5} fill={fill} stroke={stroke} strokeWidth={2} />
      <line x1={x + 2.5} y1={y + 5.5} x2={x + MINI_W - 2.5} y2={y + 5.5} stroke={stroke} strokeWidth={1.6} />
    </g>
  )
}

export function ContainerBoard({
  story,
  beat,
  lang,
  reduce,
}: {
  story: ContainerStoryboard
  beat: ContainerBeat
  lang: 'en' | 'id'
  reduce: boolean
}) {
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { capacity, total } = story
  const g = containerGeometry(capacity)

  const looseStroke = beat.trap ? ROSE : ORANGE
  const looseFill = beat.trap ? '#FBE6E5' : CREAM
  const packed = total - beat.remaining
  const barRatio = total > 0 ? Math.min(1, Math.max(0, packed / total)) : 0

  // The loose eggs only get drawn once the pile is small enough to see; the
  // counter and the bar carry the big numbers.
  const looseShown = beat.remaining > 0 && beat.remaining <= 20 ? beat.remaining : 0
  const looseR = 8
  const looseGap = 20
  const looseW = looseShown * looseGap
  const looseX0 = W - 14 - looseW + looseGap / 2

  // Shelf: sealed boxes, collapsed past nine, then the box on the bench.
  const shelf: { kind: 'full' | 'more' | 'bench'; n?: number }[] = []
  if (beat.sealed <= 9) {
    for (let i = 0; i < beat.sealed; i++) shelf.push({ kind: 'full' })
  } else {
    for (let i = 0; i < 8; i++) shelf.push({ kind: 'full' })
    shelf.push({ kind: 'more', n: beat.sealed - 8 })
  }
  if (beat.benchIndex > 0) shelf.push({ kind: 'bench' })

  let cursor = 14
  const shelfNodes = shelf.map((item, i) => {
    const x = cursor
    if (item.kind === 'more') {
      cursor += 36 + MINI_GAP
      return (
        <g key={`more-${i}`}>
          <rect x={x} y={g.shelfY + 8} width={36} height={MINI_H} rx={8} fill="#E4F3D2" stroke={GREEN} strokeWidth={2} />
          <text
            x={x + 18}
            y={g.shelfY + 8 + MINI_H / 2 + 3.6}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fontFamily="Fredoka, sans-serif"
            fill={GREEN_INK}
          >
            {`+${item.n}`}
          </text>
        </g>
      )
    }
    cursor += MINI_W + MINI_GAP + (item.kind === 'bench' ? 4 : 0)
    return (
      <MiniBox
        key={`box-${i}`}
        x={x + (item.kind === 'bench' ? 4 : 0)}
        y={g.shelfY + 8}
        tone={item.kind === 'bench' ? (beat.partial ? 'partial' : 'bench') : 'full'}
        ring={item.kind === 'bench' && beat.partial}
      />
    )
  })

  const cartonStroke = beat.partial ? YELLOW : beat.benchIndex > 0 ? ORANGE : PEACH
  const cartonFill = beat.partial ? '#FBF1D2' : SHELL

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${g.height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', maxWidth: W, maxHeight: '15.5rem' }}
      role="presentation"
    >
      <rect x={0} y={0} width={W} height={g.height} fill={SHELL} />

      {/* ── eggs still outside a box ───────────────────────────────── */}
      <text x={14} y={16} fontSize="10" fontWeight="800" fontFamily="Fredoka, sans-serif" fill={INK_MUTED}>
        {T('EGGS STILL OUTSIDE', 'TELUR MASIH DI LUAR')}
      </text>
      <motion.text
        key={`left-${beat.remaining}-${beat.trap ? 't' : 'n'}`}
        x={14}
        y={45}
        fontSize="26"
        fontWeight="900"
        fontFamily="Fredoka, sans-serif"
        fill={beat.trap ? ROSE : beat.remaining === 0 ? GREEN : BLUE}
        initial={reduce ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22 }}
        style={{ transformOrigin: '14px 45px' }}
      >
        {beat.remaining}
      </motion.text>

      {Array.from({ length: looseShown }).map((_, i) => (
        <motion.g
          key={`loose-${i}`}
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { delay: Math.min(0.4, i * 0.05), duration: 0.25 }}
        >
          <Egg x={looseX0 + i * looseGap} y={30} r={looseR} stroke={looseStroke} fill={looseFill} />
        </motion.g>
      ))}

      {/* packed-so-far bar */}
      <rect x={14} y={54} width={W - 28} height={9} rx={4.5} fill={CREAM} stroke={PEACH} strokeWidth={1.5} />
      <motion.rect
        x={14}
        y={54}
        height={9}
        rx={4.5}
        fill={beat.remaining === 0 ? GREEN : ORANGE}
        initial={false}
        animate={{ width: (W - 28) * barRatio }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }}
      />

      {/* ── the box on the bench ───────────────────────────────────── */}
      {beat.benchIndex > 0 && (
        <text
          x={W / 2}
          y={CARTON_Y - 10}
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fontFamily="Fredoka, sans-serif"
          fill={beat.partial ? YELLOW_INK : BLUE}
        >
          {T(`Box ${beat.benchIndex}`, `Kotak ${beat.benchIndex}`)}
        </text>
      )}
      <rect
        x={g.cartonX}
        y={CARTON_Y}
        width={g.cartonW}
        height={g.cartonH}
        rx={10}
        fill={cartonFill}
        stroke={cartonStroke}
        strokeWidth={2.5}
      />
      {g.cells.map(({ cx, cy }, i) => {
        const filled = i < beat.bench
        if (!filled) {
          return (
            <ellipse
              key={`slot-${i}`}
              cx={cx}
              cy={cy}
              rx={8}
              ry={9.6}
              fill="none"
              stroke={PEACH}
              strokeWidth={1.4}
              strokeDasharray="3 3"
            />
          )
        }
        return (
          <motion.g
            key={`egg-${i}`}
            initial={reduce ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0 } : { delay: Math.min(0.5, i * 0.035), type: 'spring', stiffness: 400, damping: 24 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <Egg x={cx} y={cy} r={9.6} stroke={beat.partial ? YELLOW : ORANGE} fill={PACKED_EGG} />
          </motion.g>
        )
      })}
      {beat.partial && (
        <text
          x={W / 2}
          y={CARTON_Y + g.cartonH + 17}
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fontFamily="Fredoka, sans-serif"
          fill={YELLOW_INK}
        >
          {T('not full — still one box', 'belum penuh — tetap satu kotak')}
        </text>
      )}

      {/* ── the shelf of boxes used so far ─────────────────────────── */}
      <text x={14} y={g.shelfY} fontSize="10" fontWeight="800" fontFamily="Fredoka, sans-serif" fill={INK_MUTED}>
        {T('BOXES FILLED RIGHT UP', 'KOTAK YANG PENUH')}
      </text>
      {shelfNodes}
      {shelf.length === 0 && (
        <text
          x={14}
          y={g.shelfY + 21}
          fontSize="11"
          fontWeight="700"
          fontFamily="Fredoka, sans-serif"
          fill={INK_MUTED}
        >
          {T('none yet', 'belum ada')}
        </text>
      )}
    </svg>
  )
}

export default function ContainerCapacityAllocationExplainer(props: ExplainerProps) {
  const { params, lang = 'id', correctAnswer } = props
  const reduce = !!useReducedMotion()
  const story = useMemo(
    () => buildContainerSteps(params, lang, correctAnswer),
    [params, lang, correctAnswer],
  )
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: ${story.total} eggs at ${story.capacity} per box fill ${story.floor} boxes with ${story.remainder} eggs left over; the leftover still needs a box of its own, so ${story.floor} + 1 = ${story.answer} boxes.`,
    `Strategi: ${story.total} telur dengan ${story.capacity} per kotak mengisi penuh ${story.floor} kotak dan sisa ${story.remainder} telur; sisanya tetap butuh kotak sendiri, jadi ${story.floor} + 1 = ${story.answer} kotak.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div className="flex w-full justify-center">
          <ContainerBoard story={story} beat={beat} lang={lang} reduce={reduce} />
        </div>

        {beat.equation && (
          <motion.div
            key={`eq-${beat.equation}`}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 22 }}
            className="rounded-full border-2 px-3 py-[0.125rem] font-display text-lg font-black tabular-nums"
            style={{ background: '#E4F3D2', borderColor: GREEN, color: GREEN_INK }}
          >
            {beat.equation}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#E4F3D2', borderColor: GREEN, color: GREEN_INK }
              : beat.trap
                ? { background: '#FBE6E5', borderColor: ROSE, color: ROSE_INK }
                : beat.partial
                  ? { background: '#FBF1D2', borderColor: YELLOW, color: YELLOW_INK }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

        {beat.note && (
          <div
            className="px-2 text-center font-display text-[0.6875rem] font-bold"
            style={{ color: beat.trap ? ROSE : GREEN_INK }}
          >
            {beat.note}
          </div>
        )}
      </div>
    </div>
  )
}
