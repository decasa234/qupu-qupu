import { TESTIMONIALS } from '@/data/wmiMarketing'

export default function WmiTestimonials() {
  if (TESTIMONIALS.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl">
      <h2 className="text-center font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
        Kata Orang Tua
      </h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            className="rounded-[1.75rem] border-[3px] border-qupu-peach bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.08)]"
          >
            <blockquote className="text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-4 text-xs font-bold text-qupu-muted">
              {t.author} · {t.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
