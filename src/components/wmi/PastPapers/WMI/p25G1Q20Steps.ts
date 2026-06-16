// Deterministic storyboard for the WMI-25P1A-Q20 explainer.
//
// One-stroke (Eulerian path) garden puzzle. Answer C = A, C.
// Rule: to walk every path exactly once, the entrance and exit must be the two
// gates where an ODD number of paths meet.
//
// Path degrees (verified against PATHS in the illustration):
//   A = 3 (odd)   B = 2 (even)   C = 3 (odd)   D = 2 (even)
// → the two odd gates are A and C.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { Gate } from './P25G1Q20Illustration'
import { gateDegree } from './P25G1Q20Illustration'

const ODD = '#DC2626' // red ring for odd gates
const EVEN = '#9CA3AF' // grey ring for even gates

export interface Q20Step {
  /** Gates whose path-count badge is shown this beat. */
  badges: Partial<Record<Gate, string>>
  /** Gates ringed this beat (odd = red, even = grey). */
  rings: Partial<Record<Gate, string>>
  caption: string
  hold: number
  result: boolean
}

export interface Q20Storyboard {
  answer: string
  steps: Q20Step[]
  finalIndex: number
}

export function buildP25G1Q20Steps(lang: Lang): Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const dA = gateDegree('A') // 3
  const dB = gateDegree('B') // 2
  const dC = gateDegree('C') // 3
  const dD = gateDegree('D') // 2

  const allBadges: Partial<Record<Gate, string>> = {
    A: String(dA),
    B: String(dB),
    C: String(dC),
    D: String(dD),
  }
  const allRings: Partial<Record<Gate, string>> = {
    A: dA % 2 === 1 ? ODD : EVEN,
    B: dB % 2 === 1 ? ODD : EVEN,
    C: dC % 2 === 1 ? ODD : EVEN,
    D: dD % 2 === 1 ? ODD : EVEN,
  }

  const steps: Q20Step[] = [
    {
      badges: {},
      rings: {},
      hold: 1900,
      result: false,
      caption: t(
        'To walk every path once, start and finish where an ODD number of paths meet.',
        'Untuk melalui tiap jalur sekali, mulai dan selesai di tempat dengan jumlah jalur GANJIL.',
      ),
    },
    {
      badges: { A: allBadges.A, C: allBadges.C },
      rings: { A: ODD, C: ODD },
      hold: 2000,
      result: false,
      caption: t(
        `Count the paths at each gate: A has ${dA}, C has ${dC} — both odd.`,
        `Hitung jalur di tiap gerbang: A ada ${dA}, C ada ${dC} — keduanya ganjil.`,
      ),
    },
    {
      badges: allBadges,
      rings: allRings,
      hold: 2000,
      result: false,
      caption: t(
        `But B has ${dB} and D has ${dD} — both even, so they cannot be the ends.`,
        `Tapi B ada ${dB} dan D ada ${dD} — keduanya genap, jadi bukan ujungnya.`,
      ),
    },
    {
      badges: allBadges,
      rings: allRings,
      hold: 0,
      result: true,
      caption: t(
        'Only A and C are odd, so the entrance and exit go at A and C — answer C.',
        'Hanya A dan C yang ganjil, jadi pintu masuk dan keluar di A dan C — jawaban C.',
      ),
    },
  ]

  return { answer: 'A, C', steps, finalIndex: steps.length - 1 }
}
