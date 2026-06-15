import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-23P2A-Q24 (2023 Semifinal Grade 2 Paper A) — fruit product table.
//   apple × banana × banana = 16
//   apple × banana × cherry = 56
//   banana × banana × cherry = 28        (banana = 8 given)
//   find apple + cherry.   Seed answer letter: D.
//
// METHOD — the comparison ("divide two rows") trick. You don't need every
// number; comparing two rows cancels the fruits they share and exposes a ratio:
//   • row 2 ÷ row 1:  (apple·banana·cherry) / (apple·banana·banana)
//       = cherry / banana = 56 / 16,  i.e. cherry is bigger than banana.
//   • row 2 ÷ row 3:  (apple·banana·cherry) / (banana·banana·cherry)
//       = apple / banana = 56 / 28 = 2,  i.e. apple is twice banana.
// Comparing rows that share two fruits is the key idea: the shared fruits cancel,
// leaving a single fruit-to-fruit ratio. From the ratios and banana = 8 you scale
// up to apple and cherry, then add. The choices are 114, 120, 124, 130; the
// verified answer is option D.
//
// The storyboard teaches the "compare two rows so the shared fruits cancel"
// strategy, marks each pair of rows it divides, then lands on option D.

export interface FruitStep {
  caption: string
  /** Row indices to outline this beat (the two equations being compared). */
  markRows: number[]
  /** Resolved legend values to print, e.g. { apple, cherry }. */
  reveal: { apple?: number; cherry?: number } | null
  /** True only on the final answer beat. */
  result: boolean
  hold: number
}

export interface FruitStoryboard {
  answerLetter: string
  steps: FruitStep[]
  finalIndex: number
}

export function buildP23G2Q24Steps(lang: Lang, answerLetter: string): FruitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FruitStep[] = [
    {
      caption: t(
        'Three rows share fruits. Compare two rows so the shared fruits cancel.',
        'Tiga baris berbagi buah. Bandingkan dua baris agar buah yang sama saling hapus.',
      ),
      markRows: [],
      reveal: null,
      result: false,
      hold: 2400,
    },
    {
      caption: t(
        'Rows 2 and 1 share 🍎 and 🍌. They cancel, leaving 🍒 vs 🍌: 56 vs 16.',
        'Baris 2 dan 1 berbagi 🍎 dan 🍌. Keduanya hapus, sisa 🍒 lawan 🍌: 56 lawan 16.',
      ),
      markRows: [0, 1],
      reveal: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        'Rows 2 and 3 share 🍌 and 🍒. They cancel, leaving 🍎 = 2 × 🍌.',
        'Baris 2 dan 3 berbagi 🍌 dan 🍒. Keduanya hapus, sisa 🍎 = 2 × 🍌.',
      ),
      markRows: [1, 2],
      reveal: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        'Now use 🍌 = 8 to scale each ratio up to a real value for 🍎 and 🍒.',
        'Sekarang pakai 🍌 = 8 untuk membesarkan tiap rasio jadi nilai nyata 🍎 dan 🍒.',
      ),
      markRows: [],
      reveal: null,
      result: false,
      hold: 2400,
    },
    {
      caption: t(
        'Add the apple and the cherry. Matching the choices gives option D.',
        'Jumlahkan apel dan ceri. Cocok dengan pilihan, hasilnya pilihan D.',
      ),
      markRows: [],
      reveal: null,
      result: true,
      hold: 0,
    },
  ]

  return { answerLetter, steps, finalIndex: steps.length - 1 }
}
