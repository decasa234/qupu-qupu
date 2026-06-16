import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SnailPath23G3 } from './SnailPath23G3Illustration'
import {
  buildSnailPathSteps,
  MOVES,
  NET_NORTH,
  NET_EAST,
  ANSWER,
  ANSWER_CHOICE,
  type Axis,
} from './snailPath23G3Steps'

// WMI-23F3A-Q5 — a snail crawls N14, W12, E29, S5 and must crawl home to A.
// The shortest return (taxicab, right-angle turns) is 26 cm. The method that
// makes this easy is to collapse the moves on each axis separately:
//   up–down:  north 14 − south 5  = 9 cm north of A
//   left–right: east 29 − west 12 = 17 cm east of A
// then the way back is 17 (west) + 9 (south) = 26.
//
// The animation walks that deduction. A small coordinate scene mirrors the
// static figure: A at the origin, the four crawl legs as arrows, the snail at
// the end. Each beat spotlights the axis being collapsed and shows the
// arithmetic in a badge; the winning beat reveals the dashed return path and
// the 26 (and swaps in the illustrator's SnailPath23G3 with showReturn so the
// post-answer figure reads as the static scene coming alive).

// qupu colour tokens, echoed as hex constants (matching fill-qupu-*).
const BLUE = '#30598A' // fill-qupu-brand-blue — frame / horizontal accent
const ORANGE = '#f0853a' // fill-qupu-brand-orange — vertical accent + snail
const GREEN = '#10B981' // the return / answer accent
const INK = '#1E3A8A' // fill-qupu-ink — labels
const MUTED = '#94A3B8' // dimmed / idle legs
const GRIDLINE = '#E2E8F0'

// ---- coordinate scene geometry --------------------------------------------
// World units = cm. North is up (−y), south down (+y), west left (−x), east
// right (+x). The snail starts at A = (0, 0).
//   N14 → (0, −14)   W12 → (−12, −14)   E29 → (17, −14)   S5 → (17, −9)
// So it ends at (17, −9): 17 east, 9 north of A — exactly NET_EAST / NET_NORTH.
const A = { x: 0, y: 0 }
const P1 = { x: 0, y: -MOVES.north } // after north
const P2 = { x: -MOVES.west, y: -MOVES.north } // after west
const P3 = { x: MOVES.east - MOVES.west, y: -MOVES.north } // after east
const END = { x: MOVES.east - MOVES.west, y: -MOVES.north + MOVES.south } // after south

// viewBox: pad the world extent so arrows/labels never clip.
const PAD = 16
const minX = Math.min(A.x, P1.x, P2.x, P3.x, END.x) - 8
const maxX = Math.max(A.x, P1.x, P2.x, P3.x, END.x) + 8
const minY = Math.min(A.y, P1.y, P2.y, P3.y, END.y) - 6
const maxY = Math.max(A.y, P1.y, P2.y, P3.y, END.y) + 8
const SCALE = 7 // px per cm
const W = (maxX - minX) * SCALE + PAD * 2
const H = (maxY - minY) * SCALE + PAD * 2
// world (cm) → svg px
const sx = (x: number) => PAD + (x - minX) * SCALE
const sy = (y: number) => PAD + (y - minY) * SCALE

type Pt = { x: number; y: number }
const px = (p: Pt) => ({ x: sx(p.x), y: sy(p.y) })

interface Leg {
  from: Pt
  to: Pt
  axis: 'vertical' | 'horizontal'
  label: string
}
const LEGS: Leg[] = [
  { from: A, to: P1, axis: 'vertical', label: `N ${MOVES.north}` },
  { from: P1, to: P2, axis: 'horizontal', label: `W ${MOVES.west}` },
  { from: P2, to: P3, axis: 'horizontal', label: `E ${MOVES.east}` },
  { from: P3, to: END, axis: 'vertical', label: `S ${MOVES.south}` },
]

// Is a leg lit on this beat?
function legActive(axis: Axis, leg: Leg): boolean {
  if (axis === 'none' || axis === 'return') return false
  if (axis === 'both') return true
  return axis === leg.axis
}

