export type Lang = 'en' | 'id'

export interface ContainerParams {
  /** How many eggs have to be packed. */
  total: number
  /** How many eggs one box holds. */
  capacity: number
}

export type ContainerBeatId = 'intro' | 'fill' | 'skip' | 'trap' | 'leftover' | 'total'

export interface ContainerBeat {
  id: ContainerBeatId
  caption: string
  /** Secondary line — the division written out on the trap beat, the choice
   * letter on the landing beat. */
  note: string | null
  /** Boxes already sealed and stacked on the shelf. */
  sealed: number
  /** 1-based number of the box on the bench; 0 when the bench is empty. */
  benchIndex: number
  /** Eggs inside the bench box, 0..capacity. */
  bench: number
  /** Eggs still outside every box. */
  remaining: number
  /** The bench box is the part-full leftover box — the whole lesson. */
  partial: boolean
  /** Paint the loose eggs as a problem: this is the floor-division beat. */
  trap: boolean
  result: boolean
  /** The box count, populated on the landing beat and nowhere else. */
  answerValue: number | null
  /** The choice letter, populated on the landing beat and nowhere else. */
  answerLabel: string | null
  /** "15 + 1 = 16", only on the landing beat. */
  equation: string | null
  hold: number
}

export interface ContainerStoryboard {
  total: number
  capacity: number
  /** Boxes that end up completely full. */
  floor: number
  /** Eggs left after those full boxes — 0 only on defensive/legacy params. */
  remainder: number
  /** The answer: ceil(total / capacity). */
  answer: number
  /** The choice letter, when the caller handed us one. */
  answerLabel: string | null
  steps: ContainerBeat[]
  finalIndex: number
}

/** Defensive read of the served params — the pool can hold older shapes. */
export function normalizeContainerParams(params: unknown): ContainerParams {
  const p = (params ?? {}) as Partial<ContainerParams>
  const capacity = clampInt(p.capacity, 3, 20, 9)
  const total = clampInt(p.total, capacity + 1, 200, 137)
  return { total, capacity }
}

function clampInt(value: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.min(hi, Math.max(lo, n))
}

/** Only a bare A–D letter is a choice label; anything else (a legacy fill-in
 * number, an empty string) means we simply do not name a letter. */
function readLabel(correctAnswer?: string): string | null {
  const s = (correctAnswer ?? '').trim().toUpperCase()
  return /^[A-D]$/.test(s) ? s : null
}

/**
 * C6: pack `total` eggs into boxes that hold `capacity` each. The storyboard
 * fills boxes one at a time with the eggs-still-outside counter running down,
 * pauses on the floor-division trap (stopping at the full boxes leaves eggs
 * outside), then opens one more box for the leftover — part-full, but still a
 * box. Only the last beat names the count or the choice letter.
 */
