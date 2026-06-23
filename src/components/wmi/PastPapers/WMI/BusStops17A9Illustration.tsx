// BusStops17A9Illustration.tsx
//
// Stem illustration for SEAMO-2017-Paper-A Q9:
//   "There were 31 commuters on the bus. At the 1st stop, 17 alighted and 14
//    boarded. At the 2nd stop, 5 alighted and 3 boarded. How many commuters
//    are there now?"
//
// Source image: docs/reference/ocr-res/seamo/contest/paper-a/2017.imgs/013.jpg
// Classification: stem — the OCR shows a decorative side-view bus illustration
//   accompanying the problem text. No data is encoded in the image itself.
//
// The figure shows a classic city bus (side view) with a passenger count badge
// indicating the starting count (31 commuters) — showing only the PROBLEM, not
// the answer.
//
// Primitives used: none imported — fresh SVG (bus silhouette is a bespoke glyph
// not covered by IsoCubes / GridBoard / etc.).
//
// Pure SVG, SSR-safe: no hooks, no framer-motion, no Math.random, no Date.
//
// Exports:
//   BusStops17A9     — shared primitive (bus SVG, accepts highlight props)
//   default          — static stem illustration (no highlights)
//   VISUALS          — record keyed 'SEAMO-17-A-Q9' for the registry

import type { JSX } from 'react'

// ── Colour palette ─────────────────────────────────────────────────────────────
const C_BUS_BODY   = '#DBEAFE'   // light blue bus body (matches source image)
const C_BUS_ROOF   = '#FFFFFF'   // white roof
const C_STRIPE     = '#DC2626'   // red side stripe
const C_STRIPE2    = '#1D4ED8'   // dark blue lower band
const C_WHEEL      = '#1F2937'   // near-black tyres
const C_HUB        = '#D1D5DB'   // light hub cap
const C_WINDOW     = '#BAE6FD'   // window glass (sky blue)
const C_FRAME      = '#1E3A8A'   // dark blue frame / outline
const C_BADGE_BG   = '#FEF9C3'   // yellow badge background
const C_BADGE_TEXT = '#1F2937'   // badge text

// ── View dimensions ────────────────────────────────────────────────────────────
const W = 360
const H = 180

// Bus body geometry (side view, left-to-right)
const BUS_X  = 16    // left edge of bus body
const BUS_Y  = 38    // top of body (excluding roof curve)
const BUS_W  = 310   // body width
const BUS_H  = 88    // body height
const BUS_RX = 8     // corner radius

// Wheel geometry
const W1_CX = BUS_X + 56   // front-left wheel centre x
const W2_CX = BUS_X + BUS_W - 58  // rear wheel centre x
const WHEEL_CY = BUS_Y + BUS_H - 2  // wheel centre y (bottom edge)
const WHEEL_R  = 24           // outer tyre radius
const HUB_R    = 11           // hub cap radius

// ── Sub-components ─────────────────────────────────────────────────────────────

function BusWheel({ cx, cy }: { cx: number; cy: number }): JSX.Element {
  return (
    <g>
      {/* tyre */}
      <circle cx={cx} cy={cy} r={WHEEL_R} fill={C_WHEEL} />
      {/* hub */}
      <circle cx={cx} cy={cy} r={HUB_R} fill={C_HUB} stroke={C_WHEEL} strokeWidth={1.5} />
      {/* hub cross */}
      <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} stroke={C_WHEEL} strokeWidth={2} />
      <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} stroke={C_WHEEL} strokeWidth={2} />
    </g>
  )
}

function BusWindow({ x, y, w = 32, h = 24 }: { x: number; y: number; w?: number; h?: number }): JSX.Element {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={3}
      fill={C_WINDOW}
      stroke={C_FRAME}
      strokeWidth={1.2}
    />
  )
}

// ── Shared primitive ───────────────────────────────────────────────────────────

export interface BusStops17A9Props {
  /** Show the starting passenger count badge (default true = problem state). */
  showCount?: number | null
  className?: string
}

/**
 * Side-view bus SVG for SEAMO-2017-A-Q9.
 * Reused by the Explainer with animated count changes.
 */
