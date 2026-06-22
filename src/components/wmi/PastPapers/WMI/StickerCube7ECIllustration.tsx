// IKMC-20-EC-Q7 — "Which sticker is opposite the duck?"
//
// Stem illustration: one cube shown in TWO positions, each with 3 visible sticker faces.
// Position 1: TOP=mouse, LEFT=ladybug, RIGHT=duck
// Position 2: TOP=elephant, LEFT=duck, RIGHT=dog
// (Fly is never visible alongside duck → fly is opposite duck.)
//
// Co-exports StickerCube7ECOption — renders ONE choice (A–E animal name) as an SVG
// animal glyph for the CHOICE_RENDERERS registry.
//
// Pure SVG. No raster images. SSR-safe. No random. No Date.
//
// Reuses the CubeGroup isometric primitive from CubeShapes14Illustration
// (same projection constants, same face colours) with a single-voxel cube
// so we can overlay face labels.

import type { ReactElement } from 'react'
import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Isometric cube primitive (single voxel, adapted from CubeShapes14)
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const TOP_FILL = '#F5F0E8'   // warm cream — cube body
const LEFT_FILL = '#DDD5C0'  // medium warm
const RIGHT_FILL = '#BFB4A0' // darkest warm

const SIZE = 48          // cube edge in px — large enough to fit animal glyphs
const CX = SIZE * 0.866  // iso horizontal run
const CY = SIZE * 0.5    // iso vertical run

// Single-cube face polygon points (origin at top-centre of cube)
// anchor = { sx, sy } = the "top vertex" of the isometric diamond

function isoCubePolygons(ox: number, oy: number) {
  const sx = ox
  const sy = oy
  const topPts    = `${sx},${sy} ${sx + CX},${sy - CY} ${sx + 2*CX},${sy} ${sx + CX},${sy + CY}`
  const leftPts   = `${sx},${sy} ${sx + CX},${sy + CY} ${sx + CX},${sy + CY + SIZE} ${sx},${sy + SIZE}`
  const rightPts  = `${sx + CX},${sy + CY} ${sx + 2*CX},${sy} ${sx + 2*CX},${sy + SIZE} ${sx + CX},${sy + CY + SIZE}`
  return { topPts, leftPts, rightPts }
}

// Face centres (for placing SVG animal content)
function faceCentres(ox: number, oy: number) {
  const sx = ox
  const sy = oy
  return {
    // top face (rhombus centre)
    top:   { x: sx + CX,        y: sy },
    // left face centre
    left:  { x: sx + CX * 0.5,  y: sy + CY + SIZE * 0.5 },
    // right face centre
    right: { x: sx + CX * 1.5,  y: sy + CY + SIZE * 0.5 },
  }
}

// ---------------------------------------------------------------------------
// Animal SVG glyphs — single-codepoint Unicode characters rendered as SVG text.
// Each animal maps to a readable text label inside a sticker-shaped rounded rect.
// We use simple geometric shapes + text to represent each animal faithfully.
// ---------------------------------------------------------------------------

type AnimalId = 'duck' | 'elephant' | 'mouse' | 'ladybug' | 'dog' | 'fly'

// Animal glyphs are drawn as pure SVG shapes below (emoji are unreliable in SVG across platforms).
// Each function returns SVG elements relative to a local origin (0,0) centred on a ~36×36 box.

// Sticker background shape
function StickerBg({ size = 36, fill = '#FFFDE7', stroke = '#B8860B', rx = 5 }: {
  size?: number; fill?: string; stroke?: string; rx?: number
}) {
  return (
    <rect
      x={-size/2} y={-size/2}
      width={size} height={size}
      rx={rx} ry={rx}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
    />
  )
}

// Duck — rounded body + head + beak
function DuckGlyph({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <g transform={`scale(${s})`}>
      <StickerBg size={34} fill="#FFFDE7" />
      {/* body */}
      <ellipse cx={2} cy={4} rx={10} ry={7} fill="#E8E0C0" stroke={INK} strokeWidth={1} />
      {/* head */}
      <circle cx={-8} cy={-2} r={6} fill="#E8E0C0" stroke={INK} strokeWidth={1} />
      {/* beak */}
      <polygon points="-14,-2 -11,0 -11,-4" fill="#F59E0B" stroke={INK} strokeWidth={0.8} />
      {/* tail */}
      <polygon points="12,2 16,-2 14,6" fill="#D4C8A0" stroke={INK} strokeWidth={0.8} />
      {/* eye */}
      <circle cx={-9} cy={-3} r={1.2} fill={INK} />
    </g>
  )
}

