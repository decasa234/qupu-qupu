import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import WmiExplainer from '@/components/wmi/WmiExplainer'
import WmiLanguageToggle from '@/components/wmi/WmiLanguageToggle'
import WmiTypewriter from './WmiTypewriter'

interface WmiSolutionProps {
  className?: string
  /** Fired once the heading typewriter finishes and the explainer has had a moment to play. */
  onDone?: () => void
}

// How long to let the explainer carousel play after the heading finishes typing,
// before the page glides on to the features tour.
const CAROUSEL_WATCH_MS = 3200

/**
 * Marketing "Penjelasan / Problem-solve" section.
 *
 * Two-column layout: a left hero (eyebrow + typewriter heading + subline)
 * and a right explainer card that reuses the production WmiExplainer for slug
 * `count-rectangles-grid` (a 3x3 grid → 1x1:9 + 2x2:4 + 3x3:1 = 14 squares).
 *
 * A language toggle flips the explainer copy between EN/ID. The WmiExplainer
 * is keyed by `lang` so it remounts and restarts the animation cleanly on
 * every language switch. The right card slides in from the left on appear;
 * the typewriter handles the left hero's own reveal. Both respect
 * reduced-motion.
 */
export default function WmiSolution({ className, onDone }: WmiSolutionProps) {
  const reduce = useReducedMotion()
  const [lang, setLang] = useState<'en' | 'id'>('id')
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'id' : 'en'))

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const watchTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(watchTimer.current), [])

  const handleTyped = () => {
    clearTimeout(watchTimer.current)
    watchTimer.current = setTimeout(() => onDoneRef.current?.(), CAROUSEL_WATCH_MS)
  }

  return (
    <section
      className={`px-4 py-6 sm:py-8${className ? ` ${className}` : ''}`}
      aria-labelledby="wmi-solution-heading"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        {/* LEFT — hero */}
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Penjelasan
          </p>

          <h2 id="wmi-solution-heading" className="mt-3">
            <WmiTypewriter
              text="Animasi Penyelesaian Langkah demi Langkah"
              speed={92}
              onDone={handleTyped}
              className="font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl"
              cursorClassName="ml-1 inline-block w-[3px] animate-pulse rounded bg-qupu-brand-orange align-middle"
            />
          </h2>

          <p className="mt-4 text-sm text-qupu-muted sm:text-base">
            Solusi soal diputar selangkah demi selangkah, jadi anak paham
            caranya, bukan cuma jawabannya.
          </p>

          <span className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-qupu-peach bg-qupu-cream px-3 py-1 text-xs font-bold text-qupu-brand-blue">
            <i className="fa-solid fa-lightbulb text-qupu-brand-orange" aria-hidden="true" />
            bukan hafalan
          </span>
        </div>

        {/* RIGHT — explainer card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="rounded-[2rem] border-[3px] border-qupu-peach bg-qupu-cream p-4 shadow-[6px_8px_0_0_#FFD3B1] sm:p-6"
        >
          <div className="flex justify-end">
            <WmiLanguageToggle lang={lang} onToggle={toggleLang} />
          </div>

          <WmiExplainer
            key={lang}
            slug="count-rectangles-grid"
            params={{ cols: 3, rows: 3 }}
            correctAnswer="14"
            lang={lang}
          />
        </motion.div>
      </div>
    </section>
  )
}
