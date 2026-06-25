/**
 * SEAMO-20-A-Q16 — beat steps for the postman-route explainer.
 *
 * Strategy: multiply — count paths from start to A, then A to house.
 *   Paths start → A  = C(3,1) = 3   (1 right, 2 up from start)
 *   Paths A → house  = C(4,3) = 4   (3 right, 1 up from A)
 *   Total = 3 × 4 = 12 → answer D
 *
 * Beats
 *   0 — intro:       show the full grid, highlight start and house.
 *   1 — count_to_A:  highlight segment from start → A; show 3 path options.
 *   2 — count_from_A: highlight segment from A → house; show 4 path options.
 *   3 — multiply:    show 3 × 4 = 12.
 *   4 — result:      answer D = 12.
 */

export type PostmanRoute20A16Phase =
  | 'intro'
  | 'count_to_A'
  | 'count_from_A'
  | 'multiply'
  | 'result'

export interface PostmanRoute20A16Step {
  phase:    PostmanRoute20A16Phase
  caption:  string
  equation: string
  result:   boolean
  hold:     number
}

export interface PostmanRoute20A16Story {
  steps:      PostmanRoute20A16Step[]
  finalIndex: number
}

export function buildPostmanRoute20A16Steps(lang: 'en' | 'id'): PostmanRoute20A16Story {
  const t = TRANSLATIONS[lang]

  const steps: PostmanRoute20A16Step[] = [
    // Beat 0 — intro
    {
      phase:    'intro',
      caption:  t.intro,
      equation: '',
      result:   false,
      hold:     2200,
    },
    // Beat 1 — paths from start to A
    {
      phase:    'count_to_A',
      caption:  t.count_to_A,
      equation: t.eq_to_A,
      result:   false,
      hold:     2400,
    },
    // Beat 2 — paths from A to house
    {
      phase:    'count_from_A',
      caption:  t.count_from_A,
      equation: t.eq_from_A,
      result:   false,
      hold:     2400,
    },
    // Beat 3 — multiply
    {
      phase:    'multiply',
      caption:  t.multiply,
      equation: t.eq_multiply,
      result:   false,
      hold:     2200,
    },
    // Beat 4 — result
    {
      phase:    'result',
      caption:  t.result,
      equation: t.eq_result,
      result:   true,
      hold:     3200,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}

// ── translations ──────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<'en' | 'id', {
  intro:        string
  count_to_A:   string
  eq_to_A:      string
  count_from_A: string
  eq_from_A:    string
  multiply:     string
  eq_multiply:  string
  result:       string
  eq_result:    string
}> = {
  en: {
    intro:
      'The postman must reach the house through Point A, moving only right or up.',
    count_to_A:
      'Count paths from start to Point A (1 right, 2 up): C(3,1) = 3 ways.',
    eq_to_A:   'start → A = 3',
    count_from_A:
      'Count paths from A to house (3 right, 1 up): C(4,3) = 4 ways.',
    eq_from_A:  'A → house = 4',
    multiply:
      'By the multiplication principle: paths through A = 3 × 4.',
    eq_multiply: '3 × 4',
    result:
      '3 × 4 = 12 ways — answer D!',
    eq_result:  '3 × 4 = 12',
  },
  id: {
    intro:
      'Tukang pos harus sampai ke rumah melalui Titik A, hanya bergerak ke kanan atau ke atas.',
    count_to_A:
      'Hitung jalur dari awal ke Titik A (1 kanan, 2 atas): C(3,1) = 3 cara.',
    eq_to_A:   'awal → A = 3',
    count_from_A:
      'Hitung jalur dari A ke rumah (3 kanan, 1 atas): C(4,3) = 4 cara.',
    eq_from_A:  'A → rumah = 4',
    multiply:
      'Prinsip perkalian: jalur melalui A = 3 × 4.',
    eq_multiply: '3 × 4',
    result:
      '3 × 4 = 12 cara — jawaban D!',
    eq_result:  '3 × 4 = 12',
  },
}
