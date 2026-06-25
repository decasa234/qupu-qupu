import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Apple } from './primitives/glyphs'
import { APPLE_CELLS, W, px } from './PickupHK19P1Q25Illustration'
import { buildPickupHK19P1Q25Steps, PATH } from './pickupHK19P1Q25Steps'

export default function PickupHK19P1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPickupHK19P1Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Which apple cells has Ming passed through so far?
  const visited = new Set(
    PATH.slice(0, beat.pathLen + 1).map(([c, r]) => `${c},${r}`),
  )

  // Ming's current position
  const [mc, mr] = PATH[beat.pathLen]
  const [mingX, mingY] = px(mc, mr)

  // Polyline for the travel path
  const polyPts = PATH.slice(0, beat.pathLen + 1)
    .map(([c, r]) => px(c, r).join(','))
    .join(' ')

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan jalur terpendek: ${beat.caption}`
      : `Minimum-distance path explainer: ${beat.caption}`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${W} ${W}`} width="100%">
          {/* grid edges — horizontal */}
          {([0, 2, 4] as const).flatMap((row) =>
            [0, 1, 2, 3].map((col) => {
              const [x1, y1] = px(col, row)
              const [x2, y2] = px(col + 1, row)
              return (
                <line
                  key={`h-${col}-${row}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#E2E8F0" strokeWidth={1.5}
                />
              )
            }),
          )}
          {/* grid edges — vertical */}
          {([0, 4] as const).flatMap((col) =>
            [0, 1, 2, 3].map((row) => {
              const [x1, y1] = px(col, row)
              const [x2, y2] = px(col, row + 1)
              return (
                <line
                  key={`v-${col}-${row}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#E2E8F0" strokeWidth={1.5}
                />
              )
            }),
          )}
          {/* travel path */}
          {beat.pathLen > 0 && (
            <polyline
              points={polyPts}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={3.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {/* apples: green = collected, grey = pending */}
          {APPLE_CELLS.map(([col, row]) => {
            const [x, y] = px(col, row)
            const collected = visited.has(`${col},${row}`)
            return (
              <Apple
                key={`${col},${row}`}
                cx={x} cy={y} r={15}
                color={collected ? '#10B981' : '#9CA3AF'}
              />
            )
          })}
          {/* Ming marker */}
          <circle cx={mingX} cy={mingY} r={9} fill="#1D4ED8" opacity={0.9} />
          <text
            x={mingX} y={mingY}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fontWeight="bold" fill="white"
          >
            M
          </text>
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
