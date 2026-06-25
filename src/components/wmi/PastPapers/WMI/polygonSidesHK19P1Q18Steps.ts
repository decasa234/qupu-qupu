// polygonSidesHK19P1Q18Steps — HKIMO 2019 Heat Primary-1 Q18
// Beat-by-beat steps for tracing each side of the hexagon.

export type Lang = 'en' | 'id'

export interface Step {
  sideIndex: number | null // 0-5: which side to highlight; null = all
  caption: string
  hold: number // ms to hold this beat
  result?: boolean
}

export function buildPolygonSidesHK19P1Q18Steps(lang: Lang): {
  steps: Step[]
  finalIndex: number
} {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Step[] = [
    {
      sideIndex: null,
      caption: t(
        "This shape is a polygon. Let’s count its sides one by one.",
        'Bentuk ini adalah poligon. Mari hitung sisinya satu per satu.',
      ),
      hold: 1400,
    },
    {
      sideIndex: 0,
      caption: t('Side 1 — top edge.', 'Sisi 1 — sisi atas.'),
      hold: 900,
    },
    {
      sideIndex: 1,
      caption: t('Side 2 — right side going down.', 'Sisi 2 — sisi kanan turun.'),
      hold: 900,
    },
    {
      sideIndex: 2,
      caption: t('Side 3 — upper diagonal to the tip.', 'Sisi 3 — diagonal atas ke ujung.'),
      hold: 900,
    },
    {
      sideIndex: 3,
      caption: t('Side 4 — lower diagonal from the tip.', 'Sisi 4 — diagonal bawah dari ujung.'),
      hold: 900,
    },
    {
      sideIndex: 4,
      caption: t('Side 5 — bottom edge.', 'Sisi 5 — sisi bawah.'),
      hold: 900,
    },
    {
      sideIndex: 5,
      caption: t('Side 6 — left side going up.', 'Sisi 6 — sisi kiri naik.'),
      hold: 900,
    },
    {
      sideIndex: null,
      caption: t(
        '6 sides counted → this polygon has 6 sides!',
        '6 sisi dihitung → poligon ini memiliki 6 sisi!',
      ),
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
