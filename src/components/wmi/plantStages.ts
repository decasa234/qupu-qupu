import type { WmiComprehensionTier } from '../../types/wmi'

export interface PlantStage {
  icon: string        // Font Awesome class suffix (e.g. 'fa-tree')
  iconPrefix: string  // Font Awesome prefix ('fa-solid' or 'fa-regular')
  bg: string          // tile background hex
  fg: string          // icon color hex
  /** Solid darker shade of `bg` — the 3D "side" of the path-node button. */
  rimHex: string
  labelId: string
  /** Extra classes appended to the <i> tag (e.g. to shrink the seed dot). */
  iconExtra?: string
  dashed?: boolean
  crown?: boolean
}

export const PLANT_STAGES: Record<WmiComprehensionTier, PlantStage> = {
  // Tier 0 — un-grown plot: an egg waiting to hatch. Reads as "ready to
  // grow"; the faded fg + tan soil bg set it apart from the vivid tier-1
  // sprout.
  0: { iconPrefix: 'fa-solid', icon: 'fa-egg', bg: '#EFE6D6', fg: '#C0A98A', rimHex: '#D9CCB4', labelId: 'Belum dimulai', dashed: true },
  1: { iconPrefix: 'fa-solid',   icon: 'fa-seedling', bg: '#E4F3D6', fg: '#5A8A2E', rimHex: '#C4DCA8', labelId: 'Baru belajar' },
  2: { iconPrefix: 'fa-solid',   icon: 'fa-leaf',     bg: '#BCE39A', fg: '#3F7A18', rimHex: '#9AC276', labelId: 'Berlatih' },
  3: { iconPrefix: 'fa-solid',   icon: 'fa-tree',     bg: '#58A700', fg: '#FFFFFF', rimHex: '#3F7A18', labelId: 'Mahir' },
  4: { iconPrefix: 'fa-solid',   icon: 'fa-tree',     bg: '#ffdd55', fg: '#30598A', rimHex: '#E3B93E', labelId: 'Dikuasai', crown: true },
}
