import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildBalanceSubstitutionSteps,
  chunkItems,
  shapeWord,
  type BalanceItem,
  type BalancePan,
  type BalanceShape,
  type BalanceStoryboard,
} from './balanceSubstitutionSteps'
import { useBeatControl } from './useBeatControl'

// L10 `balance-substitution` — the two scales from the question figure, alive.
// Geometry, glyphs and palette are lifted from the static illustration
// (src/components/wmi/concepts/balance-substitution/index.tsx) so a shape keeps
// its identity from the question card into the explanation: chrome is painted
// first, items rest ON a flat plate, and nothing can ever cover a countable.

// ── palette (same literals as the figure) ─────────────────────────────────
const BLUE = '#30598A'
const ORANGE = '#F0853A' // shape A
const GREEN = '#58A700' // shape B
const CUBE_FRONT = '#E0A000'
const CUBE_TOP = '#F2BE45'
const CUBE_SIDE = '#B27C00'
const CREAM = '#FAF6EF'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const BLUE_SOFT = '#E1EFFB'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const MUTED = '#8B94A3'

// ── scale geometry (one cell, identical to the figure) ────────────────────
const BOARD_W = 300
const BOARD_H = 176
const PIVOT_X = 150
const BEAM_Y = 44
const BEAM_HALF = 92
const BEAM_W = 7
const SPLAY_Y = BEAM_Y + 18 // the hanger has finished splaying out and runs straight down
// The explainer stacks more on a pan than the question figure ever does (a
// swapped-out shape can become six cubes), so the pans hang lower than in the
// figure — the wires are longer, nothing else changes.
const TRAY_Y = BEAM_Y + 78
const PAN_HW = 54
const WIRE_HS = 50
const TRAY_TH = 5
const BOWL_DEPTH = 15
const POST_BOTTOM = TRAY_Y + 36
const LEFT_X = PIVOT_X - BEAM_HALF
const RIGHT_X = PIVOT_X + BEAM_HALF

// The strip items may occupy: between the VERTICAL parts of the hanger wires and
// the plate, so a tall stack can never run into a slanted wire or the beam.
// Everything is fitted into it; nothing ever spills out of it.
const ITEM_W = 96
const ITEM_H = TRAY_Y - SPLAY_Y - 4

// ── item sizing (before the storyboard-wide fit factor) ───────────────────
const SHAPE = 24
const CUBE = 15
const SHAPE_GAP = 5
const CUBE_GAP = 4
const BLOCK_GAP = 8
const HALO_PAD = 2
const HALO_BORDER = 1.5
const HALO_GAP = 7
const STAR_SIN54 = Math.sin((54 * Math.PI) / 180)

// ── pure layout maths (shared by the measure pass and the render) ─────────

/** Split `n` items into as-even-as-possible rows of at most `maxPerRow`. */
function balancedRows(n: number, maxPerRow: number): number[] {
  if (n <= 0) return []
  const rows = Math.max(1, Math.ceil(n / maxPerRow))
  const perRow = Math.ceil(n / rows)
  const out: number[] = []
  let rest = n
  while (rest > 0) {
    const take = Math.min(perRow, rest)
    out.push(take)
    rest -= take
  }
  return out
}

function blockBox(rows: number[], size: number, gap: number): { w: number; h: number } {
  if (rows.length === 0) return { w: 0, h: 0 }
  const widest = rows.reduce((m, r) => Math.max(m, r), 0)
  return {
    w: widest * size + (widest - 1) * gap,
    h: rows.length * size + (rows.length - 1) * gap,
  }
}

interface GroupPlan {
  shapeRows: number[]
  cubeRows: number[]
  w: number
  h: number
}

/**
 * How one cluster on a pan lays out: a row-wrapped shape block beside a cube
 * block. Rows are capped at three — a taller stack would run into the beam, and
 * because the fit factor is shared by every beat, one tall pan would shrink the
 * countables on all the others.
 */
function planGroup(shapes: number, cubes: number, multi: boolean): GroupPlan {
  const shapeRows = balancedRows(shapes, multi ? 2 : Math.max(4, Math.ceil(shapes / 2)))
  const cubeRows = balancedRows(
    cubes,
    multi ? 2 : shapes > 0 ? Math.min(4, Math.max(2, Math.ceil(cubes / 2))) : 4,
  )
  const s = blockBox(shapeRows, SHAPE, SHAPE_GAP)
  const c = blockBox(cubeRows, CUBE, CUBE_GAP)
  return {
    shapeRows,
    cubeRows,
    w: s.w + c.w + (s.w > 0 && c.w > 0 ? BLOCK_GAP : 0),
    h: Math.max(s.h, c.h),
  }
}

