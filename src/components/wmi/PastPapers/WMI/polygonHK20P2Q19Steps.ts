// HKIMO-20-P2H-Q19 step storyboard
// 14 beats: intro → count vertices 1-12 → result
// Bound to seed breakdown.quantities → {value:"12"}.

type Lang = 'en' | 'id'

export interface PolygonHK20P2Q19Step {
  /** Vertices highlighted so far (0 = none shown). */
  countedUpTo: number
  result: boolean
  hold: number
  caption: string
  /** Badge text — empty string hides the badge. */
  badge: string
}

export interface PolygonHK20P2Q19Story {
  steps: PolygonHK20P2Q19Step[]
  finalIndex: number
}

export function buildPolygonHK20P2Q19Steps(lang: Lang): PolygonHK20P2Q19Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const intro: PolygonHK20P2Q19Step = {
    countedUpTo: 0,
    result: false,
    hold: 1800,
    caption: t(
      'Every polygon has one interior angle at each corner. Count every corner!',
      'Setiap segibanyak punya satu sudut dalam di setiap pojok. Hitung semua pojoknya!',
    ),
    badge: '',
  }

  const countSteps: PolygonHK20P2Q19Step[] = Array.from({ length: 12 }, (_, i) => ({
    countedUpTo: i + 1,
    result: false,
    hold: i < 11 ? 500 : 700,
    caption: t(
      `Corner ${i + 1} → interior angle ${i + 1}`,
      `Pojok ${i + 1} → sudut dalam ${i + 1}`,
    ),
    badge: String(i + 1),
  }))

  const result: PolygonHK20P2Q19Step = {
    countedUpTo: 12,
    result: true,
    hold: 2400,
    caption: t(
      '12 corners → 12 interior angles. Answer: 12.',
      '12 pojok → 12 sudut dalam. Jawaban: 12.',
    ),
    badge: '= 12',
  }

  const steps: PolygonHK20P2Q19Step[] = [intro, ...countSteps, result]
  return { steps, finalIndex: steps.length - 1 }
}
