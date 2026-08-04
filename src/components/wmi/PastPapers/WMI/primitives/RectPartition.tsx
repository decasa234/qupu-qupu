/**
 * RectPartition — one big rectangle cut into differently-sized sub-rectangles,
 * with per-piece labels and dimension rails along the edges.
 *
 * `GridBoard` covers uniform cells only; this covers the "rectangle jigsaw"
 * family, where the cuts land wherever they like and each piece may span several
 * columns / rows:
 *   - area-jigsaw figures (a rectangle cut into 3–6 pieces, some areas printed,
 *     some side lengths printed, one value missing)
 *   - the `rectangle-area-decompose` concept illustration + explainer
 *   - strip / T / pinwheel / nested partitions
 *
 * Pure SVG render — no hooks, no framer-motion, no window/document, no
 * Math.random or Date: safe to render on the server and identical for the same
 * props every time.
 *
 * ── NOT TO SCALE, on purpose ────────────────────────────────────────────────
 * These puzzles routinely put a 2×8 piece next to a 7×3 one. Drawn true to
 * scale, the 2-wide column collapses to a sliver that cannot hold its own
 * label, and the figure becomes unreadable exactly where the child needs to
 * read it. So `colWidths` / `rowHeights` are treated as an ORDERING, not as
 * lengths: each track is squashed into a narrow band (`unit` … `unit *
 * (1 + spread)`) by a linear rescale of the min–max range. Bigger still draws
 * bigger — the picture never contradicts the numbers — but the biggest is only
 * ~2× the smallest however extreme the true ratio is, so every cell stays big
 * enough for its text. Equal values draw equal. Callers should say "not to
 * scale" in the stem, as the papers themselves do.
 *
 * @example
 * const lay = rectPartitionLayout([3, 5], [4, 6], { topRail: true, leftRail: true })
 * <RectPartition
 *   colWidths={[3, 5]}
 *   rowHeights={[4, 6]}
 *   pieces={[
 *     { r0: 0, c0: 0, r1: 0, c1: 0, label: 'A', sub: '12 cm²' },
 *     { r0: 0, c0: 1, r1: 0, c1: 1, label: 'B', sub: '20 cm²' },
 *     { r0: 1, c0: 0, r1: 1, c1: 0, label: 'C', sub: '18 cm²' },
 *     { r0: 1, c0: 1, r1: 1, c1: 1, label: 'D', sub: '?', highlight: 'amber' },
 *   ]}
 *   topLabels={[{ from: 0, to: 0, text: '3 cm' }]}
 *   showTopRail
 *   showLeftRail
 * />
 */

import type { CSSProperties, ReactNode } from 'react'

// ── tokens ────────────────────────────────────────────────────────────────────

/** Label / rail ink tones. `ink` is the printed-evidence default. */
export type RectPartitionTone = 'ink' | 'amber' | 'green' | 'rose' | 'muted'

const TONE_INK: Record<RectPartitionTone, string> = {
  ink: '#334155', // slate-700
  amber: '#8A6100',
  green: '#3D7400',
  rose: '#D9534F',
  muted: '#9AA2AE',
}

const HIGHLIGHT_FILLS: Record<string, string> = {
  amber: '#FEF3C7',
  green: '#D1FAE5',
  red: '#FEE2E2',
  blue: '#E1EFFB',
}

const HIGHLIGHT_STROKES: Record<string, string> = {
  ring: '#374151',
  amber: '#D97706',
  green: '#10B981',
  red: '#EF4444',
  blue: '#30598A',
}

// ── props ─────────────────────────────────────────────────────────────────────

/** One sub-rectangle, given as an inclusive span of grid columns and rows. */
export interface RectPartitionPiece {
  r0: number
  c0: number
  r1: number
  c1: number
  /** Big letter in the middle of the piece, e.g. `"A"`. */
  label?: string
  /** Small second line under the label, e.g. `"24 cm²"` or `"?"`. */
  sub?: string
  /** Background fill. Defaults to white (or the highlight tint). */
  fill?: string
  /** Overlay: tint + ring in that colour. `'ring'` strokes without tinting. */
  highlight?: 'none' | 'ring' | 'amber' | 'green' | 'red' | 'blue'
  /** Ink for `sub`. Defaults to the piece's own `ink` / slate. */
  subTone?: RectPartitionTone
}

