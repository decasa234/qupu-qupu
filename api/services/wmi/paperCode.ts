export type PaperCodeInput = {
  year: number
  round: 'semifinal' | 'final'
  grade: number
  variant: 'A' | 'B'
}

// Short human-readable code: WMI-[YY][F|P][grade][A|B]. The trailing letter is
// the paper section (A/B). Mirrors the frontend util in
// src/lib/wmiPaperCode.ts — keep the two formats in sync.
export function paperCode({ year, round, grade, variant }: PaperCodeInput): string {
  const yy = String(year).slice(-2)
  const r = round === 'final' ? 'F' : 'P'
  return `WMI-${yy}${r}${grade}${variant}`
}

// Stable per-question code, e.g. WMI-19F1A-Q1.
export function questionCode(paper: PaperCodeInput, number: number): string {
  return `${paperCode(paper)}-Q${number}`
}
