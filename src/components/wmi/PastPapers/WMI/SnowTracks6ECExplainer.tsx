/**
 * IKMC-19-EC-Q6 — "Snow Tracks" post-answer explainer.
 *
 * Reuses FootprintPrimitive and track layout from SnowTracks6ECIllustration
 * to animate the layering logic:
 *   Beat 0 (intro):     static scene with all three tracks
 *   Beat 1 (crossings): highlight crossing points with amber circles
 *   Beat 2 (first):     dotted track highlighted blue — "walked 1st"
 *   Beat 3 (second):    ribbed track highlighted teal — "walked 2nd"
 *   Beat 4 (third):     oval track highlighted orange — "walked 3rd"
 *   Beat 5 (result):    all tracks colored, answer D→R→O shown, green caption
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FootprintPrimitive,
  SnowTracks6ECOption,
  SVG_W,
  SVG_H,
  SNOW_BG,
  SNOW_STROKE,
  OPTION_ORDER,
} from './SnowTracks6ECIllustration'
import { buildSnowTracks6ECSteps, SNOW_CHOICE } from './snowTracks6ECSteps'

// ── colour tokens ─────────────────────────────────────────────────────────────

const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_INK  = '#065F46'
const BLUE       = '#1D4ED8'
const BLUE_BG    = '#DBEAFE'
const TEAL       = '#0D9488'
const ORANGE     = '#EA580C'
const AMBER_HL   = '#F59E0B'
const INFO_BLUE  = '#30598A'
const INFO_BG    = '#E1EFFB'

// Highlight fill colours when a track is spotlighted
const HL_FILL: Record<'D' | 'R' | 'O', string> = {
  D: '#BFDBFE', // blue tint for dotted
  R: '#CCFBF1', // teal tint for ribbed
  O: '#FED7AA', // orange tint for oval
}

const HL_STROKE: Record<'D' | 'R' | 'O', string> = {
  D: BLUE,
  R: TEAL,
  O: ORANGE,
}

// ── Footprint step geometry (duplicated from illustration for isolation) ──────

interface Step { cx: number; cy: number; rotate: number }

function makeSteps(
  ox: number, oy: number,
  dx: number, dy: number,
  count: number,
  spacing: number,
  sideOffset: number,
): Step[] {
  const px = -dy
  const py =  dx
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) * spacing
    const side = i % 2 === 0 ? 1 : -1
    return {
      cx: ox + dx * t + px * sideOffset * side,
      cy: oy + dy * t + py * sideOffset * side,
      rotate: angleDeg + 90,
    }
  })
}

const TRACK_D_STEPS = makeSteps(20, 165, 0.78, -0.63, 7, 36, 7)
const TRACK_R_STEPS = makeSteps(10, 100, 1.0,   0.08, 8, 34, 6)
const TRACK_O_STEPS = makeSteps(18,  28, 0.70,  0.72, 7, 36, 7)

// Approximate crossing point locations (where paths intersect visually)
const CROSSINGS = [
  { cx: 118, cy: 98 },  // D × R crossing
  { cx: 185, cy: 112 }, // R × O crossing
  { cx: 152, cy: 80 },  // D × O crossing
]

// ── Rank label badge ──────────────────────────────────────────────────────────

function RankBadge({ cx, cy, label, color }: { cx: number; cy: number; label: string; color: string }) {
  return (
    <g>
      <rect x={cx - 16} y={cy - 10} width={32} height={20} rx={10} fill={color} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
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

export default function SnowTracks6ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSnowTracks6ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: INFO_BG, borderColor: INFO_BLUE, color: INFO_BLUE }

  // Per-track fill/stroke overrides based on current beat
  const dFill   = beat.highlightFirst  ? HL_FILL.D   : undefined
  const dStroke = beat.highlightFirst  ? HL_STROKE.D : undefined
  const rFill   = beat.highlightSecond ? HL_FILL.R   : undefined
  const rStroke = beat.highlightSecond ? HL_STROKE.R : undefined
  const oFill   = beat.highlightThird  ? HL_FILL.O   : undefined
  const oStroke = beat.highlightThird  ? HL_STROKE.O : undefined

  // Compute rank badge centroid per track for result beat
  const dCenter = { cx: 80,  cy: 148 }
  const rCenter = { cx: 172, cy: 95  }
  const oCenter = { cx: 240, cy: 60  }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jejak titik berada di bawah semua lainnya (berjalan pertama), jejak bergaris di bawah oval tapi di atas titik (berjalan kedua), jejak oval di atas semua (berjalan ketiga). Jawaban ${SNOW_CHOICE}.`
      : `Explainer: dotted track lies under all others (walked first), ribbed track under oval but above dotted (walked second), oval track on top of all (walked third). Answer ${SNOW_CHOICE}.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Snow scene SVG */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(340, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={SNOW_BG} />
          <line x1={0} y1={SVG_H - 8} x2={SVG_W} y2={SVG_H - 8} stroke={SNOW_STROKE} strokeWidth={1} />

          {/* Track D (dotted) — bottom z-order */}
          {TRACK_D_STEPS.map((s, i) => (
            <FootprintPrimitive
              key={`d-${i}`}
              type="D"
              cx={s.cx}
              cy={s.cy}
              rotate={s.rotate}
              fillOverride={dFill}
              strokeOverride={dStroke}
              opacity={beat.phase !== 'intro' && !beat.highlightFirst && !isResult ? 0.35 : 1}
            />
          ))}

          {/* Track R (ribbed) — middle z-order */}
          {TRACK_R_STEPS.map((s, i) => (
            <FootprintPrimitive
              key={`r-${i}`}
              type="R"
              cx={s.cx}
              cy={s.cy}
              rotate={s.rotate}
              fillOverride={rFill}
              strokeOverride={rStroke}
              opacity={beat.phase !== 'intro' && !beat.highlightSecond && !isResult ? 0.35 : 1}
            />
          ))}

          {/* Track O (oval) — top z-order */}
          {TRACK_O_STEPS.map((s, i) => (
            <FootprintPrimitive
              key={`o-${i}`}
              type="O"
              cx={s.cx}
              cy={s.cy}
              rotate={s.rotate}
              fillOverride={oFill}
              strokeOverride={oStroke}
              opacity={beat.phase !== 'intro' && !beat.highlightThird && !isResult ? 0.35 : 1}
            />
          ))}

          {/* Crossing-point highlights (amber halos) */}
          <AnimatePresence>
            {beat.showCrossings &&
              CROSSINGS.map((c, i) => (
                <motion.circle
                  key={`cross-${i}`}
                  cx={c.cx}
                  cy={c.cy}
                  r={14}
                  fill="none"
                  stroke={AMBER_HL}
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.08 }}
                />
              ))}
          </AnimatePresence>

          {/* Rank badges for highlighted tracks */}
          <AnimatePresence>
            {beat.highlightFirst && !isResult && (
              <motion.g
                key="badge-d"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <RankBadge cx={dCenter.cx} cy={dCenter.cy - 22} label="1st" color={BLUE} />
              </motion.g>
            )}
            {beat.highlightSecond && !isResult && (
              <motion.g
                key="badge-r"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <RankBadge cx={rCenter.cx} cy={rCenter.cy - 22} label="2nd" color={TEAL} />
              </motion.g>
            )}
            {beat.highlightThird && !isResult && (
              <motion.g
                key="badge-o"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <RankBadge cx={oCenter.cx} cy={oCenter.cy - 22} label="3rd" color={ORANGE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* On result beat: show all three rank badges simultaneously */}
          {isResult && (
            <>
              <RankBadge cx={dCenter.cx} cy={dCenter.cy - 22} label="1st" color={BLUE}   />
              <RankBadge cx={rCenter.cx} cy={rCenter.cy - 22} label="2nd" color={TEAL}   />
              <RankBadge cx={oCenter.cx} cy={oCenter.cy - 22} label="3rd" color={ORANGE} />
            </>
          )}
        </svg>

        {/* Answer order display on result beat */}
        <AnimatePresence>
          {isResult && (
            <motion.div
              key="result-order"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="rounded-xl border-2 px-3 py-1.5"
              style={{ borderColor: GREEN, background: GREEN_BG }}
            >
              <SnowTracks6ECOption choice={{ label: SNOW_CHOICE, text: SNOW_CHOICE }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

export { SNOW_ANSWER } from './snowTracks6ECSteps'
