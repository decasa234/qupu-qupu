import type { Lang } from '../concepts/explainers/makeTenSteps'

export type RoutePhase = 'show' | 'inner' | 'outerA' | 'outerD' | 'result'

export interface RouteStep {
  phase: RoutePhase
  litLabel: 'A' | 'B' | 'C' | 'D' | null
  caption: string
  hold: number
  result: boolean
}

export interface RouteStoryboard {
  answer: 'D'
  steps: RouteStep[]
  finalIndex: number
}

export function buildP21G3Q18Steps(lang: Lang): RouteStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RouteStep[] = [
    {
      phase: 'show',
      litLabel: null,
      hold: 1700,
      result: false,
      caption: t(
        'Home is at top-left, School at bottom-right. Compare the four routes.',
        'Rumah di kiri-atas, sekolah di kanan-bawah. Bandingkan keempat rute.',
      ),
    },
    {
      phase: 'inner',
      litLabel: 'B',
      hold: 2000,
      result: false,
      caption: t(
        'B and C are inner staircases — they cut across the middle, the short way.',
        'B dan C adalah tangga di dalam — memotong lewat tengah, jalur pendek.',
      ),
    },
    {
      phase: 'outerA',
      litLabel: 'A',
      hold: 2000,
      result: false,
      caption: t(
        'A hugs the bottom: straight down the left wall, then across the bottom.',
        'A menyusuri bawah: lurus turun sisi kiri, lalu menyeberang lewat bawah.',
      ),
    },
    {
      phase: 'outerD',
      litLabel: 'D',
      hold: 2200,
      result: false,
      caption: t(
        'D wraps the OUTER edge: all along the top, then down the far right wall.',
        'D melingkari tepi LUAR: menyusuri seluruh atas, lalu turun sisi paling kanan.',
      ),
    },
    {
      phase: 'result',
      litLabel: 'D',
      hold: 0,
      result: true,
      caption: t(
        'D bows out the farthest around the outside, so D is the longest — answer D.',
        'D paling menjorok keluar mengelilingi sisi luar, jadi D paling panjang — jawaban D.',
      ),
    },
  ]

  return { answer: 'D', steps, finalIndex: steps.length - 1 }
}
