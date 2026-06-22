// IKMC-23-PE-Q17 — "Elvis has 6 identical triangles. Which of the following pictures can he make?"
//
// Stem (046.jpg): an inverted (apex-down) equilateral triangle subdivided into 4
// congruent smaller triangles by connecting each pair of edge midpoints:
//   top-left midpoint → bottom apex midpoint
//   top-right midpoint → bottom apex midpoint
//   horizontal midline connecting left-edge midpoint to right-edge midpoint
// The result is the "X + horizontal" subdivision (triforce-style, pointing down).
//
// Answer A (047.jpg): a regular hexagon tiled by 6 copies of the stem triangle,
// each rotated 60° around the centre — the X-subdivision lines from every tile
// are all visible, matching the source image.
//
// Options B–E each show a hexagon with a different internal line pattern that
// cannot be formed by 6 identical copies of the stem triangle.
//
// Co-exports Triangle17PEOption for CHOICE_RENDERERS.
// Pure SVG, no random, no dates, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ─── Colour palette (matching OCR image colours) ──────────────────────────────
const FILL   = '#F5C5B0'   // warm salmon / light pink fill
const STROKE = '#6B3020'   // dark brown outline
const SW     = 1.5         // stroke width for outer edges
const ISW    = 1.0         // stroke width for internal subdivisions

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/** Cartesian point. */
type Pt = { x: number; y: number }

function pt(x: number, y: number): Pt { return { x, y } }

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function ptStr(p: Pt): string { return `${p.x},${p.y}` }

function polyStr(pts: Pt[]): string { return pts.map(ptStr).join(' ') }

// ─── Stem triangle ─────────────────────────────────────────────────────────────
//
// The inverted equilateral triangle with apex at the bottom.
// Vertices (for a side length of S, centred on (cx, cy)):
//   A = top-left = (cx - S/2, cy - h/3)
//   B = top-right = (cx + S/2, cy - h/3)
//   C = bottom apex = (cx, cy + 2*h/3)
// where h = S * sqrt(3)/2.
//
// Midpoints:
//   M_AB = midpoint of AB
//   M_AC = midpoint of AC
//   M_BC = midpoint of BC
//
// Internal lines connect the three midpoints to each other (standard midpoint
// subdivision), producing the 4-triangle "triforce-inverted" pattern.

interface StemTriangleProps {
  cx?: number
  cy?: number
  side?: number
}

export function StemTriangle({ cx = 60, cy = 55, side = 90 }: StemTriangleProps) {
  const h = (side * Math.sqrt(3)) / 2

  // The three vertices of the outer inverted triangle
  const A = pt(cx - side / 2, cy - h / 3)   // top-left
  const B = pt(cx + side / 2, cy - h / 3)   // top-right
  const C = pt(cx, cy + (2 * h) / 3)        // bottom apex

  // Midpoints of each edge
  const MAB = lerp(A, B, 0.5)  // mid of top edge
  const MAC = lerp(A, C, 0.5)  // mid of left-slant edge
  const MBC = lerp(B, C, 0.5)  // mid of right-slant edge

  return (
    <>
      {/* Filled outer triangle */}
      <polygon
        points={polyStr([A, B, C])}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* Internal midpoint lines */}
      <line x1={MAB.x} y1={MAB.y} x2={MAC.x} y2={MAC.y} stroke={STROKE} strokeWidth={ISW} />
      <line x1={MAB.x} y1={MAB.y} x2={MBC.x} y2={MBC.y} stroke={STROKE} strokeWidth={ISW} />
      <line x1={MAC.x} y1={MAC.y} x2={MBC.x} y2={MBC.y} stroke={STROKE} strokeWidth={ISW} />
    </>
  )
}

// ─── Hexagon option builders ───────────────────────────────────────────────────
//
// A regular hexagon can be divided into 6 equilateral triangles.
// Each of the 6 triangles is the stem shape rotated by k*60°.
//
// We place the hexagon centred at (cx, cy) with "point-top" orientation
// (flat sides top and bottom) to match the reference images.

