// Post-answer explainer for OSN-24-SD-NAS-EKSPERIMEN-Q1.
// "Move 4 cubes from peg I to peg III with minimum moves.
//  Peg I: any order. Pegs II & III: sorted heavy→light at all times."
//
// Animates the 8-move optimal solution via 6 key-state beats.
// Key insight shown: using peg I as a free buffer shortens the path.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TowerDiagram,
  RANK_STYLE,
} from './HanoiTowerOSN24NEKQ1Illustration'
import { buildHanoiTowerOSN24NEKQ1Steps } from './hanoiTowerOSN24NEKQ1Steps'

const GREEN_CONFIRM = '#10B981'
const BLUE_ACCENT   = '#1D4ED8'

export default function HanoiTowerOSN24NEKQ1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildHanoiTowerOSN24NEKQ1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: solusi 8 langkah optimal untuk Menara Hanoi modifikasi OSN 2024.'
      : 'Explainer: 8-move optimal solution for the OSN 2024 modified Tower of Hanoi.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Tower diagram */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <TowerDiagram state={beat.state} />
        </div>

        {/* Rank legend */}
        <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
          {([1, 2, 3, 4] as const).map((r) => {
            const s = RANK_STYLE[r]
            const labels = ['70/8 ons', '6/7 kg', '5/6 kg', '751 g']
            return (
              <span
                key={r}
                className="rounded px-2 py-0.5"
                style={{ background: s.fill, color: s.text, border: `1.5px solid ${s.stroke}` }}
              >
                {labels[r - 1]}
              </span>
            )
          })}
        </div>

        {/* Caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN_CONFIRM, color: '#065F46' }
              : { background: '#EFF6FF', borderColor: BLUE_ACCENT, color: '#1E3A8A' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
