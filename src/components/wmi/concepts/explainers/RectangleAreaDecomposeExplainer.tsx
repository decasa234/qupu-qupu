import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildRectangleAreaDecomposeSteps, NAMES, partName } from './rectangleAreaDecomposeSteps'
import {
  RectPartition,
  rectPartitionLayout,
  type RectPartitionEdgeLabel,
  type RectPartitionPiece,
} from '../../PastPapers/WMI/primitives/RectPartition'
import { useBeatControl } from './useBeatControl'

// Post-answer animation for `rectangle-area-decompose`. It does the one thing a
// child has to be able to do afterwards: watch the rails fill in, one part at a
// time, and see WHY each length was knowable at the moment it landed — a printed
// area divided by a side already won, or a printed edge with only one part left.
//
// Every piece and every rail here is drawn by `RectPartition`, the same
// primitive the in-card figure uses, so the animation can never draw a different
// jigsaw from the one on the question card. The chain comes from
// `buildRectangleAreaDecomposeSteps`, a faithful replay of the backend solver,
// so it can never narrate a different route from the written hints.
//
// The asked value appears on the last beat only. Before that the target holds a
// "?", and the `aria-label` speaks the METHOD, never the number.

const INK = '#30598A'
const INK_SOFT = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_SOFT = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER = '#D97706'

/** A whole column / row band, so a landing length is visible across every piece the cut reaches. */
function band(
  axis: 'w' | 'h',
  index: number,
  lay: ReturnType<typeof rectPartitionLayout>,
): { x: number; y: number; width: number; height: number } {
  if (axis === 'w') {
    const x = lay.originX + (lay.xs[index] ?? 0)
    return { x, y: lay.originY, width: (lay.xs[index + 1] ?? 0) - (lay.xs[index] ?? 0), height: lay.boardH }
  }
  const y = lay.originY + (lay.ys[index] ?? 0)
  return { x: lay.originX, y, width: lay.boardW, height: (lay.ys[index + 1] ?? 0) - (lay.ys[index] ?? 0) }
}

