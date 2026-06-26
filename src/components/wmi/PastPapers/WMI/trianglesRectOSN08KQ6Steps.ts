// trianglesRectOSN08KQ6Steps — OSN-08-SD-KAB-Q6
//
// "Keliling yang paling besar di antara segitiga ACD, DEC, dan DFC."
// Answer: segitiga ACD.
//
// Shared base DC is the same for all three, so we only compare the other two
// sides.  A is at the corner of the rectangle, giving AD + AC the maximum
// value; E and F are interior points on AB, so their "shortcut" struts are
// strictly shorter.
//
// Pure builder: (lang) => storyboard.  No Math.random, no Date — SSR-safe.

import type { TriHighlight } from './TrianglesRectOSN08KQ6Illustration'

export type Lang = 'en' | 'id'

export interface TriangleStep {
  highlight: TriHighlight
  caption: string
  /** ms to hold before auto-advancing (0 = final beat). */
  hold: number
  result: boolean
}

export interface TriangleStoryboard {
  steps: TriangleStep[]
  finalIndex: number
  answerLabel: string
}

export function buildTrianglesRectOSN08KQ6Steps(lang: Lang): TriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriangleStep[] = [
    // 1. Introduce the figure
    {
      highlight: null,
      hold: 2600,
      result: false,
      caption: t(
        'Rectangle ABCD with E and F on the top edge AB. Three triangles share base DC — we compare only their other two sides.',
        'Persegi panjang ABCD dengan E dan F pada sisi atas AB. Tiga segitiga berbagi alas DC — kita hanya bandingkan dua sisi lainnya.',
      ),
    },
    // 2. Highlight ACD
    {
      highlight: 'ACD',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle ACD (blue): sides AD + AC. AD = full height, AC = full diagonal — the longest possible pair from D and C.',
        'Segitiga ACD (biru): sisi AD + AC. AD = tinggi penuh, AC = diagonal penuh — pasangan terpanjang dari D dan C.',
      ),
    },
    // 3. Highlight DEC
    {
      highlight: 'DEC',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle DEC (orange): sides DE + EC. E lies strictly between A and B, so DE < DA and EC < AC. Both sides are shorter than ACD\'s.',
        'Segitiga DEC (oranye): sisi DE + EC. E terletak di antara A dan B, jadi DE < DA dan EC < AC. Kedua sisinya lebih pendek dari ACD.',
      ),
    },
    // 4. Highlight DFC
    {
      highlight: 'DFC',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle DFC (green): sides DF + FC. F is also interior on AB. Its struts are likewise shorter than ACD\'s sides.',
        'Segitiga DFC (hijau): sisi DF + FC. F juga di dalam AB. Strutsnya pun lebih pendek dari sisi ACD.',
      ),
    },
    // 5. Conclude
    {
      highlight: 'ACD',
      hold: 0,
      result: true,
      caption: t(
        'Since A is at the corner (the extreme end of the top edge), triangle ACD has the greatest perimeter.',
        'Karena A berada di sudut (ujung paling luar sisi atas), segitiga ACD memiliki keliling terbesar.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    answerLabel: t('Triangle ACD', 'Segitiga ACD'),
  }
}
