// WMI-19F1A-Q8: "Which figure shows a white circle in the middle of a gray
// square?" The four options are shape-in-shape figures; B is a white circle in
// a gray square drawn as a diamond (a square rotated 45° is still a square).
const GRAY = '#9CA3AF'
const OUTLINE = '#6B7280'
export const Q8_GREEN = '#10B981'

export type Q8Option = 'A' | 'B' | 'C' | 'D'

// Each option drawn in a 0..100 box, outer gray shape + inner white shape.
export function DrawA() {
  // gray triangle, white circle inside
  return (
    <>
      <polygon points="50,14 88,84 12,84" fill={GRAY} stroke={OUTLINE} strokeWidth={2} />
      <circle cx={50} cy={62} r={14} fill="white" stroke={OUTLINE} strokeWidth={1.5} />
    </>
  )
}
export function DrawB() {
  // gray square (rotated 45° = diamond), white circle inside
  return (
    <>
      <polygon points="50,8 92,50 50,92 8,50" fill={GRAY} stroke={OUTLINE} strokeWidth={2} />
      <circle cx={50} cy={50} r={17} fill="white" stroke={OUTLINE} strokeWidth={1.5} />
    </>
  )
}
export function DrawC() {
  // gray circle, white triangle inside
  return (
    <>
      <circle cx={50} cy={50} r={40} fill={GRAY} stroke={OUTLINE} strokeWidth={2} />
      <polygon points="50,34 66,64 34,64" fill="white" stroke={OUTLINE} strokeWidth={1.5} />
    </>
  )
}
export function DrawD() {
  // gray circle, white square inside
  return (
    <>
      <circle cx={50} cy={50} r={40} fill={GRAY} stroke={OUTLINE} strokeWidth={2} />
      <rect x={37} y={37} width={26} height={26} fill="white" stroke={OUTLINE} strokeWidth={1.5} />
    </>
  )
}

const OPTIONS: { k: Q8Option; Draw: () => JSX.Element }[] = [
  { k: 'A', Draw: DrawA },
  { k: 'B', Draw: DrawB },
  { k: 'C', Draw: DrawC },
  { k: 'D', Draw: DrawD },
]

/** The four answer figures in a row; `highlight` rings one option (used by the
 * post-answer animation to point at B). */
export function ShapeOptions({ highlight }: { highlight?: Q8Option }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
      {OPTIONS.map(({ k, Draw }) => {
        const on = highlight === k
        return (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                borderRadius: 10,
                padding: 4,
                boxShadow: on ? `0 0 0 3px ${Q8_GREEN}` : 'none',
                background: on ? 'rgba(16,185,129,0.08)' : 'transparent',
              }}
            >
              <svg viewBox="0 0 100 100" width={78} height={78} aria-hidden="true">
                <Draw />
              </svg>
            </div>
            <span style={{ fontWeight: 800, color: on ? Q8_GREEN : '#475569' }}>{`(${k})`}</span>
          </div>
        )
      })}
    </div>
  )
}

// No standalone illustration is registered for Q8 — the four options ARE the
// figures (rendered as the answer choices via WhiteCircleSquareOption). The
// post-answer explainer reuses ShapeOptions to recap and ring B.
