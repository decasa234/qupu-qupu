// Photocopier sheets figure for WMI-24P2A-Q15 (2024 Grade 2 Semifinal, Paper A).
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g2-a-q15.jpg: six two-sided
// sheets of paper fanned in an overlapping up/down stack. Five of them show a
// printed page number; one sheet (2nd from the left, in the upper position) is
// turned so its number is hidden. Visible, left-to-right reading order of the
// fanned stack:  "Page 1", (hidden), "5", "Page 4", "9", "12".
//
// 12 pages are printed across 6 sheets (front + back). Lisa uses only 5 sheets,
// so exactly ONE sheet (two pages) is left out; that sheet's two page numbers
// add up to 15 (answer D). The static figure shows ONLY the sheets — never the
// answer.

// ── palette (matches the warm-yellow scan) ──────────────────────────────────
const SHEET = '#FCF4B3'
const SHEET_EDGE = '#3A352B'
const INK = '#3A352B'

export interface PaperSheet {
  /** x of the sheet's left edge (top-left corner). */
  x: number
  /** y of the sheet's top edge. */
  y: number
  /** Printed page number, or null when the sheet is turned (number hidden). */
  label: string | null
  /** Prefix the label with "Page " (matches the scan's two styles). */
  page?: boolean
}

const SHEET_W = 86
const SHEET_H = 132

/** One two-sided sheet: a rounded rectangle with its printed page number. */
export function CopySheet({ x, y, label, page = false }: PaperSheet) {
  const cx = x + SHEET_W / 2
  return (
    <g>
      <rect x={x} y={y} width={SHEET_W} height={SHEET_H} rx={4} fill={SHEET} stroke={SHEET_EDGE} strokeWidth={2.5} />
      {label !== null &&
        (page ? (
          <g>
            <text x={cx - 6} y={y + SHEET_H - 30} textAnchor="middle" dominantBaseline="central" fontSize={15} fontStyle="italic" fill={INK}>
              Page
            </text>
            <text x={cx + 22} y={y + SHEET_H - 30} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK}>
              {label}
            </text>
          </g>
        ) : (
          <text x={cx} y={y + 56} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={800} fill={INK}>
            {label}
          </text>
        ))}
    </g>
  )
}

// Fanned up/down stack: even slots sit lower, odd slots sit higher; each sheet
// overlaps the one before it (drawn left → right so later sheets sit on top).
const STEP_X = 66
const HI_Y = 14
const LO_Y = 56
const START_X = 16

export const Q15_SHEETS: PaperSheet[] = [
  { x: START_X + 0 * STEP_X, y: LO_Y, label: '1', page: true },
  { x: START_X + 1 * STEP_X, y: HI_Y, label: null },
  { x: START_X + 2 * STEP_X, y: LO_Y, label: '5' },
  { x: START_X + 3 * STEP_X, y: HI_Y, label: '4', page: true },
  { x: START_X + 4 * STEP_X, y: LO_Y, label: '9' },
  { x: START_X + 5 * STEP_X, y: HI_Y, label: '12' },
]

export const Q15_VIEW_W = 460
export const Q15_VIEW_H = 220

/** The fanned stack of six sheets, ready to drop into a frame. */
export function SheetStack({ sheets = Q15_SHEETS }: { sheets?: PaperSheet[] }) {
  return (
    <svg
      viewBox={`0 0 ${Q15_VIEW_W} ${Q15_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {sheets.map((s, i) => (
        <CopySheet key={i} {...s} />
      ))}
    </svg>
  )
}

export default function P24G2Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Six two-sided sheets of paper fanned in an overlapping stack. Five show page numbers — Page 1, 5, Page 4, 9 and 12 — and one sheet is turned so its number is hidden."
    >
      <SheetStack />
    </div>
  )
}
