// Beat storyboard for SEAMOX-23-B-Q9.
//
// Logic (bound to seed breakdown.quantities):
//   Small equilateral triangle side = a → circumradius R = a / √3 (= circle radius).
//   Circle is the inscribed circle of the big triangle; inradius of equilateral Δ
//   with side A = A / (2√3), so A / (2√3) = a / √3 → A = 2a.
//   Area ratio = a² : (2a)² = 1 : 4 → m = 1, n = 4, m + n = 5.

type Lang = 'en' | 'id'

export interface TriInCircleStep {
  showLabels: boolean
  highlightSmall: boolean
  highlightBig: boolean
  result: boolean
  hold: number
  equation: string
  caption: string
}

export interface TriInCircleStory {
  steps: TriInCircleStep[]
  finalIndex: number
}

export function buildTriInCircleX23B9Steps(lang: Lang): TriInCircleStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriInCircleStep[] = [
    {
      showLabels: false,
      highlightSmall: false,
      highlightBig: false,
      result: false,
      hold: 1600,
      equation: '',
      caption: t(
        'An equilateral triangle is inscribed in a circle, which is inscribed in a bigger equilateral triangle. We need the area ratio.',
        'Segitiga sama sisi kecil terdapat di dalam lingkaran, yang terdapat di dalam segitiga sama sisi besar. Kita perlu rasio luasnya.',
      ),
    },
    {
      showLabels: true,
      highlightSmall: true,
      highlightBig: false,
      result: false,
      hold: 2000,
      equation: 'R = a / √3',
      caption: t(
        'Let the small triangle have side a. Its circumradius (= the circle radius) is R = a / √3.',
        'Misal sisi segitiga kecil adalah a. Jari-jari lingkaran luarnya (= jari-jari lingkaran) adalah R = a / √3.',
      ),
    },
    {
      showLabels: true,
      highlightSmall: false,
      highlightBig: true,
      result: false,
      hold: 2200,
      equation: 'A / (2√3) = R',
      caption: t(
        'The circle is the inscribed circle of the big triangle. Inradius of an equilateral triangle with side A is A / (2√3), so A / (2√3) = R = a / √3.',
        'Lingkaran adalah lingkaran dalam segitiga besar. Inradius segitiga sama sisi bersisi A adalah A / (2√3), jadi A / (2√3) = R = a / √3.',
      ),
    },
    {
      showLabels: true,
      highlightSmall: true,
      highlightBig: true,
      result: false,
      hold: 2200,
      equation: 'A = 2a',
      caption: t(
        'Solving: A / (2√3) = a / √3 → A = 2a. The big triangle has side twice that of the small triangle!',
        'Penyelesaian: A / (2√3) = a / √3 → A = 2a. Sisi segitiga besar dua kali sisi segitiga kecil!',
      ),
    },
    {
      showLabels: true,
      highlightSmall: true,
      highlightBig: true,
      result: true,
      hold: 0,
      equation: '1 : 4 → m + n = 5',
      caption: t(
        'Area ratio = a² : (2a)² = 1 : 4. So m = 1, n = 4, and m + n = 5.',
        'Rasio luas = a² : (2a)² = 1 : 4. Jadi m = 1, n = 4, dan m + n = 5.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
