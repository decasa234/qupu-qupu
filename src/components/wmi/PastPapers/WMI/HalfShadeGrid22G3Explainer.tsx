import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShadeGrid } from './HalfShadeGrid22G3Illustration'
import { buildHalfShade22G3Steps } from './halfShade22G3Steps'

// WMI-22F3A Q8 — Half-painted grid explainer.
//
// Strategy: sum the painted area of the 8 fixed cells one region at a time,
// compute the target (9 ÷ 2 = 4.5), find the gap, then eliminate wrong
// options before landing on the full-square answer A.

const GREEN = '#10B981'
const PURPLE_BORDER = '#7c6fb0'
const HIGHLIGHT = '#fde68a' // amber-200 — used as a cell-ring highlight

// ---------------------------------------------------------------------------
// HighlightOverlay — draws amber rings over specific cells in the 3×3 grid
// ---------------------------------------------------------------------------

const CELL = 46
const STROKE = 1.8
const GRID_W = 3 * CELL + STROKE
const GRID_H = 3 * CELL + STROKE

interface HighlightOverlayProps {
  cells: [number, number][]
}

function HighlightOverlay({ cells }: HighlightOverlayProps) {
  if (cells.length === 0) return null
  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width={GRID_W}
      height={GRID_H}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {cells.map(([r, c]) => (
        <rect
          key={`${r}-${c}`}
          x={c * CELL + STROKE / 2 + 2}
          y={r * CELL + STROKE / 2 + 2}
          width={CELL - 4}
          height={CELL - 4}
          fill="none"
          stroke={HIGHLIGHT}
          strokeWidth={3}
          rx={3}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// RunningTotalBadge
// ---------------------------------------------------------------------------

interface TotalBadgeProps {
  total: number
  label: string
}

function RunningTotalBadge({ total, label }: TotalBadgeProps) {
  return (
    <motion.div
      key={total}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#ede9fe',
        border: `2px solid ${PURPLE_BORDER}`,
        borderRadius: 10,
        padding: '4px 14px',
        fontWeight: 800,
        fontSize: 15,
        color: '#4c1d95',
        minWidth: 90,
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', opacity: 0.8 }}>
        {label}
      </span>
      <span>{total}</span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function HalfShadeGrid22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildHalfShade22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Step-by-step solution: sum the shaded areas of the 8 fixed cells to get 3.5, then find that the missing cell must contribute 4.5 − 3.5 = 1.0, a full square. Only option A satisfies this.',
    'Solusi langkah demi langkah: jumlahkan area yang diarsir dari 8 petak tetap hasilnya 3,5, lalu temukan bahwa petak yang hilang harus menyumbang 4,5 − 3,5 = 1,0, yaitu petak penuh. Hanya pilihan A yang memenuhi.',
  )

  const totalLabel = t('total', 'total')
  const showTotal = beat.runningTotal >= 0

  return (
    <div
      className="mx-auto w-full max-w-[300px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Grid with highlight overlay */}
        <div style={{ position: 'relative', width: GRID_W, height: GRID_H }}>
          <motion.div
            key={beat.key}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <ShadeGrid grid={beat.grid} />
          </motion.div>
          <HighlightOverlay cells={beat.highlight} />
        </div>

        {/* Running total badge */}
        {showTotal && (
          <RunningTotalBadge total={beat.runningTotal} label={totalLabel} />
        )}

        {/* Caption */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
