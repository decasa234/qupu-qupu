import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildComposedAreaSteps } from './composedAreaSteps'
import { useBeatControl } from './useBeatControl'

const CELL = 28
const PAD = 4
const BLUE_FILL = '#BFDBFE'
const BLUE_STROKE = '#30598A'
const RED_FILL = '#FECACA'
const RED_STROKE = '#DC2626'

interface LParams {
  W: number
  H: number
  cw: number
  ch: number
}

export default function PerimeterAreaComposedExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as LParams

  const story = useMemo(
    () => buildComposedAreaSteps(p.W, p.H, p.cw, p.ch, lang),
    [p.W, p.H, p.cw, p.ch, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { W, H, cw, ch } = story
  const svgW = W * CELL + PAD * 2
  const svgH = H * CELL + PAD * 2

  const ariaLabel =
    lang === 'id'
      ? `Bangun bentuk L: persegi panjang ${W}×${H} dengan sudut ${cw}×${ch} dipotong. Luas = ${story.result}`
      : `L-shape: ${W}×${H} rectangle with ${cw}×${ch} corner cut out. Area = ${story.result}`

  // Build cell list: each cell is either kept, or part of the cut-out corner.
  // The cut-out is the top-right cw × ch corner (same convention as the illustration).
  const cells: { r: number; c: number; isCut: boolean }[] = []
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const isCut = c >= W - cw && r < ch
      cells.push({ r, c, isCut })
    }
  }

  // Scale SVG to fit inside max-w-[27.5rem] — CELL=28 + PAD keeps most grids < 240px wide
  // so we let the svg's own size determine layout.

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Grid */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          style={{ display: 'block' }}
        >
          {cells.map(({ r, c, isCut }) => {
            const x = PAD + c * CELL
            const y = PAD + r * CELL

            if (isCut) {
              // Beat 0: nothing shown (full rectangle without the cut hole rendered = just show the L).
              // When showFull but not showCut: show the full rectangle, including this cell as blue.
              // When showCut: animate this cell to red / faded-out to illustrate removal.
              if (!beat.showFull) return null

              if (!beat.showCut) {
                // Beat 0: show as blue (full rectangle)
                return (
                  <rect
                    key={`cut-${r}-${c}`}
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    fill={BLUE_FILL}
                    stroke={BLUE_STROKE}
                    strokeWidth={1.5}
                  />
                )
              }

              // Beat 1+: animate to red
              const delay = (r * cw + (c - (W - cw))) * 0.04
              return (
                <motion.rect
                  key={`cut-${r}-${c}`}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  stroke={RED_STROKE}
                  strokeWidth={1.5}
                  initial={{ fill: BLUE_FILL }}
                  animate={{ fill: RED_FILL }}
                  transition={{ duration: 0.35, delay }}
                />
              )
            }

            // Kept cell
            if (!beat.showFull) return null
            return (
              <rect
                key={`keep-${r}-${c}`}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill={BLUE_FILL}
                stroke={BLUE_STROKE}
                strokeWidth={1.5}
              />
            )
          })}
        </svg>

        {/* Caption strip */}
        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
