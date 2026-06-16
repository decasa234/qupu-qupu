import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PencilRuler20, PENCIL_GEOM } from './P20G2Q7Illustration'
import { buildP20G2Q7Steps } from './p20G2Q7Steps'

// WMI-20P2A-Q7 — post-answer animation for the "pencil on a ruler" question.
// We reuse the built PencilRuler20 primitive (with showMeasure) so the scene
// reads as the static figure coming alive, then overlay — in the SAME coordinate
// box (PENCIL_GEOM) — the per-end markers, a trap "✕" on mark 14, and the
// subtraction, walking the method one idea per beat instead of asserting 6.

const GREEN = '#10B981' // result accent (echoes fill-qupu-green)
const RED = '#DC2626' // trap / rejection
const BLUE = '#30598A' // neutral step accent
const ACCENT = '#f0853a' // the primitive's measurement colour (fill-qupu-brand-orange)

const { WIDTH, HEIGHT, TOP, RULER_TOP, ERASER_X, TIP_X } = PENCIL_GEOM
const FIG_W = Math.min(320, WIDTH)

export default function P20G2Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G2Q7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: panjang pensil adalah selisih kedua ujung, ${story.tipMark} − ${story.eraserMark} = ${story.answer} cm — pensil tidak mulai dari nol.`
      : `Explainer: the pencil's length is the gap between its ends, ${story.tipMark} − ${story.eraserMark} = ${story.answer} cm — it doesn't start at zero.`

  // Per-beat end markers drawn over the primitive (the primitive's own
  // showMeasure draws BOTH dots + the bracket; we layer single-end highlights so
  // the eraser beat and tip beat can each light up alone).
  const ends: { x: number; on: boolean; trap: boolean }[] = [
    { x: ERASER_X, on: beat.markEraser, trap: false },
    { x: TIP_X, on: beat.markTip, trap: beat.phase === 'trap' },
  ]

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* figure + overlay share one coordinate box (PENCIL_GEOM) */}
        <div className="relative" style={{ width: FIG_W }}>
          <PencilRuler20 showMeasure={beat.showMeasure} />

          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width={FIG_W}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            {ends.map((e, i) =>
              e.on ? (
                <g key={i}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    x1={e.x}
                    y1={TOP - 4}
                    x2={e.x}
                    y2={RULER_TOP + 22}
                    stroke={e.trap ? RED : ACCENT}
                    strokeWidth={3}
                  />
                  <circle cx={e.x} cy={TOP - 4} r={4} fill={e.trap ? RED : ACCENT} />
                </g>
              ) : null,
            )}

            {/* trap badge: a red ✕ over the "14" reading */}
            {beat.phase === 'trap' && (
              <motion.g
                key="trap"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              >
                <circle cx={TIP_X} cy={TOP + 6} r={11} fill="#FFFFFF" stroke={RED} strokeWidth={2.5} />
                <text
                  x={TIP_X}
                  y={TOP + 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill={RED}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  ✕
                </text>
              </motion.g>
            )}
          </svg>
        </div>

        {/* the subtraction (the maths made visible) */}
        {beat.sum && (
          <motion.div
            key={beat.sum}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : ACCENT }}
          >
            {beat.sum}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'trap'
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
