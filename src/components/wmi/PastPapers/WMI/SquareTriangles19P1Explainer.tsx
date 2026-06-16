import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SquareTriFigure, TRI_TOTAL, VIEW } from './SquareTriangles19P1Illustration'
import { buildSquareTriangles19P1Steps } from './squareTriangles19P1Steps'

// WMI-19P1A-Q21 — post-answer enumeration: every triangle in the divided square
// lights up one at a time with a running counter (1, 2, … 14), small triangles
// first then the big combined ones, landing on the total (answer A = 14).

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function SquareTriangles19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSquareTriangles19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = t(
    `Count every triangle in the divided square, big and small, one at a time: there are ${TRI_TOTAL} triangles in all.`,
    `Hitung setiap segitiga dalam persegi yang dibagi, besar dan kecil, satu per satu: ada ${TRI_TOTAL} segitiga seluruhnya.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full" style={{ maxWidth: VIEW }}>
          <SquareTriFigure litId={beat.litId} />

          {/* running counter chip */}
          {beat.count > 0 && (
            <motion.div
              key={`count-${beat.count}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="absolute right-0 top-0 flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 font-display text-base font-extrabold"
              style={{
                background: beat.result ? '#D1FAE5' : BLUE_BG,
                borderColor: beat.result ? GREEN : BLUE,
                color: beat.result ? '#065F46' : BLUE,
              }}
            >
              <span aria-hidden="true">{t('Count:', 'Hitung:')}</span>
              <span>{beat.count}</span>
            </motion.div>
          )}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
