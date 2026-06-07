type PaperCodeInput = {
  year: number
  round: 'semifinal' | 'final'
  grade: number
}

// Short human-readable drill code: WMI-[YY][F|P][grade].
// F = final, P = prelim (stored as 'semifinal'). e.g. 2019 Grade 1 Final → "WMI-19F1".
// Stable because year/round/grade are immutable for a paper.
export function paperCode({ year, round, grade }: PaperCodeInput): string {
  const yy = String(year).slice(-2)
  const r = round === 'final' ? 'F' : 'P'
  return `WMI-${yy}${r}${grade}`
}
