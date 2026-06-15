import { PLANT_STAGES } from './plantStages'
import type { WmiComprehensionTier } from '../../types/wmi'

interface Props {
  tier: WmiComprehensionTier
  className?: string
}

// Tier (0-4) → Font Awesome plant glyph. Tier 0 is a pale sprout (see
// PLANT_STAGES) rather than the old custom seed silhouette.
export default function PlantIcon({ tier, className }: Props) {
  const stage = PLANT_STAGES[tier]
  return (
    <i
      className={`${stage.iconPrefix} ${stage.icon}${stage.iconExtra ? ` ${stage.iconExtra}` : ''}${className ? ` ${className}` : ''}`}
      style={{ color: stage.fg }}
      aria-hidden="true"
    />
  )
}