function planPan(pan: BalancePan): { groups: Array<{ items: BalanceItem[]; plan: GroupPlan }>; w: number; h: number } {
  const clusters = chunkItems(pan.items, pan.groups)
  const multi = clusters.length > 1
  const halo = multi ? 2 * (HALO_PAD + HALO_BORDER) : 0
  let w = 0
  let h = 0
  const groups = clusters.map((items, i) => {
    const shapes = items.reduce((n, it) => n + (it.kind === 'shape' ? 1 : 0), 0)
    const plan = planGroup(shapes, items.length - shapes, multi)
    w += plan.w + halo + (i > 0 ? HALO_GAP : 0)
    h = Math.max(h, plan.h + halo)
    return { items, plan }
  })
  return { groups, w, h }
}

/**
 * One fit factor for the WHOLE storyboard, so every beat lays the pans out at
 * the same scale — items then glide between beats instead of resizing, and a
 * crowded pan can never spill past the hanger wires or into the beam.
 */
export function fitFactor(story: BalanceStoryboard): number {
  let fit = 1
  for (const beat of story.steps) {
    for (const pan of [beat.board.left, beat.board.right]) {
      const { w, h } = planPan(pan)
      if (w > 0) fit = Math.min(fit, ITEM_W / w)
      if (h > 0) fit = Math.min(fit, ITEM_H / h)
    }
  }
  return Math.max(0.4, Math.min(1, fit))
}

// ── glyphs (same drawings as the figure) ──────────────────────────────────

function starPoints(r: number, cx: number, cy: number): string {
  const inner = r * 0.44
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + rad * Math.cos(angle)).toFixed(2)},${(cy + rad * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** One shape glyph, drawn in a 26-wide box whose bottom edge is the pan surface. */
function ShapeGlyph({ kind, fill, size }: { kind: BalanceShape; fill: string; size: number }) {
  const s = 26
  const half = s / 2
  const common = { fill, stroke: BLUE, strokeWidth: 1.5, strokeLinejoin: 'round' as const }
  let node: ReactNode
  if (kind === 'circle') node = <circle cx={0} cy={-half} r={half} {...common} />
  else if (kind === 'square') node = <rect x={-half} y={-s} width={s} height={s} rx={3} {...common} />
  else if (kind === 'triangle') node = <polygon points={`0,${-s} ${-half},0 ${half},0`} {...common} />
  else node = <polygon points={starPoints(half, 0, -half * STAR_SIN54)} {...common} />
  return (
    <svg viewBox={`${-half} ${-s} ${s} ${s}`} width={size} height={size} role="presentation" style={{ display: 'block' }}>
      {node}
    </svg>
  )
}

/** One unit cube, same three-face drawing as the figure. */
function CubeGlyph({ size }: { size: number }) {
  const s = 16
  const d = s * 0.28
  const fw = s - d
  const x0 = -s / 2
  const topY = -fw
  return (
    <svg viewBox={`${x0} ${-s} ${s} ${s}`} width={size} height={size} role="presentation" style={{ display: 'block' }}>
      <g stroke={BLUE} strokeWidth={1.2} strokeLinejoin="round">
        <rect x={x0} y={topY} width={fw} height={fw} fill={CUBE_FRONT} />
        <polygon
          points={`${x0},${topY} ${x0 + d},${topY - d} ${x0 + d + fw},${topY - d} ${x0 + fw},${topY}`}
          fill={CUBE_TOP}
        />
        <polygon points={`${x0 + fw},${topY} ${x0 + fw + d},${topY - d} ${x0 + fw + d},${-d} ${x0 + fw},0`} fill={CUBE_SIDE} />
      </g>
    </svg>
  )
}

/** A countable on a pan (or in the swap tray). Keeps its identity across beats. */
function Token({ item, u, still }: { item: BalanceItem; u: number; still: boolean }) {
  const size = item.kind === 'cube' ? CUBE * u : SHAPE * u
  return (
    <motion.div
      layoutId={still ? undefined : `bs-${item.id}`}
      initial={still ? false : { opacity: 0, scale: 0.35, y: -14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={still ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        filter: item.fresh ? 'drop-shadow(0 0 3px rgba(48,89,138,0.85))' : undefined,
      }}
    >
      {item.kind === 'cube' ? (
        <CubeGlyph size={size} />
      ) : (
        <ShapeGlyph kind={item.shape ?? 'circle'} fill={item.role === 'B' ? GREEN : ORANGE} size={size} />
      )}
    </motion.div>
  )
}

/** A row-wrapped block of same-kind tokens; the first row sits ON the plate. */
function Block({ items, rows, gap, u, still }: { items: BalanceItem[]; rows: number[]; gap: number; u: number; still: boolean }) {
  if (items.length === 0) return null
  const lines: BalanceItem[][] = []
  let cursor = 0
  for (const take of rows) {
    lines.push(items.slice(cursor, cursor + take))
    cursor += take
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: gap * u }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: gap * u }}>
          {line.map((it) => (
            <Token key={it.id} item={it} u={u} still={still} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Everything resting on one plate, in its clusters. */
function PanContents({ pan, u, still }: { pan: BalancePan; u: number; still: boolean }) {
  const { groups } = planPan(pan)
  const multi = groups.length > 1
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: HALO_GAP * u }}>
      {groups.map((group, gi) => {
        const shapes = group.items.filter((it) => it.kind === 'shape')
        const cubes = group.items.filter((it) => it.kind === 'cube')
        return (
          <div
            key={gi}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: BLOCK_GAP * u,
              padding: multi ? HALO_PAD * u : 0,
              border: multi ? `${HALO_BORDER * u}px dashed ${BLUE}` : undefined,
              borderRadius: 8 * u,
            }}
          >
            <Block items={shapes} rows={group.plan.shapeRows} gap={SHAPE_GAP} u={u} still={still} />
            <Block items={cubes} rows={group.plan.cubeRows} gap={CUBE_GAP} u={u} still={still} />
          </div>
        )
      })}
    </div>
  )
}

