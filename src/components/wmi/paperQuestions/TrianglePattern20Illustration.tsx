// Repeating shape pattern for WMI-20F1A-Q12.
//
// Recovered from "wmiPastPaper/2020 WMI Final G01 Paper A/images/
// 0d0c4b3a75c9c25a61ee1410f9e12d0522e374895d22838cebde3c698e2a2158.jpg":
// a row of light-blue rounded tiles, each holding a dark-blue triangle or
// circle, repeating unit △ ● △ △ ●. 12 tiles drawn, then "……", then the final
// (40th) tile — a circle, since 40 is the 5th shape of the 8th group. A bracket
// below the row is labelled 40.
//   per group of 5: 3 triangles → 40 ÷ 5 = 8 groups → 8 × 3 = 24 (answer C).
export type PatternGlyph = 'triangle' | 'circle'

export const PATTERN_UNIT: PatternGlyph[] = ['triangle', 'circle', 'triangle', 'triangle', 'circle']
export const TRIANGLES_PER_GROUP = 3
export const TOTAL_SHAPES = 40
export const GROUP_COUNT = TOTAL_SHAPES / PATTERN_UNIT.length // 8
export const ANSWER_TRIANGLES = GROUP_COUNT * TRIANGLES_PER_GROUP // 24

const SHOWN_TILES = 12 // tiles drawn before the ellipsis
/** Glyph of tile i (0-based) under the repeating unit. */
export function glyphAt(i: number): PatternGlyph {
  return PATTERN_UNIT[i % PATTERN_UNIT.length]
}

const TILE_BG = '#BFDBFE'
const GLYPH = '#2563EB'
const INK = '#1F2937'

const TILE = 36
const GAP = 8
const STEP = TILE + GAP // 44
const ROW_X = 22 // x of the first tile
const ROW_Y = 26 // y of the tile tops
const DOTS_X = ROW_X + SHOWN_TILES * STEP + 2 // ellipsis after the 12th tile
const LAST_X = DOTS_X + 32 // the final (40th) tile

export const PATTERN_VIEW_W = LAST_X + TILE + 22
export const PATTERN_VIEW_H = 178

function Tile({ x, glyph }: { x: number; glyph: PatternGlyph }) {
  const cx = x + TILE / 2
  const cy = ROW_Y + TILE / 2
  return (
    <g>
      <rect x={x} y={ROW_Y} width={TILE} height={TILE} rx={7} fill={TILE_BG} />
      {glyph === 'triangle' ? (
        <polygon
          points={`${cx},${cy - 12} ${cx - 12},${cy + 10} ${cx + 12},${cy + 10}`}
          fill={GLYPH}
          strokeLinejoin="round"
        />
      ) : (
        <circle cx={cx} cy={cy} r={11.5} fill={GLYPH} />
      )}
    </g>
  )
}

export type PatternMathPhase = 'none' | 'unit' | 'groups' | 'multiply' | 'answer'

export interface TrianglePatternDiagramProps {
  /** Which visible 5-tile group (0 or 1) gets a solid box, or null. */
  groupHighlight?: number | null
  /** Box BOTH visible full groups (used for the "8 groups" beat). */
  boxAllGroups?: boolean
  /** Ring the 3 triangles inside the boxed group. */
  highlightTriangles?: boolean
  /** Which math line to show under the bracket. */
  showMath?: PatternMathPhase
}

function GroupBox({ group, dashed = false }: { group: number; dashed?: boolean }) {
  const x = ROW_X + group * 5 * STEP - 5
  const w = 4 * STEP + TILE + 10
  return (
    <rect
      x={x}
      y={ROW_Y - 6}
      width={w}
      height={TILE + 12}
      rx={9}
      fill="none"
      stroke="#F59E0B"
      strokeWidth={3}
      strokeDasharray={dashed ? '7 5' : undefined}
    />
  )
}

export function TrianglePatternDiagram({
  groupHighlight = null,
  boxAllGroups = false,
  highlightTriangles = false,
  showMath = 'none',
}: TrianglePatternDiagramProps) {
  const bracketY = ROW_Y + TILE + 22
  const bracketX1 = ROW_X + TILE / 2
  const bracketX2 = LAST_X + TILE / 2
  const labelX = (bracketX1 + bracketX2) / 2

  const mathLine =
    showMath === 'unit'
      ? '△ ● △ △ ● → 5'
      : showMath === 'groups'
        ? '40 ÷ 5 = 8'
        : showMath === 'multiply'
          ? '8 × 3 = ?'
          : showMath === 'answer'
            ? '8 × 3 = 24'
            : null

  return (
    <svg
      viewBox={`0 0 ${PATTERN_VIEW_W} ${PATTERN_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 640, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* the 12 drawn tiles */}
      {Array.from({ length: SHOWN_TILES }, (_, i) => (
        <Tile key={i} x={ROW_X + i * STEP} glyph={glyphAt(i)} />
      ))}

      {/* ellipsis */}
      {[0, 1, 2].map((i) => (
        <circle key={`d${i}`} cx={DOTS_X + 5 + i * 9} cy={ROW_Y + TILE / 2} r={2.2} fill={INK} />
      ))}

      {/* the final (40th) tile — a circle */}
      <Tile x={LAST_X} glyph={glyphAt(TOTAL_SHAPES - 1)} />

      {/* group boxes */}
      {boxAllGroups ? (
        <g>
          <GroupBox group={0} />
          <GroupBox group={1} />
        </g>
      ) : (
        groupHighlight !== null && <GroupBox group={groupHighlight} />
      )}

      {/* rings around the 3 triangles of the boxed group */}
      {highlightTriangles &&
        groupHighlight !== null &&
        PATTERN_UNIT.map((g, i) =>
          g === 'triangle' ? (
            <circle
              key={`t${i}`}
              cx={ROW_X + (groupHighlight * 5 + i) * STEP + TILE / 2}
              cy={ROW_Y + TILE / 2}
              r={16}
              fill="none"
              stroke="#EF4444"
              strokeWidth={3}
            />
          ) : null,
        )}

      {/* bracket labelled 40 */}
      <line x1={bracketX1} y1={bracketY - 12} x2={bracketX1} y2={bracketY} stroke={INK} strokeWidth={2.5} />
      <line x1={bracketX2} y1={bracketY - 12} x2={bracketX2} y2={bracketY} stroke={INK} strokeWidth={2.5} />
      <line x1={bracketX1} y1={bracketY} x2={labelX - 26} y2={bracketY} stroke={INK} strokeWidth={2.5} />
      <line x1={labelX + 26} y1={bracketY} x2={bracketX2} y2={bracketY} stroke={INK} strokeWidth={2.5} />
      <text x={labelX} y={bracketY} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={INK}>
        {TOTAL_SHAPES}
      </text>

      {/* math line */}
      {mathLine && (
        <text
          x={labelX}
          y={bracketY + 38}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill={showMath === 'answer' ? '#10B981' : '#2f6df0'}
        >
          {mathLine}
        </text>
      )}
    </svg>
  )
}

export default function TrianglePattern20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A row of tiles repeating triangle, circle, triangle, triangle, circle. Twelve tiles are shown, then dots, then a final tile. A bracket under the whole row is labelled 40."
    >
      <TrianglePatternDiagram />
    </div>
  )
}
