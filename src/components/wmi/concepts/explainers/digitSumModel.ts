export interface DigitDot {
  x: number
  y: number
}

export interface DigitSumModel {
  n: number
  tens: number
  ones: number
  sum: number
}

export function digitSumModel(n: number): DigitSumModel {
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return { n, tens, ones, sum: tens + ones }
}

// Lay out k dots left-to-right in rows of `perRow`, starting at (ox, oy).
export function dotGridPositions(
  k: number,
  ox: number,
  oy: number,
  perRow = 5,
  gap = 22,
): DigitDot[] {
  const dots: DigitDot[] = []
  for (let i = 0; i < k; i++) {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    dots.push({ x: ox + col * gap, y: oy + row * gap })
  }
  return dots
}
