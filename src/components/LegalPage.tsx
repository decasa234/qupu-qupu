import Reveal from './Reveal'

/**
 * Shared shell for public legal pages (/privasi, /ketentuan): centered prose
 * column, eyebrow + display heading, then one white card with numbered
 * sections. Follows the standard-card archetype (3px brand-blue/15 border,
 * hard peach drop shadow).
 */
export default function LegalPage({
  eyebrow,
  title,
  updatedAt,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  updatedAt: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <Reveal>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm font-semibold text-qupu-muted">Diperbarui: {updatedAt}</p>
          <p className="mt-4 text-sm font-medium leading-relaxed text-qupu-muted sm:text-base">
            {intro}
          </p>
        </header>
      </Reveal>

      <Reveal delay={0.05}>
        <article className="space-y-8 rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-8">
          {children}
        </article>
      </Reveal>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold text-qupu-brand-blue">{title}</h2>
      {children}
    </section>
  )
}

export function LegalText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium leading-relaxed text-qupu-muted sm:text-base">{children}</p>
  )
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-qupu-muted sm:text-base">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}
