import { useMemo } from 'react'
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
import {
  BALANCE_INK,
  CUBE_BOX,
  PanChrome,
  SCALE_GEOM,
  SHAPE_BOX,
  ScaleFrame,
  cubeGlyph,
  roleFill,
  scaleFrame,
  shapeGlyph,
} from '../balance-substitution'
import { useBeatControl } from './useBeatControl'

// L10 `balance-substitution` — the two scales from the question figure, alive.
// Geometry, glyphs and palette are IMPORTED from the static illustration
// (src/components/wmi/concepts/balance-substitution/index.tsx) rather than
// copied, so a shape keeps its identity from the question card into the
// explanation and can never drift when the figure is redrawn: chrome is painted
// first, items rest ON a flat plate, and nothing can ever cover a countable.

// ── explainer-only inks (the figure never lights a pan up) ────────────────
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const BLUE_SOFT = '#E1EFFB'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const MUTED = '#8B94A3'

// ── scale geometry ────────────────────────────────────────────────────────
// The explainer stacks more on a pan than the question figure ever does (a
// swapped-out shape can become six cubes), so the pans hang lower than in the
// figure — the wires are longer, nothing else changes.
const TRAY_Y = SCALE_GEOM.beamY + 78
const BOARD_H = scaleFrame(TRAY_Y).height
const { width: BOARD_W, leftX: LEFT_X, rightX: RIGHT_X } = SCALE_GEOM

// The strip items may occupy: between the VERTICAL parts of the hanger wires and
// the plate, so a tall stack can never run into a slanted wire or the beam.
// Everything is fitted into it; nothing ever spills out of it.
const ITEM_W = 96
const ITEM_H = TRAY_Y - SCALE_GEOM.splayY - 4

// ── item sizing (before the storyboard-wide fit factor) ───────────────────
const SHAPE = 24
const CUBE = 15
const SHAPE_GAP = 5
const CUBE_GAP = 4
const BLOCK_GAP = 8
const HALO_PAD = 2
const HALO_BORDER = 1.5
const HALO_GAP = 7

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

// ── glyphs (the figure's own drawings, wrapped in a sized box) ────────────

/** One shape glyph, drawn in the figure's box whose bottom edge is the pan surface. */
function ShapeGlyph({ kind, fill, size }: { kind: BalanceShape; fill: string; size: number }) {
  const half = SHAPE_BOX / 2
  return (
    <svg
      viewBox={`${-half} ${-SHAPE_BOX} ${SHAPE_BOX} ${SHAPE_BOX}`}
      width={size}
      height={size}
      role="presentation"
      style={{ display: 'block' }}
    >
      {shapeGlyph(kind, fill)}
    </svg>
  )
}

/** One unit cube, the figure's own three-face drawing. */
function CubeGlyph({ size }: { size: number }) {
  const x0 = -CUBE_BOX / 2
  return (
    <svg
      viewBox={`${x0} ${-CUBE_BOX} ${CUBE_BOX} ${CUBE_BOX}`}
      width={size}
      height={size}
      role="presentation"
      style={{ display: 'block' }}
    >
      {cubeGlyph()}
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
        <ShapeGlyph kind={item.shape ?? 'circle'} fill={roleFill(item.role)} size={size} />
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
              border: multi ? `${HALO_BORDER * u}px dashed ${BALANCE_INK.frame}` : undefined,
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

/** The scale itself: level beam, stand, two hanging plates. Painted before items. */
function Chrome({ index, litLeft, litRight }: { index: number | null; litLeft: boolean; litRight: boolean }) {
  const lit = { stroke: BALANCE_INK.shapeB, plateFill: GREEN_SOFT, bold: true }
  return (
    <svg
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      width={BOARD_W}
      height={BOARD_H}
      role="presentation"
      style={{ position: 'absolute', inset: 0 }}
    >
      <ScaleFrame trayY={TRAY_Y} index={index} />
      <PanChrome bx={LEFT_X} trayY={TRAY_Y} style={litLeft ? lit : undefined} />
      <PanChrome bx={RIGHT_X} trayY={TRAY_Y} style={litRight ? lit : undefined} />
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
      style={{
        background: fresh ? GREEN_SOFT : '#FFFFFF',
        borderColor: fresh ? BALANCE_INK.shapeB : PEACH,
        color: fresh ? GREEN_INK : BALANCE_INK.frame,
      }}
    >
      1
      <ShapeGlyph kind={shape} fill={roleFill(role)} size={13 * u + 4} />
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
    ? { background: GREEN_SOFT, borderColor: BALANCE_INK.shapeB, color: GREEN_INK }
    : { background: BLUE_SOFT, borderColor: BALANCE_INK.frame, color: BALANCE_INK.frame }

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
            style={{ background: BALANCE_INK.frame, color: BALANCE_INK.cream }}
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
                  style={{ color: BALANCE_INK.frame }}
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
