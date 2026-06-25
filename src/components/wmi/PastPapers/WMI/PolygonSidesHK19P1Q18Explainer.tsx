// PolygonSidesHK19P1Q18Explainer — HKIMO 2019 Heat Primary-1 Q18
//
// Animates tracing the 6 sides of the hexagon one by one.
// Each beat highlights the current side in orange; completed sides stay green;
// the final beat flashes the full polygon green with the answer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildPolygonSidesHK19P1Q18Steps } from './polygonSidesHK19P1Q18Steps'

const BLUE   = '#1E3A5F'
const ORANGE = '#f0853a'
const GREEN  = '#10B981'
const GREY   = '#CBD5E1'

// Vertices matching the illustration
type Pt = [number, number]
const VERTS: Pt[] = [
  [10,  10],  // A top-left
  [100, 10],  // B top-right
  [100, 48],  // C right-side drop
  [145, 65],  // D arrow tip
  [100, 110], // E bottom-right
  [10,  110], // F bottom-left
]

// The 6 sides as [from, to] vertex index pairs
const SIDES: [number, number][] = [
  [0, 1], // top
  [1, 2], // right-vertical
  [2, 3], // upper diagonal
  [3, 4], // lower diagonal
  [4, 5], // bottom
  [5, 0], // left
]

function sideColor(sideIdx: number, highlight: number | null): string {
  if (highlight === null) return GREEN
  if (sideIdx === highlight) return ORANGE
  if (sideIdx < highlight)  return GREEN
  return GREY
}

function sideWidth(sideIdx: number, highlight: number | null): number {
  if (highlight === null) return 3
  if (sideIdx === highlight) return 5
  return 3
}

export default function PolygonSidesHK19P1Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPolygonSidesHK19P1Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="flex flex-col items-center gap-3">
        {/* Polygon figure with side-by-side highlighting */}
        <motion.svg
          key={`fig-${beat.sideIndex}`}
          viewBox="0 0 160 130"
          width="200"
          height="163"
          role="img"
          aria-label={t(
            `Hexagon with side ${beat.sideIndex !== null ? beat.sideIndex + 1 : 'all'} highlighted`,
            `Heksagon dengan sisi ${beat.sideIndex !== null ? beat.sideIndex + 1 : 'semua'} disorot`,
          )}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {SIDES.map(([a, b], i) => {
            const [x1, y1] = VERTS[a]
            const [x2, y2] = VERTS[b]
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={sideColor(i, beat.sideIndex)}
                strokeWidth={sideWidth(i, beat.sideIndex)}
                strokeLinecap="round"
              />
            )
          })}

          {/* Side number label on the active side */}
          {beat.sideIndex !== null && (() => {
            const [a, b] = SIDES[beat.sideIndex]
            const mx = (VERTS[a][0] + VERTS[b][0]) / 2
            const my = (VERTS[a][1] + VERTS[b][1]) / 2
            const offsets: [number, number][] = [
              [0, -10],  // top → above
              [12,  0],  // right-vertical → right
              [14, -6],  // upper diagonal → right
              [14,  6],  // lower diagonal → right
              [0,  14],  // bottom → below
              [-14, 0],  // left → left
            ]
            const [ox, oy] = offsets[beat.sideIndex]
            return (
              <text
                x={mx + ox}
                y={my + oy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fontWeight="900"
                fontFamily="sans-serif"
                fill={ORANGE}
              >
                {beat.sideIndex + 1}
              </text>
            )
          })()}

          {/* Final beat: show "6" in the centre */}
          {beat.result && (
            <text
              x="60"
              y="65"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="28"
              fontWeight="900"
              fontFamily="sans-serif"
              fill={GREEN}
            >
              6
            </text>
          )}
        </motion.svg>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
