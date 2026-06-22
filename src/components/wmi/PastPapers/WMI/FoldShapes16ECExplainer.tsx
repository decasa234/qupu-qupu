import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FoldShapes16ECPrimitive } from './FoldShapes16ECIllustration'
import { buildFoldShapes16ECSteps } from './foldShapes16ECSteps'

// IKMC-22-EC-Q16 — "How many of the shapes on the left will fall exactly on
// top of shapes on the right?" Answer: C = three.
//
// Post-answer explainer. Reuses FoldShapes16ECPrimitive (same colour tokens and
// layout as the static illustration). One idea per beat: plan → check each of
// the 5 left shapes one at a time → result. Uses useBeatControl (same as
// PaperFold10Explainer and PaperFold23G1Explainer).

const BLUE = '#30598A'   // in-progress accent
const GREEN = '#10B981'  // match / result accent
const RED = '#EF4444'    // no-match accent

export default function FoldShapes16ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFoldShapes16ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accentColor =
    beat.result ? GREEN
    : beat.match === true ? GREEN
    : beat.match === false ? RED
    : BLUE

  const ariaLabel = t(
    'Explainer: fold the paper along the red line. The right arrow, upper triangle, and down arrow each land on a matching shape on the right — giving 3 matches. Answer: C (three).',
    'Penjelasan: lipat kertas sepanjang garis merah. Panah kanan, segitiga atas, dan panah bawah masing-masing mendarat di atas bentuk yang cocok di sebelah kanan — menghasilkan 3 kecocokan. Jawaban: C (tiga).',
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* strategy banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t(
            'Fold left onto right — check if each left shape lands on a matching right shape',
            'Lipat kiri ke kanan — periksa apakah setiap bentuk kiri mendarat di atas bentuk kanan yang cocok',
          )}
        </div>

        {/* paper figure — always the flat view from the primitive */}
        <motion.div
          key={beat.phase + beat.highlightLeft}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <FoldShapes16ECPrimitive showFolded={beat.result} />
        </motion.div>

        {/* running match counter */}
        {beat.matchCount > 0 && (
          <motion.div
            key={`count-${beat.matchCount}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex items-baseline gap-1 font-display"
          >
            <span className="text-xl font-black tabular-nums" style={{ color: GREEN }}>
              {beat.matchCount}
            </span>
            <span className="text-sm font-bold" style={{ color: GREEN }}>
              {t('match', 'kecocokan')}{beat.matchCount > 1 ? (lang === 'id' ? '' : 'es') : ''}
              {beat.result && (
                <span className="ml-1" style={{ color: GREEN }}>
                  {t('— answer C', '— jawaban C')}
                </span>
              )}
            </span>
          </motion.div>
        )}

        {/* beat caption */}
        <div
          className="min-h-[3.25rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.match === true
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : beat.match === false
                  ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
