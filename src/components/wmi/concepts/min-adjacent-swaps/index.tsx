import type { ReactNode } from 'react'

// C8 `min-adjacent-swaps` — the question figure: the row exactly as it stands,
// nothing solved. It never shows the swap count, the wrong pairs, or the sorted
// row; working those out is the whole exercise.
//
// `SwapRow` is exported so the post-answer explainer draws the SAME row with
// per-token states, a dashed link over a wrong pair and a swap arrow — one copy
// of the geometry, so the figure and the animation can never drift apart.

export type SwapKind = 'cards' | 'flags' | 'animals'
export type TokenState = 'normal' | 'focus' | 'wrong' | 'done'

interface SwapParams {
  kind: SwapKind
  order: 'asc' | 'desc'
  name: string
  values: number[]
}

// Falls back to a real sample so admin previews still draw when params are the
// wrong shape (a stale concept instance, a hand-typed preview).
const SAMPLE: SwapParams = { kind: 'cards', order: 'asc', name: 'Ayu', values: [3, 5, 1, 4, 2] }

const KINDS: readonly SwapKind[] = ['cards', 'flags', 'animals']
const MAX_LEN = 7

// ── layout (exported: the explainer lands on the same pixels) ────────────────

/** Token footprint. */
export const TOKEN_W = 46
export const TOKEN_H = 58
export const TOKEN_GAP = 10
/** Head-room above the row for the dashed pair link + swap arrow. */
export const ARC_H = 34
export const ROW_Y = ARC_H

export const rowWidth = (n: number) => n * TOKEN_W + (n - 1) * TOKEN_GAP
export const tokenX = (i: number) => i * (TOKEN_W + TOKEN_GAP)
export const tokenCx = (i: number) => tokenX(i) + TOKEN_W / 2

// ── colour tokens (warm brand, literal hex so the figure reads anywhere) ─────

const INK = '#2B2B2B'
const CREAM = '#FFF9F4'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'

/** One hue per position in the FINISHED row, so a token keeps its colour as it travels. */
const RANK_COLORS = ['#30598A', '#F0853A', '#58A700', '#7C5CBF', '#E0A000', '#C2575B', '#14746F']

function coerce(params: unknown): SwapParams {
  const p = (params ?? {}) as Partial<SwapParams>
  const values =
    Array.isArray(p.values) &&
    p.values.length >= 2 &&
    p.values.every((v) => typeof v === 'number' && Number.isFinite(v))
      ? p.values.slice(0, MAX_LEN).map((v) => Math.round(v))
      : SAMPLE.values
  return {
    kind: KINDS.includes(p.kind as SwapKind) ? (p.kind as SwapKind) : SAMPLE.kind,
    order: p.order === 'desc' ? 'desc' : 'asc',
    name: typeof p.name === 'string' && p.name.trim() ? p.name : SAMPLE.name,
    values,
  }
}

interface Skin {
  fill: string
  stroke: string
  ink: string
  width: number
}

function skinFor(state: TokenState, hue: string): Skin {
  if (state === 'focus') return { fill: AMBER_SOFT, stroke: AMBER, ink: '#8A6100', width: 3 }
  if (state === 'wrong') return { fill: ROSE_SOFT, stroke: ROSE, ink: ROSE, width: 3 }
  if (state === 'done') return { fill: GREEN_SOFT, stroke: GREEN, ink: GREEN_INK, width: 3 }
  return { fill: CREAM, stroke: hue, ink: INK, width: 2 }
}

/**
 * One token, drawn at the origin — the caller translates it into place. The
 * three kinds are the same numbered body with different chrome so the number
 * always sits in the same spot and stays the readable thing.
 */
