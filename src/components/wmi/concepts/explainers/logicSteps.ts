export interface BasicStep {
  caption: string
  phase: string
  hold: number
  result?: boolean
}

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

function finalStep(caption: string): BasicStep {
  return { phase: 'result', caption, hold: 0, result: true }
}

export function buildPositionLineSteps(p: { name: string; fromFront: number; fromBack: number }, lang: 'en' | 'id' = 'en') {
  const name = p.name || 'Maya'
  const fromFront = Math.max(2, Math.round(p.fromFront || 2))
  const fromBack = Math.max(2, Math.round(p.fromBack || 2))
  const frontCount = fromFront - 1
  const backCount = fromBack - 1
  const total = frontCount + 1 + backCount
  const steps: BasicStep[] = [
    { phase: 'front', caption: lang === 'id' ? `${frontCount} anak di depan ${name}.` : `${frontCount} children are in front of ${name}.`, hold: 1000 },
    { phase: 'self', caption: lang === 'id' ? `${name} dihitung satu kali di tengah.` : `${name} counts once in the middle.`, hold: 900 },
    { phase: 'back', caption: lang === 'id' ? `${backCount} anak di belakang ${name}.` : `${backCount} children are behind ${name}.`, hold: 1000 },
    finalStep(lang === 'id' ? `${frontCount} + 1 + ${backCount} = ${total} anak.` : `${frontCount} + 1 + ${backCount} = ${total} children.`),
  ]
  return { name, fromFront, fromBack, frontCount, backCount, total, steps, finalIndex: steps.length - 1 }
}

export function buildAssignmentCycleSteps(p: { cycle: number; n: number }, lang: 'en' | 'id' = 'en') {
  const cycle = Math.max(3, Math.min(5, Math.round(p.cycle || 3)))
  const n = Math.max(1, Math.round(p.n || 1))
  const labels = LABELS.slice(0, cycle)
  const shifted = n - 1
  const remainder = shifted % cycle
  const answer = labels[remainder]
  const steps: BasicStep[] = [
    { phase: 'pattern', caption: lang === 'id' ? `Pola berulang: ${labels.join(', ')}.` : `Repeating pattern: ${labels.join(', ')}.`, hold: 1000 },
    { phase: 'shift', caption: lang === 'id' ? `Geser nomor: ${n} - 1 = ${shifted}.` : `Shift the number: ${n} - 1 = ${shifted}.`, hold: 1000 },
    { phase: 'remainder', caption: lang === 'id' ? `${shifted} dibagi ${cycle} sisa ${remainder}.` : `${shifted} divided by ${cycle} leaves remainder ${remainder}.`, hold: 1200 },
    finalStep(lang === 'id' ? `Sisa ${remainder} menunjuk huruf ${answer}.` : `Remainder ${remainder} points to ${answer}.`),
  ]
  return { cycle, n, labels, shifted, remainder, answer, steps, finalIndex: steps.length - 1 }
}

function evalSigns(nums: number[], signs: ('+' | '-')[]): number {
  let total = nums[0] ?? 0
  for (let i = 0; i < signs.length; i++) total = signs[i] === '+' ? total + (nums[i + 1] ?? 0) : total - (nums[i + 1] ?? 0)
  return total
}

export function buildOperatorFillSteps(p: { nums: number[]; target: number; options: ('+' | '-')[][] }, lang: 'en' | 'id' = 'en') {
  const nums = p.nums?.length === 4 ? p.nums : [10, 3, 2, 1]
  const target = Math.round(p.target || 0)
  const rows = (p.options ?? []).slice(0, 4).map((signs, i) => ({ label: LABELS[i], signs, result: evalSigns(nums, signs), matches: evalSigns(nums, signs) === target }))
  const correctLabel = rows.find((row) => row.matches)?.label ?? 'A'
  const steps: BasicStep[] = [
    { phase: 'target', caption: lang === 'id' ? `Target hasilnya ${target}.` : `The target result is ${target}.`, hold: 900 },
    ...rows.map((row): BasicStep => ({ phase: String(row.label), caption: `${row.label}: ${nums.join(' ')} -> ${row.result}${row.matches ? ' ✓' : ''}`, hold: 900 })),
    finalStep(lang === 'id' ? `Pilihan ${correctLabel} cocok.` : `Option ${correctLabel} works.`),
  ]
  return { nums, target, rows, correctLabel, steps, finalIndex: steps.length - 1 }
}

function digitSum(n: number): number {
  return Math.floor(n / 10) + (n % 10)
}

