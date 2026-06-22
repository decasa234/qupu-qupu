// IKMC-22-PE-Q14 — storyboard for the stamp mirror-flip animation.
//
// Question: Which picture results when we use the stamp shown?
// Answer: D (pear | banana | apple — the left-right mirror of the stamp face).
//
// Stamp face (what you see before pressing):   [ apple | banana | pear  ]
// Printed result (what you see on paper):       [ pear  | banana | apple ] ← D
//
// Teaching walk, one idea per beat:
//   0. intro      — show the stamp face; identify the three fruits.
//   1. concept    — explain that a stamp makes a mirror image.
//   2. flip       — highlight that left↔right are swapped.
//   3. highlight-right — the pear (right on stamp) moves to the LEFT on paper.
//   4. highlight-left  — the apple (left on stamp) moves to the RIGHT on paper.
//   5. result     — show the printed arrangement; answer D badge.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { FruitId } from './Stamp14PEIllustration'

export type Lang = 'en' | 'id'

export interface Stamp14PEBeat {
  /** Three fruits on the stamp/card being shown left→right. */
  fruits: [FruitId, FruitId, FruitId]
  /** True = show the handle (stamp device). False = printed result (pad only). */
  showHandle: boolean
  /** Label above the stamp. null = no label. */
  stateLabel: string | null
  /** Slot index (0/1/2) to highlight with amber ring, or null. */
  highlightSlot: number | null
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final). */
  hold: number
  /** True only on the answer beat. */
  result: boolean
}

export interface Stamp14PEStoryboard {
  steps: Stamp14PEBeat[]
  finalIndex: number
  answer: string
}

export function buildStamp14PESteps(lang: Lang): Stamp14PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const stampFace: [FruitId, FruitId, FruitId]   = ['apple', 'banana', 'pear']
  const printedResult: [FruitId, FruitId, FruitId] = ['pear', 'banana', 'apple']

  const steps: Stamp14PEBeat[] = [
    // Beat 0 — intro: show the stamp
    {
      fruits: stampFace,
      showHandle: true,
      stateLabel: t('The stamp', 'Cap'),
      highlightSlot: null,
      hold: 2400,
      result: false,
      caption: t(
        'The stamp face shows: apple (left), banana (middle), pear (right).',
        'Permukaan cap menampilkan: apel (kiri), pisang (tengah), pir (kanan).',
      ),
    },

    // Beat 1 — concept
    {
      fruits: stampFace,
      showHandle: true,
      stateLabel: t('The stamp', 'Cap'),
      highlightSlot: null,
      hold: 2400,
      result: false,
      caption: t(
        'When a stamp is pressed onto paper, the image flips left ↔ right — like looking in a mirror.',
        'Ketika cap ditekan ke kertas, gambar terbalik kiri ↔ kanan — seperti melihat di cermin.',
      ),
    },

    // Beat 2 — highlight right slot: pear is on RIGHT of stamp …
    {
      fruits: stampFace,
      showHandle: true,
      stateLabel: t('Pear is on the RIGHT of the stamp', 'Pir ada di KANAN cap'),
      highlightSlot: 2,
      hold: 2200,
      result: false,
      caption: t(
        'The pear is on the RIGHT side of the stamp. After flipping, it will appear on the LEFT of the printed picture.',
        'Pir berada di sisi KANAN cap. Setelah dibalik, ia akan muncul di sisi KIRI gambar cetak.',
      ),
    },

    // Beat 3 — highlight left slot: apple is on LEFT of stamp …
    {
      fruits: stampFace,
      showHandle: true,
      stateLabel: t('Apple is on the LEFT of the stamp', 'Apel ada di KIRI cap'),
      highlightSlot: 0,
      hold: 2200,
      result: false,
      caption: t(
        'The apple is on the LEFT side of the stamp. After flipping, it will appear on the RIGHT of the printed picture.',
        'Apel berada di sisi KIRI cap. Setelah dibalik, ia akan muncul di sisi KANAN gambar cetak.',
      ),
    },

    // Beat 4 — show printed result (no handle)
    {
      fruits: printedResult,
      showHandle: false,
      stateLabel: t('Printed result on paper', 'Hasil cetak di kertas'),
      highlightSlot: null,
      hold: 2400,
      result: false,
      caption: t(
        'The printed picture shows: pear (left), banana (middle), apple (right). Left and right are swapped compared to the stamp.',
        'Gambar cetak menampilkan: pir (kiri), pisang (tengah), apel (kanan). Kiri dan kanan bertukar dibandingkan cap.',
      ),
    },

    // Beat 5 — result
    {
      fruits: printedResult,
      showHandle: false,
      stateLabel: t('Answer D', 'Jawaban D'),
      highlightSlot: null,
      hold: 0,
      result: true,
      caption: t(
        'The mirror image of the stamp is: pear | banana | apple — this matches option D.',
        'Gambar cermin dari cap adalah: pir | pisang | apel — ini cocok dengan pilihan D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'D' }
}
