import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClockPic24G1 } from './ClockPic24G1Illustration'
import { buildClockPic24G1Steps } from './clockPic24G1Steps'

// WMI-24F1A-Q13 — post-answer animation. A picture painted on the minute hand at
// 11:50 (hand at the 10, 300° from 12) is asked about at 3:30 (hand at the 6,
// 180° from 12). The hand + picture turn -120° (120° counter-clockwise), landing
// the picture in option D's orientation.
//
// We BIND to the built primitive ClockPic24G1 (rotated=false → 11:50, true →
// 3:30) for the two clock states and never redraw it. The turn is taught with an
// overlaid rotation arc + a "10 → 6" target ring + a "-120°" badge, all driven by
// framer-motion off the current beat.

// Qupu tokens echoing the illustration's ink/gray plus the house green/blue.
const INK = '#3a3438'
const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN_BG = '#D1FAE5'
const ACCENT = '#F08080' // turn arc / marker accent

const CX = 150
const CY = 150
const FACE_R = 92

/** Same face math as the primitive: clock angle (deg cw from 12) + radius → point. */
function facePoint(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) }
}

/** Highlight ring over a target hour number (10 or 6), placed on the face rim. */
function TargetRing({ value }: { value: 10 | 6 }) {
  const angle = value * 30 // 10 o'clock = 300°, 6 o'clock = 180°
  const p = facePoint(angle, FACE_R - 12)
  return (
    <motion.circle
      key={value}
      cx={p.x}
      cy={p.y}
      r={14}
      fill="none"
      stroke={ACCENT}
      strokeWidth={4}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  )
}

/**
 * Curved arrow sweeping from the 10 toward the 6, the short way (counter-
 * clockwise, -120°). `frac` 0..1 reveals the arc; at 1 it ends with a head.
 */
function TurnArc({ frac }: { frac: number }) {
  const r = 64
  // Sweep from 300° (the 10) decreasing to 180° (the 6): counter-clockwise.
  const startA = 300
  const endA = 300 - 120 * frac
  const start = facePoint(startA, r)
  const end = facePoint(endA, r)
  // 120° < 180°, so always the minor arc. sweep-flag 0 draws it the CCW way here.
  const path = `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`
  // Tangent at the moving end (pointing along the CCW direction of travel).
  const headAngle = endA - 90 // tangent direction in SVG screen degrees
  return (
    <g opacity={frac > 0 ? 1 : 0}>
      <path d={path} fill="none" stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />
      {frac >= 0.999 && (
        <polygon
          points="0,-7 13,0 0,7"
          fill={ACCENT}
          transform={`translate(${end.x} ${end.y}) rotate(${headAngle + 180})`}
        />
      )}
    </g>
  )
}

export default function ClockPic24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildClockPic24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={t(
        'The minute hand turns from the 10 (11:50) to the 6 (3:30), a 120-degree counter-clockwise turn; the picture painted on the hand turns the same amount, so at 3:30 it matches option D.',
        'Jarum menit berputar dari angka 10 (pukul 11.50) ke angka 6 (pukul 3.30), yaitu putaran 120 derajat berlawanan arah jarum jam; gambar pada jarum ikut berputar sama banyak, jadi pada pukul 3.30 cocok dengan pilihan D.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* The clock + picture, bound to the primitive; overlay teaches the turn. */}
        <div className="relative" style={{ width: 280, height: 280 }}>
          <ClockPic24G1 rotated={beat.rotated} />
          {(beat.mark !== null || beat.sweep > 0) && (
            <svg
              viewBox="0 0 300 300"
              width={280}
              height={280}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ overflow: 'visible' }}
            >
              {beat.sweep > 0 && <TurnArc frac={beat.sweep} />}
              {beat.mark !== null && <TargetRing value={beat.mark} />}
            </svg>
          )}
          {beat.sweep > 0 && !beat.result && (
            <div
              className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-extrabold"
              style={{ background: ACCENT, color: '#ffffff', border: `2px solid ${INK}` }}
            >
              {t('turn 120° ↺', 'putar 120° ↺')}
            </div>
          )}
          {beat.result && (
            <div
              className="absolute right-2 top-2 rounded-full px-3 py-1 text-sm font-extrabold"
              style={{ background: GREEN_BG, color: '#065F46', border: `2px solid ${GREEN}` }}
            >
              {t('= D', '= D')}
            </div>
          )}
        </div>

        {/* Kid-first caption box: blue while reasoning, green on the answer beat. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
