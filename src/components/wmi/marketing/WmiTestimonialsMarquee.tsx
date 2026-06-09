import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { TESTIMONIALS, type Testimonial } from '@/data/wmiMarketing'

const LOOP_DURATION = 35

function TestimonialCard({ quote, author, role }: Testimonial) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col rounded-[1.75rem] border-[3px] border-qupu-peach bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.08)] sm:w-[340px]">
      <i className="fa-solid fa-quote-left mb-3 text-2xl text-qupu-brand-orange" aria-hidden="true" />
      <blockquote className="text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">
        {quote}
      </blockquote>
      <figcaption className="mt-4 text-xs font-bold text-qupu-muted">
        {author} · {role}
      </figcaption>
    </figure>
  )
}

function SectionHeader() {
  return (
    <header className="mb-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-brand-orange">
        Kata mereka
      </p>
      <h2 className="mt-2 font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">
        Apa kata orang tua &amp; guru
      </h2>
    </header>
  )
}

export default function WmiTestimonialsMarquee() {
  const reduceMotion = useReducedMotion()
  const controls = useAnimationControls()
  const [paused, setPaused] = useState(false)
  const [draggable, setDraggable] = useState(false)

  const isEmpty = TESTIMONIALS.length === 0

  const start = useCallback(() => {
    controls.start({
      x: ['0%', '-50%'],
      transition: { duration: LOOP_DURATION, ease: 'linear', repeat: Infinity },
    })
  }, [controls])

  useEffect(() => {
    if (reduceMotion || isEmpty) return
    if (paused) {
      controls.stop()
    } else {
      start()
    }
  }, [reduceMotion, isEmpty, paused, start, controls])

  if (isEmpty) return null

  const items = [...TESTIMONIALS, ...TESTIMONIALS]

  if (reduceMotion) {
    return (
      <section className="py-4">
        <SectionHeader />
        <div className="relative">
          <div className="flex gap-5 overflow-x-auto px-4 pb-2">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={`${t.author}-${i}`} {...t} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4">
      <SectionHeader />
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className="flex w-max gap-5"
          style={{ cursor: draggable ? 'grabbing' : 'grab' }}
          animate={controls}
          drag="x"
          dragElastic={0.08}
          dragConstraints={{ left: -2000, right: 0 }}
          onDragStart={() => {
            setDraggable(true)
            setPaused(true)
          }}
          onDragEnd={() => {
            setDraggable(false)
            setPaused(false)
          }}
        >
          {items.map((t, i) => (
            <TestimonialCard key={`${t.author}-${i}`} {...t} />
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-qupu-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-qupu-cream to-transparent" />
      </div>
    </section>
  )
}
