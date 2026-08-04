import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildComposeShapePerimeterSteps, type ComposeEdge } from './composeShapePerimeterSteps'
import { useBeatControl } from './useBeatControl'

// Post-answer animation for `compose-shape-perimeter`. It does the one thing the
// child has to be able to do afterwards: watch the pieces come together and see
// two edges vanish at every join, then count what is left facing outside.
//
// Every edge drawn here comes from the same walk of the layout the in-card
// figure and the backend answer come from (`readComposeParams`), so the
// animation can never trace a different outline from the one on the question
// card. The final number is the end of that count, not a value pasted in.

const INK = '#30598A'
const INK_SOFT = '#E1EFFB'
const PEACH = '#FFD3B1'
const MUTED = '#B9C0CC'
const GREEN = '#10B981'
const GREEN_SOFT = '#D1FAE5'
const GREEN_INK = '#065F46'
const FADE = '#F1948A'

/** Pixels per centimetre, so a nine-piece row still fits the panel. */
function scaleFor(cmWide: number, cmTall: number): number {
  return Math.max(4, Math.min(20, Math.floor(Math.min(260 / Math.max(cmWide, 1), 150 / Math.max(cmTall, 1)))))
}

export default function ComposeShapePerimeterExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props

  const story = useMemo(() => buildComposeShapePerimeterSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const view = story.view

  // One fixed frame for every beat, wide enough to hold the pieces even when the
  // "loose" beat nudges them apart, so nothing jumps as the count walks.
  const GAP = 3
  const cmWide = view.width * view.pieceW
  const cmTall = view.height * view.pieceH
  const cm = scaleFor(cmWide, cmTall)
  const pad = 8
  const spread = GAP * Math.max(view.width - 1, view.height - 1)
  const svgW = cmWide * cm + pad * 2 + spread
  const svgH = cmTall * cm + pad * 2 + spread

  // Piece-corner coordinates → pixels. `nudge` explodes the LAYOUT on the first
  // beat so a child can see the four edges each loose piece owns; edges are only
  // ever drawn on beats where the pieces sit flush, so they use the plain grid.
  const nudge = beat.loose ? GAP : 0
  const pieceX = (c: number) => pad + c * view.pieceW * cm + c * nudge
  const pieceY = (r: number) => pad + r * view.pieceH * cm + r * nudge

  const edgeLine = (e: ComposeEdge) => ({
    x1: pad + e.x1 * view.pieceW * cm,
    y1: pad + e.y1 * view.pieceH * cm,
    x2: pad + e.x2 * view.pieceW * cm,
    y2: pad + e.y2 * view.pieceH * cm,
  })

  const lit = view.outline.filter(
    (e) => (e.dir === 'h' && beat.litHorizontal) || (e.dir === 'v' && beat.litVertical),
  )

  const ariaLabel =
    lang === 'id'
      ? 'Animasi merapatkan keping-keping lalu menghitung sisi yang masih menghadap ke luar.'
      : 'Animation pushing the pieces together and counting the edges still facing outside.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width={Math.min(320, svgW * 1.5)} aria-hidden="true">
          {/* the pieces themselves */}
          {view.cells.map(([r, c]) => (
            <motion.rect
              key={`p${r}-${c}`}
              initial={false}
              animate={{ x: pieceX(c), y: pieceY(r) }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              width={view.pieceW * cm}
              height={view.pieceH * cm}
              fill={beat.shadeAll || (beat.shadePiece && r === view.cells[0][0] && c === view.cells[0][1]) ? GREEN_SOFT : beat.loose ? PEACH : INK_SOFT}
              stroke={beat.loose ? INK : MUTED}
              strokeWidth={beat.loose ? 2 : 1.25}
            />
          ))}

          {/* the edges a join buries — shown once, then gone */}
          {beat.showBuried &&
            view.internal.map((e, i) => {
              const line = edgeLine(e)
              return (
                <motion.line
                  key={`b${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  {...line}
                  stroke={FADE}
                  strokeWidth={3}
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
              )
            })}

          {/* what is left facing outside */}
          {lit.map((e, i) => {
            const line = edgeLine(e)
            return (
              <motion.line
                key={`o${e.dir}-${e.x1}-${e.y1}-${e.x2}-${e.y2}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.045 }}
                {...line}
                stroke={GREEN}
                strokeWidth={4}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

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
      </div>
    </div>
  )
}
