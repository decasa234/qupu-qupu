// SIMOC-19-G3-Q6 — post-answer explainer: which net cannot fold into a cube?
//
// Teaching walk (one idea per beat):
//   Beat 0 — intro: a cube has 6 faces; the net needs 6 squares without overlap.
//   Beat 1 — A and B fold fine.
//   Beat 2 — C: two squares map to the same face → invalid (highlighted in red).
//   Beat 3 — D folds fine.
//   Beat 4 — result: answer C.
//
// Renders each net as a Polyomino; highlights the active net; marks C in red.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Polyomino } from './primitives/Polyomino'
import { buildCubeNetsSIMOC19G3Q6Steps } from './cubeNetsSIMOC19G3Q6Steps'

// ---------------------------------------------------------------------------
// Net cell data
// ---------------------------------------------------------------------------

const NET_CELLS: Record<string, [number, number][]> = {
  A: [[0,1],[1,0],[1,1],[2,0],[2,1],[3,1]],
  B: [[0,1],[1,0],[1,1],[1,2],[2,1],[3,1]],
  C: [[0,1],[1,0],[1,1],[1,2],[2,2],[3,2]],
  D: [[0,2],[1,1],[1,2],[2,0],[2,1],[3,0]],
}

const LABELS = ['A', 'B', 'C', 'D'] as const

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------

const BLUE_FILL   = '#D6EBF7'
const BLUE_STROKE = '#30598A'
const RED_FILL    = '#FEE2E2'
const RED_STROKE  = '#DC2626'
const DIM_FILL    = '#F3F4F6'
const DIM_STROKE  = '#9CA3AF'
const GREEN_BG    = '#D1FAE5'
const GREEN_TEXT  = '#065F46'
const RED_BG      = '#FEE2E2'
const RED_TEXT    = '#991B1B'
const INK         = '#1F2937'

// ---------------------------------------------------------------------------
// NetPanel — renders one net with active/invalid/dim styling
// ---------------------------------------------------------------------------

interface NetPanelProps {
  label: string
  active: boolean
  invalid: boolean
  dim: boolean
}

function NetPanel({ label, active, invalid, dim }: NetPanelProps) {
  const cells = NET_CELLS[label]
  const fill   = dim ? DIM_FILL   : invalid ? RED_FILL   : BLUE_FILL
  const stroke = dim ? DIM_STROKE : invalid ? RED_STROKE : BLUE_STROKE
  const labelColor = dim ? '#9CA3AF' : invalid ? RED_TEXT : BLUE_STROKE

  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1, opacity: dim ? 0.45 : 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      <Polyomino cells={cells} cellSize={24} fill={fill} stroke={stroke} strokeWidth={2} showGrid />
      <span style={{ fontSize: 13, fontWeight: 700, color: labelColor }}>{label}</span>
      {invalid && active && (
        <span style={{ fontSize: 11, fontWeight: 600, color: RED_TEXT, background: RED_BG, borderRadius: 4, padding: '1px 6px' }}>
          ✗
        </span>
      )}
      {!invalid && active && !dim && (
        <span style={{ fontSize: 11, fontWeight: 600, color: GREEN_TEXT, background: GREEN_BG, borderRadius: 4, padding: '1px 6px' }}>
          ✓
        </span>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Explainer
// ---------------------------------------------------------------------------

export default function CubeNetsSIMOC19G3Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCubeNetsSIMOC19G3Q6Steps(lang), [lang])
  const index  = useBeatControl(story.finalIndex, props)
  const beat   = story.steps[index] ?? story.steps[story.finalIndex]

  // Determine dim/active/invalid state for each net
  function netState(label: string) {
    const isActive  = beat.activeNet === label
    const isInvalid = isActive && beat.invalid
    let dim = false
    if (beat.phase === 'checkAB') dim = label === 'C' || label === 'D'
    if (beat.phase === 'checkC')  dim = label !== 'C'
    if (beat.phase === 'checkD')  dim = label !== 'D'
    if (beat.phase === 'result')  dim = label !== 'C'
    return { active: isActive, invalid: isInvalid, dim }
  }

  const isResult = beat.result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 8px' }}>
      {/* Four nets */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        {LABELS.map((lbl) => (
          <NetPanel key={lbl} label={lbl} {...netState(lbl)} />
        ))}
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          style={{
            background: isResult ? GREEN_BG : '#EFF6FF',
            border: `1.5px solid ${isResult ? '#34D399' : '#BFDBFE'}`,
            borderRadius: 10,
            padding: '10px 14px',
            maxWidth: 320,
            textAlign: 'center',
            color: isResult ? GREEN_TEXT : INK,
            fontSize: 14,
            fontWeight: isResult ? 700 : 400,
            lineHeight: 1.45,
          }}
        >
          {beat.caption}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
