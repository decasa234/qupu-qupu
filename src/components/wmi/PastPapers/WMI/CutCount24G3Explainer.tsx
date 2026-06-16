import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CUT_STAGES, CutStageGlyph } from './CutCount24G3Illustration'
import { buildCutCount24G3Steps } from './cutCount24G3Steps'

// WMI-24F3A-Q23 — cut-and-count pattern. The animation mirrors the static
// CutCountFigure (same squares, same qupu tokens) coming alive: it reveals the
// pictured stages 1 → 4 → 7 one cut at a time, names the constant +3 gain,
// builds 1 + 3 × (n − 1), rejects the 3 × 2024 trap, then lands on 6070.

const INK = '#1F2937'
const BLUE = '#30598A' // echoes fill-qupu-brand-blue
const ORANGE = '#D97706' // echoes fill-qupu-brand-orange
const GREEN = '#10B981'

// Picture number the question asks for. The answer is derived, never hardcoded.
const TARGET_PICTURE = 2024

// Geometry mirrors CutCountFigure (SIZE/GAP/labels) so it reads as the same scene.
const SIZE = 64
const GAP = 40
const TOP = 14
const LABEL_Y = TOP + SIZE + 20
const X0 = 12
const SVG_W = CUT_STAGES.length * SIZE + (CUT_STAGES.length - 1) * GAP + 24
const SVG_H = LABEL_Y + 22

export default function CutCount24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCutCount24G3Steps(TARGET_PICTURE, lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { n, gain, base, trap, answer } = story
  const stageCounts = CUT_STAGES.map((s) => s.count)

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        `Each cut adds ${gain} squares, so Picture n equals ${base} plus ${gain} times (n minus 1). Picture ${n} has ${answer} squares.`,
        `Tiap potong menambah ${gain} persegi, jadi Gambar ke-n sama dengan ${base} ditambah ${gain} kali (n dikurangi 1). Gambar ${n} punya ${answer} persegi.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Stage strip — the pictured squares coming alive, one cut at a time. */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="cutArrowAnim"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={ORANGE} />
            </marker>
          </defs>

          {CUT_STAGES.map((stage, i) => {
            const ox = X0 + i * (SIZE + GAP)
            const cx = ox + SIZE / 2
            const shown = i < beat.shownStages
            const focused = i === beat.focusStage
            const prev = i === 0 ? null : stageCounts[i - 1]
            return (
              <motion.g
                key={stage.picture}
                initial={false}
                animate={{ opacity: shown ? 1 : 0.12, scale: focused ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{ transformOrigin: `${cx}px ${TOP + SIZE / 2}px` }}
              >
                <CutStageGlyph stage={stage} ox={ox} oy={TOP} size={SIZE} />

                {/* focus ring on the stage being explained */}
                {focused && (
                  <rect
                    x={ox - 5}
                    y={TOP - 5}
                    width={SIZE + 10}
                    height={SIZE + 10}
                    rx={8}
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth={2.4}
                    strokeDasharray="7 5"
                  />
                )}

                {/* "Gambar n" label */}
                <text
                  x={cx}
                  y={LABEL_Y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={800}
                  fill={INK}
                  className="font-display"
                >
                  {`${t('Pic', 'Gbr')} ${stage.picture}`}
                </text>

                {/* square count */}
                <text
                  x={cx}
                  y={LABEL_Y + 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={700}
                  fill={ORANGE}
                  className="font-display"
                >
                  {`${stage.count} ${t('sq', 'persegi')}`}
                </text>

                {/* arrow + the "+gain" badge between stages, once both are shown */}
                {i < CUT_STAGES.length - 1 && (
                  <motion.g
                    initial={false}
                    animate={{ opacity: i + 1 < beat.shownStages ? 1 : 0.12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <line
                      x1={ox + SIZE + 6}
                      y1={TOP + SIZE / 2}
                      x2={ox + SIZE + GAP - 6}
                      y2={TOP + SIZE / 2}
                      stroke={ORANGE}
                      strokeWidth={2.2}
                      markerEnd="url(#cutArrowAnim)"
                    />
                    {prev != null && (
                      <text
                        x={ox + SIZE + GAP / 2}
                        y={TOP + SIZE / 2 - 9}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight={800}
                        fill={GREEN}
                        className="font-display"
                      >
                        {`+${gain}`}
                      </text>
                    )}
                  </motion.g>
                )}
              </motion.g>
            )
          })}
        </svg>

        {/* Formula meter — the rule built from base + gain × (n − 1). */}
        <motion.div
          initial={false}
          animate={{
            opacity: beat.highlightFormula ? 1 : 0.4,
            scale: beat.highlightFormula ? 1 : 0.98,
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: '#E1EFFB', borderColor: BLUE, color: BLUE }}
        >
          {t(
            `Picture n = ${base} + ${gain} × (n − 1)`,
            `Gambar ke-n = ${base} + ${gain} × (n − 1)`,
          )}
        </motion.div>

        {/* Trap chip — the rejected 3 × 2024 attempt. */}
        {beat.phase === 'plugTrap' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border-2 px-3 py-1 text-center font-display text-xs font-bold"
            style={{ background: '#FDE2E2', borderColor: '#DC2626', color: '#991B1B' }}
          >
            {`${gain} × ${n} = ${trap}  ✗`}
          </motion.div>
        )}

        {/* Result chip — the winning count. */}
        {beat.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="rounded-lg border-2 px-4 py-1 text-center font-display text-base font-extrabold"
            style={{ background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }}
          >
            {`${base} + ${gain * (n - 1)} = ${answer}`}
          </motion.div>
        )}

        {/* Caption box. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FDE2E2', borderColor: '#DC2626', color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
