import type { Lang } from '../concepts/explainers/makeTenSteps'

// Deterministic storyboard for WMI-24P2A-Q19 (matching-flower, answer E).
//
// The given flower has petal discs alternating dark / white around it. "The same"
// means a figure that can be ROTATED onto the original — rotating keeps the
// dark-white-dark-white order. A MIRROR image reverses that order, so it is NOT
// the same (that is the trap). The correct option is the one whose alternating
// order survives a rotation: the seed answer, E.

export interface Q19Step {
  rotateSteps: number
  mirror: boolean
  activePetals: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answer: string
  steps: Q19Step[]
  finalIndex: number
}

export function buildP24G2Q19Steps(lang: Lang, answer: string): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q19Step[] = [
    {
      rotateSteps: 0,
      mirror: false,
      activePetals: [0, 1, 2, 3, 4, 5],
      hold: 2000,
      result: false,
      caption: t(
        'Read the discs around the flower: dark, white, dark, white, dark, white.',
        'Baca cakram mengelilingi bunga: gelap, putih, gelap, putih, gelap, putih.',
      ),
    },
    {
      rotateSteps: 2,
      mirror: false,
      activePetals: [0, 1, 2, 3, 4, 5],
      hold: 2200,
      result: false,
      caption: t(
        'Spin the flower: the same dark-white order keeps going around — turning still matches.',
        'Putar bunga: urutan gelap-putih tetap sama saat berkeliling — diputar tetap cocok.',
      ),
    },
    {
      rotateSteps: 0,
      mirror: true,
      activePetals: [0, 1, 2, 3, 4, 5],
      hold: 2300,
      result: false,
      caption: t(
        'A mirror image flips the order the other way — it looks close but is NOT the same.',
        'Bayangan cermin membalik urutannya ke arah lain — tampak mirip tapi BUKAN sama.',
      ),
    },
    {
      rotateSteps: 1,
      mirror: false,
      activePetals: [0, 1, 2, 3, 4, 5],
      hold: 0,
      result: true,
      caption: t(
        `Only a rotation keeps the dark-white-dark-white order — that option is ${answer}.`,
        `Hanya putaran yang menjaga urutan gelap-putih-gelap-putih — pilihan itu ${answer}.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
