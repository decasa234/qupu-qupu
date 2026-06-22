// IKMC-23-PE-Q9 — park / line-of-sight stem illustration.
//
// "There are 5 trees in a park. A beaver can see only two of the trees because
// all the others are hidden behind other trees. At which of the marked points is
// the beaver standing?" Answer: D.
//
// Reconstructed faithfully from docs/reference/ocr-res/ikmc/contest/preecolier/2023.imgs/027.jpg:
//   - Organic park boundary (blob outline in dark green).
//   - 5 trees (filled green circles, varying radius).
//   - 5 marked points A–E (small dots with labels).
//
// The STEM shows ONLY the problem — no sight lines, no answer, no beaver glyph.
// The explainer imports the primitive (Park9PE) and adds animated overlays.
//
// Co-exports:
//   Park9PE       — primitive used by both illustration and explainer.
//   TREES         — tree centre positions and radii.
//   POINTS        — marked-point positions.
//   VB_W, VB_H   — viewBox dimensions.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ── colour tokens ─────────────────────────────────────────────────────────────
export const COLOR = {
  PARK_BG:    '#FFFFFF',
  PARK_FILL:  '#F5FFF5',
  PARK_STROKE:'#2D6A2D',
  TREE_FILL:  '#3A9E3A',
  TREE_STROKE:'#1F5C1F',
  POINT_DOT:  '#1F2937',
  POINT_LABEL:'#1F2937',
  SIGHT_LINE: '#F0853A',  // orange — for the explainer
  HIDDEN_X:   '#DC2626',  // red cross for hidden trees
  ANSWER_DOT: '#10B981',  // green for the correct point
  WRONG_DOT:  '#DC2626',  // red cross for wrong points
} as const

// ── geometry ──────────────────────────────────────────────────────────────────
export const VB_W = 340
export const VB_H = 250

/**
 * The 5 trees. Index 0–4 = T1–T5.
 * Positions and sizes reconstructed faithfully from 027.jpg.
 *   T1 — small, upper-center-left
 *   T2 — small, upper-center (just right of T1)
 *   T3 — medium, center
 *   T4 — large, center-right (the "big" tree closest to point D)
 *   T5 — small, lower-left
 */
export const TREES: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 173, cy: 113, r: 13 },   // T1 — small upper-left of cluster
  { cx: 204, cy: 108, r: 15 },   // T2 — small upper-right of cluster
  { cx: 220, cy: 133, r: 18 },   // T3 — medium center
  { cx: 244, cy: 152, r: 26 },   // T4 — large center-right
  { cx: 155, cy: 186, r: 14 },   // T5 — small lower-left
]

/**
 * The 5 marked points A–E.
 * Positions reconstructed from 027.jpg.
 */
export const POINTS: Record<string, { x: number; y: number; labelDx: number; labelDy: number }> = {
  A: { x:  68, y:  90, labelDx:  8, labelDy: -6 },
  B: { x: 170, y:  62, labelDx:  8, labelDy: -6 },
  C: { x: 214, y:  58, labelDx:  8, labelDy: -6 },
  D: { x: 298, y: 142, labelDx:  8, labelDy: -6 },
  E: { x: 138, y: 212, labelDx:  8, labelDy: -6 },
}

// Park boundary — an organic closed blob approximating the original image.
// Hand-traced as a cubic-bezier SVG path.
const PARK_PATH = [
  'M 50 130',
  'C 40 60, 90 20, 180 30',
  'C 240 15, 295 40, 315 90',
  'C 330 130, 320 175, 300 195',
  'C 270 220, 220 230, 170 225',
  'C 110 230, 55 210, 45 175',
  'C 38 155, 45 145, 50 130',
  'Z',
].join(' ')

// ── Primitive ─────────────────────────────────────────────────────────────────

export interface Park9PEProps {
  /**
   * Highlight a specific candidate point (used by the explainer).
   * null = plain map, no highlights.
   */
  testPoint?: string | null
  /**
   * Draw sight lines from testPoint to all 5 trees.
   */
  showLines?: boolean
  /**
   * Indices (0-based) of trees that are hidden from the current testPoint.
   * These get a red X overlay.
   */
  hiddenTrees?: number[]
  /**
   * Whether the current testPoint is the correct answer (green vs red).
   */
  correct?: boolean
}