function hexVertex(cx: number, cy: number, r: number, k: number): Pt {
  // k = 0..5; angle 0 = top (point-top hex)
  const a = (Math.PI / 3) * k - Math.PI / 2
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

// ─── OPTION A ─────────────────────────────────────────────────────────────────
// The correct answer: 6 copies of the stem triangle forming a regular hexagon.
// Each sector: centre → vertex[k] → vertex[k+1], subdivided with midpoints.

function OptionAHex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const verts = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r, k))
  const center = pt(cx, cy)

  return (
    <>
      {/* Solid fill background */}
      <polygon
        points={polyStr(verts)}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* 6 triangular sectors with midpoint subdivision lines */}
      {verts.map((v, k) => {
        const v2 = verts[(k + 1) % 6]
        // Midpoints of the three edges of this sector triangle:
        //   edge 0: center → v        → M_cv
        //   edge 1: v → v2            → M_vv2
        //   edge 2: v2 → center       → M_v2c
        const M_cv   = lerp(center, v, 0.5)
        const M_vv2  = lerp(v, v2, 0.5)
        const M_v2c  = lerp(v2, center, 0.5)

        return (
          <g key={k}>
            {/* Dividing line between sectors */}
            <line
              x1={center.x} y1={center.y}
              x2={v.x}       y2={v.y}
              stroke={STROKE} strokeWidth={SW}
            />
            {/* Midpoint connections */}
            <line x1={M_cv.x}  y1={M_cv.y}  x2={M_vv2.x} y2={M_vv2.y} stroke={STROKE} strokeWidth={ISW} />
            <line x1={M_vv2.x} y1={M_vv2.y} x2={M_v2c.x} y2={M_v2c.y} stroke={STROKE} strokeWidth={ISW} />
            <line x1={M_v2c.x} y1={M_v2c.y} x2={M_cv.x}  y2={M_cv.y}  stroke={STROKE} strokeWidth={ISW} />
          </g>
        )
      })}
    </>
  )
}

// ─── OPTION B ─────────────────────────────────────────────────────────────────
// Hexagon with a dense triangular grid (subdivided further — more lines than stem).
// Each sector is split into 4 triangles AND the inner ring subdivided again.

function OptionBHex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const verts = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r, k))
  const center = pt(cx, cy)

  // Inner hexagon at r/2
  const inner = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r / 2, k))

  return (
    <>
      <polygon
        points={polyStr(verts)}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* Sector dividers */}
      {verts.map((v, k) => (
        <line key={`s${k}`} x1={center.x} y1={center.y} x2={v.x} y2={v.y}
          stroke={STROKE} strokeWidth={SW} />
      ))}
      {/* Inner hex ring */}
      {inner.map((iv, k) => {
        const iv2 = inner[(k + 1) % 6]
        const v   = verts[k]
        const v2  = verts[(k + 1) % 6]
        return (
          <g key={k}>
            <line x1={iv.x} y1={iv.y} x2={iv2.x} y2={iv2.y} stroke={STROKE} strokeWidth={ISW} />
            {/* Outer ring subdivision */}
            <line x1={iv.x} y1={iv.y} x2={v.x}   y2={v.y}   stroke={STROKE} strokeWidth={ISW} />
            <line x1={iv2.x} y1={iv2.y} x2={v2.x}  y2={v2.y}  stroke={STROKE} strokeWidth={ISW} />
            {/* Cross lines in outer ring triangle */}
            <line x1={lerp(v,v2,0.5).x} y1={lerp(v,v2,0.5).y}
                  x2={center.x} y2={center.y} stroke={STROKE} strokeWidth={ISW} />
          </g>
        )
      })}
      {/* Inner hex polygon */}
      <polygon points={polyStr(inner)} fill="none" stroke={STROKE} strokeWidth={ISW} />
      {/* Center star */}
      {inner.map((iv, k) => (
        <line key={`c${k}`}
          x1={center.x} y1={center.y}
          x2={iv.x} y2={iv.y}
          stroke={STROKE} strokeWidth={ISW} />
      ))}
    </>
  )
}

// ─── OPTION C ─────────────────────────────────────────────────────────────────
// Hexagon with a 6-pointed Y/star pattern (only center-to-vertex lines + curved edges).
// Much sparser than option A — only 6 main radial lines, no midpoint subdivisions.

