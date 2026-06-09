import { useState } from 'react'
import { COUNT_SQUARES_QUESTION } from '@/data/wmiMarketing'
import WmiLanguageToggle from '@/components/wmi/WmiLanguageToggle'
import WmiBreakdownToggle from '@/components/wmi/WmiBreakdownToggle'
import WmiAuthoredBreakdown from '@/components/wmi/WmiAuthoredBreakdown'
import CountRectanglesGridIllustration from '@/components/wmi/concepts/count-rectangles-grid'

/**
 * Faithful recreation of the real product question card for the marketing
 * "Features tour" — demonstrates ASSISTED HIGHLIGHTING + BILINGUAL support.
 *
 * Layout mirrors the product `WmiQuestionView` card: white card, p-6, rounded
 * surface, soft shadow. Uses the real toggles, the real authored-breakdown
 * highlighter, and the real count-squares illustration. Read-only showcase:
 * the answer row is inert (disabled input + disabled submit).
 */
export default function WmiAssistedHighlight() {
  const [lang, setLang] = useState<'en' | 'id'>('id')
  const [active, setActive] = useState(true)

  const body = lang === 'en' ? COUNT_SQUARES_QUESTION.bodyEn : COUNT_SQUARES_QUESTION.bodyId

  // Plain (non-breakdown) sentence: drop the leading "Find:" / "Cari:" label by
  // splitting on the paragraph break and keeping the question part.
  const parts = body.split('\n\n')
  const questionPart = parts.length > 1 ? parts[parts.length - 1] : body
  const plainSentence = questionPart.replace(/^\s*(Find|Cari)\s*:\s*/i, '').trim()

  return (
    <article className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-soft">
      {/* Top row: label + question code | toggles */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-qupu-muted">QUESTION</div>
          <div className="mt-0.5 font-display text-xl font-extrabold text-qupu-brand-blue">Soal 1</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <WmiLanguageToggle lang={lang} onToggle={() => setLang((l) => (l === 'en' ? 'id' : 'en'))} />
          <WmiBreakdownToggle active={active} onToggle={() => setActive((v) => !v)} />
        </div>
      </div>

      {/* Body: authored breakdown (highlighting) when active, plain sentence otherwise */}
      {active ? (
        <WmiAuthoredBreakdown breakdown={COUNT_SQUARES_QUESTION.breakdown} text={body} lang={lang} pulseHint />
      ) : (
        <p className="mt-4 rounded-xl border border-black/5 bg-qupu-cream/60 px-4 py-3 text-lg leading-relaxed text-qupu-ink">
          {plainSentence}
        </p>
      )}

      {/* Illustration: real 3x3 count-squares grid */}
      <CountRectanglesGridIllustration
        params={{ cols: COUNT_SQUARES_QUESTION.grid.cols, rows: COUNT_SQUARES_QUESTION.grid.rows }}
      />

      {/* Answer row (read-only showcase): inert input + disabled submit */}
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <div
          aria-hidden="true"
          className="flex min-w-0 flex-1 cursor-not-allowed select-none items-center rounded-lg border-2 border-qupu-peach bg-qupu-cream/40 px-3 py-2 text-base text-qupu-muted"
        >
          Jawaban
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          tabIndex={-1}
          className="cursor-not-allowed rounded-lg bg-qupu-brand-blue px-4 py-2 font-bold text-white opacity-50"
        >
          Submit
        </button>
      </div>
    </article>
  )
}
