// OSN-16-SD-PROV-Q14 — animated explainer for the road-map shortest-path count.
//
// Animation: 7 beats progressively reveal DP path-count bubbles at each
// intersection (right-or-up propagation), culminating in C = 36.
// Reuses RoadMapGrid + NODE_POS from the illustration.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  RoadMapGrid,
  NODE_POS,
  type NodeId,
} from './RoadMapOSN16PQ14Illustration'
import { buildRoadMapOSN16PQ14Steps } from './roadMapOSN16PQ14Steps'

const BLUE  = '#30598A'
const GREEN = '#10B981'
const INK   = '#1F2937'

export default function RoadMapOSN16PQ14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildRoadMapOSN16PQ14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const nodeIds = Object.keys(NODE_POS) as NodeId[]

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('DP: each junction = left + below', 'DP: setiap simpul = kiri + bawah')}
        </div>

        {/* Road map + path-count overlay */}
        <svg
          viewBox="-24 -24 248 248"
          width={248}
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <RoadMapGrid />

          {/* Fixed corner labels */}
          <text x={0} y={220} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK} className="font-display">A</text>
          <text x={108} y={108} textAnchor="start"  fontSize={14} fontWeight={700} fill={INK} className="font-display">B</text>
          <text x={200} y={-11} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK} className="font-display">C</text>

          {/* Path-count bubbles (conditionally rendered per beat) */}
          {nodeIds.map((id) => {
            const count = beat.labels[id]
            if (count == null) return null
            const pos = NODE_POS[id]
            const isFinal   = id === 'C' && beat.result
            const isHub     = id === 'A' || id === 'B' || id === 'C'
            const r         = count >= 10 ? 13 : 11
            return (
              <g key={id}>
                <circle
                  cx={pos.x} cy={pos.y} r={r}
                  fill={isFinal ? GREEN : isHub ? '#DBEAFE' : '#F0F9FF'}
                  stroke={isFinal ? '#059669' : BLUE}
                  strokeWidth={isFinal ? 2.5 : 1.5}
                />
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={count >= 10 ? 9 : 11} fontWeight={800}
                  fill={isFinal ? '#fff' : BLUE}
                  className="font-display"
                >
                  {count}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Equation chip */}
        <AnimatePresence mode="popLayout" initial={false}>
          {beat.equation && (
            <motion.div
              key={`eq-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="rounded-lg px-4 py-1 font-display text-sm font-bold"
              style={{ background: '#EFF6FF', color: BLUE }}
            >
              {beat.equation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Result chip */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.15 }}
            className="rounded-xl px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t('Shortest paths = 36', 'Lintasan terpendek = 36')}
          </motion.div>
        )}

      </div>
    </div>
  )
}
