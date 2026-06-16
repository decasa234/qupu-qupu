import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AssembledFigure, PieceGlyph, FLOWER_PIECE } from './FlowerPiece19P1Illustration'
import { buildFlowerPiece19P1Steps } from './flowerPiece19P1Steps'

// WMI-19P1A-Q24 — post-answer explainer. Drops the four pieces into the figure
// one at a time (rotation only). The piece that lands on the flower cell is the
// answer (D). Plays after the learner answers.

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function FlowerPiece19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildFlowerPiece19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const aria = t(
    `Fit the four pieces (rotation only) into the figure. The piece that lands on the flower mark is piece ${FLOWER_PIECE}.`,
    `Pasang keempat potongan (hanya diputar) ke dalam figur. Potongan yang menutupi tanda bunga adalah potongan ${FLOWER_PIECE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={beat.placed.length}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <AssembledFigure placedPieces={beat.placed} />
        </motion.div>

        {/* the piece being placed this beat (its glyph; flower shown only on the flower piece) */}
        {beat.focus && !isResult ? (
          <motion.div
            key={`focus-${beat.focus}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-display text-xs font-extrabold" style={{ color: BLUE }}>
              {t('Piece', 'Potongan')} {beat.focus}
            </span>
            <div style={{ width: 70 }}>
              <PieceGlyph id={beat.focus} withFlower={beat.focus === FLOWER_PIECE} />
            </div>
          </motion.div>
        ) : null}

        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
