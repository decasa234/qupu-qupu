/**
 * SEAMOX-20-A-Q4 — Illustration for "How many rectangles are in the figure below?"
 *
 * Source figure: docs/reference/ocr-res/seamo-x/contest/paper-a/2020.imgs/005.jpg
 * Answer: 12 rectangles.
 *
 * The figure is a large outer rectangle subdivided by 5 internal line segments
 * into 6 atomic cells.  The stem shows only the problem figure.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

import { SeamoX20A4FigureSVG } from './SeamoX20A4Figure'

export default function SeamoX20A4Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Sebuah persegi panjang besar yang dibagi oleh garis-garis internal menjadi 6 bagian. Berapa banyak persegi panjang yang ada di dalam gambar tersebut?"
    >
      <SeamoX20A4FigureSVG />
    </div>
  )
}
