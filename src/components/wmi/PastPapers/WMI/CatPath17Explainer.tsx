import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CatGlyph,
  MilkGlyph,
  SVG_W,
  SVG_H,
  GRID_N,
  GRID_X0,
  GRID_Y0,
  CELL_SIZE,
  GRID_PX,
  GRID_PY,
  COLOR,
  cellCentre,
} from './CatPath17Illustration'
import { buildCatPath17Steps, type Node } from './catPath17Steps'

// IKMC-19-PE-Q17 — post-answer animation.
//
// Reuses the grid layout constants and cat/milk glyphs from CatPath17Illustration.
// One new path is drawn per beat.  A running path-count badge is shown.
// On the result beat all 6 paths flash green.

const GREEN = '#10B981'
const BLUE = '#1D4ED8'

const FIG_W = Math.min(300, SVG_W)

// ── Node → pixel centre of the CELL (same as cellCentre) ─────────────────────
function nodeXY(col: number, row: number): [number, number] {
  return cellCentre(col, row)
}

// ── Path polyline ────────────────────────────────────────────────────────────

function PathTrail({ nodes, color, animate: doAnimate }: { nodes: Node[]; color: string; animate: boolean }) {
  const points = nodes.map(([c, r]) => nodeXY(c, r).join(',')).join(' ')

  return (
    <motion.polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={doAnimate ? 4 : 3}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={doAnimate ? 1 : 0.55}
      initial={doAnimate ? { pathLength: 0, opacity: 0 } : undefined}
      animate={doAnimate ? { pathLength: 1, opacity: 1 } : undefined}
      transition={doAnimate ? { duration: 0.55, ease: 'easeOut' } : undefined}
    />
  )
}

// ── Running counter badge ─────────────────────────────────────────────────────

function CountBadge({ count, color }: { count: number; color: string }) {
  const cx = GRID_X0 + GRID_PX + 54
  const cy = GRID_Y0 + GRID_PY / 2

  return (
    <g>
      <circle cx={cx} cy={cy} r={22} fill={color} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {count}
      </text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function CatPath17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCatPath17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ada 6 jalur dari sudut kiri atas ke sudut kanan bawah dengan hanya bergerak ke kanan atau ke bawah — jawaban E.'
      : 'Explainer: there are 6 paths from the top-left to the bottom-right corner moving only right or down — answer E.'

  // Track which is the "newest" (last) path for animation
  const newestIdx = beat.paths.length - 1

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* ── Grid cells ── */}
          {Array.from({ length: GRID_N }, (_, row) =>
            Array.from({ length: GRID_N }, (_, col) => (
              <rect
                key={`cell-${row}-${col}`}
                x={GRID_X0 + col * CELL_SIZE}
                y={GRID_Y0 + row * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={COLOR.GRID_FILL}
                stroke={COLOR.GRID_STROKE}
                strokeWidth={2}
              />
            ))
          )}

          {/* ── Previously drawn paths (faded) ── */}
          {beat.paths.slice(0, -1).map(({ nodes, color }, i) => (
            <PathTrail key={`prev-${i}`} nodes={nodes} color={color} animate={false} />
          ))}

          {/* ── Newest path (animated in) ── */}
          {beat.paths.length > 0 && (
            <AnimatePresence>
              <motion.g key={`path-${newestIdx}`}>
                <PathTrail
                  nodes={beat.paths[newestIdx].nodes}
                  color={beat.paths[newestIdx].color}
                  animate={!isResult}
                />
              </motion.g>
            </AnimatePresence>
          )}

          {/* Cat glyph (always on top) */}
          {(() => {
            const [cx, cy] = cellCentre(0, 0)
            return <CatGlyph cx={cx} cy={cy} r={17} />
          })()}

          {/* Milk glyph (always on top) */}
          {(() => {
            const [cx, cy] = cellCentre(2, 2)
            return <MilkGlyph cx={cx} cy={cy} />
          })()}

          {/* Running counter badge */}
          {beat.count > 0 && (
            <AnimatePresence mode="wait">
              <motion.g
                key={beat.count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              >
                <CountBadge count={beat.count} color={isResult ? GREEN : BLUE} />
              </motion.g>
            </AnimatePresence>
          )}
        </svg>

        {/* equation row */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