/** A dimension label spanning columns (top/bottom rails) or rows (left/right). */
export interface RectPartitionEdgeLabel {
  /** Inclusive index span along that axis. `from === to` marks one part. */
  from: number
  to: number
  text: string
  tone?: RectPartitionTone
}

export interface RectPartitionScale {
  /** Drawn size of the SMALLEST track entry, in SVG units. @default 74 */
  unit?: number
  /** The largest entry draws `unit * (1 + spread)`. @default 0.95 */
  spread?: number
}

export interface RectPartitionProps extends RectPartitionScale {
  /** True widths, left to right. Used for ORDER and labelling, not as lengths. */
  colWidths: number[]
  /** True heights, top to bottom. */
  rowHeights: number[]
  pieces: RectPartitionPiece[]
  /** Single-part column labels live here; the rail also ticks every cut. */
  topLabels?: RectPartitionEdgeLabel[]
  /** Wide column spans (e.g. the whole width) live here, clear of the top rail. */
  bottomLabels?: RectPartitionEdgeLabel[]
  /** Single-part row labels. */
  leftLabels?: RectPartitionEdgeLabel[]
  /** Wide row spans (e.g. the whole height). */
  rightLabels?: RectPartitionEdgeLabel[]
  /**
   * Force the top / left rails on even when they carry no label — the ticks are
   * what make "the second part of the top edge" a thing a child can point at.
   * Default: on when that rail has labels.
   */
  showTopRail?: boolean
  showLeftRail?: boolean
  /** Extra SVG placed inside the figure, in layout coordinates. */
  children?: ReactNode
  /** Passed to the root `<svg>`; `viewBox` is computed and cannot be overridden. */
  width?: string | number
  style?: CSSProperties
  className?: string
}

// ── layout ────────────────────────────────────────────────────────────────────

export interface RectPartitionLayout {
  /** Drawn column widths / row heights (see the not-to-scale note above). */
  colW: number[]
  rowH: number[]
  /** Cumulative boundary offsets inside the figure; length = n + 1. */
  xs: number[]
  ys: number[]
  /** Top-left corner of the big rectangle inside the viewBox. */
  originX: number
  originY: number
  boardW: number
  boardH: number
  width: number
  height: number
  viewBox: string
}

const RAIL_GAP = 15 // rail line offset from the rectangle edge
const RAIL_GUTTER = 30 // room a top / bottom rail needs
const SIDE_GUTTER = 52 // room a left / right rail needs (horizontal text)
const PAD = 6

/**
 * Squashes a track of true lengths into a readable band. Order is preserved;
 * proportion deliberately is not. All-equal input draws all-equal.
 */
function squash(values: number[], unit: number, spread: number): number[] {
  const safe = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 1))
  const min = Math.min(...safe)
  const max = Math.max(...safe)
  if (!(max > min)) return safe.map(() => unit)
  return safe.map((v) => Math.round(unit * (1 + (spread * (v - min)) / (max - min))))
}

/**
 * Geometry for a RectPartition, so callers can place their own overlays (and so
 * the component and an explainer agree on every coordinate).
 */
