// OSN-25-SD-NAS-FINAL-Q13 — setengah lingkaran dengan trapesium ORSQ
//
// Soal: Setengah lingkaran PQ=20 cm, O pada PQ dengan OP=4 cm, R pada busur,
// QS∥OR, SQ=(3/4)OR. Hitung luas segi empat ORSQ.
//
// Koordinat (skala 12px/cm, pusat M=(150,160)):
//   P=(30,160), O=(78,160), Q=(270,160)
//   R=(78,64): OR = 96px = 8 cm   [Pythagoras: √(10²−6²) = 8]
//   S=(270,88): QS = 72px = 6 cm  [(3/4)×8 = 6]
//   OQ = 192px = 16 cm            [tinggi trapesium]
//
// Luas = ½ × (8+6) × 16 = 112 cm²
//
// Beat count: 6 (intro → OQ → cari OR → cari QS → tinggi → luas)
// Pure builder — no Math.random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'oq' | 'find-r' | 'find-qs' | 'height' | 'area'

export interface Beat {
  phase: PhaseId
  /** Show OP and OQ dimension labels on the diameter. */
  showDiamDims: boolean
  /** Highlight OR with a brace/label. */
  showOR: boolean
  /** Highlight QS with a brace/label. */
  showQS: boolean
  /** Show OQ horizontal dimension brace below the figure. */
  showHeight: boolean
  /** Green tint on result beat. */
  result: boolean
  equation: string
  caption: string
  hold: number
}

export interface Storyboard {
  steps: Beat[]
  finalIndex: number
}

export function buildSemiTrapOSN25NFQ13Steps(lang: Lang): Storyboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: Beat[] = [
    {
      phase: 'intro',
      showDiamDims: false,
      showOR: false,
      showQS: false,
      showHeight: false,
      result: false,
      equation: '',
      hold: 2000,
      caption: t(
        'Semicircle PQ = 20 cm. O is on PQ with OP = 4 cm. R is on the arc above O; QS ∥ OR; SQ = ¾ OR.',
        'Setengah lingkaran PQ = 20 cm. O pada PQ dengan OP = 4 cm. R pada busur di atas O; QS ∥ OR; SQ = ¾ OR.',
      ),
    },
    {
      phase: 'oq',
      showDiamDims: true,
      showOR: false,
      showQS: false,
      showHeight: false,
      result: false,
      equation: 'OQ = 20 − 4 = 16 cm',
      hold: 2200,
      caption: t(
        'OP = 4 cm, so OQ = 20 − 4 = 16 cm. The centre M is 6 cm from O (radius − OP = 10 − 4 = 6).',
        'OP = 4 cm, maka OQ = 20 − 4 = 16 cm. Pusat M berjarak 6 cm dari O (jari-jari − OP = 10 − 4 = 6).',
      ),
    },
    {
      phase: 'find-r',
      showDiamDims: true,
      showOR: true,
      showQS: false,
      showHeight: false,
      result: false,
      equation: 'OR = √(10² − 6²) = 8 cm',
      hold: 2500,
      caption: t(
        'R is on the semicircle directly above O. By Pythagoras: OR = √(100 − 36) = √64 = 8 cm.',
        'R terletak pada setengah lingkaran tepat di atas O. Dengan Pythagoras: OR = √(100 − 36) = √64 = 8 cm.',
      ),
    },
    {
      phase: 'find-qs',
      showDiamDims: true,
      showOR: true,
      showQS: true,
      showHeight: false,
      result: false,
      equation: 'QS = ¾ × 8 = 6 cm',
      hold: 2200,
      caption: t(
        'QS is parallel to OR and SQ = ¾ OR = ¾ × 8 = 6 cm. The right angle at Q confirms QS ⊥ PQ.',
        'QS sejajar OR dan SQ = ¾ OR = ¾ × 8 = 6 cm. Sudut siku-siku di Q memastikan QS ⊥ PQ.',
      ),
    },
    {
      phase: 'height',
      showDiamDims: true,
      showOR: true,
      showQS: true,
      showHeight: true,
      result: false,
      equation: 'Tinggi ORSQ = OQ = 16 cm',
      hold: 2200,
      caption: t(
        'ORSQ is a trapezoid: parallel sides OR = 8 cm and QS = 6 cm; perpendicular height = OQ = 16 cm.',
        'ORSQ adalah trapesium: sisi sejajar OR = 8 cm dan QS = 6 cm; tinggi tegak lurus = OQ = 16 cm.',
      ),
    },
    {
      phase: 'area',
      showDiamDims: true,
      showOR: true,
      showQS: true,
      showHeight: true,
      result: true,
      equation: '½ × (8 + 6) × 16 = 112 cm²',
      hold: 0,
      caption: t(
        'Area = ½ × (OR + QS) × OQ = ½ × 14 × 16 = 112 cm².',
        'Luas = ½ × (OR + QS) × OQ = ½ × 14 × 16 = 112 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