export function BusStops17A9({
  showCount = 31,
  className,
}: BusStops17A9Props): JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* ── Background ─────────────────────────────────────────────────── */}
      <rect x={0} y={0} width={W} height={H} fill="#F0F9FF" />

      {/* ── Road ───────────────────────────────────────────────────────── */}
      <rect x={0} y={WHEEL_CY + WHEEL_R} width={W} height={H - (WHEEL_CY + WHEEL_R)} fill="#D1D5DB" />
      {/* road markings */}
      <line
        x1={20} y1={WHEEL_CY + WHEEL_R + 6}
        x2={W - 20} y2={WHEEL_CY + WHEEL_R + 6}
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeDasharray="18 10"
      />

      {/* ── Wheels (drawn first so bus body sits on top) ────────────────── */}
      <BusWheel cx={W1_CX} cy={WHEEL_CY + WHEEL_R - 4} />
      <BusWheel cx={W2_CX} cy={WHEEL_CY + WHEEL_R - 4} />

      {/* ── Bus body ───────────────────────────────────────────────────── */}
      {/* Main body */}
      <rect
        x={BUS_X}
        y={BUS_Y}
        width={BUS_W}
        height={BUS_H}
        rx={BUS_RX}
        fill={C_BUS_BODY}
        stroke={C_FRAME}
        strokeWidth={2}
      />

      {/* Roof panel */}
      <rect
        x={BUS_X + 2}
        y={BUS_Y}
        width={BUS_W - 4}
        height={18}
        rx={BUS_RX}
        fill={C_BUS_ROOF}
        stroke="none"
      />

      {/* Red side stripe */}
      <rect
        x={BUS_X}
        y={BUS_Y + 44}
        width={BUS_W}
        height={10}
        fill={C_STRIPE}
        stroke="none"
      />

      {/* Dark blue lower body stripe */}
      <rect
        x={BUS_X}
        y={BUS_Y + BUS_H - 28}
        width={BUS_W}
        height={22}
        rx={0}
        fill={C_STRIPE2}
        stroke="none"
      />
      {/* Round bottom-right corner of lower stripe */}
      <rect
        x={BUS_X + BUS_W - BUS_RX}
        y={BUS_Y + BUS_H - 28}
        width={BUS_RX}
        height={22}
        fill={C_BUS_BODY}
        stroke="none"
      />
      <rect
        x={BUS_X}
        y={BUS_Y + BUS_H - 28}
        width={BUS_RX}
        height={22}
        fill={C_BUS_BODY}
        stroke="none"
      />

      {/* Bus body outline (redrawn on top of fills) */}
      <rect
        x={BUS_X}
        y={BUS_Y}
        width={BUS_W}
        height={BUS_H}
        rx={BUS_RX}
        fill="none"
        stroke={C_FRAME}
        strokeWidth={2}
      />

      {/* ── Windows (passenger row) ─────────────────────────────────────── */}
      {/* Front windshield area */}
      <BusWindow x={BUS_X + BUS_W - 52} y={BUS_Y + 20} w={42} h={20} />

      {/* Passenger windows — 5 evenly spaced */}
      {[0, 1, 2, 3, 4].map((i) => (
        <BusWindow
          key={i}
          x={BUS_X + 14 + i * 44}
          y={BUS_Y + 20}
          w={32}
          h={20}
        />
      ))}

      {/* ── Door ────────────────────────────────────────────────────────── */}
      <rect
        x={BUS_X + BUS_W - 80}
        y={BUS_Y + 44}
        width={26}
        height={34}
        rx={2}
        fill="#93C5FD"
        stroke={C_FRAME}
        strokeWidth={1.5}
      />
      {/* door handle */}
      <line
        x1={BUS_X + BUS_W - 80 + 13}
        y1={BUS_Y + 52}
        x2={BUS_X + BUS_W - 80 + 13}
        y2={BUS_Y + 66}
        stroke={C_FRAME}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* ── Headlights / grille (front face, right side) ────────────────── */}
      <rect
        x={BUS_X + BUS_W + 2}
        y={BUS_Y + BUS_H - 32}
        width={12}
        height={8}
        rx={2}
        fill="#FEF9C3"
        stroke={C_FRAME}
        strokeWidth={1.2}
      />

      {/* ── Passenger count badge ────────────────────────────────────────── */}
      {showCount !== null && showCount !== undefined && (
        <g>
          {/* badge circle */}
          <circle
            cx={BUS_X + 60}
            cy={BUS_Y - 18}
            r={22}
            fill={C_BADGE_BG}
            stroke={C_FRAME}
            strokeWidth={1.8}
          />
          {/* count number */}
          <text
            x={BUS_X + 60}
            y={BUS_Y - 18}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fontWeight="900"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill={C_BADGE_TEXT}
          >
            {showCount}
          </text>
          {/* connector line */}
          <line
            x1={BUS_X + 60}
            y1={BUS_Y - 18 + 22}
            x2={BUS_X + 60}
            y2={BUS_Y}
            stroke={C_BADGE_TEXT}
            strokeWidth={1.2}
            strokeDasharray="2 2"
          />
          {/* label */}
          <text
            x={BUS_X + 60 + 26}
            y={BUS_Y - 18}
            dominantBaseline="central"
            fontSize={9}
            fontWeight="600"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill={C_BADGE_TEXT}
          >
            commuters
          </text>
        </g>
      )}
    </svg>
  )
}

// ── Default export: static stem illustration ───────────────────────────────────

/**
 * Static problem figure for SEAMO-2017-A-Q9.
 * Shows a side-view bus with 31 commuters badge — the starting state.
 * Does NOT reveal the answer.
 */
export default function BusStops17A9Illustration(): JSX.Element {
  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={
        'A city bus with 31 commuters. ' +
        'At the 1st stop, 17 alighted and 14 boarded. ' +
        'At the 2nd stop, 5 alighted and 3 boarded. How many are left?'
      }
    >
      <BusStops17A9 showCount={31} />
    </div>
  )
}

// ── VISUALS export ─────────────────────────────────────────────────────────────

/**
 * Registry loaders for SEAMO-2017-A-Q9.
 * Add this entry to VISUALS in registry.ts (do NOT edit registry.ts directly —
 * the controller applies it):
 *
 *   'SEAMO-17-A-Q9': {
 *     illustration: () => import('./BusStops17A9Illustration'),
 *   },
 */
export const VISUALS: Record<string, {
  type: 'stem'
  illustration: () => Promise<{ default: () => JSX.Element }>
}> = {
  'SEAMO-17-A-Q9': {
    type: 'stem',
    illustration: () =>
      import('./BusStops17A9Illustration').then((m) => ({ default: m.default })),
  },
}
