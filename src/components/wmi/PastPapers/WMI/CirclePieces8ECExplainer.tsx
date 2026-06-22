import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CirclePieces8ECStem, CirclePieces8ECOption } from './CirclePieces8ECIllustration'
import { buildCirclePieces8ECSteps } from './circlePieces8ECSteps'

// IKMC-23-EC-Q8 — post-answer animation.
// "Danny glued 2 pieces of paper on top of a black circle. What result can he NOT obtain?"
// Answer: E.
//
// Animation beats:
//   0. intro        — static stem scene, state the task.
//   1. gray-piece   — highlight the gray semicircle piece.
//   2. white-piece  — highlight the white quarter-circle piece.
//   3–6. check A–D  — show each option with ✓ (possible).
//   7. check E      — show E with ✗ (impossible): curved pieces ≠ straight quadrants.
//   8. result       — E → green final.

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'
const RED_INK   = '#991B1B'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const BLUE_INK  = '#30598A'
const MUTED_BG  = '#F1F5F9'
const MUTED_INK = '#64748B'

// ── fake WmiChoice type for option rendering ───────────────────────────────
function makeFakeChoice(label: string) {
  return { label, text: `(${label})` }
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function CirclePieces8ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCirclePieces8ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const isImpossible = beat.verdict === 'impossible'
  const isPossible = beat.verdict === 'possible'

  // Decide which visual to show in the centre:
  // - during piece-highlight beats: show the stem diagram
  // - during option-check beats: show the option figure
  const showStem =
    beat.phase === 'intro' ||
    beat.phase === 'gray-piece' ||
    beat.phase === 'white-piece'
  const showOption = !showStem && beat.highlightOption != null

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: karena potongan abu-abu adalah setengah lingkaran dan potongan putih adalah seperempat lingkaran (keduanya bertepi melengkung), mereka tidak dapat membuat pembagi garis lurus. Pilihan A–D semuanya bisa dibuat, tetapi pilihan E menunjukkan empat kuadran persegi panjang bertepi lurus yang tidak mungkin dibuat dari potongan melengkung. Jawabannya E.`
      : `Explainer: the gray piece is a semicircle and the white piece is a quarter-circle — both have curved edges. They cannot create straight-line dividers. Options A–D are all achievable, but option E shows four neat straight-edged rectangular quadrants which are impossible to make from curved pieces. The answer is E.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Option label badge (only during option checks) ─────────────── */}
        {beat.highlightOption && (
          <motion.div
            key={`opt-label-${beat.highlightOption}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 font-display text-lg font-black"
            style={
              isResult
                ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                : isImpossible
                  ? { background: RED_BG, color: RED_INK, borderColor: RED }
                  : isPossible
                    ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                    : { background: BLUE_BG, color: BLUE_INK, borderColor: BLUE }
            }
          >
            {beat.highlightOption}
          </motion.div>
        )}

        {/* ── Centre visual: stem or option figure ───────────────────────── */}
        <motion.div
          key={`visual-${beat.phase}-${beat.highlightOption ?? ''}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border-2 bg-white px-2 py-2"
          style={{
            borderColor: isResult
              ? GREEN
              : isImpossible
                ? RED
                : isPossible
                  ? GREEN
                  : '#E2E8F0',
            minWidth: 140,
          }}
        >
          {showStem && (
            <div style={{ position: 'relative' }}>
              <CirclePieces8ECStem />
              {/* highlight rings for the piece-highlight beats */}
              {beat.showGrayHighlight && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '10%',
                    top: '20%',
                    width: '26%',
                    aspectRatio: '1',
                    border: `3px solid ${BLUE}`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {beat.showWhiteHighlight && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '44%',
                    top: '20%',
                    width: '22%',
                    aspectRatio: '1',
                    border: `3px solid ${BLUE}`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}
          {showOption && beat.highlightOption && (
            <CirclePieces8ECOption choice={makeFakeChoice(beat.highlightOption)} />
          )}
        </motion.div>

        {/* ── Verdict badge ───────────────────────────────────────────────── */}
        {(isPossible || isImpossible) && (
          <motion.div
            key={`verdict-${index}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 20 }}
            className="flex items-center gap-2 rounded-full border-2 px-4 py-1 font-display text-sm font-black"
            style={
              isImpossible
                ? { background: RED_BG, color: RED_INK, borderColor: RED }
                : { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
            }
          >
            <span aria-hidden="true">{isImpossible ? '✗' : '✓'}</span>
            <span>
              {isImpossible
                ? (lang === 'id' ? 'Tidak Mungkin' : 'Impossible')
                : (lang === 'id' ? 'Mungkin' : 'Possible')}
            </span>
          </motion.div>
        )}

        {/* ── Equation line ────────────────────────────────────────────────── */}
        {beat.equation && (
          <div
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-1 font-mono text-sm font-bold"
            style={{ color: BLUE_INK }}
          >
            {beat.equation}
          </div>
        )}

        {/* ── Option strip (mini thumbnails A–E) ─────────────────────────── */}
        <div className="flex items-center gap-1.5">
          {OPTION_LABELS.map((lbl) => {
            const isActive = beat.highlightOption === lbl
            const isDone =
              beat.phase === 'result' ||
              (beat.phase === 'check-e' && lbl !== 'E') ||
              (beat.phase === 'check-d' && ['A', 'B', 'C'].includes(lbl)) ||
              (beat.phase === 'check-c' && ['A', 'B'].includes(lbl)) ||
              (beat.phase === 'check-b' && lbl === 'A')
            const isWrong = beat.phase === 'result' && lbl === 'E'
            return (
              <motion.div
                key={`strip-${lbl}`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-xs font-black"
                style={
                  isWrong
                    ? { background: RED_BG, color: RED_INK, borderColor: RED }
                    : isActive
                      ? { background: BLUE_BG, color: BLUE_INK, borderColor: BLUE }
                      : isDone
                        ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                        : { background: MUTED_BG, color: MUTED_INK, borderColor: '#CBD5E1' }
                }
                aria-hidden="true"
              >
                {lbl}
              </motion.div>
            )
          })}
        </div>

        {/* ── Caption box ─────────────────────────────────────────────────── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : isImpossible
                ? { background: RED_BG, borderColor: RED, color: RED_INK }
                : { background: BLUE_BG, borderColor: BLUE, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
