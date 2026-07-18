export interface TrackStage {
  icon: string        // FA suffix, e.g. 'fa-tree'
  iconPrefix: string  // 'fa-solid'
  bg: string
  fg: string
  rimHex: string      // solid side-rim color (darker shade of bg)
  labelId: string
  /** Render the three-tree forest face instead of a single icon. */
  forest?: boolean
}

export interface TrackThemePack {
  key: string
  /** Exactly 6 stages, index = level 0..5 (5 = gold). */
  stages: readonly [TrackStage, TrackStage, TrackStage, TrackStage, TrackStage, TrackStage]
  trailColor: string       // path stroke, e.g. '#FFD3B1'
  mapNameId: string        // copy token, e.g. 'Kebun'
}

const FOREST_PACK: TrackThemePack = {
  key: 'forest',
  stages: [
    // Level 0: egg — un-grown plot
    {
      iconPrefix: 'fa-solid',
      icon: 'fa-egg',
      bg: '#EFE6D6',
      fg: '#C0A98A',
      rimHex: '#D9CCB4',
      labelId: 'Belum dimulai',
    },
    // Level 1: seedling
    {
      iconPrefix: 'fa-solid',
      icon: 'fa-seedling',
      bg: '#E4F3D6',
      fg: '#5A8A2E',
      rimHex: '#C4DCA8',
      labelId: 'Baru belajar',
    },
    // Level 2: leaf
    {
      iconPrefix: 'fa-solid',
      icon: 'fa-leaf',
      bg: '#BCE39A',
      fg: '#3F7A18',
      rimHex: '#9AC276',
      labelId: 'Berlatih',
    },
    // Level 3: tree
    {
      iconPrefix: 'fa-solid',
      icon: 'fa-tree',
      bg: '#58A700',
      fg: '#FFFFFF',
      rimHex: '#3F7A18',
      labelId: 'Mahir',
    },
    // Level 4: big tree — new intermediate stage
    {
      iconPrefix: 'fa-solid',
      icon: 'fa-tree',
      bg: '#3F7A18',
      fg: '#FFFFFF',
      rimHex: '#2E5B10',
      labelId: 'Rimbun',
    },
    // Level 5: gold with forest
    {
      iconPrefix: 'fa-solid',
      icon: 'fa-tree',
      bg: '#ffdd55',
      fg: '#30598A',
      rimHex: '#E3B93E',
      labelId: 'Dikuasai',
      forest: true,
    },
  ],
  trailColor: '#FFD3B1',
  mapNameId: 'Kebun',
}

const THEME_PACKS: Record<string, TrackThemePack> = {
  forest: FOREST_PACK,
}

export function getThemePack(key: string): TrackThemePack {
  return THEME_PACKS[key] || FOREST_PACK
}
