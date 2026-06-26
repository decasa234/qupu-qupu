// SASMO 2019 G3 Q15 — toy balance-scale chain steps.
// Three scales establish: Train > 2 Cars (S1), Car > Ship (S2), Submarine > 2 Trains (S3).
// Full chain: Submarine > Train > Car > Ship → Submarine (B) is heaviest.
//
// Beat 0 — intro (all scales neutral)
// Beat 1 — Scale 1: Train > 2 Cars
// Beat 2 — Scale 2: 3 Cars > 3 Ships → Car > Ship
// Beat 3 — Scale 3: 1 Submarine > 2 Trains → Submarine > Train
// Beat 4 — result: Submarine is heaviest ✓

export type Lang = 'en' | 'id'

// Problem constants — bound to seed data
export const TRAINS_ON_SCALE1_RIGHT = 1
export const CARS_ON_SCALE1_RIGHT   = 2
export const SHIPS_ON_SCALE2        = 3
export const CARS_ON_SCALE2         = 3
export const TRAINS_ON_SCALE3       = 2
export const ANSWER_LABEL = 'B'   // Submarine / Kapal Selam

export type ToyScalesPhase = 'intro' | 'scale1' | 'scale2' | 'scale3' | 'result'

export interface ToyScalesSASMO19G3Q15Step {
  phase: ToyScalesPhase
  /** 1-indexed lit scale passed to <ToyScalesSASMO19G3Q15 litScale={...} />. null = all neutral. */
  litScale: 1 | 2 | 3 | null
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface ToyScalesSASMO19G3Q15Storyboard {
  steps: ToyScalesSASMO19G3Q15Step[]
  finalIndex: number
}

export function buildToyScalesSASMO19G3Q15Steps(lang: Lang): ToyScalesSASMO19G3Q15Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ToyScalesSASMO19G3Q15Step[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      litScale: null,
      equation: '',
      hold: 1600,
      result: false,
      caption: t(
        'Three scales compare the weights of four toys. Work through each scale to find the heaviest toy.',
        'Tiga timbangan membandingkan berat empat mainan. Kerjakan setiap timbangan untuk menemukan mainan yang paling berat.',
      ),
    },
    // Beat 1 — Scale 1: Train > 2 Cars
    {
      phase: 'scale1',
      litScale: 1,
      equation: t('1 Train > 2 Cars', '1 Kereta > 2 Mobil'),
      hold: 2200,
      result: false,
      caption: t(
        'Scale 1: the train side tips down — 1 train is heavier than 2 cars.',
        'Timbangan 1: sisi kereta turun — 1 kereta lebih berat dari 2 mobil.',
      ),
    },
    // Beat 2 — Scale 2: 3 Cars > 3 Ships → Car > Ship
    {
      phase: 'scale2',
      litScale: 2,
      equation: t('3 Cars > 3 Ships  →  Car > Ship', '3 Mobil > 3 Kapal  →  Mobil > Kapal'),
      hold: 2400,
      result: false,
      caption: t(
        'Scale 2: the car side tips down — 3 cars are heavier than 3 ships, so 1 car is heavier than 1 ship.',
        'Timbangan 2: sisi mobil turun — 3 mobil lebih berat dari 3 kapal, jadi 1 mobil lebih berat dari 1 kapal.',
      ),
    },
    // Beat 3 — Scale 3: Submarine > 2 Trains → Submarine > Train
    {
      phase: 'scale3',
      litScale: 3,
      equation: t('1 Submarine > 2 Trains  →  Submarine > Train', '1 Kapal Selam > 2 Kereta  →  Kapal Selam > Kereta'),
      hold: 2600,
      result: false,
      caption: t(
        'Scale 3: the submarine side tips down — 1 submarine is heavier than 2 trains, so submarine is heavier than train.',
        'Timbangan 3: sisi kapal selam turun — 1 kapal selam lebih berat dari 2 kereta, sehingga kapal selam lebih berat dari kereta.',
      ),
    },
    // Beat 4 — result
    {
      phase: 'result',
      litScale: null,
      equation: t('Submarine > Train > Car > Ship ✓', 'Kapal Selam > Kereta > Mobil > Kapal ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Chain: Submarine > Train > Car > Ship. The submarine is the heaviest toy. Answer: B.',
        'Rangkaian: Kapal Selam > Kereta > Mobil > Kapal. Kapal selam adalah mainan yang paling berat. Jawaban: B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
