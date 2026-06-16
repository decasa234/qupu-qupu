import type { Lang } from '../concepts/explainers/makeTenSteps'
import { LINKS, WHEELS, traceSpins, type LinkKind, type Spin } from './P19G2Q11Illustration'

// WMI-19P2A-Q11 — trace the spin from the arrow wheel along the chain of belts and
// the one rigid axle, link by link, to wheel A. The option figures (a picture of
// wheel A with a spin arrow) are not viewable; the official answer is B.
//
// The explainer reveals one wheel's spin per beat using the link rule:
//   open belt → SAME, crossed belt → OPPOSITE, rigid axle → SAME.
// It lands on wheel A's direction and names the matching option letter.

export interface Q11Step {
  /** Reveal spin arrows on wheels 0..tracedTo. */
  tracedTo: number
  /** Wheel ring-highlighted this beat (the one just resolved). */
  focus?: number
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  answer: string
  answerSpin: Spin
  steps: Q11Step[]
  finalIndex: number
}

const SPIN_WORD: Record<Spin, [string, string]> = {
  ccw: ['counter-clockwise', 'berlawanan arah jarum jam'],
  cw: ['clockwise', 'searah jarum jam'],
}

const LINK_WORD: Record<LinkKind, [string, string]> = {
  open: ['an open belt → SAME way', 'sabuk lurus → arah SAMA'],
  crossed: ['a crossed belt → OPPOSITE way', 'sabuk menyilang → arah BERLAWANAN'],
  axle: ['a rigid axle → SAME way', 'poros kaku → arah SAMA'],
}

export function buildP19G2Q11Steps(answer: string, lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const letter = (answer || 'B').trim().toUpperCase() || 'B'
  const spins = traceSpins()
  const sw = (s: Spin) => t(SPIN_WORD[s][0], SPIN_WORD[s][1])

  const steps: Q11Step[] = [
    {
      tracedTo: 0,
      focus: 0,
      hold: 2400,
      result: false,
      caption: t(
        `Start: the arrow wheel turns ${sw(spins[0])}. Follow the spin to A one link at a time.`,
        `Mulai: roda berpanah berputar ${sw(spins[0])}. Ikuti putaran ke A satu sambungan setiap kali.`,
      ),
    },
  ]

  // One beat per link: reveal the driven wheel's spin.
  LINKS.forEach((l) => {
    const driven = WHEELS[l.to]
    steps.push({
      tracedTo: l.to,
      focus: l.to,
      hold: 2100,
      result: false,
      caption: t(
        `Through ${LINK_WORD[l.kind][0]}: wheel ${driven.id === 'A' ? 'A' : `#${l.to + 1}`} now turns ${sw(spins[l.to])}.`,
        `Lewat ${LINK_WORD[l.kind][1]}: roda ${driven.id === 'A' ? 'A' : `#${l.to + 1}`} kini berputar ${sw(spins[l.to])}.`,
      ),
    })
  })

  const aSpin = spins[WHEELS.length - 1]
  steps.push({
    tracedTo: WHEELS.length - 1,
    focus: WHEELS.length - 1,
    hold: 0,
    result: true,
    caption: t(
      `So wheel A turns ${sw(aSpin)} — that is the spin shown in Figure ${letter}.`,
      `Jadi roda A berputar ${sw(aSpin)} — itulah putaran pada Gambar ${letter}.`,
    ),
  })

  return { answer: letter, answerSpin: aSpin, steps, finalIndex: steps.length - 1 }
}
