// IKMC-19-PE-Q3 — "Which figure shows a part of this necklace?"
//
// The stem shows the NECKLACE only — the 12-bead circular necklace from the paper.
// Repeating unit (4 beads, cycled 3×): white, black, black, gray.
// Co-exports:
//   - BeadGlyph       — single filled circle bead at (cx, cy)
//   - NECKLACE_CYCLE  — the 4-bead repeating unit
//   - OPTIONS_N3      — the A–E option bead sequences (source of truth)
//   - Necklace3Option — choice renderer for CHOICE_RENDERERS['IKMC-19-PE-Q3']
//
// No Math.random, no Date — SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Bead colours
// ---------------------------------------------------------------------------
export const BEAD_WHITE = '#FFFFFF'
export const BEAD_BLACK = '#1F2937'
export const BEAD_GRAY  = '#9CA3AF'
export const BEAD_STROKE = '#374151'

export type BeadColor = 'W' | 'B' | 'G'   // W=white, B=black, G=gray

export const COLOR_MAP: Record<BeadColor, string> = {
  W: BEAD_WHITE,
  B: BEAD_BLACK,
  G: BEAD_GRAY,
}

export const ARIA_MAP: Record<BeadColor, string> = {
  W: 'white',
  B: 'black',
  G: 'gray',
}

export const ARIA_MAP_ID: Record<BeadColor, string> = {
  W: 'putih',
  B: 'hitam',
  G: 'abu-abu',
}

// ---------------------------------------------------------------------------
// The 4-bead repeating unit and the 12-bead necklace
// ---------------------------------------------------------------------------

/** One full repeating unit of the necklace: white, black, black, gray. */
export const NECKLACE_CYCLE: BeadColor[] = ['W', 'B', 'B', 'G']

/** Full 12-bead sequence (3 repetitions of the cycle). */
export const NECKLACE_BEADS: BeadColor[] = [
  ...NECKLACE_CYCLE,
  ...NECKLACE_CYCLE,
  ...NECKLACE_CYCLE,
]

// ---------------------------------------------------------------------------
// The 5 answer options — source of truth shared with the explainer
// ---------------------------------------------------------------------------

/** A–E bead sequences, exactly as shown in the paper. */
export const OPTIONS_N3: Record<'A' | 'B' | 'C' | 'D' | 'E', BeadColor[]> = {
  A: ['G', 'W', 'B'],           // gray, white, black
  B: ['W', 'B', 'W'],           // white, black, white
  C: ['W', 'B', 'B', 'G'],     // white, black, black, gray  ← CORRECT
  D: ['G', 'B', 'B', 'G'],     // gray, black, black, gray
  E: ['B', 'W', 'B'],           // black, white, black
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Single bead circle centred at (cx, cy). */
export function BeadGlyph({
  color,
  cx,
  cy,
  r = 12,
  strokeWidth = 2,
  opacity = 1,
}: {
  color: BeadColor
  cx: number
  cy: number
  r?: number
  strokeWidth?: number
  opacity?: number
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={COLOR_MAP[color]}
      stroke={BEAD_STROKE}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  )
}

// ---------------------------------------------------------------------------
// Option bead row — shared by the illustration option renderer & explainer
// ---------------------------------------------------------------------------

export function BeadRow({
  beads,
  r = 12,
  gap = 6,
  pad = 8,
}: {
  beads: BeadColor[]
  r?: number
  gap?: number
  pad?: number
}) {
  const cell = 2 * r
  const w = pad * 2 + beads.length * cell + (beads.length - 1) * gap
  const h = pad * 2 + cell
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ maxWidth: Math.min(220, w), display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {beads.map((c, i) => (
        <BeadGlyph
          key={i}
          color={c}
          cx={pad + r + i * (cell + gap)}
          cy={h / 2}
          r={r}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Circular necklace illustration (the STEM)
// ---------------------------------------------------------------------------

const N = NECKLACE_BEADS.length  // 12

/** Centre and radius of the necklace circle. */
const CX = 100
const CY = 100
const NECK_R = 68    // radius of the bead-centre ring
const BEAD_R = 11   // bead radius
const SVG_SIZE = 200

/** Angle (radians) for bead i, starting at top (−π/2), going clockwise. */
function beadAngle(i: number): number {
  return -Math.PI / 2 + (2 * Math.PI * i) / N
}

export default function Necklace3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A circular necklace of 12 beads repeating the pattern: white, black, black, gray."
    >
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        width="100%"
        style={{ maxWidth: SVG_SIZE, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* The string — a thin circle at NECK_R */}
        <circle
          cx={CX}
          cy={CY}
          r={NECK_R}
          fill="none"
          stroke="#6B7280"
          strokeWidth={2}
        />

        {/* The 12 beads */}
        {NECKLACE_BEADS.map((color, i) => {
          const a = beadAngle(i)
          const bx = CX + NECK_R * Math.cos(a)
          const by = CY + NECK_R * Math.sin(a)
          return (
            <BeadGlyph
              key={i}
              color={color}
              cx={bx}
              cy={by}
              r={BEAD_R}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CHOICE_RENDERERS component — renders ONE A–E option as a bead-row picture
// ---------------------------------------------------------------------------

function optionAriaLabel(label: string, beads: BeadColor[]): string {
  return `Option ${label}: ${beads.map((c) => ARIA_MAP[c]).join(', ')}`
}

export function Necklace3Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const beads = OPTIONS_N3[label]
  if (!beads) return <span>{choice?.text}</span>

  const r = 11
  const gap = 6
  const pad = 6
  const cell = 2 * r
  const w = pad * 2 + beads.length * cell + (beads.length - 1) * gap
  const h = pad * 2 + cell + 2

  return (
    <span
      role="img"
      aria-label={optionAriaLabel(label, beads)}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={Math.min(160, w)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {beads.map((c, i) => (
          <BeadGlyph
            key={i}
            color={c}
            cx={pad + r + i * (cell + gap)}
            cy={h / 2}
            r={r}
            strokeWidth={1.8}
          />
        ))}
      </svg>
    </span>
  )
}
