import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildSortCountSteps,
  sortCountHash,
  type SortAttribute,
  type SortCountStoryboard,
  type SortGroupView,
  type SortLayout,
} from './sortCountSteps'
import { useBeatControl } from './useBeatControl'

/**
 * D4 `sort-count-by-attribute` — the post-answer animated explainer.
 *
 * Beat 1 shows the jumbled pile the question showed. Beat 2 is the lesson: each
 * object FLIES out of the jumble into its own kind (framer `layoutId`, so an
 * object keeps its identity and its colour while it travels). Only after that do
 * numbers appear, one group at a time, and only the last beat states the answer.
 *
 * Pure render from params — the pile order and the scatter jitter come from an
 * integer hash of `seed`, so the same params always draw the same picture (no
 * Math.random, no Date; SSR-safe). Honors `prefers-reduced-motion` by dropping
 * `layoutId` and the springs so nothing moves.
 */

// --- palette (mirrors src/components/wmi/concepts/sort-count-by-attribute) ---
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const YELLOW = '#E0A000'
const RED = '#D64545'
const PURPLE = '#7B5EA7'
const CREAM = '#FAF6EF'
const OUTLINE = 'rgba(38,59,85,0.28)'
const STRING = 'rgba(38,59,85,0.35)'
const STEM = '#7A5B3A'

// house chrome
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const BLUE_SOFT = '#E1EFFB'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const INK = '#263B55'

const HUE: Record<string, string> = {
  'shape:circle': BLUE,
  'shape:triangle': ORANGE,
  'shape:square': GREEN,
  'shape:star': YELLOW,
  'colour:red': RED,
  'colour:blue': BLUE,
  'colour:orange': ORANGE,
  'colour:green': GREEN,
  'colour:yellow': YELLOW,
  'fruit:apple': RED,
  'fruit:banana': YELLOW,
  'fruit:orange': ORANGE,
  'fruit:grape': PURPLE,
}

// --- glyphs (mirrors the question figure, so an object looks the same here) ---

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

