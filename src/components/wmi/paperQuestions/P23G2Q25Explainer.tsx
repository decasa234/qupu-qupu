import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PuzzleGrid23, GRID_N } from './P23G2Q25Illustration'
import { buildP23G2Q25Steps } from './p23G2Q25Steps'

// WMI-23P2A-Q25 — fit the 4 pieces (no rotation) into the 4×4 grid; what does the
// shaded centre 2×2 look like? (answer A). The pieces translate only and have a
// UNIQUE packing. The animation reuses the PuzzleGrid23 primitive, drops the four
// pieces in one beat each, then rings the centre 2×2 and reads it as option A.

const BLUE = '#30598A'
const GREEN = '#10B981'

const CELL = 44
const PAD = 12
const BOARD = GRID_N * CELL
const VIEW = BOARD + PAD * 2

export default function P23G2Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answerLetter = (props.correctAnswer || 'A').trim().charAt(0).toUpperCase() || 'A'
  const story = useMemo(() => buildP23G2Q25Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: the four pieces fit one unique way; the shaded centre shows a dragon, two blanks and a chest — answer ${story.answerLetter}.`,
    `Penjelasan: empat keping muat dengan satu cara unik; tengah yang diarsir menampilkan naga, dua kosong, dan peti — jawaban ${story.answerLetter}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line rule banner, always visible */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Pieces slide in — no rotating', 'Keping digeser — tidak diputar')}
        </div>

        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          width="100%"
          style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <g transform={`translate(${PAD}, ${PAD})`}>
            <PuzzleGrid23 cell={CELL} filled={beat.filled} ringCells={beat.ring} />
          </g>
        </svg>

        {/* answer chip on the final beat */}
        {beat.result && (
          <div className="flex items-center gap-2 font-display" aria-hidden="true">
            <span
              className="rounded-md px-3 py-1 text-lg font-black"
              style={{ background: '#D1FAE5', color: '#065F46' }}
            >
              {story.answerLetter}
            </span>
          </div>
        )}

        <div
          className="min-h-[2.75rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
