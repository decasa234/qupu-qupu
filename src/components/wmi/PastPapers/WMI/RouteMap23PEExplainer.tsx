/**
 * IKMC-22-PE-Q23 — post-answer explainer: "Which route can Kangy take?"
 * (Kangy's car can only turn left.)
 *
 * Strategy: examine each route (A → E) and test every corner for the
 * left-turn-only (CCW) constraint. Routes B, C, D, E each contain at least
 * one clockwise (right) turn and are eliminated. Route A has only CCW turns
 * and is the single valid answer.
 *
 * Animation: one route panel at a time, highlighted with a verdict chip
 * (valid = green, eliminated = red). The route SVG is reused from
 * RouteMap23PEOption so the explainer always shows the same picture as
 * the question card.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RouteMap23PEOption } from './RouteMap23PEIllustration'
import { buildRouteMap23PESteps, type RouteLabel } from './routeMap23PESteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#16A34A'
const GREEN_BG  = '#DCFCE7'
const GREEN_TXT = '#14532D'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'
const RED_TXT   = '#7F1D1D'
const MUTED     = '#9CA3AF'
const INK       = '#1C1917'

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_ROUTES: RouteLabel[] = ['A', 'B', 'C', 'D', 'E']

// ── Route thumbnail panel ─────────────────────────────────────────────────────

interface RoutePanelProps {
  label: RouteLabel
  /** Whether this panel is the currently-active beat's route. */
  active: boolean
  /** Verdict revealed so far for this route (null = not yet examined). */
  verdict: 'valid' | 'eliminated' | null
  /** UI language for verdict labels. */
  lang: 'en' | 'id'
}

function RoutePanel({ label, active, verdict, lang }: RoutePanelProps) {
  const borderColor =
    verdict === 'valid'
      ? GREEN
      : verdict === 'eliminated'
        ? RED
        : active
          ? BLUE
          : MUTED

  const verdictLabel =
    verdict === 'valid'
      ? lang === 'id'
        ? 'Valid'
        : 'Valid'
      : verdict === 'eliminated'
        ? lang === 'id'
          ? 'Gugur'
          : 'Out'
        : null

  return (
    <motion.div
      layout
      animate={{ scale: active ? 1.07 : 1, opacity: verdict === null && !active ? 0.55 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 4px 2px',
        background:
          verdict === 'valid'
            ? GREEN_BG
            : verdict === 'eliminated'
              ? RED_BG
              : '#ffffff',
        minWidth: 52,
      }}
    >
      {/* Route SVG reused from the question card */}
      <RouteMap23PEOption choice={{ label, text: `(rute ${label})` }} />

      {/* Route letter */}
      <span
        className="font-display text-xs font-bold"
        style={{
          color:
            verdict === 'valid'
              ? GREEN
              : verdict === 'eliminated'
                ? RED
                : active
                  ? BLUE
                  : INK,
        }}
      >
        {label}
      </span>

      {/* Verdict chip */}
      <AnimatePresence>
        {verdictLabel !== null && (
          <motion.div
            key={`verdict-${label}-${verdict}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[9px] font-bold"
            style={
              verdict === 'valid'
                ? { background: GREEN_BG, color: GREEN_TXT, border: `1.5px solid ${GREEN}` }
                : { background: RED_BG, color: RED_TXT, border: `1.5px solid ${RED}` }
            }
          >
            {verdictLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function RouteMap23PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(
    () => buildRouteMap23PESteps(props.correctAnswer, lang),
    [props.correctAnswer, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  // Determine the verdict for each route at the current beat index.
  // A verdict is revealed once the beat that checks that route has passed.
  const verdicts: Record<RouteLabel, 'valid' | 'eliminated' | null> = {
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
  }
  for (let i = 0; i <= index; i++) {
    const s = story.steps[i]
    if (s.activeRoute !== null && s.isValid !== null) {
      verdicts[s.activeRoute] = s.isValid ? 'valid' : 'eliminated'
    }
  }

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : beat.phase === 'intro'
      ? { background: BLUE_BG, borderColor: BLUE, color: BLUE }
      : beat.isValid
        ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
        : { background: RED_BG, borderColor: RED, color: RED_TXT }

  const ariaLabel = t(
    'Explainer: check each route for the left-turn-only rule. Routes B, C, D, E each contain a right turn and are eliminated. Route A has only left turns and is the valid answer.',
    'Penjelasan: periksa setiap rute dengan aturan belok-kiri-saja. Rute B, C, D, E masing-masing mengandung belok kanan dan gugur. Rute A hanya memiliki belok kiri dan merupakan jawaban yang valid.',
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five route panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {ALL_ROUTES.map((label) => (
            <RoutePanel
              key={label}
              label={label}
              active={beat.activeRoute === label}
              verdict={verdicts[label]}
              lang={lang}
            />
          ))}
        </div>

        {/* Turn verdict badge shown during check beats */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.activeRoute !== null && beat.isValid !== null && (
              <motion.span
                key={`badge-${beat.activeRoute}-${beat.isValid ? 'ok' : 'no'}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: beat.isValid ? GREEN : RED }}
              >
                {beat.isValid
                  ? t('All left turns', 'Semua belok kiri')
                  : t('Has right turn(s)', 'Ada belok kanan')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
