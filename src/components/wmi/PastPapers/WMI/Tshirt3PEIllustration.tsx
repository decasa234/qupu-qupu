// IKMC-21-PE-Q3 — "Ella puts on this t-shirt and stands in front of a mirror.
// Which of these images does she see in the mirror? (The t-shirt has the number
// 2021 printed on it.)"  Answer: A.
//
// READING THE SCAN (2021.imgs/007.jpg):
//   A pink t-shirt with the number "2021" printed in dark ink across the chest,
//   standard orientation (left-to-right as seen by the wearer looking down, or as
//   seen by someone facing the wearer).
//
// REFLECTION LOGIC:
//   A horizontal mirror (standing in front) reverses left ↔ right.
//   Effect on "2021":
//     1. The digit order reverses:  2 0 2 1  →  1 2 0 2
//     2. Each digit is also horizontally flipped:
//          '1' flips → mirrored 1 (visually near-symmetric but left-flag removed)
//          '2' flips → backwards 2 (like ᘕ / S-shape reversed)
//          '0' flips → 0 (symmetric, unchanged)
//          '2' flips → backwards 2
//     Correct answer is: mirrored-1, mirrored-2, 0, mirrored-2  (option A).
//
// STEM RULE: show only the ORIGINAL t-shirt (before the mirror). Do NOT show
// the reflected image — that is the question.
//
// Co-exports:
//   TshirtBody       — bare SVG <g> (shirt silhouette only, no SVG root)
//   TshirtPrimitive  — full SVG element (shirt + optional label) for direct use
//   TSHIRT_GEOM      — shared layout constants for the explainer
//
// Pure render, SSR-safe, deterministic — no Math.random / Date / side-effects.

// ── palette ──────────────────────────────────────────────────────────────────
const SHIRT_BODY   = '#F9A8D4'   // pink as in the scan (rose-200)
const SHIRT_SHADOW = '#F472B6'   // slightly deeper for collar/sleeve shading
const SHIRT_STROKE = '#9D174D'   // dark rose outline
const INK          = '#1F2937'   // dark ink for the printed number

// ── layout constants ─────────────────────────────────────────────────────────
const VW  = 180
const VH  = 200
const PAD = 10

// Shirt geometry in the viewBox
const COLLAR_CX   = VW / 2
const COLLAR_TOP  = PAD + 20
const COLLAR_RX   = 24
const COLLAR_RY   = 14
const BODY_LEFT   = PAD + 14
const BODY_RIGHT  = VW - PAD - 14
const BODY_TOP    = COLLAR_TOP + 10
const BODY_BOTTOM = VH - PAD - 8
const SLEEVE_L_X2 = PAD
const SLEEVE_R_X2 = VW - PAD
const SLEEVE_Y    = BODY_TOP + 28

/** Shared geometry so the explainer can align overlays. */
export const TSHIRT_GEOM = {
  VW, VH,
  COLLAR_CX, COLLAR_TOP, COLLAR_RX, COLLAR_RY,
  BODY_LEFT, BODY_RIGHT, BODY_TOP, BODY_BOTTOM,
  SLEEVE_L_X2, SLEEVE_R_X2, SLEEVE_Y,
  /** Vertical centre of the chest area (good for placing text). */
  CHEST_CY: BODY_TOP + (BODY_BOTTOM - BODY_TOP) * 0.42,
} as const

// ── shirt body path (constant, shared) ───────────────────────────────────────

const BODY_PATH = [
  `M ${BODY_LEFT} ${BODY_TOP}`,
  `L ${SLEEVE_L_X2} ${SLEEVE_Y}`,
  `L ${SLEEVE_L_X2 + 28} ${SLEEVE_Y + 24}`,
  `L ${BODY_LEFT + 14} ${BODY_TOP + 38}`,
  `L ${BODY_LEFT} ${BODY_BOTTOM}`,
  `L ${BODY_RIGHT} ${BODY_BOTTOM}`,
  `L ${BODY_RIGHT - 14} ${BODY_TOP + 38}`,
  `L ${SLEEVE_R_X2 - 28} ${SLEEVE_Y + 24}`,
  `L ${SLEEVE_R_X2} ${SLEEVE_Y}`,
  `L ${BODY_RIGHT} ${BODY_TOP}`,
  `Q ${COLLAR_CX} ${COLLAR_TOP - COLLAR_RY * 1.5} ${BODY_LEFT} ${BODY_TOP}`,
  'Z',
].join(' ')

/**
 * Bare SVG group — shirt silhouette only, no `<svg>` root.
 * Embed this inside your own `<svg>` viewBox when you need to overlay content.
 */
export function TshirtBody({ highlight = false }: { highlight?: boolean } = {}) {
  return (
    <g>
      {/* shirt body */}
      <path
        d={BODY_PATH}
        fill={SHIRT_BODY}
        stroke={SHIRT_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* collar shadow (semi-ellipse) */}
      <ellipse
        cx={COLLAR_CX}
        cy={COLLAR_TOP}
        rx={COLLAR_RX}
        ry={COLLAR_RY}
        fill={SHIRT_SHADOW}
        stroke={SHIRT_STROKE}
        strokeWidth={1.5}
      />
      {/* left sleeve seam highlight */}
      {highlight && (
        <line
          x1={BODY_LEFT + 2}
          y1={BODY_TOP}
          x2={SLEEVE_L_X2 + 2}
          y2={SLEEVE_Y}
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeOpacity={0.55}
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

interface TshirtPrimitiveProps {
  /** Text to render on the chest. */
  label?: string
  /** If true, renders a subtle seam highlight on the left sleeve. */
  highlight?: boolean
}

/**
 * Shared t-shirt primitive — full `<svg>` root with shirt body + optional label.
 * Use this wherever you need a standalone shirt SVG (illustration, option, etc.).
 */
export function TshirtPrimitive({ label, highlight = false }: TshirtPrimitiveProps = {}) {
  const chestCY = TSHIRT_GEOM.CHEST_CY

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={VW}
      aria-hidden="true"
    >
      <TshirtBody highlight={highlight} />

      {/* printed number / label on the chest */}
      {label != null && label !== '' && (
        <text
          x={COLLAR_CX}
          y={chestCY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={28}
          fontWeight="bold"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fill={INK}
        >
          {label}
        </text>
      )}
    </svg>
  )
}

// ── ARIA strings ──────────────────────────────────────────────────────────────
const ARIA_EN =
  'A pink t-shirt with the number 2021 printed across the chest. ' +
  'Ella puts this shirt on and stands in front of a mirror — which image does she see?'

const ARIA_ID =
  'Sebuah kaos berwarna merah muda dengan angka 2021 tercetak di bagian dada. ' +
  'Ella memakai kaos ini dan berdiri di depan cermin — gambar mana yang dia lihat?'

/** Static stem illustration — the original t-shirt before the mirror. */
export default function Tshirt3PEIllustration({ lang = 'en' }: { lang?: string } = {}) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <TshirtPrimitive label="2021" />
    </div>
  )
}
