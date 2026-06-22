/**
 * IKMC-23-EC-Q8 — "Danny glued 2 pieces of paper (a gray quadrilateral and a
 * white triangle) on top of a black circle. What result can he NOT obtain?"
 * Answer: E.
 *
 * Stem (images 017–019): two loose pieces shown beside a black circle.
 *   017 — gray semicircle (flat edge down)
 *   018 — white quarter-circle (right angle at bottom-right)
 *   019 — black full circle (the base / background)
 *
 * Options A–E (images 020–024) show five possible results of placing those two
 * pieces on the circle. Only E is impossible: it shows the circle divided into
 * four neat rectangular quadrants (white top-left, two gray quadrants,
 * black bottom-right). A proper quarter-circle has a curved edge — it cannot
 * make a straight rectangular partition. Similarly, the semicircle covers a
 * half-circle, not two separate quadrants.
 *
 * Co-exports:
 *   CirclePieces8ECIllustration (default) — stem: two loose pieces + black circle
 *   CirclePieces8ECOption (named)         — renders ONE A–E choice
 *
 * Pool reuse: pure-SVG clipPath + arc technique from CutPiece5ECIllustration;
 * piece-on-circle layering from TwoPieces5ECIllustration.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ────────────────────────────────────────────────────────────
const BLACK = '#2A2A2A'
const GRAY  = '#8C8C8C'
const LGRAY = '#C0C0C0'   // lighter shade for second gray region in some options
const WHITE = '#FFFFFF'
const STROKE = '#555555'
const SW = 1.5

// ── SVG helpers ──────────────────────────────────────────────────────────────

/**
 * SVG arc path helper — draws a filled pie/sector or semicircle segment.
 * cx,cy = centre; r = radius; startDeg / endDeg in degrees (0=right, 90=down).
 */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  // large-arc-flag: 1 if the arc spans more than 180°
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`
}

// ── Stem (loose pieces + base circle) ────────────────────────────────────────

const STEM_W = 320
const STEM_H = 140
const PR = 44   // piece circle radius for loose display

/**
 * Stem diagram: shows the three items from left to right — gray semicircle,
 * white quarter-circle, black circle — as they appear on the printed paper.
 * Exported so the Explainer can reuse it.
 */
export function CirclePieces8ECStem() {
  const y = STEM_H / 2

  return (
    <svg
      viewBox={`0 0 ${STEM_W} ${STEM_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── piece 1: gray semicircle (flat edge down) ── */}
      <path
        d={arcPath(70, y + 10, PR, 180, 360)}
        fill={GRAY}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* flat base stroke */}
      <line x1={70 - PR} y1={y + 10} x2={70 + PR} y2={y + 10} stroke={STROKE} strokeWidth={SW} />

      {/* ── piece 2: white quarter-circle (right angle at bottom-right) ── */}
      {/* Rotated so right-angle corner is at bottom-right, arc sweeps from top to left */}
      <path
        d={arcPath(185, y + 10, PR, 180, 270)}
        fill={WHITE}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />

      {/* ── base: black circle ── */}
      <circle cx={270} cy={y} r={PR} fill={BLACK} stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

export default function CirclePieces8ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Stem: a gray semicircle piece, a white quarter-circle piece, and a black circle base — ' +
        'the two paper pieces will be glued on top of the black circle.'
      }
    >
      <CirclePieces8ECStem />
    </div>
  )
}

// ── Option figures A–E ───────────────────────────────────────────────────────
//
// Each option draws a circle of radius OPT_R with the two pieces layered on top
// in the arrangement shown in the original scan images (020–024).
//
// Layer order (back to front): black circle → gray piece → white piece.
//
// A (020): semicircle gray covers lower-left half; quarter-circle white covers
//          upper-right; visible black = upper-left wedge.
//
// B (021): semicircle gray covers left half; quarter-circle white occupies a
//          small top-right wedge; black visible bottom-right.
//
// C (022): semicircle gray covers right half; quarter-circle white covers
//          bottom-right quarter; black visible on left.
//
// D (023): semicircle gray covers upper half; quarter-circle white covers a
//          small lower-right wedge; black lower-left.
//
// E (024): IMPOSSIBLE — four neat rectangular quadrants (white top-left,
//          gray top-right, gray bottom-left, black bottom-right). This is
//          impossible because pieces are curved, not rectangular.
//          We draw it exactly as it appears to make the impossibility vivid.
//
// All option figures use a 120×120 viewBox so they render compactly.

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

