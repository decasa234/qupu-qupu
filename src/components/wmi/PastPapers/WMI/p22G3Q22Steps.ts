import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q22_ANSWER, Q22_HIDDEN } from './P22G3Q22Illustration'

// Storyboard for WMI-22P3A-Q22 — find the 4 shapes hidden behind the "?" box.
//
// The row is NOT a fixed repeat: it is a GROWING pattern. Squares separate runs
// of pentagons whose length grows by one each time:
//   S , P , S , PP , S , PPP , S , PPPP , S , …
// Counting positions, the hidden group (positions 4-7) is  P P S P  → option B.

export interface Q22Step {
  revealHidden: boolean
  highlightSlots: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  hidden: ReadonlyArray<'S' | 'P'>
  answer: string
  steps: Q22Step[]
  finalIndex: number
}

function shapeWord(k: 'S' | 'P', lang: Lang) {
  if (lang === 'id') return k === 'S' ? 'persegi' : 'segi lima'
  return k === 'S' ? 'square' : 'pentagon'
}

export function buildP22G3Q22Steps(lang: Lang): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const hiddenWords = Q22_HIDDEN.map((k) => shapeWord(k, lang)).join(', ')

  const steps: Q22Step[] = [
    {
      revealHidden: false,
      highlightSlots: false,
      hold: 2100,
      result: false,
      caption: t(
        'This row is not a simple repeat. Look at the squares — they split the pentagons into separate runs.',
        'Baris ini bukan pengulangan biasa. Lihat persegi-persegi — mereka memisahkan segi lima jadi kelompok-kelompok.',
      ),
    },
    {
      revealHidden: false,
      highlightSlots: false,
      hold: 2400,
      result: false,
      caption: t(
        'Each run of pentagons is one longer than the last: 1, then 2, then 3, then 4 — so the order is S, P, S, PP, S, PPP, S, PPPP, S, …',
        'Tiap kelompok segi lima satu lebih panjang: 1, lalu 2, lalu 3, lalu 4 — jadi urutannya S, P, S, PP, S, PPP, S, PPPP, S, …',
      ),
    },
    {
      revealHidden: false,
      highlightSlots: false,
      hold: 2300,
      result: false,
      caption: t(
        'The visible part runs S, P, S … then after the box PP S PPPP S. The hidden box sits exactly where the "2-run" ends and the "3-run" begins.',
        'Bagian terlihat: S, P, S … lalu setelah kotak PP S PPPP S. Kotak tersembunyi tepat di tempat kelompok-2 berakhir dan kelompok-3 mulai.',
      ),
    },
    {
      revealHidden: true,
      highlightSlots: false,
      hold: 2300,
      result: false,
      caption: t(
        `So the 4 hidden shapes continue the cycle in order: ${hiddenWords}.`,
        `Jadi 4 bangun tersembunyi melanjutkan siklus berurutan: ${hiddenWords}.`,
      ),
    },
    {
      revealHidden: true,
      highlightSlots: true,
      hold: 0,
      result: true,
      caption: t(
        `Those four — ${hiddenWords} — match option ${Q22_ANSWER}.`,
        `Keempatnya — ${hiddenWords} — cocok dengan opsi ${Q22_ANSWER}.`,
      ),
    },
  ]

  return { hidden: Q22_HIDDEN, answer: Q22_ANSWER, steps, finalIndex: steps.length - 1 }
}
