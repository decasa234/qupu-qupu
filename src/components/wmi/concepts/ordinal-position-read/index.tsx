import type { ReactNode } from 'react'
import { Apple, Banana, Cherry, House, Star, Tree } from '../../PastPapers/WMI/primitives/glyphs'

/**
 * `ordinal-position-read` — the question figure.
 *
 * Draws ONLY the row the stem talks about: n items standing left to right. It
 * never marks the asked place, never prints position numbers, and never tints
 * the landmark — the whole skill is walking the row yourself, so any hint drawn
 * here would hand the answer over.
 *
 * Copy-adapted from `PastPapers/WMI/NumCards24PEIllustration` (the card-row
 * entry in PRIMITIVE-INDEX.md) and the shared `primitives/glyphs` kit; no
 * primitive covers "row of mixed items", so the row renderer below is
 * co-exported for the post-answer explainer to reuse pixel-for-pixel.
 *
 * Pure render from params — no random, no dates, SSR-safe.
 *
 * LANGUAGE: concept illustrations receive only `{ params }` (see
 * `IllustrationComponent` in ../registry.ts), which carries no locale, so the
 * figure is drawn WORDLESS. Only the aria-label is prose; it is pinned to
 * English via `lang="en"` and it speaks exactly what is drawn — the contents of
 * the row in order — and nothing about the answer.
 */

type Kind = 'number' | 'picture'

interface OrdinalParams {
  kind: Kind
  cells: string[]
}

const SAMPLE: OrdinalParams = {
  kind: 'number',
  cells: ['5', '2', '8', '1', '9', '4', '7'],
}

const PICTURE_KEYS = ['apple', 'banana', 'cherry', 'star', 'tree', 'house'] as const
type PictureKey = (typeof PICTURE_KEYS)[number]

/** English names, used only by the aria-label. Mirrors PICTURE_NAMES on the API side. */
const PICTURE_EN: Record<PictureKey, string> = {
  apple: 'apple',
  banana: 'banana',
  cherry: 'cherry',
  star: 'star',
  tree: 'tree',
  house: 'house',
}

// ── colour tokens (literal hex so the row reads the same on any surface) ─────

const INK = '#1F2937'
const CARD_FILL = '#FEFCE8'
const CARD_STROKE = '#92400E'
const COUNT_FILL = '#FFF3D4'
const COUNT_STROKE = '#E0A000'
const COUNT_INK = '#8A6100'
const TARGET_FILL = '#EAF6DC'
const TARGET_STROKE = '#58A700'
const TARGET_INK = '#3D7400'
const LANDMARK_FILL = '#E1EFFB'
const LANDMARK_STROKE = '#30598A'
const WRONG_FILL = '#FBE9E8'
const WRONG_STROKE = '#D9534F'
const GROUND = '#E7D9C6'

// ── geometry — the ONE copy of this row's coordinate maths ──────────────────

export const CARD_W = 44
export const CARD_H = 58
export const CARD_GAP = 8
const PAD_X = 10
/** Room above the row for the running-count badges the explainer draws. */
const PAD_TOP = 22
/** Room below the row for the ground line and the direction arrow. */
const PAD_BOTTOM = 26

export interface RowGeometry {
  width: number
  height: number
  rowY: number
  groundY: number
  /** X origin of the card at index i. */
  originX(i: number): number
}

export function rowGeometry(n: number): RowGeometry {
  const count = Math.max(1, n)
  const width = PAD_X * 2 + count * CARD_W + (count - 1) * CARD_GAP
  return {
    width,
    height: PAD_TOP + CARD_H + PAD_BOTTOM,
    rowY: PAD_TOP,
    groundY: PAD_TOP + CARD_H + 6,
    originX: (i: number) => PAD_X + i * (CARD_W + CARD_GAP),
  }
}

// ── one cell ────────────────────────────────────────────────────────────────

export type CellState = 'idle' | 'count' | 'target' | 'landmark' | 'wrong'

const TONE: Record<CellState, { fill: string; stroke: string; ink: string; weight: number }> = {
  idle: { fill: CARD_FILL, stroke: CARD_STROKE, ink: INK, weight: 2 },
  count: { fill: COUNT_FILL, stroke: COUNT_STROKE, ink: COUNT_INK, weight: 3 },
  target: { fill: TARGET_FILL, stroke: TARGET_STROKE, ink: TARGET_INK, weight: 3.5 },
  landmark: { fill: LANDMARK_FILL, stroke: LANDMARK_STROKE, ink: LANDMARK_STROKE, weight: 3 },
  wrong: { fill: WRONG_FILL, stroke: WRONG_STROKE, ink: WRONG_STROKE, weight: 3 },
}

