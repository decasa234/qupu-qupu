export interface AnswerKey {
  reasoning: Record<number, string>
  applications: Record<number, string>
}

function cells(row: string): string[] {
  return [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => m[1].trim())
}

function parseSection(section: string): Record<number, string> {
  const out: Record<number, string> = {}
  // Each section is a series of two-row tables: row 0 = question numbers, row 1 = answers.
  for (const [, inner] of section.matchAll(/<table>([\s\S]*?)<\/table>/g)) {
    const rows = [...inner.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1])
    if (rows.length < 2) continue
    const nums = cells(rows[0])
    const ans = cells(rows[1])
    for (let i = 0; i < nums.length; i++) {
      const n = Number(nums[i])
      if (Number.isInteger(n) && n > 0 && ans[i] !== undefined && ans[i] !== '') out[n] = ans[i]
    }
  }
  return out
}

// Answer keys have a "Logical Reasoning" section (A–D) and an "Applications"
// section (numeric), each a set of two-row HTML tables (numbers, then answers).
export function parseAnswerKey(md: string): AnswerKey {
  const appIdx = md.search(/Applications/i)
  const reasoningPart = appIdx >= 0 ? md.slice(0, appIdx) : md
  const applicationsPart = appIdx >= 0 ? md.slice(appIdx) : ''
  return {
    reasoning: parseSection(reasoningPart),
    applications: parseSection(applicationsPart),
  }
}
