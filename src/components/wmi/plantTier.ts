// src/components/wmi/plantTier.ts
//
// Single source of truth for the tier (0-4) → plant presentation used by the
// Belajar path nodes and sheets. Thin facade over PLANT_STAGES (plantStages.ts)
// so the garden visuals (PlantIcon, ceremony, showcase) and the skill-tree
// path can never drift apart.

import { PLANT_STAGES } from './plantStages'
import type { WmiComprehensionTier } from '../../types/wmi'

export interface PlantTier {
  /** Full Font Awesome class, e.g. "fa-solid fa-seedling". */
  icon: string
  /** Icon foreground color (hex). */
  color: string
  /** Tile background color (hex). */
  bg: string
  /** Indonesian tier label: Belum dimulai / Baru belajar / Berlatih / Mahir / Dikuasai. */
  label: string
  /** Tier 4 carries the little mastery crown. */
  crown: boolean
}

export function plantForTier(tier: WmiComprehensionTier): PlantTier {
  const stage = PLANT_STAGES[tier]
  return {
    icon: `${stage.iconPrefix} ${stage.icon}`,
    color: stage.fg,
    bg: stage.bg,
    label: stage.labelId,
    crown: !!stage.crown,
  }
}
