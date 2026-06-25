// HKIMO-23-P1SF-Q20 — animated explainer.
//
// Reveals all 10 line segments one-by-one in distinct colours,
// with a running count badge, landing on the answer = 10.
// Imports graph data from the illustration (anti-drift).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NODES, EDGES, SVG_W, SVG_H } from './SegGraphHK23P1SFQ20Illustration'
import { buildSegGraphHK23P1SFQ20Steps } from './segGraphHK23P1SFQ20Steps'
import type { Lang } from './segGraphHK23P1SFQ20Steps'

// ── palette ───────────────────────────────────────────────────────────────────

const SEG_COLORS = [
  '#3B82F6', // 1
  '#8B5CF6', // 2
  '#EC4899', // 3
  '#F97316', // 4
  '#10B981', // 5
  '#EF4444', // 6
  '#F59E0B', // 7
  '#06B6D4', // 8
  '#84CC16', // 9
  '#A855F7', // 10
]

const NODE_R      = 9
const BASE_EDGE   = '#D1D5DB'
const ACTIVE_NODE = '#1F2937'

// ── helpers ───────────────────────────────────────────────────────────────────

function nodePos(id: string) {
  return NODES.find(n => n.id === id)!
}

// ── sub-component ─────────────────────────────────────────────────────────────

function SegLine({
  a, b, color, index,
}: { a: string; b: string; color: string; index: number }) {
  const na = nodePos(a)
  const nb = nodePos(b)
  const mx = (na.x + nb.x) / 2
  const my = (na.y + nb.y) / 2

  return (
    <motion.g
      key={`seg-${index}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <line
        x1={na.x} y1={na.y}
        x2={nb.x} y2={nb.y}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={mx} cy={my} r={11} fill={color} />
      <text
        x={mx} y={my}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight="bold"
        fill="#fff"
      >
        {index}
      </text>
    </motion.g>
  )
}

// ── Explainer ─────────────────────────────────────────────────────────────────

export default function SegGraphHK23P1SFQ20Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const steps = useMemo(
    () => buildSegGraphHK23P1SFQ20Steps(lang as Lang),
    [lang],
  )
  const finalIndex = steps.length - 1
  const holds = useMemo(() => steps.map(s => s.hold || 1600), [steps])

  const beat = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds,
  })

  const current = steps[beat] ?? steps[0]
  const { highlightSeg, count, caption, result } = current

  // 0 = none; 1–10 = up to that segment; 11 = all
  const activeSegs: number[] = highlightSeg === 0
    ? []
    : highlightSeg === 11
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      : Array.from({ length: highlightSeg }, (_, i) => i + 1)

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base edges (dim) */}
        {EDGES.map((e, i) => {
          const na = nodePos(e.a)
          const nb = nodePos(e.b)
          return (
            <line
              key={`base-${i}`}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke={BASE_EDGE}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )
        })}

        {/* Highlighted segments (colour overlay) */}
        <AnimatePresence>
          {activeSegs.map(n => {
            const e = EDGES[n - 1]
            return (
              <SegLine
                key={`seg-${n}`}
                a={e.a}
                b={e.b}
                color={SEG_COLORS[n - 1]}
                index={n}
              />
            )
          })}
        </AnimatePresence>

        {/* Nodes (always on top) */}
        {NODES.map(n => (
          <circle
            key={n.id}
            cx={n.x} cy={n.y}
            r={NODE_R}
            fill={ACTIVE_NODE}
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {/* Count badge */}
      <AnimatePresence mode="wait">
        {count > 0 && (
          <motion.div
            key={count}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm"
          >
            <span>{lang === 'id' ? 'Jumlah:' : 'Count:'}</span>
            <span className="text-lg">{count}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={[
            'text-center text-sm max-w-[280px] leading-snug',
            result ? 'font-bold text-green-700' : 'text-gray-600',
          ].join(' ')}
        >
          {caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
