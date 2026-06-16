import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TALLY_SHAPE_COLOR, TallyShapeGlyph } from './ShapeTallyOption20'
import { buildShapeTally20Steps, type TallyRow } from './shapeTally20Steps'

const GREEN = '#10B981'
const INK = '#1F2937'

const VIEW_W = 368
const ROW_PITCH = 52
const TOP = 30
const VIEW_H = TOP + 4 * ROW_PITCH - 14 // bottom breathing room under the last row

const GLYPH_X = 28
const CHIP_X0 = 54
const CHIP_GAP = 6
const CHIP_H = 20
const BADGE_X = VIEW_W - 26

function chipWidth(label: string) {
  return label.length * 6 + 14
}

function TallyBoardRow({ row, y, revealed }: { row: TallyRow; y: number; revealed: boolean }) {
  const color = TALLY_SHAPE_COLOR[row.kind]
  let x = CHIP_X0
  return (
    <g opacity={revealed ? 1 : 0.22}>
      <TallyShapeGlyph kind={row.kind} cx={GLYPH_X} cy={y} stroke={revealed ? color : INK} strokeWidth={2.5} />

      {/* sub-count chips: where the shapes hide */}
      {revealed &&
        row.chips.map((label, i) => {
          const w = chipWidth(label)
          const cx = x + w / 2
          x += w + CHIP_GAP
          return (
            <g key={i}>
              <rect x={cx - w / 2} y={y - CHIP_H / 2} width={w} height={CHIP_H} rx={CHIP_H / 2} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={1} />
              <text x={cx} y={y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#475569">
                {label}
              </text>
            </g>
          )
        })}

      {/* count badge */}
      <circle cx={BADGE_X} cy={y} r={14} fill={revealed ? color : '#E2E8F0'} />
      <text x={BADGE_X} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={revealed ? '#FFFFFF' : '#94A3B8'}>
        {revealed ? row.count : '?'}
      </text>
    </g>
  )
}

function TallyBoardDiagram({ rows, revealRow }: { rows: TallyRow[]; revealRow: number }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 400, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {rows.map((row, i) => (
        <TallyBoardRow key={row.kind} row={row} y={TOP + i * ROW_PITCH} revealed={i < revealRow} />
      ))}
    </svg>
  )
}

export default function ShapeTally20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeTally20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 8 segitiga, 9 lingkaran, 7 persegi, 6 persegi panjang — tabel A (${story.answerText}).`
      : `Explainer: 8 triangles, 9 circles, 7 squares, 6 rectangles — table A (${story.answerText}).`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TallyBoardDiagram rows={story.rows} revealRow={beat.revealRow} />

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
