import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  HutRect,
  TreatBone,
  SVG_W,
  SVG_H,
  HUT_X,
  HUT_Y,
  HUT_W,
  HUT_H,
  TIE_X,
  TIE_Y,
  TREAT_XS,
  TREAT_Y,
  PX_PER_M,
  COLOR,
} from './DogLeash11ECIllustration'
import { buildDogLeash11ECSteps } from './dogLeash11ECSteps'

// IKMC-20-EC-Q11 — post-answer animation.
// Reuses HutRect and TreatBone from the illustration so the animation
// reads as the static scene coming alive.
//
// Animation overlays (beat-driven):
//   showDirectArc   — large arc (r = 11 m) to the right of the tie point,
//                     covering roughly 270° away from the hut wall.
//   showBRCornerArc — 7 m arc centred on the bottom-right corner, sweeping
//                     below the hut from right to left.
//   showTRCornerArc — 10 m arc centred on the top-right corner, sweeping
//                     above/over the hut (no treats there).
//   reachableTreats — treats drawn in green.
//   unreachableTreats — treats drawn dimmed with an X.

// ── Colour constants ──────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#F0853A'
const RED    = '#EF4444'
const INK    = COLOR.LABEL

// ── Corner positions ──────────────────────────────────────────────────────────
/** Bottom-right corner of the hut. */
const BR_X = HUT_X + HUT_W
const BR_Y = HUT_Y + HUT_H

/** Top-right corner of the hut. */
const TR_X = HUT_X + HUT_W
const TR_Y = HUT_Y

// Radii in pixels
const R_DIRECT  = 11 * PX_PER_M   // 308 px — far beyond canvas; clipped by SVG viewBox
const R_BR      = 7  * PX_PER_M   // 196 px
const R_TR      = 10 * PX_PER_M   // 280 px

// ── Arc helper ────────────────────────────────────────────────────────────────

