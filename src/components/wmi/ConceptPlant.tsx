import { PLANT_STAGES } from './plantStages'
import type { WmiGardenConcept } from '../../types/wmi'

interface Props {
  concept: WmiGardenConcept
  disabled?: boolean
  onClick: (concept: WmiGardenConcept) => void
}

export default function ConceptPlant({ concept, disabled, onClick }: Props) {
  const stage = PLANT_STAGES[concept.tier]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(concept)}
      className="flex w-16 flex-shrink-0 flex-col items-center text-center disabled:opacity-60"
    >
      <span
        className={`relative flex h-[60px] w-[60px] items-center justify-center rounded-[18px] border-2 text-[25px] border-black/10 ${stage.dashed ? 'border-dashed' : ''}`}
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
      <span className="mt-1.5 text-[9.5px] font-bold leading-tight text-[#3A4A63]">{concept.nameId}</span>
    </button>
  )
}
