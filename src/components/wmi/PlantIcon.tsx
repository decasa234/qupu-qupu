import { PLANT_STAGES } from './plantStages'
import type { WmiComprehensionTier } from '../../types/wmi'

interface Props {
  tier: WmiComprehensionTier
  className?: string
}

export default function PlantIcon({ tier, className }: Props) {
  const stage = PLANT_STAGES[tier]

  if (tier === 0) {
    // Tier 0 — seed-with-sprout silhouette (SVG, single-color fill)
    return (
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        style={{ color: stage.fg }}
      >
        {/* Seed bean — tilted ellipse */}
        <ellipse cx="10" cy="15.5" rx="6.5" ry="4.5" transform="rotate(-30 10 15.5)" />
        {/* Sprout stem */}
        <path d="M13.8 11.2 C13.8 8.5 15.5 6.5 17.5 6.0 C17.5 8.8 16.0 10.5 13.8 11.2 Z" />
        {/* Tiny leaf curl */}
        <path d="M13.5 10.8 C11.5 9.0 11.0 6.5 12.5 5.0 C13.8 6.8 13.8 9.0 13.5 10.8 Z" />
      </svg>
    )
  }

  // Tiers 1–4 — Font Awesome glyph
  return (
    <i
      className={`${stage.iconPrefix} ${stage.icon}${stage.iconExtra ? ` ${stage.iconExtra}` : ''}${className ? ` ${className}` : ''}`}
      style={{ color: stage.fg }}
      aria-hidden="true"
    />
  )
}
