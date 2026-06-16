// Post-answer explainer for WMI-24F2A-Q14 (2024 Grade-2 Final).
//
// Teaches the turning rule: the toy train rolls FORWARD and every car spins the
// same quarter-turn the rail bends. The four known arrows (down → right → up →
// left) reveal a steady counter-clockwise spin; continuing it past the plain
// light car recovers the two hidden arrows — lower ? = down, upper ? = right —
// which is option E. One hidden car is solved per beat; the option strip dims
// the losers and lands on E.
//
// Deterministic + SSR-safe: pure render of the storyboard, no Math.random/Date.
// The scene mirrors TrainArrows24G2Illustration (same layout, colour tokens and
// glyphs) so the animation reads as the same picture coming alive.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { OPTIONS24Q14, ArrowPairFigure, type Dir } from './TrainArrows24G2Illustration'
import { buildTrainArrowsSteps, type OptionLabel } from './trainArrows24G2Steps'

// ── House colour tokens, echoing the static illustration ────────────────────
const INK = '#1F2937'
const BODY = '#F7DAD6' // salmon car body
const BODY_EDGE = '#6E2B2B' // maroon outline
const WHEEL = '#2B2B2B'
const RAIL = '#C2C2C2'
const RAIL_DOT = '#BDBDBD'
const SIGNAL = '#D7263D' // red signal arrow
const SIGNAL_EDGE = '#6E2B2B'
const GREEN = '#10B981'
const SPOT = '#D97706' // amber spotlight ring

const DIR_ROT: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }

// ── Primitive glyphs (mirrors of the illustration's local components) ───────
function ArrowGlyph({ dir, cx, cy, r = 9, fill = SIGNAL }: { dir: Dir; cx: number; cy: number; r?: number; fill?: string }) {
  const pts = `${cx},${cy - r} ${cx + r * 0.86},${cy + r * 0.62} ${cx - r * 0.86},${cy + r * 0.62}`
  return (
    <polygon
      points={pts}
      fill={fill}
      stroke={SIGNAL_EDGE}
      strokeWidth={1.6}
      strokeLinejoin="round"
      transform={`rotate(${DIR_ROT[dir]} ${cx} ${cy})`}
    />
  )
}

