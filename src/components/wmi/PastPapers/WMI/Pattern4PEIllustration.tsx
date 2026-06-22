// IKMC-20-PE-Q4 — "A magician pulls toys from a top hat in a repeating 5-item
// cycle: mouse, snail, canary, canary, frog. After 11 toys have been pulled,
// what are the next two?"
//
// The repeating cycle (length 5):
//   pos 1 = mouse 🐭
//   pos 2 = snail 🐌
//   pos 3 = canary 🐦
//   pos 4 = canary 🐦
//   pos 5 = frog 🐸
//
// After 11 toys shown, the next positions are:
//   12 → (12-1) % 5 + 1 = 2 → snail
//   13 → (13-1) % 5 + 1 = 3 → canary
//
// Answer = E (snail + canary).
//
// Options:
//   A: frog + mouse
//   B: canary + canary
//   C: canary + frog
//   D: mouse + snail
//   E: snail + canary  ← CORRECT
//
// Pure SVG. SSR-safe. No window/document at module top. No Math.random/Date.now.
// Single-codepoint emoji glyphs only.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Exported constants (reused by the explainer)
// ---------------------------------------------------------------------------

export type Toy = 'mouse' | 'snail' | 'canary' | 'frog'

export const TOY_EMOJI: Record<Toy, string> = {
  mouse: '🐭',
  snail: '🐌',
  canary: '🐦',
  frog: '🐸',
}

/** The repeating 5-item cycle (positions 1–5, then repeats). */
export const CYCLE: readonly Toy[] = ['mouse', 'snail', 'canary', 'canary', 'frog']

/** Number of toys already pulled from the hat (shown in the illustration). */
export const SHOWN_COUNT = 11

/** Answer option label → pair of toys. */
export const OPTION_PAIRS: Record<'A' | 'B' | 'C' | 'D' | 'E', [Toy, Toy]> = {
  A: ['frog', 'mouse'],
  B: ['canary', 'canary'],
  C: ['canary', 'frog'],
  D: ['mouse', 'snail'],
  E: ['snail', 'canary'],
}

export const ANSWER_LABEL = 'E'

// ---------------------------------------------------------------------------
// Brand palette
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const BLUE = '#30598A'

// ---------------------------------------------------------------------------
// Option renderer — co-exported for CHOICE_RENDERERS
// ---------------------------------------------------------------------------

/**
 * Renders one answer choice (a pair of two toys) as a small SVG in a rounded
 * bordered box. Used as the CHOICE_RENDERERS entry for IKMC-20-PE-Q4.
 */
export function Pattern4PEOption({ choice }: { choice: WmiChoice }) {
  const pair = OPTION_PAIRS[choice.label as 'A' | 'B' | 'C' | 'D' | 'E'] ?? ['mouse', 'mouse']
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-qupu-cream-dark bg-white p-1">
      <svg viewBox="0 0 90 48" width="90" height="48" aria-hidden="true">
        <text x="22" y="28" textAnchor="middle" dominantBaseline="central" fontSize="26">
          {TOY_EMOJI[pair[0]]}
        </text>
        <text x="68" y="28" textAnchor="middle" dominantBaseline="central" fontSize="26">
          {TOY_EMOJI[pair[1]]}
        </text>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration
// ---------------------------------------------------------------------------

const VIEW_W = 440
const VIEW_H = 150

// Row of 13 slots (0-10 = shown toys, 11-12 = "?" slots)
const SLOT_Y = 58         // center y of the toy row
const SLOT_X0 = 24        // left edge of first slot
const SLOT_STEP = 32      // horizontal distance between slot centers
const SLOT_SIZE = 26      // slot square size (half = 13)

// Cycle bracket geometry (under slots 0–4)
const BRACKET_Y_TOP = SLOT_Y + 16   // top of bracket arms
const BRACKET_Y_BOT = SLOT_Y + 28   // bottom of bracket bar
const BRACKET_X0 = SLOT_X0 - 10
const BRACKET_X1 = SLOT_X0 + 4 * SLOT_STEP + 10

export default function Pattern4PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola berulang 5 mainan dari topi ajaib: tikus, siput, kenari, kenari, kodok. Setelah 11 mainan ditarik, dua slot bertanda tanda tanya menunggu. Pilih pasangan mainan berikutnya (A–E)."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Title label */}
        <text
          x={VIEW_W / 2}
          y={16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          Pola berulang setiap 5 mainan / Pattern repeats every 5 toys
        </text>

        {/* Slots 0–12: toys or "?" */}
        {Array.from({ length: 13 }).map((_, i) => {
          const cx = SLOT_X0 + i * SLOT_STEP
          const isQuestion = i >= SHOWN_COUNT
          return (
            <g key={i}>
              {isQuestion ? (
                <>
                  <rect
                    x={cx - SLOT_SIZE / 2}
                    y={SLOT_Y - SLOT_SIZE / 2}
                    width={SLOT_SIZE}
                    height={SLOT_SIZE}
                    rx={5}
                    fill="none"
                    stroke={BLUE}
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={cx}
                    y={SLOT_Y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight={900}
                    fill={BLUE}
                    className="font-display"
                  >
                    ?
                  </text>
                </>
              ) : (
                <text
                  x={cx}
                  y={SLOT_Y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                >
                  {TOY_EMOJI[CYCLE[i % CYCLE.length]]}
                </text>
              )}
            </g>
          )
        })}

        {/* Cycle bracket under slots 0–4 */}
        <path
          d={`M ${BRACKET_X0} ${BRACKET_Y_TOP} v ${BRACKET_Y_BOT - BRACKET_Y_TOP} h ${BRACKET_X1 - BRACKET_X0} v -${BRACKET_Y_BOT - BRACKET_Y_TOP}`}
          fill="none"
          stroke={BLUE}
          strokeWidth={1.8}
        />
        <text
          x={(BRACKET_X0 + BRACKET_X1) / 2}
          y={BRACKET_Y_BOT + 12}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          ×2+1
        </text>

        {/* Options A–E at the bottom */}
        {(Object.keys(OPTION_PAIRS) as Array<'A' | 'B' | 'C' | 'D' | 'E'>).map((label, i) => {
          const pair = OPTION_PAIRS[label]
          const cx = 40 + i * 82
          const optY = 126
          return (
            <g key={label}>
              <text
                x={cx - 26}
                y={optY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={900}
                fill={INK}
                className="font-display"
              >
                {`(${label})`}
              </text>
              <text x={cx - 4} y={optY} textAnchor="middle" dominantBaseline="central" fontSize={18}>
                {TOY_EMOJI[pair[0]]}
              </text>
              <text x={cx + 16} y={optY} textAnchor="middle" dominantBaseline="central" fontSize={18}>
                {TOY_EMOJI[pair[1]]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
