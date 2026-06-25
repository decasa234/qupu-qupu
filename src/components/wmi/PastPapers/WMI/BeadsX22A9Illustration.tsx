/**
 * SEAMOX-22-A-Q9 — Stem illustration for "How many beads are there in all?"
 *
 * Shows the four growing square-ring bead figures (Fig 1–4) exactly as they
 * appear in the source paper:
 *   Fig 1 → 1 bead,  Fig 2 → 8 beads,
 *   Fig 3 → 16 beads, Fig 4 → 24 beads.
 *
 * The question asks students to sum them (1 + 8 + 16 + 24 = 49).
 * The stem shows only the problem; no answer or running total.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

import { BeadsX22A9SVG } from './BeadsX22A9Figure'

export default function BeadsX22A9Illustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const ariaLabel =
    lang === 'id'
      ? 'Empat gambar manik-manik berbentuk cincin persegi: Gambar 1 (1 manik), Gambar 2 (8 manik), Gambar 3 (16 manik), Gambar 4 (24 manik).'
      : 'Four square-ring bead figures: Fig 1 (1 bead), Fig 2 (8 beads), Fig 3 (16 beads), Fig 4 (24 beads).'

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={ariaLabel}
    >
      <BeadsX22A9SVG lang={lang} />
    </div>
  )
}
