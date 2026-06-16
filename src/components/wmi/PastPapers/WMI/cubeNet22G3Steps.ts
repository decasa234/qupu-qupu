/**
 * cubeNet22G3Steps — storyboard builder for WMI-22F3A-Q11
 *
 * The net has 7 squares; a cube needs exactly 6, so one must be removed.
 * The strip 2-3-4-5 forms the four side faces. Square 1 folds up as a cap.
 * Squares 6 and 7 are extra flaps below the strip.
 * A valid cube needs only ONE bottom cap → exactly one of {6, 7} must remain.
 *
 * Try-and-eliminate:
 *   Remove 1  → both 6 and 7 remain below → they collide on the same face ✗
 *   Remove 6  → 1 caps top, 7 caps bottom → valid cube ✓
 *   Remove 7  → 1 caps top, 6 caps bottom → valid cube ✓
 *   Answer D: "6 or 7"
 *
 * Pure function — no Math.random, no Date. SSR-safe.
 */

export type Lang = 'en' | 'id'

export type CubeNetPhase =
  | 'intro'       // show all 7 squares
  | 'sides'       // highlight the 2-3-4-5 strip
  | 'try1'        // remove square "1" → show collision
  | 'try6'        // remove square "6" → valid
  | 'try7'        // remove square "7" → valid
  | 'result'      // final beat: answer D

export interface CubeNetStep {
  phase: CubeNetPhase
  /** Set of square labels to grey out / cross out. */
  removed: Set<string>
  /** Set of square labels to amber-highlight. */
  highlight: Set<string>
  /** Show the collision warning (two squares fighting for the same face). */
  collision: boolean
  /** Show the checkmark badge (this removal yields a valid cube). */
  valid: boolean | null
  caption: string
  hold: number
}

export interface CubeNetStoryboard {
  steps: CubeNetStep[]
  finalIndex: number
}

export function buildCubeNet22G3Steps(lang: Lang): CubeNetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeNetStep[] = [
    // Beat 0 — intro: 7 squares, a cube only needs 6
    {
      phase: 'intro',
      removed: new Set(),
      highlight: new Set(),
      collision: false,
      valid: null,
      hold: 1800,
      caption: t(
        'This net has 7 squares, but a cube only needs 6. One must be removed!',
        'Jaring ini punya 7 persegi, tapi kubus hanya butuh 6. Satu harus dibuang!',
      ),
    },
    // Beat 1 — sides: the 2-3-4-5 strip is the four side faces
    {
      phase: 'sides',
      removed: new Set(),
      highlight: new Set(['2', '3', '4', '5']),
      collision: false,
      valid: null,
      hold: 2000,
      caption: t(
        'Squares 2-3-4-5 wrap around as the 4 side faces. We need one top cap and one bottom cap.',
        'Persegi 2-3-4-5 membungkus menjadi 4 sisi. Kita butuh satu tutup atas dan satu tutup bawah.',
      ),
    },
    // Beat 2 — try removing "1": both 6 and 7 remain below → collision
    {
      phase: 'try1',
      removed: new Set(['1']),
      highlight: new Set(['6', '7']),
      collision: true,
      valid: false,
      hold: 2200,
      caption: t(
        'Remove 1? Then 6 AND 7 are both below the strip — they crash into the same bottom face. ✗',
        'Buang 1? Maka 6 DAN 7 sama-sama di bawah — keduanya menabrak sisi bawah yang sama. ✗',
      ),
    },
    // Beat 3 — try removing "6": 1 caps top, 7 caps bottom → valid
    {
      phase: 'try6',
      removed: new Set(['6']),
      highlight: new Set(['1', '7']),
      collision: false,
      valid: true,
      hold: 2000,
      caption: t(
        'Remove 6? Square 1 caps the top, square 7 caps the bottom — folds into a cube! ✓',
        'Buang 6? Persegi 1 menutup atas, persegi 7 menutup bawah — terlipat jadi kubus! ✓',
      ),
    },
    // Beat 4 — try removing "7": 1 caps top, 6 caps bottom → valid
    {
      phase: 'try7',
      removed: new Set(['7']),
      highlight: new Set(['1', '6']),
      collision: false,
      valid: true,
      hold: 2000,
      caption: t(
        'Remove 7? Square 1 caps the top, square 6 caps the bottom — folds into a cube! ✓',
        'Buang 7? Persegi 1 menutup atas, persegi 6 menutup bawah — terlipat jadi kubus! ✓',
      ),
    },
    // Beat 5 — result: answer D = "6 or 7"
    {
      phase: 'result',
      removed: new Set(),
      highlight: new Set(['6', '7']),
      collision: false,
      valid: true,
      hold: 0,
      caption: t(
        'Removing square 6 OR square 7 gives a valid cube. Answer: D (6 or 7).',
        'Membuang persegi 6 ATAU persegi 7 menghasilkan kubus. Jawaban: D (6 atau 7).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
