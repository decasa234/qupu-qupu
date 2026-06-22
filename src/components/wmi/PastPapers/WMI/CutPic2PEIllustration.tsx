/**
 * IKMC-22-PE-Q2 — "Arek cuts this picture in half and puts the two pieces
 * together. Which option shows the two pieces of Arek's picture?" (answer E).
 *
 * Stem figure (006.jpg): a cartoon mushroom with a wide brown cap and a
 * short grey barrel stem, with a vertical dashed cut-line down the centre
 * and a scissors glyph at the bottom.
 *
 * Five options (A–E) each show two side-by-side sub-panels with the
 * left and right halves of a mushroom cut. Only option E shows the genuine
 * left half + right half that rejoin into the original mushroom.
 *
 * Co-exports:
 *   default            — CutPic2PEIllustration (stem figure)
 *   CutPic2PEOption    — renders ONE A–E choice as two sub-panels
 *
 * Pool reuse: mushroom geometry drawn from scratch; two-panel option layout
 * follows CutPiece5ECIllustration / TwoPieces5ECIllustration patterns.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ────────────────────────────────────────────────────────────
const CAP_FILL    = '#C27B56'   // warm brown mushroom cap
const CAP_STROKE  = '#8B5538'
const STEM_FILL   = '#E8E0D4'   // light cream/grey stem
const STEM_STROKE = '#9E9080'
const DASH_CLR    = '#374151'
const FRAME_CLR   = '#374151'
const OPT_BG      = '#F9FAFB'

// ── mushroom geometry (full figure, 200×200 coordinate space) ────────────────
//
// Cap: semi-ellipse, centre (100, 95), radii (72, 58).
//   Path: M 28,95  A 72,58 0 0 1 172,95  Z
// Stem: rounded rect x=68..132, y=92..165, corner-r=14.
//
// Vertical cut at x=100 → LEFT half (x<100) and RIGHT half (x>100).

/** Semi-ellipse cap of the mushroom, drawn in a 200-wide coordinate space. */
function MushroomCap({ fill = CAP_FILL, stroke = CAP_STROKE, sw = 2 }: {
  fill?: string; stroke?: string; sw?: number
}) {
  const d = 'M 28,95 A 72,58 0 0 1 172,95 Z'
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
}

/** Barrel stem of the mushroom, drawn in a 200-wide coordinate space. */
function MushroomStem({ fill = STEM_FILL, stroke = STEM_STROKE, sw = 2 }: {
  fill?: string; stroke?: string; sw?: number
}) {
  return (
    <rect
      x={68} y={92} width={64} height={73}
      rx={14} ry={14}
      fill={fill} stroke={stroke} strokeWidth={sw}
    />
  )
}

// ── STEM ILLUSTRATION (default export) ───────────────────────────────────────

const STEM_VW = 220, STEM_VH = 200

