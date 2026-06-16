// Isometric die for WMI-19F3A-Q23 (faces 2 top, 3 left, 6 right — a legal
// corner: no two of them are opposite, since opposite faces pair 1-6, 2-5, 3-4).

const INK = '#1F2937'

export const DIE_VIEW = 220

/** Dot layouts per face value on a unit square [0..1]², mapped by each face. */
const PIPS: Record<number, Array<[number, number]>> = {
  2: [[0.3, 0.3], [0.7, 0.7]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  6: [[0.3, 0.22], [0.3, 0.5], [0.3, 0.78], [0.7, 0.22], [0.7, 0.5], [0.7, 0.78]],
}

export function DieFigure() {
  const cx = DIE_VIEW / 2
  const top = 26
  const s = 74 // half-width of the iso cube
  const h = 42 // vertical half-step of the top face
  const dh = 92 // body height
  // Iso cube corners
  const T: [number, number] = [cx, top] // top back corner
  const L: [number, number] = [cx - s, top + h]
  const R: [number, number] = [cx + s, top + h]
  const F: [number, number] = [cx, top + 2 * h] // top front corner
  const Lb: [number, number] = [cx - s, top + h + dh]
  const Rb: [number, number] = [cx + s, top + h + dh]
  const Fb: [number, number] = [cx, top + 2 * h + dh]
  const pts = (arr: Array<[number, number]>) => arr.map(([x, y]) => `${x},${y}`).join(' ')

  const mapTop = ([u, v]: [number, number]): [number, number] => [
    L[0] + (R[0] - L[0]) * ((u + v) / 2),
    T[1] + 2 * h * (0.5 + (v - u) / 2),
  ]
  const mapLeft = ([u, v]: [number, number]): [number, number] => [L[0] + (F[0] - L[0]) * u, L[1] + (F[1] - L[1]) * u + dh * v]
  const mapRight = ([u, v]: [number, number]): [number, number] => [F[0] + (R[0] - F[0]) * u, F[1] + (R[1] - F[1]) * u + dh * v]
  const rPip = 7

  return (
    <svg viewBox={`0 0 ${DIE_VIEW} ${DIE_VIEW}`} width="100%" style={{ maxWidth: 220, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <polygon points={pts([T, R, F, L])} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={pts([L, F, Fb, Lb])} fill="#F1F5F9" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={pts([F, R, Rb, Fb])} fill="#E2E8F0" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {PIPS[2].map((p, i) => {
        const [x, y] = mapTop(p)
        return <ellipse key={`t${i}`} cx={x} cy={y} rx={rPip + 1} ry={rPip - 2} fill={INK} />
      })}
      {PIPS[3].map((p, i) => {
        const [x, y] = mapLeft(p)
        return <ellipse key={`l${i}`} cx={x} cy={y} rx={rPip - 1} ry={rPip} fill={INK} />
      })}
      {PIPS[6].map((p, i) => {
        const [x, y] = mapRight(p)
        return <ellipse key={`r${i}`} cx={x} cy={y} rx={rPip - 1} ry={rPip} fill={INK} />
      })}
    </svg>
  )
}

export default function DieSumsG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A die seen at an angle, showing three faces at once (2 on top, 3 and 6 on the sides). Opposite faces add to 7."
    >
      <DieFigure />
    </div>
  )
}