const OPT_W = 120
const OPT_H = 120
const OPT_R = 52
const OPT_CX = 60
const OPT_CY = 60

interface CirclePiece8ECOptionDef {
  aria_en: string
  aria_id: string
  render: () => JSX.Element
}

// ── clipPath IDs are globally unique per option to avoid SSR id collisions.
// We use static unique suffixes per option label.

function renderCircle(fill: string) {
  return (
    <circle
      cx={OPT_CX}
      cy={OPT_CY}
      r={OPT_R}
      fill={fill}
      stroke={STROKE}
      strokeWidth={SW}
    />
  )
}

function Sector({ startDeg, endDeg, fill, clipId }: {
  startDeg: number
  endDeg: number
  fill: string
  clipId: string
}) {
  return (
    <>
      <clipPath id={clipId}>
        <circle cx={OPT_CX} cy={OPT_CY} r={OPT_R} />
      </clipPath>
      <path
        d={arcPath(OPT_CX, OPT_CY, OPT_R + 2, startDeg, endDeg)}
        fill={fill}
        clipPath={`url(#${clipId})`}
        stroke="none"
      />
    </>
  )
}

/**
 * Option A (020):
 *   Gray semicircle rotated to cover lower-left (180°–360° → placed at 135°–315°).
 *   White quarter-circle covers upper-right (315°–45°, i.e. -45° to 45°).
 *   Black shows in upper-left.
 */
