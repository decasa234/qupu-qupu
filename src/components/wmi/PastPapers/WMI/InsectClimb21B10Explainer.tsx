import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  VW, VH, pt,
  PT_A, PT_B, PT_C,
  CLR,
} from './InsectClimb21B10Illustration'
import {
  buildInsectClimb21B10Steps,
  AB_PATHS,
  BC_PATHS,
} from './insectClimb21B10Steps'
import InsectClimb21B10Illustration from './InsectClimb21B10Illustration'

// SEAMO-21-B-Q10 — post-answer animated explainer.
// Reuses the static illustration as a backdrop, then overlays highlighted
// path segments beat-by-beat: first enumerates the 3 A→B paths, then the
// 3 B→C paths, then shows the 3 × 3 = 9 equation.

// ── palette ──────────────────────────────────────────────────────────────────
const PATH_COLORS = ['#f0853a', '#10B981', '#30598A'] as const  // orange, green, blue
const EQ_BG    = '#FFF2DF'
const EQ_BORDER = '#f0853a'
const EQ_TEXT  = '#30598A'
const WIN_BG   = '#D1FAE5'
const WIN_BORDER = '#10B981'
const WIN_TEXT = '#065F46'

// ── path polyline helper ──────────────────────────────────────────────────────
function PathLine({
  points,
  color,
  idx,
}: {
  points: Array<[number, number]>
  color: string
  idx: number
}) {
  const d = points
    .map(([c, r], i) => {
      const [x, y] = pt(c, r)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <motion.path
      key={`path-${idx}`}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.85 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    />
  )
}

// ── main explainer ────────────────────────────────────────────────────────────
export default function InsectClimb21B10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildInsectClimb21B10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.phase === 'result'

  const ariaLabel = t(
    'Animated solution: 3 paths A→B, 3 paths B→C, 3×3=9 total paths.',
    'Animasi solusi: 3 jalur A→B, 3 jalur B→C, 3×3=9 total jalur.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── figure + path overlays ────────────────────────────────── */}
        <div className="relative w-full" style={{ maxWidth: 380 }}>
          {/* base illustration */}
          <InsectClimb21B10Illustration />

          {/* path overlays — layered over the same viewBox */}
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            width="100%"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {/* A→B highlighted paths */}
            {beat.abPaths.map((i) => (
              <PathLine
                key={`ab-${i}`}
                points={AB_PATHS[i]}
                color={PATH_COLORS[i % 3]}
                idx={i}
              />
            ))}
            {/* B→C highlighted paths */}
            {beat.bcPaths.map((i) => (
              <PathLine
                key={`bc-${i}`}
                points={BC_PATHS[i]}
                color={PATH_COLORS[i % 3]}
                idx={i + 10}
              />
            ))}

            {/* A / B / C bold markers (always visible) */}
            {[
              { label: 'A', pt: PT_A, dx: -14, dy: 4, color: CLR.A_CLR },
              { label: 'B', pt: PT_B, dx:  14, dy: -2, color: CLR.B_CLR },
              { label: 'C', pt: PT_C, dx:  14, dy: -4, color: CLR.C_CLR },
            ].map(({ label, pt: [px, py], dx, dy, color }) => (
              <text
                key={label}
                x={px + dx} y={py + dy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={900}
                fill={color}
                stroke="white"
                strokeWidth={3}
                paintOrder="stroke"
                className="font-display"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>

        {/* ── equation / result panel ───────────────────────────────── */}
        {beat.showEquation && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            className="w-full rounded-xl border-2 px-4 py-2.5 text-center font-display text-base font-extrabold"
            style={
              isResult
                ? { background: WIN_BG, borderColor: WIN_BORDER, color: WIN_TEXT }
                : { background: EQ_BG, borderColor: EQ_BORDER, color: EQ_TEXT }
            }
          >
            {isResult
              ? t('3 × 3 = 9 ways ✓  →  Answer B', '3 × 3 = 9 cara ✓  →  Jawaban B')
              : t('A→B paths × B→C paths = 3 × 3 = 9', 'Jalur A→B × Jalur B→C = 3 × 3 = 9')}
          </motion.div>
        )}

        {/* ── caption ──────────────────────────────────────────────── */}
        <p className="text-center text-sm text-gray-600 leading-snug px-2">
          {beat.caption}
        </p>
      </div>
    </div>
  )
}