export function buildContainerSteps(
  params: unknown,
  lang: Lang,
  correctAnswer?: string,
): ContainerStoryboard {
  const { total, capacity } = normalizeContainerParams(params)
  const floor = Math.floor(total / capacity)
  const remainder = total % capacity
  const answer = Math.ceil(total / capacity)
  const answerLabel = readLabel(correctAnswer)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ContainerBeat[] = []
  const push = (b: Omit<ContainerBeat, 'note' | 'partial' | 'trap' | 'result' | 'answerValue' | 'answerLabel' | 'equation'> &
    Partial<Pick<ContainerBeat, 'note' | 'partial' | 'trap' | 'result' | 'answerValue' | 'answerLabel' | 'equation'>>) => {
    steps.push({
      note: null,
      partial: false,
      trap: false,
      result: false,
      answerValue: null,
      answerLabel: null,
      equation: null,
      ...b,
    })
  }

  // 1 — the pile and the rule, nothing packed yet.
  push({
    id: 'intro',
    caption: t(
      `${total} eggs to pack. One box holds ${capacity}.`,
      `${total} telur mau dikemas. Satu kotak muat ${capacity}.`,
    ),
    sealed: 0,
    benchIndex: 0,
    bench: 0,
    remaining: total,
    hold: 2200,
  })

  // 2 — fill boxes one at a time so the counter visibly drains. Long runs show
  // the first two, then jump to the last full box (a 60-beat play-through
  // teaches nothing).
  const shownFills = floor <= 3 ? floor : 2
  for (let k = 1; k <= shownFills; k++) {
    const left = total - k * capacity
    push({
      id: 'fill',
      caption:
        k === 1
          ? t(
              `Box 1 is full: ${capacity} eggs in. ${left} still outside.`,
              `Kotak 1 penuh: ${capacity} telur masuk. Sisa ${left} di luar.`,
            )
          : t(`Box ${k} is full. ${left} still outside.`, `Kotak ${k} penuh. Sisa ${left} di luar.`),
      sealed: k - 1,
      benchIndex: k,
      bench: capacity,
      remaining: left,
      hold: 1800,
    })
  }

  // 3 — skip ahead to the last box that fills right up.
  if (floor > shownFills) {
    push({
      id: 'skip',
      caption:
        remainder > 0
          ? t(
              `Keep going… box ${floor} fills up. Only ${remainder} eggs are left.`,
              `Terus begitu… kotak ${floor} penuh. Tinggal ${remainder} telur.`,
            )
          : t(
              `Keep going… box ${floor} fills up and the eggs run out.`,
              `Terus begitu… kotak ${floor} penuh dan telurnya habis.`,
            ),
      sealed: floor - 1,
      benchIndex: floor,
      bench: capacity,
      remaining: remainder,
      hold: 2000,
    })
  }

  if (remainder > 0) {
    // 4 — the trap: dividing and stopping here leaves eggs on the table.
    push({
      id: 'trap',
      caption: t(
        `Stop at ${floor} boxes? ${remainder} eggs are still outside.`,
        `Berhenti di ${floor} kotak? ${remainder} telur masih di luar.`,
      ),
      note: t(
        `${total} ÷ ${capacity} = ${floor} remainder ${remainder} — the remainder is not packed.`,
        `${total} ÷ ${capacity} = ${floor} sisa ${remainder} — sisanya belum terkemas.`,
      ),
      sealed: floor - 1,
      benchIndex: floor,
      bench: capacity,
      remaining: remainder,
      trap: true,
      hold: 2800,
    })

    // 5 — the lesson: a part-full box is still a box.
    push({
      id: 'leftover',
      caption: t(
        `The last ${remainder} go into a new box. Not full — but used.`,
        `Sisa ${remainder} telur masuk kotak baru. Belum penuh — tapi tetap terpakai.`,
      ),
      sealed: floor,
      benchIndex: floor + 1,
      bench: remainder,
      remaining: 0,
      partial: true,
      hold: 2800,
    })

    // 6 — only now is the count named.
    push({
      id: 'total',
      caption: t(
        `${floor} full boxes + 1 part-full box = ${answer} boxes.`,
        `${floor} kotak penuh + 1 kotak sisa = ${answer} kotak.`,
      ),
      note: answerLabel ? t(`Answer: ${answerLabel}`, `Jawaban: ${answerLabel}`) : null,
      sealed: floor,
      benchIndex: floor + 1,
      bench: remainder,
      remaining: 0,
      partial: true,
      result: true,
      answerValue: answer,
      answerLabel,
      equation: `${floor} + 1 = ${answer}`,
      hold: 0,
    })
  } else {
    // Defensive branch: an exact fit has no leftover, so there is no trap to
    // teach — land straight on the full boxes.
    push({
      id: 'total',
      caption: t(
        `Every box is full and nothing is left: ${answer} boxes.`,
        `Semua kotak penuh dan tidak ada sisa: ${answer} kotak.`,
      ),
      note: answerLabel ? t(`Answer: ${answerLabel}`, `Jawaban: ${answerLabel}`) : null,
      sealed: Math.max(0, floor - 1),
      benchIndex: floor,
      bench: capacity,
      remaining: 0,
      result: true,
      answerValue: answer,
      answerLabel,
      equation: `${floor} × ${capacity} = ${total}`,
      hold: 0,
    })
  }

  return {
    total,
    capacity,
    floor,
    remainder,
    answer,
    answerLabel,
    steps,
    finalIndex: steps.length - 1,
  }
}

/** Boxes in play this beat — sealed on the shelf plus the one on the bench. */
export function boxesUsed(beat: ContainerBeat): number {
  return beat.sealed + (beat.benchIndex > 0 ? 1 : 0)
}
