import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  LEFT_TRI,
  OVERLAP_TRI,
  Q17_VIEW_H,
  Q17_VIEW_W,
  RIGHT_TRI,
  Triangle,
} from './P19G3Q17Illustration'
import { buildP19G3Q17Steps } from './p19G3Q17Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'
const SHADE = '#9CA3AF'
const HEX_FILL = 'rgba(16,185,129,0.22)'

// Star-of-David geometry (used from the "star" beat on): two equilateral triangles
// centered in the view, one pointing up and one pointing down. Their intersection is
// a regular hexagon — the 6-sided overlap the answer is about.
const CXp = Q17_VIEW_W / 2
const CYp = Q17_VIEW_H / 2
const R = 104

function poly(angles: number[], r: number): ReadonlyArray<readonly [number, number]> {
  return angles.map((a) => {
    const rad = (a * Math.PI) / 180
    return [CXp + r * Math.cos(rad), CYp - r * Math.sin(rad)] as const
  })
}
// Up triangle: apexes at 90,210,330. Down triangle: 30,150,270.
const STAR_UP = poly([90, 210, 330], R)
const STAR_DOWN = poly([30, 150, 270], R)
// Inner hexagon vertices sit at r = R/2, every 30° starting at 0°.
const HEX = poly([0, 60, 120, 180, 240, 300], R / 2)

// The first edge of the LEFT triangle, used to illustrate "one edge crosses twice".
function edgePoints(tri: ReadonlyArray<readonly [number, number]>, i: number) {
  return [tri[i], tri[(i + 1) % tri.length]] as const
}

export default function P19G3Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP19G3Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap sisi memotong paling banyak 2 kali, jadi irisan terbanyak adalah segi enam dengan ${story.maxSides} sisi — jawaban C.`
      : `Explainer: each edge crosses at most twice, so the largest overlap is a hexagon with ${story.maxSides} sides — answer C.`

  const useStar = beat.phase === 'star' || beat.phase === 'countHex' || beat.phase === 'result'
  const [e0, e1] = edgePoints(RIGHT_TRI, 0) // a single edge of the right triangle to spotlight

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${Q17_VIEW_W} ${Q17_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {useStar ? (
            <>
              {(beat.phase === 'countHex' || beat.phase === 'result') && (
                <polygon
                  points={HEX.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill={HEX_FILL}
                  stroke={GREEN}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              )}
              <Triangle points={STAR_UP} />
              <Triangle points={STAR_DOWN} />
              {beat.phase === 'countHex' &&
                HEX.map(([x, y], i) => <circle key={`hv${i}`} cx={x} cy={y} r={5.5} fill={GREEN} />)}
            </>
          ) : (
            <>
              {/* given example: small shaded triangular overlap */}
              <Triangle points={OVERLAP_TRI} fill={SHADE} stroke="none" />
              <Triangle points={LEFT_TRI} />
              <Triangle points={RIGHT_TRI} />
              {/* spotlight one edge + its two crossing points */}
              {(beat.phase === 'oneEdge' || beat.phase === 'allEdges') && (
                <line
                  x1={e0[0]}
                  y1={e0[1]}
                  x2={e1[0]}
                  y2={e1[1]}
                  stroke={AMBER}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              )}
              {(beat.phase === 'oneEdge' || beat.phase === 'allEdges') &&
                OVERLAP_TRI.slice(0, 2).map(([x, y], i) => (
                  <circle key={`cp${i}`} cx={x} cy={y} r={5.5} fill={AMBER} />
                ))}
            </>
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
