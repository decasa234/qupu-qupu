import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildGridPathSteps } from './gridPathSteps'
import { useBeatControl } from './useBeatControl'

interface GridPathParams {
  cols: number
  rows: number
  sx: number
  sy: number
  ex: number
  ey: number
}

const CELL = 44
const PAD = 8

// Colors matching grid-path-steps.tsx illustration
const FILL = '#f6f1e7'       // qupu-shell
const STROKE = '#30598A'     // qupu-brand-blue
const BLUE = '#30598A'       // start marker / token
const ORANGE = '#F97316'     // flag + path trace
const GREEN = '#10B981'      // result

/** SVG x-center for a grid column. */
function cx(gx: number) {
  return PAD + gx * CELL + CELL / 2
}
/** SVG y-center for a grid row. */
function cy(gy: number) {
  return PAD + gy * CELL + CELL / 2
}

export default function GridPathStepsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as GridPathParams

  const story = useMemo(
    () => buildGridPathSteps(p.cols, p.rows, p.sx, p.sy, p.ex, p.ey, lang),
    [p.cols, p.rows, p.sx, p.sy, p.ex, p.ey, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cols, rows, sx, sy, ex, ey, dx, dy, answer } = story

  const svgW = cols * CELL + PAD * 2
  const svgH = rows * CELL + PAD * 2

  const ariaLabel =
    lang === 'id'
      ? `Kisi ${cols} kolom kali ${rows} baris. Titik awal di kolom ${sx + 1} baris ${sy + 1}. Bendera di kolom ${ex + 1} baris ${ey + 1}. Jawaban: ${dx} + ${dy} = ${answer} langkah.`
      : `Grid ${cols} columns by ${rows} rows. Start at column ${sx + 1} row ${sy + 1}. Flag at column ${ex + 1} row ${ey + 1}. Answer: ${dx} + ${dy} = ${answer} steps.`

  // Build traced path waypoints up to the current token position.
  // The path follows the same route: horizontal first, then vertical.
  const hDir = ex > sx ? 1 : -1
  const vDir = ey > sy ? 1 : -1

  const pathPoints: { x: number; y: number }[] = [{ x: cx(sx), y: cy(sy) }]
  for (let i = 1; i <= dx; i++) {
    pathPoints.push({ x: cx(sx + hDir * i), y: cy(sy) })
  }
  for (let j = 1; j <= dy; j++) {
    pathPoints.push({ x: cx(ex), y: cy(sy + vDir * j) })
  }

  // How many segments to draw: one segment per completed move
  const segmentsToShow = Math.min(beat.stepsTaken, pathPoints.length - 1)
  const tracePoints = pathPoints.slice(0, segmentsToShow + 1)

  const polylinePoints = tracePoints.map((pt) => `${pt.x},${pt.y}`).join(' ')

  const isResult = beat.result
  const tokenFill = isResult ? GREEN : BLUE

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Grid SVG */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={Math.min(380, svgW * 1.4)}
          aria-hidden="true"
          style={{ overflow: 'visible' }}
        >
          {/* Grid cells */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={PAD + c * CELL}
                y={PAD + r * CELL}
                width={CELL}
                height={CELL}
                fill={FILL}
                stroke={STROKE}
                strokeWidth={1.2}
              />
            )),
          )}

          {/* Traced path polyline (orange) */}
          {segmentsToShow > 0 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={ORANGE}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* Start marker: filled blue circle */}
          <circle cx={cx(sx)} cy={cy(sy)} r={10} fill={BLUE} opacity={0.25} />
          <circle cx={cx(sx)} cy={cy(sy)} r={6} fill={BLUE} />

          {/* Target (flag): pole + triangle, orange */}
          <line
            x1={cx(ex) - 7}
            y1={cy(ey) - 11}
            x2={cx(ex) - 7}
            y2={cy(ey) + 11}
            stroke={ORANGE}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <polygon
            points={`${cx(ex) - 7},${cy(ey) - 11} ${cx(ex) + 9},${cy(ey) - 5} ${cx(ex) - 7},${cy(ey) + 1}`}
            fill={ORANGE}
          />

          {/* Animated token (moves along the path) */}
          <motion.circle
            cx={cx(beat.tokenX)}
            cy={cy(beat.tokenY)}
            r={11}
            fill={tokenFill}
            animate={{
              cx: cx(beat.tokenX),
              cy: cy(beat.tokenY),
              fill: tokenFill,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          />

          {/* Step counter inside the token */}
          <motion.text
            x={cx(beat.tokenX)}
            y={cy(beat.tokenY)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            fill="#ffffff"
            fontFamily="Nunito, sans-serif"
            animate={{ x: cx(beat.tokenX), y: cy(beat.tokenY) }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {beat.stepsTaken}
          </motion.text>
        </svg>

        {/* Step counter label */}
        <div className="text-xs font-bold" style={{ color: '#30598A' }}>
          {lang === 'id' ? `Langkah: ${beat.stepsTaken}` : `Steps: ${beat.stepsTaken}`}
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
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
