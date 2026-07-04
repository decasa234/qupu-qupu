import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleSums25G1 } from './CircleSums25G1Illustration'
import { buildCircleSums25G1Steps } from './circleSums25G1Steps'

// Palette echoes the static ring illustration (same qupu tokens / glyphs).
const BRAND_BLUE = '#30598A' // qupu-brand-blue — neutral chrome
const ORANGE = '#f0853a' // qupu-brand-orange — shaded-circle accent + reveal
const SHELL = '#FFF9F4' // qupu-shell (panel background)
const PEACH = '#FFD3B1' // qupu-peach (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#D1FAE5'
const PEACH_SOFT = '#FDE3CF'

// Compact strip showing the two candidate fillings of the shaded circle and,
// once the result beat lands, their sum.
function CandidateStrip({
  candidates,
  answer,
  revealed,
  T,
}: {
  candidates: readonly [number, number]
  answer: number
  revealed: boolean
  T: (en: string, id: string) => string
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ background: revealed ? GREEN_SOFT : PEACH_SOFT, borderColor: revealed ? GREEN : ORANGE }}
    >
      <span className="font-display text-[10px] font-bold" style={{ color: BRAND_BLUE }}>
        {T('shaded can be', 'arsir bisa')}
      </span>
      <span className="font-display text-xl font-black tabular-nums" style={{ color: ORANGE }}>
        {candidates[0]}
      </span>
      <span className="font-display text-sm font-bold" style={{ color: BRAND_BLUE }}>
        {T('or', 'atau')}
      </span>
      <span className="font-display text-xl font-black tabular-nums" style={{ color: ORANGE }}>
        {candidates[1]}
      </span>
      {revealed && (
        <>
          <span className="pb-0.5 font-display text-lg font-black" style={{ color: BRAND_BLUE }}>
            →
          </span>
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: GREEN_INK }}
          >
            {candidates[0]} + {candidates[1]} = {answer}
          </motion.span>
        </>
      )}
    </div>
  )
}

export default function CircleSums25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCircleSums25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: sectors marked with the same figure sit opposite each other, and the two circles beside them must have equal totals. Crescent: 10 + 7 = 17 forces the circle next to the 9 to be 8. Hexagon: 8 + 1 = 9 forces the circle next to the 7 to be 2. The leftovers 3, 4, 5, 6 fit in two ways, so the shaded circle can be ${story.candidates[0]} or ${story.candidates[1]}; the sum of its possible values is ${story.answer}.`,
    `Strategi: daerah bertanda gambar sama saling berseberangan, dan dua lingkaran di sisinya harus berjumlah sama. Bulan sabit: 10 + 7 = 17 memaksa lingkaran di sebelah 9 bernilai 8. Segi enam: 8 + 1 = 9 memaksa lingkaran di sebelah 7 bernilai 2. Sisa 3, 4, 5, 6 bisa mengisi dengan dua cara, jadi lingkaran arsir bisa ${story.candidates[0]} atau ${story.candidates[1]}; jumlah semua nilainya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[360px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* rule chip — the keystone fact, present from beat 1 on */}
        <div
          className="rounded-xl border-2 px-3 py-1 text-center font-display text-xs font-extrabold"
          style={{ background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }}
        >
          {T('Same figure ⇒ opposite sectors have the same total', 'Gambar sama ⇒ daerah berseberangan berjumlah sama')}
        </div>

        {/* the ten-circle ring — bind the built primitive, do NOT redraw */}
        <CircleSums25G1
          revealEight={beat.revealEight}
          revealTwo={beat.revealTwo}
          revealCandidates={beat.revealCandidates}
          highlightShapes={beat.highlightShapes}
        />

        {/* candidate strip — appears once the leftovers are being split */}
        {beat.revealCandidates && (
          <CandidateStrip candidates={story.candidates} answer={story.answer} revealed={beat.result} T={T} />
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : { background: PEACH_SOFT, borderColor: ORANGE, color: '#9a4a14' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
