import type { ReactNode } from 'react'

interface TallyParams {
  n: number
}

export default function TallyMarksCountIllustration({ params }: { params: unknown }) {
  const p = params as TallyParams
  const n = p.n ?? 0
  const groups = Math.floor(n / 5)
  const rem = n % 5
  const top = 8
  const bottom = 48
  const gap = 9 // between verticals in a group
  const pitch = 4 * gap + 26 // group block + spacing
  const padX = 10
  const blocks = groups + (rem > 0 ? 1 : 0)
  const width = padX * 2 + blocks * pitch
  const els: ReactNode[] = []
  const drawGroup = (gx: number, count: number, full: boolean, key: number) => {
    for (let i = 0; i < count; i++) {
      const x = gx + i * gap
      els.push(<line key={`${key}-v${i}`} x1={x} y1={top} x2={x} y2={bottom} stroke="currentColor" strokeWidth={2.5} className="text-qupu-brand-blue" />)
    }
    if (full) {
      els.push(<line key={`${key}-d`} x1={gx - 4} y1={bottom} x2={gx + 3 * gap + 4} y2={top} stroke="currentColor" strokeWidth={2.5} className="text-qupu-brand-orange" />)
    }
  }
  for (let g = 0; g < groups; g++) drawGroup(padX + g * pitch, 4, true, g)
  if (rem > 0) drawGroup(padX + groups * pitch, rem, false, 999)

  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} 56`} width={Math.min(340, width)} role="img" aria-label="Turus / tally marks">
        {els}
      </svg>
    </div>
  )
}
