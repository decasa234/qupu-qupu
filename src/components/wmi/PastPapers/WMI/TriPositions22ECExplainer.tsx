import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TriangleGrid,
  buildTriangles,
  SmallTriangle,
  SVG_W,
  SVG_H,
  COLOR,
} from './TriPositions22ECIllustration'
import { buildTriPositions22ECSteps } from './triPositions22ECSteps'
import type { TriId } from './triPositions22ECSteps'

// IKMC-19-EC-Q22 — post-answer beat-driven explainer.
// Reuses TriangleGrid / SmallTriangle / buildTriangles from the illustration
// so the animation reads as the static scene coming alive.
//
// Each beat reveals one forced colour and highlights the evidence triangles
// (the neighbours that made the choice unavoidable).
//
// Beat sequence:
//   0. intro  — static scene, state the rule + budget.
//   1. r2d    — inner ▽ → BLUE (adj top=R, pos4=Y).
//   2. pos1   — pos1  → YELLOW (adj pos5=R, corner=B, no B in budget).
//   3. pos2   — pos2  → RED    (adj pos1=Y, corner=B).
//   4. pos3   — pos3  → YELLOW (adj r2d=B, pos2=R).
//   5. result — highlight pos1+pos3 in green, show answer E.

// Colour tokens (mirror illustration)
const GREEN  = COLOR.GREEN
const BLUE   = COLOR.ACCENT
const ORANGE = COLOR.ORANGE

const FIG_W = Math.min(300, SVG_W)

// Static pre-placed fills (same as illustration)
const PLACED_FILLS: Record<string, string> = {
  top:  COLOR.RED,
  r2l:  COLOR.YELLOW,
  r3fl: COLOR.BLUE,
  r3dl: COLOR.RED,
  r3fr: COLOR.BLUE,
}

// ── Highlight ring overlay ────────────────────────────────────────────────────
// Renders a stroke-only polygon around the highlighted triangle.
function HighlightRing({ id, color }: { id: string; color: string }) {
  const tris = buildTriangles({})
  const tri = tris.find(t => t.id === id)
  if (!tri) return null
  return (
    <polygon
      points={tri.pts.map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinejoin="round"
      opacity={0.9}
    />
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function TriPositions22ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTriPositions22ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map(s => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  // Accumulate fills: start from the static placed fills, then add each beat's newFills
  const [accFills] = useState(() => ({ ...PLACED_FILLS }))
  // Track which fills have been applied up to current beat
  const activeFills = useMemo(() => {
    const f: Record<string, string> = { ...PLACED_FILLS }
    for (let i = 1; i <= index; i++) {
      const b = story.steps[i]
      if (b) Object.assign(f, b.newFills)
    }
    return f
  }, [index, story.steps])
  // Silence "accFills used" lint warning
  void accFills

  const isResult  = beat.result
  const ringColor = isResult ? GREEN : ORANGE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: segitiga dalam ▽ dipaksa biru; posisi 1 dipaksa kuning; posisi 2 merah; posisi 3 kuning — jawaban E: 1 dan 3 kuning.'
      : 'Explainer: inner ▽ forced blue; position 1 forced yellow; position 2 red; position 3 yellow — answer E: 1 and 3 are yellow.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* base grid with accumulated fills */}
          <TriangleGrid fills={activeFills} />

          {/* highlight rings (evidence neighbours) */}
          <AnimatePresence>
            {beat.highlight.map((id: TriId) => (
              <motion.g
                key={`ring-${id}-${beat.phase}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                <HighlightRing id={id} color={ringColor} />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* on result beat, show answer triangles in bright green tint */}
          <AnimatePresence>
            {isResult && (() => {
              const tris = buildTriangles({ r3c: COLOR.YELLOW, r2r: COLOR.YELLOW })
              const answerIds = ['r3c', 'r2r']
              return answerIds.map(id => {
                const tri = tris.find(t => t.id === id)
                if (!tri) return null
                return (
                  <motion.g
                    key={`result-${id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SmallTriangle tri={{ ...tri, fill: '#FDE68A' /* bright yellow tint */ }} />
                    <HighlightRing id={id} color={GREEN} />
                  </motion.g>
                )
              })
            })()}
          </AnimatePresence>
        </svg>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
