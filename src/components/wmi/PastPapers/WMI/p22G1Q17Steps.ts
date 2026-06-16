import type { Lang } from '../concepts/explainers/makeTenSteps'
import { LAYER_COUNTS, TOTAL_CUBES } from './P22G1Q17Illustration'

// WMI-22P1A-Q17 — "How many cubes in each layer?" (Grade 1, answer B = [4,1,1]).
//
// The animation slices the solid bottom → top, lighting one horizontal layer per
// beat and reporting its cube count, then states the layer list and lands on the
// keyed option. Counts derive from LAYER_COUNTS — never hardcoded.

export interface Q17Step {
  /** Which z-layer is lit on this beat (-1 = none / intro / final). */
  litLayer: number
  /** Running list of counts revealed so far (bottom → top). */
  revealed: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  layers: number[]
  total: number
  answerLetter: string
  steps: Q17Step[]
  finalIndex: number
}

function ordinal(z: number, lang: Lang): string {
  // z is 0-based from the bottom.
  const en = ['bottom', 'middle', 'top']
  const id = ['bawah', 'tengah', 'atas']
  return lang === 'id' ? id[z] ?? `lapis ${z + 1}` : en[z] ?? `layer ${z + 1}`
}

export function buildP22G1Q17Steps(lang: Lang, answerLetter: string): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const layers = LAYER_COUNTS // [4, 1, 1]

  const steps: Q17Step[] = [
    {
      litLayer: -1,
      revealed: [],
      hold: 2000,
      result: false,
      caption: t(
        'Slice the solid into flat layers and count the cubes in each.',
        'Iris bangun ini menjadi lapisan mendatar, lalu hitung kubus tiap lapisan.',
      ),
    },
  ]

  // One beat per layer, bottom → top.
  layers.forEach((n, z) => {
    const revealed = layers.slice(0, z + 1)
    steps.push({
      litLayer: z,
      revealed,
      hold: 2000,
      result: false,
      caption: t(
        `The ${ordinal(z, 'en')} layer has ${n} ${n === 1 ? 'cube' : 'cubes'}.`,
        `Lapisan ${ordinal(z, 'id')} berisi ${n} kubus.`,
      ),
    })
  })

  // Final beat — the layer list + the keyed option.
  steps.push({
    litLayer: -1,
    revealed: layers,
    hold: 0,
    result: true,
    caption: t(
      `Layers (bottom to top): ${layers.join(', ')} — ${TOTAL_CUBES} cubes. That is figure ${answerLetter}.`,
      `Lapisan (bawah ke atas): ${layers.join(', ')} — ${TOTAL_CUBES} kubus. Itu gambar ${answerLetter}.`,
    ),
  })

  return { layers, total: TOTAL_CUBES, answerLetter, steps, finalIndex: steps.length - 1 }
}
