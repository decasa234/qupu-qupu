// TIMO-22-P1H-Q5 — "From the pattern below, how many # are in the 5th Group?"
//
// Visual: 5 groups of # arranged as a growing right-triangle staircase.
// Group n fills an n×n grid where row r (0-indexed) has (r+1) # symbols in
// the rightmost columns → total = n(n+1)/2.  G1=1, G2=3, G3=6, G4=10, G5=?
//
// Primitive: GridBoard (./primitives/GridBoard) — cell backgrounds + gridlines.
// White '#' text is overlaid manually (GridBoard label colour is fixed dark ink,
// unsuitable for the dark active-cell fill used here).

import { GridBoard } from './primitives/GridBoard'

// ── colour tokens ──────────────────────────────────────────────────────────────
const ACTIVE_FILL   = '#1E3A5F'   // dark navy  — filled # cells
const INACTIVE_FILL = '#F8FAFC'   // near-white — empty cells
const UNKNOWN_FILL  = '#DBEAFE'   // blue-100   — group-5 placeholder cells
const GRID_STROKE   = '#CBD5E1'
const LABEL_INK     = '#374151'
const DIFF_INK      = '#2563EB'

// ── layout ─────────────────────────────────────────────────────────────────────
const CELL     = 30     // px per grid cell
const GAP      = 14     // px between adjacent groups
const MARGIN_X = 12
const GRID_BOT = 160    // all groups bottom-align here
const DIFF_Y   = 163    // diff-label baseline (just below grid)
const LABEL_Y  = 175    // group-number label y
const VIEW_W   = 540
const VIEW_H   = 192

// Left x of each group's grid (0-indexed: index i = group i+1)
// G1:12  G2:56  G3:130  G4:234  G5:368
const GROUP_X = [12, 56, 130, 234, 368] as const

// ── helpers ────────────────────────────────────────────────────────────────────
/** True when cell (r,c) in an n×n group is active (holds '#'). */
function isActive(r: number, c: number, n: number): boolean {
  return c >= n - 1 - r
}

/** SVG y of the top edge of the n×n grid. */
function topY(n: number): number {
  return GRID_BOT - n * CELL
}

// ── GroupPanel ─────────────────────────────────────────────────────────────────
interface GroupPanelProps {
  n: number           // group number 1-5
  showActive: boolean // true → draw '#'; false → draw '?' placeholder
}

function GroupPanel({ n, showActive }: GroupPanelProps) {
  const fontSize = Math.round(CELL * 0.42)
  const gx = GROUP_X[n - 1]
  const gy = topY(n)

  return (
    <g transform={`translate(${gx}, ${gy})`}>
      {/* Cell backgrounds + gridlines */}
      <GridBoard
        rows={n}
        cols={n}
        cellSize={CELL}
        fill={(r, c) =>
          !showActive ? UNKNOWN_FILL : isActive(r, c, n) ? ACTIVE_FILL : INACTIVE_FILL
        }
        gridStroke={GRID_STROKE}
      />

      {/* White '#' overlay on active cells */}
      {showActive &&
        Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) =>
            isActive(r, c, n) ? (
              <text
                key={`h-${r}-${c}`}
                x={c * CELL + CELL / 2}
                y={r * CELL + CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight={800}
                fill="#FFFFFF"
                fontFamily="ui-monospace,'Courier New',monospace"
              >
                #
              </text>
            ) : null,
          ),
        )}

      {/* '?' placeholder for unknown group 5 */}
      {!showActive && (
        <text
          x={(n * CELL) / 2}
          y={(n * CELL) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={46}
          fontWeight={900}
          fill={DIFF_INK}
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          ?
        </text>
      )}
    </g>
  )
}

// ── shared diagram (exported for explainer) ────────────────────────────────────
export interface HashTriangleDiagramProps {
  lang: 'en' | 'id'
  /** Reveal group 5 with actual '#' symbols (explainer final beat). */
  showGroup5?: boolean
  /** Show '+2 +3 +4' difference labels between groups 1-4. */
  showDiffs?: boolean
}

export function HashTriangleDiagram({
  lang,
  showGroup5 = false,
  showDiffs = false,
}: HashTriangleDiagramProps) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const groupLabels = [
    t('Group 1', 'Kelompok 1'),
    t('Group 2', 'Kelompok 2'),
    t('Group 3', 'Kelompok 3'),
    t('Group 4', 'Kelompok 4'),
    t('Group 5', 'Kelompok 5'),
  ]

  // Difference labels: '+2' between G1-G2, '+3' G2-G3, '+4' G3-G4
  const diffEntries: Array<{ label: string; mx: number }> = [
    { label: '+2', mx: (GROUP_X[0] + 1 * CELL + GROUP_X[1]) / 2 },   // (42+56)/2=49
    { label: '+3', mx: (GROUP_X[1] + 2 * CELL + GROUP_X[2]) / 2 },   // (116+130)/2=123
    { label: '+4', mx: (GROUP_X[2] + 3 * CELL + GROUP_X[3]) / 2 },   // (220+234)/2=227
  ]

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" aria-hidden="true">
      {/* Groups 1-4: always show active '#' symbols */}
      {([1, 2, 3, 4] as const).map((n) => (
        <GroupPanel key={n} n={n} showActive />
      ))}

      {/* Group 5: placeholder until showGroup5=true */}
      <GroupPanel n={5} showActive={showGroup5} />

      {/* Group number labels */}
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <text
          key={`lbl-${n}`}
          x={GROUP_X[n - 1] + (n * CELL) / 2}
          y={LABEL_Y}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={11}
          fontWeight={600}
          fill={LABEL_INK}
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          {groupLabels[n - 1]}
        </text>
      ))}

      {/* Difference labels between groups (explainer diff/predict beats) */}
      {showDiffs &&
        diffEntries.map(({ label, mx }) => (
          <text
            key={label}
            x={mx}
            y={DIFF_Y}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontSize={10}
            fontWeight={700}
            fill={DIFF_INK}
            fontFamily="ui-sans-serif,system-ui,sans-serif"
          >
            {label}
          </text>
        ))}
    </svg>
  )
}

// ── default export: stem illustration ─────────────────────────────────────────
interface IllustrationProps {
  lang?: string
}

export default function HashTriangleTIMO22P1Q5Illustration({ lang = 'en' }: IllustrationProps) {
  return (
    <div
      className="mx-auto w-full max-w-[540px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Pola segitiga simbol # — ada berapa simbol di Kelompok ke-5?'
          : 'Triangular # symbol pattern — how many symbols in Group 5?'
      }
    >
      <HashTriangleDiagram lang={lang as 'en' | 'id'} />
    </div>
  )
}
