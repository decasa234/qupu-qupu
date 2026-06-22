// IKMC-22-EC-Q2 — "Four of the following are a picture of the Great Wheel at
// the Luna park. Which one is the different one?"  Answer: E.
//
// The Great Wheel (Ferris wheel) has 10 gondolas in alternating blue / yellow
// at the 10 equally-spaced spoke tips, plus small connecting lines between
// adjacent gondolas (the outer rim). Options A–D are the SAME wheel at four
// different rotation states (each a multiple of 18° from each other). Option E
// has two adjacent yellow gondolas at the top — breaking the strict alternation
// and making it the odd one out.
//
// Co-exports:
//   WheelDiagram     — shared primitive (wheel at a given rotation / color map)
//   Wheel2ECOption   — choice renderer for CHOICE_RENDERERS
//
// Pure SVG, no Math.random, no Date. SSR-safe and deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── palette ──────────────────────────────────────────────────────────────────
const BLUE        = '#3B9AE1'
const YELLOW      = '#F5C842'
const HUB         = '#1F2937'
const SPOKE       = '#374151'
const POLE_COLOR  = '#DC2626'
const GONDOLA_STROKE = '#1F2937'
const RIM         = '#374151'

// ── geometry ─────────────────────────────────────────────────────────────────
const CX = 80      // wheel centre x
const CY = 76      // wheel centre y
const R_SPOKE = 54 // spoke length (to gondola centre)
const R_HUB   = 7  // hub radius
const R_GONDOLA = 10 // gondola circle radius
const POLE_W  = 5  // pole width
const POLE_TOP_Y = CY  // pole starts at wheel centre
const POLE_BOT_Y = 148 // pole bottom (ground area)
const SVG_W = 160
const SVG_H = 160

// ── helpers ───────────────────────────────────────────────────────────────────

/** Polar coordinates on the wheel circle (0° = 12 o'clock, CW). */
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

// ── WheelDiagram primitive ────────────────────────────────────────────────────

export interface WheelColors {
  /** 10 gondola colors, index 0 = 12 o'clock, increasing clockwise at 36° steps. */
  gondolas: string[]
}

/**
 * Build the standard alternating color sequence rotated by `rotDeg` degrees.
 * rotDeg 0  → gondola 0 (top) = BLUE.
 * We shift the color assignments by `shift` positions (each position = 36°).
 */
export function standardColors(shift: number): WheelColors {
  return {
    gondolas: Array.from({ length: 10 }, (_, i) => {
      // shift: rotates which gondola gets which base color
      return (i + shift) % 2 === 0 ? BLUE : YELLOW
    }),
  }
}

/** The odd-one-out color map for option E: two yellows adjacent at the top. */
export const OPTION_E_COLORS: WheelColors = {
  // Two yellows at positions 0 and 1 (top area), then alternating from 2 onward
  gondolas: [YELLOW, YELLOW, BLUE, YELLOW, BLUE, YELLOW, BLUE, YELLOW, BLUE, BLUE],
}

/**
 * WheelDiagram — shared Ferris-wheel SVG primitive.
 *
 * @param colors  10-element color array (one per gondola, clockwise from 12 o'clock).
 * @param width   SVG display width; height scales proportionally.
 */
