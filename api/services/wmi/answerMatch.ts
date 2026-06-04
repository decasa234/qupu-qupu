// Answer matching for WMI attempts (concept practice + past-paper drill/exam).
//
// Kids type free-text for fill-in questions, so a correct number is often
// entered with a unit, currency symbol, or stray spaces ("20 cm", "$14",
// "14 dollars", "20cm"). Exact string compare rejects those. We tolerate them
// — but ONLY when the expected answer is a plain integer and the typed answer
// contains exactly that one number, so we never turn a wrong answer right.

function normalize(s: string): string {
  return (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isCorrectAnswer(expected: string, selected: string): boolean {
  const e = normalize(expected)
  const s = normalize(selected)
  if (e === s) return true

  // Tolerant numeric match: expected is a bare integer (e.g. "20", "-3").
  if (/^-?\d+$/.test(e)) {
    const nums = s.match(/-?\d+/g)
    if (nums && nums.length === 1 && String(parseInt(nums[0], 10)) === e) {
      return true
    }
  }
  return false
}
