/**
 * WMI-23F3A-Q13 — triangular-lattice area explainer (2023 Grade 3 Final).
 *
 * Teaches the COUNT-then-multiply method beat by beat: the shaded quadrilateral
 * ABCD is built from small lattice triangles, each 6 cm². We count the small
 * triangles inside ABCD — a running tally climbing to 12 — then multiply
 * 12 × 6 = 72 cm² (choice C). Nothing is asserted: the tally is built up on
 * screen, DotSquares-style.
 *
 * Mirrors the static figure by reusing the illustrator's TriGridQuad23G3
 * primitive (it owns the exact lattice + shaded quad; `showCount` overlays its
 * per-triangle tally on the counting + final beats).
 *
 * SSR-safe, deterministic. No Math.random / Date.
 */

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TriGridQuad23G3 } from './TriGridQuad23G3Illustration'
import {
  buildTriGridQuad23G3Steps,
  ANSWER_AREA,
  ANSWER_CHOICE,
  SMALL_AREA,
  TRI_COUNT,
} from './triGridQuad23G3Steps'

// ─── colour tokens (echo fill-qupu-* palette / the static figure) ─────────────
const GREEN_LIGHT = '#D1FAE5' // qupu-green-100
const GREEN_DARK = '#065F46' // qupu-green-900
const GREEN_BORDER = '#10B981' // qupu-green-500
const BLUE_LIGHT = '#E1EFFB' // qupu-blue-100
const BLUE_BORDER = '#30598A' // qupu-blue-700
const BLUE_TEXT = '#30598A'
const AMBER = '#F59E0B' // counting accent, echoing the shaded-quad fill
const AMBER_TEXT = '#92400E'
const AMBER_LIGHT = '#FEF3C7'

/** The running-tally badge: how many small triangles counted so far. */
function TallyBadge({ count, result }: { count: number; result: boolean }) {
  return (
    <motion.div
      key={count}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className="rounded-xl border-2 px-3 py-1 font-display text-lg font-black tabular-nums"
      style={
        result
          ? { background: GREEN_LIGHT, borderColor: GREEN_BORDER, color: GREEN_DARK }
          : { background: AMBER_LIGHT, borderColor: AMBER, color: AMBER_TEXT }
      }
    >
      {result
        ? `${TRI_COUNT} × ${SMALL_AREA} = ${ANSWER_AREA} cm²`
        : `${count} / ${TRI_COUNT}`}
    </motion.div>
  )
}

export default function TriGridQuad23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildTriGridQuad23G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: count the small triangles inside quadrilateral ABCD — the tally climbs to ${TRI_COUNT}. Each is ${SMALL_AREA} cm², so ${TRI_COUNT} × ${SMALL_AREA} = ${ANSWER_AREA} cm². Answer ${ANSWER_CHOICE}.`,
    `Penjelasan: hitung segitiga kecil di dalam segi empat ABCD — totalnya naik sampai ${TRI_COUNT}. Tiap segitiga ${SMALL_AREA} cm², jadi ${TRI_COUNT} × ${SMALL_AREA} = ${ANSWER_AREA} cm². Jawaban ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line rule, always visible: area = triangles × 6 */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ background: AMBER }} />
          {t('Each small triangle = 6 cm²', 'Tiap segitiga kecil = 6 cm²')}
        </div>

        {/* the figure, coming alive — the illustrator's primitive. showCount
            overlays its per-triangle tally on the counting + final beats. */}
        <TriGridQuad23G3 showCount={beat.showCount} />

        {/* running tally / final product badge */}
        <div className="flex min-h-[2.5rem] items-center">
          <AnimatePresence mode="wait">
            {(beat.count > 0 || beat.result) && (
              <TallyBadge key={beat.result ? 'final' : beat.count} count={beat.count} result={beat.result} />
            )}
          </AnimatePresence>
        </div>

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_LIGHT, borderColor: GREEN_BORDER, color: GREEN_DARK }
              : { background: BLUE_LIGHT, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
