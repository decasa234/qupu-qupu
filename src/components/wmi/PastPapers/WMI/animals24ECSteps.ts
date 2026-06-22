// IKMC-19-EC-Q24 — storyboard for ostriches & camels / hats animation.
//
// The question: ostriches (2-footed) got 16 PAIRS of red shoes;
// camels (4-hooved) got 40 blue shoes. How many hats were made?
//
// Key quantities (from breakdown.quantities in the seed):
//   16 pairs red shoes ÷ 1 pair per ostrich  → 16 ostriches
//   40 blue shoes ÷ 4 shoes per camel        → 10 camels
//   16 + 10 = 26 total animals               → 26 hats (answer A)
//
// Teaching walk, one idea per beat:
//   0. intro       — show the scene; state the problem.
//   1. ostriches   — highlight red shoes; 16 pairs ÷ 1 pair each → 16 ostriches.
//   2. camels      — highlight blue shoes; 40 shoes ÷ 4 each → 10 camels.
//   3. total       — add the two groups: 16 + 10 = 26 animals.
//   4. hats        — each animal gets 1 hat → 26 hats (result).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'ostriches' | 'camels' | 'total' | 'hats'

export interface AnimBeat {
  phase: PhaseId
  /** Highlight the ostrich red-shoe region. */
  glowOstrich: boolean
  /** Highlight the camel blue-shoe region. */
  glowCamel: boolean
  /** Show the running ostrich count badge. */
  showOstrichCount: boolean
  /** Show the running camel count badge. */
  showCamelCount: boolean
  /** Show the total (hats) count badge. */
  showTotal: boolean
  /** Equation / maths line to display; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Animals24Storyboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildAnimals24ECSteps(lang: Lang): Animals24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      glowOstrich: false,
      glowCamel: false,
      showOstrichCount: false,
      showCamelCount: false,
      showTotal: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Ostriches have 2 feet; camels have 4 hooves. Each animal ordered footwear and 1 hat. Count the animals from the shoes!',
        'Burung unta punya 2 kaki; unta punya 4 kuku. Masing-masing memesan alas kaki dan 1 topi. Hitung hewan dari sepatu!',
      ),
    },

    // Beat 1 — ostriches
    {
      phase: 'ostriches',
      glowOstrich: true,
      glowCamel: false,
      showOstrichCount: true,
      showCamelCount: false,
      showTotal: false,
      equation: '16 pairs ÷ 1 pair = 16',
      hold: 2400,
      result: false,
      caption: t(
        '16 pairs of red shoes → each ostrich needs 1 pair → 16 ostriches.',
        '16 pasang sepatu merah → setiap burung unta butuh 1 pasang → 16 burung unta.',
      ),
    },

    // Beat 2 — camels
    {
      phase: 'camels',
      glowOstrich: false,
      glowCamel: true,
      showOstrichCount: true,
      showCamelCount: true,
      showTotal: false,
      equation: '40 shoes ÷ 4 = 10',
      hold: 2400,
      result: false,
      caption: t(
        '40 blue shoes → each camel needs 4 → 40 ÷ 4 = 10 camels.',
        '40 sepatu biru → setiap unta butuh 4 → 40 ÷ 4 = 10 unta.',
      ),
    },

    // Beat 3 — total animals
    {
      phase: 'total',
      glowOstrich: true,
      glowCamel: true,
      showOstrichCount: true,
      showCamelCount: true,
      showTotal: false,
      equation: '16 + 10 = 26 animals',
      hold: 2200,
      result: false,
      caption: t(
        'Total animals = 16 ostriches + 10 camels = 26.',
        'Total hewan = 16 burung unta + 10 unta = 26.',
      ),
    },

    // Beat 4 — hats (result)
    {
      phase: 'hats',
      glowOstrich: true,
      glowCamel: true,
      showOstrichCount: true,
      showCamelCount: true,
      showTotal: true,
      equation: '26 hats → A',
      hold: 0,
      result: true,
      caption: t(
        'Each animal ordered 1 hat → 26 hats were made. Answer A.',
        'Setiap hewan memesan 1 topi → 26 topi dibuat. Jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
