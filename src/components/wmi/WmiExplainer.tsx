import { useState } from 'react'
import { motion } from 'framer-motion'
import { getExplainer } from './concepts/explainers/registry'

interface Props {
  slug: string
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export default function WmiExplainer({ slug, params, correctAnswer, lang }: Props) {
  const Explainer = getExplainer(slug)
  const [replayKey, setReplayKey] = useState(0)
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState(0)
  // undefined = auto-play; a number = the carousel is driving the beat manually.
  const [step, setStep] = useState<number | undefined>(undefined)
  if (!Explainer) return null

  const cur = step ?? current
  const go = (i: number) => setStep(Math.max(0, Math.min(count - 1, i)))
  const replay = () => {
    setStep(undefined)
    setCurrent(0)
    setReplayKey((k) => k + 1)
  }

  const roundBtn =
    'flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-brand-blue bg-white font-display text-lg font-extrabold text-qupu-brand-blue transition disabled:opacity-30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-4 overflow-hidden rounded-xl border-2 border-qupu-peach bg-qupu-shell p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-qupu-brand-blue">Penjelasan</div>
        {count <= 1 && (
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-2 rounded-full border-2 border-qupu-brand-orange bg-white px-3 py-1.5 font-display text-xs font-extrabold text-qupu-brand-orange transition-transform hover:-translate-y-0.5"
          >
            Replay
          </button>
        )}
      </div>

      <Explainer
        key={replayKey}
        params={params}
        correctAnswer={correctAnswer}
        lang={lang}
        step={step}
        onStepCount={setCount}
        onStepChange={setCurrent}
      />

      {count > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <button type="button" aria-label="Langkah sebelumnya" className={roundBtn} onClick={() => go(cur - 1)} disabled={cur <= 0}>
            ‹
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Langkah ${i + 1}`}
                aria-current={i === cur}
                onClick={() => go(i)}
                className="h-2.5 rounded-full transition-all"
                style={{ width: i === cur ? 22 : 10, background: i === cur ? '#2f6df0' : '#cbd5e1' }}
              />
            ))}
          </div>
          <button type="button" aria-label="Langkah berikutnya" className={roundBtn} onClick={() => go(cur + 1)} disabled={cur >= count - 1}>
            ›
          </button>
          <button
            type="button"
            aria-label="Ulang dari awal"
            onClick={replay}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-brand-orange bg-white text-sm font-extrabold text-qupu-brand-orange transition hover:-translate-y-0.5"
          >
            ↻
          </button>
        </div>
      )}
    </motion.div>
  )
}
