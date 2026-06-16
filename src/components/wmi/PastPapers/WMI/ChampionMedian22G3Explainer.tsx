// WMI-22F3A-Q13 — Post-answer animation for the median-championship question.
//
// Strategy taught:
//   1. Recognise we have 9 win counts already sorted on the bar chart.
//   2. The median of 9 values = the 5th value when ordered ascending.
//   3. Sorted: 1,1,1,2,[3],8,8,13,13  →  5th = 3 → Netherlands.
//
// Reuses WinCountChart from the illustrator; passes highlightIndex on the final beat
// to spotlight the Netherlands bar.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { WinCountChart } from './ChampionMedian22G3Illustration'
import { buildChampionMedianSteps } from './championMedian22G3Steps'

// Qupu brand colours (mirror fill-qupu-* tokens)
const BLUE_DARK  = '#1E3A8A'
const BLUE_MID   = '#30598A'
const ORANGE     = '#f0853a'
const GREEN_BG   = '#D1FAE5'
const GREEN_BDR  = '#10B981'
const GREEN_TXT  = '#065F46'
const INFO_BG    = '#E1EFFB'

// --------------------------------------------------------------------------
// LineupRow — shows the sorted counts as bubbles, optionally circling one.
// --------------------------------------------------------------------------

interface LineupRowProps {
  counts: ReadonlyArray<number>
  medianIndex: number | null
}

function LineupRow({ counts, medianIndex }: LineupRowProps) {
  return (
    <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
      {counts.map((c, i) => {
        const isMedian = medianIndex === i
        return (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: i * 0.05 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              background: isMedian ? ORANGE : INFO_BG,
              color: isMedian ? '#fff' : BLUE_DARK,
              border: `2px solid ${isMedian ? ORANGE : BLUE_MID}`,
              boxShadow: isMedian ? `0 0 0 3px ${ORANGE}44` : 'none',
            }}
          >
            {c}
          </motion.div>
        )
      })}
    </div>
  )
}

// --------------------------------------------------------------------------
// MedianLabel — shows "5th of 9 = 3" annotation, visible on find-fifth beat.
// --------------------------------------------------------------------------

function MedianLabel({ lang }: { lang: 'en' | 'id' }) {
  const label = lang === 'id'
    ? 'Angka ke-5 dari 9 = 3'
    : '5th of 9 = 3'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 13,
        color: ORANGE,
        textAlign: 'center',
      }}
    >
      {label}
    </motion.div>
  )
}

// --------------------------------------------------------------------------
// Main explainer
// --------------------------------------------------------------------------

export default function ChampionMedian22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildChampionMedianSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: urutkan 9 jumlah kemenangan, nilai tengah (ke-5) adalah 3 → ${story.medianCountry}. Jawaban A.`
      : `Explainer: sort 9 win counts; the middle (5th) value is 3 → ${story.medianCountry}. Answer A.`

  const showLineup  = beat.lineup !== null
  const showMedian  = beat.medianLineupIndex !== null
  const showFifthLabel = beat.phase === 'find-fifth' || beat.phase === 'answer'

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Bar chart — always visible; highlightIndex lights up Netherlands on answer beat */}
        <WinCountChart highlightIndex={beat.highlightIndex} />

        {/* Sorted lineup row — slides in on beat 2 */}
        <AnimatePresence>
          {showLineup && (
            <motion.div
              key="lineup"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <LineupRow
                counts={beat.lineup!}
                medianIndex={showMedian ? beat.medianLineupIndex : null}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* "5th of 9 = 3" label */}
        <AnimatePresence>
          {showFifthLabel && (
            <motion.div
              key="fifth-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MedianLabel lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.isAnswer
              ? { background: GREEN_BG, borderColor: GREEN_BDR, color: GREEN_TXT }
              : { background: INFO_BG,  borderColor: BLUE_MID,  color: BLUE_MID  }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
