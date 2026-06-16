import { Suspense, lazy, useMemo } from 'react'
import { VISUALS } from '../../wmi/PastPapers/WMI/registry'
import WmiExplainer from '../../wmi/WmiExplainer'
import { bi, type Lang } from './textUtil'

interface WorkedBlockData {
  source: 'paper'
  code: string
  caption_en?: string
  caption_id?: string
}

/**
 * Embeds an existing past-paper question's animated illustration + explainer as
 * a concrete worked example, reusing the exact components the drill renders.
 * Paper explainers are self-contained (their solution data is hardcoded), so we
 * pass empty params/answer. Falls back gracefully when the code isn't registered.
 */
export default function WorkedBlock({ block, lang }: { block: WorkedBlockData; lang: Lang }) {
  const entry = VISUALS[block.code]
  const Illustration = useMemo(
    () => (entry?.illustration ? lazy(entry.illustration) : null),
    [entry],
  )
  const Explainer = useMemo(() => (entry?.explainer ? lazy(entry.explainer) : null), [entry])

  const caption = bi(lang, block.caption_en, block.caption_id)

  return (
    <section className="rounded-2xl border-2 border-qupu-brand-orange/25 bg-[#FFF8F0] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-qupu-brand-orange text-[11px] text-white">
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
          {lang === 'en' ? 'Worked example' : 'Contoh dikerjakan'}
        </span>
      </div>

      {caption && (
        <p className="mb-3 text-sm font-semibold leading-relaxed text-qupu-brand-blue/85">{caption}</p>
      )}

      {!entry ? (
        <p className="rounded-xl bg-qupu-shell px-3 py-2 text-xs font-semibold text-qupu-muted">
          {lang === 'en' ? 'Example unavailable.' : 'Contoh belum tersedia.'}
        </p>
      ) : (
        <Suspense
          fallback={
            <div className="flex items-center justify-center rounded-xl bg-white py-8 text-qupu-muted">
              <i className="fa-solid fa-spinner fa-spin text-lg" aria-hidden="true" />
            </div>
          }
        >
          {Illustration && (
            <div className="mb-3 flex justify-center rounded-xl bg-white p-3">
              <Illustration />
            </div>
          )}
          {Explainer && (
            <WmiExplainer explainer={Explainer} params={{}} correctAnswer="" lang={lang} />
          )}
        </Suspense>
      )}
    </section>
  )
}
