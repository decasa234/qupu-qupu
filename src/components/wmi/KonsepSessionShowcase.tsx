import { PLANT_STAGES } from './plantStages'
import PlantIcon from './PlantIcon'
import { tagLabel } from './tagLabels'
import type { WmiComprehensionTier } from '../../types/wmi'

interface ShowcaseConcept {
  nameId: string
  tier: WmiComprehensionTier
  tags: string[]
}

interface Props {
  concept: ShowcaseConcept
}

export default function KonsepSessionShowcase({ concept }: Props) {
  const stage = PLANT_STAGES[concept.tier]

  return (
    <div className="mx-auto w-full max-w-[460px] px-1">
      {/* Showcase band — flat, no card framing */}
      <div className="flex items-center gap-2.5">
        {/* Plant tile — animated with subtle watering bob */}
        <span
          className={`relative flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[13px] border-2 text-[19px] ${stage.dashed ? 'border-dashed border-black/20' : 'border-black/10'}`}
          style={{ background: stage.bg, color: stage.fg }}
        >
          {/* Water droplet that drips down on loop */}
          <span
            className="animate-drop-drip pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-sky-400"
            aria-hidden="true"
          >
            <i className="fa-solid fa-droplet" />
          </span>

          <PlantIcon tier={concept.tier} className="animate-plant-bob" />
          {stage.crown && (
            <i
              className="fa-solid fa-crown absolute -right-1.5 -top-2 text-[11px] text-qupu-orange"
              aria-hidden="true"
            />
          )}
        </span>

        {/* Text block */}
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-extrabold uppercase tracking-widest text-qupu-brand-orange">
            Menumbuhkan
          </div>
          <div className="font-display text-[13px] font-black leading-tight text-qupu-brand-blue">
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
        </div>
      </div>
    </div>
  )
}