export function WheelDiagram({ colors, width = 120 }: { colors: WheelColors; width?: number }) {
  const aspect = SVG_H / SVG_W
  const h = Math.round(width * aspect)

  // Gondola positions (spoke tip)
  const positions = Array.from({ length: 10 }, (_, i) => polar(R_SPOKE, i * 36))

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={width}
      height={h}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* red support pole */}
      <rect
        x={CX - POLE_W / 2}
        y={POLE_TOP_Y}
        width={POLE_W}
        height={POLE_BOT_Y - POLE_TOP_Y}
        fill={POLE_COLOR}
      />

      {/* spokes: hub centre → each gondola centre */}
      {positions.map((pos, i) => (
        <line
          key={`spoke-${i}`}
          x1={CX}
          y1={CY}
          x2={pos.x}
          y2={pos.y}
          stroke={SPOKE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}

      {/* outer rim: lines connecting adjacent gondola centres */}
      {positions.map((pos, i) => {
        const next = positions[(i + 1) % 10]
        return (
          <line
            key={`rim-${i}`}
            x1={pos.x}
            y1={pos.y}
            x2={next.x}
            y2={next.y}
            stroke={RIM}
            strokeWidth={1}
            strokeLinecap="round"
          />
        )
      })}

      {/* gondola circles */}
      {positions.map((pos, i) => (
        <circle
          key={`gondola-${i}`}
          cx={pos.x}
          cy={pos.y}
          r={R_GONDOLA}
          fill={colors.gondolas[i]}
          stroke={GONDOLA_STROKE}
          strokeWidth={1.5}
        />
      ))}

      {/* hub circle on top */}
      <circle
        cx={CX}
        cy={CY}
        r={R_HUB}
        fill={HUB}
        stroke={HUB}
        strokeWidth={1}
      />
    </svg>
  )
}

// ── Per-option color maps ──────────────────────────────────────────────────────
//
// A–D are valid rotations of the standard alternating wheel.
// Rotation 0° → gondola 0 (top) = BLUE.
// Each shift step = 36° clockwise, which cycles through BLUE/YELLOW for that slot.
// We pick 4 visually distinct rotations that match the source images.
//
//   A: shift 1 → gondola 0 = YELLOW  (matches 002.jpg: top-left is yellow)
//   B: shift 0 → gondola 0 = BLUE    (matches 003.jpg: top-centre-left is blue)
//   C: shift 3 → gondola 0 = YELLOW  (matches 004.jpg: top has yellow)
//   D: shift 2 → gondola 0 = BLUE    (matches 005.jpg: top has blue-yellow)
//   E: OPTION_E_COLORS               (two yellows at top — the odd one)

const OPTION_COLORS: Record<string, WheelColors> = {
  A: standardColors(1),
  B: standardColors(0),
  C: standardColors(3),
  D: standardColors(2),
  E: OPTION_E_COLORS,
}

// ── Aria descriptions ──────────────────────────────────────────────────────────

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: Ferris wheel with 10 gondolas alternating yellow and blue, spoke pattern, red pole.',
    id: 'Pilihan A: Kincir Besar dengan 10 gondola bergantian kuning dan biru, pola jari-jari, tiang merah.',
  },
  B: {
    en: 'Option B: Ferris wheel with 10 gondolas alternating blue and yellow, rotated position, red pole.',
    id: 'Pilihan B: Kincir Besar dengan 10 gondola bergantian biru dan kuning, posisi diputar, tiang merah.',
  },
  C: {
    en: 'Option C: Ferris wheel with 10 gondolas alternating yellow and blue, different rotation, red pole.',
    id: 'Pilihan C: Kincir Besar dengan 10 gondola bergantian kuning dan biru, rotasi berbeda, tiang merah.',
  },
  D: {
    en: 'Option D: Ferris wheel with 10 gondolas alternating blue and yellow, another rotation, red pole.',
    id: 'Pilihan D: Kincir Besar dengan 10 gondola bergantian biru dan kuning, rotasi lain, tiang merah.',
  },
  E: {
    en: 'Option E: Ferris wheel where two yellow gondolas are next to each other at the top — this breaks the alternating pattern.',
    id: 'Pilihan E: Kincir Besar di mana dua gondola kuning berdampingan di bagian atas — ini melanggar pola bergantian.',
  },
}

// ── Stem illustration ─────────────────────────────────────────────────────────

/**
 * Wheel2ECIllustration
 *
 * Stem figure for IKMC-22-EC-Q2. Shows all five Ferris wheel options
 * as the problem figure. Does NOT reveal the answer (which is E).
 */
export default function Wheel2ECIllustration() {
  const labels = ['A', 'B', 'C', 'D', 'E'] as const

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Five pictures of a Ferris wheel (Great Wheel) at a Luna park. ' +
        'Four of them show the same wheel at different rotation states with ' +
        'strictly alternating blue and yellow gondolas. Find the one that is different.'
      }
    >
      <div className="flex flex-wrap items-end justify-center gap-3" aria-hidden="true">
        {labels.map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <WheelDiagram colors={OPTION_COLORS[label]} width={100} />
            <span
              className="font-display text-xs font-bold"
              style={{ color: '#1F2937' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * Wheel2ECOption — choice renderer for CHOICE_RENDERERS['IKMC-22-EC-Q2'].
 * Renders ONE answer choice (A/B/C/D/E) as an SVG Ferris wheel.
 */
export function Wheel2ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label as keyof typeof OPTION_COLORS
  const colors = OPTION_COLORS[k]
  const aria = OPTION_ARIA[k]

  if (!colors) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <WheelDiagram colors={colors} width={90} />
    </span>
  )
}
