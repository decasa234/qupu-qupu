import { useState } from 'react'
import WmiExplainer from '@/components/wmi/WmiExplainer'
import WmiLanguageToggle from '@/components/wmi/WmiLanguageToggle'

interface WmiSolutionProps {
  className?: string
}

/**
 * Marketing "Penjelasan / Problem-solve" section.
 *
 * Renders the real animated, step-by-step solution for the count-squares
 * problem by reusing the production WmiExplainer for slug
 * `count-rectangles-grid` (a 3x3 grid → 1x1:9 + 2x2:4 + 3x3:1 = 14 squares).
 *
 * A language toggle flips the explainer copy between EN/ID. The WmiExplainer
 * is keyed by `lang` so it remounts and restarts the animation cleanly on
 * every language switch.
 */
export default function WmiSolution({ className }: WmiSolutionProps) {
  const [lang, setLang] = useState<'en' | 'id'>('id')
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'id' : 'en'))

  return (
    <section
      className={`px-4 py-12 sm:py-16${className ? ` ${className}` : ''}`}
      aria-labelledby="wmi-solution-heading"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-qupu-brand-orange sm:text-sm">
          Penjelasan
        </p>
        <h2
          id="wmi-solution-heading"
          className="mt-2 font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl"
        >
          Lihat caranya, langkah demi langkah
        </h2>
        <p className="mt-3 text-sm text-qupu-muted sm:text-base">
          Animasi pelan-pelan menghitung setiap persegi, supaya tidak ada yang terlewat.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-[2rem] border-[3px] border-qupu-peach bg-qupu-cream p-4 shadow-[6px_8px_0_0_#FFD3B1] sm:p-6">
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
      </div>
    </section>
  )
}
