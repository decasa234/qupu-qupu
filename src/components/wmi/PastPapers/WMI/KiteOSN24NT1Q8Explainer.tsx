// OSN-24-SD-NAS-TEORI1-Q8 — post-answer animated explainer.
//
// Reuses the kite geometry from KiteOSN24NT1Q8Illustration so the
// animation reads as the static scene coming alive.
//
// Beats:
//   0. intro    — static coloured kite; read conditions.
//   1. ratio    — highlight diagonals; BC×AF = 200; AD = AF/2.
//   2. orange   — fade in orange upper region; area = 50 cm².
//   3. point-e  — highlight DE segment; DE = AF/4.
//   4. white    — reveal white B-E-C in green; area = 25 cm².
//   5. result   — 25 cm².

import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import {
  SVG_W,
  SVG_H,
  A, B, C, D, E, F,
  COLOR,
} from './KiteOSN24NT1Q8Illustration'
import { buildKiteOSN24NT1Q8Steps } from './kiteOSN24NT1Q8Steps'

const FIG_W = Math.min(240, SVG_W)
const GREEN   = '#10B981'
const AMBER   = '#F59E0B'
const INK     = COLOR.LABEL

function pt(p: { x: number; y: number }) {
  return `${p.x},${p.y}`
}

// ── animated overlay components ──────────────────────────────────────────────

function FadePolygon({
  pts,
  fill,
  opacity = 0.55,
  strokeWidth = 0,
}: {
  pts: { x: number; y: number }[]
  fill: string
  opacity?: number
  strokeWidth?: number
}) {
  return (
    <motion.polygon
      points={pts.map(pt).join(' ')}
      fill={fill}
      fillOpacity={opacity}
      stroke={fill}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    />
  )
}

function FadeLine({
  x1, y1, x2, y2,
  color,
  width = 2.5,
  dash = '',
}: {
  x1: number; y1: number; x2: number; y2: number
  color: string; width?: number; dash?: string
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
  )
}

// ── explainer ────────────────────────────────────────────────────────────────

export default function KiteOSN24NT1Q8Explainer({ lang }: ExplainerProps) {
  const storyboard = useMemo(() => buildKiteOSN24NT1Q8Steps(lang), [lang])
  // Local beat navigation (house pattern — see ShadedSquare20B5Explainer).
  const [index, setIndex] = useState(0)
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, storyboard.finalIndex)),
    [storyboard.finalIndex],
  )
  const isFirst = index === 0
  const isFinal = index === storyboard.finalIndex
  const beat = storyboard.steps[index]

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      {/* SVG figure */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={FIG_W}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── static coloured base ── */}
        {/* orange upper */}
        <AnimatePresence>
          {beat.showOrange && (
            <FadePolygon key="orange" pts={[A, B, C]} fill={COLOR.ORANGE} opacity={0.9} />
          )}
        </AnimatePresence>

        {/* blue wings */}
        <AnimatePresence>
          {beat.showBlue && (
            <g>
              <FadePolygon key="blueL" pts={[B, E, F]} fill={COLOR.BLUE} opacity={0.85} />
              <FadePolygon key="blueR" pts={[C, E, F]} fill={COLOR.BLUE} opacity={0.85} />
            </g>
          )}
        </AnimatePresence>

        {/* white region — revealed in green on beat 'white' */}
        <AnimatePresence>
          {beat.showWhite && (
            <FadePolygon key="white" pts={[B, E, C]} fill={GREEN} opacity={0.55} />
          )}
        </AnimatePresence>

        {/* ── kite outline ── */}
        <polygon
          points={[A, B, F, C].map(pt).join(' ')}
          fill="none"
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ── dashed diagonals (always visible base) ── */}
        <line x1={A.x} y1={A.y} x2={F.x} y2={F.y} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="5 3" />
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="5 3" />

        {/* ── highlighted diagonals ── */}
        <AnimatePresence>
          {beat.showDiagAF && (
            <FadeLine key="dAF" x1={A.x} y1={A.y} x2={F.x} y2={F.y} color={AMBER} width={3} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {beat.showDiagBC && (
            <FadeLine key="dBC" x1={B.x} y1={B.y} x2={C.x} y2={C.y} color={AMBER} width={3} />
          )}
        </AnimatePresence>

        {/* ── DE segment highlight ── */}
        <AnimatePresence>
          {beat.showDE && (
            <FadeLine key="DE" x1={D.x} y1={D.y} x2={E.x} y2={E.y} color={GREEN} width={3.5} />
          )}
        </AnimatePresence>

        {/* ── inner B-E and C-E lines ── */}
        <line x1={B.x} y1={B.y} x2={E.x} y2={E.y} stroke={INK} strokeWidth={1.2} />
        <line x1={C.x} y1={C.y} x2={E.x} y2={E.y} stroke={INK} strokeWidth={1.2} />

        {/* ── vertex dots ── */}
        {[A, B, C, D, E, F].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={INK} />
        ))}

        {/* ── labels ── */}
        <text x={A.x} y={A.y - 8}   textAnchor="middle" fontSize={13} fontWeight={700} fill={INK} fontFamily="ui-sans-serif,system-ui,sans-serif">A</text>
        <text x={B.x - 10} y={B.y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK} fontFamily="ui-sans-serif,system-ui,sans-serif">B</text>
        <text x={C.x + 10} y={C.y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK} fontFamily="ui-sans-serif,system-ui,sans-serif">C</text>
        <text x={D.x + 10} y={D.y - 4} textAnchor="start" fontSize={13} fontWeight={700} fill={INK} fontFamily="ui-sans-serif,system-ui,sans-serif">D</text>
        <text x={E.x + 10} y={E.y + 4} textAnchor="start" fontSize={13} fontWeight={700} fill={INK} fontFamily="ui-sans-serif,system-ui,sans-serif">E</text>
        <text x={F.x} y={F.y + 16}  textAnchor="middle" fontSize={13} fontWeight={700} fill={INK} fontFamily="ui-sans-serif,system-ui,sans-serif">F</text>

        {/* ── equation overlay ── */}
        {beat.equation && (
          <text
            x={SVG_W / 2}
            y={SVG_H - 10}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill={beat.result ? GREEN : '#1D4ED8'}
            fontFamily="ui-monospace,monospace"
          >
            {beat.equation}
          </text>
        )}
      </svg>

      {/* caption */}
      <p className="max-w-xs text-center text-sm leading-snug text-gray-700">
        {beat.caption}
      </p>

      {/* nav */}
      <div className="flex gap-3">
        <button
          onClick={prev}
          disabled={isFirst}
          className="rounded bg-gray-100 px-3 py-1 text-sm disabled:opacity-30"
        >
          ‹
        </button>
        <button
          onClick={next}
          disabled={isFinal}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  )
}
