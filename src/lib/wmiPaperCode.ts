type PaperCodeInput = {
  year: number
  round: 'semifinal' | 'final'
  grade: number
  variant: 'A' | 'B'
}

// Short human-readable drill code: WMI-[YY][F|P][grade][A|B].
// F = final, P = prelim (stored as 'semifinal'); trailing letter is the paper
// section (A/B). e.g. 2019 Grade 1 Final section A → "WMI-19F1A".
// Stable because year/round/grade/variant are immutable for a paper.
export function paperCode({ year, round, grade, variant }: PaperCodeInput): string {
  const yy = String(year).slice(-2)
  const r = round === 'final' ? 'F' : 'P'
  return `WMI-${yy}${r}${grade}${variant}`
}
