// OSN 2015 SD Nasional Q20 — storyboard for the collinear-chase animation.
//
// Problem: A, B, C are collinear with AC:BC=7:5. Amir at A and Budi at B
// both run toward C. Amir takes 7 min, Budi 10 min. When does Amir catch Budi?
// Answer: 4 minutes.
//
// Teaching walk (5 beats):
//   0. intro    — show A-B-C with distance braces (7k / 5k / 2k)
//   1. speeds   — compute speeds: Amir = k/min, Budi = k/2 per min
//   2. meet-eq  — write position equations for each runner at time t
//   3. solve    — equate and solve: t = 4; show meeting point on line
//   4. result   — t = 4 minutes, verify both positions equal 3k from C
//
// Pure builder: (lang) → storyboard. No Date, no Math.random, SSR-safe.

export type Lang = 'en' | 'id'

export type RunPhase = 'intro' | 'speeds' | 'meet-eq' | 'solve' | 'result'

export interface RunBeat {
  phase: RunPhase
  /** Show the AC / AB / BC distance brace annotations. */
  showBraces: boolean
  /** Show speed labels and direction arrows below the axis. */
  showSpeeds: boolean
  /** Show the meeting-point marker on the line. */
  showMeetPoint: boolean
  /** Maths/equation string displayed in the equation strip below the figure. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface RunStoryboard {
  steps: RunBeat[]
  finalIndex: number
}

export function buildCollinearRunSteps(lang: Lang): RunStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RunBeat[] = [
    // Beat 0 — intro: show A-B-C with distance braces
    {
      phase: 'intro',
      showBraces: true,
      showSpeeds: false,
      showMeetPoint: false,
      equation: 'AC = 7k,  BC = 5k,  AB = 2k',
      hold: 2200,
      result: false,
      caption: t(
        'A, B, C are collinear with AC : BC = 7 : 5. Let AC = 7k and BC = 5k, so AB = AC − BC = 2k. B lies between A and C.',
        'A, B, C segaris dengan AC : BC = 7 : 5. Misalkan AC = 7k dan BC = 5k, sehingga AB = 7k − 5k = 2k. B terletak di antara A dan C.',
      ),
    },

    // Beat 1 — speeds: derive speed of each runner
    {
      phase: 'speeds',
      showBraces: false,
      showSpeeds: true,
      showMeetPoint: false,
      equation: t(
        'v_Amir = 7k÷7 = k/min    v_Budi = 5k÷10 = k/2 /min',
        'v_Amir = 7k÷7 = k/mnt    v_Budi = 5k÷10 = k/2 /mnt',
      ),
      hold: 2200,
      result: false,
      caption: t(
        'Speed = distance ÷ time. Amir covers 7k in 7 min → k/min. Budi covers 5k in 10 min → k/2 per min. Amir is twice as fast.',
        'Kecepatan = jarak ÷ waktu. Amir menempuh 7k dalam 7 mnt → k/mnt. Budi menempuh 5k dalam 10 mnt → k/2 per mnt. Amir dua kali lebih cepat.',
      ),
    },

    // Beat 2 — position equations
    {
      phase: 'meet-eq',
      showBraces: false,
      showSpeeds: false,
      showMeetPoint: false,
      equation: t(
        'Amir pos = 7k − kt    Budi pos = 5k − (k/2)t    [from C = 0]',
        'Posisi Amir = 7k − kt    Posisi Budi = 5k − (k/2)t    [C = 0]',
      ),
      hold: 2200,
      result: false,
      caption: t(
        'Set C at 0. At time t: Amir is 7k − kt from C; Budi is 5k − (k/2)t from C. Amir catches Budi when their positions are equal.',
        'Tempatkan C di 0. Pada waktu t: Amir berada di 7k − kt dari C; Budi di 5k − (k/2)t dari C. Amir menyusul Budi saat posisi mereka sama.',
      ),
    },

    // Beat 3 — solve and show meeting point
    {
      phase: 'solve',
      showBraces: false,
      showSpeeds: false,
      showMeetPoint: true,
      equation: '7k − kt = 5k − kt/2  →  2k = kt/2  →  t = 4',
      hold: 2200,
      result: false,
      caption: t(
        '7k − kt = 5k − kt/2 → move terms: 2k = kt/2 → multiply both sides by 2/k: t = 4 minutes.',
        '7k − kt = 5k − kt/2 → pindahkan suku: 2k = kt/2 → kalikan kedua ruas dengan 2/k: t = 4 menit.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showBraces: false,
      showSpeeds: false,
      showMeetPoint: true,
      equation: t('t = 4 minutes', 't = 4 menit'),
      hold: 0,
      result: true,
      caption: t(
        'At t = 4 min: Amir is at 7k − 4k = 3k from C; Budi is at 5k − 2k = 3k from C. Same position — Amir catches up! Answer: 4 minutes.',
        'Saat t = 4 mnt: Amir di 7k − 4k = 3k dari C; Budi di 5k − 2k = 3k dari C. Posisi sama — Amir menyusul! Jawaban: 4 menit.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
