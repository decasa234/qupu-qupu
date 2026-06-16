// Visual make-a-ten explainer for WMI-20F1A Q1: 9 + 2 + 6 = 17 (answer A).
//
// Counters in a ten-frame: 9 blue dots fill a 2×5 frame with one empty cell,
// 2 amber dots and 6 green dots wait outside. One amber dot slides into the
// empty cell to complete the ten (1 amber left over), then the green 6 joins:
// 10 + 1 = 11, 11 + 6 = 17.
import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildMakeTenVisual20Steps, type MakeTenVisual20Step } from './makeTenVisual20Steps'

const GREEN = '#10B981'
const BLUE = '#2f6df0'
const AMBER = '#F59E0B'
const INK = '#1F2937'

const VIEW_W = 440
const VIEW_H = 226

// Ten-frame geometry (2 rows × 5 cols).
const CELL = 30
const FRAME_X = 26
const FRAME_Y = 46
const FRAME_W = CELL * 5
const FRAME_H = CELL * 2
const DOT_R = 10

/** Centre of ten-frame cell i (0..9, row-major). */
function cellCenter(i: number): { x: number; y: number } {
  const row = Math.floor(i / 5)
  const col = i % 5
  return { x: FRAME_X + col * CELL + CELL / 2, y: FRAME_Y + row * CELL + CELL / 2 }
}

const ROW_MID = FRAME_Y + FRAME_H / 2 // vertical centre of all counter groups
const LABEL_Y = FRAME_Y + FRAME_H + 24

// Amber pair (outside the frame, before the move).
const PLUS1_X = 196
const AMBER_X = [222, 250]
// Leftover amber dot sits centred where the pair was.
const AMBER_LEFTOVER_X = 236
const PLUS2_X = 282
// Green 6 as 2 rows × 3 cols.
const GREEN_X0 = 312
const GREEN_GAP = 30

function Dot({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <circle cx={cx} cy={cy} r={DOT_R} fill={color} stroke={INK} strokeWidth={1.5} />
}

function GroupLabel({ x, text, color }: { x: number; text: string; color: string }) {
  return (
    <text x={x} y={LABEL_Y} textAnchor="middle" fontSize={18} fontWeight={900} fill={color}>
      {text}
    </text>
  )
}

function MakeTenVisual20Diagram({ beat }: { beat: MakeTenVisual20Step }) {
  const { moved, joined, showTotal } = beat

  const greenCenters: Array<{ x: number; y: number }> = []
  for (let i = 0; i < 6; i++) {
    greenCenters.push({
      x: GREEN_X0 + (i % 3) * GREEN_GAP,
      y: ROW_MID + (i < 3 ? -CELL / 2 : CELL / 2),
    })
  }

  const emptyCell = cellCenter(9)

  const totalText =
    showTotal === 'eleven' ? '10 + 1 = 11' : showTotal === 'seventeen' ? '10 + 1 + 6 = 17' : null

  // Dashed outline groups what the running total covers.
  const ringX2 = joined ? GREEN_X0 + 2 * GREEN_GAP + DOT_R + 10 : AMBER_LEFTOVER_X + DOT_R + 10

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* expression header */}
      <text x={VIEW_W / 2} y={24} textAnchor="middle" fontSize={20} fontWeight={900} fill={INK}>
        9 + 2 + 6 = ?
      </text>

      {/* group outline once we are totalling */}
      {totalText !== null && (
        <rect
          x={FRAME_X - 10}
          y={FRAME_Y - 12}
          width={ringX2 - (FRAME_X - 10)}
          height={FRAME_H + 24}
          rx={14}
          fill="none"
          stroke={joined ? GREEN : BLUE}
          strokeWidth={2}
          strokeDasharray="6 5"
        />
      )}

      {/* ten-frame grid */}
      <rect x={FRAME_X} y={FRAME_Y} width={FRAME_W} height={FRAME_H} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
      {[1, 2, 3, 4].map((c) => (
        <line
          key={`v${c}`}
          x1={FRAME_X + c * CELL}
          y1={FRAME_Y}
          x2={FRAME_X + c * CELL}
          y2={FRAME_Y + FRAME_H}
          stroke={INK}
          strokeWidth={1.5}
        />
      ))}
      <line x1={FRAME_X} y1={FRAME_Y + CELL} x2={FRAME_X + FRAME_W} y2={FRAME_Y + CELL} stroke={INK} strokeWidth={1.5} />

      {/* 9 blue dots in cells 0..8 */}
      {Array.from({ length: 9 }, (_, i) => {
        const { x, y } = cellCenter(i)
        return <Dot key={`b${i}`} cx={x} cy={y} color={BLUE} />
      })}

      {/* amber dot(s): inside the frame once moved, plus the leftover outside */}
      {moved ? (
        <>
          <Dot cx={emptyCell.x} cy={emptyCell.y} color={AMBER} />
          <Dot cx={AMBER_LEFTOVER_X} cy={ROW_MID} color={AMBER} />
        </>
      ) : (
        AMBER_X.map((x, i) => <Dot key={`a${i}`} cx={x} cy={ROW_MID} color={AMBER} />)
      )}

      {/* slide arrow, shown on the make-a-ten beat only */}
      {moved && showTotal === 'none' && (
        <g stroke={AMBER} strokeWidth={2.5} fill="none">
          <path d={`M ${AMBER_LEFTOVER_X - 18} ${ROW_MID - 26} Q ${(AMBER_LEFTOVER_X + emptyCell.x) / 2 - 10} ${ROW_MID - 44} ${emptyCell.x + 6} ${emptyCell.y - 16}`} />
          <path
            d={`M ${emptyCell.x + 14} ${emptyCell.y - 24} L ${emptyCell.x + 6} ${emptyCell.y - 16} L ${emptyCell.x + 17} ${emptyCell.y - 13}`}
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* plus separators */}
      <text x={PLUS1_X} y={ROW_MID} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
        +
      </text>
      <text x={PLUS2_X} y={ROW_MID} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
        +
      </text>

      {/* 6 green dots */}
      {greenCenters.map(({ x, y }, i) => (
        <Dot key={`g${i}`} cx={x} cy={y} color={GREEN} />
      ))}

      {/* group labels */}
      <GroupLabel x={FRAME_X + FRAME_W / 2} text={moved ? '10' : '9'} color={BLUE} />
      <GroupLabel x={moved ? AMBER_LEFTOVER_X : (AMBER_X[0] + AMBER_X[1]) / 2} text={moved ? '1' : '2'} color={AMBER} />
      <GroupLabel x={GREEN_X0 + GREEN_GAP} text="6" color={GREEN} />

      {/* running-total label */}
      {totalText !== null && (
        <text
          x={VIEW_W / 2}
          y={LABEL_Y + 34}
          textAnchor="middle"
          fontSize={20}
          fontWeight={900}
          fill={joined ? GREEN : BLUE}
        >
          {totalText}
        </text>
      )}
    </svg>
  )
}

export default function MakeTenVisual20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMakeTenVisual20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: buat sepuluh dulu — 9 + 1 = 10, sisa 1, jadi 11; lalu 11 + 6 = ${story.answer}.`
      : `Explainer: make a ten first — 9 + 1 = 10, with 1 left over makes 11; then 11 + 6 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <MakeTenVisual20Diagram beat={beat} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
