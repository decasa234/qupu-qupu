import { motion } from 'framer-motion'
import { getExplainer } from './concepts/explainers/registry'

interface Props {
  slug: string
  params: unknown
  correctAnswer: string
}

export default function WmiExplainer({ slug, params, correctAnswer }: Props) {
  const Explainer = getExplainer(slug)
  if (!Explainer) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-4 overflow-hidden rounded-xl border-2 border-qupu-peach bg-qupu-shell p-4"
    >
      <div className="mb-2 text-sm font-bold text-qupu-brand-blue">Penjelasan</div>
      <Explainer params={params} correctAnswer={correctAnswer} />
    </motion.div>
  )
}