export default function CutPic2PEIllustration() {
  const midX = STEM_VW / 2  // = 110

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A cartoon mushroom with a wide brown cap on top and a short grey barrel stem below. ' +
        'A vertical dashed line runs down the centre, and a scissors icon sits at the bottom ' +
        'indicating where Arek will cut the picture in half.'
      }
    >
      <svg
        viewBox={`0 0 ${STEM_VW} ${STEM_VH}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: STEM_VW * 1.6 }}
        aria-hidden="true"
      >
        {/* outer frame */}
        <rect
          x={4} y={4} width={STEM_VW - 8} height={STEM_VH - 22}
          rx={6} ry={6}
          fill="#FFFFFF" stroke={FRAME_CLR} strokeWidth={2}
        />

        {/* mushroom centred in the frame (translate so cap centre is at midX) */}
        {/* mushroom is 200-wide; its natural centre is x=100; offset = midX - 100 = 10 */}
        <g transform={`translate(${midX - 100}, 6)`}>
          <MushroomCap />
          <MushroomStem />
        </g>

        {/* vertical dashed cut line */}
        <line
          x1={midX} y1={6}
          x2={midX} y2={STEM_VH - 26}
          stroke={DASH_CLR} strokeWidth={1.5}
          strokeDasharray="5,4"
          strokeLinecap="round"
        />

        {/* scissors glyph */}
        <text
          x={midX} y={STEM_VH - 5}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={18}
          fill={DASH_CLR}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          ✂
        </text>
      </svg>
    </div>
  )
}

// ── OPTION RENDERER HELPERS ───────────────────────────────────────────────────
//
// Each option is rendered as two 100×100 sub-panels inside a 220×110 outer box.
// The mushroom (natural size 200×200) is scaled by 0.5 to fit in 100×100 panels.
// We clip each panel so only the relevant half (left or right) is visible.
//
// Wrong options are achieved by using the same clipping approach but applying
// horizontal flips (mirror) or using the same half twice:
//
//   E (correct): left panel = left half, right panel = right half
//   A:           left panel = right half (mirrored), right panel = right half
//   B:           left panel = right half (mirrored), right panel = left half (mirrored)
//   C:           left panel = left half (mirrored), right panel = right half (mirrored)
//   D:           left panel = left half, right panel = left half (both same = wrong)

// Clip IDs must be unique within the SVG document to avoid cross-contamination.
// We use option label + panel position as unique keys.

const SC = 0.5  // mushroom scale: 200-wide → 100-wide

/**
 * Draw one sub-panel of a mushroom cut option, inlined directly into a
 * parent SVG coordinate space at position (px, py) with size (pw, ph).
 *
 * half: 'left' | 'right' — which half of the mushroom to show
 * flipH: true → mirror the half horizontally (shows wrong piece)
 * uid: unique string for the clipPath id
 */
function MushHalf({
  half, flipH, px, py, pw, ph, uid,
}: {
  half: 'left' | 'right'
  flipH: boolean
  px: number; py: number; pw: number; ph: number
  uid: string
}) {
  const clipId = `cp-${uid}`

  // The full mushroom occupies x=28..172 (cap) and x=68..132 (stem) in 200px space.
  // At SC=0.5 scale: cap occupies x=14..86 in 100px scaled space.
  // Left half: visible x in [0, 50] of scaled mushroom → x in [0..50] of panel.
  // Right half: visible x in [50, 100] of scaled mushroom → x in [50..100] of panel.
  //
  // After applying optional horizontal flip, we position the scaled mushroom
  // so that the correct half is centred in the panel.

  let gTransform: string

  if (!flipH) {
    // No flip: scale by SC, then translate so mushroom origin is at panel origin.
    // left half starts at scaled-x=0; panel x=px → translate px,py then scale.
    // But the mushroom natural origin is (0,0), and the cap starts at x=28.
    // To centre the cut half in the panel: left half = [0..100], right half = [100..200].
    // We offset so the half aligns to the panel left edge.
    const mushroomOffsetX = half === 'left' ? 0 : -100  // shift right half to start at 0
    // In parent coords: translate(px, py) then scale(SC,SC) then translate(mushroomOffsetX,0)
    gTransform = `translate(${px + mushroomOffsetX * SC}, ${py}) scale(${SC}, ${SC})`
  } else {
    // Flip: mirror the half horizontally so left↔right appearance is swapped.
    // Flipping around x=50 in scaled space (the cut line) → scale(-1,1) translate(-100,0)
    const mushroomOffsetX = half === 'left' ? -100 : 0
    // scale(-SC, SC) then translate(mushroomOffsetX, 0)
    // Result: translate(px + pw + mushroomOffsetX * SC, py) scale(-SC, SC)
    gTransform = `translate(${px + pw + mushroomOffsetX * SC}, ${py}) scale(${-SC}, ${SC})`
  }

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={px} y={py} width={pw} height={ph} />
        </clipPath>
      </defs>
      {/* white panel background */}
      <rect x={px} y={py} width={pw} height={ph} fill="#FFFFFF" />
      <g clipPath={`url(#${clipId})`}>
        <g transform={gTransform}>
          <MushroomCap />
          <MushroomStem />
        </g>
      </g>
      {/* panel border */}
      <rect x={px} y={py} width={pw} height={ph}
        fill="none" stroke={FRAME_CLR} strokeWidth={1} />
    </g>
  )
}

