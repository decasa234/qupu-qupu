import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HexTree } from './HexTree22G1Illustration'
import { buildHexTree22G1Steps, HEX_TREE_ANSWER } from './hexTree22G1Steps'

// Echoes the qupu tokens used in the static figure.
const GREEN = '#10B981' // fill-qupu-green
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_BG = '#E1EFFB'
const AMBER = '#F59E0B' // fill-qupu-yellow (the found numbers, smallest→largest)

// Tree 1 stays on screen until we move to tree 2 (it teaches the rule).
const TREE1: string[][] = [['7'], ['3', '4'], ['2', '1', '3']]

export default function HexTree22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildHexTree22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pakai aturan pohon (setiap segi enam = jumlah dua di bawah) untuk mengisi pohon 2, temukan 9, 5, 4, susun terkecil ke terbesar jadi ${HEX_TREE_ANSWER}.`
      : `Explainer: use the tree rule (each hexagon = the two below it added) to fill tree 2, find 9, 5, 4, sort smallest to largest to get ${HEX_TREE_ANSWER}.`

  const showTree1 = beat.tree === 1
  // The sorted-answer strip appears only on the final beat.
  const sortedDigits = ['4', '5', '9']

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Heading: which tree we are reasoning about. */}
        <div className="font-display text-xs font-extrabold uppercase tracking-wide" style={{ color: BLUE }}>
          {showTree1 ? T('Tree 1 — the rule', 'Pohon 1 — aturannya') : T('Tree 2 — find the blanks', 'Pohon 2 — cari yang kosong')}
        </div>

        <div className="flex items-center justify-center gap-4">
          {showTree1 ? (
            <motion.div
              key="tree1"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            >
              <HexTree rows={TREE1} />
            </motion.div>
          ) : (
            <motion.div
              key="tree2"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            >
              <HexTree rows={beat.rows} highlight={beat.highlight ?? undefined} />
            </motion.div>
          )}
        </div>

        {/* Sorted-answer strip — only on the winning beat. */}
        {beat.result ? (
          <motion.div
            key="sorted"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {sortedDigits.map((d, i) => (
              <motion.div
                key={d}
                className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-lg font-extrabold text-white"
                style={{ background: AMBER }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12 * i, type: 'spring', stiffness: 300, damping: 18 }}
              >
                {d}
              </motion.div>
            ))}
            <span className="font-display text-lg font-extrabold" style={{ color: GREEN_INK }}>
              = {HEX_TREE_ANSWER}
            </span>
          </motion.div>
        ) : null}

        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
