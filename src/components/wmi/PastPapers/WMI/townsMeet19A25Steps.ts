// Storyboard for SEAMO-19-A-Q25 — two-vehicles closing-speed meeting problem.
//
// Town A → truck (60 km/h) → →     ← ← car (70 km/h) ← Town B
// Total distance: 650 km
// Combined speed: 60 + 70 = 130 km/h
// Time to meet:   650 ÷ 130 = 5 hours
// Departure:      9:00 AM → meeting at 9:00 AM + 5 h = 2:00 PM
//
// Beat-by-beat:
//   0 — intro: vehicles at their starting towns, show distance 650 km
//   1 — combined speed: 60 + 70 = 130 km/h
//   2 — time to meet: 650 ÷ 130 = 5 hours; vehicles shown halfway
//   3 — answer: 9:00 AM + 5 h = 2:00 PM; show meeting marker
//
// Quantities from breakdown bind these beats (anti-drift):
//   combinedSpeed = 130 km/h
//   timeToMeet    = 5 hours
//   meetingTime   = 2:00 PM
//
// Pure function of lang — SSR-safe, deterministic.

export type Lang = 'en' | 'id'

export interface TownsMeet19A25Step {
  /** Truck fractional position along road [0=Town A, 1=Town B]. */
  truckFrac: number
  /** Sedan fractional position along road [0=Town A, 1=Town B]. */
  sedanFrac: number
  /** Show the distance label above the road. */
  showDistance: boolean
  /** Show the meeting point marker. */
  showMeet: boolean
  /** Caption text for this beat. */
  caption: string
  /** Highlight text (arithmetic step) — shown in a coloured badge. */
  highlight: string | null
  /** Hold duration in ms before auto-advance (0 = final beat). */
  hold: number
  /** True only on the final answer beat. */
  result: boolean
}

export interface TownsMeet19A25Story {
  steps: TownsMeet19A25Step[]
  finalIndex: number
}

export function buildTownsMeet19A25Steps(lang: Lang): TownsMeet19A25Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TownsMeet19A25Step[] = [
    // Beat 0 — intro
    {
      truckFrac: 0,
      sedanFrac: 1,
      showDistance: true,
      showMeet: false,
      caption: t(
        'Town A and Town B are 650 km apart. The truck leaves Town A at 9:00 AM (→ 60 km/h). The car leaves Town B at the same time (← 70 km/h). When do they meet?',
        'Jarak Kota A dan Kota B adalah 650 km. Truk berangkat dari Kota A pukul 09:00 (→ 60 km/jam). Mobil berangkat dari Kota B pada waktu yang sama (← 70 km/jam). Kapan mereka berpapasan?',
      ),
      highlight: null,
      hold: 2800,
      result: false,
    },

    // Beat 1 — combined speed
    {
      truckFrac: 0.15,
      sedanFrac: 0.85,
      showDistance: false,
      showMeet: false,
      caption: t(
        'They travel toward each other, so their speeds ADD together: 60 + 70 = 130 km/h combined.',
        'Keduanya bergerak saling mendekat, jadi kecepatan mereka DIJUMLAHKAN: 60 + 70 = 130 km/jam gabungan.',
      ),
      highlight: t('60 + 70 = 130 km/h', '60 + 70 = 130 km/jam'),
      hold: 2600,
      result: false,
    },

    // Beat 2 — time to meet
    {
      truckFrac: 0.3,
      sedanFrac: 0.7,
      showDistance: false,
      showMeet: false,
      caption: t(
        'Time to cover 650 km together at 130 km/h: 650 ÷ 130 = 5 hours.',
        'Waktu untuk menempuh 650 km bersama dengan kecepatan 130 km/jam: 650 ÷ 130 = 5 jam.',
      ),
      highlight: t('650 ÷ 130 = 5 hours', '650 ÷ 130 = 5 jam'),
      hold: 2600,
      result: false,
    },

    // Beat 3 — answer
    {
      truckFrac: 0.46,
      sedanFrac: 0.54,
      showDistance: false,
      showMeet: true,
      caption: t(
        'Departure 9:00 AM + 5 hours = 2:00 PM. The two vehicles pass each other at 2:00 PM.',
        'Berangkat pukul 09:00 + 5 jam = 14:00. Kedua kendaraan berpapasan pukul 14:00 (2:00 PM).',
      ),
      highlight: t('9:00 AM + 5 h = 2:00 PM', '09:00 + 5 jam = 14:00'),
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
