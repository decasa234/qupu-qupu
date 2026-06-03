import { useState } from 'react'
import { motion } from 'framer-motion'
import { getExplainer } from './concepts/explainers/registry'

interface Props {
  slug: string
  params: unknown
  correctAnswer: string
}

export default function WmiExplainer({ slug, params, correctAnswer }: Props) {
  const Explainer = getExplainer(slug)
  const [replayKey, setReplayKey] = useState(0)
  if (!Explainer) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-4 overflow-hidden rounded-xl border-2 border-qupu-peach bg-qupu-shell p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-qupu-brand-blue">Penjelasan</div>
        <button
          type="button"
          onClick={() => setReplayKey((value) => value + 1)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-qupu-brand-orange bg-white px-3 py-1.5 font-display text-xs font-extrabold text-qupu-brand-orange transition-transform hover:-translate-y-0.5"
        >
          Replay
        </button>
      </div>
      <Explainer key={replayKey} params={params} correctAnswer={correctAnswer} />
    </motion.div>
  )
}