// ── option configurations ─────────────────────────────────────────────────────

type Half = 'left' | 'right'
interface PanelSpec { half: Half; flipH: boolean }
interface OptSpec { L: PanelSpec; R: PanelSpec }

//  Source image analysis (007–009.jpg):
//   E: left sub = left half, right sub = right half → CORRECT
//   A: both subs show right half (right appears twice, no left piece)
//   B: left sub = right-half mirrored, right sub = right half (both lean right)
//   C: left sub = left-half mirrored, right sub = right-half mirrored (both wrong orientation)
//   D: left sub = left half, right sub = left half (left appears twice, no right piece)

const OPT_SPEC: Record<string, OptSpec> = {
  A: { L: { half: 'right', flipH: true }, R: { half: 'right', flipH: false } },
  B: { L: { half: 'right', flipH: true }, R: { half: 'left',  flipH: false } },
  C: { L: { half: 'left',  flipH: true }, R: { half: 'right', flipH: true  } },
  D: { L: { half: 'left',  flipH: false }, R: { half: 'left',  flipH: false } },
  E: { L: { half: 'left',  flipH: false }, R: { half: 'right', flipH: false } },
}

const OPT_ARIA: Record<string, string> = {
  A: 'Option A: two right halves of the mushroom — the left piece is missing, incorrect.',
  B: 'Option B: two mismatched mushroom halves that do not rejoin correctly — incorrect.',
  C: 'Option C: two mirrored mushroom pieces that do not form the original — incorrect.',
  D: 'Option D: two left halves of the mushroom — the right piece is missing, incorrect.',
  E: 'Option E: left half and right half of the mushroom that rejoin into the original — correct answer.',
}

// ── OPTION co-export ──────────────────────────────────────────────────────────

const OPT_W = 220, OPT_H = 110
const PNL_W = 100, PNL_H = 100, PNL_Y = 5
const PNL_LX = 8, PNL_RX = 112

/**
 * CutPic2PEOption — renders one A–E choice as two side-by-side panels
 * showing the cut mushroom pieces. Bound to choice.label — cannot drift.
 * Used as a CHOICE_RENDERERS entry for IKMC-22-PE-Q2.
 */
export function CutPic2PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const spec = OPT_SPEC[label]
  if (!spec) return <span>{choice.text}</span>

  const aria = OPT_ARIA[label] ?? choice.text

  return (
    <span
      role="img"
      aria-label={aria}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <svg
        viewBox={`0 0 ${OPT_W} ${OPT_H}`}
        width={OPT_W}
        height={OPT_H}
        style={{ display: 'block', background: OPT_BG, borderRadius: 4 }}
        aria-hidden="true"
      >
        {/* outer bounding box */}
        <rect
          x={1} y={1} width={OPT_W - 2} height={OPT_H - 2}
          rx={4} fill={OPT_BG} stroke={FRAME_CLR} strokeWidth={1.5}
        />

        {/* left sub-panel */}
        <MushHalf
          half={spec.L.half} flipH={spec.L.flipH}
          px={PNL_LX} py={PNL_Y} pw={PNL_W} ph={PNL_H}
          uid={`${label}-L`}
        />

        {/* right sub-panel */}
        <MushHalf
          half={spec.R.half} flipH={spec.R.flipH}
          px={PNL_RX} py={PNL_Y} pw={PNL_W} ph={PNL_H}
          uid={`${label}-R`}
        />
      </svg>
    </span>
  )
}
