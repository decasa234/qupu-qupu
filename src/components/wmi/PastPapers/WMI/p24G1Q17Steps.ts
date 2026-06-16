import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24P1A-Q17 storyboard — rotation match.
//
// The figure is asymmetric: 2 dark spots sit together, 2 white holes sit
// together, and their arrangement around the body is fixed. A correct option is
// just the SAME shape turned (rotated) — every spot and hole keeps the same
// place relative to its neighbours. The matching option is A.
//
// The beats turn a copy of the reference shape to show that rotating never
// changes which features touch which, so the rotated copy is still the same
// figure → option A.

export type RotPhase = 'show' | 'features' | 'rule' | 'turn1' | 'turn2' | 'result'

export interface RotStep {
  phase: RotPhase
  /** Rotation (deg) applied to the demo copy. */
  rotate: number
  /** Ring the spots/holes to point out the fixed feature pattern. */
  markFeatures: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RotStoryboard {
  answer: string
  steps: RotStep[]
  finalIndex: number
}

export function buildP24G1Q17Steps(lang: Lang, answer: string): RotStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RotStep[] = [
    {
      phase: 'show',
      rotate: 0,
      markFeatures: false,
      hold: 1600,
      result: false,
      caption: t('Here is the figure we must match.', 'Ini bentuk yang harus kita cocokkan.'),
    },
    {
      phase: 'features',
      rotate: 0,
      markFeatures: true,
      hold: 2100,
      result: false,
      caption: t(
        'Note its fixed pattern: 2 dark spots together, 2 white holes together.',
        'Catat polanya yang tetap: 2 bintik gelap berdampingan, 2 lubang putih berdampingan.',
      ),
    },
    {
      phase: 'rule',
      rotate: 0,
      markFeatures: true,
      hold: 1900,
      result: false,
      caption: t(
        'A true match may be turned, but every spot and hole keeps its place.',
        'Yang cocok boleh diputar, tapi setiap bintik dan lubang tetap di tempatnya.',
      ),
    },
    {
      phase: 'turn1',
      rotate: 90,
      markFeatures: true,
      hold: 1700,
      result: false,
      caption: t('Turn it a quarter — the pattern travels with it, unchanged.', 'Putar seperempat — polanya ikut berputar, tak berubah.'),
    },
    {
      phase: 'turn2',
      rotate: 200,
      markFeatures: true,
      hold: 1700,
      result: false,
      caption: t('Keep turning — still the same shape, just rotated.', 'Terus putar — tetap bentuk yang sama, hanya diputar.'),
    },
    {
      phase: 'result',
      rotate: 200,
      markFeatures: false,
      hold: 0,
      result: true,
      caption: t(
        `Only option ${answer} keeps this exact pattern — answer ${answer}.`,
        `Hanya opsi ${answer} yang mempertahankan pola persis ini — jawaban ${answer}.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
