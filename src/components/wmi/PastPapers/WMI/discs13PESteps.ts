// IKMC-22-PE-Q13 — storyboard for the top-view disc-stack explainer.
//
// The question: A stack of 6 coloured discs (side view shown). Which option
// shows the view from directly above?  Answer: A.
//
// Strategy — mental-rotation / top-view projection:
//   Beat 0 — intro:     Show side view; "Look straight down at the stack."
//   Beat 1 — identify:  "The TOP disc is the smallest — tiny blue circle at centre."
//   Beat 2 — unfold:    "Each disc below peeks out as a coloured ring around it."
//   Beat 3 — check A:   "Option A matches: outer orange → blue → cream → blue → orange → blue."
//   Beat 4 — result:    "Answer A."
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type DiscsPhase = 'intro' | 'identify' | 'unfold' | 'checkA' | 'result'

export interface DiscsBeat {
  phase: DiscsPhase
  /** Which ring (0=outermost) to highlight in the explainer; null = show all. */
  highlight: number | null
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface DiscsStoryboard {
  steps: DiscsBeat[]
  finalIndex: number
}

export function buildDiscs13PESteps(lang: Lang): DiscsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiscsBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Six discs are stacked — each one smaller than the one below. Look straight down from above.',
        'Enam cakram ditumpuk — setiap cakram lebih kecil dari yang di bawahnya. Lihat lurus dari atas.',
      ),
    },

    // Beat 1 — identify the top disc
    {
      phase: 'identify',
      highlight: 5,  // innermost ring = top disc
      equation: t('Top disc → blue (tiny)', 'Cakram teratas → biru (kecil)'),
      hold: 2400,
      result: false,
      caption: t(
        'The topmost disc is the tiniest — a small BLUE circle visible at the centre.',
        'Cakram paling atas adalah yang terkecil — lingkaran BIRU kecil terlihat di tengah.',
      ),
    },

    // Beat 2 — each disc below adds a ring
    {
      phase: 'unfold',
      highlight: null,
      equation: t('Each disc below → one more ring', 'Setiap cakram di bawah → satu cincin lagi'),
      hold: 2600,
      result: false,
      caption: t(
        'Each disc below is larger, so it peeks out as a coloured ring around the centre. ' +
        'Going outward: blue → orange → blue → cream → blue → orange (6 rings total).',
        'Setiap cakram di bawah lebih besar, sehingga tampak sebagai cincin berwarna. ' +
        'Dari dalam ke luar: biru → oranye → biru → krem → biru → oranye (6 cincin).',
      ),
    },

    // Beat 3 — verify option A matches
    {
      phase: 'checkA',
      highlight: 0,  // outermost ring
      equation: t('Outer ring = orange ✓', 'Cincin terluar = oranye ✓'),
      hold: 2400,
      result: false,
      caption: t(
        'The BOTTOM (largest) disc is orange — it forms the outermost ring. ' +
        'Option A has an orange outer ring — it matches!',
        'Cakram BAWAH (terbesar) berwarna oranye — membentuk cincin terluar. ' +
        'Pilihan A memiliki cincin terluar oranye — cocok!',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: null,
      equation: t('Answer: A', 'Jawaban: A'),
      hold: 0,
      result: true,
      caption: t(
        'Option A shows the correct top-down view: orange outer ring, then blue, cream, blue, orange, blue at centre. Answer A.',
        'Pilihan A menunjukkan tampak dari atas yang benar: cincin luar oranye, lalu biru, krem, biru, oranye, biru di tengah. Jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
