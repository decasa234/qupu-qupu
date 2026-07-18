// PILOT track — engine vertical slice only. Real grade-1 curriculum content
// (WMI problem decomposition into atomic concepts) is sub-project 2 and will
// replace/extend these units. Stays `draft`: invisible to children.
import type { TrackDef } from './types.js'

const track: TrackDef = {
  id: 'wmi-grade-1',
  mode: 'wmi',
  grade: 1,
  status: 'draft',
  theme: 'forest',
  nameId: 'WMI Kelas 1',
  nameEn: 'WMI Grade 1',
  units: [
    {
      key: 'penjumlahan-dasar',
      nameId: 'Penjumlahan Dasar',
      nameEn: 'Basic Addition',
      colorHex: '#F0853A',
      iconKey: 'plus',
      nodes: [
        { kind: 'concept', slug: 'single-digit-addition' },
        {
          kind: 'gate',
          key: 'gate-penjumlahan-dasar',
          problemRef: 'WMI-21F1A#1',
          requires: ['single-digit-addition'],
        },
      ],
    },
  ],
}

export default track
