import type { WmiChoice } from '../../../types/wmi'

// WMI-19F3A-Q2 — each option is a picture: which one shades exactly 1/3?
//   A: circle in 8 sectors, 4 shaded (1/2)
//   B: parallelogram strip of 6 equal triangles, 2 shaded (1/3) ✓
//   C: 3×2 grid of squares, 3 shaded (1/2)
//   D: triangle in 4 small triangles, 1 shaded (1/4)
// Shared by the choice renderer and the explainer so they can never drift.

const INK = '#1F2937'
const SHADE = '#94A3B8'

export interface FractionInfo {
  label: 'A' | 'B' | 'C' | 'D'
  shaded: number
  total: number
}
export const FRACTIONS: ReadonlyArray<FractionInfo> = [
  { label: 'A', shaded: 4, total: 8 },
  { label: 'B', shaded: 2, total: 6 },
  { label: 'C', shaded: 3, total: 6 },
  { label: 'D', shaded: 1, total: 4 },
]

/** One option figure, drawn inside a 100×64 box. */
export function FractionFigure({ label }: { label: 'A' | 'B' | 'C' | 'D' }) {
  if (label === 'A') {
    // circle, 8 sectors, alternate 4 shaded
    const cx = 50
    const cy = 32
    const r = 28
    const sector = (i: number) => {
      const a0 = (i * Math.PI) / 4
      const a1 = ((i + 1) * Math.PI) / 4
      const x0 = cx + r * Math.cos(a0)
      const y0 = cy + r * Math.sin(a0)
      const x1 = cx + r * Math.cos(a1)
      const y1 = cy + r * Math.sin(a1)
      return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`
    }
    return (
      <g>
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={sector(i)} fill={i % 2 === 0 ? SHADE : '#FFFFFF'} stroke={INK} strokeWidth={1.5} />
        ))}
      </g>
    )
  }
  if (label === 'B') {
    // parallelogram strip of 6 equal triangles; the 1st and 3rd are shaded
    // (two non-adjacent upward triangles, matching the scan).
    const bot: Array<[number, number]> = [[12, 54], [34, 54], [56, 54], [78, 54]]
    const top: Array<[number, number]> = [[34, 10], [56, 10], [78, 10], [100, 10]]
    const tris: Array<{ pts: string; shaded: boolean }> = []
    for (let i = 0; i < 3; i++) {
      tris.push({ pts: `${bot[i]} ${top[i]} ${bot[i + 1]}`, shaded: i === 0 || i === 1 ? tris.length === 0 || tris.length === 2 : false })
      tris.push({ pts: `${top[i]} ${bot[i + 1]} ${top[i + 1]}`, shaded: false })
    }
    return (
      <g transform="translate(-6,0)">
        {tris.map((tr, i) => (
          <polygon key={i} points={tr.pts} fill={tr.shaded ? SHADE : '#FFFFFF'} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        ))}
      </g>
    )
  }
  if (label === 'C') {
    // 3×2 grid, checkerboard: 3 shaded (top corners + bottom middle), as in the scan
    return (
      <g>
        {Array.from({ length: 6 }).map((_, i) => {
          const col = i % 3
          const row = Math.floor(i / 3)
          const shaded = (row + col) % 2 === 0
          return (
            <rect key={i} x={14 + col * 24} y={10 + row * 22} width={24} height={22} fill={shaded ? SHADE : '#FFFFFF'} stroke={INK} strokeWidth={1.5} />
          )
        })}
      </g>
    )
  }
  // D: big triangle split into 4 small ones; the bottom-left one is shaded (as in the scan)
  const A: [number, number] = [50, 8]
  const B: [number, number] = [16, 56]
  const C: [number, number] = [84, 56]
  const mAB: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]
  const mAC: [number, number] = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2]
  const mBC: [number, number] = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2]
  const tri = (p: Array<[number, number]>) => p.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <g>
      <polygon points={tri([A, mAB, mAC])} fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
      <polygon points={tri([mAB, B, mBC])} fill={SHADE} stroke={INK} strokeWidth={1.5} />
      <polygon points={tri([mAC, mBC, C])} fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
      <polygon points={tri([mAB, mBC, mAC])} fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

/** Choice renderer: draws the option's picture instead of its description text. */
export default function FractionThirdG3Option({ choice }: { choice: WmiChoice }) {
  const label = choice.label as 'A' | 'B' | 'C' | 'D'
  if (!FRACTIONS.some((f) => f.label === label)) return <span>{choice.text}</span>
  return (
    <svg viewBox="0 0 100 64" width="100" height="64" role="img" aria-label={choice.text} style={{ display: 'block' }}>
      <FractionFigure label={label} />
    </svg>
  )
}
