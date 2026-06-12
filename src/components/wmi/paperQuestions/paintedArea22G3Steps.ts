/**
 * WMI-22F3A-Q5 — Painted-area matching puzzle storyboard.
 *
 * Strategy: because π is irrational, two figures match in painted area only if
 * they share the SAME number of quarter-circle cells AND the same straight-edge
 * (polygon) area. Walk the options one by one, reject any that fail on either
 * count, and land on D which matches exactly.
 */

export type Lang = 'en' | 'id'

export type OptionKey = 'A' | 'B' | 'C' | 'D' | null

export interface PaintedAreaStep {
  /** Which option is highlighted this beat (null = show example / key idea). */
  option: OptionKey
  /** Number of quarter-circles shown for the active option (or example). */
  qcCount: number
  /** Straight-edge area value for the active option (or example). */
  straightArea: number
  /** Whether the current option matches the example. */
  verdict: boolean | null   // null = not yet decided (intro/key-idea beats)
  caption: string
  hold: number
  result: boolean
}

export interface PaintedAreaStoryboard {
  steps: PaintedAreaStep[]
  finalIndex: number
}

export function buildPaintedArea22G3Steps(lang: Lang): PaintedAreaStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PaintedAreaStep[] = [
    // Beat 0 — show the example and name its composition
    {
      option: null,
      qcCount: 2,
      straightArea: 2,
      verdict: null,
      hold: 2800,
      result: false,
      caption: t(
        'The example has 2 curved pieces (quarter-circles) and straight pieces that add up to area 2 (one full square + two half-triangles).',
        'Contoh punya 2 bagian melengkung (seperempat lingkaran) dan bagian lurus yang totalnya 2 (satu kotak penuh + dua segitiga setengah).',
      ),
    },
    // Beat 1 — key idea: the π test
    {
      option: null,
      qcCount: 2,
      straightArea: 2,
      verdict: null,
      hold: 3000,
      result: false,
      caption: t(
        'Key idea: a quarter-circle area uses π, which is irrational. Two figures only match if they have the SAME number of quarter-circles AND the same straight area. We need (2 quarter-circles, straight area = 2).',
        'Ide kunci: luas seperempat lingkaran mengandung π yang irasional. Dua gambar hanya cocok jika punya JUMLAH seperempat lingkaran SAMA dan luas lurus yang sama. Kita butuh (2 seperempat lingkaran, luas lurus = 2).',
      ),
    },
    // Beat 2 — Option A: (4, 1) — too many arcs, straight area too small
    {
      option: 'A',
      qcCount: 4,
      straightArea: 1,
      verdict: false,
      hold: 2400,
      result: false,
      caption: t(
        'Option A: 4 quarter-circles + 1 full square → tuple (4, 1). The arc count is wrong — 4 ≠ 2. ✗',
        'Pilihan A: 4 seperempat lingkaran + 1 kotak penuh → tuple (4, 1). Jumlah busur salah — 4 ≠ 2. ✗',
      ),
    },
    // Beat 3 — Option B: (0, 4.5) — no arcs at all
    {
      option: 'B',
      qcCount: 0,
      straightArea: 4.5,
      verdict: false,
      hold: 2400,
      result: false,
      caption: t(
        'Option B: 0 quarter-circles + 3 full squares + 3 half-triangles → tuple (0, 4.5). No arcs at all — 0 ≠ 2. ✗',
        'Pilihan B: 0 seperempat lingkaran + 3 kotak penuh + 3 segitiga setengah → tuple (0, 4.5). Tidak ada busur — 0 ≠ 2. ✗',
      ),
    },
    // Beat 4 — Option C: large arc (radius 2) + small arc → area = π + π/4
    {
      option: 'C',
      qcCount: 0,   // displayed as incompatible — the large arc spans 4 cells
      straightArea: 0,
      verdict: false,
      hold: 2400,
      result: false,
      caption: t(
        'Option C: a big quarter-circle (radius = 2 cells, area = π) plus a small one (area = π/4) → total π + π/4. The arc sizes are different — this can never equal π/2. ✗',
        'Pilihan C: satu seperempat lingkaran besar (jari-jari 2 kotak, luas = π) ditambah satu kecil (luas = π/4) → total π + π/4. Ukuran busurnya berbeda — tidak mungkin sama dengan π/2. ✗',
      ),
    },
    // Beat 5 — Option D: (2, 2) — exact match!
    {
      option: 'D',
      qcCount: 2,
      straightArea: 2,
      verdict: true,
      hold: 2600,
      result: false,
      caption: t(
        'Option D: 2 quarter-circles + 2 half-triangles + 1 full square → tuple (2, 2). Arc count ✓ AND straight area ✓ — this matches!',
        'Pilihan D: 2 seperempat lingkaran + 2 segitiga setengah + 1 kotak penuh → tuple (2, 2). Jumlah busur ✓ DAN luas lurus ✓ — ini cocok!',
      ),
    },
    // Beat 6 — final answer
    {
      option: 'D',
      qcCount: 2,
      straightArea: 2,
      verdict: true,
      hold: 0,
      result: true,
      caption: t(
        'Only D shares both (2 quarter-circles, straight area 2) with the example. Answer: D.',
        'Hanya D yang punya (2 seperempat lingkaran, luas lurus 2) sama seperti contoh. Jawaban: D.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
