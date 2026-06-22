// IKMC-22-EC-Q18 — "What piece completes the star puzzle?" — explainer.
//
// Beat-by-beat walk:
//   1. Show gap in incomplete star, explain the task.
//   2. Reject A and B (wrong colour sequence).
//   3. Reject D and E (wrong colour sequence).
//   4. Accept C — drop it into the star gap → answer C.
//
// Reuses StarAssembly + StarPuzzlePrimitive from PuzzleGap18ECIllustration.tsx.
// Adapted from MissingPiece9PEExplainer (VerdictChip pattern + beat flow).

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StarAssembly,
  PuzzleGap18ECOption,
  CORRECT_ORDER,
} from './PuzzleGap18ECIllustration'
import { buildPuzzleGap18ECSteps } from './puzzleGap18ECSteps'
import type { WmiChoice } from '../../../../types/wmi'

const GREEN  = '#10B981'
const RED    = '#DC2626'
const BLUE   = '#30598A'

// ---------------------------------------------------------------------------
// VerdictChip — shows one option tile with a pass/fail label
// ---------------------------------------------------------------------------

function VerdictChip({
  label,
  verdict,
  lang,
}: {
  label: string
  verdict: 'reject' | 'accept'
  lang: 'en' | 'id'
}) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const isAccept = verdict === 'accept'
  const accent = isAccept ? GREEN : RED
  const fakeChoice: WmiChoice = { label, text: `(${label})` }

  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-1.5"
      style={{
        background: isAccept ? '#D1FAE5' : '#FEE2E2',
        borderColor: accent,
      }}
    >
      <div className="font-display text-xs font-black" style={{ color: accent }}>
        {label}
      </div>
      <PuzzleGap18ECOption choice={fakeChoice} />
      <div className="font-display text-[0.65rem] font-bold" style={{ color: accent }}>
        {isAccept ? t('✓ fits', '✓ cocok') : t('✗ wrong', '✗ salah')}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PuzzleGap18ECExplainer
// ---------------------------------------------------------------------------

export default function PuzzleGap18ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPuzzleGap18ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // On the winning beat we fill the gap with the correct piece's colours.
  const fillColours = beat.showAnswer ? [...CORRECT_ORDER] : undefined

  const ariaLabel = t(
    'Explainer: compare the two stars — the bottom-centre piece is missing. Options A, B, D, E have wrong colour sequences. Only option C (teal→green→yellow→red→purple) fits the gap. Answer is C.',
    'Penjelasan: bandingkan dua bintang — potongan bawah-tengah hilang. Pilihan A, B, D, E memiliki urutan warna yang salah. Hanya pilihan C (biru-hijau→hijau→kuning→merah→ungu) yang cocok. Jawaban adalah C.',
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Star with gap (fills on final beat) */}
        <motion.div
          key={beat.showAnswer ? 'filled' : 'gap'}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <StarAssembly
            showGap={!beat.showAnswer}
            fillColours={fillColours}
          />
        </motion.div>

        {/* Verdict chips for options under examination */}
        <div className="flex min-h-[7rem] items-center justify-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.examining.map((label) => (
              <motion.div
                key={label}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <VerdictChip label={label} verdict={beat.verdict} lang={lang} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.verdict === 'accept' && beat.showAnswer
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.examining.length > 0 && beat.verdict === 'reject'
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#EFF6FF', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
