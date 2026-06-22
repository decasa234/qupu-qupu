// IKMC-20-PE-Q2 — post-answer explainer: castle selfie orientation.
//
// Reuses CastleBattlement, SelfieHead, CASTLE, COLOR from Castle2PEIllustration.
// Animation beats (from castle2PESteps):
//   0. intro     — reference castle; "study the centre spire."
//   1. selfie    — spire highlighted; selfie = face the camera, no flip.
//   2. check-lr  — spire highlighted; "spire should be to the LEFT of the face."
//   3. options   — option E highlighted as correct.
//   4. result    — option E confirmed; answer E.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CastleBattlement,
  Castle2PEOption,
  CASTLE,
  COLOR,
} from './Castle2PEIllustration'
import { buildCastle2PESteps } from './castle2PESteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const ORANGE = '#F59E0B'

// ── Reference castle display constants ───────────────────────────────────────
const REF_W = 260
const REF_H = 110

function refCastleScale() { return 0.96 }

function refCastleX() {
  return (REF_W - CASTLE.W * refCastleScale()) / 2
}

function refCastleY() {
  const totalH = (CASTLE.BODY_H + CASTLE.CRENEL_H + CASTLE.TALL_EXTRA) * refCastleScale()
  return REF_H - totalH - 8
}

// ── Spire highlight box ───────────────────────────────────────────────────────

function SpireHighlight() {
  const s = refCastleScale()
  const x = refCastleX()
  const y = refCastleY()

  // Compute the x centre of the tall merlon (same logic as castlePath)
  const { W, BODY_H, CRENEL_H, TALL_W, TALL_EXTRA, SMALL_W, GAP } = CASTLE
  const battleW = (4 * SMALL_W + TALL_W + 4 * GAP) * s
  const battleX = x + (W * s - battleW) / 2
  const tallX = battleX + (2 * SMALL_W + 2 * GAP) * s
  const tallCX = tallX + (TALL_W * s) / 2

  const tallTopY = y  // top of the tall merlon
  const tallBotY = y + (TALL_EXTRA + CRENEL_H + BODY_H) * s

  return (
    <rect
      x={tallCX - TALL_W * s * 0.9}
      y={tallTopY - 3}
      width={TALL_W * s * 1.8}
      height={tallBotY - tallTopY + 3}
      fill={ORANGE + '44'}
      stroke={ORANGE}
      strokeWidth={2}
      strokeDasharray="4 3"
      rx={3}
    />
  )
}

// ── Option panel ──────────────────────────────────────────────────────────────

interface OptionPanelProps {
  label: string
  isActive: boolean
  isCorrect: boolean
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

function OptionPanel({ label, isActive, isCorrect }: OptionPanelProps) {
  const borderColor = isActive && isCorrect ? GREEN : isActive ? ORANGE : '#D1D5DB'
  const choice = { label, text: `(figure ${label})` }

  return (
    <motion.div
      layout
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '2px 4px',
        background: '#fff',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Castle2PEOption choice={choice} />
      <span
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 800,
          color: isActive && isCorrect ? GREEN : isActive ? ORANGE : '#374151',
        }}
      >
        {label}
        {isActive && isCorrect && ' ✓'}
      </span>
    </motion.div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Castle2PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCastle2PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: selfie diambil menghadap kamera; kastil tidak dibalik. Hanya gambar E yang menunjukkan menara di KIRI wajah, sesuai tampak depan kastil. Jawaban E.'
      : 'Explainer: a selfie is taken facing the camera so the castle is not flipped. Only picture E shows the spire to the LEFT of the face, matching the front view. Answer E.'

  // Show options panel in beats 3 and 4
  const showOptions = beat.phase === 'options' || beat.phase === 'result'
  // Show reference castle in beats 0–2
  const showRefCastle = !showOptions

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Reference castle figure (beats 0–2) */}
        <AnimatePresence mode="wait">
          {showRefCastle && (
            <motion.div
              key="ref-castle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <svg
                viewBox={`0 0 ${REF_W} ${REF_H}`}
                width={REF_W}
                style={{ display: 'block' }}
                aria-hidden="true"
              >
                <rect x={0} y={0} width={REF_W} height={REF_H} fill={COLOR.BG} />
                <CastleBattlement
                  x={refCastleX()}
                  y={refCastleY()}
                  scale={refCastleScale()}
                  strokeWidth={2.5}
                />
                <AnimatePresence>
                  {beat.showSpire && (
                    <motion.g
                      key="spire-hl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      <SpireHighlight />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options panel (beats 3–4) */}
        <AnimatePresence mode="wait">
          {showOptions && (
            <motion.div
              key="options-panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}
            >
              {OPTION_LABELS.map((label) => (
                <OptionPanel
                  key={label}
                  label={label}
                  isActive={beat.focusOption === label}
                  isCorrect={beat.focusCorrect && beat.focusOption === label}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
