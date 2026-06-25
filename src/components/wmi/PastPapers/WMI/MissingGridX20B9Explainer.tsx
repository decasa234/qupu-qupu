// Animated explainer for SEAMOX-20-B-Q9.
// Pattern: row2[c] = row1[c] + row3[c] for every column.
// Beats:
//   0  intro      — plain grid, no highlight
//   1  col2 check — highlight column 2 (3+9=12 ✓) to confirm the rule
//   2  col3 apply — highlight column 3 (5+9=?) to apply the rule
//   3  reveal     — show answer 14 in the missing cell
//
// Uses framer-motion AnimatePresence (same pattern as GridCount20B20Explainer).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MissingGridX20B9Figure } from './MissingGridX20B9Illustration'

const AMBER = '#D97706'
const GREEN = '#10B981'

interface Beat {
  highlightCol: number | null
  showAnswer: boolean
  equation: string
  caption: string
  result: boolean
  hold: number
}

function buildBeats(lang: 'en' | 'id'): Beat[] {
  if (lang === 'id') {
    return [
      {
        highlightCol: null,
        showAnswer: false,
        equation: '',
        caption: 'Cari pola: bagaimana hubungan baris 1, 2, dan 3 di setiap kolom?',
        result: false,
        hold: 2200,
      },
      {
        highlightCol: 1,
        showAnswer: false,
        equation: '3 + 9 = 12 ✓',
        caption: 'Kolom 2: baris1 + baris3 = baris2 → 3 + 9 = 12 ✓',
        result: false,
        hold: 2400,
      },
      {
        highlightCol: 2,
        showAnswer: false,
        equation: '5 + 9 = ?',
        caption: 'Kolom 3: terapkan pola yang sama → 5 + 9 = ?',
        result: false,
        hold: 2000,
      },
      {
        highlightCol: 2,
        showAnswer: true,
        equation: '5 + 9 = 14 ✓',
        caption: 'Bilangan yang hilang adalah 14!',
        result: true,
        hold: 3000,
      },
    ]
  }

  return [
    {
      highlightCol: null,
      showAnswer: false,
      equation: '',
      caption: 'Look for a pattern: how are rows 1, 2, and 3 related in each column?',
      result: false,
      hold: 2200,
    },
    {
      highlightCol: 1,
      showAnswer: false,
      equation: '3 + 9 = 12 ✓',
      caption: 'Column 2: row1 + row3 = row2 → 3 + 9 = 12 ✓',
      result: false,
      hold: 2400,
    },
    {
      highlightCol: 2,
      showAnswer: false,
      equation: '5 + 9 = ?',
      caption: 'Column 3: apply the same rule → 5 + 9 = ?',
      result: false,
      hold: 2000,
    },
    {
      highlightCol: 2,
      showAnswer: true,
      equation: '5 + 9 = 14 ✓',
      caption: 'The missing number is 14!',
      result: true,
      hold: 3000,
    },
  ]
}

export default function MissingGridX20B9Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const beats = useMemo(() => buildBeats(lang), [lang])
  const finalIndex = beats.length - 1
  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[finalIndex]

  const accentColor = beat.result ? GREEN : AMBER

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola baris2 = baris1 + baris3 per kolom. Kolom 2: 3+9=12 ✓. Kolom 3: 5+9=14, sehingga bilangan yang hilang adalah 14.'
      : 'Explainer: pattern row2 = row1 + row3 per column. Column 2: 3+9=12 ✓. Column 3: 5+9=14, so the missing number is 14.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.6, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <MissingGridX20B9Figure
                highlightCol={beat.highlightCol}
                showAnswer={beat.showAnswer}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: accentColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FFFBEB', borderColor: AMBER, color: AMBER }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
