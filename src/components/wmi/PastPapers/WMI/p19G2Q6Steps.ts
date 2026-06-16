import type { Lang } from '../concepts/explainers/makeTenSteps'

// Storyboard for WMI-19P2A-Q6 — apply the shape-combination rule.
//
// Rule from the worked example: the FIRST (top) shape becomes the open cup at
// the top of a Y-frame; the SECOND (solid stemmed) shape becomes the solid
// figure at the foot. Substituting triangle (top) + bowl (foot) builds the
// figure that matches choice A. The originals were images, so the explainer
// constructs the result and names the answer letter (A).

export const Q6_ANSWER_LETTER = 'A'

export interface Q6Step {
  /** Show the constructed answer in the bottom row's "?" slot. */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q6Storyboard {
  answerLetter: string
  steps: Q6Step[]
  finalIndex: number
}

export function buildP19G2Q6Steps(lang: Lang): Q6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q6Step[] = [
    {
      revealAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Read the rule: the two shapes just stack — first shape becomes the open cup on top, the solid one stays at the foot.',
        'Baca aturannya: kedua bentuk hanya ditumpuk — bentuk pertama jadi cangkir terbuka di atas, yang padat tetap di kaki.',
      ),
    },
    {
      revealAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Swap in the new parts: the triangle goes up top (as the cup), the stemmed bowl stays at the foot.',
        'Ganti bagiannya: segitiga naik ke atas (jadi cangkir), mangkuk bertangkai tetap di kaki.',
      ),
    },
    {
      revealAnswer: true,
      hold: 1800,
      result: false,
      caption: t(
        'That builds a Y: an open triangle-cup on top, the solid bowl at the foot — nothing added or flipped.',
        'Itu membentuk Y: cangkir segitiga terbuka di atas, mangkuk padat di kaki — tanpa tambahan atau dibalik.',
      ),
    },
    {
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `The choice showing exactly this figure is Figure ${Q6_ANSWER_LETTER} — answer ${Q6_ANSWER_LETTER}.`,
        `Pilihan yang menunjukkan persis gambar ini adalah Gambar ${Q6_ANSWER_LETTER} — jawaban ${Q6_ANSWER_LETTER}.`,
      ),
    },
  ]

  return { answerLetter: Q6_ANSWER_LETTER, steps, finalIndex: steps.length - 1 }
}
