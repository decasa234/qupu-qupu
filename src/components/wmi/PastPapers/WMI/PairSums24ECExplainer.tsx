import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PairSums24EC } from './PairSums24ECIllustration'
import { buildPairSums24ECSteps } from './pairSums24ECSteps'

// Palette echoes the static ring illustration (same qupu tokens).
const BRAND_BLUE = '#30598A'
const ORANGE = '#f0853a'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#D1FAE5'
const PEACH_SOFT = '#FDE3CF'

// A small equation chip that shows the closing-edge constraint:
//   (G−1) + (G+2) = 2G+1 = 9  →  G = 4
function ClosingConstraint({ revealed }: { revealed: boolean }) {
  return (
    <div
      className="flex items-center gap-1 rounded-xl border-2 px-3 py-1.5"
      style={{
        background: revealed ? GREEN_SOFT : PEACH_SOFT,
        borderColor: revealed ? GREEN : ORANGE,
      }}
    >
      <span className="font-display text-sm font-bold" style={{ color: BRAND_BLUE }}>
        2G + 1 = 9
      </span>
      <span className="font-display text-sm font-bold" style={{ color: BRAND_BLUE }}>
        →
      </span>
      <span className="font-display text-sm font-bold" style={{ color: BRAND_BLUE }}>
        G =
      </span>
      <motion.span
        key={revealed ? 'val' : 'q'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-xl font-black tabular-nums"
        style={{ color: revealed ? GREEN_INK : ORANGE }}
      >
        {revealed ? '4' : '?'}
      </motion.span>
    </div>
  )
}

export default function PairSums24ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPairSums24ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    'Strategy: let the green circle = G. Its two neighbours are 6−G and 9−G from the incident edge sums. Propagating around the ring, the closing edge gives (G−1)+(G+2)=9, so 2G+1=9 and G=4. Placing 4 in the green circle yields 1,7,2,4,5,3,6 — all of 1–7 exactly once.',
    'Strategi: misalkan lingkaran hijau = G. Kedua tetangganya adalah 6−G dan 9−G dari jumlah tepi yang berhubungan. Merambat keliling cincin, tepi penutup memberi (G−1)+(G+2)=9, jadi 2G+1=9 dan G=4. Menempatkan 4 di lingkaran hijau menghasilkan 1,7,2,4,5,3,6 — semua dari 1–7 tepat satu kali.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[380px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* ring figure — driven by current beat */}
        <PairSums24EC
          revealAnswer={beat.revealAnswer}
          highlightNodes={beat.highlightNodes}
          highlightEdges={beat.highlightEdges}
        />

        {/* closing-constraint chip — only visible on close & result beats */}
        {(beat.phase === 'close' || beat.phase === 'result') && (
          <ClosingConstraint revealed={beat.revealAnswer} />
        )}

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'close'
                ? { background: PEACH_SOFT, borderColor: ORANGE, color: '#9a4a14' }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