/** A hanger wire: splays out from the beam high up, then drops vertically. */
function hangerPath(bx: number, dir: 1 | -1): string {
  const x = bx + dir * WIRE_HS
  return `M ${bx} ${BEAM_Y} C ${bx} ${BEAM_Y + 10}, ${x} ${BEAM_Y + 8}, ${x} ${SPLAY_Y} L ${x} ${TRAY_Y}`
}

/** The scale itself: level beam, stand, two hanging plates. Painted before items. */
function Chrome({ index, litLeft, litRight }: { index: number | null; litLeft: boolean; litRight: boolean }) {
  const wire = { fill: 'none', stroke: BLUE, strokeWidth: 1.6, strokeLinecap: 'round' as const }
  const plate = (bx: number, lit: boolean) => (
    <g key={bx}>
      <path d={hangerPath(bx, -1)} {...wire} />
      <path d={hangerPath(bx, 1)} {...wire} />
      <path
        d={`M ${bx - PAN_HW + 6} ${TRAY_Y + TRAY_TH} Q ${bx} ${TRAY_Y + TRAY_TH + BOWL_DEPTH} ${bx + PAN_HW - 6} ${TRAY_Y + TRAY_TH}`}
        fill={CREAM}
        stroke={lit ? GREEN : BLUE}
        strokeWidth={lit ? 3 : 2.5}
        strokeLinejoin="round"
      />
      <rect
        x={bx - PAN_HW}
        y={TRAY_Y}
        width={PAN_HW * 2}
        height={TRAY_TH}
        rx={TRAY_TH / 2}
        fill={lit ? GREEN_SOFT : CREAM}
        stroke={lit ? GREEN : BLUE}
        strokeWidth={lit ? 2.6 : 2}
      />
    </g>
  )
  return (
    <svg
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      width={BOARD_W}
      height={BOARD_H}
      role="presentation"
      style={{ position: 'absolute', inset: 0 }}
    >
      {index != null && (
        <>
          <circle cx={20} cy={20} r={13} fill={BLUE} />
          <text x={20} y={20} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={CREAM}>
            {index}
          </text>
        </>
      )}
      <line
        x1={LEFT_X}
        y1={BEAM_Y}
        x2={RIGHT_X}
        y2={BEAM_Y}
        stroke={BLUE}
        strokeWidth={BEAM_W}
        strokeLinecap="round"
      />
      <rect x={PIVOT_X - 4} y={BEAM_Y} width={8} height={POST_BOTTOM - BEAM_Y} rx={3} fill={BLUE} />
      <rect x={PIVOT_X - 38} y={POST_BOTTOM} width={76} height={10} rx={5} fill={BLUE} />
      <circle cx={PIVOT_X} cy={BEAM_Y} r={7} fill={CREAM} stroke={BLUE} strokeWidth={2.5} />
      {plate(LEFT_X, litLeft)}
      {plate(RIGHT_X, litRight)}
    </svg>
  )
}