function OptionCHex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const verts = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r, k))
  const center = pt(cx, cy)
  // midpoints of outer edges (for bent inward star)
  const mids = verts.map((v, k) => lerp(v, verts[(k + 1) % 6], 0.5))
  // inner ring at r*0.45
  const inner = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r * 0.45, k))

  return (
    <>
      <polygon
        points={polyStr(verts)}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* 6 radial lines to vertices */}
      {verts.map((v, k) => (
        <line key={`r${k}`} x1={center.x} y1={center.y} x2={v.x} y2={v.y}
          stroke={STROKE} strokeWidth={SW} />
      ))}
      {/* Bent star arms: each vertex connects to the two adjacent mid-edge inner points */}
      {inner.map((iv, k) => {
        const v  = verts[k]
        const m1 = mids[(k + 5) % 6]
        const m2 = mids[k]
        return (
          <g key={k}>
            <line x1={v.x} y1={v.y} x2={m1.x} y2={m1.y} stroke={STROKE} strokeWidth={ISW} />
            <line x1={v.x} y1={v.y} x2={m2.x} y2={m2.y} stroke={STROKE} strokeWidth={ISW} />
            <line x1={iv.x} y1={iv.y} x2={m1.x} y2={m1.y} stroke={STROKE} strokeWidth={ISW} />
            <line x1={iv.x} y1={iv.y} x2={m2.x} y2={m2.y} stroke={STROKE} strokeWidth={ISW} />
          </g>
        )
      })}
    </>
  )
}

// ─── OPTION D ─────────────────────────────────────────────────────────────────
// Hexagon with a simple triangular grid (no X-subdivision in each sector).
// Divided into a flat grid of small equilateral triangles — 4 rows of 4 each.

function OptionDHex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const verts = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r, k))
  const center = pt(cx, cy)
  // 3 sub-rings
  const r1 = r * 0.33
  const r2 = r * 0.66
  const inner1 = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r1, k))
  const inner2 = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r2, k))

  return (
    <>
      <polygon
        points={polyStr(verts)}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* Sector dividers at full radius */}
      {verts.map((v, k) => (
        <line key={`sv${k}`} x1={center.x} y1={center.y} x2={v.x} y2={v.y}
          stroke={STROKE} strokeWidth={ISW} />
      ))}
      {/* Inner ring 1 */}
      {inner1.map((iv, k) => {
        const iv2 = inner1[(k + 1) % 6]
        return <line key={`i1${k}`} x1={iv.x} y1={iv.y} x2={iv2.x} y2={iv2.y}
          stroke={STROKE} strokeWidth={ISW} />
      })}
      {/* Inner ring 2 */}
      {inner2.map((iv, k) => {
        const iv2 = inner2[(k + 1) % 6]
        return <line key={`i2${k}`} x1={iv.x} y1={iv.y} x2={iv2.x} y2={iv2.y}
          stroke={STROKE} strokeWidth={ISW} />
      })}
      {/* Radial spokes at inner radii */}
      {inner1.map((iv, k) => (
        <g key={`sp${k}`}>
          <line x1={center.x} y1={center.y} x2={iv.x} y2={iv.y} stroke={STROKE} strokeWidth={ISW} />
          <line x1={inner2[k].x} y1={inner2[k].y} x2={verts[k].x} y2={verts[k].y}
            stroke={STROKE} strokeWidth={ISW} />
          {/* Cross lines between rings */}
          <line x1={inner1[k].x} y1={inner1[k].y}
                x2={inner2[(k + 1) % 6].x} y2={inner2[(k + 1) % 6].y}
                stroke={STROKE} strokeWidth={ISW} />
        </g>
      ))}
    </>
  )
}

// ─── OPTION E ─────────────────────────────────────────────────────────────────
// Hexagon with an irregular 6-pointed star overlaid (different diagonal pattern).
// The lines cross in a way that doesn't tile 6 identical triangles.