function Token({ value, kind, state, hue }: { value: number; kind: SwapKind; state: TokenState; hue: string }) {
  const s = skinFor(state, hue)
  const label = (y: number) => (
    <text
      x={TOKEN_W / 2}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={22}
      fontWeight={900}
      fill={s.ink}
    >
      {value}
    </text>
  )

  if (kind === 'flags') {
    const poleX = 8
    const flagW = TOKEN_W - poleX - 2
    const flagH = 32
    return (
      <g>
        {/* pole */}
        <line x1={poleX} y1={4} x2={poleX} y2={TOKEN_H} stroke={s.stroke} strokeWidth={3} strokeLinecap="round" />
        {/* pennant with a swallow-tail notch on the right */}
        <path
          d={`M ${poleX} 4 H ${poleX + flagW} L ${poleX + flagW - 9} ${4 + flagH / 2} L ${poleX + flagW} ${4 + flagH} H ${poleX} Z`}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={s.width}
          strokeLinejoin="round"
        />
        <text
          x={poleX + (flagW - 9) / 2 + 2}
          y={4 + flagH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={19}
          fontWeight={900}
          fill={s.ink}
        >
          {value}
        </text>
        {/* base */}
        <line
          x1={poleX - 6}
          y1={TOKEN_H}
          x2={poleX + 6}
          y2={TOKEN_H}
          stroke={s.stroke}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    )
  }

  if (kind === 'animals') {
    // A plain critter: two ears, a rounded body, a number bib, three legs. The
    // ears and legs are drawn inside the body's rounded outline so nothing
    // floats free of it.
    return (
      <g>
        <polygon points="12,14 17,3 22,14" fill={s.fill} stroke={s.stroke} strokeWidth={s.width} strokeLinejoin="round" />
        <polygon points="24,14 29,3 34,14" fill={s.fill} stroke={s.stroke} strokeWidth={s.width} strokeLinejoin="round" />
        {/* legs, tucked under the body */}
        {[13, 23, 33].map((x) => (
          <line
            key={x}
            x1={x}
            y1={TOKEN_H - 14}
            x2={x}
            y2={TOKEN_H - 1}
            stroke={s.stroke}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <rect
          x={2}
          y={10}
          width={TOKEN_W - 4}
          height={36}
          rx={13}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={s.width}
        />
        {/* number bib */}
        <rect
          x={9}
          y={18}
          width={TOKEN_W - 18}
          height={20}
          rx={5}
          fill="rgba(255,255,255,0.75)"
          stroke={s.stroke}
          strokeWidth={1.2}
        />
        {label(28)}
      </g>
    )
  }

  // cards — a plain playing card with a soft drop shadow
  return (
    <g>
      <rect x={2.5} y={3.5} width={TOKEN_W} height={TOKEN_H} rx={8} fill="rgba(0,0,0,0.10)" />
      <rect
        x={0}
        y={0}
        width={TOKEN_W}
        height={TOKEN_H}
        rx={8}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={s.width}
      />
      {label(TOKEN_H / 2)}
    </g>
  )
}

export interface SwapRowProps {
  values: readonly number[]
  kind: SwapKind
  /** Per-position visual state; defaults to all `normal`. */
  states?: readonly TokenState[]
  /** Dashed arc joining two positions — used to point at ONE wrong pair. */
  link?: readonly [number, number] | null
  /** Two-headed arrow under the arc, for the pair about to trade places. */
  swap?: readonly [number, number] | null
  /**
   * Colour a token by its value's rank in this finished row, so a token keeps
   * its hue while it travels. Omit for a single-colour row.
   */
  rank?: readonly number[]
  /** Slide tokens between beats (the explainer turns this on unless reduced-motion). */
  animate?: boolean
  /** Max rendered width in px; the row scales down to fit. */
  maxWidth?: number
}

/**
 * The row itself. Tokens are keyed by VALUE, not by index, so React keeps the
 * same DOM node when two of them trade places — with `animate` on, the CSS
 * transform transition slides them past each other instead of popping.
 */
export function SwapRow({
  values,
  kind,
  states,
  link,
  swap,
  rank,
  animate = false,
  maxWidth = 360,
}: SwapRowProps) {
  const n = values.length
  const width = rowWidth(n)
  const height = ROW_Y + TOKEN_H + 6
  const hueOf = (value: number) => {
    const r = rank ? rank.indexOf(value) : -1
    return RANK_COLORS[(r >= 0 ? r : 0) % RANK_COLORS.length]
  }

  const marks: ReactNode[] = []
  if (link) {
    const [i, j] = link
    const x1 = tokenCx(Math.min(i, j))
    const x2 = tokenCx(Math.max(i, j))
    const baseY = ROW_Y - 4
    const cpY = Math.max(2, baseY - 24)
    marks.push(
      <g key="link">
        <path
          d={`M ${x1} ${baseY} Q ${(x1 + x2) / 2} ${cpY} ${x2} ${baseY}`}
          fill="none"
          stroke={ROSE}
          strokeWidth={2.4}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <circle cx={x1} cy={baseY} r={3.2} fill={ROSE} />
        <circle cx={x2} cy={baseY} r={3.2} fill={ROSE} />
      </g>,
    )
  }
  if (swap) {
    const [i, j] = swap
    const x1 = tokenCx(Math.min(i, j))
    const x2 = tokenCx(Math.max(i, j))
    const y = ROW_Y - 10
    marks.push(
      <g key="swap">
        <line x1={x1 + 7} y1={y} x2={x2 - 7} y2={y} stroke={GREEN} strokeWidth={2.6} strokeLinecap="round" />
        <polygon points={`${x1},${y} ${x1 + 8},${y - 4.5} ${x1 + 8},${y + 4.5}`} fill={GREEN} />
        <polygon points={`${x2},${y} ${x2 - 8},${y - 4.5} ${x2 - 8},${y + 4.5}`} fill={GREEN} />
      </g>,
    )
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={Math.min(maxWidth, width)}
      className="max-w-full"
      aria-hidden="true"
    >
      {marks}
      {values.map((value, i) => (
        <g
          key={value}
          style={{
            transform: `translate(${tokenX(i)}px, ${ROW_Y}px)`,
            transition: animate ? 'transform 420ms cubic-bezier(0.34, 1.2, 0.64, 1)' : undefined,
          }}
        >
          <Token value={value} kind={kind} state={states?.[i] ?? 'normal'} hue={hueOf(value)} />
        </g>
      ))}
    </svg>
  )
}

const KIND_ARIA: Record<SwapKind, string> = {
  cards: 'kartu angka',
  flags: 'bendera bernomor',
  animals: 'hewan bernomor punggung',
}

/**
 * min-adjacent-swaps — question figure. Shows only what the child is given: the
 * row as it stands. No sorted row, no wrong pairs marked, no swap count.
 *
 * Pure render from params: no random, no dates, SSR-safe.
 */
export default function MinAdjacentSwapsIllustration({ params }: { params: unknown }) {
  const p = coerce(params)
  const aria =
    `Barisan ${p.values.length} ${KIND_ARIA[p.kind]} dari kiri ke kanan: ${p.values.join(', ')}. ` +
    `Hanya dua yang bersebelahan yang boleh ditukar.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={aria}>
      <SwapRow values={p.values} kind={p.kind} rank={[...p.values].sort((a, b) => (p.order === 'asc' ? a - b : b - a))} />
    </div>
  )
}
