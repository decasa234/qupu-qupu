// HKIMO-19-P1H-Q5 — post-answer animated explainer.
//
// Reuses the illustration's cell layout (groupX, groupCells, CS, SVG_W, SVG_H)
// and drives 5 beats via useBeatControl:
//   0. intro   — static scene.
//   1. count   — all cells lit blue; equation "1 · 3 · 6 · 10 · …"
//   2. formula — T(n) = n×(n+1)÷2 shown; cells dimmed.
//   3. apply   — T(10) = 10×11÷2 = 55; cells dimmed.
//   4. result  — equation "= 55" in green.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import TriangleGroupsHK19P1Q5Illustration, {
  CS,
  SVG_W,
  SVG_H,
  groupX,
  groupCells,
} from './TriangleGroupsHK19P1Q5Illustration'
import { buildTriangleGroupsHK19P1Q5Steps } from './triangleGroupsHK19P1Q5Steps'

// ── Colour tokens ──────────────────────────────────────────────────────────────
const BLUE   = '#3B82F6'
const AMBER  = '#D97706'
const GREEN  = '#10B981'
const SLATE  = '#64748B'
const INK    = '#1E293B'

/** Count badge rendered inside the SVG on beat 1 (shows T(n) for each group). */
function CountBadges() {
  return (
    <>
      {([1, 2, 3, 4] as const).map((n) => {
        const count = (n * (n + 1)) / 2
        // Position below the group's own bottom row, above the label area
        const cx = groupX(n - 1) + (n * CS) / 2
        const cy = 16 + n * CS + 4 + 9  // PAD_V + n rows + gap + badge radius
        return (
          <g key={n}>
            <circle cx={cx} cy={cy} r={9} fill={BLUE} />
            <text
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight="bold"
              fill="#fff"
            >
              {count}
            </text>
          </g>
        )
      })}
    </>
  )
}

// ── Equation strip ─────────────────────────────────────────────────────────────

function EqStrip({ eq, color }: { eq: string; color: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={eq}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.35 }}
        style={{
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
          color,
          fontFamily: 'monospace',
          marginTop: 6,
          minHeight: 24,
        }}
      >
        {eq}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Explainer ──────────────────────────────────────────────────────────────────

export default function TriangleGroupsHK19P1Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const sb = useMemo(
    () => buildTriangleGroupsHK19P1Q5Steps((lang ?? 'en') as 'en' | 'id'),
    [lang],
  )

  const beat = useBeatControl(sb.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: sb.beats.map((b) => b.hold),
  })

  const current = sb.beats[beat]

  // Derive active group for cell highlighting
  const activeGroup: number =
    current.phase === 'count' ? -1    // all lit
    : 0                                // none lit

  // Equation strip colour
  const eqColor =
    current.phase === 'result' ? GREEN
    : current.phase === 'formula' ? AMBER
    : current.phase === 'apply' ? AMBER
    : SLATE

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Shared SVG — redrawn with active group highlight */}
      <TriangleGroupsHK19P1Q5Illustration lang={lang as 'en' | 'id'} activeGroup={activeGroup} />

      {/* Count badges overlay (beat 1 only) */}
      {current.phase === 'count' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: 'absolute', pointerEvents: 'none' }}
        >
          {/* Rendered via separate SVG overlaid on the same layout */}
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            height={SVG_H}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <CountBadges />
          </svg>
        </motion.div>
      )}

      {/* Equation strip */}
      {current.equation && <EqStrip eq={current.equation} color={eqColor} />}

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={current.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: current.result ? GREEN : INK,
            margin: '2px 8px 0',
            fontWeight: current.result ? 700 : 400,
          }}
        >
          {current.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
