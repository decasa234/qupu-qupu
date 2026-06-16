// WMI-24P1A-Q15 (2024 Grade 1 Semifinal, Paper A) — stem illustration.
//
// Lisa photocopies 5 two-sided sheets. Each sheet has a front page and a back
// page, so the 5 sheets carry 10 page numbers in all. The scan
// (db/seed/wmi/figures/2024-semifinal-g1-a-q15.jpg) shows five yellow sheets
// fanned out in a stack; four of them have a page number printed on their
// visible face — reading left to right the labels are:
//
//   "Page 1"   ·   "5"   ·   "Page 4"   ·   "9"
//
// One sheet is left UNUSED. The question asks for the sum of the two page
// numbers (front + back) on that unused sheet. Answer = A (15).
//
// This file draws ONLY the fanned stack with the four printed labels — it never
// shows the unused sheet's hidden numbers nor the sum. Pure render, SSR-safe,
// deterministic (no random/date, no state, no window at module top).

const SHEET_FILL = '#FCF6A8' // pale photocopy yellow
const SHEET_EDGE = '#3A352B' // dark outline
const INK = '#3A352B'

/** The four page numbers visible on the stack, in left-to-right reading order. */
export const VISIBLE_LABELS: Array<{ text: string; isPage: boolean }> = [
  { text: '1', isPage: true },
  { text: '5', isPage: false },
  { text: '4', isPage: true },
  { text: '9', isPage: false },
]

/** Pages 1..10 sit on 5 two-sided sheets. */
export const TOTAL_PAGES = 10
export const SHEETS = 5

/**
 * A single fanned sheet of paper at (x, y), of the given size, drawn as a
 * rounded rectangle. `label` (optional) is the page number printed on its face.
 * `pageWord` shows the small "Page" caption above the number (matching the scan).
 */
export function PaperSheet({
  x,
  y,
  w,
  h,
  label,
  pageWord = false,
}: {
  x: number
  y: number
  w: number
  h: number
  label?: string
  pageWord?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={SHEET_FILL}
        stroke={SHEET_EDGE}
        strokeWidth={3}
      />
      {pageWord && (
        <text
          x={x + w * 0.32}
          y={y + h - 50}
          textAnchor="middle"
          fontSize={17}
          fontStyle="italic"
          fontFamily="Georgia, 'Times New Roman', serif"
          fill={INK}
        >
          Page
        </text>
      )}
      {label !== undefined && (
        <text
          x={pageWord ? x + w * 0.62 : x + w / 2}
          y={y + h - 34}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={40}
          fontWeight={800}
          fontFamily="Georgia, 'Times New Roman', serif"
          fill={INK}
        >
          {label}
        </text>
      )}
    </g>
  )
}

export const VIEW_W = 440
export const VIEW_H = 280

// Layout: four LOWER sheets (the labeled, "used" ones) fanned left→right, plus
// a back row of raised sheets behind them to read as a 5-sheet stack.
const SHEET_W = 120
const SHEET_H = 150
const FIRST_X = 18
const GAP_X = 100
const LOW_Y = 110
const HIGH_Y = 14

export default function P24G1Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Five two-sided sheets of paper fanned in a stack. Four of them show page numbers: Page 1, 5, Page 4, and 9. One sheet is left unused."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* back row: two raised sheets peeking up behind the gaps (the 5-sheet stack) */}
        <PaperSheet x={FIRST_X + GAP_X} y={HIGH_Y} w={SHEET_W} h={SHEET_H} />
        <PaperSheet x={FIRST_X + 3 * GAP_X} y={HIGH_Y} w={SHEET_W} h={SHEET_H} />

        {/* front row: the four labeled "used" sheets, fanned left to right */}
        {VISIBLE_LABELS.map((lbl, i) => (
          <PaperSheet
            key={i}
            x={FIRST_X + i * GAP_X}
            y={LOW_Y}
            w={SHEET_W}
            h={SHEET_H}
            label={lbl.text}
            pageWord={lbl.isPage}
          />
        ))}
      </svg>
    </div>
  )
}
