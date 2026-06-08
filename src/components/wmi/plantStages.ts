import type { WmiComprehensionTier } from '../../types/wmi'

export interface PlantStage {
  icon: string        // Font Awesome class suffix (e.g. 'fa-tree')
  iconPrefix: string  // Font Awesome prefix ('fa-solid' or 'fa-regular')
  bg: string          // tile background hex
  fg: string          // icon color hex
  labelId: string
  dashed?: boolean
  crown?: boolean
}

export const PLANT_STAGES: Record<WmiComprehensionTier, PlantStage> = {
  0: { iconPrefix: 'fa-regular', icon: 'fa-circle',   bg: '#FFF9F4', fg: '#C2C8D2', labelId: 'Belum dimulai', dashed: true },
  1: { iconPrefix: 'fa-solid',   icon: 'fa-seedling', bg: '#E4F3D6', fg: '#5A8A2E', labelId: 'Baru belajar' },
  2: { iconPrefix: 'fa-solid',   icon: 'fa-leaf',     bg: '#BCE39A', fg: '#3F7A18', labelId: 'Berlatih' },
  3: { iconPrefix: 'fa-solid',   icon: 'fa-tree',     bg: '#58A700', fg: '#FFFFFF', labelId: 'Mahir' },
  4: { iconPrefix: 'fa-solid',   icon: 'fa-tree',     bg: '#ffdd55', fg: '#30598A', labelId: 'Dikuasai', crown: true },
}
