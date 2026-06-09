import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import WmiConceptDemo from './WmiConceptDemo'
import WmiFeatureTour from './WmiFeatureTour'
import WmiMasteryTree from './WmiMasteryTree'
import { HOOK_QUESTION } from '@/data/wmiMarketing'

const SLIDES = [
  { key: 'tur', label: 'Tur fitur', icon: 'fa-solid fa-wand-magic-sparkles' },
  { key: 'demo', label: 'Penjelasan', icon: 'fa-solid fa-film' },
  { key: 'pohon', label: 'Naik level', icon: 'fa-solid fa-seedling' },
]

// Easing: ease-out-quint (no bounce).
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * The reveal carousel shown after the visitor answers the hook question.
 * Opens on the demo slide so it ties to the dice-net concept they just guessed.
 */
export default function WmiRevealCarousel() {
  const [slide, setSlide] = useState(1)
  const reduce = useReducedMotion()
  const go = (i: number) => setSlide((i + SLIDES.length) % SLIDES.length)

  return (
    <div className="rounded-[2.5rem] border-[3px] border-qupu-brand-blue/15 bg-white p-4 shadow-[6px_8px_0_0_#FFD3B1] sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => go(i)}
            aria-pressed={i === slide}
            className={
              i === slide
                ? 'inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-xs font-extrabold text-white'
                : 'inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 font-display text-xs font-extrabold text-qupu-brand-blue/70 transition hover:bg-qupu-peach/40'
            }
          >
            <i className={s.icon} aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative mt-5 min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
          >
            {slide === 0 && <WmiFeatureTour />}
            {slide === 1 && <WmiConceptDemo initialIndex={HOOK_QUESTION.demoIndex} />}
            {slide === 2 && <WmiMasteryTree />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Slide sebelumnya"
          onClick={() => go(slide - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-qupu-brand-blue text-qupu-brand-blue transition hover:-translate-y-0.5"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={s.label}
              onClick={() => go(i)}
              className="h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qupu-brand-orange focus-visible:ring-offset-2"
              style={{ width: i === slide ? 22 : 10, background: i === slide ? '#30598A' : '#FFD3B1' }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Slide berikutnya"
          onClick={() => go(slide + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-qupu-brand-blue text-qupu-brand-blue transition hover:-translate-y-0.5"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
