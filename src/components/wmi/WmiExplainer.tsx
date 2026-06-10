import { Suspense, useState } from 'react'
import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { getExplainer } from './concepts/explainers/registry'
import type { ExplainerProps } from './concepts/explainers/registry'

interface Props {
  slug?: string
  explainer?: ComponentType<ExplainerProps>
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export default function WmiExplainer({ slug, explainer, params, correctAnswer, lang }: Props) {
  const Explainer = explainer ?? (slug ? getExplainer(slug) : null)
  const [replayKey, setReplayKey] = useState(0)
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(0) // manual position / where a play-through begins
  const [current, setCurrent] = useState(0) // the beat actually on screen
  const [playing, setPlaying] = useState(true) // autostart on first load
  if (!Explainer) return null

  const cur = current
  const last = count - 1
  const go = (i: number) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, i)))
  }
  const togglePlay = () => {
    if (playing) {
      setStep(current) // pause where we are
      setPlaying(false)
    } else {
      setStep(current >= last ? 0 : current) // replay from start if we're at the end
      setPlaying(true)
    }
  }
  const onPlayEnd = () => {
    setStep(last)
    setPlaying(false)
  }
  // Fallback for explainers that don't report a beat count (auto-play internally).
  const replayFallback = () => {
    setStep(0)
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
            onClick={replayFallback}
            className="inline-flex items-center gap-2 rounded-full border-2 border-qupu-brand-orange bg-white px-3 py-1.5 font-display text-xs font-extrabold text-qupu-brand-orange transition-transform hover:-translate-y-0.5"
          >
            Replay
          </button>
        )}
      </div>

      {/* Explainers come from lazy registries — render nothing (the header is
          already visible) until the chunk arrives. */}
      <Suspense fallback={null}>
        <Explainer
          key={replayKey}
          params={params}
          correctAnswer={correctAnswer}
          lang={lang}
          step={step}
          playing={playing}
          onStepCount={setCount}
          onStepChange={setCurrent}
          onPlayEnd={onPlayEnd}
        />
      </Suspense>

      {count > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            aria-label={playing ? 'Jeda' : 'Putar'}
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-brand-orange bg-white text-sm font-extrabold text-qupu-brand-orange transition hover:-translate-y-0.5"
          >
            {playing ? '❚❚' : '▶'}
          </button>
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
          <button type="button" aria-label="Langkah berikutnya" className={roundBtn} onClick={() => go(cur + 1)} disabled={cur >= last}>
            ›
          </button>
        </div>
      )}
    </motion.div>
  )
}
