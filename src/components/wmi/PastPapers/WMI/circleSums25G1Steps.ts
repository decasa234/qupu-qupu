import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SHADED_ANSWER, SHADED_CANDIDATES } from './CircleSums25G1Illustration'

// Storyboard for WMI-25F1A-Q21 (2025 G1 final) — faithful to the scan.
//
// Ten circles in a ring, a spoke to each; the ten sectors between spokes carry
// five shape marks, each shape in TWO OPPOSITE sectors. The two circles beside
// a sector must total the same as the two circles beside the opposite
// same-shape sector. Givens: 10 (right), 7 (upper-right), 9 (left),
// 1 (bottom-left); the shaded circle sits next to the 1 (bottom-right).
//
// THE METHOD, one idea per beat (deduce, never assert the answer up front):
//   beat 1 (crescent) — crescent sectors: 10 + 7 = 17 on the right, so the
//     circle next to the 9 must make 9 + □ = 17 → □ = 8.
//   beat 2 (hexagon)  — hexagon sectors: 8 + 1 = 9 below-left, so the circle
//     next to the 7 must make 7 + □ = 9 → □ = 2.
//   beat 3 (leftover) — 3, 4, 5, 6 remain. The square rule forces one
//     neighbour-of-9 to be 1 more than the neighbour-of-10; the star rule
//     forces shaded = (circle beside the 2) + 1. Both splits of {3,4,5,6} into
//     consecutive pairs work, so the shaded circle can be 4 or 6.
//   beat 4 (result)   — sum of everything the shaded circle could be:
//     4 + 6 = 10.
//
// Pure builder — deterministic, SSR-safe. Candidates and the answer derive from
// the illustration's exported constants so figure and logic can never drift.

export type CircleSumsPhase = 'crescent' | 'hexagon' | 'leftover' | 'result'

export interface CircleSumsStep {
  phase: CircleSumsPhase
  /** Reveal the deduced 8 (crescent rule). */
  revealEight: boolean
  /** Reveal the deduced 2 (hexagon rule). */
  revealTwo: boolean
  /** Show "4/6" in the shaded circle. */
  revealCandidates: boolean
  /** Sector shapes to spotlight on this beat. */
  highlightShapes: ('square' | 'dot' | 'star' | 'hex' | 'crescent')[]
  caption: string
  hold: number
  /** Final answer beat. */
  result: boolean
}

export interface CircleSumsStoryboard {
  /** The two values the shaded circle can hold. */
  candidates: readonly [number, number]
  /** Requested sum of all possible shaded values (= the answer, 10). */
  answer: number
  steps: CircleSumsStep[]
  finalIndex: number
}

export function buildCircleSums25G1Steps(lang: Lang): CircleSumsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const [candA, candB] = SHADED_CANDIDATES // 4 and 6
  const answer = SHADED_ANSWER // 4 + 6 = 10

  const steps: CircleSumsStep[] = [
    {
      phase: 'crescent',
      revealEight: true,
      revealTwo: false,
      revealCandidates: false,
      highlightShapes: ['crescent'],
      result: false,
      hold: 2600,
      caption: t(
        'Same figure, opposite sectors, same total. Crescent right: 10 + 7 = 17. Crescent left: 9 + □ = 17, so □ = 8.',
        'Gambar sama, daerah berseberangan, jumlah sama. Bulan sabit kanan: 10 + 7 = 17. Bulan sabit kiri: 9 + □ = 17, jadi □ = 8.',
      ),
    },
    {
      phase: 'hexagon',
      revealEight: true,
      revealTwo: true,
      revealCandidates: false,
      highlightShapes: ['hex'],
      result: false,
      hold: 2600,
      caption: t(
        'Hexagon below-left: 8 + 1 = 9. Hexagon top-right: 7 + □ = 9, so □ = 2.',
        'Segi enam kiri bawah: 8 + 1 = 9. Segi enam kanan atas: 7 + □ = 9, jadi □ = 2.',
      ),
    },
    {
      phase: 'leftover',
      revealEight: true,
      revealTwo: true,
      revealCandidates: true,
      highlightShapes: ['square', 'star'],
      result: false,
      hold: 3000,
      caption: t(
        `Only 3, 4, 5, 6 are left. The square and star rules pair them as “one more than”: both splits work, and the shaded circle ends up ${candA} in one filling and ${candB} in the other.`,
        `Tersisa 3, 4, 5, 6. Aturan persegi dan bintang memasangkannya sebagai “lebih satu”: dua pembagian sama-sama bisa, dan lingkaran arsir bernilai ${candA} pada satu isian dan ${candB} pada isian lainnya.`,
      ),
    },
    {
      phase: 'result',
      revealEight: true,
      revealTwo: true,
      revealCandidates: true,
      highlightShapes: [],
      result: true,
      hold: 0,
      caption: t(
        `The shaded circle can be ${candA} or ${candB}, so the sum of all its possible numbers is ${candA} + ${candB} = ${answer}.`,
        `Lingkaran arsir bisa ${candA} atau ${candB}, jadi jumlah semua bilangan yang mungkin adalah ${candA} + ${candB} = ${answer}.`,
      ),
    },
  ]

  return { candidates: SHADED_CANDIDATES, answer, steps, finalIndex: steps.length - 1 }
}