function glyph(
  attribute: SortAttribute,
  key: string,
  cx: number,
  cy: number,
  s: number,
  fill: string,
): ReactNode {
  const stroke = OUTLINE
  const sw = 1.4

  if (attribute === 'colour') {
    return (
      <>
        <path
          d={`M ${cx} ${cy + 0.33 * s} L ${cx - 0.16 * s} ${cy + 0.58 * s} L ${cx + 0.16 * s} ${cy + 0.58 * s} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <ellipse cx={cx} cy={cy - 0.32 * s} rx={0.62 * s} ry={0.75 * s} fill={fill} stroke={stroke} strokeWidth={sw} />
        <ellipse cx={cx - 0.22 * s} cy={cy - 0.55 * s} rx={0.13 * s} ry={0.19 * s} fill={CREAM} opacity={0.75} />
        <path
          d={`M ${cx} ${cy + 0.58 * s} q ${0.26 * s} ${0.18 * s} 0 ${0.37 * s}`}
          fill="none"
          stroke={STRING}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </>
    )
  }

  if (attribute === 'fruit') {
    if (key === 'banana') {
      const body =
        `M ${cx - 0.94 * s} ${cy - 0.06 * s} ` +
        `C ${cx - 0.9 * s} ${cy + 0.32 * s} ${cx - 0.44 * s} ${cy + 0.58 * s} ${cx + 0.14 * s} ${cy + 0.56 * s} ` +
        `C ${cx + 0.6 * s} ${cy + 0.54 * s} ${cx + 0.92 * s} ${cy + 0.22 * s} ${cx + 0.96 * s} ${cy - 0.4 * s} ` +
        `C ${cx + 0.76 * s} ${cy + 0.06 * s} ${cx + 0.48 * s} ${cy + 0.12 * s} ${cx + 0.06 * s} ${cy + 0.08 * s} ` +
        `C ${cx - 0.34 * s} ${cy + 0.04 * s} ${cx - 0.68 * s} ${cy - 0.12 * s} ${cx - 0.78 * s} ${cy - 0.46 * s} Z`
      return (
        <>
          <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path
            d={`M ${cx - 0.46 * s} ${cy + 0.12 * s} Q ${cx + 0.04 * s} ${cy + 0.46 * s} ${cx + 0.56 * s} ${cy + 0.12 * s}`}
            fill="none"
            stroke={CREAM}
            strokeWidth={1.8}
            strokeLinecap="round"
            opacity={0.35}
          />
          <path
            d={`M ${cx - 0.86 * s} ${cy - 0.26 * s} L ${cx - 0.99 * s} ${cy - 0.32 * s}`}
            stroke={STEM}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )
    }
    if (key === 'grape') {
      const dots: Array<[number, number]> = [
        [-0.52, -0.18],
        [0, -0.3],
        [0.52, -0.18],
        [-0.28, 0.28],
        [0.28, 0.28],
        [0, 0.72],
      ]
      return (
        <>
          <path
            d={`M ${cx} ${cy - 0.9 * s} l 0 ${0.34 * s}`}
            stroke={STEM}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          {dots.map(([dx, dy], i) => (
            <circle
              key={i}
              cx={cx + dx * s}
              cy={cy + dy * s}
              r={0.32 * s}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
            />
          ))}
        </>
      )
    }
    if (key === 'apple') {
      return (
        <>
          <path
            d={`M ${cx} ${cy - 0.9 * s} q ${0.1 * s} ${-0.3 * s} ${0.42 * s} ${-0.34 * s} q ${-0.06 * s} ${0.34 * s} ${-0.42 * s} ${0.36 * s} Z`}
            fill={GREEN}
            stroke={stroke}
            strokeWidth={1}
          />
          <path
            d={`M ${cx} ${cy - 0.86 * s} l 0 ${0.22 * s}`}
            stroke={STEM}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${cx} ${cy - 0.6 * s} q ${0.9 * s} ${-0.28 * s} ${0.9 * s} ${0.5 * s} q 0 ${0.72 * s} ${-0.9 * s} ${0.86 * s} q ${-0.9 * s} ${-0.14 * s} ${-0.9 * s} ${-0.86 * s} q 0 ${-0.78 * s} ${0.9 * s} ${-0.5 * s} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        </>
      )
    }
    return (
      <>
        <path
          d={`M ${cx} ${cy - 0.7 * s} L ${cx + 0.05 * s} ${cy - 0.94 * s}`}
          stroke={STEM}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${cx + 0.06 * s} ${cy - 0.7 * s} Q ${cx + 0.26 * s} ${cy - 1.12 * s} ${cx + 0.66 * s} ${cy - 0.98 * s} Q ${cx + 0.42 * s} ${cy - 0.6 * s} ${cx + 0.06 * s} ${cy - 0.7 * s} Z`}
          fill={GREEN}
          stroke={stroke}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <circle cx={cx} cy={cy} r={0.82 * s} fill={fill} stroke={stroke} strokeWidth={sw} />
        <path
          d={`M ${cx - 0.46 * s} ${cy - 0.3 * s} Q ${cx - 0.4 * s} ${cy - 0.56 * s} ${cx - 0.14 * s} ${cy - 0.64 * s}`}
          fill="none"
          stroke={CREAM}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.5}
        />
      </>
    )
  }

  if (key === 'triangle') {
    return (
      <polygon
        points={`${cx},${cy - 0.92 * s} ${cx + 0.9 * s},${cy + 0.72 * s} ${cx - 0.9 * s},${cy + 0.72 * s}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  }
  if (key === 'square') {
    return (
      <rect
        x={cx - 0.78 * s}
        y={cy - 0.78 * s}
        width={1.56 * s}
        height={1.56 * s}
        rx={2.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
    )
  }
  if (key === 'star') {
    return (
      <polygon
        points={starPoints(cx, cy, 0.95 * s, 0.42 * s)}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  }
  return <circle cx={cx} cy={cy} r={0.82 * s} fill={fill} stroke={stroke} strokeWidth={sw} />
}

// --- geometry ---------------------------------------------------------------
// Two boards share one item size so an object can fly between them without
// resizing: the jumbled pile (absolute cells + jitter, mirroring the question
// figure) and the sorted rows (one flex line per kind). The size is squeezed by
// whichever board is tighter, so 30 objects still read at a glance.

const PANEL_W = 400
const PAD_X = 10
const PAD_Y = 8
const ROW_PAD_X = 6
const LABEL_W = 62
const LABEL_GAP = 6
const ITEM_GAP = 4
const ROW_GAP = 6
const MAX_ITEM = 34
const MIN_ITEM = 14

interface Geometry {
  item: number
  glyphS: number
  cell: number
  cols: number
  rowCount: number
  lastRowN: number
  stagger: number
  jitter: number
  mixedW: number
  mixedH: number
  boardH: number
}

function colsFor(layout: SortLayout, n: number): number {
  if (layout === 'grid') return Math.min(6, Math.max(3, Math.ceil(Math.sqrt(n))))
  if (layout === 'rows') return Math.min(8, Math.max(4, n))
  return Math.min(6, Math.max(3, Math.ceil(Math.sqrt(n * 1.2))))
}

function buildGeometry(story: SortCountStoryboard): Geometry {
  const n = Math.max(1, story.pile.length)
  const k = Math.max(1, story.counts.length)
  const maxCount = Math.max(1, ...story.counts)
  const cols = colsFor(story.layout, n)
  const f = story.layout === 'rows' ? 1.5 : 1.66
  const sf = story.layout === 'rows' ? f / 2 : 0

  // widest item the pile board can afford, the sorted row can afford, and the
  // overall pile size deserves
  const byMixed = Math.floor((PANEL_W - PAD_X * 2) / (cols * f + sf))
  const itemsW = PANEL_W - ROW_PAD_X * 2 - LABEL_W - LABEL_GAP
  const byRow = Math.floor((itemsW + ITEM_GAP) / maxCount) - ITEM_GAP
  const byTotal = n <= 12 ? MAX_ITEM : n <= 20 ? 30 : n <= 26 ? 27 : 24
  const item = Math.max(MIN_ITEM, Math.min(MAX_ITEM, byTotal, byRow, byMixed))

  const cell = Math.round(item * f)
  const stagger = story.layout === 'rows' ? Math.round(cell / 2) : 0
  const rowCount = Math.max(1, Math.ceil(n / cols))
  const lastRowN = n - (rowCount - 1) * cols
  const mixedW = PAD_X * 2 + cols * cell + stagger
  const mixedH = PAD_Y * 2 + rowCount * cell
  const jitter = story.layout === 'scatter' ? Math.max(0, Math.floor((cell - item) / 2)) : 0
  const groupedH = k * (item + 14) + (k - 1) * ROW_GAP

  return {
    item,
    glyphS: item / 2.3,
    cell,
    cols,
    rowCount,
    lastRowN,
    stagger,
    jitter,
    mixedW,
    mixedH,
    boardH: Math.max(mixedH, groupedH),
  }
}

/** Where item `i` sits in the jumbled pile — same cell walk as the question figure. */
function pilePos(geo: Geometry, layout: SortLayout, seed: number, i: number) {
  const col = i % geo.cols
  const row = Math.floor(i / geo.cols)
  const rowN = row === geo.rowCount - 1 ? geo.lastRowN : geo.cols
  const centring = layout === 'rows' ? 0 : ((geo.cols - rowN) * geo.cell) / 2
  let cx = PAD_X + centring + col * geo.cell + geo.cell / 2
  let cy = PAD_Y + row * geo.cell + geo.cell / 2
  if (layout === 'rows') cx += (row % 2) * geo.stagger
  if (geo.jitter > 0) {
    const a = geo.jitter
    cx += (sortCountHash(seed, i, 0) % (2 * a + 1)) - a
    cy += (sortCountHash(seed, i, 1) % (2 * a + 1)) - a
  }
  return { left: cx - geo.item / 2, top: cy - geo.item / 2 }
}

// --- pieces -----------------------------------------------------------------

/**
 * One object. `layoutId` is keyed on its pile position, so the SAME object
 * travels out of the jumble into its group instead of vanishing and reappearing.
 */
function Item({
  id,
  attribute,
  catKey,
  size,
  glyphS,
  ring,
  still,
}: {
  id: number
  attribute: SortAttribute
  catKey: string
  size: number
  glyphS: number
  ring: 'extra' | null
  still: boolean
}) {
  const fill = HUE[`${attribute}:${catKey}`] ?? BLUE
  const ringColor = ring === 'extra' ? AMBER : null
  return (
    <motion.div
      layoutId={still ? undefined : `sc-item-${id}`}
      initial={false}
      transition={still ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 28 }}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: ringColor ? `${ringColor}2E` : undefined,
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="presentation">
        {glyph(attribute, catKey, size / 2, size / 2, glyphS, fill)}
      </svg>
    </motion.div>
  )
}

/** Tiny drawn crown for the group that turns out to have the most. */
function Crown() {
  return (
    <svg viewBox="0 0 24 18" width={15} height={11} role="presentation" style={{ flexShrink: 0 }}>
      <path
        d="M2 15 L3.5 4 L9 9.5 L12 2 L15 9.5 L20.5 4 L22 15 Z"
        fill={YELLOW}
        stroke={GREEN_INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** One sorted kind: its name, its tally (once counted), and its objects. */
function GroupRow({
  view,
  ids,
  attribute,
  geo,
  crown,
  still,
}: {
  view: SortGroupView
  ids: number[]
  attribute: SortAttribute
  geo: Geometry
  crown: boolean
  still: boolean
}) {
  const hue = HUE[`${attribute}:${view.key}`] ?? BLUE
  const accent = view.state === 'win' ? GREEN : view.state === 'trap' ? ROSE : hue
  const bg = view.state === 'win' ? GREEN_SOFT : view.state === 'trap' ? ROSE_SOFT : `${hue}14`
  const ink = view.state === 'win' ? GREEN_INK : view.state === 'trap' ? ROSE : INK
  const dim = view.state === 'dim'

  return (
    <div
      className="flex w-full items-center rounded-2xl border-2"
      style={{
        background: bg,
        borderColor: accent,
        borderWidth: view.state === 'focus' || view.state === 'win' ? 2.5 : 2,
        // The tempting group is dashed, so it stays legible as "set aside" even
        // when the kind's own colour is already rose-ish (apples, red balloons).
        borderStyle: view.state === 'trap' ? 'dashed' : 'solid',
        padding: `4px ${ROW_PAD_X}px`,
        gap: LABEL_GAP,
        opacity: dim ? 0.38 : 1,
      }}
    >
      <div className="min-w-0 shrink-0" style={{ width: LABEL_W }}>
        <div
          className="flex items-center gap-1 truncate font-display text-[0.625rem] font-extrabold leading-tight"
          style={{ color: ink }}
        >
          {crown && <Crown />}
          <span className="truncate">{view.label}</span>
        </div>
        <div className="flex h-[1.125rem] items-center">
          {view.ordinal !== null ? (
            <span
              className="flex h-[1.0625rem] w-[1.0625rem] items-center justify-center rounded-full font-display text-[0.625rem] font-black tabular-nums"
              style={{ background: accent, color: SHELL }}
            >
              {view.ordinal}
            </span>
          ) : view.tally !== null ? (
            <span
              className="font-display text-[1.0625rem] font-black leading-none tabular-nums"
              style={{ color: ink }}
            >
              {view.tally}
            </span>
          ) : (
            <span className="font-display text-[1.0625rem] font-black leading-none" style={{ color: `${INK}33` }}>
              ?
            </span>
          )}
        </div>
      </div>

      <div
        className="relative flex flex-1 flex-wrap content-center items-center"
        style={{ gap: ITEM_GAP, minHeight: geo.item }}
      >
        {ids.map((id, pos) => (
          <Item
            key={id}
            id={id}
            attribute={attribute}
            catKey={view.key}
            size={geo.item}
            glyphS={geo.glyphS}
            ring={view.extraFrom !== null && pos >= view.extraFrom ? 'extra' : null}
            still={still}
          />
        ))}
        {view.extraFrom !== null && view.extraFrom > 0 && (
          <span
            className="pointer-events-none absolute"
            style={{
              left: view.extraFrom * (geo.item + ITEM_GAP) - ITEM_GAP / 2 - 1,
              top: -3,
              bottom: -3,
              borderLeft: `2px dashed ${AMBER}`,
            }}
          />
        )}
      </div>
    </div>
  )
}

// --- explainer --------------------------------------------------------------

export default function SortCountByAttributeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildSortCountSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const geo = useMemo(() => buildGeometry(story), [story])
  const still = !!reduce

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.result
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: never count a jumbled pile. Sort the objects into one group per kind, count each group, then answer. The answer is ${story.answer}.`,
    `Strategi: jangan menghitung tumpukan yang tercampur. Kelompokkan dulu benda per jenis, hitung tiap kelompok, baru jawab. Jawabannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The board: the jumbled pile, or the sorted rows it flies into. Its
            height is fixed by the taller of the two, so the panel never jumps. */}
        <div className="flex w-full items-center justify-center" style={{ minHeight: geo.boardH }}>
          {beat.grouped ? (
            <div className="flex w-full flex-col" style={{ gap: ROW_GAP }}>
              {beat.groups.map((view) => (
                <GroupRow
                  key={view.index}
                  view={view}
                  ids={story.itemsByGroup[view.index] ?? []}
                  attribute={story.attribute}
                  geo={geo}
                  crown={story.ask === 'most' && view.state === 'win'}
                  still={still}
                />
              ))}
            </div>
          ) : (
            <div className="relative" style={{ width: geo.mixedW, height: geo.mixedH }}>
              {story.pile.map((groupIndex, i) => {
                const at = pilePos(geo, story.layout, story.seed, i)
                return (
                  <div key={i} className="absolute" style={{ left: at.left, top: at.top }}>
                    <Item
                      id={i}
                      attribute={story.attribute}
                      catKey={story.categoryKeys[groupIndex]}
                      size={geo.item}
                      glyphS={geo.glyphS}
                      ring={null}
                      still={still}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chips: the tempting wrong number, and the comparison being made. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.trapLabel && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={ROSE} strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              {beat.trapLabel}
            </span>
          )}
          {beat.compareLabel && (
            <span
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{
                background: beat.result ? GREEN_SOFT : AMBER_SOFT,
                borderColor: beat.result ? GREEN : AMBER,
                color: beat.result ? GREEN_INK : AMBER,
              }}
            >
              {beat.compareLabel}
            </span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
