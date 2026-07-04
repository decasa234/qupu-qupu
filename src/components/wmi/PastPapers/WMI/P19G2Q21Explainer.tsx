import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MachineRow, SIX_PARTS, SIX_COUNT, VIEW_W, ROW_H } from './P19G2Q21Illustration'
import { buildP19G2Q21Steps } from './p19G2Q21Steps'

// WMI-19P2A-Q22 — post-answer explainer for the decomposition machine.
// We reuse the MachineRow primitive: the 6-box fills one partition per beat with
// a running counter, grouped by part-count, landing on 10 → choice C.

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P19G2Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G2Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = t(
    `Count the ways to write 6 as a sum of two or more numbers, one at a time: there are ${SIX_COUNT} ways, so the answer is choice C.`,
    `Hitung cara menulis 6 sebagai jumlah dua bagian atau lebih, satu per satu: ada ${SIX_COUNT} cara, jadi jawabannya pilihan C.`,
  )

  const shownParts = SIX_PARTS.slice(0, beat.shown)
  const rowH = ROW_H + 28 // a little extra so 5 tile-rows never clip

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full" style={{ maxWidth: VIEW_W }}>
          <svg
            viewBox={`0 0 ${VIEW_W} ${rowH}`}
            width="100%"
            style={{ display: 'block', margin: '0 auto', maxWidth: VIEW_W }}
            aria-hidden="true"
          >
            <MachineRow
              input={6}
              output={beat.output}
              parts={shownParts}
              litIndex={beat.litIndex}
              y={0}
            />
          </svg>

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
              <span aria-hidden="true">{t('Ways:', 'Cara:')}</span>
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
