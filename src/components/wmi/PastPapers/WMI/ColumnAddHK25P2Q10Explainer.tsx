// HKIMO-25-P2H-Q10 — animated explainer for AB + AB = 1A2.
//
// Beat flow:
//   0. Intro    — full column addition, no highlight.
//   1. Units    — amber glow on units column; carry dot appears above tens.
//   2. Tens     — amber glow on tens column; carry dot on both; reveal A=9.
//   3. Hundreds — green glow on hundreds; show carry→"1" check.
//   4. Result   — green banner "A+B = 15 ✓".
//
// Re-uses layout constants from Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W, SVG_H,
  COL_H, COL_T, COL_U,
  ROW1_Y, ROW2_Y, LINE_Y, RES_Y,
  PLUS_X,
  C_KNOWN, C_LETTER, C_LINE,
} from './ColumnAddHK25P2Q10Illustration'
import { buildColumnAddHK25P2Q10Steps } from './columnAddHK25P2Q10Steps'

// ─── Extra colours ───────────────────────────────────────────────────────────

const C_HL_BG   = '#FEF3C7'  // amber-100 column highlight
const C_HL_STR  = '#D97706'  // amber-600 column border
const C_CARRY   = '#7C3AED'  // violet carry dot colour
const C_REVEAL  = '#065F46'  // green-800 revealed values
const C_RESULT_BG = '#D1FAE5'
const C_RESULT   = '#065F46'

const COL_W  = 44   // highlight rect width
const COL_H_TOP = ROW1_Y - 28   // top of highlight box (above row 1)
const COL_BOTTOM = LINE_Y - 2

const CARRY_EXTRA_H = 26  // extra SVG height when carries shown

// ─── Helper: column x-centre → highlight rect ────────────────────────────────

function ColHighlight({ cx, color }: { cx: number; color: string }) {
  return (
    <rect
      x={cx - COL_W / 2}
      y={COL_H_TOP}
      width={COL_W}
      height={COL_BOTTOM - COL_H_TOP}
      rx={6}
      fill={C_HL_BG}
      stroke={color}
      strokeWidth={2}
      opacity={0.85}
    />
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ColumnAddHK25P2Q10Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildColumnAddHK25P2Q10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const showResult   = beat.result
  const carryTens    = beat.carryTens
  const carryHundreds = beat.carryHundreds
  const hl           = beat.highlightCol

  // Revealed digit values (only after their phase)
  const showB     = beat.phase !== 'intro'
  const showA     = beat.phase === 'tens' || beat.phase === 'hundreds' || beat.phase === 'result'

  // Extra height for carry dots above row 1
  const extraTop  = carryTens || carryHundreds ? CARRY_EXTRA_H : 0
  const vbH       = SVG_H + extraTop + (showResult ? 32 : 0)

  // Translate everything down when carries appear
  const dy = extraTop

  const fs  = 28
  const fw  = 'bold'
  const ff  = 'monospace'
  const ta  = 'middle' as const

  // Digit colour helper
  const letterCol = (revealed: boolean) => (revealed ? C_REVEAL : C_LETTER)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${vbH}`}
        style={{ width: '100%', maxWidth: SVG_W }}
        aria-label="Animated column addition A B plus A B equals 1 A 2"
      >
        <g transform={`translate(0,${dy})`}>
          {/* ── Column highlight rectangles ──────────────────────── */}
          {hl === 'units'    && <ColHighlight cx={COL_U} color={C_HL_STR} />}
          {hl === 'tens'     && <ColHighlight cx={COL_T} color={C_HL_STR} />}
          {hl === 'hundreds' && <ColHighlight cx={COL_H} color="#059669" />}

          {/* ── Row 1: A B ──────────────────────────────────────── */}
          <text x={COL_T} y={ROW1_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={letterCol(showA)}>
            {showA ? '9' : 'A'}
          </text>
          <text x={COL_U} y={ROW1_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={letterCol(showB)}>
            {showB ? '6' : 'B'}
          </text>

          {/* ── Plus sign ───────────────────────────────────────── */}
          <text x={PLUS_X} y={ROW2_Y} textAnchor="middle" fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_KNOWN}>+</text>

          {/* ── Row 2: A B ──────────────────────────────────────── */}
          <text x={COL_T} y={ROW2_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={letterCol(showA)}>
            {showA ? '9' : 'A'}
          </text>
          <text x={COL_U} y={ROW2_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={letterCol(showB)}>
            {showB ? '6' : 'B'}
          </text>

          {/* ── Separator ───────────────────────────────────────── */}
          <line x1={14} y1={LINE_Y} x2={SVG_W - 14} y2={LINE_Y} stroke={C_LINE} strokeWidth={2} />

          {/* ── Result: 1 A 2 ───────────────────────────────────── */}
          <text x={COL_H} y={RES_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_KNOWN}>1</text>
          <text x={COL_T} y={RES_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={letterCol(showA)}>
            {showA ? '9' : 'A'}
          </text>
          <text x={COL_U} y={RES_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_KNOWN}>2</text>
        </g>

        {/* ── Carry dots (above row 1, outside translated group) ── */}
        {carryTens && (
          <g>
            <circle cx={COL_T} cy={10} r={9} fill={C_CARRY} />
            <text x={COL_T} y={14} textAnchor="middle" fontSize={11} fontFamily={ff} fontWeight="bold" fill="#FFF">+1</text>
          </g>
        )}
        {carryHundreds && (
          <g>
            <circle cx={COL_H} cy={10} r={9} fill={C_CARRY} />
            <text x={COL_H} y={14} textAnchor="middle" fontSize={11} fontFamily={ff} fontWeight="bold" fill="#FFF">+1</text>
          </g>
        )}

        {/* ── Result banner ───────────────────────────────────────── */}
        {showResult && (
          <g transform={`translate(0,${dy + SVG_H + 4})`}>
            <rect x={20} y={0} width={SVG_W - 40} height={28} rx={6} fill={C_RESULT_BG} />
            <text x={SVG_W / 2} y={19} textAnchor="middle" fontSize={15} fontFamily={ff} fontWeight="bold" fill={C_RESULT}>
              {lang === 'id' ? 'A + B = 9 + 6 = 15 ✓' : 'A + B = 9 + 6 = 15 ✓'}
            </text>
          </g>
        )}
      </svg>

      {/* ── Caption ─────────────────────────────────────────────────── */}
      <p style={{ margin: 0, fontSize: 13, textAlign: 'center', color: '#374151', maxWidth: 280 }}>
        {beat.caption}
      </p>
    </div>
  )
}
