// OSN 2015 SD Nasional Q20 — animated post-answer explainer.
// Reuses geometry from CollinearRunOSN15NQ20Illustration.
//
// Beat sequence (5 beats):
//   0. intro    — A-B-C with distance braces (7k / 5k / 2k)
//   1. speeds   — speed labels + direction arrows toward C
//   2. meet-eq  — position equations in the strip (no overlay change)
//   3. solve    — meeting-point marker appears on the line
//   4. result   — marker highlighted gold, answer confirmed

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MarkDot } from './primitives/NumberLine'
import {
  SVG_W,
  LINE_Y,
  X_A,
  X_B,
  X_C,
  COL,
  xAt,
} from './CollinearRunOSN15NQ20Illustration'
import { buildCollinearRunSteps } from './collinearRunOSN15NQ20Steps'

// ── Layout ────────────────────────────────────────────────────────────────────

const FONT = 'ui-sans-serif, system-ui, sans-serif'
/** Explainer SVG is taller than illustration to make room for brace overlays. */
const EXP_H = 140
const MARK_R = 5
const PAD = 28

/**
 * Meeting point: at t = 4 both runners are 3k from C, which in domain coords
 * (0 = A, 7 = C) is position 7 − 3 = 4 → xAt(4).
 */
const X_MEET = xAt(4)   // ~159 px

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * Horizontal measurement brace spanning x1–x2 at y, with a label above.
 * Tick marks at both ends; label centred above the mid-point.
 */
function Brace({
  x1,
  x2,
  y,
  label,
  color,
}: {
  x1: number
  x2: number
  y: number
  label: string
  color: string
}) {
  const mx = (x1 + x2) / 2
  const hw = 4
  return (
    <g stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - hw} x2={x1} y2={y + hw} />
      <line x1={x2} y1={y - hw} x2={x2} y2={y + hw} />
      <text
        x={mx}
        y={y - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={color}
        stroke="none"
        fontFamily={FONT}
      >
        {label}
      </text>
    </g>
  )
}

// ── Main Explainer ────────────────────────────────────────────────────────────

export default function CollinearRunOSN15NQ20Explainer({
  lang = 'id',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(() => buildCollinearRunSteps(lang), [lang])
  const beatIndex = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[Math.min(beatIndex, story.finalIndex)]

  const pts: Array<{ x: number; label: string; color: string }> = [
    { x: X_A, label: 'A', color: COL.A },
    { x: X_B, label: 'B', color: COL.B },
    { x: X_C, label: 'C', color: COL.C },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${SVG_W} ${EXP_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={EXP_H} fill="white" />

        {/* ── base: axis line ──────────────────────────────────────────────── */}
        <line
          x1={PAD - 8}
          y1={LINE_Y}
          x2={X_C + 8}
          y2={LINE_Y}
          stroke={COL.LINE}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* ── base: A / B / C labeled dots ─────────────────────────────────── */}
        {pts.map(({ x, label, color }) => (
          <g key={label}>
            <MarkDot x={x} lineY={LINE_Y} color={color} />
            <text
              x={x}
              y={LINE_Y - MARK_R - 8}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={color}
              fontFamily={FONT}
            >
              {label}
            </text>
          </g>
        ))}

        {/* ── Beat 0: distance brace overlays ──────────────────────────────── */}
        <AnimatePresence>
          {beat.showBraces && (
            <motion.g
              key="braces"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* AC full span — above the line */}
              <Brace
                x1={X_A}
                x2={X_C}
                y={LINE_Y - 24}
                label="AC = 7k"
                color="#6B7280"
              />
              {/* AB segment — below the line */}
              <Brace
                x1={X_A}
                x2={X_B}
                y={LINE_Y + 34}
                label="AB = 2k"
                color={COL.A}
              />
              {/* BC segment — below the line (same y as AB, no overlap since A<B<C) */}
              <Brace
                x1={X_B}
                x2={X_C}
                y={LINE_Y + 34}
                label="BC = 5k"
                color={COL.B}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Beat 1: speed labels + direction arrows ───────────────────────── */}
        <AnimatePresence>
          {beat.showSpeeds && (
            <motion.g
              key="speeds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Amir arrow: from A toward C (upper track below axis) */}
              <line
                x1={X_A + 7}
                y1={LINE_Y + 16}
                x2={X_C - 9}
                y2={LINE_Y + 16}
                stroke={COL.A}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <polygon
                points={`${X_C - 9},${LINE_Y + 12} ${X_C - 1},${LINE_Y + 16} ${X_C - 9},${LINE_Y + 20}`}
                fill={COL.A}
              />
              <text
                x={(X_A + X_C) / 2}
                y={LINE_Y + 30}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={COL.A}
                fontFamily={FONT}
              >
                {lang === 'id' ? 'Amir  k/mnt' : 'Amir  k/min'}
              </text>

              {/* Budi arrow: from B toward C (lower track) */}
              <line
                x1={X_B + 7}
                y1={LINE_Y + 42}
                x2={X_C - 9}
                y2={LINE_Y + 42}
                stroke={COL.B}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <polygon
                points={`${X_C - 9},${LINE_Y + 38} ${X_C - 1},${LINE_Y + 42} ${X_C - 9},${LINE_Y + 46}`}
                fill={COL.B}
              />
              <text
                x={(X_B + X_C) / 2}
                y={LINE_Y + 56}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={COL.B}
                fontFamily={FONT}
              >
                {lang === 'id' ? 'Budi  k/2 mnt' : 'Budi  k/2 min'}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Beats 3 & 4: meeting-point marker at xAt(4) ─────────────────── */}
        <AnimatePresence>
          {beat.showMeetPoint && (
            <motion.g
              key="meet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <circle
                cx={X_MEET}
                cy={LINE_Y}
                r={9}
                fill={beat.result ? '#FEF3C7' : '#ECFDF5'}
                stroke={beat.result ? '#D97706' : '#10B981'}
                strokeWidth={2.5}
              />
              <text
                x={X_MEET}
                y={LINE_Y - 22}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={800}
                fill={beat.result ? '#D97706' : '#059669'}
                fontFamily={FONT}
              >
                t=4
              </text>
              {/* small vertical drop line from label to circle */}
              <line
                x1={X_MEET}
                y1={LINE_Y - 16}
                x2={X_MEET}
                y2={LINE_Y - 9}
                stroke={beat.result ? '#D97706' : '#059669'}
                strokeWidth={1}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* equation strip */}
      <div
        className="rounded-md bg-slate-50 px-3 py-2 text-center font-mono text-sm font-bold text-slate-700"
        style={{ minWidth: 260, maxWidth: 300 }}
      >
        {beat.equation}
      </div>

      {/* caption */}
      <p className="max-w-xs text-center text-sm leading-snug text-slate-600">
        {beat.caption}
      </p>
    </div>
  )
}