// Elephant — large rounded body + head + trunk + ears
function ElephantGlyph({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <g transform={`scale(${s})`}>
      <StickerBg size={34} fill="#F0F0F0" />
      {/* body */}
      <ellipse cx={3} cy={5} rx={9} ry={7} fill="#C8C8C8" stroke={INK} strokeWidth={1} />
      {/* head */}
      <circle cx={-6} cy={0} r={7} fill="#C8C8C8" stroke={INK} strokeWidth={1} />
      {/* ear */}
      <ellipse cx={-11} cy={0} rx={4} ry={5} fill="#B0B0B0" stroke={INK} strokeWidth={0.8} />
      {/* trunk */}
      <path d="M -9,5 Q -14,10 -10,14" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* eye */}
      <circle cx={-5} cy={-2} r={1.2} fill={INK} />
    </g>
  )
}

// Mouse — round body + big round ears + thin tail
function MouseGlyph({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <g transform={`scale(${s})`}>
      <StickerBg size={34} fill="#F5F5F5" />
      {/* body */}
      <ellipse cx={3} cy={5} rx={8} ry={7} fill="#D0D0D0" stroke={INK} strokeWidth={1} />
      {/* head */}
      <circle cx={-5} cy={0} r={6} fill="#D0D0D0" stroke={INK} strokeWidth={1} />
      {/* left ear */}
      <circle cx={-9} cy={-5} r={3.5} fill="#E0C0C0" stroke={INK} strokeWidth={0.8} />
      {/* right ear */}
      <circle cx={-2} cy={-6} r={3} fill="#E0C0C0" stroke={INK} strokeWidth={0.8} />
      {/* tail */}
      <path d="M 11,8 Q 16,4 14,-2" stroke={INK} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* eye */}
      <circle cx={-5} cy={0} r={1.2} fill={INK} />
      {/* nose */}
      <ellipse cx={-10} cy={2} rx={1.5} ry={1} fill="#E06080" />
    </g>
  )
}

// Ladybug — round red body with black spots + head
function LadybugGlyph({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <g transform={`scale(${s})`}>
      <StickerBg size={34} fill="#FFF0F0" />
      {/* wing body */}
      <ellipse cx={0} cy={4} rx={9} ry={8} fill="#D42020" stroke={INK} strokeWidth={1} />
      {/* centre dividing line */}
      <line x1={0} y1={-4} x2={0} y2={12} stroke={INK} strokeWidth={1} />
      {/* spots */}
      <circle cx={-4} cy={2} r={2} fill={INK} />
      <circle cx={4} cy={2} r={2} fill={INK} />
      <circle cx={-5} cy={7} r={2} fill={INK} />
      <circle cx={5} cy={7} r={2} fill={INK} />
      {/* head */}
      <circle cx={0} cy={-5} r={4} fill={INK} />
      {/* eyes */}
      <circle cx={-2} cy={-6} r={1} fill="white" />
      <circle cx={2} cy={-6} r={1} fill="white" />
    </g>
  )
}

// Dog — body + head + floppy ears + tail
function DogGlyph({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <g transform={`scale(${s})`}>
      <StickerBg size={34} fill="#FFF8F0" />
      {/* body */}
      <ellipse cx={3} cy={5} rx={8} ry={6} fill="#E8D8B0" stroke={INK} strokeWidth={1} />
      {/* head */}
      <circle cx={-5} cy={-1} r={6} fill="#E8D8B0" stroke={INK} strokeWidth={1} />
      {/* floppy ear */}
      <ellipse cx={-9} cy={2} rx={3} ry={5} fill="#C8A870" stroke={INK} strokeWidth={0.8} transform="rotate(-15,-9,2)" />
      {/* tail */}
      <path d="M 11,2 Q 16,-4 13,-8" stroke={INK} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* eye */}
      <circle cx={-4} cy={-2} r={1.2} fill={INK} />
      {/* nose */}
      <ellipse cx={-9} cy={0} rx={2} ry={1.4} fill="#303030" />
    </g>
  )
}

// Fly — oval body + wings + head + legs
function FlyGlyph({ size = 32 }: { size?: number }) {
  const s = size / 32
  return (
    <g transform={`scale(${s})`}>
      <StickerBg size={34} fill="#F0F4F0" />
      {/* body */}
      <ellipse cx={0} cy={5} rx={5} ry={7} fill="#606040" stroke={INK} strokeWidth={1} />
      {/* left wing */}
      <ellipse cx={-8} cy={0} rx={7} ry={4} fill="rgba(200,220,255,0.7)" stroke={INK} strokeWidth={0.8} transform="rotate(-10,-8,0)" />
      {/* right wing */}
      <ellipse cx={8} cy={0} rx={7} ry={4} fill="rgba(200,220,255,0.7)" stroke={INK} strokeWidth={0.8} transform="rotate(10,8,0)" />
      {/* head */}
      <circle cx={0} cy={-4} r={4} fill="#808060" stroke={INK} strokeWidth={1} />
      {/* compound eyes */}
      <circle cx={-2} cy={-5} r={1.5} fill="#A00000" />
      <circle cx={2} cy={-5} r={1.5} fill="#A00000" />
      {/* legs */}
      <line x1={-4} y1={6} x2={-9} y2={8} stroke={INK} strokeWidth={0.8} />
      <line x1={-4} y1={8} x2={-9} y2={11} stroke={INK} strokeWidth={0.8} />
      <line x1={4} y1={6} x2={9} y2={8} stroke={INK} strokeWidth={0.8} />
      <line x1={4} y1={8} x2={9} y2={11} stroke={INK} strokeWidth={0.8} />
    </g>
  )
}