export function buildWhichMightBeSteps(p: { lo: number; hi: number; k: number; options: number[] }, lang: 'en' | 'id' = 'en') {
  const rows = (p.options ?? []).slice(0, 4).map((value, i) => ({
    label: LABELS[i],
    value,
    odd: value % 2 === 1,
    range: value > p.lo && value < p.hi,
    digit: digitSum(value) === p.k,
  }))
  const correctLabel = rows.find((row) => row.odd && row.range && row.digit)?.label ?? 'A'
  const steps: BasicStep[] = [
    { phase: 'clues', caption: lang === 'id' ? `Cek ganjil, rentang, dan jumlah digit ${p.k}.` : `Check odd, range, and digit sum ${p.k}.`, hold: 1000 },
    ...rows.map((row): BasicStep => ({ phase: String(row.label), caption: `${row.label}: ${row.value} ${row.odd && row.range && row.digit ? '✓' : '✗'}`, hold: 800 })),
    finalStep(lang === 'id' ? `Hanya ${correctLabel} memenuhi semua petunjuk.` : `Only ${correctLabel} fits all clues.`),
  ]
  return { rows, correctLabel, steps, finalIndex: steps.length - 1 }
}

export function buildRangeCountSteps(p: { lo: number; hi: number; exprs: { op: '+' | '-'; x: number; y: number }[] }, lang: 'en' | 'id' = 'en') {
  const rows = (p.exprs ?? []).map((expr, i) => {
    const value = expr.op === '+' ? expr.x + expr.y : expr.x - expr.y
    return { index: i + 1, expr, value, inRange: value >= p.lo && value <= p.hi }
  })
  const count = rows.filter((row) => row.inRange).length
  const steps: BasicStep[] = [
    { phase: 'range', caption: lang === 'id' ? `Rentang: ${p.lo} sampai ${p.hi}.` : `Range: ${p.lo} to ${p.hi}.`, hold: 900 },
    ...rows.map((row): BasicStep => ({ phase: String(row.index), caption: `${row.index}: ${row.value} ${row.inRange ? '✓' : '✗'}`, hold: 750 })),
    finalStep(lang === 'id' ? `${count} hasil masuk rentang.` : `${count} results are in range.`),
  ]
  return { rows, count, steps, finalIndex: steps.length - 1 }
}

export function buildSumPartitionSteps(p: { small: number; k: number }, lang: 'en' | 'id' = 'en') {
  const answer = Math.max(1, Math.round(p.small || 1))
  const k = Math.max(2, Math.round(p.k || 2))
  const parts = k + 1
  const total = parts * answer
  const steps: BasicStep[] = [
    { phase: 'rina', caption: lang === 'id' ? 'Rina = 1 bagian.' : 'Rina = 1 part.', hold: 900 },
    { phase: 'doni', caption: lang === 'id' ? `Doni = ${k} bagian.` : `Doni = ${k} parts.`, hold: 1000 },
    { phase: 'parts', caption: lang === 'id' ? `Total bagian: 1 + ${k} = ${parts}.` : `Total parts: 1 + ${k} = ${parts}.`, hold: 1000 },
    finalStep(lang === 'id' ? `${total} / ${parts} = ${answer}.` : `${total} / ${parts} = ${answer}.`),
  ]
  return { answer, k, parts, total, steps, finalIndex: steps.length - 1 }
}

export function buildVennSteps(p: { aOnly: number[]; both: number[]; bOnly: number[] }, lang: 'en' | 'id' = 'en') {
  const aOnly = Array.isArray(p?.aOnly) ? p.aOnly : []
  const both = Array.isArray(p?.both) ? p.both : []
  const answer = aOnly.reduce((sum, n) => sum + n, 0)
  const add = aOnly.join(' + ')
  const steps: BasicStep[] = [
    { phase: 'all', caption: lang === 'id' ? 'Lihat semua bagian diagram.' : 'Look at all regions of the diagram.', hold: 900 },
    { phase: 'aOnly', caption: lang === 'id' ? `Ambil bagian A saja: ${aOnly.join(', ')}.` : `Keep A-only: ${aOnly.join(', ')}.`, hold: 1100 },
    { phase: 'exclude', caption: lang === 'id' ? `Irisan ${both.join(', ')} tidak dihitung.` : `Overlap ${both.join(', ')} is not counted.`, hold: 1000 },
    finalStep(lang === 'id' ? `${add} = ${answer}.` : `${add} = ${answer}.`),
  ]
  return { answer, add, steps, finalIndex: steps.length - 1 }
}

export function buildCountShapesSteps(p: { segments: number }, lang: 'en' | 'id' = 'en') {
  const segments = Math.max(2, Math.min(6, Math.round(p.segments || 2)))
  const groups = Array.from({ length: segments }, (_, i) => ({ width: i + 1, count: segments - i }))
  const total = groups.reduce((sum, group) => sum + group.count, 0)
  const sumText = groups.map((group) => group.count).join(' + ')
  const steps: BasicStep[] = [
    { phase: 'figure', caption: lang === 'id' ? `Kipas punya ${segments} bagian alas.` : `The fan has ${segments} base sections.`, hold: 900 },
    ...groups.map((group): BasicStep => ({ phase: String(group.width), caption: lang === 'id' ? `Lebar ${group.width} bagian: ${group.count}.` : `Width ${group.width} section(s): ${group.count}.`, hold: 900 })),
    finalStep(lang === 'id' ? `${sumText} = ${total} segitiga.` : `${sumText} = ${total} triangles.`),
  ]
  return { segments, groups, total, steps, finalIndex: steps.length - 1 }
}
