import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TEACHER_POS, ROOM, BLACKBOARD, DESK_POSITIONS } from './Classroom24G3Illustration'

// ─── colour tokens (mirror fill-qupu-* Tailwind tokens) ─────────────────────
const BLUE = '#30598A'
const ORANGE = '#D97706'
const GREEN = '#10B981'
const CREAM = '#F5F0E8'
const PEACH = '#FDDCBC'
const DARK_BLUE = '#1E3A5F'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const BLUE_BG = '#E1EFFB'

// ─── SVG viewport ────────────────────────────────────────────────────────────
const W = 320
const H = 248

// ─── types ───────────────────────────────────────────────────────────────────
type Beat = {
  /** Which phase: setup | face-west | left-south | reject | answer */
  phase: 'setup' | 'face-west' | 'left-south' | 'answer'
  /** Direction the facing arrow points (degrees, 0=up/North, 90=right/East) */
  facingDeg: number
  /** Direction the left-hand arrow points (degrees); -1 = hidden */
  leftDeg: number
  /** Highlight ring around the blackboard */
  highlightBoard: boolean
  /** Show a red cross over wrong options */
  rejectOptions: string[]
  /** Show the final green badge */
  result: boolean
  caption: string
  hold: number
}

function t(lang: 'en' | 'id', en: string, id: string): string {
  return lang === 'id' ? id : en
}

function buildSteps(lang: 'en' | 'id'): Beat[] {
  const steps: Beat[] = []

  // Beat 0 — setup: blackboard is east, behind the teacher
  steps.push({
    phase: 'setup',
    facingDeg: 270, // teacher faces west (left in SVG) = 270° clockwise from north
    leftDeg: -1,
    highlightBoard: true,
    rejectOptions: [],
    result: false,
    caption: t(
      lang,
      'The blackboard is on the EAST wall — and it is behind Bu Sandra.',
      'Papan tulis ada di dinding TIMUR — dan ada di belakang Bu Sandra.',
    ),
    hold: 2800,
  })

  // Beat 1 — deduce facing direction: west
  steps.push({
    phase: 'face-west',
    facingDeg: 270,
    leftDeg: -1,
    highlightBoard: false,
    rejectOptions: [],
    result: false,
    caption: t(
      lang,
      'Board is east = behind her → she faces the OPPOSITE = WEST.',
      'Papan di timur = belakangnya → ia menghadap kebalikannya = BARAT.',
    ),
    hold: 2600,
  })

  // Beat 2 — show left-hand pointing south
  steps.push({
    phase: 'left-south',
    facingDeg: 270,
    leftDeg: 180, // south = down in SVG = 180°
    highlightBoard: false,
    rejectOptions: [],
    result: false,
    caption: t(
      lang,
      'Facing west: stretch your LEFT arm — it points SOUTH.',
      'Menghadap barat: bentangkan tangan KIRI — menunjuk ke SELATAN.',
    ),
    hold: 2600,
  })

  // Beat 3 — reject wrong options
  steps.push({
    phase: 'left-south',
    facingDeg: 270,
    leftDeg: 180,
    highlightBoard: false,
    rejectOptions: ['A', 'C', 'D', 'E'],
    result: false,
    caption: t(
      lang,
      'North ✗, East ✗, West ✗, North-East ✗ — none match left hand.',
      'Utara ✗, Timur ✗, Barat ✗, Timur-Laut ✗ — tak ada yang cocok.',
    ),
    hold: 2400,
  })

  // Beat 4 — final answer
  steps.push({
    phase: 'answer',
    facingDeg: 270,
    leftDeg: 180,
    highlightBoard: false,
    rejectOptions: ['A', 'C', 'D', 'E'],
    result: true,
    caption: t(lang, 'Left hand → SOUTH → Answer B.', 'Tangan kiri → SELATAN → Jawaban B.'),
    hold: 0,
  })

  return steps
}

