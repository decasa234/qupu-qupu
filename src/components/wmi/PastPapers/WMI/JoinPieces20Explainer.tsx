import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  FIT_PIECE1_CELLS,
  FIT_PIECE2_CELLS,
  PIECE_CELLS,
  PIECE_FILL,
  PIECE_FILL_2,
  PLUS_CELLS,
  PolyShape,
} from './JoinPieces20Illustration'
import { OPTION_CELLS } from './JoinPiecesOption20'
import { buildJoinPieces20Steps, type JoinStage } from './joinPieces20Steps'

const GREEN = '#10B981'
const RED = '#EF4444'
const INK = '#1F2937'

const VIEW_W = 320
const VIEW_H = 168
const CELL = 30

/** The two source pieces side by side, with optional per-piece square counts. */
function PiecesScene({ showCounts }: { showCounts: boolean }) {
  const pieceW = 3 * CELL
  const pieceH = 2 * CELL
  const gap = 44
  const x0 = (VIEW_W - (pieceW * 2 + gap)) / 2
  const y0 = showCounts ? 28 : (VIEW_H - pieceH) / 2
  return (
    <g>
      <PolyShape cells={PIECE_CELLS} x={x0} y={y0} cell={CELL} />
      <text x={x0 + pieceW + gap / 2} y={y0 + pieceH / 2} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={900} fill={INK}>
        +
      </text>
      <PolyShape cells={PIECE_CELLS} x={x0 + pieceW + gap} y={y0} cell={CELL} />
      {showCounts && (
        <>
          <text x={x0 + pieceW / 2} y={y0 + pieceH + 22} textAnchor="middle" fontSize={18} fontWeight={900} fill={INK}>
            4
          </text>
          <text x={x0 + pieceW + gap + pieceW / 2} y={y0 + pieceH + 22} textAnchor="middle" fontSize={18} fontWeight={900} fill={INK}>
            4
          </text>
          <text x={VIEW_W / 2} y={y0 + pieceH + 48} textAnchor="middle" fontSize={18} fontWeight={900} fill="#2f6df0">
            4 + 4 = 8
          </text>
        </>
      )}
    </g>
  )
}

/** Shape B small, crossed out: only 6 squares. */
function RejectScene() {
  const bCells = OPTION_CELLS.B
  const cell = 26
  const w = 4 * cell
  const h = 2 * cell
  const x0 = (VIEW_W - w) / 2
  const y0 = (VIEW_H - h) / 2 - 8
  return (
    <g>
      <PolyShape cells={bCells} x={x0} y={y0} cell={cell} />
      <line x1={x0 - 8} y1={y0 - 8} x2={x0 + w + 8} y2={y0 + h + 8} stroke={RED} strokeWidth={5} strokeLinecap="round" />
      <line x1={x0 + w + 8} y1={y0 - 8} x2={x0 - 8} y2={y0 + h + 8} stroke={RED} strokeWidth={5} strokeLinecap="round" />
      <text x={VIEW_W / 2} y={y0 + h + 34} textAnchor="middle" fontSize={16} fontWeight={900} fill={RED}>
        6 ≠ 8
      </text>
    </g>
  )
}

/** The plus outline being filled by the two pieces. */
function FitScene({ stage }: { stage: 'fit1' | 'fit2' | 'answer' }) {
  const cell = 36
  const w = 4 * cell
  const h = 3 * cell
  const x0 = (VIEW_W - w) / 2
  const y0 = (VIEW_H - h) / 2
  return (
    <g>
      {/* the plus outline — dashed empty cells */}
      {PLUS_CELLS.map(([r, c], i) => (
        <rect
          key={i}
          x={x0 + c * cell}
          y={y0 + r * cell}
          width={cell}
          height={cell}
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}
      {/* piece 1: top bump + right arm */}
      <PolyShape cells={FIT_PIECE1_CELLS} x={x0} y={y0} cell={cell} fill={PIECE_FILL} />
      {/* piece 2 (turned 180°): left arm + bottom bump */}
      {stage !== 'fit1' && <PolyShape cells={FIT_PIECE2_CELLS} x={x0} y={y0} cell={cell} fill={PIECE_FILL_2} />}
      {stage === 'answer' && (
        <text x={x0 + w + 24} y={y0 + h / 2} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={GREEN}>
          C
        </text>
      )}
    </g>
  )
}

function Scene({ stage }: { stage: JoinStage }) {
  if (stage === 'pieces' || stage === 'count') return <PiecesScene showCounts={stage === 'count'} />
  if (stage === 'reject') return <RejectScene />
  return <FitScene stage={stage} />
}

export default function JoinPieces20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildJoinPieces20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dua potongan Z (4 + 4 = 8 persegi) digeser dan diputar hingga membentuk tanda tambah — Bentuk C.'
      : 'Explainer: the two Z-pieces (4 + 4 = 8 squares) slide and turn to fill the plus shape — Shape C.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <Scene stage={beat.stage} />
        </svg>

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
