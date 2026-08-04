// Level ladder for book-sheet-pages. One relation (sheet k carries pages 2k−1
// and 2k) is behind every ask, so the ladder walks the asks in the order the
// relation gets harder to use: count it, double it, undo the doubling, read a
// named sheet's two faces, then go backwards from a page to its partner.
// Difficulty proxy: ask weight (1/3/5/7/9) + biggest number in the story / 10.
//   L1: one-sided count — sheet number IS the page number
//   L2: two-sided count — every sheet is worth 2 pages (doubling)
//   L3: pages → sheets — the same relation run backwards (halving)
//   L4: which page is on the front/back of sheet k — 2k−1 vs 2k
//   L5: which page shares a sheet with page p — page → sheet → partner, two hops
//       at the top of the number range, and the odd/even parity decides direction
import type { Rng } from '../types.js'
import { sheetOfPage, type Params } from './index.js'

const NAMES = ['Lisa', 'Bagas', 'Rani', 'Dimas', 'Sari', 'Tio', 'Nabila', 'Farhan'] as const
const BOOKS = [
  { book_en: 'storybook', book_id: 'buku cerita' },
  { book_en: 'notebook', book_id: 'buku tulis' },
  { book_en: 'drawing book', book_id: 'buku gambar' },
] as const

export function bookSheetPagesLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const base = { name: rng.pick(NAMES), side: rng.pick(['front', 'back'] as const), ...rng.pick(BOOKS) }

  switch (level) {
    case 1: {
      const sheets = rng.int(4, 9)
      return { ...base, ask: 'pages-from-sheets', sided: 'one', sheets, page: sheets }
    }
    case 2: {
      const sheets = rng.int(3, 12)
      return { ...base, ask: 'pages-from-sheets', sided: 'two', sheets, page: 2 * sheets }
    }
    case 3: {
      const sheets = rng.int(6, 15)
      return { ...base, ask: 'sheets-from-pages', sided: 'two', sheets, page: 2 * sheets }
    }
    case 4: {
      const sheets = rng.int(4, 14)
      return { ...base, ask: 'page-on-the-back', sided: 'two', sheets, page: 2 * sheets }
    }
    case 5: {
      // Both parities are drawn, so the child meets front (odd) and back (even)
      // starting pages about equally often — each needs the opposite direction.
      const page = rng.int(21, 40)
      return { ...base, ask: 'which-page-shares-the-sheet', sided: 'two', page, sheets: sheetOfPage(page, 2) }
    }
  }
}
