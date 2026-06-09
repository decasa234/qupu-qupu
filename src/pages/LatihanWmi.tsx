import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Reveal from '@/components/Reveal'
import WmiBackdrop from '@/components/wmi/marketing/WmiBackdrop'
import WmiChallenge from '@/components/wmi/marketing/WmiChallenge'
import WmiSolution from '@/components/wmi/marketing/WmiSolution'
import WmiFeaturesTour from '@/components/wmi/marketing/WmiFeaturesTour'
import WmiMasteryTree from '@/components/wmi/marketing/WmiMasteryTree'
import WmiTestimonialsMarquee from '@/components/wmi/marketing/WmiTestimonialsMarquee'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** A scatter of brand-yellow star sprinkles for emphasis surfaces. */
function Sprinkles() {
  return (
    <>
      <i className="fa-solid fa-star pointer-events-none absolute left-8 top-9 text-base text-qupu-brand-yellow/80" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-1/4 top-7 text-xs text-qupu-brand-yellow/60" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute left-1/3 bottom-10 text-sm text-qupu-brand-yellow/70" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-10 bottom-14 text-lg text-qupu-brand-yellow/70" aria-hidden="true" />
    </>
  )
}

export default function LatihanWmiPage() {
  const [answered, setAnswered] = useState(false)
  const reduce = useReducedMotion()
  const revealRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)

  // After answering, let the hero feedback play, then glide to the reveal.
  useEffect(() => {
    if (!answered) return
    const t = setTimeout(() => {
      revealRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }, 1100)
    return () => clearTimeout(t)
  }, [answered, reduce])

  // Once the visitor scrolls themselves, never yank them with the auto-scroll.
  useEffect(() => {
    if (!answered) return
    userScrolledRef.current = false
    const mark = () => {
      userScrolledRef.current = true
    }
    window.addEventListener('wheel', mark, { passive: true })
    window.addEventListener('touchmove', mark, { passive: true })
    window.addEventListener('keydown', mark)
    return () => {
      window.removeEventListener('wheel', mark)
      window.removeEventListener('touchmove', mark)
      window.removeEventListener('keydown', mark)
    }
  }, [answered])

  // When the Penjelasan animations finish, glide down to the features tour.
  const scrollToFeatures = useCallback(() => {
    if (userScrolledRef.current) return
    featuresRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [reduce])

  return (
    <div className="relative">
      <WmiBackdrop />

      <div className="relative space-y-14 sm:space-y-20">
        {/* 1 · Challenge hook (page header) */}
        <WmiChallenge onAnswer={() => setAnswered(true)} />

        {/* 2 · Unwrapped after answering: Problem solve -> Features tour -> Level up */}
        <AnimatePresence initial={false}>
          {answered && (
            <motion.div
              key="reveal"
              ref={revealRef}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
              className="scroll-mt-24 space-y-14 sm:space-y-20"
            >
              <Reveal delay={0.05}>
                <WmiSolution onDone={scrollToFeatures} />
              </Reveal>
              <div ref={featuresRef}>
                <WmiFeaturesTour />
              </div>
              <Reveal delay={0.05}>
                <section className="mx-auto max-w-5xl rounded-[2.5rem] bg-qupu-cream px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14">
                  <WmiMasteryTree />
                </section>
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 · Testimonials marquee */}
        <Reveal delay={0.05}>
          <WmiTestimonialsMarquee />
        </Reveal>

        {/* 4 · Closing CTA */}
        <Reveal delay={0.05}>
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-14 text-center text-white shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-16">
            <Sprinkles />
            <img
              src="/subs-mascot.png"
              alt=""
              draggable={false}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 -left-3 hidden h-36 w-auto select-none drop-shadow-[0_12px_26px_rgba(0,0,0,0.25)] lg:block"
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Jadi salah satu{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-qupu-brand-yellow">keluarga pertama</span>
                  <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-full bg-white/15" aria-hidden="true" />
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-relaxed text-white/90 sm:text-base">
                Coba Latihan WMI gratis hari ini. Tidak perlu kartu kredit.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center gap-3 rounded-full bg-qupu-brand-orange px-7 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                    <i className="fa-solid fa-user-plus text-qupu-brand-orange" aria-hidden="true" />
                  </span>
                  Daftar Gratis
                </Link>
                <Link
                  to="/harga"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border-[3px] border-white bg-white/10 px-6 py-[10px] font-display text-base font-extrabold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:text-qupu-brand-blue"
                >
                  <i className="fa-solid fa-tag" aria-hidden="true" />
                  Lihat Harga
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
