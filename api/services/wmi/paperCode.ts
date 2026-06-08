export type PaperCodeInput = {
  year: number
  round: 'semifinal' | 'final'
  grade: number
}

// Short human-readable code: WMI-[YY][F|P][grade]. Mirrors the frontend util in
// src/lib/wmiPaperCode.ts — keep the two formats in sync.
export function paperCode({ year, round, grade }: PaperCodeInput): string {
  const yy = String(year).slice(-2)
  const r = round === 'final' ? 'F' : 'P'
  return `WMI-${yy}${r}${grade}`
}

// Stable per-question code, e.g. WMI-19F1-Q1.
export function questionCode(paper: PaperCodeInput, number: number): string {
  return `${paperCode(paper)}-Q${number}`
}
