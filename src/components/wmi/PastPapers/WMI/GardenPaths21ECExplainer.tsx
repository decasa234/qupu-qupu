// GardenPaths21ECExplainer.tsx
//
// Post-answer explainer for IKMC-22-EC-Q21 (garden paths / LCM).
//
// Strategy:
//   1. Read the perimeters from the figure (20 m and 30 m).
//   2. Find LCM(20, 30) = 60 m — the first meeting distance.
//   3. Ahmad's laps = 60 ÷ 20 = 3. Answer C.
//
// The explainer reuses GardenFigure from the illustration and adds animated
// perimeter highlights driven by useBeatControl.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GardenFigure, SQ_SIDE_M, RECT_W_M, RECT_H_M, PX_PER_M } from './GardenPaths21ECIllustration'
import { buildGardenPaths21ECSteps } from './gardenPaths21ECSteps'

// ---- colour tokens -----------------------------------------------------------
const BRAND_BLUE        = '#30598A'
const BRAND_BLUE_SHADOW = '#263B55'
const GREEN             = '#10B981'
const GREEN_INK         = '#065F46'

// ---- equation display --------------------------------------------------------
type EquationPhase =
  | 'intro'
  | 'squarePerim'
  | 'rectPerim'
  | 'lcmSetup'
  | 'lcmCalc'
  | 'lapsAhmad'
  | 'answer'

interface EqPart { text: string; color: string }

function EquationRow({ phase, lang }: { phase: EquationPhase; lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const BLUE  = BRAND_BLUE
  const GRAY  = '#6B7280'
  const AMB   = '#F59E0B'
  const FUCH  = '#C026D3'
  const GRN   = GREEN_INK

  let parts: EqPart[] = []

  if (phase === 'squarePerim') {
    parts = [
      { text: '4', color: BLUE }, { text: ' × ', color: GRAY },
      { text: '5', color: BLUE }, { text: t(' m = ', ' m = '), color: GRAY },
      { text: '20', color: AMB }, { text: t(' m', ' m'), color: GRAY },
    ]
  } else if (phase === 'rectPerim') {
    parts = [
      { text: '2', color: BLUE }, { text: ' × (', color: GRAY },
      { text: '10', color: BLUE }, { text: ' + ', color: GRAY },
      { text: '5', color: BLUE }, { text: t(') = ', ') = '), color: GRAY },
      { text: '30', color: AMB }, { text: t(' m', ' m'), color: GRAY },
    ]
  } else if (phase === 'lcmCalc') {
    parts = [
      { text: t('LCM(20, 30) = ', 'KPK(20, 30) = '), color: GRAY },
      { text: '60', color: FUCH }, { text: t(' m', ' m'), color: GRAY },
    ]
  } else if (phase === 'lapsAhmad') {
    parts = [
      { text: '60', color: FUCH }, { text: ' ÷ ', color: GRAY },
      { text: '20', color: AMB }, { text: ' = ', color: GRAY },
      { text: '3', color: GRN }, { text: t(' laps', ' putaran'), color: GRAY },
    ]
  } else if (phase === 'answer') {
    parts = [
      { text: t('Ahmad: ', 'Ahmad: '), color: GRAY },
      { text: '3', color: GRN },
      { text: t(' laps → C', ' putaran → C'), color: GRN },
    ]
  }

  if (parts.length === 0) return null

  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-0 font-display text-xl font-black tabular-nums"
    >
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.color }}>
          {p.text}
        </span>
      ))}
    </motion.div>
  )
}

// ---- main explainer ----------------------------------------------------------

export default function GardenPaths21ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildGardenPaths21ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Square garden perimeter = 20 m, rectangle perimeter = 30 m. LCM(20, 30) = 60 m. Ahmad: 60 ÷ 20 = 3 laps. Answer C.',
    'Keliling persegi = 20 m, keliling persegi panjang = 30 m. KPK(20, 30) = 60 m. Ahmad: 60 ÷ 20 = 3 putaran. Jawaban C.',
  )

  // Perimeter info line (used in caption area)
  const perimInfo = (() => {
    if (beat.phase === 'squarePerim') {
      const p = SQ_SIDE_M * 4
      return t(`Square: 4 × ${SQ_SIDE_M} = ${p} m`, `Persegi: 4 × ${SQ_SIDE_M} = ${p} m`)
    }
    if (beat.phase === 'rectPerim') {
      const p = 2 * (RECT_W_M + RECT_H_M)
      return t(`Rectangle: 2 × (${RECT_W_M} + ${RECT_H_M}) = ${p} m`, `Persegi panjang: 2 × (${RECT_W_M} + ${RECT_H_M}) = ${p} m`)
    }
    return null
  })()

  // Figure pixel dimensions (for overlay positioning - not needed but keep consistent)
  const _sqSide = SQ_SIDE_M * PX_PER_M
  const _rectW  = RECT_W_M  * PX_PER_M
  void _sqSide; void _rectW

  return (
    <div
      className="mx-auto w-full max-w-[460px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex min-h-[340px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* header banner */}
        <div
          className="relative flex w-full max-w-[360px] items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_SHADOW }}
          />
          <span
            className="relative font-display text-sm font-extrabold"
            style={{ color: '#FFF2DF' }}
          >
            {t(
              'Same speed → meet at A when laps are whole numbers',
              'Kecepatan sama → bertemu di A saat putaran bulat',
            )}
          </span>
        </div>

        {/* garden figure */}
        <div className="w-full">
          <GardenFigure
            highlightSquare={beat.highlightSquare}
            highlightRect={beat.highlightRect}
            ahmadLaps={beat.ahmadLaps ?? undefined}
            zhalehLaps={beat.zhalehLaps ?? undefined}
            hideWalkers={beat.hideWalkers}
          />
        </div>

        {/* equation row */}
        <div className="min-h-[2rem] flex items-center justify-center w-full">
          <EquationRow phase={beat.phase as EquationPhase} lang={lang} />
        </div>

        {/* perimeter info line */}
        {perimInfo && (
          <motion.div
            key={perimInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center font-display text-xs font-bold"
            style={{ color: '#92400E' }}
          >
            {perimInfo}
          </motion.div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
