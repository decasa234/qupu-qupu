// Generated from the curriculum: each chapter becomes a unit, its approved
// concepts become nodes in curriculum order, and one real past-paper question
// closes the chapter as its gate. Regenerate rather than hand-editing.
//
// A concept only appears here if it has a 5-level ladder — the validator
// refuses the rest, which is why this file was two units long before.
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
      key: 'g1-hitung',
      nameId: "Menghitung & Urutan Bilangan",
      nameEn: "Menghitung & Urutan Bilangan",
      colorHex: '#30598A',
      iconKey: 'hashtag',
      nodes: [
        { kind: 'concept', slug: 'count-many-objects' },
        { kind: 'concept', slug: 'compare-order-numbers' },
        { kind: 'concept', slug: 'more-or-less-by-k' },
        { kind: 'concept', slug: 'number-line-jumps' },
        { kind: 'concept', slug: 'position-in-line' },
        { kind: 'concept', slug: 'digit-sum' },
        { kind: 'concept', slug: 'arrange-digits-to-form-number' },
        { kind: 'concept', slug: 'count-two-digit-numbers' },
        { kind: 'concept', slug: 'ordinal-position-read' },
        {
          kind: 'gate',
          key: 'gate-g1-hitung',
          problemRef: 'WMI-23P1A#1',
          requires: ['count-many-objects', 'compare-order-numbers', 'more-or-less-by-k', 'number-line-jumps', 'position-in-line', 'digit-sum', 'arrange-digits-to-form-number', 'count-two-digit-numbers', 'ordinal-position-read'],
        },
      ],
    },
    {
      key: 'g1-tambah-kurang',
      nameId: "Penjumlahan & Pengurangan",
      nameEn: "Penjumlahan & Pengurangan",
      colorHex: '#F0853A',
      iconKey: 'plus-minus',
      nodes: [
        { kind: 'concept', slug: 'single-digit-addition' },
        { kind: 'concept', slug: 'single-digit-subtraction' },
        { kind: 'concept', slug: 'missing-addend' },
        { kind: 'concept', slug: 'make-groups-leftover' },
        { kind: 'concept', slug: 'transfer-to-equalize' },
        { kind: 'concept', slug: 'row-column-sum-grid' },
        {
          kind: 'gate',
          key: 'gate-g1-tambah-kurang',
          problemRef: 'WMI-20F1A#1',
          requires: ['single-digit-addition', 'single-digit-subtraction', 'missing-addend', 'make-groups-leftover', 'transfer-to-equalize', 'row-column-sum-grid'],
        },
      ],
    },
    {
      key: 'g1-pola',
      nameId: "Pola & Barisan",
      nameEn: "Pola & Barisan",
      colorHex: '#7C5CBF',
      iconKey: 'shapes',
      nodes: [
        { kind: 'concept', slug: 'pattern-next' },
        { kind: 'concept', slug: 'visual-pattern-next' },
        { kind: 'concept', slug: 'shape-transformation-rule' },
        { kind: 'concept', slug: 'number-figure-rule' },
        { kind: 'concept', slug: 'sequence-repair' },
        {
          kind: 'gate',
          key: 'gate-g1-pola',
          problemRef: 'WMI-21P1A#18',
          requires: ['pattern-next', 'visual-pattern-next', 'shape-transformation-rule', 'number-figure-rule', 'sequence-repair'],
        },
      ],
    },
    {
      key: 'g1-bentuk',
      nameId: "Bentuk & Simetri Dasar",
      nameEn: "Bentuk & Simetri Dasar",
      colorHex: '#2E8B6B',
      iconKey: 'shapes',
      nodes: [
        { kind: 'concept', slug: 'count-polygon-sides' },
        { kind: 'concept', slug: 'symmetry-count' },
        { kind: 'concept', slug: 'block-count-3d' },
        {
          kind: 'gate',
          key: 'gate-g1-bentuk',
          problemRef: 'WMI-21F1A#3',
          requires: ['count-polygon-sides', 'symmetry-count', 'block-count-3d'],
        },
      ],
    },
    {
      key: 'g1-pecahan',
      nameId: "Pecahan Dasar",
      nameEn: "Pecahan Dasar",
      colorHex: '#E0A000',
      iconKey: 'chart-pie',
      nodes: [
        { kind: 'concept', slug: 'fraction-of-region' },
        {
          kind: 'gate',
          key: 'gate-g1-pecahan',
          problemRef: 'WMI-25P1A#2',
          requires: ['fraction-of-region'],
        },
      ],
    },
    {
      key: 'g1-jam-data',
      nameId: "Jam, Turus & Diagram",
      nameEn: "Jam, Turus & Diagram",
      colorHex: '#C2575B',
      iconKey: 'clock',
      nodes: [
        { kind: 'concept', slug: 'clock-read-time' },
        { kind: 'concept', slug: 'tally-marks-count' },
        { kind: 'concept', slug: 'bar-chart-compare' },
        { kind: 'concept', slug: 'sort-count-by-attribute' },
        { kind: 'concept', slug: 'length-measure-compare' },
        {
          kind: 'gate',
          key: 'gate-g1-jam-data',
          problemRef: 'WMI-20P1A#3',
          requires: ['clock-read-time', 'tally-marks-count', 'bar-chart-compare', 'sort-count-by-attribute', 'length-measure-compare'],
        },
      ],
    },
    {
      key: 'g1-cerita',
      nameId: "Soal Cerita Sederhana",
      nameEn: "Soal Cerita Sederhana",
      colorHex: '#5B8DEF',
      iconKey: 'book-open',
      nodes: [
        { kind: 'concept', slug: 'story-sum' },
        { kind: 'concept', slug: 'which-expression-equals' },
        { kind: 'concept', slug: 'table-lookup-combine' },
        { kind: 'concept', slug: 'balance-substitution' },
        {
          kind: 'gate',
          key: 'gate-g1-cerita',
          problemRef: 'WMI-24F1A#1',
          requires: ['story-sum', 'which-expression-equals', 'table-lookup-combine', 'balance-substitution'],
        },
      ],
    },
  ],
}

export default track
