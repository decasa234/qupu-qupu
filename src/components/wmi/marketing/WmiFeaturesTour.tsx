import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { COUNT_SQUARES_QUESTION } from '@/data/wmiMarketing'
import WmiAssistedHighlight from '@/components/wmi/marketing/WmiAssistedHighlight'
import WmiExplainer from '@/components/wmi/WmiExplainer'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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

function Showcase({ index, reduce }: { index: number; reduce: boolean }) {
  switch (index) {
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
}

/** One row in the feature rail. `onSelect` is undefined in the static fallback. */
function FeatureItem({
  feature,
  index,
  active,
  onSelect,
}: {
  feature: FeatureRow
  index: number
  active: boolean
  onSelect?: (i: number) => void
}) {
  const inner = (
    <>
      <span
        className={[
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition',
          active ? 'bg-qupu-brand-orange text-white' : 'bg-qupu-cream text-qupu-brand-orange',
        ].join(' ')}
      >
        <i className={feature.icon} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-base font-extrabold text-qupu-brand-blue">{feature.title}</div>
        <p className="mt-0.5 text-sm font-semibold leading-relaxed text-qupu-muted">{feature.desc}</p>
      </div>
      {active && (
        <i className="fa-solid fa-chevron-right mt-3 shrink-0 text-qupu-brand-orange" aria-hidden="true" />
      )}
    </>
  )

  const cls = [
    'flex w-full items-start gap-4 rounded-[1.5rem] border-[3px] p-4 text-left transition-all duration-300',
    active
      ? 'border-qupu-brand-orange bg-white shadow-[3px_4px_0_0_#FFD3B1]'
      : 'border-transparent bg-white/70',
  ].join(' ')

  if (!onSelect) return <div className={cls}>{inner}</div>
  return (
    <button type="button" onClick={() => onSelect(index)} aria-pressed={active} className={cls + ' hover:bg-white'}>
      {inner}
    </button>
  )
}

/** True while the viewport is at least `px` wide (live-updating). */
function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatch(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return match
}

/**
 * "Features tour" (header-less). On large screens it's a SCROLL-PINNED,
 * full-bleed section: the card stays centered and full-height while you scroll,
 * and scrolling down/up steps forward/back through the features (the showcase
 * swaps to match). On small screens or with reduced-motion it degrades to a
 * plain stacked list (no scroll-jacking).
 */
export default function WmiFeaturesTour() {
  const reduce = useReducedMotion() ?? false
  const isDesktop = useMinWidth(1024)
  const pinned = isDesktop && !reduce

  const ref = useRef<HTMLDivElement>(null)
  const idxRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dir, setDir] = useState(1)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.max(0, Math.min(FEATURES.length - 1, Math.floor(p * FEATURES.length)))
    if (i !== idxRef.current) {
      setDir(i > idxRef.current ? 1 : -1)
      idxRef.current = i
      setActiveIndex(i)
    }
  })

  // Click a feature -> smooth-scroll to the middle of its scroll band.
  const jump = (i: number) => {
    const el = ref.current
    if (!el) return
    const range = el.offsetHeight - window.innerHeight
    if (range <= 0) return
    const p = (i + 0.5) / FEATURES.length
    const top = el.getBoundingClientRect().top + window.scrollY + p * range
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Fallback: plain stacked list, each feature with its showcase. No pinning.
  if (!pinned) {
    return (
      <section className="space-y-10">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="space-y-4">
            <FeatureItem feature={f} index={i} active />
            <Showcase index={i} reduce={reduce} />
          </div>
        ))}
      </section>
    )
  }

  return (
    <div ref={ref} className="relative ml-[calc(50%-50vw)] w-screen" style={{ height: `${FEATURES.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          {/* LEFT: scroll progress + feature rail */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-display text-sm font-extrabold text-qupu-brand-orange">
                Fitur {activeIndex + 1}
                <span className="text-qupu-brand-blue/40"> / {FEATURES.length}</span>
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-qupu-brand-orange/15">
                <motion.span
                  className="block h-full origin-left rounded-full bg-qupu-brand-orange"
                  style={{ scaleX: scrollYProgress }}
                />
              </span>
            </div>

            <ul className="space-y-3">
              {FEATURES.map((f, i) => (
                <li key={f.title}>
                  <FeatureItem feature={f} index={i} active={i === activeIndex} onSelect={jump} />
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-qupu-muted">
              <motion.i
                className="fa-solid fa-arrow-down-long text-qupu-brand-orange"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              />
              Gulir untuk melihat tiap fitur bekerja
            </p>
          </div>

          {/* RIGHT: showcase that steps with scroll direction */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={activeIndex}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 32 : -32 }),
                  center: { opacity: 1, y: 0 },
                  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -32 : 32 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: EASE }}
              >
                <Showcase index={activeIndex} reduce={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
