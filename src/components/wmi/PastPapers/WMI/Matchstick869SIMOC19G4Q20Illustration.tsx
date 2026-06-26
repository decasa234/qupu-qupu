// Matchstick illustration for SIMOC-19-G4-Q20.
// Shows "869" in 7-segment matchstick style: 8→7, 6→6, 9→6 = 19 sticks total.
//
// Co-exports Matchstick869Diagram (before/after "869 → 9951") for the explainer.
// Reuses MatchstickDigit / DIGIT_W / DIGIT_H / STICK_COUNT from Matchstick20Illustration
// — same 7-segment primitive; no geometry re-derived here.
//
// Pure render — SSR-safe, no hooks, no window/document.

import { MatchstickDigit, DIGIT_W, DIGIT_H, STICK_COUNT } from './Matchstick20Illustration'

// ── layout constants ──────────────────────────────────────────────────
const GAP   = 16
const PAD   = 14
const W_DIG = DIGIT_W   // scale 1.0 → natural size
const H_DIG = DIGIT_H

const BEFORE_DIGITS = ['8', '6', '9'] as const
const AFTER_DIGITS  = ['9', '9', '5', '1'] as const

function blockW(n: number) {
  return n * W_DIG + (n - 1) * GAP
}

const BEFORE_W  = blockW(3)
const AFTER_W   = blockW(4)
const ARROW_GAP = 40

// illustration viewport (stem: 869 only)
const ILL_W = PAD * 2 + BEFORE_W
const ILL_H = PAD + H_DIG + 34

// diagram viewport (before + arrow + after)
const VIEW_W  = PAD * 2 + BEFORE_W + ARROW_GAP + AFTER_W
const VIEW_H  = PAD + H_DIG + 50
const AFTER_BX = PAD + BEFORE_W + ARROW_GAP
const ARROW_MX = PAD + BEFORE_W + ARROW_GAP / 2

// ── colours ───────────────────────────────────────────────────────────
const LABEL_COLOR = '#374151'
const GREEN       = '#10B981'
const ARROW_COLOR = '#6B7280'

// ── DigitGroup — renders digits with per-digit count labels + sum ─────
function DigitGroup({
  digits,
  bx,
  dim = false,
  highlight = false,
}: {
  digits: readonly string[]
  bx: number
  dim?: boolean
  highlight?: boolean
}) {
  const n      = digits.length
  const gw     = blockW(n)
  const total  = digits.reduce((s, d) => s + STICK_COUNT[d], 0)
  const sumLbl = digits.map((d) => STICK_COUNT[d]).join('+') + '=' + total

  return (
    <g opacity={dim ? 0.22 : 1}>
      {digits.map((d, i) => (
        <MatchstickDigit key={i} digit={d} x={bx + i * (W_DIG + GAP)} y={PAD} />
      ))}
      {digits.map((d, i) => (
        <text
          key={'lbl' + i}
          x={bx + i * (W_DIG + GAP) + W_DIG / 2}
          y={PAD + H_DIG + 17}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#6B7280"
        >
          {STICK_COUNT[d]}
        </text>
      ))}
      <text
        x={bx + gw / 2}
        y={PAD + H_DIG + 36}
        textAnchor="middle"
        fontSize={12}
        fontWeight={800}
        fill={highlight ? GREEN : LABEL_COLOR}
      >
        {sumLbl}{highlight ? ' ✓' : ''}
      </text>
    </g>
  )
}

// ── Matchstick869Diagram — co-exported for the explainer ─────────────

export interface Matchstick869DiagramProps {
  /** Reveal the "9951" after-block. */
  showAfter?: boolean
  /** Green-highlight the after-block (answer confirmed). */
  highlightAnswer?: boolean
}

export function Matchstick869Diagram({
  showAfter = false,
  highlightAnswer = false,
}: Matchstick869DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* before: 869 */}
      <DigitGroup digits={BEFORE_DIGITS} bx={PAD} />

      {/* arrow */}
      <text
        x={ARROW_MX}
        y={PAD + H_DIG / 2 + 5}
        textAnchor="middle"
        fontSize={20}
        fontWeight={900}
        fill={ARROW_COLOR}
      >
        →
      </text>

      {/* after: 9951 */}
      <DigitGroup
        digits={AFTER_DIGITS}
        bx={AFTER_BX}
        dim={!showAfter}
        highlight={showAfter && highlightAnswer}
      />
    </svg>
  )
}

// ── Default export: stem illustration ("869" only) ────────────────────

export default function Matchstick869SIMOC19G4Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Angka 869 dibentuk dari korek api: 8 membutuhkan 7 batang, 6 membutuhkan 6 batang, 9 membutuhkan 6 batang — total 19 batang."
    >
      <svg
        viewBox={`0 0 ${ILL_W} ${ILL_H}`}
        width="100%"
        style={{ maxWidth: 180, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {BEFORE_DIGITS.map((d, i) => (
          <MatchstickDigit key={i} digit={d} x={PAD + i * (W_DIG + GAP)} y={PAD} />
        ))}
        {BEFORE_DIGITS.map((d, i) => (
          <text
            key={'c' + i}
            x={PAD + i * (W_DIG + GAP) + W_DIG / 2}
            y={PAD + H_DIG + 17}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="#6B7280"
          >
            {STICK_COUNT[d]}
          </text>
        ))}
      </svg>
    </div>
  )
}
