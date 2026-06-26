// OSN 2024 SD Nasional Teori1 Q14 — graph-colouring tile steps.
// 8 pentagons (two C4 groups) + 1 quadrilateral.
// Strategy: disjoint palettes → count groups independently → 18 × 18 × 2 = 648.

export interface ColorTileStep {
  highlight: string[]
  colorMap: Partial<Record<string, string>>
  caption: string
  hold: number
  result: boolean
}

function t(lang: 'en' | 'id', en: string, id: string) {
  return lang === 'id' ? id : en
}

// Sample 3-colourings for a C4 to illustrate (not the solution, just a demo)
const RED    = '#FCA5A5' // red-300
const YELLOW = '#FDE047' // yellow-300
const BLUE   = '#93C5FD' // blue-300
const GREEN  = '#86EFAC' // green-300
const PURPLE = '#C4B5FD' // violet-300

export function buildColorTileOSN24NT1Q14Steps(lang: 'en' | 'id'): ColorTileStep[] {
  return [
    // Beat 0 — overview
    {
      highlight: [],
      colorMap: {},
      hold: 2800,
      result: false,
      caption: t(
        lang,
        'Colour the figure: adjacent shapes must differ. Pentagons use {red, yellow, blue}; quadrilateral uses {green, purple}.',
        'Warnai gambar: bangun bersisian harus berbeda. Segi lima: {merah, kuning, biru}; segi empat: {hijau, ungu}.',
      ),
    },
    // Beat 1 — key insight: cross-type pairs always OK
    {
      highlight: ['p3', 'p4', 'q'],
      colorMap: {},
      hold: 2800,
      result: false,
      caption: t(
        lang,
        'Key: pentagon colours {red, yellow, blue} and quadrilateral colours {green, purple} are disjoint — cross-type adjacent pairs are always valid! Only same-type adjacencies need checking.',
        'Kunci: warna segi lima {merah, kuning, biru} dan segi empat {hijau, ungu} tidak tumpang tindih — pasangan beda jenis selalu valid! Hanya ketetanggaan sesama jenis yang perlu dicek.',
      ),
    },
    // Beat 2 — identify top C4 group
    {
      highlight: ['p1', 'p2', 'p3', 'p4'],
      colorMap: {},
      hold: 2800,
      result: false,
      caption: t(
        lang,
        'Top group: 4 pentagons forming a 4-cycle (each adjacent to exactly 2 others). Counting 3-colourings of a 4-cycle: P(C₄, 3) = (3−1)⁴ + (3−1) = 16 + 2 = 18.',
        'Grup atas: 4 segi lima membentuk siklus-4 (masing-masing bertetangga tepat 2 lainnya). Pewarnaan siklus-4 dengan 3 warna: P(C₄, 3) = (3−1)⁴ + (3−1) = 16 + 2 = 18.',
      ),
    },
    // Beat 3 — show a sample colouring of top C4
    {
      highlight: [],
      colorMap: { p1: RED, p2: YELLOW, p3: YELLOW, p4: RED },
      hold: 2400,
      result: false,
      caption: t(
        lang,
        'Example: one valid top-group colouring (opposite pentagons share a colour). There are 18 such colourings.',
        'Contoh: satu pewarnaan valid grup atas (segi lima berseberangan boleh sama). Ada 18 susunan.',
      ),
    },
    // Beat 4 — identify bottom C4 group
    {
      highlight: ['p5', 'p6', 'p7', 'p8'],
      colorMap: { p1: RED, p2: YELLOW, p3: YELLOW, p4: RED },
      hold: 2800,
      result: false,
      caption: t(
        lang,
        'Bottom group: same structure — another independent 4-cycle of pentagons → 18 colourings. Since both groups are independent, multiply: 18 × 18 = 324.',
        'Grup bawah: struktur sama — siklus-4 segi lima yang independen → 18 pewarnaan. Keduanya independen, kalikan: 18 × 18 = 324.',
      ),
    },
    // Beat 5 — quadrilateral
    {
      highlight: ['q'],
      colorMap: { p1: RED, p2: YELLOW, p3: YELLOW, p4: RED, p5: BLUE, p6: RED, p7: RED, p8: BLUE },
      hold: 2600,
      result: false,
      caption: t(
        lang,
        'Quadrilateral: 2 colour choices (green or purple), completely independent of all pentagons → 2 colourings.',
        'Segi empat: 2 pilihan warna (hijau atau ungu), bebas dari semua segi lima → 2 susunan.',
      ),
    },
    // Beat 6 — final result
    {
      highlight: [],
      colorMap: {
        p1: RED, p2: YELLOW, p3: YELLOW, p4: RED,
        p5: BLUE, p6: RED, p7: RED, p8: BLUE,
        q: GREEN,
      },
      hold: 0,
      result: true,
      caption: t(
        lang,
        'Total = 324 × 2 = 648',
        'Total = 324 × 2 = 648',
      ),
    },
  ]
}