function OptionAFigure() {
  return (
    <svg viewBox={`0 0 ${OPT_W} ${OPT_H}`} aria-hidden="true" style={{ display: 'block' }}>
      {renderCircle(BLACK)}
      <Sector startDeg={135} endDeg={315} fill={GRAY} clipId="cp8-a-gray" />
      <Sector startDeg={315} endDeg={45} fill={WHITE} clipId="cp8-a-white" />
      <circle cx={OPT_CX} cy={OPT_CY} r={OPT_R} fill="none" stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

/**
 * Option B (021):
 *   Gray semicircle covers the left half (90°–270°).
 *   White quarter-circle sits in upper-right (270°–360°).
 *   Black shows bottom-right.
 */
function OptionBFigure() {
  return (
    <svg viewBox={`0 0 ${OPT_W} ${OPT_H}`} aria-hidden="true" style={{ display: 'block' }}>
      {renderCircle(BLACK)}
      <Sector startDeg={90} endDeg={270} fill={GRAY} clipId="cp8-b-gray" />
      <Sector startDeg={270} endDeg={360} fill={WHITE} clipId="cp8-b-white" />
      <circle cx={OPT_CX} cy={OPT_CY} r={OPT_R} fill="none" stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

/**
 * Option C (022):
 *   Gray semicircle covers upper-right area (315°–135°, i.e. anticlockwise).
 *   White quarter-circle covers a slice in the bottom-right (90°–180°).
 *   Black shows on left.
 */
function OptionCFigure() {
  return (
    <svg viewBox={`0 0 ${OPT_W} ${OPT_H}`} aria-hidden="true" style={{ display: 'block' }}>
      {renderCircle(BLACK)}
      {/* gray covers right side — 270° to 90° (going clockwise over the right half) */}
      <Sector startDeg={270} endDeg={450} fill={GRAY} clipId="cp8-c-gray" />
      {/* white overlaps a quarter in lower-right */}
      <Sector startDeg={90} endDeg={180} fill={WHITE} clipId="cp8-c-white" />
      <circle cx={OPT_CX} cy={OPT_CY} r={OPT_R} fill="none" stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

/**
 * Option D (023):
 *   Gray semicircle covers upper half (180°–360°, flat edge at bottom).
 *   White quarter-circle sits in lower-right (0°–90°).
 *   Black shows lower-left.
 */
function OptionDFigure() {
  return (
    <svg viewBox={`0 0 ${OPT_W} ${OPT_H}`} aria-hidden="true" style={{ display: 'block' }}>
      {renderCircle(BLACK)}
      <Sector startDeg={180} endDeg={360} fill={GRAY} clipId="cp8-d-gray" />
      <Sector startDeg={0} endDeg={90} fill={WHITE} clipId="cp8-d-white" />
      <circle cx={OPT_CX} cy={OPT_CY} r={OPT_R} fill="none" stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

/**
 * Option E (024) — IMPOSSIBLE.
 *   Shows four equal rectangular quadrants: white top-left, gray top-right,
 *   light-gray bottom-left, black bottom-right.
 *   We draw it faithfully to match the source image (four neat straight-edged
 *   quadrants), which makes it visually clear that straight dividing lines are
 *   impossible with curved-edged paper pieces.
 */
function OptionEFigure() {
  const R = OPT_R
  const cx = OPT_CX
  const cy = OPT_CY
  return (
    <svg viewBox={`0 0 ${OPT_W} ${OPT_H}`} aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <clipPath id="cp8-e-circle">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>
      {/* base circle */}
      <circle cx={cx} cy={cy} r={R} fill={BLACK} />
      {/* four rectangular quadrants clipped to the circle */}
      {/* top-left: white */}
      <rect x={cx - R} y={cy - R} width={R} height={R} fill={WHITE} clipPath="url(#cp8-e-circle)" />
      {/* top-right: gray */}
      <rect x={cx} y={cy - R} width={R} height={R} fill={GRAY} clipPath="url(#cp8-e-circle)" />
      {/* bottom-left: light gray */}
      <rect x={cx - R} y={cy} width={R} height={R} fill={LGRAY} clipPath="url(#cp8-e-circle)" />
      {/* bottom-right: black (the base) */}
      {/* already covered by base circle */}
      {/* dividing lines */}
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={STROKE} strokeWidth={SW} clipPath="url(#cp8-e-circle)" />
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={STROKE} strokeWidth={SW} clipPath="url(#cp8-e-circle)" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

const OPTION_DEFS: Record<OptionLabel, CirclePiece8ECOptionDef> = {
  A: {
    aria_en: 'Option A: black circle with a gray semicircle covering the lower-left half and a white quarter-circle in the upper-right.',
    aria_id: 'Pilihan A: lingkaran hitam dengan setengah lingkaran abu-abu menutupi bagian kiri bawah dan seperempat lingkaran putih di kanan atas.',
    render: OptionAFigure,
  },
  B: {
    aria_en: 'Option B: black circle with a gray semicircle on the left half and a white quarter-circle in the upper-right.',
    aria_id: 'Pilihan B: lingkaran hitam dengan setengah lingkaran abu-abu di bagian kiri dan seperempat lingkaran putih di kanan atas.',
    render: OptionBFigure,
  },
  C: {
    aria_en: 'Option C: black circle with a gray semicircle on the right and a white quarter-circle at the bottom-right.',
    aria_id: 'Pilihan C: lingkaran hitam dengan setengah lingkaran abu-abu di kanan dan seperempat lingkaran putih di kanan bawah.',
    render: OptionCFigure,
  },
  D: {
    aria_en: 'Option D: black circle with a gray semicircle on the upper half and a white quarter-circle at the lower-right.',
    aria_id: 'Pilihan D: lingkaran hitam dengan setengah lingkaran abu-abu di bagian atas dan seperempat lingkaran putih di kanan bawah.',
    render: OptionDFigure,
  },
  E: {
    aria_en: 'Option E (IMPOSSIBLE): circle divided into four equal straight-edged rectangular quadrants — white, gray, light-gray, black. This cannot be achieved with a curved semicircle and quarter-circle.',
    aria_id: 'Pilihan E (TIDAK MUNGKIN): lingkaran dibagi menjadi empat kuadran persegi panjang bertepi lurus yang sama — putih, abu-abu, abu-abu muda, hitam. Ini tidak dapat dicapai dengan setengah lingkaran dan seperempat lingkaran yang melengkung.',
    render: OptionEFigure,
  },
}

/**
 * CirclePieces8ECOption — renders ONE A–E answer choice as a circle-with-pieces
 * picture. Registered in CHOICE_RENDERERS for IKMC-23-EC-Q8.
 */
export function CirclePieces8ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '').trim().toUpperCase() as OptionLabel
  const def = OPTION_DEFS[label]
  if (!def) return <span>{choice?.text}</span>

  return (
    <span
      role="img"
      aria-label={def.aria_en}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}
    >
      <div style={{ width: OPT_W, height: OPT_H }}>
        {def.render()}
      </div>
    </span>
  )
}
