import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleGrid, GRID_SIZE, PieceOne, PieceTwo } from './PieceHunt20Illustration'
import { buildPieceHunt20Steps } from './pieceHunt20Steps'

const GREEN = '#10B981'
const INK = '#1F2937'

const VIEW_W = 280
const VIEW_H = 196
const GRID_X = 24
const GRID_Y = 28

export default function PieceHunt20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPieceHunt20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: potongan 1 muncul 2 kali, potongan 2 muncul 3 kali, jadi 2 + 3 = 5.'
      : 'Explainer: piece 1 appears 2 times, piece 2 appears 3 times, so 2 + 3 = 5.'

  const pieceSize = 22
  const legendX = GRID_X + GRID_SIZE + 22

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <CircleGrid x={GRID_X} y={GRID_Y} highlight={beat.highlightCells} highlightColor={beat.highlightColor} />

          {/* the two pieces as a side legend */}
          <PieceOne x={legendX} y={GRID_Y + 6} size={pieceSize} />
          <PieceTwo x={legendX} y={GRID_Y + 52} size={pieceSize} />

          {/* running tally */}
          {beat.tally !== '' && (
            <text
              x={VIEW_W / 2}
              y={GRID_Y + GRID_SIZE + 26}
              textAnchor="middle"
              fontSize={17}
              fontWeight={900}
              fill={beat.result ? GREEN : INK}
            >
              {beat.result ? `${beat.tally} = 5` : beat.tally}
            </text>
          )}
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
