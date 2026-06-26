// SASMO-19-G2-Q21 — animated explainer for the stamps pictograph.
//
// Beats:
//   0  intro   — show full pictograph, label Anthony/Elizabeth stamps
//   1  carol   — highlight Carol's row (12 stamps to give away)
//   2  divide  — 12 ÷ 4 = 3 each
//   3  add     — +3 to all four; Carol row greyed
//   4  diff    — 15 − 6 = 9 (answer)

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PictographTable, STAMPS_PER_TRI, TRIANGLE_COUNTS } from './StampGraphSASMO19G2Q21Illustration'
import {
  buildStampGraphSASMO19G2Q21Steps,
  STAMP_ANSWER,
} from './stampGraphSASMO19G2Q21Steps'

const BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const ORANGE = '#F97316'
const ORANGE_BG = '#FFF7ED'

export default function StampGraphSASMO19G2Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStampGraphSASMO19G2Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const isResult = beat.phase === 'diff'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Anthony punya 3 prangko, Elizabeth punya 12. Carol membagikan 12 ÷ 4 = 3 prangko kepada setiap anak. Anthony kini punya 6, Elizabeth kini punya 15. Selisih: 15 − 6 = 9. Jawaban: ${STAMP_ANSWER}.`
      : `Explainer: Anthony has 3 stamps, Elizabeth has 12. Carol distributes 12 ÷ 4 = 3 stamps to each child. Anthony now has 6, Elizabeth now has 15. Difference: 15 − 6 = 9. Answer: ${STAMP_ANSWER}.`

  // Arithmetic annotation shown below the pictograph on "add" and "diff" beats.
  const showArith = beat.phase === 'add' || beat.phase === 'diff'
  const anthonyStart = TRIANGLE_COUNTS['Anthony'] * STAMPS_PER_TRI   // 3
  const elizabethStart = TRIANGLE_COUNTS['Elizabeth'] * STAMPS_PER_TRI  // 12
  const carolShare = (TRIANGLE_COUNTS['Carol'] * STAMPS_PER_TRI) / 4  // 3
  const anthonyAfter = anthonyStart + carolShare   // 6
  const elizabethAfter = elizabethStart + carolShare  // 15

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* phase label */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: BLUE }}
        >
          {beat.phase === 'intro' && T('Reading the pictograph', 'Membaca diagram gambar')}
          {beat.phase === 'carol' && T("Carol's stamps", 'Prangko Carol')}
          {beat.phase === 'divide' && T('Share equally', 'Bagikan merata')}
          {beat.phase === 'add' && T('After sharing', 'Setelah dibagikan')}
          {beat.phase === 'diff' && T('Find the difference', 'Cari selisihnya')}
        </div>

        {/* pictograph */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <PictographTable
            counts={beat.counts}
            highlightCarol={beat.highlightCarol}
            grayCarol={beat.grayCarol}
          />
        </motion.div>

        {/* arithmetic strip (beats 3–4) */}
        {showArith && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-xl px-4 py-3"
            style={{ background: isResult ? GREEN_BG : ORANGE_BG }}
          >
            <div
              className="flex flex-col gap-1 text-center text-sm font-bold"
              style={{ color: isResult ? GREEN_INK : ORANGE }}
            >
              <span>
                {T('Anthony', 'Anthony')}: {anthonyStart} + {carolShare} ={' '}
                <span style={{ color: isResult ? GREEN : ORANGE }}>{anthonyAfter}</span>
              </span>
              <span>
                {T('Elizabeth', 'Elizabeth')}: {elizabethStart} + {carolShare} ={' '}
                <span style={{ color: isResult ? GREEN : ORANGE }}>{elizabethAfter}</span>
              </span>
              {isResult && (
                <span style={{ color: GREEN_INK, fontSize: '1rem' }}>
                  {elizabethAfter} − {anthonyAfter} ={' '}
                  <span
                    className="rounded px-2 py-0.5"
                    style={{ background: GREEN, color: '#fff' }}
                  >
                    {STAMP_ANSWER}
                  </span>
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* divide annotation (beat 2) */}
        {beat.phase === 'divide' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl px-5 py-2 text-center text-sm font-bold"
            style={{ background: ORANGE_BG, color: ORANGE }}
          >
            {TRIANGLE_COUNTS['Carol'] * STAMPS_PER_TRI} ÷ 4 = {carolShare}{' '}
            {T('stamps each', 'prangko per anak')}
          </motion.div>
        )}

        {/* caption */}
        <p className="max-w-[300px] text-center text-xs leading-relaxed" style={{ color: BLUE }}>
          {beat.caption}
        </p>
      </div>
    </div>
  )
}
