/**
 * IsoCubes — generic, SSR-safe SVG primitive for isometric unit-cube arrangements.
 *
 * Pure SVG. No framer-motion, no hooks, no Math.random, no window/document.
 *
 * ## Coordinate system
 * `cubes` are `{ x, y, z }` voxels where:
 *   - `x` grows to the right (iso right-axis)
 *   - `y` grows into the screen (iso depth-axis; higher y = further back, rendered first)
 *   - `z` grows upward
 *
 * Screen projection:
 *   sx = (x + y) × CX     where CX = size × cos(30°) ≈ size × 0.866
 *   sy = (x − y) × CY − z × size     where CY = size × sin(30°) = size × 0.5
 *
 * Each voxel origin (sx, sy) lands at the **left tip** of the top-face diamond.
 *
 * ## Painter's order
 * Cubes are sorted back-to-front: highest y first, then lowest z, then lowest x.
 * This ensures correct overdraw without a depth buffer.
 *
 * ## Props
 * | Prop        | Type               | Default       | Description                                          |
 * |-------------|--------------------|---------------|------------------------------------------------------|
 * | cubes       | IsoCube[]          | required      | List of voxels to render                             |
 * | size        | number             | 24            | Cube edge length in px                               |
 * | cellGap     | number             | 0             | Inset each face polygon by this many px (decorative) |
 * | palette     | IsoPalette         | blue preset   | Top / left / right face colours + ink                |
 * | viewPadding | number             | 8             | Extra SVG padding around the bounding box            |
 *
 * @example Three-cube L-shape in default blue palette
 * ```tsx
 * import { IsoCubes } from '@/components/wmi/PastPapers/WMI/primitives/IsoCubes'
 *
 * <IsoCubes cubes={[
 *   { x: 0, y: 0, z: 0 },
 *   { x: 1, y: 0, z: 0 },
 *   { x: 1, y: 0, z: 1 },
 * ]} />
 * ```
 *
 * @example Grey palette with a highlighted cube
 * ```tsx
 * const GREY: IsoPalette = { top: '#C0C0C0', left: '#909090', right: '#6E6E6E', ink: '#1F2937' }
 *
 * <IsoCubes
 *   size={28}
 *   palette={GREY}
 *   cubes={[
 *     { x: 0, y: 0, z: 0 },
 *     { x: 1, y: 0, z: 0, color: '#FFD23F' },  // per-cube colour override
 *   ]}
 * />
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single voxel in the isometric grid. */
export interface IsoCube {
  /** Column (right-axis). */
  x: number
  /** Depth (into screen; higher = further back). */
  y: number
  /** Height (upward). */
  z: number
  /**
   * Optional base colour override for this cube's **top** face. The left and
   * right faces are auto-shaded by {@link defaultShade} relative to this colour.
   * When omitted, {@link IsoPalette.top / left / right} are used as-is.
   */
  color?: string
  /** Optional text label centred on the top face (e.g. a digit or letter). */
  faceLabel?: string
}

/** Three-face colour palette for the cube shading. */
export interface IsoPalette {
  /** Top face colour (lightest). */
  top: string
  /** Left-slope face colour (medium). */
  left: string
  /** Right-slope face colour (darkest). */
  right: string
  /** Stroke / outline colour. @default '#1F2937' */
  ink?: string
  /** Stroke width in px. @default 1.3 */
  strokeWidth?: number
}

