import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SIMOC21G1Q18Phase =
  | 'overview'
  | 'scale3a'
  | 'scale3b'
  | 'scale2a'
  | 'scale2b'
  | 'result'

export interface SIMOC21G1Q18Step {
  phase: SIMOC21G1Q18Phase
  activeScale: 0 | 1 | 2 | 3
  caption: string
  hold: number
  result: boolean
}

export interface SIMOC21G1Q18Storyboard {
  steps: SIMOC21G1Q18Step[]
  finalIndex: number
}

// ── Problem constants (bound to seed quantities) ──────────────────────────────

export const DELIMA_ORANYE_VAL = 1   // given: orange pomegranate = 1
export const DELIMA_MERAH_VAL = 2    // given: red pomegranate = 2
export const PIR_HIJAU_VAL = 3       // derived: 2P = 3R → P = 1.5 × 2 = 3
export const APEL_KUNING_VAL = 4     // answer: A = O + 3R − P = 1+6−3 = 4

/**
 * Beat-by-beat storyboard for SIMOC-21-G1-Q18.
 *
 * Strategy:
 *   Beat 1 — Overview: all three scales.
 *   Beat 2 — Highlight Scale 3: read the equation 2P = 3R.
 *   Beat 3 — Compute pir_hijau: R=2 → P = 3.
 *   Beat 4 — Highlight Scale 2: read the equation A+P+R = O+4R.
 *   Beat 5 — Substitute known values: A = O + 3R − P.
 *   Beat 6 — Result: A = 1 + 6 − 3 = 4.
 */
export function buildFruitScalesSIMOC21G1Q18Steps(lang: Lang): SIMOC21G1Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SIMOC21G1Q18Step[] = [
    {
      phase: 'overview',
      activeScale: 0,
      hold: 1800,
      result: false,
      caption: t(
        `Three balanced scales relate 5 fruits. Given: orange pomegranate = ${DELIMA_ORANYE_VAL}, red pomegranate = ${DELIMA_MERAH_VAL}.`,
        `Tiga timbangan seimbang menghubungkan 5 buah. Diketahui: delima oranye = ${DELIMA_ORANYE_VAL}, delima merah = ${DELIMA_MERAH_VAL}.`,
      ),
    },
    {
      phase: 'scale3a',
      activeScale: 3,
      hold: 2000,
      result: false,
      caption: t(
        'Scale 3: 2 green pears = 3 red pomegranates → green pear = 1.5 × red pomegranate.',
        'Timbangan 3: 2 pir hijau = 3 delima merah → pir hijau = 1,5 × delima merah.',
      ),
    },
    {
      phase: 'scale3b',
      activeScale: 3,
      hold: 2000,
      result: false,
      caption: t(
        `Red pomegranate = ${DELIMA_MERAH_VAL}, so green pear = 1.5 × ${DELIMA_MERAH_VAL} = ${PIR_HIJAU_VAL}.`,
        `Delima merah = ${DELIMA_MERAH_VAL}, jadi pir hijau = 1,5 × ${DELIMA_MERAH_VAL} = ${PIR_HIJAU_VAL}.`,
      ),
    },
    {
      phase: 'scale2a',
      activeScale: 2,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 2: yellow apple + green pear + red pomegranate = orange pomegranate + 4 red pomegranates.',
        'Timbangan 2: apel kuning + pir hijau + delima merah = delima oranye + 4 delima merah.',
      ),
    },
    {
      phase: 'scale2b',
      activeScale: 2,
      hold: 2200,
      result: false,
      caption: t(
        `Yellow apple = orange pomegranate + 3 × red pomegranate − green pear = ${DELIMA_ORANYE_VAL} + ${3 * DELIMA_MERAH_VAL} − ${PIR_HIJAU_VAL}.`,
        `Apel kuning = delima oranye + 3 × delima merah − pir hijau = ${DELIMA_ORANYE_VAL} + ${3 * DELIMA_MERAH_VAL} − ${PIR_HIJAU_VAL}.`,
      ),
    },
    {
      phase: 'result',
      activeScale: 0,
      hold: 0,
      result: true,
      caption: t(
        `Yellow apple = ${DELIMA_ORANYE_VAL} + ${3 * DELIMA_MERAH_VAL} − ${PIR_HIJAU_VAL} = ${APEL_KUNING_VAL} ✓ — answer: ${APEL_KUNING_VAL}.`,
        `Apel kuning = ${DELIMA_ORANYE_VAL} + ${3 * DELIMA_MERAH_VAL} − ${PIR_HIJAU_VAL} = ${APEL_KUNING_VAL} ✓ — jawaban: ${APEL_KUNING_VAL}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