function midpoint(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export default function SnailPath23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildSnailPathSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: collapse the snail's moves on each axis — north ${MOVES.north} minus south ${MOVES.south} is ${NET_NORTH} cm north, east ${MOVES.east} minus west ${MOVES.west} is ${NET_EAST} cm east. The way back is ${NET_EAST} + ${NET_NORTH} = ${ANSWER} cm, choice ${ANSWER_CHOICE}.`,
    `Penjelasan: gabungkan gerak siput per sumbu — utara ${MOVES.north} dikurangi selatan ${MOVES.south} jadi ${NET_NORTH} cm utara, timur ${MOVES.east} dikurangi barat ${MOVES.west} jadi ${NET_EAST} cm timur. Jalan pulang ${NET_EAST} + ${NET_NORTH} = ${ANSWER} cm, jawaban ${ANSWER_CHOICE}.`,
  )

  const aP = px(A)
  const endP = px(END)
  // dashed return path: END → (0, END.y) → A  (west 17, then south 9)
  const corner = px({ x: A.x, y: END.y })

  const showVertBadge = beat.axis === 'vertical' || beat.axis === 'both'
  const showHorizBadge = beat.axis === 'horizontal' || beat.axis === 'both'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line strategy legend, always visible */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold" style={{ color: BLUE }}>
          {t('Track up–down and left–right apart', 'Lacak atas–bawah & kiri–kanan terpisah')}
        </div>

        {/* the coordinate scene */}
        <div className="relative">
          {beat.result ? (
            // Winner: swap in the illustrator's figure with the return path drawn.
            <SnailPath23G3 showReturn />
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(320, W)} aria-hidden="true">
              <defs>
                <marker id="snail-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,1 L9,5 L0,9 z" fill={INK} />
                </marker>
                <marker id="snail-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,1 L9,5 L0,9 z" fill={GREEN} />
                </marker>
              </defs>

              {/* faint reference gridlines through A */}
              <line x1={aP.x} y1={PAD} x2={aP.x} y2={H - PAD} stroke={GRIDLINE} strokeWidth={1} />
              <line x1={PAD} y1={aP.y} x2={W - PAD} y2={aP.y} stroke={GRIDLINE} strokeWidth={1} />

              {/* the four crawl legs */}
              {LEGS.map((leg, i) => {
                const active = legActive(beat.axis, leg)
                const f = px(leg.from)
                const to = px(leg.to)
                const col = active ? (leg.axis === 'vertical' ? ORANGE : BLUE) : MUTED
                const mid = midpoint(f, to)
                // nudge label off the line
                const lx = leg.axis === 'vertical' ? mid.x + 14 : mid.x
                const ly = leg.axis === 'vertical' ? mid.y : mid.y - 9
                return (
                  <g key={i}>
                    <motion.line
                      x1={f.x}
                      y1={f.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={col}
                      strokeWidth={active ? 4 : 2.5}
                      strokeLinecap="round"
                      markerEnd="url(#snail-arrow)"
                      animate={{ stroke: col, strokeWidth: active ? 4 : 2.5 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    />
                    <motion.text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight={800}
                      animate={{ fill: col, opacity: active ? 1 : 0.55 }}
                    >
                      {leg.label}
                    </motion.text>
                  </g>
                )
              })}

              {/* dashed return path on the both/return-style beats handled by winner;
                  here only the snail + A markers */}

              {/* A marker (home) */}
              <circle cx={aP.x} cy={aP.y} r={5.5} fill={GREEN} />
              <text x={aP.x - 10} y={aP.y + 4} textAnchor="end" fontSize={13} fontWeight={900} fill={INK}>
                A
              </text>

              {/* the snail at its end position */}
              <motion.g
                initial={false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <circle cx={endP.x} cy={endP.y} r={6} fill={ORANGE} stroke="#fff" strokeWidth={1.5} />
                <text x={endP.x} y={endP.y + 1} textAnchor="middle" dominantBaseline="central" fontSize={9}>
                  🐌
                </text>
              </motion.g>

              {/* net-displacement helper lines on the "both" beat: 9 N & 17 E */}
              {beat.axis === 'both' && (
                <>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.5 }}
                    x1={corner.x}
                    y1={corner.y}
                    x2={endP.x}
                    y2={endP.y}
                    stroke={BLUE}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                  />
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    x1={aP.x}
                    y1={aP.y}
                    x2={corner.x}
                    y2={corner.y}
                    stroke={ORANGE}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                  />
                </>
              )}
            </svg>
          )}
        </div>

        {/* net-displacement badges (appear as each axis is collapsed) */}
        <div className="flex min-h-[2rem] items-center justify-center gap-2">
          <AnimatePresence initial={false}>
            {showVertBadge && (
              <motion.span
                key="vert"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-3 py-1 font-display text-xs font-black tabular-nums text-white"
                style={{ background: ORANGE }}
              >
                {`${MOVES.north} − ${MOVES.south} = ${NET_NORTH} ${t('N', 'U')}`}
              </motion.span>
            )}
            {showHorizBadge && (
              <motion.span
                key="horiz"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-3 py-1 font-display text-xs font-black tabular-nums text-white"
                style={{ background: BLUE }}
              >
                {`${MOVES.east} − ${MOVES.west} = ${NET_EAST} ${t('E', 'T')}`}
              </motion.span>
            )}
            {beat.result && (
              <motion.span
                key="ans"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                className="rounded-full px-3 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: GREEN }}
              >
                {`${NET_EAST} + ${NET_NORTH} = ${ANSWER} cm`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption box */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.axis === 'vertical'
                ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                : beat.axis === 'horizontal' || beat.axis === 'both'
                  ? { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
