import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SquarePanel, KangarooPanel, KangPieces4PEOption } from './KangPieces4PEIllustration'
import { buildKangPieces4PESteps } from './kangPieces4PESteps'

// IKMC-23-PE-Q4 — "Mr. Beaver rearranges the pieces to make a kangaroo figure.
// Which piece is missing?" (answer A — the parallelogram).
//
// Animation story (5 beats):
//   0 — show original square with cuts
//   1 — show kangaroo assembled from 6 pieces (gap outlined in dashed red)
//   2 — prompt to find the gap shape
//   3 — glow the gap, name it as a parallelogram
//   4 — (result) confirm piece A fills the gap exactly

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#1E5FA8'
const BLUE_BG = '#DBEAFE'
const BLUE_INK = '#1E40AF'

export default function KangPieces4PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildKangPieces4PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const ariaLabel = t(
    'Mr. Beaver rearranges the 7 tangram pieces into a kangaroo. The missing piece is a parallelogram — piece A.',
    'Pak Berang-berang menyusun 7 potongan tangram menjadi kanguru. Potongan yang hilang adalah jajargenjang — potongan A.',
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Main figure — switches between square and kangaroo based on phase */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="flex w-full items-center justify-center"
        >
          {beat.phase === 'square' ? (
            <div style={{ maxWidth: 160 }}>
              <SquarePanel />
            </div>
          ) : isResult ? (
            /* result beat: show the option A piece prominently */
            <div className="flex flex-col items-center gap-2">
              <KangarooPanel showGap={false} glowGap={false} />
              <div className="flex items-center gap-3">
                <span
                  className="font-display text-sm font-extrabold"
                  style={{ color: GREEN_INK }}
                >
                  {t('Piece A fills the gap:', 'Potongan A mengisi celah:')}
                </span>
                <KangPieces4PEOption choice={{ label: 'A', text: t('parallelogram', 'jajargenjang') }} />
              </div>
            </div>
          ) : (
            <KangarooPanel showGap={beat.showGap} glowGap={beat.glowGap} />
          )}
        </motion.div>

        {/* On gap-glow beat, also show piece A for comparison */}
        {beat.phase === 'gap-glow' && !isResult ? (
          <motion.div
            key="gap-glow-option"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className="font-display text-xs font-extrabold"
              style={{ color: BLUE }}
            >
              {t('Shape A:', 'Bentuk A:')}
            </span>
            <KangPieces4PEOption choice={{ label: 'A', text: t('parallelogram', 'jajargenjang') }} />
          </motion.div>
        ) : null}

        {/* Caption banner */}
        <motion.div
          key={`caption-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE_INK }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
