// Storyboard for WMI-24F3A-Q24 — the rabbit's jump path.
//
// Pure builder: turns the shared jump data into ordered beats. There is exactly
// ONE path that skips over all eight stones and finishes at the carrot:
// E, F, H, G, B, A, C, D. We trace it one jump per beat, stamping each stone
// with its visit number, then read the visit numbers of A, C, E, G to assemble
// ACEG = 6714. Everything is derived from JUMP_ORDER / VISIT_ORDER / ACEG (the
// anti-drift glue) — nothing is hard-coded differently from the illustration.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { JUMP_ORDER_24G3, VISIT_ORDER_24G3, ACEG_24G3 } from './RabbitGrid24G3Illustration'

export interface RabbitStep {
  caption: string
  /** Trace the jump path up to (and including) this landing index; -1 = setup only. */
  pathUpto: number
  /** The stone being jumped this beat (null on the intro / read-off beats). */
  litStone: string | null
  /** Visit numbers revealed so far for the answer-key stones A, C, E, G. */
  revealed: Partial<Record<'A' | 'C' | 'E' | 'G', number>>
  /** This is the final winning beat (answer assembled). */
  result: boolean
  /** How long to hold this beat on screen, in ms (the winner lands with hold 0). */
  hold: number
}

export interface RabbitStoryboard {
  jumpOrder: readonly string[]
  answer: string
  /** Visit numbers of the four answer-key stones, in A,C,E,G order. */
  aceg: { A: number; C: number; E: number; G: number }
  steps: RabbitStep[]
  finalIndex: number
}

const KEY_STONES = ['A', 'C', 'E', 'G'] as const
type KeyStone = (typeof KEY_STONES)[number]
const isKey = (s: string): s is KeyStone => (KEY_STONES as readonly string[]).includes(s)

export function buildRabbitSteps(lang: Lang): RabbitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const aceg = {
    A: VISIT_ORDER_24G3.A,
    C: VISIT_ORDER_24G3.C,
    E: VISIT_ORDER_24G3.E,
    G: VISIT_ORDER_24G3.G,
  }

  const steps: RabbitStep[] = [
    {
      caption: t(
        'The rabbit must skip over every stone once and land on the carrot. Only one path works!',
        'Kelinci harus melompati setiap batu sekali dan mendarat di wortel. Hanya satu jalur yang berhasil!',
      ),
      pathUpto: 0,
      litStone: null,
      revealed: {},
      result: false,
      hold: 2600,
    },
  ]

  // Trace the single path, one jump per beat, stamping each stone's visit number.
  const revealed: Partial<Record<KeyStone, number>> = {}
  JUMP_ORDER_24G3.forEach((stone, i) => {
    const visit = VISIT_ORDER_24G3[stone] // = i + 1
    if (isKey(stone)) revealed[stone] = visit
    const keyNote = isKey(stone)
      ? t(` — that's an answer stone, ${stone}=${visit}!`, ` — itu batu jawaban, ${stone}=${visit}!`)
      : ''
    steps.push({
      caption: t(
        `Jump ${visit}: skip over ${stone}.${keyNote}`,
        `Lompatan ${visit}: lewati ${stone}.${keyNote}`,
      ),
      pathUpto: i + 1,
      litStone: stone,
      revealed: { ...revealed },
      result: false,
      // Each jump lingers so the path growing + the stamp reads.
      hold: 1900,
    })
  })

  // Read off A, C, E, G in order to assemble the answer.
  steps.push({
    caption: t(
      `Read the visit numbers: A=${aceg.A}, C=${aceg.C}, E=${aceg.E}, G=${aceg.G}.`,
      `Baca nomor kunjungan: A=${aceg.A}, C=${aceg.C}, E=${aceg.E}, G=${aceg.G}.`,
    ),
    pathUpto: JUMP_ORDER_24G3.length,
    litStone: null,
    revealed: { ...revealed },
    result: false,
    hold: 2800,
  })

  steps.push({
    caption: t(
      `So ACEG = ${ACEG_24G3}.`,
      `Jadi ACEG = ${ACEG_24G3}.`,
    ),
    pathUpto: JUMP_ORDER_24G3.length,
    litStone: null,
    revealed: { ...revealed },
    result: true,
    hold: 0,
  })

  return {
    jumpOrder: JUMP_ORDER_24G3,
    answer: ACEG_24G3,
    aceg,
    steps,
    finalIndex: steps.length - 1,
  }
}
