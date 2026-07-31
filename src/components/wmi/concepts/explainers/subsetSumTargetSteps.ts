import type { Lang } from './makeTenSteps'

// `subset-sum-target`. One idea sits under all three ask forms: a total is only
// reached when the parts add up EXACTLY, and how MANY pieces a group has says
// nothing about how much it weighs. A child's instinct is "that looks about
// right" or "same number of cards each side", so this storyboard never asserts
// the answer. It walks the wrong options one at a time, shows each total and how
// far it lands from the target, and only then lets the last one settle — the
// answer arrives as the last group standing, not as a fresh claim.
export type SubsetAsk = 'which-subset' | 'which-cut-line' | 'balance-the-seesaw'
export type SubsetPhase = 'setup' | 'rule' | 'trap' | 'try' | 'result'

const ASKS: readonly SubsetAsk[] = ['which-subset', 'which-cut-line', 'balance-the-seesaw']
const OPTION_LABELS = ['A', 'B', 'C', 'D']

/** Mirrors the generator's params (api/services/wmi/concepts/subset-sum-target). */
export interface SubsetParams {
  ask: SubsetAsk
  values: number[]
  target: number
  size: number
  options: number[][]
  answerIndex: number
  actor: string
}

export interface SubsetBeat {
  phase: SubsetPhase
  caption: string
  /** Card / block indices lit on this beat. */
  active: number[]
  /** Cut-line ask: how many cards sit left of the line. Null = no line drawn. */
  cutAt: number | null
  /** Cut-line ask: the two side totals as currently cut. */
  leftSum: number | null
  rightSum: number | null
  /** Choice asks: which option is on the bench, and what it totals. */
  optionLabel: string | null
  optionSum: number | null
  /** optionSum − target (or leftSum − rightSum). Null before anything is weighed. */
  delta: number | null
  tone: 'neutral' | 'wrong' | 'right'
  trap: boolean
  /** Short chip naming the tempting stop, already in `lang`. */
  trapLabel: string | null
  result: boolean
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface SubsetStoryboard {
  ask: SubsetAsk
  values: number[]
  target: number
  size: number
  actor: string
  /** Cut-line ask: whole-row total and each half. */
  total: number
  half: number
  cut: number
  answer: string
  steps: SubsetBeat[]
  finalIndex: number
}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

const sumAt = (values: number[], idx: number[]): number => idx.reduce((t, i) => t + (values[i] ?? 0), 0)

/** "17 (tepat)" / "18 (lebih 1)" — how far a total lands from the target. */
export function deltaText(delta: number, lang: Lang): string {
  if (delta === 0) return lang === 'id' ? 'tepat' : 'exact'
  if (delta > 0) return lang === 'id' ? `lebih ${delta}` : `${delta} over`
  return lang === 'id' ? `kurang ${-delta}` : `${-delta} short`
}

export function buildSubsetSumTargetSteps(raw: unknown, lang: Lang): SubsetStoryboard {
  const p = (raw ?? {}) as Partial<SubsetParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ask: SubsetAsk = ASKS.includes(p.ask as SubsetAsk) ? (p.ask as SubsetAsk) : 'which-subset'
  const actor = str(p.actor, 'Nadia')
  const rawValues = Array.isArray(p.values) ? p.values : []
  const values = rawValues
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
    .map((v) => Math.round(v))
  const safeValues = values.length >= 2 ? values : [4, 6, 12, 13]
  const total = safeValues.reduce((a, b) => a + b, 0)
  const target = clampInt(p.target, 1, 999, ask === 'which-cut-line' ? Math.floor(total / 2) : 0)
  const size = clampInt(p.size, 1, Math.max(1, safeValues.length - 1), 2)

  const steps: SubsetBeat[] = []
  type Draft = Partial<SubsetBeat> & { phase: SubsetPhase; caption: string }
  const push = (draft: Draft) => {
    steps.push({
      active: [],
      cutAt: null,
      leftSum: null,
      rightSum: null,
      optionLabel: null,
      optionSum: null,
      delta: null,
      tone: 'neutral',
      trap: false,
      trapLabel: null,
      result: false,
      reveal: null,
      hold: 2200,
      ...draft,
    })
  }

  if (ask === 'which-cut-line') {
    const cut = Math.max(1, Math.min(safeValues.length - 1, size))
    const half = target
    const n = safeValues.length
    const prefix: number[] = [0]
    for (const v of safeValues) prefix.push(prefix[prefix.length - 1] + v)
    const answer = String(safeValues[cut - 1])
    const mid = Math.floor(n / 2)

    push({
      phase: 'setup',
      caption: T(
        `${n} cards in a row: ${safeValues.join(' + ')} = ${total} altogether.`,
        `${n} kartu berjajar: ${safeValues.join(' + ')} = ${total} semuanya.`,
      ),
      hold: 2400,
    })
    push({
      phase: 'rule',
      caption: T(
        `The two parts must have the SAME total, and together they make ${total}. So each part has to be ${total} ÷ 2 = ${half}.`,
        `Dua bagiannya harus SAMA jumlahnya, dan digabung jadi ${total}. Berarti tiap bagian harus ${total} ÷ 2 = ${half}.`,
      ),
      hold: 2800,
    })

    // The trap beat: the cut a child reaches for first — same number of cards
    // each side. Shown as a picture, never as a warning.
    if (mid >= 1 && mid <= n - 1 && mid !== cut) {
      const l = prefix[mid]
      const r = total - l
      push({
        phase: 'trap',
        cutAt: mid,
        leftSum: l,
        rightSum: r,
        active: Array.from({ length: mid }, (_, i) => i),
        tone: 'wrong',
        trap: true,
        trapLabel: T(`${l} vs ${r}`, `${l} vs ${r}`),
        delta: l - r,
        caption: T(
          `Cutting down the middle gives ${mid} cards each side — but the totals are ${l} and ${r}. Same number of cards is not the same total.`,
          `Memotong di tengah memberi ${mid} kartu tiap sisi — tapi jumlahnya ${l} dan ${r}. Banyak kartu yang sama bukan berarti jumlahnya sama.`,
        ),
        hold: 3200,
      })
    }

    // Now slide the line from the far left, one gap at a time, and read the
    // left total out loud. It only ever grows, so it meets `half` exactly once.
    for (let c = 1; c <= cut; c++) {
      const l = prefix[c]
      const r = total - l
      const isLast = c === cut
      push({
        phase: isLast ? 'result' : 'try',
        cutAt: c,
        leftSum: l,
        rightSum: r,
        active: Array.from({ length: c }, (_, i) => i),
        tone: isLast ? 'right' : 'wrong',
        delta: l - half,
        caption: isLast
          ? T(
              `Now the left side is ${l} and the right side is ${r} — equal at last. The line stops right after ${answer}, so the card just before the cut shows ${answer}.`,
              `Sekarang kiri ${l} dan kanan ${r} — akhirnya sama. Garisnya berhenti tepat setelah ${answer}, jadi kartu sebelum garis bertuliskan ${answer}.`,
            )
          : T(
              `Line after ${c} card${c === 1 ? '' : 's'}: left ${l}, right ${r}. Left is still ${half - l} short of ${half}, so slide the line one card further.`,
              `Garis setelah ${c} kartu: kiri ${l}, kanan ${r}. Kiri masih kurang ${half - l} dari ${half}, jadi geser garisnya satu kartu lagi.`,
            ),
        result: isLast,
        reveal: isLast ? answer : null,
        hold: isLast ? 0 : 2000,
      })
    }

    return {
      ask,
      values: safeValues,
      target,
      size: cut,
      actor,
      total,
      half,
      cut,
      answer,
      steps,
      finalIndex: steps.length - 1,
    }
  }

  // ── the two choice asks ────────────────────────────────────────────────────
  const rawOptions = Array.isArray(p.options) ? p.options : []
  const options = rawOptions
    .filter((o): o is number[] => Array.isArray(o))
    .map((o) => o.filter((i) => typeof i === 'number' && i >= 0 && i < safeValues.length))
  const answerIndex = clampInt(p.answerIndex, 0, Math.max(0, options.length - 1), 0)
  const scale = ask === 'balance-the-seesaw'
  const unit = scale ? ' kg' : ''
  const answer = OPTION_LABELS[answerIndex] ?? 'A'

  push({
    phase: 'setup',
    caption: scale
      ? T(
          `The left pan holds ${target} kg and never changes. ${actor} may put ${size} of these blocks on the right pan.`,
          `Piring kiri berisi ${target} kg dan tidak berubah. ${actor} boleh menaruh ${size} balok ini di piring kanan.`,
        )
      : T(
          `The cards on the table are ${safeValues.join(', ')}. ${actor} must take ${size} of them.`,
          `Kartu di meja ada ${safeValues.join(', ')}. ${actor} harus mengambil ${size} kartu.`,
        ),
    hold: 2600,
  })
  push({
    phase: 'rule',
    caption: scale
      ? T(
          `The beam only goes flat at ${target} kg exactly. ${target - 1} kg or ${target + 1} kg still tips it, so "nearly" is no good.`,
          `Lengannya hanya datar kalau tepat ${target} kg. ${target - 1} kg atau ${target + 1} kg tetap miring, jadi "hampir" tidak dihitung.`,
        )
      : T(
          `The total has to be ${target} exactly — not ${target - 1}, not ${target + 1}. So weigh up every option instead of guessing.`,
          `Jumlahnya harus tepat ${target} — bukan ${target - 1}, bukan ${target + 1}. Jadi hitung tiap pilihan, jangan menebak.`,
        ),
    hold: 2800,
  })

  // Every wrong option first, in the order the child sees them, each with its
  // own arithmetic on screen. The right one is what is left when they run out.
  const order = options.map((_, i) => i).filter((i) => i !== answerIndex)
  order.push(answerIndex)

  order.forEach((i, position) => {
    const idx = options[i] ?? []
    const vals = idx.map((j) => safeValues[j]).sort((a, b) => a - b)
    const sum = sumAt(safeValues, idx)
    const delta = sum - target
    const label = OPTION_LABELS[i] ?? '?'
    const isLast = position === order.length - 1
    const sums = `${vals.join(' + ')} = ${sum}${unit}`

    push({
      phase: isLast ? 'result' : 'try',
      active: idx,
      optionLabel: label,
      optionSum: sum,
      delta,
      tone: delta === 0 ? 'right' : 'wrong',
      trap: false,
      caption: isLast
        ? scale
          ? T(
              `Option ${label}: ${sums}, and ${target} kg is exactly what the left pan holds — the beam goes flat. Every other option tipped it, so the answer is ${label}.`,
              `Pilihan ${label}: ${sums}, dan ${target} kg persis sama dengan piring kiri — lengannya datar. Pilihan lain tadi semuanya miring, jadi jawabannya ${label}.`,
            )
          : T(
              `Option ${label}: ${sums} — exactly the target. Every other option missed, so the answer is ${label}.`,
              `Pilihan ${label}: ${sums} — pas dengan targetnya. Pilihan lain tadi meleset semua, jadi jawabannya ${label}.`,
            )
        : scale
          ? T(
              `Option ${label}: ${sums}, which is ${deltaText(delta, 'en')} of ${target} kg — the beam tips ${delta > 0 ? 'right' : 'left'}. Cross it off.`,
              `Pilihan ${label}: ${sums}, ${deltaText(delta, 'id')} dari ${target} kg — lengannya miring ke ${delta > 0 ? 'kanan' : 'kiri'}. Coret.`,
            )
          : T(
              `Option ${label}: ${sums}, which is ${deltaText(delta, 'en')} of ${target}. Close, but close is still wrong. Cross it off.`,
              `Pilihan ${label}: ${sums}, ${deltaText(delta, 'id')} dari ${target}. Dekat, tapi dekat tetap salah. Coret.`,
            ),
      result: isLast,
      reveal: isLast ? label : null,
      hold: isLast ? 0 : 2600,
    })
  })

  return {
    ask,
    values: safeValues,
    target,
    size,
    actor,
    total,
    half: target,
    cut: 0,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
