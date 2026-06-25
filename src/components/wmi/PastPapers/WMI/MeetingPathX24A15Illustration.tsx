/**
 * SEAMOX-24-A-Q15 — "John left home for the park at 0730 h, at 60 m/min. His
 * brother returned from the park at the same time at 70 m/min. Distance = 2600 m.
 * At what time did they meet?"
 *
 * STATIC PROBLEM FIGURE:
 *   House (Home) ←————————————————→ Tree (Park)
 *          ↓60 m/min            ↑70 m/min
 *        [John →]             [← Brother]
 *   |←——————————— 2600 m ——————————————→|
 *
 * Re-uses House + Tree glyphs from ./primitives/glyphs (no bespoke geometry).
 * The STEM never shows the meeting point — that is revealed by the explainer.
 *
 * Pure render: no hooks, no randomness, SSR-safe.
 */

import { House, Tree } from './primitives/glyphs'

// ── Layout constants (shared with Explainer) ──────────────────────────────────

export const SVG_W = 420
export const SVG_H = 165

/** Y of the ground / road line. */
export const TRACK_Y = 100

/** X-centre of the Home endpoint. */
export const HOME_X = 58

/** X-centre of the Park endpoint. */
export const PARK_X = 362

/** Y-centre for the icons above the track. */
export const ICON_CY = 54

/** X-centre of John (left figure). */
export const JOHN_X = 130

/** X-centre of Brother (right figure). */
export const BROTHER_X = 290

// ── Colours ───────────────────────────────────────────────────────────────────

const INK = '#1F2937'
const TRACK_COLOR = '#94A3B8'
const ARROW_COLOR = '#2563EB'
const BRACE_COLOR = '#374151'

// ── Stick figure ──────────────────────────────────────────────────────────────

/**
 * Simple 5-element stick figure.
 * dir='right' → arms lean forward-right; dir='left' → mirrored.
 */