/** SVG arc path: large-arc from startDeg to endDeg (degrees, clockwise), radius r, centred at (cx,cy). */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const sx = cx + r * Math.cos(toRad(startDeg))
  const sy = cy + r * Math.sin(toRad(startDeg))
  const ex = cx + r * Math.cos(toRad(endDeg))
  const ey = cy + r * Math.sin(toRad(endDeg))
  const span = ((endDeg - startDeg + 360) % 360)
  const largeArc = span > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`
}

// ── Overlay components ────────────────────────────────────────────────────────

/** Direct arc: from the tie point, 11 m sweeping to the right (away from the hut wall).
 *  The hut wall is the left boundary (270° = straight up; 90° = straight down).
 *  The right wall of the hut is vertical; the tie point is on it.
 *  "Away from wall" means sweeping the arc from 270° to 90° going clockwise (right side).
 */
function DirectArc() {
  return (
    <path
      d={arcPath(TIE_X, TIE_Y, R_DIRECT, -90, 90)}
      fill={BLUE}
      fillOpacity={0.12}
      stroke={BLUE}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeDasharray="6 4"
    />
  )
}

/** 7 m arc from the bottom-right corner, sweeping BELOW the hut (leftward).
 *  The BR corner is at (BR_X, BR_Y). Below the hut the arc sweeps from 90° (down) to 180° (left).
 *  The right wall occupies 270°→0°→90°, so the "below" sector is 90°→180°.
 */
function BRCornerArc() {
  // Sweep from 90° (straight down) to 180° (straight left) — quarter circle below hut
  // But we need to cover the full reach: from the right wall side downward to the left.
  // The available angle after wrapping the BR corner: from 90° (down along bottom wall) to 180° (left).
  return (
    <path
      d={arcPath(BR_X, BR_Y, R_BR, 90, 180)}
      fill={GREEN}
      fillOpacity={0.18}
      stroke={GREEN}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeDasharray="8 4"
    />
  )
}

/** 10 m arc from the top-right corner, sweeping ABOVE the hut (leftward, over roof). */
function TRCornerArc() {
  // TR corner: sweep from 270° (up) to 180° (left) — quarter circle above the hut
  return (
    <path
      d={arcPath(TR_X, TR_Y, R_TR, 180, 270)}
      fill={ORANGE}
      fillOpacity={0.13}
      stroke={ORANGE}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeDasharray="6 4"
    />
  )
}

// ── Reachable / unreachable treat renderers ───────────────────────────────────

function ReachableTreat({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <TreatBone cx={cx} cy={cy} fill="#A7F3D0" stroke={GREEN} />
      {/* green ring */}
      <circle cx={cx} cy={cy} r={16} fill="none" stroke={GREEN} strokeWidth={2.5} strokeDasharray="4 3" />
    </g>
  )
}

function UnreachableTreat({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <TreatBone cx={cx} cy={cy} fill="#F3F4F6" stroke="#9CA3AF" />
      {/* X mark */}
      <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke={RED} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} stroke={RED} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// ── Tie point dot ─────────────────────────────────────────────────────────────

function TieDot() {
  return (
    <g>
      <circle cx={TIE_X} cy={TIE_Y} r={5} fill={INK} />
      {/* "1 m" brace on the right wall between the tie point and the top-right corner */}
      <line
        x1={TIE_X + 6} y1={TR_Y}
        x2={TIE_X + 6} y2={TIE_Y}
        stroke={BLUE} strokeWidth={1.5} strokeLinecap="round"
      />
      <text
        x={TIE_X + 10} y={(TR_Y + TIE_Y) / 2}
        fill={BLUE} fontSize={10} fontWeight={800}
        textAnchor="start" dominantBaseline="central"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        1 m
      </text>
      {/* Corner highlight at TR */}
      <circle cx={TR_X} cy={TR_Y} r={4} fill={ORANGE} />
      {/* Corner highlight at BR */}
      <circle cx={BR_X} cy={BR_Y} r={4} fill={GREEN} />
    </g>
  )
}

// ── Corner arc-label ──────────────────────────────────────────────────────────

function ArcLabel({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return (
    <text
      x={x} y={y}
      fill={color}
      fontSize={12}
      fontWeight={900}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {text}
    </text>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function DogLeash11ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDogLeash11ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tali 11 m melilit sudut kanan bawah (4 m); sisa 7 m menjangkau 4 camilan di bawah gubuk — jawaban D.'
      : 'Explainer: 11 m leash wraps around the bottom-right corner (4 m used); remaining 7 m reaches 4 of 5 treats below the hut — answer D.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(380, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.GROUND} />

          {/* arc overlays — rendered BEHIND the hut so they don't obscure it */}

          <AnimatePresence>
            {beat.showDirectArc && (
              <motion.g
                key="direct-arc"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ transformOrigin: `${TIE_X}px ${TIE_Y}px` }}
              >
                <DirectArc />
                <ArcLabel x={TIE_X + 80} y={TIE_Y - 20} text="11 m" color={BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {beat.showTRCornerArc && (
              <motion.g
                key="tr-arc"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ transformOrigin: `${TR_X}px ${TR_Y}px` }}
              >
                <TRCornerArc />
                <ArcLabel x={HUT_X + HUT_W / 2} y={HUT_Y - 18} text="10 m" color={ORANGE} />
              </motion.g>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {beat.showBRCornerArc && (
              <motion.g
                key="br-arc"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ transformOrigin: `${BR_X}px ${BR_Y}px` }}
              >
                <BRCornerArc />
                <ArcLabel x={HUT_X + HUT_W / 2 - 20} y={TREAT_Y - 14} text="7 m" color={GREEN} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* hut on top of arcs */}
          <HutRect />

          {/* tie point marker */}
          <TieDot />

          {/* treats (coloured per beat) */}
          {TREAT_XS.map((tx, i) => {
            const isReachable   = beat.reachableTreats.includes(i)
            const isUnreachable = beat.unreachableTreats.includes(i)
            return (
              <g key={i}>
                <AnimatePresence>
                  {isReachable && (
                    <motion.g
                      key={`reach-${i}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.08 }}
                      style={{ transformOrigin: `${tx}px ${TREAT_Y}px` }}
                    >
                      <ReachableTreat cx={tx} cy={TREAT_Y} />
                    </motion.g>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isUnreachable && (
                    <motion.g
                      key={`unreach-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <UnreachableTreat cx={tx} cy={TREAT_Y} />
                    </motion.g>
                  )}
                </AnimatePresence>
                {/* neutral treat (when neither reachable nor unreachable) */}
                {!isReachable && !isUnreachable && (
                  <TreatBone cx={tx} cy={TREAT_Y} />
                )}
              </g>
            )
          })}
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
