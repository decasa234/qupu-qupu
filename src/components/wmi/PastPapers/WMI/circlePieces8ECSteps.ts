// IKMC-23-EC-Q8 — storyboard for the "Danny glues pieces on a circle" animation.
//
// The question: Danny glues a gray semicircle and a white quarter-circle on top of
// a black circle. What result can he NOT obtain? → Answer E.
//
// The gray piece is a semicircle (curved boundary). The white piece is a
// quarter-circle (curved boundary). Because both pieces have curved edges, they
// can only produce arc-bounded regions on the black circle — they can never make
// a straight-line rectangular partition.
//
// Teaching walk, one idea per beat:
//   0. intro        — show the three items: black circle base + two pieces.
//   1. gray-piece   — highlight the gray semicircle: it covers exactly a half-circle.
//   2. white-piece  — highlight the white quarter-circle: it covers a quarter-circle.
//   3. check-a      — option A can be obtained (gray + white placed on left/lower).
//   4. check-b      — option B can be obtained (gray left, white top-right).
//   5. check-c      — option C can be obtained (gray right, white bottom-right).
//   6. check-d      — option D can be obtained (gray top, white lower-right).
//   7. check-e      — option E is IMPOSSIBLE: straight rectangular quadrants need
//                     straight-edged pieces; our pieces are curved.
//   8. result       — answer is E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CirclePiecesPhase =
  | 'intro'
  | 'gray-piece'
  | 'white-piece'
  | 'check-a'
  | 'check-b'
  | 'check-c'
  | 'check-d'
  | 'check-e'
  | 'result'

export interface CirclePiece8ECBeat {
  phase: CirclePiecesPhase
  /** Which option is currently highlighted in the explainer (undefined = none). */
  highlightOption?: 'A' | 'B' | 'C' | 'D' | 'E'
  /** Whether the current option is being judged as possible (true) or impossible (false). */
  verdict?: 'possible' | 'impossible'
  /** Whether to show a highlight ring around the gray semicircle piece. */
  showGrayHighlight: boolean
  /** Whether to show a highlight ring around the white quarter-circle piece. */
  showWhiteHighlight: boolean
  /** Equation / key fact line; '' to hide. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface CirclePiece8ECStoryboard {
  steps: CirclePiece8ECBeat[]
  finalIndex: number
  answer: 'E'
}

export function buildCirclePieces8ECSteps(lang: Lang): CirclePiece8ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CirclePiece8ECBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showGrayHighlight: false,
      showWhiteHighlight: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Danny has a black circle, a gray semicircle, and a white quarter-circle. He places the two pieces on the circle. Which result is impossible?',
        'Danny memiliki lingkaran hitam, setengah lingkaran abu-abu, dan seperempat lingkaran putih. Ia meletakkan dua potongan di atas lingkaran. Hasil mana yang tidak mungkin?',
      ),
    },

    // Beat 1 — gray piece
    {
      phase: 'gray-piece',
      showGrayHighlight: true,
      showWhiteHighlight: false,
      equation: t('Gray piece = semicircle (½ circle)', 'Potongan abu-abu = setengah lingkaran (½ lingkaran)'),
      hold: 2200,
      result: false,
      caption: t(
        'The gray piece is a SEMICIRCLE — it has one straight edge and one curved edge. It always covers exactly half the circle.',
        'Potongan abu-abu adalah SETENGAH LINGKARAN — memiliki satu sisi lurus dan satu sisi melengkung. Potongan ini selalu menutupi tepat setengah lingkaran.',
      ),
    },

    // Beat 2 — white piece
    {
      phase: 'white-piece',
      showGrayHighlight: false,
      showWhiteHighlight: true,
      equation: t('White piece = quarter-circle (¼ circle)', 'Potongan putih = seperempat lingkaran (¼ lingkaran)'),
      hold: 2200,
      result: false,
      caption: t(
        'The white piece is a QUARTER-CIRCLE — two straight edges meeting at a right angle, and one curved edge. It always covers exactly a quarter of the circle.',
        'Potongan putih adalah SEPEREMPAT LINGKARAN — dua sisi lurus yang bertemu pada sudut siku-siku, dan satu sisi melengkung. Ia selalu menutupi tepat seperempat lingkaran.',
      ),
    },

    // Beat 3 — check A
    {
      phase: 'check-a',
      highlightOption: 'A',
      verdict: 'possible',
      showGrayHighlight: false,
      showWhiteHighlight: false,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Option A ✓: gray semicircle covers the lower-left, white quarter-circle fills the upper-right arc. This is achievable.',
        'Pilihan A ✓: setengah lingkaran abu-abu menutupi bagian kiri-bawah, seperempat lingkaran putih mengisi busur kanan-atas. Ini bisa dicapai.',
      ),
    },

    // Beat 4 — check B
    {
      phase: 'check-b',
      highlightOption: 'B',
      verdict: 'possible',
      showGrayHighlight: false,
      showWhiteHighlight: false,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Option B ✓: gray semicircle on the left half, white quarter-circle in the upper-right. This is achievable.',
        'Pilihan B ✓: setengah lingkaran abu-abu di bagian kiri, seperempat lingkaran putih di kanan atas. Ini bisa dicapai.',
      ),
    },

    // Beat 5 — check C
    {
      phase: 'check-c',
      highlightOption: 'C',
      verdict: 'possible',
      showGrayHighlight: false,
      showWhiteHighlight: false,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Option C ✓: gray semicircle on the right, white quarter-circle at the bottom-right. This is achievable.',
        'Pilihan C ✓: setengah lingkaran abu-abu di kanan, seperempat lingkaran putih di kanan bawah. Ini bisa dicapai.',
      ),
    },

    // Beat 6 — check D
    {
      phase: 'check-d',
      highlightOption: 'D',
      verdict: 'possible',
      showGrayHighlight: false,
      showWhiteHighlight: false,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Option D ✓: gray semicircle on the upper half, white quarter-circle in the lower-right. This is achievable.',
        'Pilihan D ✓: setengah lingkaran abu-abu di bagian atas, seperempat lingkaran putih di kanan bawah. Ini bisa dicapai.',
      ),
    },

    // Beat 7 — check E (impossible)
    {
      phase: 'check-e',
      highlightOption: 'E',
      verdict: 'impossible',
      showGrayHighlight: true,
      showWhiteHighlight: true,
      equation: t('Curved pieces ≠ straight-edged quadrants', 'Potongan melengkung ≠ kuadran bertepi lurus'),
      hold: 2600,
      result: false,
      caption: t(
        'Option E ✗: it shows four equal straight-edged quadrants — but our pieces have CURVED edges! A semicircle and a quarter-circle can never create perfectly straight dividing lines like this.',
        'Pilihan E ✗: menunjukkan empat kuadran bertepi lurus — tetapi potongan kita memiliki tepi MELENGKUNG! Setengah lingkaran dan seperempat lingkaran tidak pernah bisa membuat garis pembagi lurus seperti ini.',
      ),
    },

    // Beat 8 — result
    {
      phase: 'result',
      highlightOption: 'E',
      verdict: 'impossible',
      showGrayHighlight: false,
      showWhiteHighlight: false,
      equation: t('Answer: E (impossible)', 'Jawaban: E (tidak mungkin)'),
      hold: 0,
      result: true,
      caption: t(
        'The answer is E — four rectangular quadrants cannot be made from a curved semicircle and a curved quarter-circle.',
        'Jawabannya adalah E — empat kuadran persegi panjang tidak bisa dibuat dari setengah lingkaran melengkung dan seperempat lingkaran melengkung.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'E' }
}
