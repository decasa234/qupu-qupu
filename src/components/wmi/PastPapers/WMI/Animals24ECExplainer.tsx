import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CamelGlyph,
  OstrichGlyph,
  SVG_W,
  SVG_H,
  CAMEL_CX,
  OSTRICH_CX,
  GROUND_Y,
  COLOR,
} from './Animals24ECIllustration'
import { buildAnimals24ECSteps } from './animals24ECSteps'

// IKMC-19-EC-Q24 — post-answer animation.
// Reuses CamelGlyph and OstrichGlyph from the illustration.
//
// Animation beats:
//   0. intro      — static scene; state the task.
//   1. ostriches  — glow red shoes; show "16 ostriches" badge.
//   2. camels     — glow blue shoes; show "10 camels" badge.
//   3. total      — glow both; equation 16+10=26.
//   4. hats       — show "26 hats" badge; equation → A (green).

const GREEN = '#10B981'
const BLUE = '#2563EB'
const RED = '#DC2626'
const VIOLET = '#7C3AED'

const FIG_W = Math.min(360, SVG_W)

/** Glow ring around a shoe area. */
function ShoeGlow({ cx, color }: { cx: number; color: string }) {
  return (
    <ellipse
      cx={cx}
      cy={GROUND_Y - 4}
      rx={36}
      ry={12}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="5 3"
      opacity={0.85}
    />
  )
}

/** Count badge floating above an animal. */
function CountBadge({
  cx,
  y,
  label,
  color,
}: {
  cx: number
  y: number
  label: string
  color: string
}) {
  return (
    <g>
      <rect
        x={cx - 24}
        y={y - 12}
        width={48}
        height={22}
        rx={11}
        fill={color}
      />
      <text
        x={cx}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/** Total hats badge centred at the top of the SVG. */
function TotalBadge({ label }: { label: string }) {
  return (
    <g>
      <rect
        x={SVG_W / 2 - 36}
        y={4}
        width={72}
        height={26}
        rx={13}
        fill={GREEN}
      />
      <text
        x={SVG_W / 2}
        y={17}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Animals24ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildAnimals24ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 16 pasang sepatu merah ÷ 1 pasang per burung unta = 16 burung unta; 40 sepatu biru ÷ 4 per unta = 10 unta; 16 + 10 = 26 topi — jawaban A.'
      : 'Explainer: 16 pairs of red shoes ÷ 1 pair per ostrich = 16 ostriches; 40 blue shoes ÷ 4 per camel = 10 camels; 16 + 10 = 26 hats — answer A.'

  const ostrichCountLabel = lang === 'id' ? '16 unta besar' : '16 ostriches'
  const camelCountLabel = lang === 'id' ? '10 unta' : '10 camels'
  const totalLabel = lang === 'id' ? '26 topi' : '26 hats'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* ground */}
          <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
          <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#8B6914" strokeWidth={2} />

          {/* camel */}
          <CamelGlyph cx={CAMEL_CX} baseY={GROUND_Y} />

          {/* ostrich */}
          <OstrichGlyph cx={OSTRICH_CX} baseY={GROUND_Y} />

          {/* shoe glows */}
          <AnimatePresence>
            {beat.glowOstrich && (
              <motion.g
                key="ostrich-glow"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ShoeGlow cx={OSTRICH_CX} color={RED} />
              </motion.g>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {beat.glowCamel && (
              <motion.g
                key="camel-glow"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ShoeGlow cx={CAMEL_CX} color={BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ostrich count badge */}
          <AnimatePresence>
            {beat.showOstrichCount && (
              <motion.g
                key="ostrich-count"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <CountBadge cx={OSTRICH_CX} y={28} label={ostrichCountLabel} color={RED} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* camel count badge */}
          <AnimatePresence>
            {beat.showCamelCount && (
              <motion.g
                key="camel-count"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <CountBadge cx={CAMEL_CX} y={28} label={camelCountLabel} color={BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* total hats badge */}
          <AnimatePresence>
            {beat.showTotal && (
              <motion.g
                key="total-hats"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <TotalBadge label={totalLabel} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* question mark (hidden on result) */}
          {!isResult && (
            <text
              x={SVG_W / 2}
              y={14}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={14}
              fontWeight={900}
              fill={VIOLET}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id' ? '? topi' : '? hats'}
            </text>
          )}
        </svg>

        {/* equation row */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
