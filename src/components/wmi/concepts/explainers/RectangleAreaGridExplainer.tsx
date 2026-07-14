import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildAreaGridSteps } from './areaGridSteps'
import { useBeatControl } from './useBeatControl'

interface GridParams {
  w: number
  h: number
}

const CELL = 36
const PAD = 6
const FILL = '#f6f1e7'   // qupu-shell
const STROKE = '#30598A' // qupu-brand-blue

export default function RectangleAreaGridExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as GridParams

  const story = useMemo(
    () => buildAreaGridSteps(p.w, p.h, lang),
    [p.w, p.h, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cols, rows } = story
  const svgW = cols * CELL + PAD * 2
  const svgH = rows * CELL + PAD * 2

  const ariaLabel =
    lang === 'id'
      ? `Kisi persegi panjang ${cols} kolom kali ${rows} baris, luas ${story.area} persegi satuan.`
      : `Rectangle grid ${cols} columns by ${rows} rows, area ${story.area} unit squares.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* SVG grid — reveals beat.rowsShown rows */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={Math.min(380, svgW * 1.5)}
          aria-hidden="true"
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const visible = r < beat.rowsShown
              if (!visible) return null
              return (
                <motion.rect
                  key={`${r}-${c}`}
                  x={PAD + c * CELL}
                  y={PAD + r * CELL}
                  width={CELL}
                  height={CELL}
                  fill={FILL}
                  stroke={STROKE}
                  strokeWidth={1.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 340,
                    damping: 26,
                    delay: c * 0.04,
                  }}
                />
              )
            }),
          )}
        </svg>

        {/* Caption strip */}
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