function CarWheels({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const half = s / 2
  const ww = s * 0.26
  const wh = s * 0.42
  return (
    <g fill={WHEEL}>
      <rect x={cx - half - ww * 0.45} y={cy - wh / 2} width={ww} height={wh} rx={2} />
      <rect x={cx + half - ww * 0.55} y={cy - wh / 2} width={ww} height={wh} rx={2} />
    </g>
  )
}

function SignalCar({
  cx,
  cy,
  s = 30,
  dir,
  hidden,
  plain,
  spot,
}: {
  cx: number
  cy: number
  s?: number
  dir?: Dir
  hidden?: boolean
  plain?: boolean
  spot?: boolean
}) {
  const half = s / 2
  const discR = s * 0.34
  return (
    <g>
      {spot && <circle cx={cx} cy={cy} r={s * 0.78} fill="none" stroke={SPOT} strokeWidth={2.4} strokeDasharray="6 4" />}
      <CarWheels cx={cx} cy={cy} s={s} />
      <rect x={cx - half} y={cy - half} width={s} height={s} rx={3} fill={BODY} stroke={BODY_EDGE} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={discR} fill="white" stroke={INK} strokeWidth={1.8} />
      {hidden ? (
        <text
          x={cx}
          y={cy + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={s * 0.5}
          fontWeight={900}
          fill={INK}
          className="font-display"
        >
          ?
        </text>
      ) : plain ? null : dir ? (
        <ArrowGlyph dir={dir} cx={cx} cy={cy} r={discR * 0.7} />
      ) : null}
    </g>
  )
}

function Engine({ cx, cy, s = 34, dir }: { cx: number; cy: number; s?: number; dir: 'left' | 'right' }) {
  const half = s / 2
  const w = s * 1.5
  const tip = w / 2
  const pts =
    dir === 'left'
      ? `${cx - tip},${cy} ${cx - tip * 0.35},${cy - half} ${cx + tip},${cy - half} ${cx + tip},${cy + half} ${cx - tip * 0.35},${cy + half}`
      : `${cx + tip},${cy} ${cx + tip * 0.35},${cy - half} ${cx - tip},${cy - half} ${cx - tip},${cy + half} ${cx + tip * 0.35},${cy + half}`
  return (
    <g>
      <CarWheels cx={cx} cy={cy} s={w * 0.7} />
      <polygon points={pts} fill={BODY} stroke={BODY_EDGE} strokeWidth={2} strokeLinejoin="round" />
    </g>
  )
}

function Coupling({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={2} />
      <circle cx={mx} cy={my} r={2.4} fill={INK} />
    </g>
  )
}

// Car centres copied from the static illustration so the scene matches exactly.
const REAR = { x: 56, y: 184 }
const TRI_UP = { x: 116, y: 184 } // ▲
const TRI_LEFT = { x: 158, y: 184 } // ◁
const TRI_DOWN = { x: 30, y: 184 } // ▼ (very tail)
const CIRCLE = { x: 232, y: 110 } // ◯ plain light
const LOWER_Q = { x: 188, y: 110 } // ? first hidden in forward order
const UPPER_Q = { x: 150, y: 70 } // ? second hidden in forward order
const FRONT = { x: 78, y: 44 }

export default function TrainArrows24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTrainArrowsSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Spotlight the four known arrows as the "spin guide" when the beat asks for it.
  const spotlit = beat.knownLit >= 4

  const W = 360
  const H = 220

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        'Each train car spins the same quarter-turn the rail bends. Following the steady counter-clockwise spin, the first hidden arrow points down and the second points right, which is option E.',
        'Tiap gerbong kereta berputar seperempat searah belokan rel. Mengikuti putaran tetap berlawanan jarum jam, panah tersembunyi pertama menunjuk ke bawah dan kedua ke kanan, yaitu pilihan E.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── the train scene, mirroring the static stem ── */}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <rect x={0} y={0} width={W} height={H} rx={10} fill="white" />
          {/* grey rail band */}
          <path
            d={
              'M -6 44 L 96 44 C 150 44 150 70 150 70 C 150 96 178 110 200 110 ' +
              'L 300 110 C 348 110 348 184 300 184 L -6 184'
            }
            fill="none"
            stroke={RAIL}
            strokeWidth={30}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* dotted track-ahead beads */}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={`db-${i}`} cx={262 + i * 12} cy={110} r={4} fill={RAIL_DOT} />
          ))}
          {Array.from({ length: 6 }, (_, i) => {
            const a = (-90 + (i / 5) * 180) * (Math.PI / 180)
            return <circle key={`du-${i}`} cx={310 + Math.cos(a) * 37} cy={147 + Math.sin(a) * 37} r={4} fill={RAIL_DOT} />
          })}
          {Array.from({ length: 11 }, (_, i) => (
            <circle key={`dl-${i}`} cx={300 - i * 13} cy={184} r={4} fill={RAIL_DOT} />
          ))}

          {/* couplings */}
          <Coupling x1={TRI_DOWN.x + 16} y1={184} x2={TRI_UP.x - 16} y2={184} />
          <Coupling x1={TRI_UP.x + 16} y1={184} x2={TRI_LEFT.x - 16} y2={184} />
          <Coupling x1={LOWER_Q.x + 16} y1={110} x2={CIRCLE.x - 16} y2={110} />
          <Coupling x1={UPPER_Q.x + 8} y1={UPPER_Q.y + 14} x2={LOWER_Q.x - 6} y2={LOWER_Q.y - 14} />
          <Coupling x1={FRONT.x + 22} y1={FRONT.y + 10} x2={UPPER_Q.x - 14} y2={UPPER_Q.y - 12} />

          {/* engines */}
          <Engine cx={REAR.x} cy={REAR.y} dir="right" />
          <Engine cx={FRONT.x} cy={FRONT.y} dir="left" />

          {/* known signal cars (rear engine's arrow is drawn as a guide chip below) */}
          <SignalCar cx={TRI_UP.x} cy={TRI_UP.y} dir="up" spot={spotlit} />
          <SignalCar cx={TRI_LEFT.x} cy={TRI_LEFT.y} dir="left" spot={spotlit} />
          <SignalCar cx={TRI_DOWN.x} cy={TRI_DOWN.y} dir="down" spot={spotlit} />
          {/* the plain light car */}
          <SignalCar cx={CIRCLE.x} cy={CIRCLE.y} plain />

          {/* the two hidden cars — reveal their arrow once the beat solves it */}
          <HiddenCar cx={LOWER_Q.x} cy={LOWER_Q.y} dir={beat.q1} />
          <HiddenCar cx={UPPER_Q.x} cy={UPPER_Q.y} dir={beat.q2} />

          {/* CCW spin badge near the front of the known run while spotlit */}
          {spotlit && (
            <g>
              <text
                x={86}
                y={150}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={900}
                fill={SPOT}
                className="font-display"
              >
                ↺
              </text>
            </g>
          )}
        </svg>

        {/* ── the five option pairs: losers dim, the answer glows green ── */}
        <div className="flex w-full flex-wrap items-stretch justify-center gap-2">
          {(['A', 'B', 'C', 'D', 'E'] as OptionLabel[]).map((label) => {
            const lit = beat.litOptions.includes(label)
            const isAnswer = label === story.answerLabel
            const win = beat.result && isAnswer
            return (
              <motion.div
                key={label}
                animate={{ opacity: lit ? 1 : 0.28, scale: win ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="flex flex-col items-center rounded-lg border-2 px-2 py-1"
                style={{
                  borderColor: win ? GREEN : lit ? '#30598A' : '#D8D8D8',
                  background: win ? '#D1FAE5' : 'white',
                }}
              >
                <span className="font-display text-[11px] font-extrabold" style={{ color: win ? '#065F46' : INK }}>
                  {`(${label})`}
                </span>
                <ArrowPairFigure pair={OPTIONS24Q14[label]} r={11} gap={8} pad={4} maxWidth={64} />
              </motion.div>
            )
          })}
        </div>

        {/* ── caption box ── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

// A hidden ("?") car that flips to its revealed arrow with a spring pop. Keeps
// the same disc footprint as the static figure; deterministic given `dir`.
function HiddenCar({ cx, cy, dir }: { cx: number; cy: number; dir: Dir | null }) {
  return (
    <motion.g
      key={dir ?? 'q'}
      initial={false}
      animate={{ scale: dir ? [0.6, 1.12, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <SignalCar cx={cx} cy={cy} dir={dir ?? undefined} hidden={dir == null} spot={dir != null} />
    </motion.g>
  )
}
