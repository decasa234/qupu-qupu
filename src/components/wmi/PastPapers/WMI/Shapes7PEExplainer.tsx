import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Shapes7PEPanel, FIGURES } from './Shapes7PEIllustration'
import type { FigureLabel } from './Shapes7PEIllustration'
import { buildShapes7PESteps } from './shapes7PESteps'

// IKMC-20-PE-Q7 — post-answer explainer.
// Reuses Shapes7PEPanel from the illustration so the animation looks like the
// scene coming alive.
//
// Animation strategy (adapted from CircleRect22G1Explainer):
//   Beat 0 — state both conditions (show all 5 panels, no highlight).
//   Per option A→E:
//     - Count black triangles (amber highlight on triangles).
//     - If triangles ≠ 3: fail verdict, move on.
//     - If triangles = 3: count squares (blue highlight), then verdict.
//   Final beat — E is the winner (green panel, green caption).

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const RED_INK = '#991B1B'
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'
const MUTED_INK = '#94A3B8'
const MUTED_BG = '#F1F5F9'
const TRI_INK = '#B45309'
const TRI_BG = '#FEF3C7'
const SQ_INK = '#1D6FB8'
const SQ_BG = '#DBEAFE'

function CountChip({
  glyph,
  label,
  count,
  show,
  ink,
  bg,
}: {
  glyph: string
  label: string
  count: number
  show: boolean
  ink: string
  bg: string
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
      style={{
        background: show ? bg : MUTED_BG,
        color: show ? ink : MUTED_INK,
        borderColor: show ? ink : '#CBD5E1',
      }}
    >
      <span aria-hidden="true">{glyph}</span>
      <span>{label}</span>
      <span className="tabular-nums">{show ? count : '?'}</span>
    </div>
  )
}

const ORDER: FigureLabel[] = ['A', 'B', 'C', 'D', 'E']

export default function Shapes7PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapes7PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const shownLabel = (beat.label ?? 'A') as FigureLabel
  const fig = FIGURES[shownLabel]
  const isIntro = beat.label === undefined
  const verdictPass = beat.verdict === 'pass'
  const verdictFail = beat.verdict === 'fail'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: gambar yang benar harus memiliki tepat 3 segitiga hitam dan kurang dari 4 persegi. Hanya gambar E yang memenuhi kedua syarat (3 segitiga hitam, 2 persegi) — jawabannya E.`
      : `Explainer: the correct picture must have exactly 3 black triangles and fewer than 4 squares. Only picture E satisfies both conditions (3 black triangles, 2 squares) — the answer is E.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Intro: show all 5 panels; active beat: show focused panel only. */}
        {isIntro ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {ORDER.slice(0, 3).map((lbl) => (
                <Shapes7PEPanel key={lbl} label={lbl} />
              ))}
            </div>
            <div className="flex gap-2">
              {ORDER.slice(3).map((lbl) => (
                <Shapes7PEPanel key={lbl} label={lbl} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Label badge */}
            <motion.div
              key={`label-${shownLabel}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 font-display text-lg font-black"
              style={
                beat.result
                  ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                  : { background: BLUE_BG, color: BLUE_INK, borderColor: BLUE_INK }
              }
            >
              {shownLabel}
            </motion.div>

            {/* The focused sub-figure panel */}
            <motion.div
              key={`fig-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                borderRadius: 12,
                border: `2px solid ${beat.result ? GREEN : '#E2E8F0'}`,
                display: 'inline-block',
              }}
            >
              <Shapes7PEPanel
                label={shownLabel}
                highlight={beat.highlight}
              />
            </motion.div>
          </div>
        )}

        {/* Count chips: triangles + squares */}
        {!isIntro && (
          <div className="flex items-center gap-2">
            <CountChip
              glyph="▲"
              label={story.triLabel}
              count={fig.blackTriangles}
              show={beat.showTri}
              ink={TRI_INK}
              bg={TRI_BG}
            />
            <CountChip
              glyph="□"
              label={story.sqLabel}
              count={fig.squares}
              show={beat.showSq}
              ink={SQ_INK}
              bg={SQ_BG}
            />
            {(verdictPass || verdictFail) && (
              <motion.div
                key={`verdict-${index}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-sm font-black"
                style={
                  verdictPass
                    ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                    : { background: RED_BG, color: RED_INK, borderColor: RED }
                }
                aria-hidden="true"
              >
                {verdictPass ? '✓' : '✗'}
              </motion.div>
            )}
          </div>
        )}

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
