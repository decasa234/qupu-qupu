import { useEffect, useRef, useState } from 'react'
import { fetchConceptNext } from '../../lib/wmiApi'
import type { WmiGardenConcept, WmiGrade } from '../../types/wmi'
import { PLANT_STAGES } from './plantStages'
import { tagLabel } from './tagLabels'

interface Props {
  childId: string
  grade: WmiGrade
  concept: WmiGardenConcept
  onClose: () => void
}

export default function ConceptInfoModal({ childId, grade, concept, onClose }: Props) {
  const stage = PLANT_STAGES[concept.tier]
  const [tip, setTip] = useState<string | null>(null)
  const [tipLoading, setTipLoading] = useState(true)

  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setTipLoading(true)
    setTip(null)

    fetchConceptNext(childId, grade, concept.slug)
      .then((q) => {
        if (cancelledRef.current) return
        setTip(q.hint_id ?? q.hint_en ?? 'Kerjakan langkah demi langkah.')
      })
      .catch(() => {
        if (cancelledRef.current) return
        setTip('Kerjakan langkah demi langkah.')
      })
      .finally(() => {
        if (!cancelledRef.current) setTipLoading(false)
      })

    return () => {
      cancelledRef.current = true
    }
  }, [childId, grade, concept.slug])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.75rem] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="flex items-center gap-3">
          <span
            className={`relative flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[16px] border-2 text-[22px] ${stage.dashed ? 'border-dashed border-black/20' : 'border-black/10'}`}
            style={{ background: stage.bg, color: stage.fg }}
          >
            <i className={`${stage.iconPrefix} ${stage.icon}${stage.iconExtra ? ` ${stage.iconExtra}` : ''}`} aria-hidden="true" />
            {stage.crown && (
              <i
                className="fa-solid fa-crown absolute -right-1.5 -top-2 text-[13px] text-qupu-orange"
                aria-hidden="true"
              />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-black leading-tight text-qupu-brand-blue">
              {concept.nameId}
            </div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-qupu-muted">
              {stage.labelId}
            </div>
          </div>
        </div>

        {/* Comprehension bar */}
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${concept.pct}%`, background: '#58A700' }}
          />
        </div>

        {/* Meta line */}
        <div className="mt-1.5 text-[11px] font-bold text-qupu-muted">
          {concept.pct}% &middot; {concept.attempts} dikerjakan &middot; {concept.correct} benar
        </div>

        {/* Tag chips */}
        {concept.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {concept.tags.map((tag) => {
              const t = tagLabel(tag)
              return (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
                  style={{ background: `${t.color_hex}1A`, color: t.color_hex }}
                >
                  {t.name_id}
                </span>
              )
            })}
          </div>
        )}

        {/* Tip card */}
        <div className="mt-4 rounded-[1rem] bg-[#FFF9F4] p-3.5 ring-1 ring-[#FFE3CC]">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#FFD3B1] text-[11px] text-qupu-brand-orange">
              <i className="fa-solid fa-lightbulb" aria-hidden="true" />
            </span>
            <div className="text-[12px] font-semibold leading-snug text-[#3A4A63]">
              {tipLoading ? (
                <span className="text-qupu-muted">Memuat tips&hellip;</span>
              ) : (
                tip
              )}
            </div>
          </div>
        </div>

        {/* Tutup button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-qupu-brand-blue py-3 font-display text-[14px] font-black text-white shadow-[0_4px_0_0_#0E1430] transition-transform active:translate-y-0.5"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
