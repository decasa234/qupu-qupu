// IKMC-21-PE-Q6 — post-answer explainer for the four-sheets punch-hole question.
//
// Reuses PaperPunch6PE from PaperPunch6PEIllustration so the animation reads as
// the static scene coming alive. Walks through each labelled point showing it is
// NOT on all four sheets, then reveals the central overlap region and confirms
// that point D is the only point covered by all four sheets simultaneously.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PaperPunch6PE } from './PaperPunch6PEIllustration'
import { buildPaperPunch6PESteps } from './paperPunch6PESteps'
import type { PointLabel } from './paperPunch6PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_INK  = '#065F46'
const BLUE_BG    = '#E1EFFB'
const BLUE_INK   = '#30598A'
const AMBER      = '#F59E0B'
const AMBER_BG   = '#FEF3C7'
const AMBER_INK  = '#78350F'
const RED_BG     = '#FEE2E2'
const RED_INK    = '#991B1B'

// ── point status chip ─────────────────────────────────────────────────────────
type PointStatus = 'ok' | 'no' | 'pending' | 'active'

function PointChip({ label, status }: { label: PointLabel; status: PointStatus }) {
  const styles: Record<PointStatus, { bg: string; border: string; ink: string }> = {
    ok:      { bg: GREEN_BG,  border: GREEN,  ink: GREEN_INK },
    no:      { bg: RED_BG,    border: '#EF4444', ink: RED_INK },
    active:  { bg: AMBER_BG,  border: AMBER,  ink: AMBER_INK },
    pending: { bg: '#F1F5F9', border: '#CBD5E1', ink: '#94A3B8' },
  }
  const s = styles[status]

  return (
    <motion.div
      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 font-display text-sm font-black"
      style={{ background: s.bg, borderColor: s.border, color: s.ink }}
      animate={{ scale: status === 'active' ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {label}
    </motion.div>
  )
}

// ── which beats eliminate each point ─────────────────────────────────────────
// Beat 2 → A is out; Beat 3 → B; Beat 4 → C; Beat 5 → E; Beat 7+ → D is ok
const ELIMINATE_BEAT: Record<string, number> = {
  A: 2,
  B: 3,
  C: 4,
  E: 5,
}
const POINT_LABELS: PointLabel[] = ['A', 'B', 'C', 'D', 'E']

export default function PaperPunch6PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPaperPunch6PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Derive per-point chip status for the given beat index.
  function getStatus(label: PointLabel): PointStatus {
    if (label === 'D') {
      if (beat.showAnswer) return 'ok'
      if (beat.activePoint === 'D') return 'active'
      return 'pending'
    }
    const elimBeat = ELIMINATE_BEAT[label as string]
    if (elimBeat === undefined) return 'pending'
    if (index === elimBeat && beat.activePoint === label) return 'active'
    if (index > elimBeat) return 'no'
    return 'pending'
  }

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.activePoint && beat.activePoint !== 'D'
      ? { background: RED_BG, borderColor: '#EF4444', color: RED_INK }
      : beat.activePoint === 'D' || beat.showOverlap
        ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
        : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const ariaLabel = t(
    'Explainer: Four paper sheets are arranged in a staircase. Points A, B, C, E each fall outside the area covered by all four sheets. Only point D lies in the central overlap region where all four sheets coincide, so a hole punched at D goes through all four pieces.',
    'Penjelasan: Empat lembar kertas disusun seperti tangga. Titik A, B, C, E masing-masing berada di luar area yang tertutup oleh keempat lembar. Hanya titik D yang berada di area irisan tengah tempat keempat lembar bertemu, sehingga lubang yang dibuat di D menembus keempat lembar.',
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* SVG figure — PaperPunch6PE primitive, animates beat by beat */}
        <PaperPunch6PE
          showOverlap={beat.showOverlap}
          activePoint={beat.activePoint}
          showAnswer={beat.showAnswer}
        />

        {/* 5-point status strip */}
        <div className="flex items-center justify-center gap-2">
          {POINT_LABELS.map((label) => (
            <PointChip key={label} label={label} status={getStatus(label)} />
          ))}
        </div>

        {/* answer badge — appears on result beat */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence>
            {isResult && (
              <motion.div
                key="result"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {t('Answer D', 'Jawaban D')}
              </motion.div>
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
