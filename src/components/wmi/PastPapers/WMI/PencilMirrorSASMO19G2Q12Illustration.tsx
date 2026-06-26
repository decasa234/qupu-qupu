// SASMO-19-G2-Q12 — "Temukan bayangan cermin dari gambar di sebelah kanan."
// (Find the mirror image of the picture on the right.)
//
// The picture shows coloured pencils arranged in a # cross pattern.
// A left-right mirror swaps which coloured tips point which direction.
// Answer: B.
//
// Default export → stem illustration (the reference # arrangement).
// Named export  → PencilMirrorSASMO19G2Q12Option (CHOICE_RENDERERS).
//
// No primitives match a pencil-cross figure — drawn fresh here.
// Pure SVG, SSR-safe (no hooks, no framer-motion).

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Pencil drawing primitive
// Drawn pointing RIGHT (tip at right end, eraser at left), centred at origin,
// then translated + rotated by transform.
// ---------------------------------------------------------------------------
interface PencilProps {
  cx: number
  cy: number
  angleDeg: number
  bodyColor: string
  length?: number
  width?: number
}

function Pencil({ cx, cy, angleDeg, bodyColor, length = 76, width = 11 }: PencilProps) {
  const hl = length / 2   // half-length
  const hw = width / 2    // half-width
  const TIP  = 14         // wood-tip triangle length
  const BAND = 5          // metal ferrule width
  const ERS  = 7          // eraser length

  const bodyX   = -hl + ERS + BAND // start of main body
  const woodX   = hl - TIP         // start of wood tip

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angleDeg})`}>
      {/* Main coloured body */}
      <rect x={bodyX} y={-hw} width={woodX - bodyX} height={width}
        fill={bodyColor} rx="1" />
      {/* Metal ferrule */}
      <rect x={-hl + ERS} y={-hw} width={BAND} height={width}
        fill="#B8B8B8" />
      {/* Eraser */}
      <rect x={-hl} y={-hw} width={ERS} height={width}
        fill="#F9A8A8" rx="2" />
      {/* Wood tip (triangle) */}
      <polygon
        points={`${woodX},${-hw} ${hl},0 ${woodX},${hw}`}
        fill="#D4A656" />
      {/* Lead dot */}
      <circle cx={hl - 1.5} cy={0} r={1.8} fill="#2D2D2D" />
      {/* Subtle body outline */}
      <rect x={bodyX} y={-hw} width={woodX - bodyX} height={width}
        fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.7" rx="1" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Pencil arrangement configs
//
// Reference (stem) — orange + green go NE (angle=-45°, tip upper-right);
//                     pink + purple go SE (angle=+45°, tip lower-right).
// They are offset to form a # / hashtag cross pattern.
//
// Option B (correct mirror) — horizontal flip: positions swap around x=60,
//   angles reflect: -45→-135 (tip upper-left), +45→+135 (tip lower-left).
//
// Wrong options use different angles / positions so they are visually
// distinguishable from both the reference and from B.
// ---------------------------------------------------------------------------
interface PcfG { cx: number; cy: number; angle: number; body: string }

// Reference and stem share this arrangement.
const PENCILS_REF: PcfG[] = [
  { cx: 54, cy: 54, angle: -45,  body: '#F97316' }, // orange — NE (tip upper-right)
  { cx: 66, cy: 66, angle: -45,  body: '#22C55E' }, // green  — NE
  { cx: 66, cy: 54, angle:  45,  body: '#EC4899' }, // pink   — SE (tip lower-right)
  { cx: 54, cy: 66, angle:  45,  body: '#A855F7' }, // purple — SE
]

const PENCILS_BY_LABEL: Record<string, PcfG[]> = {
  // A — shallow cross (±20° instead of ±45°); tips point gently, not steeply
  A: [
    { cx: 54, cy: 54, angle: -20,  body: '#F97316' },
    { cx: 66, cy: 66, angle: -20,  body: '#22C55E' },
    { cx: 66, cy: 54, angle:  20,  body: '#EC4899' },
    { cx: 54, cy: 66, angle:  20,  body: '#A855F7' },
  ],
  // B — correct mirror: positions flip (x 54↔66) + angles reflect (–45→–135, +45→+135)
  B: [
    { cx: 66, cy: 54, angle: -135, body: '#F97316' }, // orange — NW (tip upper-left)
    { cx: 54, cy: 66, angle: -135, body: '#22C55E' }, // green  — NW
    { cx: 54, cy: 54, angle:  135, body: '#EC4899' }, // pink   — SW (tip lower-left)
    { cx: 66, cy: 66, angle:  135, body: '#A855F7' }, // purple — SW
  ],
  // C — reversed: orange+green go SE, pink+purple go NE (swapped direction from ref)
  C: [
    { cx: 54, cy: 54, angle:  45,  body: '#F97316' },
    { cx: 66, cy: 66, angle:  45,  body: '#22C55E' },
    { cx: 66, cy: 54, angle: -45,  body: '#EC4899' },
    { cx: 54, cy: 66, angle: -45,  body: '#A855F7' },
  ],
  // D — steep cross (±70°, nearly vertical)
  D: [
    { cx: 54, cy: 54, angle: -70,  body: '#F97316' },
    { cx: 66, cy: 66, angle: -70,  body: '#22C55E' },
    { cx: 66, cy: 54, angle:  70,  body: '#EC4899' },
    { cx: 54, cy: 66, angle:  70,  body: '#A855F7' },
  ],
  // E — offset centre cross (different spatial positions, same ±45° angle as ref
  //     but centred differently so the # is shifted and asymmetric)
  E: [
    { cx: 48, cy: 60, angle: -45,  body: '#F97316' },
    { cx: 72, cy: 60, angle: -45,  body: '#22C55E' },
    { cx: 60, cy: 48, angle:  45,  body: '#EC4899' },
    { cx: 60, cy: 72, angle:  45,  body: '#A855F7' },
  ],
}

// ---------------------------------------------------------------------------
// Shared SVG group that renders a pencil arrangement
// ---------------------------------------------------------------------------
function PencilGroup({ pencils }: { pencils: PcfG[] }) {
  return (
    <>
      {pencils.map((p, i) => (
        <Pencil
          key={i}
          cx={p.cx}
          cy={p.cy}
          angleDeg={p.angle}
          bodyColor={p.body}
        />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration (the reference arrangement)
// ---------------------------------------------------------------------------
export default function PencilMirrorSASMO19G2Q12Illustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      width="180"
      height="180"
      aria-label="Gambar referensi: kumpulan pensil warna membentuk pola silang #"
      role="img"
    >
      <rect width="120" height="120" fill="#F8F9FA" rx="8" />
      <PencilGroup pencils={PENCILS_REF} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Named export — option renderer for CHOICE_RENDERERS
// ---------------------------------------------------------------------------
export function PencilMirrorSASMO19G2Q12Option({ choice }: { choice: WmiChoice }) {
  const pencils = PENCILS_BY_LABEL[choice.label]
  if (!pencils) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={`Pilihan ${choice.label}: susunan pensil`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg viewBox="0 0 120 120" width="90" height="90">
        <rect width="120" height="120" fill="#F8F9FA" rx="6" />
        <PencilGroup pencils={pencils} />
      </svg>
    </span>
  )
}
