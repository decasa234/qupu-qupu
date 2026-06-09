import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion'
import { TESTIMONIALS, type Testimonial } from '@/data/wmiMarketing'

const SPEED = 42 // px per second — slow, calm drift

function TestimonialCard({ quote, author, role }: Testimonial) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col rounded-[1.75rem] border-[3px] border-qupu-peach bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.08)] sm:w-[340px]">
      <i className="fa-solid fa-quote-left mb-3 text-2xl text-qupu-brand-orange" aria-hidden="true" />
      <blockquote className="text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">{quote}</blockquote>
      <figcaption className="mt-4 text-xs font-bold text-qupu-muted">
        {author} · {role}
      </figcaption>
    </figure>
  )
}

function SectionHeader() {
  return (
    <header className="mb-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-brand-orange">Kata mereka</p>
      <h2 className="mt-2 font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">
        Apa kata orang tua &amp; guru
      </h2>
    </header>
  )
}

/**
 * Smooth infinite testimonials marquee. A continuous rAF loop drives a single
 * motion value (so pausing holds position and resuming never snaps back to the
 * start), the wrap distance is measured exactly for a seamless loop, and the
 * track is draggable (drag pauses the loop, then resumes from where it lands).
 */
export default function WmiTestimonialsMarquee() {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef(0) // exact distance of one full set (for a seamless wrap)
  const draggingRef = useRef(false)
  const [paused, setPaused] = useState(false)

  const isEmpty = TESTIMONIALS.length === 0

  // Measure the seamless wrap distance = left-offset of the first duplicated card.
  useEffect(() => {
    if (isEmpty) return
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      const first = track.children[0] as HTMLElement | undefined
      const dup = track.children[TESTIMONIALS.length] as HTMLElement | undefined
      if (first && dup) wrapRef.current = dup.offsetLeft - first.offsetLeft
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [isEmpty])

  useAnimationFrame((_, delta) => {
    if (reduce || paused || draggingRef.current) return
    const wrap = wrapRef.current
    if (!wrap) return
    let next = x.get() - (SPEED * delta) / 1000
    while (next <= -wrap) next += wrap
    while (next > 0) next -= wrap
    x.set(next)
  })

  if (isEmpty) return null
  const items = [...TESTIMONIALS, ...TESTIMONIALS]

  if (reduce) {
    return (
      <section className="py-4">
        <SectionHeader />
        <div className="flex gap-5 overflow-x-auto px-4 pb-2">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={`${t.author}-${i}`} {...t} />
          ))}
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
          ref={trackRef}
          className="flex w-max cursor-grab gap-5 [will-change:transform] active:cursor-grabbing"
          style={{ x }}
          drag="x"
          dragElastic={0.04}
          dragMomentum={false}
          onDragStart={() => {
            draggingRef.current = true
          }}
          onDragEnd={() => {
            draggingRef.current = false
            const wrap = wrapRef.current
            if (wrap) {
              let v = x.get() % wrap
              if (v > 0) v -= wrap
              x.set(v)
            }
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