function StickFigure({ cx, cy, dir }: { cx: number; cy: number; dir: 'right' | 'left' }) {
  const headR = 7
  const bodyTop = cy - 22
  const bodyBot = cy
  const sign = dir === 'right' ? 1 : -1

  return (
    <g>
      {/* head */}
      <circle cx={cx} cy={bodyTop - headR} r={headR} fill="#FBBF24" stroke="#D97706" strokeWidth={1.5} />
      {/* body */}
      <line x1={cx} y1={bodyTop} x2={cx} y2={bodyBot} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {/* arms: angled toward movement direction */}
      <line
        x1={cx - sign * 10}
        y1={bodyTop + 7}
        x2={cx + sign * 13}
        y2={bodyTop + 14}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* leg 1 (back) */}
      <line x1={cx} y1={bodyBot} x2={cx - sign * 8} y2={bodyBot + 14} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {/* leg 2 (front) */}
      <line x1={cx} y1={bodyBot} x2={cx + sign * 6} y2={bodyBot + 14} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// ── Arrow (line + chevron head) ───────────────────────────────────────────────

function DirectionArrow({
  x1, y, x2, dir,
}: { x1: number; y: number; x2: number; dir: 'right' | 'left' }) {
  const headLen = 9
  const headH = 5
  if (dir === 'right') {
    return (
      <g fill={ARROW_COLOR} stroke={ARROW_COLOR} strokeWidth={2} strokeLinecap="round">
        <line x1={x1} y1={y} x2={x2} y2={y} />
        <polygon points={`${x2},${y} ${x2 - headLen},${y - headH} ${x2 - headLen},${y + headH}`} stroke="none" />
      </g>
    )
  }
  return (
    <g fill={ARROW_COLOR} stroke={ARROW_COLOR} strokeWidth={2} strokeLinecap="round">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <polygon points={`${x2},${y} ${x2 + headLen},${y - headH} ${x2 + headLen},${y + headH}`} stroke="none" />
    </g>
  )
}

// ── Curly brace (simple zig-zag brace) ────────────────────────────────────────

function Brace({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const mid = (x1 + x2) / 2
  const arm = 10   // height of the curly tip

  // Path: left tip → left wing → centre tip → right wing → right tip
  const d = [
    `M ${x1} ${y - arm}`,
    `Q ${x1} ${y} ${x1 + 12} ${y}`,
    `L ${mid - 6} ${y}`,
    `Q ${mid} ${y} ${mid} ${y + arm}`,
    `Q ${mid} ${y} ${mid + 6} ${y}`,
    `L ${x2 - 12} ${y}`,
    `Q ${x2} ${y} ${x2} ${y - arm}`,
  ].join(' ')

  return (
    <g>
      <path d={d} fill="none" stroke={BRACE_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <text
        x={mid}
        y={y + arm + 16}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={13}
        fontWeight={700}
        fill={BRACE_COLOR}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────

function SpeedLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="auto"
      fontSize={11}
      fontWeight={700}
      fill={ARROW_COLOR}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {text}
    </text>
  )
}

// ── Shared SVG body (reused by Explainer) ────────────────────────────────────

export interface MeetingPathSVGProps {
  /** Fraction (0..1) of the 2600 m already covered jointly (explainer only). */
  progressFraction?: number
  /** Show the meeting marker (explainer final beat). */
  showMeeting?: boolean
  /** Highlight colour override for the combined-speed beat. */
  highlightSpeed?: boolean
}

export function MeetingPathSVG({
  showMeeting = false,
}: MeetingPathSVGProps) {
  // Meeting point x-position (proportional to John's share of the distance)
  // John covers 60/(60+70) × (PARK_X - HOME_X) = ~0.4615 of the gap
  const gap = PARK_X - HOME_X
  const meetX = HOME_X + (60 / 130) * gap   // ≈ 224

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* road / ground line */}
      <line x1={HOME_X} y1={TRACK_Y} x2={PARK_X} y2={TRACK_Y} stroke={TRACK_COLOR} strokeWidth={3} strokeLinecap="round" />

      {/* Home glyph */}
      <House cx={HOME_X} cy={ICON_CY} r={26} color="#60A5FA" />

      {/* Park / Tree glyph */}
      <Tree cx={PARK_X} cy={ICON_CY} r={26} color="#22C55E" />

      {/* Stick figures */}
      <StickFigure cx={JOHN_X} cy={TRACK_Y - 2} dir="right" />
      <StickFigure cx={BROTHER_X} cy={TRACK_Y - 2} dir="left" />

      {/* Direction arrows */}
      <DirectionArrow x1={JOHN_X - 4} y={TRACK_Y + 22} x2={JOHN_X + 28} dir="right" />
      <DirectionArrow x1={BROTHER_X + 4} y={TRACK_Y + 22} x2={BROTHER_X - 28} dir="left" />

      {/* Speed labels */}
      <SpeedLabel x={JOHN_X + 12} y={TRACK_Y + 40} text="60 m/min" />
      <SpeedLabel x={BROTHER_X - 12} y={TRACK_Y + 40} text="70 m/min" />

      {/* Brace + distance label */}
      <Brace x1={HOME_X + 8} x2={PARK_X - 8} y={TRACK_Y + 48} label="2600 m" />

      {/* Meeting marker (explainer only) */}
      {showMeeting && (
        <g>
          <circle cx={meetX} cy={TRACK_Y} r={7} fill="#10B981" stroke="#065F46" strokeWidth={2} />
          <text
            x={meetX}
            y={TRACK_Y - 14}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize={12}
            fontWeight={800}
            fill="#065F46"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            0750 h
          </text>
        </g>
      )}
    </svg>
  )
}

// ── Default export: static stem illustration ──────────────────────────────────

export default function MeetingPathX24A15Illustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const aria =
    lang === 'id'
      ? 'Diagram jalur: John berjalan dari rumah ke taman (60 m/menit ke kanan); saudaranya berjalan dari taman ke rumah (70 m/menit ke kiri). Jarak total 2600 m.'
      : 'Path diagram: John walks from home to park at 60 m/min (rightward); his brother walks from park to home at 70 m/min (leftward). Total distance 2600 m.'
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={aria}>
      <MeetingPathSVG />
    </div>
  )
}
