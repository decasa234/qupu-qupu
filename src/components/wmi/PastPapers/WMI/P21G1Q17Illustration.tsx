// WMI-21P1A-Q17 (2021 Semifinal Grade 1) — "Fold the paper along the dotted
// line. What will it become?" (answer D).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g1-a-q17.jpg: a sheet of paper
// shaped like a rectangle with a rectangular NOTCH cut into the LEFT edge at
// mid-height (an "E"/bracket-like bite). Two dotted fold lines are printed: a
// VERTICAL line about two-thirds across and a HORIZONTAL line through the middle
// (together they make a cross). The printed answer options (the resulting shapes
// A–D) were separate images that were not extracted, so the explainer derives and
// indicates the correct option letter (D) rather than rendering all four.
//
// Folding the left part over the vertical crease lays the notched left edge onto
// the solid right part; the notch is covered, so the folded silhouette is a clean
// (un-notched) rectangle — the right-hand block. That clean rectangle is the
// answer, option D.
//
// This file draws ONLY the problem: the notched sheet with its two dotted fold
// lines. It never reveals the folded result. The co-exported PaperOutline /
// geometry constants let the explainer reuse the exact same sheet.
//
// Pure render, SSR-safe & deterministic (no window/document at module top, no
// Math.random / Date.now, no state).

const INK = '#1F2937'
const PAPER = '#FFFFFF'

// Sheet geometry (SVG units). Outer rectangle then a notch removed from the left
// edge. Coordinates are chosen with generous viewBox headroom so nothing clips.
export const SHEET = {
  x0: 30,
  y0: 24,
  w: 240,
  h: 180,
}

// The notch (rectangular bite out of the LEFT edge, vertically centred).
export const NOTCH = {
  depth: 56, // how far in from the left edge it cuts
  yTop: 24 + 56, // notch top (y)
  yBot: 24 + 124, // notch bottom (y)
}

// The two dotted fold lines.
export const FOLD = {
  vx: 30 + 156, // vertical crease x (about two-thirds across)
  hy: 24 + 90, // horizontal crease y (middle)
}

/**
 * The notched-sheet outline as an SVG path (clockwise from the top-left corner).
 * Reused by the explainer so the animated sheet matches the figure exactly.
 */
export function paperPath(): string {
  const { x0, y0, w, h } = SHEET
  const { depth, yTop, yBot } = NOTCH
  // top-left → top-right → bottom-right → bottom-left, with the left-edge notch.
  return [
    `M ${x0} ${y0}`,
    `H ${x0 + w}`,
    `V ${y0 + h}`,
    `H ${x0}`,
    `V ${yBot}`, // up the lower-left edge to the notch bottom
    `H ${x0 + depth}`, // into the notch
    `V ${yTop}`, // across the notch back wall
    `H ${x0}`, // out of the notch
    `Z`, // up to the start
  ].join(' ')
}

/** PaperOutline — the notched sheet, optionally with the dotted fold lines. */
export function PaperOutline({
  showFolds = true,
  fill = PAPER,
  stroke = INK,
  strokeWidth = 2.4,
}: {
  showFolds?: boolean
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <g>
      <path d={paperPath()} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {showFolds && (
        <g>
          {/* vertical crease */}
          <line x1={FOLD.vx} y1={SHEET.y0 - 6} x2={FOLD.vx} y2={SHEET.y0 + SHEET.h + 6} stroke={INK} strokeWidth={1.6} strokeDasharray="5 5" strokeLinecap="round" />
          {/* horizontal crease */}
          <line x1={SHEET.x0 - 6} y1={FOLD.hy} x2={SHEET.x0 + SHEET.w + 6} y2={FOLD.hy} stroke={INK} strokeWidth={1.6} strokeDasharray="5 5" strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}

export const Q17_VIEW_W = 300
export const Q17_VIEW_H = 232

export default function P21G1Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Selembar kertas berbentuk persegi panjang dengan takik persegi di tepi kirinya, beserta dua garis lipat putus-putus (satu tegak dan satu mendatar). Dilipat sepanjang garis putus-putus akan menjadi bentuk apa?"
    >
      <svg
        viewBox={`0 0 ${Q17_VIEW_W} ${Q17_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <PaperOutline />
      </svg>
    </div>
  )
}
