// IKMC-21-EC-Q1 — storyboard for "fish on a tangled line → count toward ring" animation.
//
// The question: a fishing line with 10 fish curls through several loops with a ring
// at one end. When the line is straightened, how many fish have their heads pointing
// toward the ring? Answer: C = 6.
//
// Key insight:
//   Each time the line makes a U-turn (loop), ALL fish on that reversed segment
//   flip their orientation relative to the ring end. A fish that "faces away" from
//   the ring in the tangled figure on a once-reversed segment actually faces TOWARD
//   the ring once the line is pulled straight.
//
//   Segment grouping (from ring outward, counting loop reversals):
//     Segment A (0 reversals): fish 0, 1 → after straightening, face AWAY from ring ✗
//     Segment B (1 reversal):  fish 2, 3, 4 → after straightening, face TOWARD ring ✓
//     Segment C (2 reversals): fish 5 → after straightening, face AWAY ✗
//     Segment D (3 reversals): fish 6, 7, 8 → after straightening, face TOWARD ring ✓
//     Segment E (4 reversals): fish 9 → after straightening, face AWAY ✗
//
//   Total toward ring = 3 (segment B) + 3 (segment D) = 6 ✓ → Answer C
//
// Teaching walk:
//   0. intro      — show the tangled figure; state the challenge.
//   1. ring-end   — label the ring and explain it is the reference end.
//   2. seg-a      — highlight fish 0,1 on segment A (no flip → away after straight).
//   3. bend-1     — show the first loop / U-turn.
//   4. seg-b      — highlight fish 2,3,4 on segment B (1 flip → toward ring ✓).
//   5. seg-c      — highlight fish 5 on segment C (2 flips → away again ✗).
//   6. seg-d      — highlight fish 6,7,8 on segment D (3 flips → toward ring ✓).
//   7. seg-e      — highlight fish 9 on segment E (4 flips → away ✗).
//   8. count      — show running count: 0+3+0+3+0 = 6 toward ring.
//   9. result     — confirm answer C = 6.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'ring-end'
  | 'seg-a'
  | 'bend-1'
  | 'seg-b'
  | 'seg-c'
  | 'seg-d'
  | 'seg-e'
  | 'count'
  | 'result'

export interface AnimBeat {
  phase: PhaseId
  /**
   * Indices (0-based) of fish to highlight with a coloured ring.
   * Each entry: { index, towardRing }
   */
  highlight: { index: number; towardRing: boolean }[]
  /** Show the ring (endpoint) highlighted. */
  ringHighlight: boolean
  /** Running count of fish facing the ring (–1 = hide badge). */
  count: number
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final beat / manual). */
  hold: number
  /** True on the result beat. */
  result: boolean
}

