// OSN-20-SD-KAB-Q6 — explainer storyboard
// Data: 2015=124, 2016=140, 2017=120, 2018=160. Answer: Diagram A.

export interface BarChartOptsStep {
  /** Which diagram to render; null = show Diagram A throughout. */
  diagram: 'A' | 'B' | 'C' | 'D'
  /** Highlight one year bar; null = all bars at full opacity. */
  focusYear: string | null
  caption: string
  hold: number
  result: boolean
}

export function buildBarChartOptsOSN20KQ6Steps(lang: 'en' | 'id'): BarChartOptsStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      diagram: 'A',
      focusYear: null,
      hold: 2400,
      result: false,
      caption: t(
        'Data: 2015=124, 2016=140, 2017=120, 2018=160. We need the chart with those relative bar heights.',
        'Data: 2015=124, 2016=140, 2017=120, 2018=160. Kita cari diagram dengan tinggi batang sesuai data.',
      ),
    },
    {
      diagram: 'A',
      focusYear: "'17",
      hold: 2200,
      result: false,
      caption: t(
        'Key check: 2017 (120) is the SHORTEST — the only year below 2015 (124).',
        'Kunci: batang 2017 (120) harus paling pendek — satu-satunya tahun di bawah 2015 (124).',
      ),
    },
    {
      diagram: 'A',
      focusYear: "'18",
      hold: 2200,
      result: false,
      caption: t(
        '2018 (160) must be the TALLEST bar — the highest value.',
        '2018 (160) harus menjadi batang TERTINGGI — nilai terbesar.',
      ),
    },
    {
      diagram: 'A',
      focusYear: null,
      hold: 0,
      result: true,
      caption: t(
        'Diagram A: 2016 slightly higher than 2015, 2017 dips just below 2015, 2018 clearly tallest. Matches the data exactly.',
        'Diagram A: 2016 sedikit lebih tinggi dari 2015, 2017 sedikit di bawah 2015, 2018 tertinggi. Sesuai data.',
      ),
    },
  ]
}