export function rectPartitionLayout(
  colWidths: number[],
  rowHeights: number[],
  opts: RectPartitionScale & {
    topRail?: boolean
    bottomRail?: boolean
    leftRail?: boolean
    rightRail?: boolean
  } = {},
): RectPartitionLayout {
  const { unit = 74, spread = 0.95, topRail, bottomRail, leftRail, rightRail } = opts
  const colW = squash(colWidths.length > 0 ? colWidths : [1], unit, spread)
  const rowH = squash(rowHeights.length > 0 ? rowHeights : [1], unit, spread)

  const xs = [0]
  for (const w of colW) xs.push(xs[xs.length - 1] + w)
  const ys = [0]
  for (const h of rowH) ys.push(ys[ys.length - 1] + h)

  const boardW = xs[xs.length - 1]
  const boardH = ys[ys.length - 1]
  const originX = PAD + (leftRail ? SIDE_GUTTER : 0)
  const originY = PAD + (topRail ? RAIL_GUTTER : 0)
  const width = originX + boardW + PAD + (rightRail ? SIDE_GUTTER : 0)
  const height = originY + boardH + PAD + (bottomRail ? RAIL_GUTTER : 0)

  return {
    colW,
    rowH,
    xs,
    ys,
    originX,
    originY,
    boardW,
    boardH,
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
  }
}

// ── component ─────────────────────────────────────────────────────────────────

const FONT = 'ui-sans-serif, system-ui, sans-serif'

