// Generated from the curriculum: each chapter becomes a unit, its approved
// concepts become nodes in curriculum order, and one real past-paper question
// closes the chapter as its gate. Regenerate rather than hand-editing.
//
// A concept only appears here if it has a 5-level ladder — the validator
// refuses the rest, which is why this file was two units long before.
import type { TrackDef } from './types.js'

const track: TrackDef = {
  id: 'wmi-grade-2',
  mode: 'wmi',
  grade: 2,
  status: 'published',
  theme: 'forest',
  nameId: 'WMI Kelas 2',
  nameEn: 'WMI Grade 2',
  units: [
    {
      key: 'g2-nilai-tempat',
      nameId: "Nilai Tempat & Bilangan",
      nameEn: "Nilai Tempat & Bilangan",
      colorHex: '#30598A',
      iconKey: 'list-ol',
      nodes: [
        { kind: 'concept', slug: 'place-value' },
        { kind: 'concept', slug: 'build-number-from-digit-clues' },
        { kind: 'concept', slug: 'find-number-by-digit-sum' },
        { kind: 'concept', slug: 'book-sheet-pages' },
        {
          kind: 'gate',
          key: 'gate-g2-nilai-tempat',
          problemRef: 'WMI-23P2A#3',
          requires: ['place-value', 'build-number-from-digit-clues', 'find-number-by-digit-sum', 'book-sheet-pages'],
        },
      ],
    },
    {
      key: 'g2-operasi',
      nameId: "Operasi & Ekspresi Hitung",
      nameEn: "Operasi & Ekspresi Hitung",
      colorHex: '#F0853A',
      iconKey: 'calculator',
      nodes: [
        { kind: 'concept', slug: 'arithmetic-expression-eval' },
        { kind: 'concept', slug: 'alternating-chain-eval' },
        { kind: 'concept', slug: 'operator-fill' },
        { kind: 'concept', slug: 'custom-operation' },
        { kind: 'concept', slug: 'mistaken-digit-correction' },
        { kind: 'concept', slug: 'rank-computed-expressions' },
        {
          kind: 'gate',
          key: 'gate-g2-operasi',
          problemRef: 'WMI-22P2A#1',
          requires: ['arithmetic-expression-eval', 'alternating-chain-eval', 'operator-fill', 'custom-operation', 'mistaken-digit-correction', 'rank-computed-expressions'],
        },
      ],
    },
    {
      key: 'g2-keliling-luas',
      nameId: "Keliling & Luas",
      nameEn: "Keliling & Luas",
      colorHex: '#2E8B6B',
      iconKey: 'vector-square',
      nodes: [
        { kind: 'concept', slug: 'shape-perimeter-square' },
        { kind: 'concept', slug: 'shape-perimeter-rectangle' },
        { kind: 'concept', slug: 'rectangle-area-grid' },
        {
          kind: 'gate',
          key: 'gate-g2-keliling-luas',
          problemRef: 'WMI-21P2A#14',
          requires: ['shape-perimeter-square', 'shape-perimeter-rectangle', 'rectangle-area-grid'],
        },
      ],
    },
    {
      key: 'g2-geometri',
      nameId: "Geometri & Bangun Ruang",
      nameEn: "Geometri & Bangun Ruang",
      colorHex: '#6B4FAE',
      iconKey: 'draw-polygon',
      nodes: [
        { kind: 'concept', slug: 'angle-type' },
        { kind: 'concept', slug: 'same-figure-identify' },
        { kind: 'concept', slug: 'count-shapes-in-figure' },
        { kind: 'concept', slug: 'dice-opposite-faces' },
        { kind: 'concept', slug: 'grid-path-steps' },
        {
          kind: 'gate',
          key: 'gate-g2-geometri',
          problemRef: 'WMI-21P2A#16',
          requires: ['angle-type', 'same-figure-identify', 'count-shapes-in-figure', 'dice-opposite-faces', 'grid-path-steps'],
        },
      ],
    },
    {
      key: 'g2-pengukuran',
      nameId: "Pengukuran & Skala",
      nameEn: "Pengukuran & Skala",
      colorHex: '#14746F',
      iconKey: 'ruler',
      nodes: [
        { kind: 'concept', slug: 'unit-conversion' },
        { kind: 'concept', slug: 'clock-time-after' },
        {
          kind: 'gate',
          key: 'gate-g2-pengukuran',
          problemRef: 'WMI-22P2A#4',
          requires: ['unit-conversion', 'clock-time-after'],
        },
      ],
    },
    {
      key: 'g2-logika',
      nameId: "Logika & Penalaran",
      nameEn: "Logika & Penalaran",
      colorHex: '#7C5CBF',
      iconKey: 'lightbulb',
      nodes: [
        { kind: 'concept', slug: 'odd-even-reasoning' },
        { kind: 'concept', slug: 'divisibility-multiple-property' },
        { kind: 'concept', slug: 'which-might-be' },
        { kind: 'concept', slug: 'assignment-cycle' },
        { kind: 'concept', slug: 'direction-orientation' },
        {
          kind: 'gate',
          key: 'gate-g2-logika',
          problemRef: 'WMI-21F2A#3',
          requires: ['odd-even-reasoning', 'divisibility-multiple-property', 'which-might-be', 'assignment-cycle', 'direction-orientation'],
        },
      ],
    },
    {
      key: 'g2-uang-cerita',
      nameId: "Uang & Soal Cerita",
      nameEn: "Uang & Soal Cerita",
      colorHex: '#E0A000',
      iconKey: 'coins',
      nodes: [
        { kind: 'concept', slug: 'money-shopping-change' },
        { kind: 'concept', slug: 'money-coins-total' },
        { kind: 'concept', slug: 'legs-items-rate' },
        { kind: 'concept', slug: 'equivalent-fraction-fill' },
        {
          kind: 'gate',
          key: 'gate-g2-uang-cerita',
          problemRef: 'WMI-22P2A#9',
          requires: ['money-shopping-change', 'money-coins-total', 'legs-items-rate', 'equivalent-fraction-fill'],
        },
      ],
    },
    {
      key: 'g2-data',
      nameId: "Diagram, Tabel & Data",
      nameEn: "Diagram, Tabel & Data",
      colorHex: '#C2575B',
      iconKey: 'chart-simple',
      nodes: [
        { kind: 'concept', slug: 'net-progress-cycles' },
        {
          kind: 'gate',
          key: 'gate-g2-data',
          problemRef: 'WMI-19P2A#24',
          requires: ['net-progress-cycles'],
        },
      ],
    },
  ],
}

export default track
