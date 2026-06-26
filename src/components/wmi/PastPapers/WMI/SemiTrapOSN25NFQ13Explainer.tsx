// OSN-25-SD-NAS-FINAL-Q13 — explainer animasi luas trapesium ORSQ
//
// Beat walk:
//   0. intro    — tampilkan gambar soal, sebutkan data yang diberikan
//   1. oq       — tandai OP=4 cm, OQ=16 cm pada diameter
//   2. find-r   — sorot OR, tunjukkan OR = √(10²−6²) = 8 cm
//   3. find-qs  — sorot QS = (3/4)×8 = 6 cm
//   4. height   — tunjukkan tinggi trapesium OQ = 16 cm
//   5. area     — Luas = ½×(8+6)×16 = 112 cm²  [hasil]

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W, SVG_H, SCALE,
  Mx, My, RAD,
  Px, Py, Qx, Qy, Ox, Oy, Rx, Ry, Sx, Sy,
  C,
} from './SemiTrapOSN25NFQ13Illustration'
import { buildSemiTrapOSN25NFQ13Steps } from './semiTrapOSN25NFQ13Steps'

// ── colour tokens ────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const ORANGE = '#F59E0B'
const INK    = '#1E293B'
const HATCH_EX_ID = 'osn25nfq13-ex-hatch'

// ── helpers ──────────────────────────────────────────────────────────────────

/** Vertical dimension brace with tick-marks and a label. */
function VBrace({
  x, y1, y2, label, color, side = 1,
}: {
  x: number; y1: number; y2: number; label: string; color: string; side?: 1 | -1
}) {
  const bx = x + side * 18
  const mid = (y1 + y2) / 2
  const tk = 5
  return (
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <line x1={bx} y1={y1} x2={bx} y2={y2} />
      <line x1={bx - tk} y1={y1} x2={bx + tk} y2={y1} />
      <line x1={bx - tk} y1={y2} x2={bx + tk} y2={y2} />
      <text
        x={bx + side * 7}
        y={mid}
        fill={color}
        fontSize={11}
        fontWeight={800}
        textAnchor={side === 1 ? 'start' : 'end'}
        dominantBaseline="central"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/** Horizontal dimension brace below a line. */
function HBrace({
  x1, x2, y, label, color,
}: {
  x1: number; x2: number; y: number; label: string; color: string
}) {
  const by = y + 20
  const mid = (x1 + x2) / 2
  const tk = 5
  return (
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <line x1={x1} y1={by} x2={x2} y2={by} />
      <line x1={x1} y1={by - tk} x2={x1} y2={by + tk} />
      <line x1={x2} y1={by - tk} x2={x2} y2={by + tk} />
      <text
        x={mid}
        y={by + 14}
        fill={color}
        fontSize={11}
        fontWeight={800}
        textAnchor="middle"
        dominantBaseline="hanging"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/** Small diameter dimension label above the line. */
function DiamLabel({ x1, x2, label, color }: { x1: number; x2: number; label: string; color: string }) {
  const mid = (x1 + x2) / 2
  const yPos = My - 10
  return (
    <g>
      <line x1={x1} y1={yPos - 2} x2={x1} y2={My + 2} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={x2} y1={yPos - 2} x2={x2} y2={My + 2} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={x1} y1={yPos} x2={x2} y2={yPos} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <text
        x={mid}
        y={yPos - 6}
        fill={color}
        fontSize={10}
        fontWeight={800}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── main explainer ───────────────────────────────────────────────────────────

export default function SemiTrapOSN25NFQ13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildSemiTrapOSN25NFQ13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: BLUE, color: BLUE }

  const trap = `${Ox},${Oy} ${Rx},${Ry} ${Sx},${Sy} ${Qx},${Qy}`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={lang === 'id' ? 'Penjelasan luas ORSQ = 112 cm²' : 'Explainer for area of ORSQ = 112 cm²'}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 310)} style={{ display: 'block' }} aria-hidden="true">
          <defs>
            <pattern id={HATCH_EX_ID} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke={isResult ? '#6EE7B7' : C.hatch} strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* diameter line */}
          <line x1={Px - 14} y1={My} x2={Qx + 14} y2={My} stroke={C.axis} strokeWidth={1.5} />

          {/* semicircle arc */}
          <path d={`M ${Px} ${Py} A ${RAD} ${RAD} 0 0 0 ${Qx} ${Qy}`} fill="none" stroke={C.arc} strokeWidth={2} />

          {/* trapezoid */}
          <polygon points={trap} fill={isResult ? '#D1FAE5' : C.fill} stroke="none" />
          <polygon
            points={trap}
            fill={`url(#${HATCH_EX_ID})`}
            stroke={isResult ? GREEN : C.border}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* right-angle box at Q */}
          <path d={`M ${Qx - 11},${Qy} L ${Qx - 11},${Qy - 11} L ${Qx},${Qy - 11}`} fill="none" stroke={C.right} strokeWidth={1.5} />

          {/* key points */}
          {([{ x: Px, y: Py }, { x: Ox, y: Oy }, { x: Qx, y: Qy }, { x: Rx, y: Ry }, { x: Sx, y: Sy }] as const).map(({ x, y }, i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill={C.dot} />
          ))}

          {/* static labels */}
          {([
            { x: Px, y: Py, text: 'P', dx: 0, dy: 17, anchor: 'middle' },
            { x: Ox, y: Oy, text: 'O', dx: 0, dy: 17, anchor: 'middle' },
            { x: Qx, y: Qy, text: 'Q', dx: 0, dy: 17, anchor: 'middle' },
            { x: Rx, y: Ry, text: 'R', dx: -14, dy: 0, anchor: 'end' },
            { x: Sx, y: Sy, text: 'S', dx: 15, dy: 0, anchor: 'start' },
          ] as const).map(({ x, y, text, dx, dy, anchor }) => (
            <text
              key={text}
              x={x + dx}
              y={y + dy}
              fontSize={13}
              fontWeight={700}
              fill={INK}
              textAnchor={anchor}
              dominantBaseline="central"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {text}
            </text>
          ))}

          {/* beat-driven overlays */}

          {/* OP and OQ dimension labels on diameter */}
          <AnimatePresence>
            {beat.showDiamDims && (
              <motion.g key="diam-dims" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <DiamLabel x1={Px} x2={Ox} label={`OP=${4 * SCALE / SCALE} cm`} color={ORANGE} />
                <DiamLabel x1={Ox} x2={Qx} label="OQ=16 cm" color={BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* OR brace (left side) */}
          <AnimatePresence>
            {beat.showOR && (
              <motion.g key="or-brace" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <VBrace x={Rx} y1={Ry} y2={Oy} label="OR=8 cm" color={BLUE} side={-1} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* QS brace (right side) */}
          <AnimatePresence>
            {beat.showQS && (
              <motion.g key="qs-brace" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <VBrace x={Sx} y1={Sy} y2={Qy} label="QS=6 cm" color={ORANGE} side={1} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* OQ horizontal brace (height of trapezoid, below figure) */}
          <AnimatePresence>
            {beat.showHeight && (
              <motion.g key="height-brace" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 20 }}>
                <HBrace x1={Ox} x2={Qx} y={Qy} label="16 cm" color={isResult ? GREEN : BLUE} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: accentColor }}
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