function Tick({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
}

export function RectPartition({
  colWidths,
  rowHeights,
  pieces,
  topLabels,
  bottomLabels,
  leftLabels,
  rightLabels,
  showTopRail,
  showLeftRail,
  unit,
  spread,
  children,
  width = '100%',
  style,
  className,
}: RectPartitionProps) {
  const topRail = showTopRail ?? (topLabels?.length ?? 0) > 0
  const leftRail = showLeftRail ?? (leftLabels?.length ?? 0) > 0
  const bottomRail = (bottomLabels?.length ?? 0) > 0
  const rightRail = (rightLabels?.length ?? 0) > 0

  const lay = rectPartitionLayout(colWidths, rowHeights, {
    unit,
    spread,
    topRail,
    bottomRail,
    leftRail,
    rightRail,
  })
  const { xs, ys, originX, originY, boardW, boardH } = lay

  const px = (c: number) => originX + xs[Math.max(0, Math.min(xs.length - 1, c))]
  const py = (r: number) => originY + ys[Math.max(0, Math.min(ys.length - 1, r))]

  const railInk = TONE_INK.muted

  return (
    <svg viewBox={lay.viewBox} width={width} style={style} className={className}>
      {/* ── piece fills + highlight tints ── */}
      {pieces.map((p, i) => {
        const x = px(p.c0)
        const y = py(p.r0)
        const w = px(p.c1 + 1) - x
        const h = py(p.r1 + 1) - y
        const tint = p.highlight && p.highlight !== 'none' ? HIGHLIGHT_FILLS[p.highlight] : undefined
        return (
          <rect
            key={`fill-${i}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={p.fill ?? tint ?? '#FFFFFF'}
          />
        )
      })}

      {/* ── piece borders (every cut is drawn as the piece's own outline) ── */}
      {pieces.map((p, i) => {
        const x = px(p.c0)
        const y = py(p.r0)
        const w = px(p.c1 + 1) - x
        const h = py(p.r1 + 1) - y
        const ring = p.highlight && p.highlight !== 'none' ? HIGHLIGHT_STROKES[p.highlight] : undefined
        return (
          <rect
            key={`edge-${i}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke={ring ?? '#94A3B8'}
            strokeWidth={ring ? 2.5 : 1.5}
          />
        )
      })}

      {/* ── the outer rectangle, drawn last and boldest ── */}
      <rect
        x={originX}
        y={originY}
        width={boardW}
        height={boardH}
        fill="none"
        stroke="#1F2937"
        strokeWidth={2.5}
      />

      {/* ── piece text ── */}
      {pieces.map((p, i) => {
        const cx = (px(p.c0) + px(p.c1 + 1)) / 2
        const cy = (py(p.r0) + py(p.r1 + 1)) / 2
        const hasSub = !!p.sub
        return (
          <g key={`text-${i}`}>
            {p.label && (
              <text
                x={cx}
                y={hasSub ? cy - 9 : cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={800}
                fill="#1F2937"
                fontFamily={FONT}
              >
                {p.label}
              </text>
            )}
            {p.sub && (
              <text
                x={cx}
                y={p.label ? cy + 11 : cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={700}
                fill={TONE_INK[p.subTone ?? 'ink']}
                fontFamily={FONT}
              >
                {p.sub}
              </text>
            )}
          </g>
        )
      })}

      {/* ── top rail: a tick at every vertical cut, labels centred per span ── */}
      {topRail && (
        <g>
          <line
            x1={originX}
            y1={originY - RAIL_GAP}
            x2={originX + boardW}
            y2={originY - RAIL_GAP}
            stroke={railInk}
            strokeWidth={1.5}
          />
          {xs.map((_, c) => (
            <Tick
              key={`tt-${c}`}
              x1={px(c)}
              y1={originY - RAIL_GAP - 4}
              x2={px(c)}
              y2={originY - RAIL_GAP + 4}
              color={railInk}
            />
          ))}
          {topLabels?.map((l, i) => (
            <text
              key={`tl-${i}`}
              x={(px(l.from) + px(l.to + 1)) / 2}
              y={originY - RAIL_GAP - 9}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={800}
              fill={TONE_INK[l.tone ?? 'ink']}
              fontFamily={FONT}
            >
              {l.text}
            </text>
          ))}
        </g>
      )}

      {/* ── bottom rail: wide spans (e.g. the whole width) ── */}
      {bottomRail &&
        bottomLabels?.map((l, i) => {
          const y = originY + boardH + RAIL_GAP
          return (
            <g key={`bl-${i}`}>
              <line x1={px(l.from)} y1={y} x2={px(l.to + 1)} y2={y} stroke={railInk} strokeWidth={1.5} />
              <Tick x1={px(l.from)} y1={y - 4} x2={px(l.from)} y2={y + 4} color={railInk} />
              <Tick x1={px(l.to + 1)} y1={y - 4} x2={px(l.to + 1)} y2={y + 4} color={railInk} />
              <text
                x={(px(l.from) + px(l.to + 1)) / 2}
                y={y + 11}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={800}
                fill={TONE_INK[l.tone ?? 'ink']}
                fontFamily={FONT}
              >
                {l.text}
              </text>
            </g>
          )
        })}

      {/* ── left rail: a tick at every horizontal cut ── */}
      {leftRail && (
        <g>
          <line
            x1={originX - RAIL_GAP}
            y1={originY}
            x2={originX - RAIL_GAP}
            y2={originY + boardH}
            stroke={railInk}
            strokeWidth={1.5}
          />
          {ys.map((_, r) => (
            <Tick
              key={`lt-${r}`}
              x1={originX - RAIL_GAP - 4}
              y1={py(r)}
              x2={originX - RAIL_GAP + 4}
              y2={py(r)}
              color={railInk}
            />
          ))}
          {leftLabels?.map((l, i) => (
            <text
              key={`ll-${i}`}
              x={originX - RAIL_GAP - 8}
              y={(py(l.from) + py(l.to + 1)) / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={800}
              fill={TONE_INK[l.tone ?? 'ink']}
              fontFamily={FONT}
            >
              {l.text}
            </text>
          ))}
        </g>
      )}

      {/* ── right rail: wide row spans (e.g. the whole height) ── */}
      {rightRail &&
        rightLabels?.map((l, i) => {
          const x = originX + boardW + RAIL_GAP
          return (
            <g key={`rl-${i}`}>
              <line x1={x} y1={py(l.from)} x2={x} y2={py(l.to + 1)} stroke={railInk} strokeWidth={1.5} />
              <Tick x1={x - 4} y1={py(l.from)} x2={x + 4} y2={py(l.from)} color={railInk} />
              <Tick x1={x - 4} y1={py(l.to + 1)} x2={x + 4} y2={py(l.to + 1)} color={railInk} />
              <text
                x={x + 7}
                y={(py(l.from) + py(l.to + 1)) / 2}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={800}
                fill={TONE_INK[l.tone ?? 'ink']}
                fontFamily={FONT}
              >
                {l.text}
              </text>
            </g>
          )
        })}

      {children}
    </svg>
  )
}

export default RectPartition