export interface IsoCubesProps {
  /** Voxels to render. Order within the array is irrelevant — painter sort is applied. */
  cubes: IsoCube[]
  /** Cube edge length in px. @default 24 */
  size?: number
  /**
   * Inset each face polygon inward by this many px. Zero gives flush edges;
   * a small positive value (e.g. 1) adds a subtle visible gap between cubes.
   * @default 0
   */
  cellGap?: number
  /**
   * Three-face colour palette. Defaults to the standard qupu blue.
   * Pass a custom palette for grey, gold, or any other scheme.
   */
  palette?: IsoPalette
  /** Padding in px around the tight bounding box. @default 8 */
  viewPadding?: number
  /** aria-label on the root <svg>. Falls back to aria-hidden when omitted. */
  label?: string
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/** Default blue palette — matches all three reference illustrations. */
export const ISO_BLUE_PALETTE: IsoPalette = {
  top:         '#D6EBF7',
  left:        '#8FC6E8',
  right:       '#5BA8D4',
  ink:         '#1F2937',
  strokeWidth: 1.3,
}

/** Warm gold palette — used by explainer animations for lit/highlighted cubes. */
export const ISO_GOLD_PALETTE: IsoPalette = {
  top:         '#FFD23F',
  left:        '#F4B400',
  right:       '#D97706',
  ink:         '#1F2937',
  strokeWidth: 1.3,
}

/** Grey palette — used for mixed grey/white cube problems. */
export const ISO_GREY_PALETTE: IsoPalette = {
  top:         '#C0C0C0',
  left:        '#909090',
  right:       '#6E6E6E',
  ink:         '#1F2937',
  strokeWidth: 1.3,
}

// ---------------------------------------------------------------------------
// Projection helpers (exported for callers that need raw coordinates)
// ---------------------------------------------------------------------------

/**
 * Project a voxel to SVG screen coordinates.
 *
 * The returned `(sx, sy)` is the **left tip** of the cube's top-face diamond.
 * All face polygons are expressed as offsets from this origin.
 *
 * @param x - right-axis voxel coordinate
 * @param y - depth-axis voxel coordinate (higher = further back)
 * @param z - height-axis voxel coordinate
 * @param size - cube edge length in px
 */
export function isoProject(
  x: number,
  y: number,
  z: number,
  size: number,
): { sx: number; sy: number } {
  const cx = size * 0.866  // cos(30°) — horizontal run per iso unit
  const cy = size * 0.5    // sin(30°) — vertical run per iso unit
  return {
    sx: (x + y) * cx,
    sy: (x - y) * cy - z * size,
  }
}

/**
 * Derive shaded left/right face colours from a base top-face colour.
 *
 * This is a simple luminance reduction: left face is 70% brightness, right
 * face is 55% brightness relative to the hex top colour. Useful when callers
 * supply an arbitrary `cube.color` and want automatic 3D shading.
 *
 * @returns `{ top, left, right }` hex strings
 */
export function defaultShade(topHex: string): { top: string; left: string; right: string } {
  // Parse #RRGGBB or #RGB
  let hex = topHex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const shade = (factor: number) => {
    const tr = Math.round(r * factor).toString(16).padStart(2, '0')
    const tg = Math.round(g * factor).toString(16).padStart(2, '0')
    const tb = Math.round(b * factor).toString(16).padStart(2, '0')
    return `#${tr}${tg}${tb}`
  }
  return { top: topHex, left: shade(0.70), right: shade(0.55) }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Painter's sort: back (high y) first, then low z, then low x. */
function painterSort(cubes: IsoCube[]): IsoCube[] {
  return [...cubes].sort(
    (a, b) => b.y - a.y || a.z - b.z || a.x - b.x,
  )
}

interface FacePolygons {
  topPts:   string
  leftPts:  string
  rightPts: string
}

/**
 * Compute SVG `points` strings for the three visible faces of a unit cube.
 *
 * All coordinates are in the SVG plane. The `inset` parameter shrinks each
 * polygon by a tiny amount toward its own centroid (for visual gaps).
 */
function cubeFacePolygons(
  sx: number,
  sy: number,
  cx: number,  // horizontal iso unit
  cy: number,  // vertical iso unit
  size: number,
  inset: number,
): FacePolygons {
  if (inset === 0) {
    // Fast path — no inset
    return {
      topPts:   `${sx},${sy} ${sx+cx},${sy-cy} ${sx+2*cx},${sy} ${sx+cx},${sy+cy}`,
      leftPts:  `${sx},${sy} ${sx+cx},${sy+cy} ${sx+cx},${sy+cy+size} ${sx},${sy+size}`,
      rightPts: `${sx+cx},${sy+cy} ${sx+2*cx},${sy} ${sx+2*cx},${sy+size} ${sx+cx},${sy+cy+size}`,
    }
  }
  // Inset path — nudge each polygon vertex toward its centroid
  const i = inset
  return {
    topPts: [
      [sx + i,       sy + i * 0.5],
      [sx + cx,      sy - cy + i],
      [sx + 2*cx - i, sy + i * 0.5],
      [sx + cx,      sy + cy - i],
    ].map(([x, y]) => `${x},${y}`).join(' '),
    leftPts: [
      [sx + i,       sy + i * 0.5],
      [sx + cx - i,  sy + cy],
      [sx + cx - i,  sy + cy + size - i],
      [sx + i,       sy + size - i],
    ].map(([x, y]) => `${x},${y}`).join(' '),
    rightPts: [
      [sx + cx + i,      sy + cy],
      [sx + 2*cx - i,    sy + i * 0.5],
      [sx + 2*cx - i,    sy + size - i],
      [sx + cx + i,      sy + cy + size - i],
    ].map(([x, y]) => `${x},${y}`).join(' '),
  }
}

/** Tight bounding box of all cube face vertices in screen space. */
function computeBounds(
  cubes: IsoCube[],
  size: number,
): { minX: number; minY: number; maxX: number; maxY: number } {
  const cx = size * 0.866
  const cy = size * 0.5
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const { x, y, z } of cubes) {
    const { sx, sy } = isoProject(x, y, z, size)
    // The four extreme points of the cube's combined silhouette:
    //   left tip    (sx,      sy)
    //   top tip     (sx+cx,   sy-cy)
    //   right tip   (sx+2*cx, sy)
    //   bottom tip  (sx+cx,   sy+cy+size)
    const xs = [sx, sx + cx, sx + 2 * cx]
    const ys = [sy - cy, sy, sy + cy + size]
    for (const px of xs) { if (px < minX) minX = px; if (px > maxX) maxX = px }
    for (const py of ys) { if (py < minY) minY = py; if (py > maxY) maxY = py }
  }
  return { minX, minY, maxX, maxY }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * IsoCubes — renders an arbitrary list of unit cubes in isometric projection.
 *
 * Features:
 * - Auto-fits `viewBox` to the cube set (no manual sizing needed).
 * - Painter's-order sort for correct visual layering.
 * - Per-cube `color` override with automatic face shading via {@link defaultShade}.
 * - Optional per-cube `faceLabel` text on the top face.
 * - SSR-safe: pure SVG, no hooks, no framer-motion, no browser APIs.
 *
 * @example
 * ```tsx
 * // Three cubes stacked as an L — uses default blue palette, size 24
 * <IsoCubes cubes={[
 *   { x: 0, y: 0, z: 0 },
 *   { x: 1, y: 0, z: 0 },
 *   { x: 1, y: 0, z: 1 },
 * ]} />
 * ```
 */
export function IsoCubes({
  cubes,
  size        = 24,
  cellGap     = 0,
  palette     = ISO_BLUE_PALETTE,
  viewPadding = 8,
  label,
}: IsoCubesProps) {
  if (cubes.length === 0) return null

  const cx = size * 0.866
  const cy = size * 0.5
  const ink = palette.ink ?? '#1F2937'
  const sw  = palette.strokeWidth ?? 1.3

  const { minX, minY, maxX, maxY } = computeBounds(cubes, size)
  const pad = viewPadding
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  const sorted = painterSort(cubes)

  // Label font size: ~28% of cube edge, capped to avoid overflow
  const fontSize = Math.max(6, Math.round(size * 0.28))

  const ariaProps = label
    ? { 'aria-label': label }
    : { 'aria-hidden': true as const }

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={Math.round(vbW)}
      height={Math.round(vbH)}
      style={{ display: 'block', overflow: 'visible' }}
      {...ariaProps}
    >
      {sorted.map((cube, i) => {
        const { x, y, z, color, faceLabel } = cube
        const { sx, sy } = isoProject(x, y, z, size)
        const { topPts, leftPts, rightPts } = cubeFacePolygons(sx, sy, cx, cy, size, cellGap)

        // Resolve face colours: per-cube override → palette default
        let topColor:   string
        let leftColor:  string
        let rightColor: string

        if (color) {
          const shaded = defaultShade(color)
          topColor   = shaded.top
          leftColor  = shaded.left
          rightColor = shaded.right
        } else {
          topColor   = palette.top
          leftColor  = palette.left
          rightColor = palette.right
        }

        // Top-face centroid for label placement
        // centroid of the diamond: (sx+cx, sy) — midpoint of top/bottom tips
        const labelX = sx + cx
        const labelY = sy  // top-face vertical centre is at the voxel origin y

        return (
          <g key={`${x},${y},${z}-${i}`}>
            <polygon
              points={topPts}
              fill={topColor}
              stroke={ink}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            <polygon
              points={leftPts}
              fill={leftColor}
              stroke={ink}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            <polygon
              points={rightPts}
              fill={rightColor}
              stroke={ink}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            {faceLabel && (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill={ink}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {faceLabel}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default IsoCubes
