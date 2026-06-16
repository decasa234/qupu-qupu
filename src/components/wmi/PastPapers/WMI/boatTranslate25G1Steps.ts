// WMI-25F1A-Q7 (2025 Grade 1 Final) — storyboard for the "slide the boat" animation.
//
// A pure translation (slide) keeps a shape's SIZE and ORIENTATION. So the moving
// boat A can only land exactly on boats that are identical copies of it. The
// teaching walk: name the rule, then try-and-eliminate the look-alikes (tilted,
// bigger, sail-centred near-miss) before lighting the two true matches and
// counting them.
//
// Pure builder: (lang) => storyboard. No random, no dates, SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { BOAT_MATCHES, BOAT_ANSWER } from './BoatTranslate25G1Illustration'

export type BoatPhase = 'goal' | 'rule' | 'reject' | 'match' | 'result'

export interface BoatStep {
  phase: BoatPhase
  /** Boats lit on this beat (indices into BOATS). */
  litBoats: number[]
  /** Draw the dashed slide arrow from A (true once we slide onto the matches). */
  showSlide: boolean
  /** A boat being rejected this beat (for the "X" badge); null otherwise. */
  rejecting: boolean
  /** Running count of confirmed matches shown so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface BoatStoryboard {
  answer: number
  steps: BoatStep[]
  finalIndex: number
}

// Indices into BOATS for the look-alikes we eliminate, in walk order. These
// mirror the comments in BoatTranslate25G1Illustration (b2/b6/b7 tilted,
// b5/b9 bigger, b8 sail-centred). We bundle them into kid-sized rejection beats.
const TILTED = [1, 5, 6] // b2, b6, b7 — rotated, wrong way round
const BIGGER = [4, 8] // b5, b9 — a different size
const NEARMISS = [7] // b8 — upright but the sail sits in the middle

export function buildBoatTranslate25G1Steps(lang: Lang): BoatStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const matches = [...BOAT_MATCHES]

  const steps: BoatStep[] = [
    {
      phase: 'goal',
      litBoats: [],
      showSlide: false,
      rejecting: false,
      running: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Slide boat A across the grid. How many boats does it land exactly on top of?',
        'Geser perahu A menyusuri grid. Berapa perahu yang tepat ditutupinya?',
      ),
    },
    {
      phase: 'rule',
      litBoats: [],
      showSlide: false,
      rejecting: false,
      running: 0,
      hold: 2300,
      result: false,
      caption: t(
        'A slide can’t turn or resize. So only boats that look EXACTLY like A can match.',
        'Menggeser tak bisa memutar atau mengubah ukuran. Jadi hanya perahu yang persis seperti A yang cocok.',
      ),
    },
    {
      phase: 'reject',
      litBoats: TILTED,
      showSlide: false,
      rejecting: true,
      running: 0,
      hold: 2100,
      result: false,
      caption: t(
        'These are tilted the wrong way — a slide can’t spin A. Skip them.',
        'Yang ini miring ke arah salah — menggeser tak bisa memutar A. Lewati.',
      ),
    },
    {
      phase: 'reject',
      litBoats: BIGGER,
      showSlide: false,
      rejecting: true,
      running: 0,
      hold: 2100,
      result: false,
      caption: t(
        'These are bigger — a slide can’t change size. Skip them too.',
        'Yang ini lebih besar — menggeser tak bisa mengubah ukuran. Lewati juga.',
      ),
    },
    {
      phase: 'reject',
      litBoats: NEARMISS,
      showSlide: false,
      rejecting: true,
      running: 0,
      hold: 2100,
      result: false,
      caption: t(
        'This one is upright but its sail sits in the middle — not the same. Skip it.',
        'Yang ini tegak tapi layarnya di tengah — tidak sama. Lewati.',
      ),
    },
    {
      phase: 'match',
      litBoats: [matches[0]],
      showSlide: true,
      rejecting: false,
      running: 1,
      hold: 2000,
      result: false,
      caption: t(
        'Slide A here: same shape, same way round — it fits! That’s 1.',
        'Geser A ke sini: bentuk sama, arah sama — pas! Itu 1.',
      ),
    },
    {
      phase: 'match',
      litBoats: matches,
      showSlide: true,
      rejecting: false,
      running: 2,
      hold: 2000,
      result: false,
      caption: t(
        'This one is an exact copy too — it fits! That’s 2.',
        'Yang ini juga salinan persis — pas! Itu 2.',
      ),
    },
    {
      phase: 'result',
      litBoats: matches,
      showSlide: true,
      rejecting: false,
      running: BOAT_ANSWER,
      hold: 0,
      result: true,
      caption: t(
        `Two boats are exact copies of A, so the slide lands on ${BOAT_ANSWER}.`,
        `Dua perahu adalah salinan persis A, jadi geseran mendarat pada ${BOAT_ANSWER}.`,
      ),
    },
  ]

  return { answer: BOAT_ANSWER, steps, finalIndex: steps.length - 1 }
}