export default function RectangleAreaDecomposeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  // Reduced motion keeps every beat's evidence — the bands just arrive instead
  // of fading in. `useBeatControl` already skips a play-through to the finale.
  const still = !!useReducedMotion()

  const story = useMemo(() => buildRectangleAreaDecomposeSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const view = story.view
  const t = view.pieces[view.target]

  // ── pieces: printed areas stay put; the target holds its "?" until the end ──
  const pieceArea = (i: number): number => {
    const q = view.pieces[i]
    let w = 0
    for (let c = q.c0; c <= q.c1; c++) w += view.widths[c]
    let h = 0
    for (let r = q.r0; r <= q.r1; r++) h += view.heights[r]
    return w * h
  }

  const pieces: RectPartitionPiece[] = view.pieces.map((q, i) => {
    const isTarget = i === view.target
    const askedArea = view.ask === 'area' && isTarget
    return {
      ...q,
      label: NAMES[i],
      sub: askedArea
        ? beat.reveal
          ? `${view.answerValue} cm²`
          : '?'
        : view.areaShown[i]
          ? `${pieceArea(i)} cm²`
          : undefined,
      subTone: askedArea ? (beat.reveal ? 'green' : 'rose') : 'ink',
      highlight: isTarget
        ? beat.reveal
          ? 'green'
          : 'amber'
        : i === beat.spendPiece
          ? 'blue'
          : 'none',
    }
  })

  // ── rails: printed lengths in ink, lengths the chain has won in green ──
  const printedSingle = (axis: 'w' | 'h', i: number): boolean =>
    view.sideLabels.some((l) => l.axis === axis && l.from === i && l.to === i)

  const askedW = view.ask === 'side' && view.targetSide === 'width' ? { from: t.c0, to: t.c1 } : null
  const askedH = view.ask === 'side' && view.targetSide === 'height' ? { from: t.r0, to: t.r1 } : null

  const topLabels: RectPartitionEdgeLabel[] = []
  const leftLabels: RectPartitionEdgeLabel[] = []
  const bottomLabels: RectPartitionEdgeLabel[] = []
  const rightLabels: RectPartitionEdgeLabel[] = []

  const rail = (axis: 'w' | 'h'): void => {
    const count = axis === 'w' ? view.cols : view.rows
    const known = axis === 'w' ? beat.knownW : beat.knownH
    const spent = axis === 'w' ? beat.spentW : beat.spentH
    const single = axis === 'w' ? topLabels : leftLabels
    const asked = axis === 'w' ? askedW : askedH
    for (let i = 0; i < count; i++) {
      // The single asked part shows "?" right up to the beat that wins it.
      if (asked && asked.from === asked.to && asked.from === i && !beat.reveal) {
        single.push({ from: i, to: i, text: '?', tone: 'rose' })
        continue
      }
      const at = known[i]
      if (at === null || at === undefined) continue
      const printed = printedSingle(axis, i)
      single.push({
        from: i,
        to: i,
        text: `${at} cm`,
        tone: printed ? (spent.includes(i) ? 'amber' : 'ink') : 'green',
      })
    }
  }
  rail('w')
  rail('h')

  for (const l of view.sideLabels) {
    if (l.from === l.to) continue
    const track = l.axis === 'w' ? view.widths : view.heights
    let total = 0
    for (let i = l.from; i <= l.to; i++) total += track[i]
    const hot =
      beat.spendSpan !== null &&
      beat.spendSpan.axis === l.axis &&
      beat.spendSpan.from === l.from &&
      beat.spendSpan.to === l.to
    const label: RectPartitionEdgeLabel = { from: l.from, to: l.to, text: `${total} cm`, tone: hot ? 'amber' : 'ink' }
    ;(l.axis === 'w' ? bottomLabels : rightLabels).push(label)
  }
  // A multi-part asked side lives on the far rail, as "?" until the finale.
  if (askedW && askedW.from !== askedW.to) {
    bottomLabels.push({ ...askedW, text: beat.reveal ? `${view.answerValue} cm` : '?', tone: beat.reveal ? 'green' : 'rose' })
  }
  if (askedH && askedH.from !== askedH.to) {
    rightLabels.push({ ...askedH, text: beat.reveal ? `${view.answerValue} cm` : '?', tone: beat.reveal ? 'green' : 'rose' })
  }

  // Rails are forced on for every beat so the figure never reflows mid-chain;
  // the layout below is asked for with the very same flags the component uses.
  const UNIT = 56
  const bottomRail = bottomLabels.length > 0
  const rightRail = rightLabels.length > 0
  const lay = rectPartitionLayout(view.widths, view.heights, {
    unit: UNIT,
    topRail: true,
    leftRail: true,
    bottomRail,
    rightRail,
  })

  const spentBands = [
    ...beat.spentW.map((i) => ({ key: `sw${i}`, ...band('w', i, lay) })),
    ...beat.spentH.map((i) => ({ key: `sh${i}`, ...band('h', i, lay) })),
  ]
  const won = beat.recovered ? band(beat.recovered.axis, beat.recovered.index, lay) : null

  const ariaLabel =
    lang === 'id'
      ? 'Animasi mengejar sisi yang dipakai bersama antar potongan: tiap langkah membuka satu bagian tepi dari luas yang tercetak atau dari panjang tepi yang tercetak.'
      : 'Animation chasing the sides the pieces share: each move unlocks one part of an edge, either from a printed area or from a printed edge length.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RectPartition
          colWidths={view.widths}
          rowHeights={view.heights}
          pieces={pieces}
          topLabels={topLabels}
          bottomLabels={bottomLabels}
          leftLabels={leftLabels}
          rightLabels={rightLabels}
          showTopRail
          showLeftRail
          unit={UNIT}
          width={Math.min(340, lay.width)}
        >
          {/* the already-known parts this move leans on */}
          {spentBands.map((b) => (
            <motion.rect
              key={b.key}
              initial={still ? { opacity: 0.16 } : { opacity: 0 }}
              animate={{ opacity: 0.16 }}
              transition={still ? { duration: 0 } : { duration: 0.35 }}
              x={b.x}
              y={b.y}
              width={b.width}
              height={b.height}
              fill={AMBER}
            />
          ))}
          {/* the part this move wins — a cut is shared, so it lights the whole band */}
          {won && (
            <motion.rect
              key={`won-${index}`}
              initial={still ? { opacity: 0.24 } : { opacity: 0 }}
              animate={{ opacity: 0.24 }}
              transition={still ? { duration: 0 } : { duration: 0.45, delay: 0.15 }}
              x={won.x}
              y={won.y}
              width={won.width}
              height={won.height}
              fill={GREEN}
            />
          )}
        </RectPartition>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : { background: INK_SOFT, borderColor: INK, color: INK }
          }
        >
          {beat.caption}
        </div>

        {/* Which part of which rail the move just handed over, in the same words
            the written hints use. */}
        {beat.recovered && !beat.result && (
          <div className="text-center text-xs font-bold" style={{ color: GREEN_INK }}>
            {lang === 'id' ? 'Terbuka: ' : 'Unlocked: '}
            {partName(
              beat.recovered.axis,
              beat.recovered.index,
              beat.recovered.axis === 'w' ? view.cols : view.rows,
              lang,
            )}
          </div>
        )}
      </div>
    </div>
  )
}
