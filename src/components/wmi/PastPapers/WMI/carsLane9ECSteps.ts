// Storyboard for IKMC-22-EC-Q9 — 5-car overtaking simulation.
//
// Initial order (front → back): 1, 2, 3, 4, 5
//
// Three overtaking moves (from seed breakdown.quantities):
//   Move 1: last car (5) overtakes the two ahead of it (4 and 3)
//           → new order: 1, 2, 5, 3, 4
//   Move 2: second-last car (now car 3) overtakes the two ahead of it (5 and 2)
//           → new order: 1, 3, 2, 5, 4
//   Move 3: middle car (now car 2) overtakes the two ahead of it (3 and 1)
//           → new order: 2, 1, 3, 5, 4  ← ANSWER B
//
// Trap: choice A (1,2,3,5,4) is only after move 1 — common mistake.
//
// Pure function of `lang` — SSR-safe, deterministic.

export type Lang = 'en' | 'id'

export interface CarsLane9ECStep {
  /** Car order front→back at this beat. */
  order: number[]
  /** 0-based indices to highlight (the overtaking car's new position). */
  highlightSet?: Set<number>
  /** Caption text. */
  caption: string
  /** Hold duration in ms before auto-advance. */
  hold: number
  /** True only on the final winning beat. */
  result: boolean
  /** Short label showing which move this is, e.g. "Move 1" / null. */
  moveLabel: string | null
}

export interface CarsLane9ECStory {
  steps: CarsLane9ECStep[]
  finalIndex: number
  answer: string
}

export function buildCarsLane9ECSteps(lang: Lang): CarsLane9ECStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CarsLane9ECStep[] = []

  // Beat 0 — intro: show the initial order 1 2 3 4 5
  steps.push({
    order: [1, 2, 3, 4, 5],
    caption: t(
      'Start: cars 1, 2, 3, 4, 5 from front to back, all moving the same direction. Apply 3 overtaking moves!',
      'Awal: mobil 1, 2, 3, 4, 5 dari depan ke belakang, semua bergerak satu arah. Lakukan 3 gerakan mendahului!',
    ),
    hold: 2600,
    result: false,
    moveLabel: null,
  })

  // Beat 1 — Move 1 preview: car 5 (index 4 in start) will overtake cars 4 and 3 (indices 3 and 2)
  // Highlight car 5 at its current position (index 4) before it jumps.
  steps.push({
    order: [1, 2, 3, 4, 5],
    highlightSet: new Set([4]),   // car 5 is about to overtake
    caption: t(
      'Move 1: the LAST car (5) overtakes the two cars ahead of it (car 4 and car 3).',
      'Gerakan 1: mobil TERAKHIR (5) mendahului dua mobil di depannya (mobil 4 dan mobil 3).',
    ),
    hold: 2400,
    result: false,
    moveLabel: t('Move 1', 'Gerakan 1'),
  })

  // Beat 2 — result after Move 1: order 1, 2, 5, 3, 4
  // Car 5 is now at index 2 (has jumped over 4 and 3).
  steps.push({
    order: [1, 2, 5, 3, 4],
    highlightSet: new Set([2]),   // car 5 is now at position 3 (index 2)
    caption: t(
      'After move 1: 1, 2, 5, 3, 4. Car 5 is now 3rd from the front.',
      'Setelah gerakan 1: 1, 2, 5, 3, 4. Mobil 5 kini berada di posisi ke-3 dari depan.',
    ),
    hold: 2200,
    result: false,
    moveLabel: null,
  })

  // Beat 3 — Move 2 preview: second-last car is now car 3 (index 3 in order [1,2,5,3,4])
  // Car 3 will overtake the two ahead: cars 5 (index 2) and 2 (index 1).
  steps.push({
    order: [1, 2, 5, 3, 4],
    highlightSet: new Set([3]),   // car 3 at index 3 is about to move
    caption: t(
      'Move 2: the SECOND-LAST car (3) overtakes the two cars ahead of it (car 5 and car 2).',
      'Gerakan 2: mobil KEDUA DARI BELAKANG (3) mendahului dua mobil di depannya (mobil 5 dan mobil 2).',
    ),
    hold: 2400,
    result: false,
    moveLabel: t('Move 2', 'Gerakan 2'),
  })

  // Beat 4 — result after Move 2: order 1, 3, 2, 5, 4
  // Car 3 jumped from index 3 to index 1.
  steps.push({
    order: [1, 3, 2, 5, 4],
    highlightSet: new Set([1]),   // car 3 is now at index 1
    caption: t(
      'After move 2: 1, 3, 2, 5, 4. Car 3 is now 2nd from the front.',
      'Setelah gerakan 2: 1, 3, 2, 5, 4. Mobil 3 kini berada di posisi ke-2 dari depan.',
    ),
    hold: 2200,
    result: false,
    moveLabel: null,
  })

  // Beat 5 — Move 3 preview: middle car in [1,3,2,5,4] is car 2 at index 2.
  // Car 2 will overtake the two ahead: cars 3 (index 1) and 1 (index 0).
  steps.push({
    order: [1, 3, 2, 5, 4],
    highlightSet: new Set([2]),   // car 2 at index 2 is the middle car
    caption: t(
      'Move 3: the MIDDLE car (2) overtakes the two cars ahead of it (car 3 and car 1).',
      'Gerakan 3: mobil TENGAH (2) mendahului dua mobil di depannya (mobil 3 dan mobil 1).',
    ),
    hold: 2400,
    result: false,
    moveLabel: t('Move 3', 'Gerakan 3'),
  })

  // Beat 6 — final result: order 2, 1, 3, 5, 4. Answer B.
  steps.push({
    order: [2, 1, 3, 5, 4],
    highlightSet: new Set([0]),   // car 2 now leads
    caption: t(
      'Final order: 2, 1, 3, 5, 4. Answer B. (Trap A is only after move 1 — you must apply all 3 moves!)',
      'Urutan akhir: 2, 1, 3, 5, 4. Jawaban B. (Jebakan A hanya setelah gerakan 1 — kamu harus menerapkan ketiga gerakan!)',
    ),
    hold: 0,
    result: true,
    moveLabel: null,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: 'B',
  }
}
