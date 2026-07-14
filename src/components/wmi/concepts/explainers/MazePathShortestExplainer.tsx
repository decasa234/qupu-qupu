import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMazePathSteps } from './mazePathSteps'
import { useBeatControl } from './useBeatControl'

// ─── visual constants (match maze-path-shortest.tsx illustration) ─────────────
const CELL = 36
const PAD = 8

/** Colours pulled from the illustration + qupu brand palette. */
const WALL_FILL = '#334155'   // slate-700 (matches illustration .fill-slate-700)
const CELL_FILL = '#FFF9F4'   // qupu-shell
const STROKE = '#30598A'      // qupu-brand-blue
const TOKEN_COLOR = '#30598A' // start-dot colour (matches illustration)
const FLAG_POLE = '#f0853a'   // qupu-brand-orange
const TRACE_COLOR = '#f0853a' // orange polyline

interface MazeParams {
  cols?: unknown
  rows?: unknown
  walls?: unknown
}

/** Pixel centre of cell (gx, gy). */
function cx(gx: number): number { return PAD + gx * CELL + CELL / 2 }
function cy(gy: number): number { return PAD + gy * CELL + CELL / 2 }

/** Build an SVG polyline points string from a list of {x,y} grid coords. */
function polylinePoints(cells: { x: number; y: number }[]): string {
  return cells.map((c) => `${cx(c.x)},${cy(c.y)}`).join(' ')
}

export default function MazePathShortestExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as MazeParams

  const story = useMemo(
    () => buildMazePathSteps(p, lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.cols, p.rows, p.walls, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cols, rows } = story
  const svgW = cols * CELL + PAD * 2
  const svgH = rows * CELL + PAD * 2
  const targetX = cols - 1
  const targetY = rows - 1

  const ariaLabel =
    lang === 'id'
      ? `Labirin ${cols} kolom kali ${rows} baris; jalur terpendek ${story.answer} langkah.`
      : `Maze ${cols} columns by ${rows} rows; shortest path ${story.answer} steps.`

  const isResult = beat.result

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Step counter badge */}
        <div
          className="rounded-lg border-2 px-3 py-1 font-display text-xs font-extrabold"
          style={{ background: '#E1EFFB', borderColor: STROKE, color: STROKE }}
        >
          {lang === 'id'
            ? `Langkah: ${beat.stepsTaken}`
            : `Steps: ${beat.stepsTaken}`}
        </div>

        {/* Maze SVG */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={Math.min(320, svgW * 1.4)}
          aria-hidden="true"
          style={{ overflow: 'visible' }}
        >
          {/* Grid cells */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const isWall = story.walls.some((w) => w.x === c && w.y === r)
              return (
                <rect
                  key={`${r}-${c}`}
                  x={PAD + c * CELL}
                  y={PAD + r * CELL}
                  width={CELL}
                  height={CELL}
                  fill={isWall ? WALL_FILL : CELL_FILL}
                  stroke={STROKE}
                  strokeWidth={1}
                />
              )
            }),
          )}

          {/* Traced path polyline (orange) — all cells visited so far */}
          {beat.tracedPath.length >= 2 && (
            <polyline
              points={polylinePoints(beat.tracedPath)}
              fill="none"
              stroke={TRACE_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
            />
          )}

          {/* Start marker — blue dot (matches illustration) */}
          <circle
            cx={cx(0)}
            cy={cy(0)}
            r={9}
            fill={TOKEN_COLOR}
            opacity={beat.stepsTaken === 0 ? 1 : 0.35}
          />

          {/* Target marker — orange flag (matches illustration) */}
          <line
            x1={cx(targetX) - 7}
            y1={cy(targetY) - 10}
            x2={cx(targetX) - 7}
            y2={cy(targetY) + 10}
            stroke={FLAG_POLE}
            strokeWidth={2}
          />
          <polygon
            points={`${cx(targetX) - 7},${cy(targetY) - 10} ${cx(targetX) + 8},${cy(targetY) - 5} ${cx(targetX) - 7},${cy(targetY)}`}
            fill={FLAG_POLE}
          />

          {/* Animated token — orange circle that moves one cell per beat */}
          <motion.circle
            cx={cx(beat.tokenCell.x)}
            cy={cy(beat.tokenCell.y)}
            r={10}
            fill={isResult ? '#10B981' : TOKEN_COLOR}
            stroke="white"
            strokeWidth={2.5}
            animate={{
              cx: cx(beat.tokenCell.x),
              cy: cy(beat.tokenCell.y),
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          />
        </svg>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
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
