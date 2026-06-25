// HKIMO-18-P1H-Q25 — animated explainer.
//
// Optimal Hamiltonian path through all 16 apples (all steps = 1 m):
//   Start (1,0) → up to (0,0) → right across row 0 → down to (1,3)
//   → down to (2,3) → left across row 2 → down to (3,0)
//   → down to (4,0) → right across row 4 → up to (3,3)
//   15 edges × 1 m = 15 m minimum.
//
// 6 beats: title → start marker → top-5 steps → middle-5 → bottom-5 → answer.
// Visited apples turn green as the trail is revealed.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Apple } from './primitives/glyphs'
import { buildAppleGridHK18P1Q25Steps } from './appleGridHK18P1Q25Steps'

const CELL = 54
const PAD  = 22
const HALF = CELL / 2

const VW = PAD * 2 + 4 * CELL        // 260
const VH = PAD * 2 + 5 * CELL + 30   // 344 (extra 30 for answer label)

const cx = (col: number) => PAD + HALF + col * CELL
const cy = (row: number) => PAD + HALF + row * CELL

// All 16 apple positions [row, col]
const APPLES: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 0], [1, 3],
  [2, 0], [2, 1], [2, 2], [2, 3],
  [3, 0], [3, 3],
  [4, 0], [4, 1], [4, 2], [4, 3],
]

// Optimal path — 16 waypoints (row, col), 15 edges of 1 m each
const PATH: [number, number][] = [
  [1, 0], [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 3], [2, 3], [2, 2], [2, 1], [2, 0],
  [3, 0], [4, 0], [4, 1], [4, 2], [4, 3],
  [3, 3],
]

// Pre-compute SVG pixel coords for each waypoint
const PATH_PTS = PATH.map(([r, c]) => ({ x: cx(c), y: cy(r) }))

function visitedSet(n: number): Set<string> {
  const s = new Set<string>()
  for (let i = 0; i < Math.min(n, PATH.length); i++) {
    s.add(`${PATH[i][0]},${PATH[i][1]}`)
  }
  return s
}

export default function AppleGridHK18P1Q25Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const { steps, finalIndex } = useMemo(
    () => buildAppleGridHK18P1Q25Steps(lang),
    [lang]
  )

  const beat = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: steps.map(s => s.hold),
  })

  const current = steps[beat]
  const n = current.pathPoints

  const visited = useMemo(() => visitedSet(n), [n])

  const polyPoints = PATH_PTS.slice(0, n)
    .map(p => `${p.x},${p.y}`)
    .join(' ')

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        className="max-w-[280px]"
        aria-hidden="true"
      >
        {/* faint grid */}
        {Array.from({ length: 6 }, (_, r) => (
          <line
            key={`h${r}`}
            x1={PAD} y1={PAD + r * CELL}
            x2={PAD + 4 * CELL} y2={PAD + r * CELL}
            stroke="#CBD5E1"
            strokeWidth={0.8}
          />
        ))}
        {Array.from({ length: 5 }, (_, c) => (
          <line
            key={`v${c}`}
            x1={PAD + c * CELL} y1={PAD}
            x2={PAD + c * CELL} y2={PAD + 5 * CELL}
            stroke="#CBD5E1"
            strokeWidth={0.8}
          />
        ))}

        {/* path trail */}
        {n >= 2 && (
          <polyline
            points={polyPoints}
            fill="none"
            stroke="#10B981"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* apple glyphs — visited = green, unvisited = red */}
        {APPLES.map(([r, c]) => {
          const key = `${r},${c}`
          return (
            <Apple
              key={key}
              cx={cx(c)}
              cy={cy(r)}
              r={18}
              color={visited.has(key) ? '#10B981' : '#E63946'}
            />
          )
        })}

        {/* start marker (blue dot on top of start apple) */}
        {n >= 1 && (
          <circle
            cx={PATH_PTS[0].x}
            cy={PATH_PTS[0].y}
            r={6}
            fill="#1D4ED8"
            stroke="#fff"
            strokeWidth={1.5}
          />
        )}

        {/* answer label on final beat */}
        {current.showAnswer && (
          <text
            x={VW / 2}
            y={VH - 8}
            textAnchor="middle"
            fontSize={15}
            fontWeight="700"
            fill="#10B981"
            fontFamily="sans-serif"
          >
            {lang === 'id' ? 'Jarak minimum: 15 m' : 'Minimum distance: 15 m'}
          </text>
        )}
      </svg>

      <p className="text-center text-sm text-slate-700 max-w-[280px] leading-snug px-2">
        {current.caption}
      </p>
    </div>
  )
}
