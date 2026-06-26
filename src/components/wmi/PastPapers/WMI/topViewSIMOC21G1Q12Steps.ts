// SIMOC-21-G1-Q12 — storyboard for the top-view animation.
//
// The question: a 9-cube 3D arrangement is shown isometrically.
// Which 2D grid (A–E) matches the top-down view? Answer: E.
//
// Strategy: "bird's-eye view" — imagine looking straight down and tracing the
// footprint of every column that has at least one cube.
//
// Teaching walk, one idea per beat:
//   0. intro   — here is the 3D shape; we need to look from above.
//   1. back    — from above, the back pair (2 cells) becomes visible at the top.
//   2. middle  — the wide middle row (4 cells) is the widest layer.
//   3. front   — the front pair + extension adds 3 cells at the bottom.
//   4. match   — lay the footprint flat and compare with the five options.
//   5. result  — the footprint matches option E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TopViewPhaseId =
  | 'intro'
  | 'back'
  | 'middle'
  | 'front'
  | 'match'
  | 'result'

export interface TopViewBeat {
  phase: TopViewPhaseId
  /** Which layer is highlighted in the explainer view. */
  highlightRow: 'none' | 'back' | 'middle' | 'front' | 'all'
  /** Caption text shown in the explanation card. */
  caption: string
  /** Short label shown in the equation chip; '' to hide. */
  equation: string
  /** Auto-hold in ms (0 = final / manual advance). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TopViewStoryboard {
  steps: TopViewBeat[]
  finalIndex: number
}

export function buildTopViewSIMOC21G1Q12Steps(lang: Lang): TopViewStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TopViewBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightRow: 'none',
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Imagine you are a bird hovering directly above this shape — what do you see looking straight down?',
        'Bayangkan kamu seperti burung yang melayang tepat di atas bentuk ini — apa yang kamu lihat jika melihat langsung ke bawah?',
      ),
    },

    // Beat 1 — back pair (y=0)
    {
      phase: 'back',
      highlightRow: 'back',
      equation: '2 cells',
      hold: 2000,
      result: false,
      caption: t(
        'Looking down: the back part shows 2 cells side by side (positions 2 and 3 in the top row).',
        'Melihat ke bawah: bagian belakang menunjukkan 2 sel berdampingan (posisi 2 dan 3 di baris atas).',
      ),
    },

    // Beat 2 — wide middle row (y=1)
    {
      phase: 'middle',
      highlightRow: 'middle',
      equation: '4 cells',
      hold: 2000,
      result: false,
      caption: t(
        'The middle layer is the widest — all 4 columns are filled (positions 1–4).',
        'Lapisan tengah paling lebar — semua 4 kolom terisi (posisi 1–4).',
      ),
    },

    // Beat 3 — front pair + extension (y=2 and y=3)
    {
      phase: 'front',
      highlightRow: 'front',
      equation: '3 cells',
      hold: 2000,
      result: false,
      caption: t(
        'The front part adds 2 more cells in the same columns as the back, plus 1 extra cell extending further forward.',
        'Bagian depan menambah 2 sel lagi di kolom yang sama dengan bagian belakang, ditambah 1 sel ekstra yang lebih ke depan.',
      ),
    },

    // Beat 4 — full footprint
    {
      phase: 'match',
      highlightRow: 'all',
      equation: '2 + 4 + 3 = 9',
      hold: 2200,
      result: false,
      caption: t(
        'The full footprint is 9 cells: 2 at top, 4 in the middle, 2 below that, then 1 at the bottom. Now compare with the five choices.',
        'Jejak keseluruhan adalah 9 sel: 2 di atas, 4 di tengah, 2 di bawahnya, kemudian 1 paling bawah. Sekarang bandingkan dengan lima pilihan.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightRow: 'all',
      equation: '→ E',
      hold: 0,
      result: true,
      caption: t(
        'Option E shows exactly this pattern: 2 cells at top, 4 in the middle, 2 below, 1 at the bottom — the correct top view. Answer: E.',
        'Pilihan E menunjukkan pola ini persis: 2 sel di atas, 4 di tengah, 2 di bawah, 1 paling bawah — tampilan atas yang benar. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