/**
 * Park9PE — shared primitive.
 *
 * Draws the park boundary, 5 trees, and 5 labelled points.
 * The explainer passes testPoint / showLines / hiddenTrees / correct to layer
 * animated overlays on top of the same scene.
 */
export function Park9PE({
  testPoint = null,
  showLines = false,
  hiddenTrees = [],
  correct = false,
}: Park9PEProps = {}) {
  const testPt = testPoint ? POINTS[testPoint] : null
  const dotColor = correct ? COLOR.ANSWER_DOT : COLOR.WRONG_DOT

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(320, VB_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={VB_W} height={VB_H} fill={COLOR.PARK_BG} />

      {/* park boundary blob */}
      <path
        d={PARK_PATH}
        fill={COLOR.PARK_FILL}
        stroke={COLOR.PARK_STROKE}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* sight lines (explainer only) — draw behind trees */}
      {showLines && testPt &&
        TREES.map((tr, i) => (
          <line
            key={`sl-${i}`}
            x1={testPt.x}
            y1={testPt.y}
            x2={tr.cx}
            y2={tr.cy}
            stroke={hiddenTrees.includes(i) ? COLOR.HIDDEN_X : COLOR.SIGHT_LINE}
            strokeWidth={1.4}
            strokeDasharray="5 3"
            opacity={0.7}
          />
        ))
      }

      {/* trees */}
      {TREES.map((tr, i) => {
        const isHidden = hiddenTrees.includes(i)
        return (
          <g key={`t${i}`}>
            <circle
              cx={tr.cx}
              cy={tr.cy}
              r={tr.r}
              fill={isHidden ? '#88CC88' : COLOR.TREE_FILL}
              stroke={COLOR.TREE_STROKE}
              strokeWidth={1.5}
              opacity={isHidden ? 0.45 : 1}
            />
            {/* red X for hidden trees */}
            {isHidden && (
              <g stroke={COLOR.HIDDEN_X} strokeWidth={2.2} strokeLinecap="round">
                <line x1={tr.cx - 7} y1={tr.cy - 7} x2={tr.cx + 7} y2={tr.cy + 7} />
                <line x1={tr.cx + 7} y1={tr.cy - 7} x2={tr.cx - 7} y2={tr.cy + 7} />
              </g>
            )}
          </g>
        )
      })}

      {/* marked points A–E */}
      {(Object.entries(POINTS) as Array<[string, { x: number; y: number; labelDx: number; labelDy: number }]>).map(
        ([key, pt]) => {
          const isTest = key === testPoint
          return (
            <g key={`pt-${key}`}>
              {/* dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isTest ? 5 : 3.5}
                fill={isTest ? dotColor : COLOR.POINT_DOT}
                stroke={isTest ? 'white' : 'none'}
                strokeWidth={isTest ? 1.5 : 0}
              />
              {/* label */}
              <text
                x={pt.x + pt.labelDx}
                y={pt.y + pt.labelDy}
                fontSize={13}
                fontWeight={700}
                fontStyle="italic"
                textAnchor="start"
                dominantBaseline="auto"
                fill={isTest ? dotColor : COLOR.POINT_LABEL}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {key}
              </text>
            </g>
          )
        },
      )}
    </svg>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * Park9PEIllustration
 *
 * Static stem figure for IKMC-23-PE-Q9.
 * Shows: park boundary, 5 trees, 5 marked points A–E.
 * Does NOT reveal which point is correct or any sight lines.
 */
export default function Park9PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Peta taman dengan 5 pohon (lingkaran hijau berbagai ukuran) ' +
        'dan lima titik bertanda A, B, C, D, E di berbagai posisi dalam taman. ' +
        'Dari titik mana berang-berang hanya bisa melihat 2 pohon?'
      }
    >
      <Park9PE />
    </div>
  )
}