function OptionEHex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const verts = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r, k))
  // star inner points at r/2, offset by 30°
  const starInner = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r * 0.5, k + 0.5))

  return (
    <>
      <polygon
        points={polyStr(verts)}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* Outer triangle 1: vertices 0,2,4 */}
      <polygon
        points={polyStr([verts[0], verts[2], verts[4]])}
        fill="none"
        stroke={STROKE}
        strokeWidth={ISW}
      />
      {/* Outer triangle 2: vertices 1,3,5 */}
      <polygon
        points={polyStr([verts[1], verts[3], verts[5]])}
        fill="none"
        stroke={STROKE}
        strokeWidth={ISW}
      />
      {/* Star inner ring */}
      {starInner.map((si, k) => {
        const si2 = starInner[(k + 1) % 6]
        return <line key={k} x1={si.x} y1={si.y} x2={si2.x} y2={si2.y}
          stroke={STROKE} strokeWidth={ISW} />
      })}
      {/* Radials from center to starInner */}
      {starInner.map((si, k) => (
        <line key={`r${k}`} x1={cx} y1={cy} x2={si.x} y2={si.y}
          stroke={STROKE} strokeWidth={ISW} />
      ))}
    </>
  )
}

// ─── Aria labels ──────────────────────────────────────────────────────────────

const ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: a regular hexagon made from 6 identical X-subdivided triangles — this is the correct answer.',
    id: 'Pilihan A: segi enam beraturan yang terbuat dari 6 segitiga identik dengan subdivisi X — ini adalah jawaban yang benar.',
  },
  B: {
    en: 'Option B: a hexagon with a denser internal grid pattern — not made from 6 identical copies of the stem triangle.',
    id: 'Pilihan B: segi enam dengan pola grid internal yang lebih padat — tidak terbuat dari 6 salinan identik segitiga batang.',
  },
  C: {
    en: 'Option C: a hexagon with a sparse Y-star pattern — not made from 6 identical copies of the stem triangle.',
    id: 'Pilihan C: segi enam dengan pola bintang-Y yang jarang — tidak terbuat dari 6 salinan identik segitiga batang.',
  },
  D: {
    en: 'Option D: a hexagon with a simple triangular grid — not made from 6 identical copies of the stem triangle.',
    id: 'Pilihan D: segi enam dengan grid segitiga sederhana — tidak terbuat dari 6 salinan identik segitiga batang.',
  },
  E: {
    en: 'Option E: a hexagon with a 6-pointed star overlay — not made from 6 identical copies of the stem triangle.',
    id: 'Pilihan E: segi enam dengan overlay bintang 6 ujung — tidak terbuat dari 6 salinan identik segitiga batang.',
  },
}

// ─── Stem illustration ────────────────────────────────────────────────────────

/**
 * Triangle17PEIllustration — shows the inverted equilateral triangle
 * subdivided into 4 smaller triangles (the stem figure for IKMC-23-PE-Q17).
 *
 * Shows ONLY the problem triangle, not the answer (the options are shown
 * via Triangle17PEOption in CHOICE_RENDERERS).
 */
export default function Triangle17PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A triangle pointing downward, divided into 4 smaller triangles by lines connecting the midpoints of each side. Elvis has 6 of these identical triangles.'
      }
    >
      <svg
        viewBox="0 0 120 110"
        width={140}
        height={130}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <StemTriangle cx={60} cy={52} side={96} />
      </svg>
    </div>
  )
}

// ─── Option renderer ──────────────────────────────────────────────────────────

const OPTION_R = 44   // hexagon circumradius in svg units (fits in ~100×100)
const OPTION_CX = 50
const OPTION_CY = 50

const HEX_RENDERERS: Record<string, () => React.ReactElement> = {
  A: () => <OptionAHex cx={OPTION_CX} cy={OPTION_CY} r={OPTION_R} />,
  B: () => <OptionBHex cx={OPTION_CX} cy={OPTION_CY} r={OPTION_R} />,
  C: () => <OptionCHex cx={OPTION_CX} cy={OPTION_CY} r={OPTION_R} />,
  D: () => <OptionDHex cx={OPTION_CX} cy={OPTION_CY} r={OPTION_R} />,
  E: () => <OptionEHex cx={OPTION_CX} cy={OPTION_CY} r={OPTION_R} />,
}

/**
 * Triangle17PEOption — renders one A/B/C/D/E choice as a hexagonal SVG figure.
 * Registered in CHOICE_RENDERERS for IKMC-23-PE-Q17.
 */
export function Triangle17PEOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const render = HEX_RENDERERS[k]
  const aria   = ARIA[k]
  if (!render) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={90}
        height={90}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {render()}
      </svg>
    </span>
  )
}
