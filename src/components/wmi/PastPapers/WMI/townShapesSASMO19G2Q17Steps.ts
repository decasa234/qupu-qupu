// Steps for SASMO-19-G2-Q17 — count triangles, rectangles, circles in a town scene.
// Quantities bound to seed: rectangles=15, triangles=8, circles=19, total=42.

export type TownShapesPhase = 'all' | 'triangles' | 'rectangles' | 'circles' | 'result'

export interface TownShapesStep {
  phase: TownShapesPhase
  caption: string
  hold: number
  result: boolean
}

export interface TownShapesStory {
  steps: TownShapesStep[]
  finalIndex: number
}

// seed quantities
export const N_TRIANGLES  = 8
export const N_RECTANGLES = 15
export const N_CIRCLES    = 19
export const N_TOTAL      = 42   // = 8 + 15 + 19

type Lang = 'en' | 'id'

export function buildTownShapesSteps(lang: Lang): TownShapesStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TownShapesStep[] = [
    {
      phase: 'all',
      hold: 1800,
      result: false,
      caption: t(
        'Count all triangles, rectangles, and circles in the town picture. Go shape by shape!',
        'Hitung semua segitiga, persegi panjang, dan lingkaran dalam gambar kota ini. Periksa satu per satu!',
      ),
    },
    {
      phase: 'triangles',
      hold: 2400,
      result: false,
      caption: t(
        `Triangles (purple): house roof + truck roof + 6 sky birds = ${N_TRIANGLES} triangles.`,
        `Segitiga (ungu): atap rumah + atap truk + 6 burung di langit = ${N_TRIANGLES} segitiga.`,
      ),
    },
    {
      phase: 'rectangles',
      hold: 2600,
      result: false,
      caption: t(
        `Rectangles (amber): house(8) + traffic light(2) + truck & trailer(4) + road(1) = ${N_RECTANGLES} rectangles.`,
        `Persegi panjang (kuning): rumah(8) + lampu lalu lintas(2) + truk & trailer(4) + jalan(1) = ${N_RECTANGLES} persegi panjang.`,
      ),
    },
    {
      phase: 'circles',
      hold: 2600,
      result: false,
      caption: t(
        `Circles (green): chimney bubbles(3) + door knob(1) + traffic lights(4) + wheels(4) + sun & rays(7) = ${N_CIRCLES} circles.`,
        `Lingkaran (hijau): gelembung cerobong(3) + kenop pintu(1) + lampu(4) + roda(4) + matahari & sinar(7) = ${N_CIRCLES} lingkaran.`,
      ),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        `Total: ${N_TRIANGLES} + ${N_RECTANGLES} + ${N_CIRCLES} = ${N_TOTAL}. The answer is ${N_TOTAL}.`,
        `Total: ${N_TRIANGLES} + ${N_RECTANGLES} + ${N_CIRCLES} = ${N_TOTAL}. Jawabannya adalah ${N_TOTAL}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
