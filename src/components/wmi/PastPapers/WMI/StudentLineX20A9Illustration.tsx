// SEAMOX-20-A-Q9 — "12 students in a line, 22 m total, equal spacing — distance between 2?"
//
// STEM illustration only — shows the PROBLEM:
//   • A horizontal line with 12 student dots, evenly spaced
//   • First dot labeled "1", last dot labeled "12"
//   • Total distance label "22 m" spanning the full line
//   • One gap labeled "? m" between students 1 and 2
//   • Does NOT show the answer (2 m)
//
// Uses NumberLine primitive for the axis; student dots are MarkDots with ordinal labels.
//
// Co-exports:
//   SVG_W / SVG_H — canvas dimensions (reused by Explainer)
//   N_STUDENTS     — 12
//   TOTAL_M        — 22 (total metres)
//
// Pure SVG, no Math.random, no Date, SSR-safe & deterministic.

import NumberLine, { MarkDot } from './primitives/NumberLine'

// ── layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 440
export const SVG_H = 120

/** Number of students in the line. */
export const N_STUDENTS = 12

/** Total line length in metres. */
export const TOTAL_M = 22

// Colour palette
const INK = '#1F2937'
const BLUE = '#3B82F6'
const AMBER = '#D97706'
const GREEN = '#059669'

// ── Sub-component: dimension arrow ───────────────────────────────────────────

/** Horizontal dimension arrow with label, drawn above the line. */
function DimArrow({
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
  const midX = (x1 + x2) / 2
  const ah = 5 // arrowhead half-height
  return (
    <g>
      {/* main line */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.5} />
      {/* left arrowhead */}
      <polygon
        points={`${x1},${y} ${x1 + 8},${y - ah} ${x1 + 8},${y + ah}`}
        fill={color}
      />
      {/* right arrowhead */}
      <polygon
        points={`${x2},${y} ${x2 - 8},${y - ah} ${x2 - 8},${y + ah}`}
        fill={color}
      />
      {/* tick lines */}
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={color} strokeWidth={1.5} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={color} strokeWidth={1.5} />
      {/* label */}
      <text
        x={midX}
        y={y - 8}
        textAnchor="middle"
        fontSize={11}
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

/**
 * StudentLineX20A9Illustration
 *
 * Stem figure for SEAMOX-20-A-Q9.
 * Shows 12 students on a line spanning 22 m, with the gap "? m" between
 * the first two students highlighted. Does NOT reveal the answer (2 m).
 */
export default function StudentLineX20A9Illustration() {
  // The NumberLine renders min=1 to max=12 with explicit ticks at 1 and 12 only.
  // We override the axis to pixel x-coordinates via NumberLine's marks prop.
  // But since we need DimArrow overlays, we compute pixel positions ourselves.

  const PAD_L = 36
  const PAD_R = 36
  const axisWidth = SVG_W - PAD_L - PAD_R
  const lineY = 70
  const stepPx = axisWidth / (N_STUDENTS - 1)

  /** Pixel x for student i (0-indexed). */
  const xAt = (i: number) => PAD_L + i * stepPx

  const FONT = 'ui-sans-serif, system-ui, sans-serif'

  // Student dot positions
  const dots = Array.from({ length: N_STUDENTS }, (_, i) => i)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        '12 siswa berdiri dalam satu barisan. Panjang total barisan adalah 22 meter. ' +
        'Jarak antar siswa yang berdekatan dilambangkan tanda tanya.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(480, SVG_W)}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── horizontal axis line ── */}
        <line
          x1={xAt(0)}
          y1={lineY}
          x2={xAt(N_STUDENTS - 1)}
          y2={lineY}
          stroke={INK}
          strokeWidth={2.5}
        />

        {/* ── student dots ── */}
        {dots.map((i) => {
          const x = xAt(i)
          const isFirst = i === 0
          const isLast = i === N_STUDENTS - 1
          const color = isFirst || isLast ? BLUE : '#6B7280'
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={lineY}
                r={5}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
              />
              {/* label "1" under first, "12" under last */}
              {(isFirst || isLast) && (
                <text
                  x={x}
                  y={lineY + 18}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={INK}
                  fontFamily={FONT}
                >
                  {i + 1}
                </text>
              )}
            </g>
          )
        })}

        {/* ── total distance arrow (22 m) ── */}
        <DimArrow
          x1={xAt(0)}
          x2={xAt(N_STUDENTS - 1)}
          y={lineY - 28}
          label="22 m"
          color={GREEN}
        />

        {/* ── gap "? m" between student 1 and 2 ── */}
        <DimArrow
          x1={xAt(0)}
          x2={xAt(1)}
          y={lineY + 38}
          label="? m"
          color={AMBER}
        />

        {/* small brace lines from student 1 and 2 down to the "?" arrow */}
        <line
          x1={xAt(0)}
          y1={lineY + 5}
          x2={xAt(0)}
          y2={lineY + 32}
          stroke={AMBER}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <line
          x1={xAt(1)}
          y1={lineY + 5}
          x2={xAt(1)}
          y2={lineY + 32}
          stroke={AMBER}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      </svg>
    </div>
  )
}
