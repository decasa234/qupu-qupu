// Generated from the curriculum: each chapter becomes a unit, its approved
// concepts become nodes in curriculum order, and one real past-paper question
// closes the chapter as its gate. Regenerate rather than hand-editing.
//
// A concept only appears here if it has a 5-level ladder — the validator
// refuses the rest, which is why this file was two units long before.
import type { TrackDef } from './types.js'

const track: TrackDef = {
  id: 'wmi-grade-3',
  mode: 'wmi',
  grade: 3,
  status: 'published',
  theme: 'forest',
  nameId: 'WMI Kelas 3',
  nameEn: 'WMI Grade 3',
  units: [
    {
      key: 'g3-perkalian',
      nameId: "Perkalian, Faktor & Kelipatan",
      nameEn: "Perkalian, Faktor & Kelipatan",
      colorHex: '#F0853A',
      iconKey: 'xmark',
      nodes: [
        { kind: 'concept', slug: 'multiplication-small' },
        { kind: 'concept', slug: 'combination-product-sum' },
        { kind: 'concept', slug: 'perfect-square-search' },
        { kind: 'concept', slug: 'product-of-consecutive' },
        { kind: 'concept', slug: 'common-factor-shortcut' },
        {
          kind: 'gate',
          key: 'gate-g3-perkalian',
          problemRef: 'WMI-21P3A#8',
          requires: ['multiplication-small', 'combination-product-sum', 'perfect-square-search', 'product-of-consecutive', 'common-factor-shortcut'],
        },
      ],
    },
    {
      key: 'g3-bilangan',
      nameId: "Bilangan & Pola Lanjut",
      nameEn: "Bilangan & Pola Lanjut",
      colorHex: '#30598A',
      iconKey: 'hashtag',
      nodes: [
        { kind: 'concept', slug: 'digit-frequency' },
        { kind: 'concept', slug: 'number-pyramid' },
        { kind: 'concept', slug: 'sum-partition-split' },
        { kind: 'concept', slug: 'reverse-arithmetic-puzzle' },
        { kind: 'concept', slug: 'cryptarithmetic-addition' },
        { kind: 'concept', slug: 'consecutive-integer-sum' },
        { kind: 'concept', slug: 'delete-digits-extremise' },
        { kind: 'concept', slug: 'digits-into-equation-fill' },
        { kind: 'concept', slug: 'compare-fractions' },
        { kind: 'concept', slug: 'growing-figure-nth-term' },
        {
          kind: 'gate',
          key: 'gate-g3-bilangan',
          problemRef: 'WMI-21P3A#4',
          requires: ['digit-frequency', 'number-pyramid', 'sum-partition-split', 'reverse-arithmetic-puzzle', 'cryptarithmetic-addition', 'consecutive-integer-sum', 'delete-digits-extremise', 'digits-into-equation-fill', 'compare-fractions', 'growing-figure-nth-term'],
        },
      ],
    },
    {
      key: 'g3-geometri',
      nameId: "Geometri Lanjut",
      nameEn: "Geometri Lanjut",
      colorHex: '#2E8B6B',
      iconKey: 'draw-polygon',
      nodes: [
        { kind: 'concept', slug: 'count-rectangles-grid' },
        { kind: 'concept', slug: 'perimeter-area-composed' },
        { kind: 'concept', slug: 'dice-net-fold' },
        { kind: 'concept', slug: 'painted-cube-faces-count' },
        {
          kind: 'gate',
          key: 'gate-g3-geometri',
          problemRef: 'WMI-24F3A#6',
          requires: ['count-rectangles-grid', 'perimeter-area-composed', 'dice-net-fold', 'painted-cube-faces-count'],
        },
      ],
    },
    {
      key: 'g3-logika',
      nameId: "Logika & Strategi",
      nameEn: "Logika & Strategi",
      colorHex: '#7C5CBF',
      iconKey: 'lightbulb',
      nodes: [
        { kind: 'concept', slug: 'maze-path-shortest' },
        { kind: 'concept', slug: 'truth-order-clues' },
        { kind: 'concept', slug: 'budget-selection' },
        { kind: 'concept', slug: 'range-count-evaluate' },
        { kind: 'concept', slug: 'solve-symbol-equations' },
        {
          kind: 'gate',
          key: 'gate-g3-logika',
          problemRef: 'WMI-23P3A#2',
          requires: ['maze-path-shortest', 'truth-order-clues', 'budget-selection', 'range-count-evaluate', 'solve-symbol-equations'],
        },
      ],
    },
    {
      key: 'g3-cerita-multi',
      nameId: "Soal Cerita Multi-langkah",
      nameEn: "Soal Cerita Multi-langkah",
      colorHex: '#E0A000',
      iconKey: 'book-open',
      nodes: [
        { kind: 'concept', slug: 'distance-rate-time' },
        { kind: 'concept', slug: 'lacking-money-shared' },
        { kind: 'concept', slug: 'rope-wraps-ratio' },
        { kind: 'concept', slug: 'container-capacity-allocation' },
        { kind: 'concept', slug: 'comparison-chain-solve' },
        {
          kind: 'gate',
          key: 'gate-g3-cerita-multi',
          problemRef: 'WMI-25F3A#5',
          requires: ['distance-rate-time', 'lacking-money-shared', 'rope-wraps-ratio', 'container-capacity-allocation', 'comparison-chain-solve'],
        },
      ],
    },
    {
      key: 'g3-pengukuran',
      nameId: "Pengukuran Lanjut",
      nameEn: "Pengukuran Lanjut",
      colorHex: '#14746F',
      iconKey: 'ruler',
      nodes: [
        { kind: 'concept', slug: 'weight-balance-word' },
        { kind: 'concept', slug: 'scale-read' },
        { kind: 'concept', slug: 'calendar-day-reasoning' },
        {
          kind: 'gate',
          key: 'gate-g3-pengukuran',
          problemRef: 'WMI-25F3A#3',
          requires: ['weight-balance-word', 'scale-read', 'calendar-day-reasoning'],
        },
      ],
    },
  ],
}

export default track
