import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { COUNT_SQUARES_QUESTION } from '@/data/wmiMarketing'
import WmiAssistedHighlight from '@/components/wmi/marketing/WmiAssistedHighlight'
import WmiExplainer from '@/components/wmi/WmiExplainer'

interface FeatureRow {
  icon: string
  title: string
  desc: string
}

const FEATURES: FeatureRow[] = [
  { icon: 'fa-solid fa-highlighter', title: 'Sorotan terbantu', desc: 'Bagian penting soal disorot otomatis.' },
  { icon: 'fa-solid fa-language', title: 'Dwibahasa', desc: 'Soal & penjelasan dalam Indonesia dan Inggris.' },
  { icon: 'fa-solid fa-list-ol', title: 'Hint bertahap', desc: 'Petunjuk muncul selangkah demi selangkah.' },
  { icon: 'fa-solid fa-circle-play', title: 'Putar & ulang', desc: 'Animasi solusi bisa diputar ulang kapan saja.' },
]

/** Strip the leading "Find:" / "Cari:" label off a question body and return the question sentence. */
function questionSentence(body: string): string {
  const parts = body.split('\n\n')
  const questionPart = parts.length > 1 ? parts[parts.length - 1] : body
  return questionPart.replace(/^\s*(Find|Cari)\s*:\s*/i, '').trim()
}

/**
 * DWIBAHASA showcase: two stacked mini question cards (EN + ID) with a
 * globe/translate motif between them.
 */
function DwibahasaShowcase() {
  const en = questionSentence(COUNT_SQUARES_QUESTION.bodyEn)
  const id = questionSentence(COUNT_SQUARES_QUESTION.bodyId)

  return (
    <div className="space-y-3">
      <MiniLangCard tag="EN" sentence={en} />

      <div className="flex items-center justify-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-qupu-brand-blue text-white shadow-[3px_4px_0_0_#FFD3B1]">
          <i className="fa-solid fa-language" aria-hidden="true" />
        </span>
      </div>

      <MiniLangCard tag="ID" sentence={id} />
    </div>
  )
}

function MiniLangCard({ tag, sentence }: { tag: string; sentence: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-cream px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
        <i className="fa-solid fa-globe" aria-hidden="true" />
        {tag}
      </span>
      <p className="mt-2 text-base font-semibold leading-relaxed text-qupu-muted">{sentence}</p>
    </div>
  )
}

/**
 * HINT BERTAHAP showcase: reveals the hint steps one at a time with a
 * sequential stagger (reduced-motion safe).
 */
function HintBertahapShowcase({ reduce }: { reduce: boolean }) {
  const steps = COUNT_SQUARES_QUESTION.hintStepsId

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
        <i className="fa-solid fa-list-ol" aria-hidden="true" />
        Petunjuk
      </div>

      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <motion.li
            key={step}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reduce ? undefined : { duration: 0.35, delay: 0.15 + i * 0.45, ease: 'easeOut' }}
            className="flex items-start gap-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-qupu-brand-orange font-display text-sm font-extrabold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 text-base font-semibold leading-relaxed text-qupu-muted">{step}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

/** PUTAR & ULANG showcase: the real player inside a cream card. */
function PutarUlangShowcase() {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-qupu-cream p-4">
      <WmiExplainer slug="count-rectangles-grid" params={{ cols: 3, rows: 3 }} correctAnswer="14" lang="id" />
    </div>
  )
}

/**
 * "Features tour" section (header-less): a vertical list of four SELECTABLE
 * feature buttons on the left that AUTO-ITERATE while the section is in view
 * (pausing on hover), and a showcase panel on the right whose illustration
 * swaps to match the active feature. On mobile they stack.
 */
export default function WmiFeaturesTour() {
  const reduce = useReducedMotion() ?? false
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const autoplaying = !reduce && inView && !paused

  // Auto-iterate through the features while in view (pause on hover / reduced-motion).
  useEffect(() => {
    if (!autoplaying) return
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % FEATURES.length), 3200)
    return () => clearInterval(id)
  }, [autoplaying])

  const showcase = (() => {
    switch (activeIndex) {
      case 1:
        return <DwibahasaShowcase />
      case 2:
        return <HintBertahapShowcase reduce={reduce} />
      case 3:
        return <PutarUlangShowcase />
      case 0:
      default:
        return <WmiAssistedHighlight />
    }
  })()

  return (
    <section ref={ref}>
      <div
        className="grid items-start gap-8 lg:grid-cols-[1fr_1.15fr]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* LEFT: selectable feature list (auto-iterates on scroll) */}
        <ul className="space-y-4">
          {FEATURES.map((f, i) => {
            const active = i === activeIndex
            return (
              <motion.li
                key={f.title}
                initial={reduce ? false : { opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={reduce ? undefined : { duration: 0.4, delay: i * 0.09, ease: 'easeOut' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-pressed={active}
                  className={[
                    'relative flex w-full items-start gap-4 overflow-hidden rounded-[1.5rem] border-[3px] p-4 text-left transition',
                    active
                      ? 'border-qupu-brand-orange bg-white shadow-[3px_4px_0_0_#FFD3B1]'
                      : 'border-transparent bg-white/70 hover:bg-white',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition',
                      active ? 'bg-qupu-brand-orange text-white' : 'bg-qupu-cream text-qupu-brand-orange',
                    ].join(' ')}
                  >
                    <i className={f.icon} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-extrabold text-qupu-brand-blue">{f.title}</div>
                    <p className="mt-0.5 text-sm font-semibold leading-relaxed text-qupu-muted">{f.desc}</p>
                  </div>

                  {active && (
                    <i className="fa-solid fa-chevron-right mt-3 shrink-0 text-qupu-brand-orange" aria-hidden="true" />
                  )}

                  {/* auto-iterate progress bar */}
                  {active && autoplaying && (
                    <span className="absolute inset-x-4 bottom-1.5 h-1 overflow-hidden rounded-full bg-qupu-brand-orange/20">
                      <motion.span
                        key={activeIndex}
                        className="block h-full rounded-full bg-qupu-brand-orange"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.2, ease: 'linear' }}
                      />
                    </span>
                  )}
                </button>
              </motion.li>
            )
          })}
        </ul>

        {/* RIGHT: showcase panel that swaps with the active feature */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: 'easeOut' }}
            >
              {showcase}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