/** A chip in the ledger: one equivalence the child has already earned. */
function FactChip({ shape, role, cubes, fresh, u }: { shape: BalanceShape; role: 'A' | 'B'; cubes: number; fresh: boolean; u: number }) {
  return (
    <motion.span
      initial={fresh ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="inline-flex items-center gap-1 rounded-full border-2 px-2 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
      style={{ background: fresh ? GREEN_SOFT : '#FFFFFF', borderColor: fresh ? GREEN : PEACH, color: fresh ? GREEN_INK : BLUE }}
    >
      1
      <ShapeGlyph kind={shape} fill={role === 'B' ? GREEN : ORANGE} size={13 * u + 4} />
      {`= ${cubes}`}
      <CubeGlyph size={11 * u + 3} />
    </motion.span>
  )
}

export default function BalanceSubstitutionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildBalanceSubstitutionSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const u = useMemo(() => fitFactor(story), [story])

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const still = !!reduce
  const spot = beat.board.spotlight
  const litLeft = spot === 'left' || spot === 'both'
  const litRight = spot === 'right' || spot === 'both'

  const captionStyle = beat.result
    ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: a level scale means both sides weigh the same, so a shape may be swapped for the cubes that balance it. Swapping keeps the beam level, and after swapping, ${shapeWord(story.shapeA, 1, 'en')} and ${shapeWord(story.shapeB, 1, 'en')} can be compared directly.`,
    `Strategi: timbangan yang seimbang berarti kedua sisi sama berat, jadi sebuah bentuk boleh ditukar dengan kubus yang seimbang dengannya. Menukar tidak membuat timbangan miring, dan setelah ditukar, ${shapeWord(story.shapeA, 1, 'id')} dan ${shapeWord(story.shapeB, 1, 'id')} bisa dibandingkan langsung.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2 rounded-2xl border-2 px-2 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* which scale we are on + every equivalence earned so far */}
        <div className="flex min-h-[1.5rem] w-full flex-wrap items-center justify-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{ background: BLUE, color: CREAM }}
          >
            {beat.board.title}
          </span>
          {beat.facts.map((fact) => (
            <FactChip key={fact.role} shape={fact.shape} role={fact.role} cubes={fact.cubes} fresh={fact.fresh} u={u} />
          ))}
        </div>

        {/* the scale — chrome first, then the countables resting on the plates */}
        <div style={{ position: 'relative', width: BOARD_W, height: BOARD_H, maxWidth: '100%' }}>
          <Chrome index={beat.board.index} litLeft={litLeft} litRight={litRight} />
          {([['left', LEFT_X], ['right', RIGHT_X]] as const).map(([side, bx]) => (
            <div
              key={side}
              style={{
                position: 'absolute',
                left: bx - ITEM_W / 2,
                top: TRAY_Y - ITEM_H,
                width: ITEM_W,
                height: ITEM_H,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <PanContents pan={side === 'left' ? beat.board.left : beat.board.right} u={u} still={still} />
            </div>
          ))}
        </div>

        {/* the swap tray: what just left a pan, and what it was worth */}
        <div className="flex min-h-[2rem] w-full items-end justify-center gap-1.5">
          {beat.traded.length > 0 && (
            <>
              <span
                className="mb-[0.125rem] rounded-full border-2 px-2 py-[0.0625rem] font-display text-[0.625rem] font-extrabold"
                style={{ background: '#FFFFFF', borderColor: PEACH, color: MUTED }}
              >
                {T('Swapped', 'Ditukar')}
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {beat.traded.map((it) => (
                  <Token key={it.id} item={{ ...it, fresh: false }} u={u * 0.72} still={still} />
                ))}
              </div>
              {beat.tradedNote && (
                <span
                  className="mb-[0.125rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
                  style={{ color: BLUE }}
                >
                  {beat.tradedNote}
                </span>
              )}
            </>
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
