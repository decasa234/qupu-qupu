import type { WmiComprehensionTier } from '../../types/wmi'

export interface PlantStage {
  icon: string        // Font Awesome class suffix (e.g. 'fa-tree')
  iconPrefix: string  // Font Awesome prefix ('fa-solid' or 'fa-regular')
  bg: string          // tile background hex
  fg: string          // icon color hex
  labelId: string
  /** Extra classes appended to the <i> tag (e.g. to shrink the seed dot). */
  iconExtra?: string
  dashed?: boolean
  crown?: boolean
}

export const PLANT_STAGES: Record<WmiComprehensionTier, PlantStage> = {
  // Tier 0 — planted seed: a small filled brown dot on a warm soil background.
  // Using fa-solid fa-circle (fully filled) in seed-brown so it looks like a
  // buried seed, not the old hollow ring (fa-regular fa-circle).
  0: { iconPrefix: 'fa-solid', icon: 'fa-circle', iconExtra: 'text-[0.55em]', bg: '#F5E6D3', fg: '#8B5E34', labelId: 'Belum dimulai', dashed: true },
  1: { iconPrefix: 'fa-solid',   icon: 'fa-seedling', bg: '#E4F3D6', fg: '#5A8A2E', labelId: 'Baru belajar' },
  2: { iconPrefix: 'fa-solid',   icon: 'fa-leaf',     bg: '#BCE39A', fg: '#3F7A18', labelId: 'Berlatih' },
  3: { iconPrefix: 'fa-solid',   icon: 'fa-tree',     bg: '#58A700', fg: '#FFFFFF', labelId: 'Mahir' },
  4: { iconPrefix: 'fa-solid',   icon: 'fa-tree',     bg: '#ffdd55', fg: '#30598A', labelId: 'Dikuasai', crown: true },
}
