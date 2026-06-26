/**
 * BoxWaterOSN15NQ6Illustration — OSN-15-SD-NAS-Q6
 *
 * Stem figure: rectangular box 10×10×40 cm.
 *   Left:  upright  — water at 32 cm (the given).
 *   Right: on side  — empty; water height = ? (unknown to student).
 *
 * The answer (8 cm) is NEVER shown here.
 *
 * Source: ocr-res/osn/nasional/sd/2015.imgs/001.jpg + 002.jpg
 * No matching primitive → custom oblique-projection SVG (adapted from BoxCutOSN20KQ16).
 * SSR-safe: no hooks, no framer-motion.
 */

import React from 'react'

// ─── Layout constants (exported for explainer reuse) ──────────────────────────
export const SVG_W = 440
export const SVG_H = 210

/** Oblique depth offset in px (right and up) for a 10 cm deep face. */
export const DEP = { x: 12, y: -8 } as const

/** Upright box front-face geometry (10 cm × 40 cm at 4 px/cm). */
export const UPR = { x: 72, y: 14, w: 40, h: 160 } as const

/** Lying box front-face geometry (40 cm × 10 cm at 4 px/cm). */
export const LIE = { x: 220, y: 118, w: 160, h: 40 } as const

/** Water fill height in upright box (32 cm × 4 px/cm = 128 px). */
export const UPRWATER = 128

/** Water fill height in lying box (8 cm × 4 px/cm = 32 px). */
export const LIEWATER = 32

// ─── Color palette ────────────────────────────────────────────────────────────
export const COLOR = {
  boxFront:  '#EFF6FF',
  boxSide:   '#DBEAFE',
  boxTop:    '#F8FAFC',
  stroke:    '#1E40AF',
  water:     '#3B82F6',
  waterSide: '#60A5FA',
  waterSurf: '#93C5FD',
  label:     '#0F172A',
  dim:       '#64748B',
  quest:     '#DC2626',
  green:     '#10B981',
  amber:     '#F59E0B',
} as const

// ─── Reusable box figure (named export for explainer) ─────────────────────────
export interface BoxWaterFigureProps {
  x: number; y: number; w: number; h: number
  /** Water fill height in px (0 = no water). */
  waterH?: number
  /** Override the water fill colour (e.g. green for the revealed answer). */
  waterColor?: string
  /** Render a big red "?" inside the box for the unknown water height. */
  questionMark?: boolean
  /** Amber overlay on the whole face to indicate the base area. */
  highlightBase?: boolean
}

export function BoxWaterFigure({
  x, y, w, h,
  waterH = 0,
  waterColor = COLOR.water,
  questionMark = false,
  highlightBase = false,
}: BoxWaterFigureProps) {
  const dx = DEP.x, dy = DEP.y
  const waterY = y + h - waterH

  const topPts    = `${x},${y} ${x+w},${y} ${x+w+dx},${y+dy} ${x+dx},${y+dy}`
  const rightPts  = `${x+w},${y} ${x+w+dx},${y+dy} ${x+w+dx},${y+h+dy} ${x+w},${y+h}`
  const wTopPts   = waterH > 0
    ? `${x},${waterY} ${x+w},${waterY} ${x+w+dx},${waterY+dy} ${x+dx},${waterY+dy}`
    : ''
  const wRightPts = waterH > 0
    ? `${x+w},${waterY} ${x+w+dx},${waterY+dy} ${x+w+dx},${y+h+dy} ${x+w},${y+h}`
    : ''

  return (
    <g>
      {/* depth faces (drawn behind front face) */}
      <polygon points={topPts}   fill={COLOR.boxTop}  stroke={COLOR.stroke} strokeWidth={1} />
      <polygon points={rightPts} fill={COLOR.boxSide} stroke={COLOR.stroke} strokeWidth={1} />

      {/* water on depth faces */}
      {waterH > 0 && <polygon points={wRightPts} fill={COLOR.waterSide} opacity={0.7} />}
      {waterH > 0 && <polygon points={wTopPts}  fill={COLOR.waterSurf} opacity={0.85} />}

      {/* front face */}
      <rect x={x} y={y} width={w} height={h}
        fill={COLOR.boxFront} stroke={COLOR.stroke} strokeWidth={1.5} />

      {/* base area highlight */}
      {highlightBase && (
        <rect x={x+1} y={y+1} width={w-2} height={h-2}
          fill={COLOR.amber} opacity={0.18} />
      )}

      {/* water fill on front face */}
      {waterH > 0 && (
        <rect x={x+1} y={waterY} width={w-2} height={waterH-1}
          fill={waterColor} opacity={0.6} />
      )}

      {/* water surface dashed line */}
      {waterH > 0 && (
        <line x1={x} y1={waterY} x2={x+w} y2={waterY}
          stroke="#1D4ED8" strokeWidth={1.5} strokeDasharray="4,2" />
      )}

      {/* question mark */}
      {questionMark && (
        <text x={x + w / 2} y={y + h / 2 + 9}
          textAnchor="middle" fontSize={22} fontWeight="bold" fill={COLOR.quest}>
          ?
        </text>
      )}
    </g>
  )
}

