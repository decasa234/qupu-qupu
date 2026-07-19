// PILOT track — engine vertical slice only. Real grade-1 curriculum content
// (WMI problem decomposition into atomic concepts) is sub-project 2 and will
// replace/extend these units. `review`: admin-only visibility (see
// ladder.ts canViewTrack) while the pilot is QA'd before rollout to parents.
import type { TrackDef } from './types.js'

const track: TrackDef = {
  id: 'wmi-grade-1',
  mode: 'wmi',
  grade: 1,
  status: 'published',
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
    {
      key: 'pengurangan-dasar',
      nameId: 'Pengurangan Dasar',
      nameEn: 'Basic Subtraction',
      colorHex: '#4C9EE8',
      iconKey: 'minus',
      nodes: [
        { kind: 'concept', slug: 'single-digit-subtraction' },
        {
          // WMI-21F1A#9 — the bus-stop word problem (text-only, no figure):
          // 4 orang naik bus 9, 7 orang masih menunggu bus 12 — penjumlahan
          // dan pengurangan bilangan satuan, synthesis of both spine concepts.
          kind: 'gate',
          key: 'gate-pengurangan-dasar',
          problemRef: 'WMI-21F1A#9',
          requires: ['single-digit-addition', 'single-digit-subtraction'],
        },
      ],
    },
  ],
}

export default track
