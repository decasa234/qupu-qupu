import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TriangleFills,
  InnerSquare,
  OuterSquare,
  SVG_W,
  SVG_H,
  TL,
  TR,
  BR,
  BL,
  P1,
  P2,
  P3,
  P4,
  INNER_CX,
  INNER_CY,
  BIG_SIDE,
  COLOR,
} from './TiltedSquareTIMO22P4Q16Illustration'
import { buildTiltedSquareTIMO22P4Q16Steps } from './tiltedSquareTIMO22P4Q16Steps'

// TIMO-22-P4H-Q16 — animated solution explainer.
//
// Reuses the geometric primitives from the illustration.
// Beat by beat:
//   0. intro        — static figure, areas given.
//   1. big-square   — highlight outer square side = 8 = a+b.
//   2. small-square — highlight inner square side = 6 = c.
//   3. perimeter    — show a+b+c = 14 (green callout).

const GREEN = COLOR.ANSWER
const BLUE = COLOR.TRIANGLE_EDGE
const AMBER = COLOR.INNER_EDGE
const INK = COLOR.LABEL

// ── Side-brace helper ────────────────────────────────────────────────────────

interface BraceProps {
  x1: number; y1: number; x2: number; y2: number
  label: string; color: string; side?: 'left' | 'right' | 'top' | 'bottom'
}

/** Draws a dimension brace between two points with a label at the midpoint. */
function SideBrace({ x1, y1, x2, y2, label, color, side = 'right' }: BraceProps) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const offset = 18
  // Determine label offset direction based on which side of the square
  const lx = side === 'right' ? mx + offset : side === 'left' ? mx - offset : mx
  const ly = side === 'bottom' ? my + offset : side === 'top' ? my - offset : my

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* end ticks */}
      <line
        x1={x1 - 5} y1={y1} x2={x1 + 5} y2={y1}
        stroke={color} strokeWidth={2} strokeLinecap="round"
        transform={side === 'right' || side === 'left' ? `rotate(90,${x1},${y1})` : ''}
      />
      <line
        x1={x2 - 5} y1={y2} x2={x2 + 5} y2={y2}
        stroke={color} strokeWidth={2} strokeLinecap="round"
        transform={side === 'right' || side === 'left' ? `rotate(90,${x2},${y2})` : ''}
      />
      <text
        x={lx} y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

export default function TiltedSquareTIMO22P4Q16Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildTiltedSquareTIMO22P4Q16Steps(lang as 'en' | 'id')
  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map(s => s.hold),
  })

  const s = story.steps[beat]

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
        overflow="visible"
      >
        {/* background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* static figure */}
        <TriangleFills fill={s.showBigSide ? '#DBEAFE' : COLOR.TRIANGLE} />
        <InnerSquare fill={s.showSmallSide ? '#FDE68A' : COLOR.INNER} />
        <OuterSquare />

        {/* right-angle corner marks */}
        {[
          { cx: TL.x, cy: TL.y, dx: 7, dy: 7 },
          { cx: TR.x, cy: TR.y, dx: -7, dy: 7 },
          { cx: BR.x, cy: BR.y, dx: -7, dy: -7 },
          { cx: BL.x, cy: BL.y, dx: 7, dy: -7 },
        ].map(({ cx, cy, dx, dy }, i) => (
          <path
            key={i}
            d={`M ${cx + dx} ${cy} L ${cx + dx} ${cy + dy} L ${cx} ${cy + dy}`}
            fill="none"
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}

        {/* Beat 1 — big-square: show right-side brace "a+b = 8" */}
        <AnimatePresence>
          {s.showBigSide && (
            <motion.g
              key="big-brace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SideBrace
                x1={TR.x + 10} y1={TL.y}
                x2={TR.x + 10} y2={BR.y}
                label="8"
                color={BLUE}
                side="right"
              />
              <text
                x={TR.x + 32} y={(TL.y + BR.y) / 2 + 12}
                textAnchor="middle" dominantBaseline="central"
                fontSize={10} fill={BLUE}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                = a+b
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Beat 2 — small-square: label the inner square's side c = 6 */}
        <AnimatePresence>
          {s.showSmallSide && (
            <motion.g
              key="small-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* label on the top-right side of the inner square (P1 → P2) */}
              <text
                x={(P1.x + P2.x) / 2 + 8}
                y={(P1.y + P2.y) / 2 - 10}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill={AMBER}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                c = 6
              </text>
              {/* tick on that side */}
              <line
                x1={P1.x} y1={P1.y}
                x2={P2.x} y2={P2.y}
                stroke={AMBER} strokeWidth={2.5}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Inner area label */}
        <text
          x={INNER_CX} y={INNER_CY - 5}
          textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Luas = 36
        </text>

        {/* Outer area label (top-left corner of the big square region) */}
        <text
          x={TL.x + 8} y={TL.y + 10}
          textAnchor="start" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Luas = 64
        </text>

        {/* Beat 3 — result: green perimeter annotation */}
        <AnimatePresence>
          {s.showResult && (
            <motion.g
              key="result"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              {/* highlight one triangle edge with the perimeter breakdown */}
              <line
                x1={P1.x} y1={P1.y} x2={TL.x} y2={TL.y}
                stroke={GREEN} strokeWidth={3} strokeLinecap="round"
              />
              <line
                x1={TL.x} y1={TL.y} x2={P4.x} y2={P4.y}
                stroke={GREEN} strokeWidth={3} strokeLinecap="round"
              />
              <line
                x1={P1.x} y1={P1.y} x2={P4.x} y2={P4.y}
                stroke={GREEN} strokeWidth={3} strokeLinecap="round"
              />
              <text
                x={TL.x - 30} y={TL.y + BIG_SIDE / 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={800}
                fill={GREEN}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                14
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Caption + equation panel */}
      <div className="max-w-xs text-center">
        {s.equation && (
          <p className="mb-1 text-sm font-bold" style={{ color: s.result ? GREEN : BLUE }}>
            {s.equation}
          </p>
        )}
        <p className="text-xs text-gray-600">{s.caption}</p>
      </div>
    </div>
  )
}
