import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { TOUR_FEATURES } from '@/data/wmiMarketing'

/**
 * Carousel slide 1 (polished placeholder): a click-to-describe tour of the
 * real explainer features, shown over a mock explainer screen.
 */
export default function WmiFeatureTour() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const feature = TOUR_FEATURES[active]

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.05fr]">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Tur fitur</div>
        <h3 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">Yang bikin anak paham</h3>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">Ketuk tiap fitur untuk melihat fungsinya.</p>
        <div className="mt-4 space-y-2">
          {TOUR_FEATURES.map((t, i) => (
            <button
              key={t.title}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={
                i === active
                  ? 'flex w-full items-center gap-3 rounded-2xl border-[3px] border-qupu-brand-orange bg-white px-4 py-3 text-left shadow-[3px_4px_0_0_#FFD3B1]'
                  : 'flex w-full items-center gap-3 rounded-2xl border-[3px] border-transparent bg-white/70 px-4 py-3 text-left transition hover:bg-white'
              }
            >
              <span
                className={
                  i === active
                    ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-qupu-brand-orange text-white'
                    : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-qupu-cream text-qupu-brand-orange'
                }
              >
                <i className={t.icon} aria-hidden="true" />
              </span>
              <span className="font-display text-sm font-extrabold text-qupu-brand-blue">{t.title}</span>
              {i === active && <i className="fa-solid fa-chevron-right ml-auto text-qupu-brand-orange" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border-[3px] border-qupu-peach bg-qupu-cream p-4 shadow-[6px_8px_0_0_#FFD3B1]">
        <div className="rounded-[1.5rem] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-qupu-brand-blue">Penjelasan</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-6 rounded-full bg-qupu-brand-blue" />
              <span className="h-2.5 w-2.5 rounded-full bg-qupu-peach" />
              <span className="h-2.5 w-2.5 rounded-full bg-qupu-peach" />
            </span>
          </div>
          <div className="mt-4 flex h-28 items-center justify-center rounded-2xl bg-qupu-shell">
            <AnimatePresence mode="wait">
              <motion.i
                key={active}
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                className={`${feature.icon} text-4xl text-qupu-brand-orange`}
                aria-hidden="true"
              />
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-brand-orange text-qupu-brand-orange">
              <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-brand-orange bg-qupu-brand-orange text-white">
              <i className="fa-solid fa-play text-xs" aria-hidden="true" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-brand-orange text-qupu-brand-orange">
              <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
            </span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="mt-4 px-1 text-center text-sm font-semibold leading-relaxed text-qupu-brand-blue/90"
          >
            <span className="font-extrabold text-qupu-brand-orange">{feature.title}. </span>
            {feature.desc}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