const ANIMAL_COMPONENTS: Record<AnimalId, (props: { size?: number }) => ReactElement> = {
  duck:     DuckGlyph,
  elephant: ElephantGlyph,
  mouse:    MouseGlyph,
  ladybug:  LadybugGlyph,
  dog:      DogGlyph,
  fly:      FlyGlyph,
}

// ---------------------------------------------------------------------------
// AnimalFace — renders an animal glyph on an isometric face
// cx, cy: centre of the face (in SVG coords)
// faceType: which face (to adjust rotation/skew for perspective)
// ---------------------------------------------------------------------------

interface AnimalFaceProps {
  cx: number
  cy: number
  animal: AnimalId
  faceType: 'top' | 'left' | 'right'
  /** Highlight ring colour (for explainer use) */
  highlight?: string
}

function AnimalFace({ cx, cy, animal, faceType }: AnimalFaceProps) {
  const Glyph = ANIMAL_COMPONENTS[animal]
  const glyphSize = 22

  // Each isometric face needs a different skew/rotation transform so the glyph
  // looks like it's painted ON the face rather than floating in front.
  // We use CSS-style SVG transforms:
  //   top face:   skew in iso diamond (rotated 30° + skewX)
  //   left face:  shear left-downward
  //   right face: shear right-downward
  let transform = `translate(${cx},${cy})`

  if (faceType === 'top') {
    // Iso top face: rotate -30°, scale Y to 0.58 (cos30° ≈ 0.866, sin30°=0.5)
    transform += ` rotate(-30) scale(0.85,0.58)`
  } else if (faceType === 'left') {
    // Left face leans back — skewY
    transform += ` skewY(30) scale(0.75,0.75)`
  } else {
    // Right face — mirror skew
    transform += ` skewY(-30) scale(0.75,0.75)`
  }

  return (
    <g transform={transform}>
      <Glyph size={glyphSize} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// IsoCubeWithStickers — renders ONE isometric cube with stickers on 3 visible faces
// ---------------------------------------------------------------------------

interface CubeFaces {
  top: AnimalId
  left: AnimalId
  right: AnimalId
}

interface IsoCubeWithStickersProps {
  /** Left edge of cube's bounding box in SVG space */
  ox: number
  /** Top vertex Y position */
  oy: number
  faces: CubeFaces
  /** Highlight specific faces for the explainer */
  highlighted?: Partial<Record<'top' | 'left' | 'right', boolean>>
}

function IsoCubeWithStickers({ ox, oy, faces, highlighted = {} }: IsoCubeWithStickersProps) {
  const { topPts, leftPts, rightPts } = isoCubePolygons(ox, oy)
  const centres = faceCentres(ox, oy)

  return (
    <g>
      {/* Face fills */}
      <polygon points={topPts}   fill={highlighted.top   ? '#FFF9C4' : TOP_FILL}   stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={leftPts}  fill={highlighted.left  ? '#FFF9C4' : LEFT_FILL}  stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={rightPts} fill={highlighted.right ? '#FFF9C4' : RIGHT_FILL} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />

      {/* Animal stickers on faces */}
      <AnimalFace cx={centres.top.x}   cy={centres.top.y}   animal={faces.top}   faceType="top"   />
      <AnimalFace cx={centres.left.x}  cy={centres.left.y}  animal={faces.left}  faceType="left"  />
      <AnimalFace cx={centres.right.x} cy={centres.right.y} animal={faces.right} faceType="right" />

      {/* Redraw edges on top so they're crisp */}
      <polygon points={topPts}   fill="none" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={leftPts}  fill="none" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={rightPts} fill="none" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Layout constants for the two-cube stem figure
// ---------------------------------------------------------------------------

// Each cube needs space: width ≈ 2*CX, height ≈ CY + SIZE
const CUBE_W = 2 * CX          // ~83px
const CUBE_H = CY + SIZE       // ~72px
const GAP = 20
const PAD = 16

// Position the two cubes
// Cube 1: ox=PAD, oy=PAD (top vertex)
// Cube 2: ox = PAD + CUBE_W + GAP
const C1_OX = PAD
const C1_OY = PAD
const C2_OX = PAD + CUBE_W + GAP
const C2_OY = PAD

const SVG_W = Math.ceil(PAD * 2 + CUBE_W * 2 + GAP)
const SVG_H = Math.ceil(PAD + CUBE_H + PAD * 0.5 + 20) // +20 for label below

// ---------------------------------------------------------------------------
// Cube orientation analysis (from OCR image 025):
//
// Position 1 (left cube):
//   TOP  = mouse
//   LEFT = ladybug
//   RIGHT = duck     ← the duck is on the right face
//
// Position 2 (right cube):
//   TOP  = elephant
//   LEFT = duck      ← the duck is on the left face
//   RIGHT = dog
//
// This configuration correctly shows duck with 4 others: mouse, ladybug, elephant, dog.
// Fly is never shown.
// ---------------------------------------------------------------------------

const POS1_FACES: CubeFaces = { top: 'mouse',    left: 'ladybug', right: 'duck'     }
const POS2_FACES: CubeFaces = { top: 'elephant', left: 'duck',    right: 'dog'      }

// ---------------------------------------------------------------------------
// Stem illustration — two cube positions
// ---------------------------------------------------------------------------

/**
 * StickerCube7ECIllustration — the stem figure for IKMC-20-EC-Q7.
 * Shows a cube in TWO positions, each with 3 visible sticker faces.
 * Does NOT show the fly (it is on the hidden opposite face of the duck).
 */
export default function StickerCube7ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Two views of a sticker cube. ' +
        'Position 1: mouse on top, ladybug on the left face, duck on the right face. ' +
        'Position 2: elephant on top, duck on the left face, dog on the right face.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W * 1.5}
        height={SVG_H * 1.5}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {/* Position 1 */}
        <IsoCubeWithStickers ox={C1_OX} oy={C1_OY} faces={POS1_FACES} />
        {/* Position label */}
        <text
          x={C1_OX + CUBE_W / 2}
          y={C1_OY + CUBE_H + 16}
          textAnchor="middle"
          fontSize={12}
          fontFamily="sans-serif"
          fontWeight="600"
          fill="#4B5563"
        >
          1
        </text>

        {/* Position 2 */}
        <IsoCubeWithStickers ox={C2_OX} oy={C2_OY} faces={POS2_FACES} />
        {/* Position label */}
        <text
          x={C2_OX + CUBE_W / 2}
          y={C2_OY + CUBE_H + 16}
          textAnchor="middle"
          fontSize={12}
          fontFamily="sans-serif"
          fontWeight="600"
          fill="#4B5563"
        >
          2
        </text>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE choice (A–E) as an animal glyph
// ---------------------------------------------------------------------------

// Mapping from choice text (en/id) to animal id
const TEXT_TO_ANIMAL: Record<string, AnimalId> = {
  // English
  elephant: 'elephant',
  mouse:    'mouse',
  ladybug:  'ladybug',
  dog:      'dog',
  fly:      'fly',
  // Indonesian
  gajah:    'elephant',
  tikus:    'mouse',
  kumbang:  'ladybug',
  anjing:   'dog',
  lalat:    'fly',
}

const CHOICE_ARIA_EN: Record<string, string> = {
  elephant: 'Option A: elephant sticker',
  mouse:    'Option B: mouse sticker',
  ladybug:  'Option C: ladybug sticker',
  dog:      'Option D: dog sticker',
  fly:      'Option E: fly sticker',
}

const OPT_SIZE = 60

/**
 * StickerCube7ECOption — renders one A–E choice as a single animal sticker SVG.
 * Registered in CHOICE_RENDERERS for IKMC-20-EC-Q7.
 */
export function StickerCube7ECOption({ choice }: { choice: WmiChoice }) {
  const animal = TEXT_TO_ANIMAL[choice.text.toLowerCase()]
  if (!animal) return <span>{choice.text}</span>

  const Glyph = ANIMAL_COMPONENTS[animal]
  const aria = CHOICE_ARIA_EN[animal] ?? `Option ${choice.label}: ${choice.text}`

  return (
    <span
      role="img"
      aria-label={aria}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <svg
        viewBox={`${-OPT_SIZE/2} ${-OPT_SIZE/2} ${OPT_SIZE} ${OPT_SIZE}`}
        width={OPT_SIZE}
        height={OPT_SIZE}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <Glyph size={42} />
      </svg>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Named re-exports for the Explainer to import the cube primitive
// ---------------------------------------------------------------------------
export { IsoCubeWithStickers, POS1_FACES, POS2_FACES, SVG_W, SVG_H, C1_OX, C1_OY, C2_OX, C2_OY, CUBE_H }
export type { CubeFaces, AnimalId }
