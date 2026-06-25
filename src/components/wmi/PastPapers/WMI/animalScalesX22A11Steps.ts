// SEAMO-X 2022 Paper A Q11 — animal balance chain steps.
// Chain: 1 rabbit = 3 squirrels, 1 squirrel = 2 birds, 1 bird = 2 chicks.
// Answer: 3 × 2 × 2 = 12 chicks balance 1 rabbit.
//
// Beat 0 — intro (all scales neutral)
// Beat 1 — focus scale 1: 1 rabbit = 3 squirrels
// Beat 2 — focus scale 2: 1 squirrel = 2 birds → 3 squirrels = 6 birds
// Beat 3 — focus scale 3: 1 bird = 2 chicks → 6 birds = 12 chicks
// Beat 4 — focus scale 4: 1 rabbit = 12 chicks ✓

export type Lang = 'en' | 'id'

// Problem constants — bound to seed quantities
export const RABBIT_TO_SQUIRRELS = 3
export const SQUIRREL_TO_BIRDS = 2
export const BIRD_TO_CHICKS = 2
export const ANSWER = 12   // 3 × 2 × 2

export type AnimalScalesX22A11Phase = 'intro' | 'scale1' | 'scale2' | 'scale3' | 'result'

export interface AnimalScalesX22A11Step {
  phase: AnimalScalesX22A11Phase
  /** 1-indexed lit scale passed to <AnimalScalesX22A11 litScale={...} />. null = all neutral. */
  litScale: number | null
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface AnimalScalesX22A11Storyboard {
  answer: number
  steps: AnimalScalesX22A11Step[]
  finalIndex: number
}

export function buildAnimalScalesX22A11Steps(lang: Lang): AnimalScalesX22A11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimalScalesX22A11Step[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      litScale: null,
      equation: '',
      hold: 1600,
      result: false,
      caption: t(
        'Four scales show a weight chain. Work through them in order to find how many chicks balance 1 rabbit.',
        'Empat timbangan menunjukkan rantai berat. Kerjakan berurutan untuk menemukan berapa anak ayam setara 1 kelinci.',
      ),
    },
    // Beat 1 — scale 1
    {
      phase: 'scale1',
      litScale: 1,
      equation: t('1 rabbit = 3 squirrels', '1 kelinci = 3 tupai'),
      hold: 2200,
      result: false,
      caption: t(
        'Scale 1 (balanced): 1 rabbit weighs the same as 3 squirrels.',
        'Timbangan 1 (seimbang): 1 kelinci sama beratnya dengan 3 tupai.',
      ),
    },
    // Beat 2 — scale 2
    {
      phase: 'scale2',
      litScale: 2,
      equation: t('1 squirrel = 2 birds  →  3 squirrels = 6 birds', '1 tupai = 2 burung  →  3 tupai = 6 burung'),
      hold: 2600,
      result: false,
      caption: t(
        'Scale 2 (balanced): 1 squirrel = 2 birds. So 3 squirrels = 3 × 2 = 6 birds.',
        'Timbangan 2 (seimbang): 1 tupai = 2 burung. Jadi 3 tupai = 3 × 2 = 6 burung.',
      ),
    },
    // Beat 3 — scale 3
    {
      phase: 'scale3',
      litScale: 3,
      equation: t('1 bird = 2 chicks  →  6 birds = 12 chicks', '1 burung = 2 anak ayam  →  6 burung = 12 anak ayam'),
      hold: 2600,
      result: false,
      caption: t(
        'Scale 3 (balanced): 1 bird = 2 chicks. So 6 birds = 6 × 2 = 12 chicks.',
        'Timbangan 3 (seimbang): 1 burung = 2 anak ayam. Jadi 6 burung = 6 × 2 = 12 anak ayam.',
      ),
    },
    // Beat 4 — result
    {
      phase: 'result',
      litScale: 4,
      equation: t('1 rabbit = 12 chicks ✓', '1 kelinci = 12 anak ayam ✓'),
      hold: 0,
      result: true,
      caption: t(
        '1 rabbit = 3 squirrels = 6 birds = 12 chicks. The answer is 12.',
        '1 kelinci = 3 tupai = 6 burung = 12 anak ayam. Jawabannya adalah 12.',
      ),
    },
  ]

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
