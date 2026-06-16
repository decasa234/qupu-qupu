import { useEffect } from 'react'
import { useWmiStore } from '../../../store/wmiStore'
import { bi, Paragraphs, type Lang } from './textUtil'

interface GlossaryBlockData {
  term_slugs: string[]
  intro_en?: string
  intro_id?: string
}

export default function GlossaryBlock({ block, lang }: { block: GlossaryBlockData; lang: Lang }) {
  const { glossary, glossaryLoaded, loadGlossary } = useWmiStore()

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  const terms = block.term_slugs.map((s) => glossary[s]).filter(Boolean)
  const intro = bi(lang, block.intro_en, block.intro_id)

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-qupu-brand-orange text-[11px] text-white">
          <i className="fa-solid fa-book" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
          {lang === 'en' ? 'Words to know' : 'Kosakata penting'}
        </span>
      </div>

      {intro && (
        <div className="mb-3 space-y-1.5 text-sm font-semibold leading-relaxed text-qupu-muted">
          <Paragraphs text={intro} />
        </div>
      )}

      {terms.length === 0 ? (
        <p className="rounded-xl bg-qupu-shell px-3 py-2 text-xs font-semibold text-qupu-muted">
          {glossaryLoaded
            ? lang === 'en' ? 'No terms available.' : 'Belum ada kosakata.'
            : lang === 'en' ? 'Loading words…' : 'Memuat kosakata…'}
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {terms.map((term) => {
            const definition = bi(lang, term.definition_en, term.definition_id)
            const example = bi(lang, term.example_en ?? undefined, term.example_id ?? undefined)
            return (
              <div
                key={term.slug}
                className="rounded-2xl border-2 border-qupu-brand-orange/20 bg-[#FFF8F0] p-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-base font-black text-qupu-brand-blue">
                    {lang === 'en' ? term.term_en : term.term_id}
                  </span>
                  <span className="text-[11px] font-bold text-qupu-muted">
                    {lang === 'en' ? term.term_id : term.term_en}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-snug text-qupu-brand-blue/85">{definition}</p>
                {example && (
                  <p className="mt-1 text-xs font-semibold italic text-qupu-muted">
                    <i className="fa-solid fa-quote-left mr-1 text-[9px]" aria-hidden="true" />
                    {example}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