// ─── Arrow helper (SVG, no framer-motion for static left-arrow) ──────────────
function ArrowSvg({
  cx,
  cy,
  deg,
  color,
  len = 44,
}: {
  cx: number
  cy: number
  deg: number
  color: string
  len?: number
}) {
  // deg: 0=up(north), 90=right(east), 180=down(south), 270=left(west)
  const rad = ((deg - 90) * Math.PI) / 180 // convert to standard math angle (0=right)
  const tx = cx + Math.cos(rad) * len
  const ty = cy + Math.sin(rad) * len
  // perpendicular for arrowhead
  const hLen = 10
  const pRad = rad + Math.PI
  const lx = tx + Math.cos(pRad + 0.45) * hLen
  const ly = ty + Math.sin(pRad + 0.45) * hLen
  const rx = tx + Math.cos(pRad - 0.45) * hLen
  const ry = ty + Math.sin(pRad - 0.45) * hLen
  return (
    <g>
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${lx},${ly} ${rx},${ry}`} fill={color} />
    </g>
  )
}

// ─── Compass rose (top-left corner) ─────────────────────────────────────────
function CompassRose({ lang }: { lang: 'en' | 'id' }) {
  const roseX = 24
  const roseY = 24
  const roseR = 18
  const labels =
    lang === 'id'
      ? [
          { l: 'U', x: roseX, y: roseY - roseR - 5 },
          { l: 'S', x: roseX, y: roseY + roseR + 10 },
          { l: 'T', x: roseX + roseR + 7, y: roseY + 3 },
          { l: 'B', x: roseX - roseR - 7, y: roseY + 3 },
        ]
      : [
          { l: 'N', x: roseX, y: roseY - roseR - 5 },
          { l: 'S', x: roseX, y: roseY + roseR + 10 },
          { l: 'E', x: roseX + roseR + 7, y: roseY + 3 },
          { l: 'W', x: roseX - roseR - 7, y: roseY + 3 },
        ]
  return (
    <g>
      <circle cx={roseX} cy={roseY} r={roseR} fill={CREAM} stroke={BLUE} strokeWidth={1.5} />
      {/* north arrow */}
      <polygon
        points={`${roseX},${roseY - roseR + 4} ${roseX - 4},${roseY - 4} ${roseX + 4},${roseY - 4}`}
        fill={ORANGE}
      />
      {/* south arrow */}
      <polygon
        points={`${roseX},${roseY + roseR - 4} ${roseX - 4},${roseY + 4} ${roseX + 4},${roseY + 4}`}
        fill={BLUE}
      />
      {labels.map(({ l, x, y }) => (
        <text key={l} x={x} y={y} textAnchor="middle" fontSize={9} fontWeight="800" fill={DARK_BLUE}>
          {l}
        </text>
      ))}
    </g>
  )
}

// ─── Main explainer ──────────────────────────────────────────────────────────
export default function Classroom24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? 'Penjelas arah: papan tulis di timur (belakang guru), guru menghadap barat, tangan kiri menunjuk selatan → jawaban B.'
      : 'Direction explainer: blackboard is east (behind teacher), teacher faces west, left hand points south → answer B.'

  // Facing arrow: teacher faces west (left in SVG) = deg 270
  // Left-hand arrow: south = deg 180

  const OPTS = ['A', 'B', 'C', 'D', 'E']
  const OPT_LABELS_EN = ['North', 'South', 'East', 'West', 'NE']
  const OPT_LABELS_ID = ['Utara', 'Selatan', 'Timur', 'Barat', 'TL']

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── Floor-plan SVG ── */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: 'block' }}
          aria-hidden="true"
        >
          {/* Room floor */}
          <rect
            x={ROOM.x}
            y={ROOM.y}
            width={ROOM.w}
            height={ROOM.h}
            rx={4}
            fill={CREAM}
            stroke={BLUE}
            strokeWidth={2.5}
          />

          {/* Blackboard on east wall */}
          <rect
            x={BLACKBOARD.x}
            y={BLACKBOARD.y}
            width={BLACKBOARD.w}
            height={BLACKBOARD.h}
            rx={2}
            fill={BLUE}
          />
          {/* chalk lines */}
          <line x1={BLACKBOARD.x + 2} y1={BLACKBOARD.y + 20} x2={BLACKBOARD.x + 8} y2={BLACKBOARD.y + 20} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={BLACKBOARD.x + 2} y1={BLACKBOARD.y + 30} x2={BLACKBOARD.x + 8} y2={BLACKBOARD.y + 30} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
          <text x={BLACKBOARD.x + BLACKBOARD.w / 2} y={BLACKBOARD.y - 8} textAnchor="middle" fontSize={9} fontWeight="700" fill={BLUE}>
            Papan Tulis
          </text>

          {/* Highlight ring around blackboard on setup beat */}
          {beat.highlightBoard && (
            <motion.rect
              x={BLACKBOARD.x - 4}
              y={BLACKBOARD.y - 4}
              width={BLACKBOARD.w + 8}
              height={BLACKBOARD.h + 8}
              rx={5}
              fill="none"
              stroke={ORANGE}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* East wall label */}
          <text x={ROOM.x + ROOM.w + 12} y={ROOM.y + ROOM.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="700" fill={ORANGE}>
            {lang === 'id' ? 'T' : 'E'}
          </text>

          {/* Student desks */}
          {DESK_POSITIONS.map((pos, i) => (
            <g key={i} transform={`translate(${pos.x},${pos.y})`}>
              <rect x={-18} y={-10} width={36} height={24} rx={3} fill={PEACH} stroke={ORANGE} strokeWidth={1.5} />
              <rect x={-10} y={-20} width={20} height={10} rx={3} fill={CREAM} stroke={ORANGE} strokeWidth={1.2} />
            </g>
          ))}

          {/* Teacher body */}
          <circle cx={TEACHER_POS.cx} cy={TEACHER_POS.cy} r={14} fill={PEACH} stroke={ORANGE} strokeWidth={2} />
          {/* Facing direction arrow (animated) */}
          <motion.g
            style={{ transformBox: 'view-box', transformOrigin: `${TEACHER_POS.cx}px ${TEACHER_POS.cy}px` }}
            animate={{ rotate: beat.facingDeg - 270 }}
            initial={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          >
            {/* Facing arrow points left (west) when rotate=0 */}
            <polygon
              points={`${TEACHER_POS.cx - 14},${TEACHER_POS.cy} ${TEACHER_POS.cx - 22},${TEACHER_POS.cy - 7} ${TEACHER_POS.cx - 22},${TEACHER_POS.cy + 7}`}
              fill={isResult ? GREEN : ORANGE}
            />
          </motion.g>

          {/* Teacher label */}
          <text x={TEACHER_POS.cx} y={TEACHER_POS.cy + 28} textAnchor="middle" fontSize={9} fontWeight="700" fill={DARK_BLUE}>
            Bu Sandra
          </text>

          {/* Left-hand arrow (south) — shown from beat 2 onwards */}
          {beat.leftDeg >= 0 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ArrowSvg
                cx={TEACHER_POS.cx}
                cy={TEACHER_POS.cy}
                deg={beat.leftDeg}
                color={isResult ? GREEN : '#7C3AED'}
                len={52}
              />
              {/* "LEFT" label at south */}
              <text
                x={TEACHER_POS.cx}
                y={TEACHER_POS.cy + 66}
                textAnchor="middle"
                fontSize={9}
                fontWeight="800"
                fill={isResult ? GREEN_TEXT : '#7C3AED'}
              >
                {lang === 'id' ? 'KIRI → S' : 'LEFT → S'}
              </text>
            </motion.g>
          )}

          {/* "WEST" label appearing on face-west beat */}
          {(beat.phase === 'face-west' || beat.phase === 'left-south' || beat.phase === 'answer') && (
            <motion.text
              x={ROOM.x - 18}
              y={ROOM.y + ROOM.h / 2 + 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight="700"
              fill={DARK_BLUE}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {lang === 'id' ? 'B' : 'W'}
            </motion.text>
          )}

          {/* Wall labels — N top, S bottom */}
          <text x={ROOM.x + ROOM.w / 2} y={ROOM.y - 10} textAnchor="middle" fontSize={9} fontWeight="600" fill={BLUE}>
            {lang === 'id' ? 'Utara' : 'North'}
          </text>
          <text x={ROOM.x + ROOM.w / 2} y={ROOM.y + ROOM.h + 16} textAnchor="middle" fontSize={9} fontWeight="600" fill={BLUE}>
            {lang === 'id' ? 'Selatan' : 'South'}
          </text>

          {/* Compass rose */}
          <CompassRose lang={lang} />
        </svg>

        {/* ── Option chips (A–E) ── */}
        <div className="flex flex-wrap justify-center gap-2">
          {OPTS.map((opt, i) => {
            const isCorrect = opt === 'B'
            const isRejected = beat.rejectOptions.includes(opt)
            const isWinner = isResult && isCorrect

            let bg = '#EFF6FF'
            let border = '#93C5FD'
            let textColor = DARK_BLUE
            let lineThrough = false

            if (isRejected) {
              bg = '#FEE2E2'
              border = '#EF4444'
              textColor = '#B91C1C'
              lineThrough = true
            }
            if (isWinner) {
              bg = GREEN_BG
              border = GREEN
              textColor = GREEN_TEXT
            }

            return (
              <motion.div
                key={opt}
                style={{ background: bg, borderColor: border, color: textColor, textDecoration: lineThrough ? 'line-through' : 'none' }}
                className="flex min-w-[72px] flex-col items-center rounded-xl border-2 px-3 py-1"
                initial={{ scale: 1 }}
                animate={{ scale: isWinner ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              >
                <span className="text-xs font-black">{opt}</span>
                <span className="text-[10px] font-bold">
                  {lang === 'id' ? OPT_LABELS_ID[i] : OPT_LABELS_EN[i]}
                </span>
                {isRejected && <span className="text-xs font-black text-red-600">✗</span>}
                {isWinner && <span className="text-xs font-black" style={{ color: GREEN }}>✓</span>}
              </motion.div>
            )
          })}
        </div>

        {/* ── Caption strip ── */}
        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
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
