// IKMC-20-PE-Q9 — "Which piece completes the picture?" — explainer.
//
// Teaches the pattern-match strategy beat-by-beat:
//   1. Read the surrounding-tile rule (spade TL, heart TR, diamond BL, club BR).
//   2. Reject D + E (wrong image type — large cross, not suit symbols).
//   3. Reject A (suits pointing the wrong way).
//   4. Reject B (suits in the wrong quadrant order).
//   5. Accept C — drop it into the grid → answer C.
//
// Reuses MissingPiece9PEGrid (the shared 3×3 grid) and MissingPiece9PEOption
// (the single-tile renderer) from MissingPiece9PEIllustration.tsx.
// Adapted from Jigsaw23G1Explainer (beat-by-beat rejection walk).

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MissingPiece9PEGrid, MissingPiece9PEOption, TILE_SZ } from './MissingPiece9PEIllustration'
import { buildMissingPiece9PESteps } from './missingPiece9PESteps'

const GREEN  = '#10B981'
const RED    = '#DC2626'
const BLUE   = '#30598A'

// A small verdict chip for each option being examined on the current beat.
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

  // Build a fake WmiChoice so MissingPiece9PEOption can render the tile.
  const fakeChoice = { label, text: `(${label})` }

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
      <MissingPiece9PEOption choice={fakeChoice} />
      <div className="font-display text-[0.65rem] font-bold" style={{ color: accent }}>
        {isAccept ? t('✓ fits', '✓ cocok') : t('✗ wrong', '✗ salah')}
      </div>
    </div>
  )
}

export default function MissingPiece9PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildMissingPiece9PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: every surrounding tile shows spade top-left, heart top-right, diamond bottom-left, club bottom-right. Options D and E have the wrong image type. A has the suits rotated 180°. B has the wrong order. Only C matches exactly — the answer is C.',
    'Penjelasan: setiap ubin di sekitarnya menampilkan sekop kiri-atas, hati kanan-atas, berlian kiri-bawah, keriting kanan-bawah. Pilihan D dan E tipe gambar salah. A putar 180°. B urutan salah. Hanya C yang cocok — jawaban C.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Pattern rule banner */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold text-blue-700">
          {t(
            'Pattern rule: ♠ TL · ♥ TR · ◇ BL · ♣ BR',
            'Aturan pola: ♠ kiri-atas · ♥ kanan-atas · ◇ kiri-bawah · ♣ kanan-bawah',
          )}
        </div>

        {/* The 3×3 grid — shows "?" until the winning beat drops in C */}
        <MissingPiece9PEGrid
          showAnswer={beat.showAnswer}
          tileSz={Math.min(TILE_SZ, 56)}
        />

        {/* Candidate tiles being judged on this beat */}
        <div className="flex min-h-[6rem] items-center justify-center gap-2">
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
        <div
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
        </div>
      </div>
    </div>
  )
}