// ─── Illustration: PROBLEM only (no answer) ───────────────────────────────────
export default function BoxWaterOSN15NQ6Illustration({ lang = 'id' }: { lang?: 'en' | 'id' }) {
  const isId = lang === 'id'
  const { x: ux, y: uy, w: uw, h: uh } = UPR
  const { x: lx, y: ly, w: lw, h: lh } = LIE

  // x-position of upright box water bracket (right of depth face + gap)
  const bracketX = ux + uw + DEP.x + 5

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: 'block', maxWidth: 480, margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Upright box (left) ────────────────────────────────────────── */}
      <BoxWaterFigure x={ux} y={uy} w={uw} h={uh} waterH={UPRWATER} />

      {/* "40 cm" height label, rotated on left side */}
      <text
        x={ux - 18} y={uy + uh / 2 + 4}
        textAnchor="middle" fontSize={11} fill={COLOR.dim}
        transform={`rotate(-90,${ux - 18},${uy + uh / 2 + 4})`}
      >40 cm</text>

      {/* "10 cm" width label below box */}
      <text x={ux + uw / 2} y={uy + uh + 14}
        textAnchor="middle" fontSize={11} fill={COLOR.dim}>10 cm</text>

      {/* "32 cm" water-height bracket (right of box) */}
      <line x1={bracketX} y1={uy + uh - UPRWATER}
            x2={bracketX} y2={uy + uh}
        stroke={COLOR.dim} strokeWidth={1} />
      <line x1={bracketX - 3} y1={uy + uh - UPRWATER}
            x2={bracketX + 3} y2={uy + uh - UPRWATER}
        stroke={COLOR.dim} strokeWidth={1} />
      <line x1={bracketX - 3} y1={uy + uh}
            x2={bracketX + 3} y2={uy + uh}
        stroke={COLOR.dim} strokeWidth={1} />
      <text x={bracketX + 6} y={uy + uh - UPRWATER / 2 + 4}
        fontSize={11} fill={COLOR.label} fontWeight="600">32 cm</text>

      {/* position label below */}
      <text x={ux + uw / 2} y={uy + uh + 28}
        textAnchor="middle" fontSize={11} fill={COLOR.label} fontStyle="italic">
        {isId ? 'Posisi berdiri' : 'Upright'}
      </text>

      {/* ── Arrow + transition label (centre gap) ─────────────────────── */}
      <text x={186} y={98} textAnchor="middle" fontSize={26} fill="#94A3B8">→</text>
      <text x={186} y={114} textAnchor="middle" fontSize={10} fill="#94A3B8">
        {isId ? 'direbahkan' : 'tipped'}
      </text>

      {/* ── Lying box (right) ─────────────────────────────────────────── */}
      <BoxWaterFigure x={lx} y={ly} w={lw} h={lh} questionMark />

      {/* "40 cm" width label below */}
      <text x={lx + lw / 2} y={ly + lh + 14}
        textAnchor="middle" fontSize={11} fill={COLOR.dim}>40 cm</text>

      {/* "10 cm" height label, rotated on left side */}
      <text
        x={lx - 18} y={ly + lh / 2 + 4}
        textAnchor="middle" fontSize={11} fill={COLOR.dim}
        transform={`rotate(-90,${lx - 18},${ly + lh / 2 + 4})`}
      >10 cm</text>

      {/* "? cm" label, right side of lying box */}
      <line x1={lx + lw + DEP.x + 5} y1={ly}
            x2={lx + lw + DEP.x + 5} y2={ly + lh}
        stroke={COLOR.quest} strokeWidth={1} strokeDasharray="3,2" />
      <text x={lx + lw + DEP.x + 11} y={ly + lh / 2 + 4}
        fontSize={12} fill={COLOR.quest} fontWeight="700">? cm</text>

      {/* position label below */}
      <text x={lx + lw / 2} y={ly + lh + 28}
        textAnchor="middle" fontSize={11} fill={COLOR.label} fontStyle="italic">
        {isId ? 'Posisi rebah' : 'On its side'}
      </text>
    </svg>
  )
}
