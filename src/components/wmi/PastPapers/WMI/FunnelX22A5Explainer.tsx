// SEAMOX-22-A-Q5 — animated path-count explainer for the marble funnel.
// Drives useBeatControl through funnelX22A5Steps, revealing the junction path
// counts one level at a time. Active channels are drawn highlighted in orange.
// Reuses VW/VH/NODES/EDGES/colour constants from the illustration so the
// animated diagram shares the exact same geometry.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  VW, VH, NR,
  NODES, EDGES,
  WALL_COLOR, WALL_W,
  NODE_FILL, NODE_STROKE,
  MARBLE_FILL, ARROW_COLOR,
} from './FunnelX22A5Illustration'
import { buildFunnelSteps } from './funnelX22A5Steps'
import type { NodeId } from './FunnelX22A5Illustration'

export default function FunnelX22A5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const { beats, finalIndex } = useMemo(() => buildFunnelSteps(lang), [lang])
  const index = useBeatControl(finalIndex, { ...props, holds: beats.map((b) => b.hold) })
  const beat = beats[index] ?? beats[finalIndex]

  const edgeSet = new Set(beat.activeEdgeKeys)

  const captionStyle = beat.verdict
    ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
    : { background: '#E1EFFB', borderColor: '#30598A', color: '#1E3A5F' }

  const aria =
    lang === 'id'
      ? 'Hitung jalur level per level: T=1, C=3, LL=4, LR=4, pintu keluar=11.'
      : 'Count paths level by level: T=1, C=3, LL=4, LR=4, exit=11.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Animated funnel SVG ───────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="exfx22a5-arrow"
              markerWidth={8} markerHeight={8}
              refX={6} refY={3}
              orient="auto"
            >
              <path d="M0,0 L0,6 L7,3 Z" fill={ARROW_COLOR} />
            </marker>
          </defs>

          {/* Marble */}
          <circle cx={NODES.T.x} cy={NODES.T.y - 33} r={15} fill={MARBLE_FILL} />

          {/* Entry arrow */}
          <line
            x1={NODES.T.x} y1={NODES.T.y - 17}
            x2={NODES.T.x} y2={NODES.T.y - NR - 3}
            stroke={ARROW_COLOR}
            strokeWidth={2.5}
            markerEnd="url(#exfx22a5-arrow)"
          />

          {/* Channels */}
          {EDGES.map(([a, b]) => {
            const na = NODES[a]
            const nb = NODES[b]
            const key = `${a}-${b}`
            const active = edgeSet.has(key)
            return (
              <line
                key={key}
                x1={na.x} y1={na.y}
                x2={nb.x} y2={nb.y}
                stroke={active ? NODE_STROKE : WALL_COLOR}
                strokeWidth={active ? 5.5 : WALL_W}
                strokeLinecap="round"
              />
            )
          })}

          {/* Junction nodes with animated count labels */}
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const { x, y } = NODES[id]
            const fill = beat.nodeColors[id] ?? NODE_FILL
            const cnt = beat.counts[id]
            return (
              <g key={id}>
                <circle
                  cx={x} cy={y} r={NR}
                  fill={fill}
                  stroke={NODE_STROKE}
                  strokeWidth={2}
                />
                {cnt != null && (
                  <motion.g
                    key={`${id}-${cnt}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <text
                      x={x} y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={10}
                      fontWeight={900}
                      fill="#1F2937"
                      className="font-display"
                    >
                      {cnt}
                    </text>
                  </motion.g>
                )}
              </g>
            )
          })}

          {/* Exit arrow */}
          <line
            x1={NODES.B.x} y1={NODES.B.y + NR + 3}
            x2={NODES.B.x} y2={NODES.B.y + 30}
            stroke={ARROW_COLOR}
            strokeWidth={2.5}
            markerEnd="url(#exfx22a5-arrow)"
          />
        </svg>

        {/* ── Caption ───────────────────────────────────────────────────── */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
