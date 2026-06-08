import { PLANT_STAGES } from './plantStages'
import { tagLabel } from './tagLabels'
import type { WmiComprehensionTier } from '../../types/wmi'

interface ShowcaseConcept {
  nameId: string
  tier: WmiComprehensionTier
  pct: number
  tags: string[]
}

interface Props {
  concept: ShowcaseConcept
  answered: number
  total: number
}

export default function KonsepSessionShowcase({ concept, answered, total }: Props) {
  const stage = PLANT_STAGES[concept.tier]
  const progressPct = total > 0 ? Math.round((answered / total) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-3 px-1">
      {/* Progress counter + bar */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="font-display text-[12px] font-bold text-qupu-muted">
            Soal {answered} / {total}
          </span>
          <span className="font-display text-[12px] font-black text-qupu-brand-blue">
            {progressPct}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6BCC2A 0%, #58A700 100%)',
            }}
          />
        </div>
      </div>

      {/* Showcase band */}
      <div className="rounded-[1.5rem] bg-white p-3.5 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        <div className="flex items-center gap-3">
          {/* Plant tile */}
          <span
            className={`relative flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[16px] border-2 text-[22px] ${stage.dashed ? 'border-dashed border-black/20' : 'border-black/10'}`}
            style={{ background: stage.bg, color: stage.fg }}
          >
            <i className={`${stage.iconPrefix} ${stage.icon}`} aria-hidden="true" />
            {stage.crown && (
              <i
                className="fa-solid fa-crown absolute -right-1.5 -top-2 text-[13px] text-qupu-orange"
                aria-hidden="true"
              />
            )}
          </span>

          {/* Text block */}
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-extrabold uppercase tracking-widest text-qupu-brand-orange">
              Sedang Menumbuhkan
            </div>
            <div className="font-display text-[14px] font-black leading-tight text-qupu-brand-blue">
              {concept.nameId}
            </div>

            {/* Tag chips */}
            {concept.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {concept.tags.map((tag) => {
                  const t = tagLabel(tag)
                  return (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${t.color_hex}1A`, color: t.color_hex }}
                    >
                      {t.name_id}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Mini growth bar */}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1E4CC]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${concept.pct}%`, background: '#58A700' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