export interface FishRing1Storyboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildFishRing1ECSteps(lang: Lang): FishRing1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: [],
      ringHighlight: false,
      count: -1,
      hold: 2400,
      result: false,
      caption: t(
        'A fishing line with 10 colourful fish is tangled. A ring marks one end. When the line is pulled straight, how many fish will face toward the ring?',
        'Tali pancing dengan 10 ikan berwarna-warni kusut. Sebuah cincin menandai satu ujung. Saat tali diluruskan, berapa ikan yang menghadap ke arah cincin?',
      ),
    },

    // Beat 1 — ring-end
    {
      phase: 'ring-end',
      highlight: [],
      ringHighlight: true,
      count: -1,
      hold: 2200,
      result: false,
      caption: t(
        'The RING is our reference point. After straightening, any fish whose head points toward the ring counts.',
        'CINCIN adalah titik referensi kita. Setelah diluruskan, ikan yang kepalanya menghadap ke cincin yang dihitung.',
      ),
    },

    // Beat 2 — seg-a (fish 0,1 — segment A, no reversal → face away)
    {
      phase: 'seg-a',
      highlight: [
        { index: 0, towardRing: false },
        { index: 1, towardRing: false },
      ],
      ringHighlight: true,
      count: -1,
      hold: 2600,
      result: false,
      caption: t(
        'Fish 1 & 2 sit on the first straight stretch (no loop yet). They face AWAY from the ring — after straightening: still away ✗.',
        'Ikan 1 & 2 berada di bagian tali pertama (belum ada putaran). Kepala mereka menjauh dari cincin — setelah diluruskan: tetap menjauh ✗.',
      ),
    },

    // Beat 3 — bend-1 (first loop)
    {
      phase: 'bend-1',
      highlight: [],
      ringHighlight: false,
      count: -1,
      hold: 2000,
      result: false,
      caption: t(
        'The line makes a U-turn (loop). Every fish after this bend is FLIPPED relative to the ring when we straighten!',
        'Tali membuat putaran U (loop). Setiap ikan setelah belokan ini akan TERBALIK arahnya terhadap cincin saat diluruskan!',
      ),
    },

    // Beat 4 — seg-b (fish 2,3,4 — segment B, 1 reversal → toward ring ✓)
    {
      phase: 'seg-b',
      highlight: [
        { index: 2, towardRing: true },
        { index: 3, towardRing: true },
        { index: 4, towardRing: true },
      ],
      ringHighlight: false,
      count: 3,
      hold: 2800,
      result: false,
      caption: t(
        'Fish 3, 4, 5 are on the reversed segment (1 flip). After straightening, they face TOWARD the ring ✓. Count so far: 3.',
        'Ikan 3, 4, 5 berada di segmen yang terbalik (1 putaran). Setelah diluruskan, mereka menghadap ke CINCIN ✓. Total sementara: 3.',
      ),
    },

    // Beat 5 — seg-c (fish 5 — segment C, 2 reversals → away ✗)
    {
      phase: 'seg-c',
      highlight: [
        { index: 5, towardRing: false },
      ],
      ringHighlight: false,
      count: 3,
      hold: 2400,
      result: false,
      caption: t(
        'Fish 6 sits between the second and third loops (2 flips = back to "away"). Still facing AWAY after straightening ✗. Count: still 3.',
        'Ikan 6 berada di antara loop kedua dan ketiga (2 putaran = kembali "menjauh"). Tetap menghadap MENJAUH setelah diluruskan ✗. Total: masih 3.',
      ),
    },

    // Beat 6 — seg-d (fish 6,7,8 — segment D, 3 reversals → toward ring ✓)
    {
      phase: 'seg-d',
      highlight: [
        { index: 6, towardRing: true },
        { index: 7, towardRing: true },
        { index: 8, towardRing: true },
      ],
      ringHighlight: false,
      count: 6,
      hold: 2800,
      result: false,
      caption: t(
        'Fish 7, 8, 9 are on the third reversed segment (3 flips = toward ring again ✓). Count: 3 + 3 = 6!',
        'Ikan 7, 8, 9 berada di segmen terbalik ketiga (3 putaran = menghadap cincin lagi ✓). Total: 3 + 3 = 6!',
      ),
    },

    // Beat 7 — seg-e (fish 9 — segment E, 4 reversals → away ✗)
    {
      phase: 'seg-e',
      highlight: [
        { index: 9, towardRing: false },
      ],
      ringHighlight: false,
      count: 6,
      hold: 2200,
      result: false,
      caption: t(
        'Fish 10 (at the very end, 4 flips) faces AWAY from the ring ✗. No change to count.',
        'Ikan 10 (di ujung tali, 4 putaran) menghadap MENJAUH dari cincin ✗. Total tidak berubah.',
      ),
    },

    // Beat 8 — count
    {
      phase: 'count',
      highlight: [
        { index: 2, towardRing: true },
        { index: 3, towardRing: true },
        { index: 4, towardRing: true },
        { index: 6, towardRing: true },
        { index: 7, towardRing: true },
        { index: 8, towardRing: true },
      ],
      ringHighlight: true,
      count: 6,
      hold: 2800,
      result: false,
      caption: t(
        'Highlighted: the 6 fish whose heads point toward the ring after straightening (fish 3, 4, 5 from loop 1; fish 7, 8, 9 from loop 3).',
        'Yang disorot: 6 ikan yang kepalanya menghadap ke cincin setelah diluruskan (ikan 3, 4, 5 dari loop 1; ikan 7, 8, 9 dari loop 3).',
      ),
    },

    // Beat 9 — result
    {
      phase: 'result',
      highlight: [
        { index: 2, towardRing: true },
        { index: 3, towardRing: true },
        { index: 4, towardRing: true },
        { index: 6, towardRing: true },
        { index: 7, towardRing: true },
        { index: 8, towardRing: true },
      ],
      ringHighlight: true,
      count: 6,
      hold: 0,
      result: true,
      caption: t(
        '6 fish face toward the ring when the line is straightened. Answer: C (6).',
        '6 ikan menghadap ke arah cincin ketika tali diluruskan. Jawaban: C (6).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
