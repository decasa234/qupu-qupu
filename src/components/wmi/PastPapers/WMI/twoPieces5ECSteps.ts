// IKMC-20-EC-Q5 — storyboard for the piece-assembly animation.
//
// The question: given six pieces (1 rectangle, 1 right triangle, 1 large
// triangle, 2 large circles, 1 small triangle), which of the five assembled
// figures A–E can you make?  Answer: E (the bicycle).
//
// Strategy: check each option by counting and matching its visible shapes
// against the six-piece inventory. Only E uses all six pieces exactly once.
//
// Teaching walk, one idea per beat:
//   0. intro   — show the six pieces; state the inventory.
//   1. checkA  — A has 5+ triangles; doesn't match (only 3 triangles in set).
//   2. checkB  — B has a square; no square in the set → eliminated.
//   3. checkC  — C missing a large triangle; needs a diagonal bar instead → eliminated.
//   4. checkD  — D uses a small inverted triangle as diamond top with large triangle;
//                close but orientation mismatch → eliminated.
//   5. checkE  — E (bicycle): 2 circles, rectangle, large triangle, right triangle,
//                small triangle → perfect match!
//   6. result  — answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TwoPiecesPhaseId =
  | 'intro'
  | 'checkA'
  | 'checkB'
  | 'checkC'
  | 'checkD'
  | 'checkE'
  | 'result'

export interface TwoPiecesBeat {
  /** Which phase this beat belongs to. */
  phase: TwoPiecesPhaseId
  /**
   * Which option letter is currently being evaluated (null for intro/result beats
   * before a specific option is highlighted).
   */
  option: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Whether the evaluated option is eliminated. */
  eliminated: boolean
  /** Whether this is the correct answer beat. */
  isAnswer: boolean
  /** Short reason why the option is eliminated (empty string when not applicable). */
  reason: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TwoPiecesStoryboard {
  steps: TwoPiecesBeat[]
  finalIndex: number
}

export function buildTwoPieces5ECSteps(lang: Lang): TwoPiecesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TwoPiecesBeat[] = [
    // Beat 0 — intro: inventory of the six pieces
    {
      phase: 'intro',
      option: null,
      eliminated: false,
      isAnswer: false,
      reason: '',
      hold: 2400,
      result: false,
      caption: t(
        'We have 6 pieces: 1 rectangle, 1 right triangle, 1 large triangle, 2 circles, 1 small triangle. ' +
        'Each answer figure must use ALL six pieces — no more, no less.',
        'Kita punya 6 potongan: 1 persegi panjang, 1 segitiga siku-siku, 1 segitiga besar, 2 lingkaran, 1 segitiga kecil. ' +
        'Setiap gambar jawaban harus menggunakan SEMUA enam potongan — tidak lebih, tidak kurang.',
      ),
    },

    // Beat 1 — check A (too many triangles)
    {
      phase: 'checkA',
      option: 'A',
      eliminated: true,
      isAnswer: false,
      reason: t('5 triangles visible — set only has 3', '5 segitiga terlihat — set hanya punya 3'),
      hold: 2200,
      result: false,
      caption: t(
        'A has 5 triangles radiating outward, but our set only has 3 triangles. ✗ Eliminated.',
        'A memiliki 5 segitiga yang menjulur keluar, tetapi set kita hanya punya 3 segitiga. ✗ Dieliminasi.',
      ),
    },

    // Beat 2 — check B (has a square)
    {
      phase: 'checkB',
      option: 'B',
      eliminated: true,
      isAnswer: false,
      reason: t('has a square — not in the set', 'ada persegi — tidak ada dalam set'),
      hold: 2200,
      result: false,
      caption: t(
        'B uses a square hat, but our pieces have no square — only a rectangle. ✗ Eliminated.',
        'B menggunakan topi persegi, tetapi potongan kita tidak ada persegi — hanya persegi panjang. ✗ Dieliminasi.',
      ),
    },

    // Beat 3 — check C (missing large triangle)
    {
      phase: 'checkC',
      option: 'C',
      eliminated: true,
      isAnswer: false,
      reason: t('missing the large triangle', 'segitiga besar tidak ditemukan'),
      hold: 2200,
      result: false,
      caption: t(
        'C has no large triangle — it uses a diagonal stick through a circle, but our set has a large triangle, not a stick. ✗ Eliminated.',
        'C tidak memiliki segitiga besar — ia menggunakan tongkat diagonal menembus lingkaran, tetapi set kita punya segitiga besar, bukan tongkat. ✗ Dieliminasi.',
      ),
    },

    // Beat 4 — check D (diamond needs two separate triangles but the shape isn't right)
    {
      phase: 'checkD',
      option: 'D',
      eliminated: true,
      isAnswer: false,
      reason: t('only 2 circles, pieces don\'t fit', 'hanya 2 lingkaran, potongan tidak pas'),
      hold: 2200,
      result: false,
      caption: t(
        'D uses the two circles as wheels and the rectangle — but the triangles form a diamond that needs the right-triangle piece differently than shown. ✗ Eliminated.',
        'D menggunakan dua lingkaran sebagai roda dan persegi panjang — tetapi segitiga membentuk berlian yang membutuhkan segitiga siku-siku dengan cara yang berbeda dari yang ditunjukkan. ✗ Dieliminasi.',
      ),
    },

    // Beat 5 — check E (bicycle — all 6 pieces match!)
    {
      phase: 'checkE',
      option: 'E',
      eliminated: false,
      isAnswer: true,
      reason: '',
      hold: 2400,
      result: false,
      caption: t(
        'E is a bicycle! Left wheel = circle, right wheel = circle (2 circles ✓), ' +
        'top bar = rectangle ✓, main frame = large triangle ✓, ' +
        'front fork = right triangle ✓, rear = small triangle ✓. All 6 pieces fit!',
        'E adalah sepeda! Roda kiri = lingkaran, roda kanan = lingkaran (2 lingkaran ✓), ' +
        'batang atas = persegi panjang ✓, rangka utama = segitiga besar ✓, ' +
        'garpu depan = segitiga siku-siku ✓, belakang = segitiga kecil ✓. Semua 6 potongan pas!',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      option: 'E',
      eliminated: false,
      isAnswer: true,
      reason: '',
      hold: 0,
      result: true,
      caption: t(
        'The bicycle (E) is the only figure that uses exactly all 6 pieces. Answer E.',
        'Sepeda (E) adalah satu-satunya gambar yang menggunakan tepat semua 6 potongan. Jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
