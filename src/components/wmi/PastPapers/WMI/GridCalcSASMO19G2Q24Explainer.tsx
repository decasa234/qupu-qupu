// SASMO-19-G2-Q24 — post-answer animated explainer.
//
// Reuses GridPanel, layout constants, and cell data from the illustration.
// Animation beats: intro → row-rule → col-rule → result (? = 8).
//
// SSR rendering: framer-motion is safe in SSR — it renders the `animate` state
// immediately without a layout effect on the server.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL, GAP, PANEL_DIM,
  cellX, cellY,
  GridPanel,
  P2_X, P3_X, PY,
  SVG_W, SVG_H,
  EXAMPLE_CELLS,
  PUZZLE_CELLS,
  SOLVED_P3_CELLS,
} from './GridCalcSASMO19G2Q24Illustration'
import { buildGridCalcSASMO19G2Q24Steps } from './gridCalcSASMO19G2Q24Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const AMBER  = '#f59e0b'
const GREEN  = '#10b981'
const BLUE   = '#1d4ed8'
const CAPTION_NORMAL = { background: '#eff6ff', borderColor: BLUE,  color: '#1e3a8a' }
const CAPTION_RESULT = { background: '#d1fae5', borderColor: GREEN, color: '#065f46' }

// ── highlight overlay (amber or green cell ring) ──────────────────────────────

interface HlCellProps {
  ox: number; oy: number
  r: number;  c: number
  color: string
}

function HlCell({ ox, oy, r, c, color }: HlCellProps) {
  return (
    <motion.rect
      x={ox + cellX(c)} y={oy + cellY(r)}
      width={CELL} height={CELL} rx={4}
      fill={color} fillOpacity={0.25}
      stroke={color} strokeWidth={2.5}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    />
  )
}

// ── explainer ─────────────────────────────────────────────────────────────────

export default function GridCalcSASMO19G2Q24Explainer(props: ExplainerProps) {
  const lang   = (props.lang ?? 'id') as 'en' | 'id'
  const story  = useMemo(() => buildGridCalcSASMO19G2Q24Steps(lang), [lang])
  const index  = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result ? CAPTION_RESULT : CAPTION_NORMAL

  // Pic 3 cells: show deduced values on the result beat
  const p3Cells = beat.showDeduced
    ? (SOLVED_P3_CELLS as (string | null)[][])
    : PUZZLE_CELLS

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan SASMO 2019 G2 Q24: ? = 1 × 8 = 8'
          : 'Explainer SASMO 2019 G2 Q24: ? = 1 × 8 = 8'
      }
    >
      <div className="flex flex-col items-center gap-3">

        {/* ── figure ── */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* panel labels */}
          <text
            x={P2_X + PANEL_DIM / 2} y={13}
            textAnchor="middle" fontSize={10} fontWeight="700"
            fill="#6b7280" fontFamily="system-ui,sans-serif"
          >
            GAMBAR 2
          </text>
          <text
            x={P3_X + PANEL_DIM / 2} y={13}
            textAnchor="middle" fontSize={10} fontWeight="700"
            fill="#6b7280" fontFamily="system-ui,sans-serif"
          >
            GAMBAR 3
          </text>

          {/* divider */}
          <line
            x1={P2_X + PANEL_DIM + (P3_X - P2_X - PANEL_DIM) / 2} y1={6}
            x2={P2_X + PANEL_DIM + (P3_X - P2_X - PANEL_DIM) / 2} y2={SVG_H - 6}
            stroke="#e5e7eb" strokeWidth={1}
          />

          {/* ── Picture 2 (example) ── */}
          <GridPanel ox={P2_X} oy={PY} cells={EXAMPLE_CELLS} />

          {/* amber highlights on Pic 2 example cells */}
          <AnimatePresence>
            {beat.hlExample.map(([r, c]) => (
              <HlCell
                key={`hl2-${r}-${c}`}
                ox={P2_X} oy={PY}
                r={r} c={c}
                color={AMBER}
              />
            ))}
          </AnimatePresence>

          {/* ── Picture 3 (puzzle / solved) ── */}
          <GridPanel ox={P3_X} oy={PY} cells={p3Cells} />

          {/* green highlight on answer cell [2,1] in Pic 3 */}
          <AnimatePresence>
            {beat.hlAnswer && (
              <HlCell
                key="hl3-ans"
                ox={P3_X} oy={PY}
                r={2} c={1}
                color={GREEN}
              />
            )}
          </AnimatePresence>

          {/* answer label overlay when solved */}
          <AnimatePresence>
            {beat.hlAnswer && (
              <motion.text
                key="ans-label"
                x={P3_X + cellX(1) + CELL / 2}
                y={PY + cellY(2) + CELL / 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={18} fontWeight="bold"
                fill="#065f46"
                fontFamily="system-ui,sans-serif"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
              >
                8
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* ── equation pill ── */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation && (
              <motion.span
                key={beat.equation}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-full px-4 py-1 text-sm font-black tabular-nums text-white"
                style={{ background: beat.result ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── caption ── */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
