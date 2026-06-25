import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ColumnAddPrimitive,
  SVG_W,
  SVG_H,
  COL_T,
  COL_U,
  COL_H,
  ROW1_Y,
  ROW2_Y,
  ROW3_Y,
  LINE_Y,
  COLOR,
} from './ColumnAddHK24P2Q10Illustration'
import { buildColumnAddHK24P2Q10Steps } from './columnAddHK24P2Q10Steps'

// HKIMO-24-P2H-Q10 — post-answer animation.
// Reuses ColumnAddPrimitive from the illustration.
//
// Beats:
//   0. intro    — static grid; problem statement.
//   1. expand   — highlight variable cells; show AB + BA = 11(A+B).
//   2. equation — A+B = 15.
//   3. maximize — A ≥ 1, A ≠ B, minimize A.
//   4. result   — A=6, B=9, 69+96=165 ✓.

const GREEN = '#10B981'
const BLUE = '#30598A'
const AMBER = '#D97706'

const FIG_W = Math.min(280, SVG_W)

// ── highlight ring around a cell ─────────────────────────────────────────────

function CellRing({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <motion.rect
      x={cx - 18} y={cy - 26}
      width={36} height={34}
      rx={6}
      fill={color + '22'}
      stroke={color}
      strokeWidth={2}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )
}

// ── solution overlay (beat 4) ─────────────────────────────────────────────────

function SolutionOverlay() {
  const font = 'ui-monospace, SFMono-Regular, Menlo, monospace'
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Replace A→6 tens col */}
      <rect x={COL_T - 18} y={ROW1_Y - 26} width={36} height={34} rx={6} fill="#D1FAE5" stroke={GREEN} strokeWidth={2} />
      <text x={COL_T} y={ROW1_Y} textAnchor="middle" dominantBaseline="auto"
        fontSize={26} fontWeight={700} fontFamily={font} fill={GREEN}>6</text>

      {/* Replace B→9 units col row1 */}
      <rect x={COL_U - 18} y={ROW1_Y - 26} width={36} height={34} rx={6} fill="#D1FAE5" stroke={GREEN} strokeWidth={2} />
      <text x={COL_U} y={ROW1_Y} textAnchor="middle" dominantBaseline="auto"
        fontSize={26} fontWeight={700} fontFamily={font} fill={GREEN}>9</text>

      {/* Replace B→9 tens col row2 */}
      <rect x={COL_T - 18} y={ROW2_Y - 26} width={36} height={34} rx={6} fill="#D1FAE5" stroke={GREEN} strokeWidth={2} />
      <text x={COL_T} y={ROW2_Y} textAnchor="middle" dominantBaseline="auto"
        fontSize={26} fontWeight={700} fontFamily={font} fill={GREEN}>9</text>

      {/* Replace A→6 units col row2 */}
      <rect x={COL_U - 18} y={ROW2_Y - 26} width={36} height={34} rx={6} fill="#D1FAE5" stroke={GREEN} strokeWidth={2} />
      <text x={COL_U} y={ROW2_Y} textAnchor="middle" dominantBaseline="auto"
        fontSize={26} fontWeight={700} fontFamily={font} fill={GREEN}>6</text>
    </motion.g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function ColumnAddHK24P2Q10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildColumnAddHK24P2Q10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: AB + BA = 11(A+B) = 165, sehingga A+B = 15. Minimalkan A (A≥1, A≠B): A=6, B=9. Periksa: 69+96=165. Nilai maksimum B = 9.'
      : 'Explainer: AB + BA = 11(A+B) = 165, so A+B = 15. Minimise A (A≥1, A≠B): A=6, B=9. Check: 69+96=165. Maximum B = 9.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
        >
          {/* base column addition */}
          <ColumnAddPrimitive />

          {/* variable highlight rings (beats 1–3) */}
          <AnimatePresence>
            {beat.highlightVars && (
              <g key="var-rings">
                <CellRing cx={COL_T} cy={ROW1_Y} color={BLUE} />
                <CellRing cx={COL_U} cy={ROW1_Y} color={AMBER} />
                <CellRing cx={COL_T} cy={ROW2_Y} color={AMBER} />
                <CellRing cx={COL_U} cy={ROW2_Y} color={BLUE} />
              </g>
            )}
          </AnimatePresence>

          {/* solution overlay (beat 4) */}
          <AnimatePresence>
            {beat.showSolution && <SolutionOverlay key="solution" />}
          </AnimatePresence>

          {/* equation below the separator (beats 1–3) */}
          <AnimatePresence>
            {beat.equation !== '' && !beat.showSolution && (
              <motion.text
                key={beat.equation}
                x={SVG_W / 2}
                y={SVG_H - 10}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={10}
                fontWeight={700}
                fill={isResult ? GREEN : BLUE}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0, y: SVG_H }}
                animate={{ opacity: 1, y: SVG_H - 10 }}
                exit={{ opacity: 0 }}
              >
                {beat.equation}
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* equation strip (result beat) */}
        <AnimatePresence>
          {isResult && (
            <motion.div
              key="eq-strip"
              className="rounded-lg border-2 px-4 py-2 text-center text-sm font-extrabold tracking-wide"
              style={{ borderColor: GREEN, background: '#D1FAE5', color: '#065F46' }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {beat.equation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2.5 text-center text-sm font-semibold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