function glyphFor(key: string, cx: number, cy: number, r: number): ReactNode {
  switch (key) {
    case 'apple':
      return <Apple cx={cx} cy={cy} r={r} />
    case 'banana':
      return <Banana cx={cx} cy={cy} r={r} />
    case 'cherry':
      return <Cherry cx={cx} cy={cy} r={r} />
    case 'star':
      return <Star cx={cx} cy={cy} r={r} />
    case 'tree':
      return <Tree cx={cx} cy={cy} r={r} />
    case 'house':
      return <House cx={cx} cy={cy} r={r} />
    default:
      return null
  }
}

export interface RowCellProps {
  cell: string
  kind: Kind
  x: number
  y: number
  state?: CellState
  /** Running-count number drawn in a chip above the card (explainer only). */
  badge?: number | null
}

export function RowCell({ cell, kind, x, y, state = 'idle', badge = null }: RowCellProps) {
  const tone = TONE[state]
  const cx = x + CARD_W / 2
  const cy = y + CARD_H / 2

  return (
    <g>
      <rect x={x + 2.5} y={y + 2.5} width={CARD_W} height={CARD_H} rx={8} fill="rgba(0,0,0,0.10)" />
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill={tone.fill}
        stroke={tone.stroke}
        strokeWidth={tone.weight}
      />
      {kind === 'number' ? (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={26}
          fontWeight={900}
          fill={tone.ink}
        >
          {cell}
        </text>
      ) : (
        glyphFor(cell, cx, cy, 15)
      )}
      {badge !== null && (
        <g>
          <circle cx={cx} cy={y - 11} r={9.5} fill={tone.stroke} />
          <text
            x={cx}
            y={y - 11}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={12}
            fontWeight={900}
            fill="#FFFFFF"
          >
            {badge}
          </text>
        </g>
      )}
    </g>
  )
}

// ── reusable row primitive ──────────────────────────────────────────────────

export interface ItemRowProps {
  cells: string[]
  kind: Kind
  states?: readonly CellState[]
  badges?: readonly (number | null)[]
  /** Draws a short arrow under the named end, marking where counting starts. */
  startArrow?: 'left' | 'right' | null
  /** Rendered pixel cap; the SVG always scales down to its container. */
  maxWidth?: number
}

export function ItemRow({
  cells,
  kind,
  states,
  badges,
  startArrow = null,
  maxWidth = 400,
}: ItemRowProps) {
  const g = rowGeometry(cells.length)
  const arrowY = g.groundY + 12
  const arrowX = startArrow === 'left' ? g.originX(0) + CARD_W / 2 : g.originX(cells.length - 1) + CARD_W / 2
  const arrowDir = startArrow === 'left' ? 1 : -1

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      width="100%"
      style={{ maxWidth, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <line
        x1={PAD_X - 4}
        y1={g.groundY}
        x2={g.width - PAD_X + 4}
        y2={g.groundY}
        stroke={GROUND}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {cells.map((cell, i) => (
        <RowCell
          key={i}
          cell={cell}
          kind={kind}
          x={g.originX(i)}
          y={g.rowY}
          state={states?.[i] ?? 'idle'}
          badge={badges?.[i] ?? null}
        />
      ))}
      {startArrow && (
        <g>
          <line
            x1={arrowX - arrowDir * 14}
            y1={arrowY}
            x2={arrowX + arrowDir * 14}
            y2={arrowY}
            stroke={COUNT_STROKE}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <polygon
            points={`${arrowX + arrowDir * 18},${arrowY} ${arrowX + arrowDir * 9},${arrowY - 6} ${arrowX + arrowDir * 9},${arrowY + 6}`}
            fill={COUNT_STROKE}
          />
        </g>
      )}
    </svg>
  )
}

// ── static illustration (default export) ────────────────────────────────────

function readParams(params: unknown): OrdinalParams {
  const p = (params ?? {}) as Partial<OrdinalParams>
  const kind: Kind = p.kind === 'picture' ? 'picture' : 'number'
  const cells =
    Array.isArray(p.cells) && p.cells.length > 0 && p.cells.every((c) => typeof c === 'string')
      ? (p.cells as string[])
      : SAMPLE.cells
  return { kind, cells }
}

export default function OrdinalPositionReadIllustration({ params }: { params: unknown }) {
  const { kind, cells } = readParams(params)
  const spoken = cells
    .map((c) => (kind === 'number' ? c : (PICTURE_EN[c as PictureKey] ?? c)))
    .join(', ')
  const noun = kind === 'number' ? 'number cards' : 'objects'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      lang="en"
      aria-label={`A row of ${cells.length} ${noun}, from left to right: ${spoken}.`}
    >
      <ItemRow cells={cells} kind={kind} />
    </div>
  )
}
