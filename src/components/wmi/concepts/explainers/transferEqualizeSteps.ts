import type { Lang } from './makeTenSteps'

// W11 `transfer-to-equalize`. One idea sits under all three ask forms: moving k
// items from one child to the other changes the GAP by 2k, because the giver
// loses k AND the receiver gains k. A six-year-old's instinct is "the gap drops
// by k", so this storyboard never asserts the rule. It parks the tempting stop
// on its own rose beat, then splits the very first move into "it leaves the
// giver" and "it lands on the receiver" so the gap is watched ticking down
// once, then once more — two changes from a single item.
export type TransferAsk = 'equalize' | 'after-transfer' | 'find-original'
export type TransferSubject = 'giver' | 'receiver'
export type TransferPhase = 'setup' | 'gap' | 'trap' | 'move' | 'rewind' | 'result'

const ASKS: readonly TransferAsk[] = ['equalize', 'after-transfer', 'find-original']

/** Mirrors the generator's params (api/services/wmi/concepts/transfer-to-equalize). */
export interface TransferParams {
  ask: TransferAsk
  nameA: string
  nameB: string
  startA: number
  startB: number
  transfer: number
  subject: TransferSubject
  item_en: string
  item_one_en: string
  item_id: string
}

/** The bracketed "extra" counters one row holds over the other. */
export interface TransferGap {
  side: 'A' | 'B'
  count: number
}

export interface TransferBeat {
  phase: TransferPhase
  caption: string
  /**
   * Counter identities. Every counter on screen has a stable token index in
   * `0 … total-1`; tokens below `startA` are the giver's own (blue), the rest
   * are the receiver's own (orange). A beat is just a partition of that fixed
   * set across the two rows, so a token that changes rows animates across and
   * keeps its colour — you can see the giver's counters sitting in the
   * receiver's row.
   */
  rowA: number[]
  rowB: number[]
  /** Tokens hovering in the middle band — lifted out, landed nowhere. */
  flight: number[]
  /** Rose "invented" counters tacked onto the receiver (a trap beat only). */
  phantomB: number
  /** What each row displays this beat. Never negative. */
  countA: number
  countB: number
  gap: TransferGap | null
  /** How many counters changed hands on THIS beat (they glow). */
  moved: number
  direction: 'AtoB' | 'BtoA' | null
  /** Running number handed over (forward) or put back (rewind). */
  movedTotal: number
  trap: boolean
  /** The tempting wrong number this beat is warning about. */
  trapValue: number | null
  /** Short rose chip label for `trapValue`, already in `lang`. */
  trapLabel: string | null
  /** Which row the trap has drawn wrongly (rose card). */
  trapRow: 'A' | 'B' | 'both' | null
  /** The row holding the answer on the final beat (green card). */
  highlightRow: 'A' | 'B' | 'both' | null
  /** Both rows hold the same number. */
  settled: boolean
  /** The answer — non-null ONLY on the final beat. */
  reveal: number | null
  result: boolean
  hold: number
}

export interface TransferStoryboard {
  ask: TransferAsk
  nameA: string
  nameB: string
  subject: TransferSubject
  subjectName: string
  /** Plural item noun in `lang`, for chips. */
  itemLabel: string
  startA: number
  startB: number
  transfer: number
  afterA: number
  afterB: number
  gapBefore: number
  gapAfter: number
  /** Counters on screen (row A + row B); constant across the real beats. */
  total: number
  /** Most counters any single row ever shows — lets the rows reserve height. */
  capacity: number
  answer: number
  steps: TransferBeat[]
  finalIndex: number
}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

const range = (from: number, to: number): number[] => {
  const out: number[] = []
  for (let i = from; i < to; i++) out.push(i)
  return out
}

/**
 * Direct simulation, same as the generator's: try every whole number of items to
 * move and return the one that lands both children on the same count. Never a
 * rounded answer, so the storyboard can never disagree with the question text.
 */
export function equalizingTransfer(startA: number, startB: number): number | null {
  for (let t = 0; t <= startA; t++) if (startA - t === startB + t) return t
  return null
}

const gapOf = (countA: number, countB: number): TransferGap | null =>
  countA === countB ? null : { side: countA > countB ? 'A' : 'B', count: Math.abs(countA - countB) }

export function buildTransferEqualizeSteps(raw: unknown, lang: Lang): TransferStoryboard {
  const p = (raw ?? {}) as Partial<TransferParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ask: TransferAsk = ASKS.includes(p.ask as TransferAsk) ? (p.ask as TransferAsk) : 'after-transfer'
  const subject: TransferSubject = p.subject === 'receiver' ? 'receiver' : 'giver'
  const nameA = str(p.nameA, 'Ana')
  const nameB = str(p.nameB, 'Budi')
  const itemEn = str(p.item_en, 'marbles')
  const itemOneEn = str(p.item_one_en, 'marble')
  const itemId = str(p.item_id, 'kelereng')
  const itemLabel = lang === 'id' ? itemId : itemEn
  // English needs "1 marble" but "3 marbles"; Indonesian needs neither.
  const many = (n: number) => (lang === 'id' ? `${n} ${itemId}` : `${n} ${n === 1 ? itemOneEn : itemEn}`)

  const startA = clampInt(p.startA, 0, 20, 0)
  const startB = clampInt(p.startB, 0, 20, 0)
  let transfer = clampInt(p.transfer, 0, 20, 1)
  if (ask === 'equalize') {
    const eq = equalizingTransfer(startA, startB)
    if (eq !== null) transfer = eq
  }
  // Nobody can hand over more than they hold, so no row can ever go negative.
  transfer = Math.max(0, Math.min(transfer, startA))

  const afterA = startA - transfer
  const afterB = startB + transfer
  const gapBefore = Math.abs(startA - startB)
  const gapAfter = Math.abs(afterA - afterB)
  const total = startA + startB
  const subjectName = subject === 'giver' ? nameA : nameB
  const answer =
    ask === 'equalize'
      ? transfer
      : ask === 'after-transfer'
        ? gapAfter
        : subject === 'giver'
          ? startA
          : startB

  // Whose row carries the answer once the story lands.
  const resultRow: 'A' | 'B' | 'both' =
    ask === 'find-original' ? (subject === 'giver' ? 'A' : 'B') : 'both'

  const leadIsA = startA >= startB
  const leadName = leadIsA ? nameA : nameB
  const trailName = leadIsA ? nameB : nameA
  const leadCount = Math.max(startA, startB)
  const trailCount = Math.min(startA, startB)

  const steps: TransferBeat[] = []
  type Draft = Partial<TransferBeat> & { phase: TransferPhase; caption: string }
  const push = (draft: Draft) => {
    const rowA = draft.rowA ?? []
    const rowB = draft.rowB ?? []
    const phantomB = draft.phantomB ?? 0
    const countA = rowA.length
    const countB = rowB.length + phantomB
    steps.push({
      flight: [],
      moved: 0,
      direction: null,
      movedTotal: 0,
      gap: null,
      trap: false,
      trapValue: null,
      trapLabel: null,
      trapRow: null,
      highlightRow: null,
      reveal: null,
      result: false,
      hold: 1800,
      ...draft,
      rowA,
      rowB,
      phantomB,
      countA,
      countB,
      settled: countA === countB,
    })
  }

  // ── Beats 1–2: show both rows, then make the GAP visible as the bracketed
  // extra counters the leader is holding. ────────────────────────────────────
  if (ask === 'find-original') {
    // The move already happened, so the counts on screen are the AFTER counts.
    push({
      phase: 'setup',
      rowA: range(0, afterA),
      rowB: range(afterA, total),
      caption: T(
        `Right now ${nameA} has ${many(afterA)} and ${nameB} has ${many(afterB)}. These are the counts AFTER the move.`,
        `Sekarang ${nameA} punya ${many(afterA)} dan ${nameB} punya ${many(afterB)}. Ini jumlah SESUDAH pindah.`,
      ),
      hold: 2400,
    })
    push({
      phase: 'gap',
      rowA: range(0, afterA),
      rowB: range(afterA, total),
      gap: gapOf(afterA, afterB),
      moved: transfer,
      direction: 'AtoB',
      caption: T(
        `The glowing ones came over from ${nameA} — ${many(transfer)}. To find the start, we put them back.`,
        `Yang menyala tadi pindah dari ${nameA} — ${many(transfer)}. Untuk tahu jumlah awal, kita kembalikan.`,
      ),
      hold: 2600,
    })
  } else {
    push({
      phase: 'setup',
      rowA: range(0, startA),
      rowB: range(startA, total),
      caption: T(
        `${nameA} has ${many(startA)}. ${nameB} has ${many(startB)}.`,
        `${nameA} punya ${many(startA)}. ${nameB} punya ${many(startB)}.`,
      ),
      hold: 2000,
    })
    push({
      phase: 'gap',
      rowA: range(0, startA),
      rowB: range(startA, total),
      gap: gapOf(startA, startB),
      caption: T(
        `${leadName} is ahead: ${leadCount} − ${trailCount} = ${gapBefore}. Those ${gapBefore} extra are the gap over ${trailName}.`,
        `${leadName} lebih banyak: ${leadCount} − ${trailCount} = ${gapBefore}. ${gapBefore} yang lebih itulah selisihnya dari ${trailName}.`,
      ),
      hold: 2200,
    })
  }

  // ── Beat 3: the trap. Always the picture the tempting answer draws, so the
  // wrong number is something the child can see rather than be told. ─────────
  if (ask === 'equalize') {
    // Hand over the WHOLE gap. It never equalizes — it only swaps them.
    push({
      phase: 'trap',
      rowA: range(0, startB),
      rowB: range(startB, total),
      gap: gapOf(startB, total - startB),
      moved: gapBefore,
      direction: 'AtoB',
      trap: true,
      trapValue: gapBefore,
      trapLabel: T(`Give ${gapBefore}?`, `Beri ${gapBefore}?`),
      trapRow: 'both',
      caption: T(
        `What if ${nameA} hands over the whole gap, all ${gapBefore}? Then ${nameA} holds ${startB} and ${nameB} holds ${startA} — they only swapped, and the gap is ${gapBefore} again.`,
        `Kalau ${nameA} memberi selisihnya, ${gapBefore} sekaligus? ${nameA} jadi ${startB}, ${nameB} jadi ${startA} — cuma tukar tempat, selisihnya ${gapBefore} lagi.`,
      ),
      hold: 3000,
    })
  } else if (ask === 'after-transfer') {
    // Lift all `transfer` out of the giver but never land them: exactly the
    // picture behind "the gap only drops by `transfer`".
    const wrong = Math.max(0, gapBefore - transfer)
    push({
      phase: 'trap',
      rowA: range(0, afterA),
      rowB: range(startA, total),
      flight: range(afterA, startA),
      gap: gapOf(afterA, startB),
      trap: true,
      trapValue: wrong,
      trapLabel: T(`Gap ${wrong}?`, `Selisih ${wrong}?`),
      // The receiver is the row the tempting answer forgot to change.
      trapRow: 'B',
      caption: T(
        `The tempting answer stops here: "${transfer} left ${nameA}, so the gap is ${gapBefore} − ${transfer} = ${wrong}." But look — the ${itemLabel} are still in the air. ${nameB} has not grown at all.`,
        `Jawaban godaan berhenti di sini: "${transfer} keluar dari ${nameA}, jadi selisih ${gapBefore} − ${transfer} = ${wrong}." Tapi lihat — ${itemLabel} itu masih melayang. ${nameB} belum bertambah sama sekali.`,
      ),
      hold: 3200,
    })
  } else {
    // Rewind one side only, in the wrong direction for whoever is asked about.
    const isGiver = subject === 'giver'
    const wrong = isGiver ? Math.max(0, afterA - transfer) : afterB + transfer
    push({
      phase: 'trap',
      rowA: isGiver ? range(0, Math.max(0, afterA - transfer)) : range(0, afterA),
      rowB: range(afterA, total),
      flight: isGiver ? range(Math.max(0, afterA - transfer), afterA) : [],
      phantomB: isGiver ? 0 : transfer,
      trap: true,
      trapValue: wrong,
      trapLabel: T(`Start ${wrong}?`, `Awalnya ${wrong}?`),
      trapRow: isGiver ? 'A' : 'B',
      caption: isGiver
        ? T(
            `Tempting: ${afterA} − ${transfer} = ${wrong}. But ${nameA} GAVE ${transfer} away. Taking ${transfer} off again gives them away twice — ${nameA} started with more, not less.`,
            `Godaan: ${afterA} − ${transfer} = ${wrong}. Padahal ${nameA} MEMBERI ${transfer}. Mengurangi ${transfer} lagi berarti memberi dua kali — ${nameA} awalnya lebih banyak, bukan lebih sedikit.`,
          )
        : T(
            `Tempting: ${afterB} + ${transfer} = ${wrong}. But ${nameB} RECEIVED ${transfer}. Adding ${transfer} again hands them over twice — ${nameB} started with less, not more.`,
            `Godaan: ${afterB} + ${transfer} = ${wrong}. Padahal ${nameB} MENERIMA ${transfer}. Menambah ${transfer} lagi berarti menerima dua kali — ${nameB} awalnya lebih sedikit, bukan lebih banyak.`,
          ),
      hold: 3200,
    })
  }

  // ── Beats 4+: the real move, one counter at a time. Move #1 is split in two
  // half-beats so a single item is seen changing the gap twice. ──────────────
  const moves = transfer

  if (moves > 0) {
    const forward = ask !== 'find-original'
    // The first token to travel: the giver's last counter going out, or the
    // receiver's first counter coming back on the rewind.
    const firstToken = forward ? startA - 1 : afterA
    const baseA = forward ? startA : afterA
    const baseB = forward ? startB : afterB
    const liftA = forward ? baseA - 1 : baseA
    const liftB = forward ? baseB : baseB - 1

    // Half-beat 1 — the counter has left, nobody holds it yet. Gap moves once.
    push({
      phase: forward ? 'move' : 'rewind',
      rowA: forward ? range(0, startA - 1) : range(0, afterA),
      rowB: forward ? range(startA, total) : range(afterA + 1, total),
      flight: [firstToken],
      gap: gapOf(liftA, liftB),
      direction: forward ? 'AtoB' : 'BtoA',
      caption: forward
        ? T(
            `Slow down and take just 1. ${nameA} goes ${baseA} to ${liftA}, so the gap slips from ${gapBefore} to ${Math.abs(liftA - liftB)}. That is one change.`,
            `Pelan-pelan, ambil 1 saja. ${nameA} dari ${baseA} jadi ${liftA}, selisih turun dari ${gapBefore} ke ${Math.abs(liftA - liftB)}. Itu perubahan pertama.`,
          )
        : T(
            `Rewind slowly, 1 at a time. Lift 1 back off ${nameB}: ${baseB} goes to ${liftB}. It is in the air — nobody holds it yet.`,
            `Putar balik pelan-pelan, 1 dulu. Ambil 1 dari ${nameB}: ${baseB} jadi ${liftB}. Masih melayang — belum ada yang punya.`,
          ),
      hold: 2400,
    })

    // Half-beat 2 — it lands. Same single item, second change to the gap. This
    // is the beat the whole concept rests on.
    const landA = forward ? baseA - 1 : baseA + 1
    const landB = forward ? baseB + 1 : baseB - 1
    const landIsResult = moves === 1
    push({
      phase: forward ? 'move' : 'rewind',
      rowA: forward ? range(0, startA - 1) : range(0, afterA + 1),
      rowB: forward ? range(startA - 1, total) : range(afterA + 1, total),
      gap: gapOf(landA, landB),
      moved: 1,
      movedTotal: 1,
      direction: forward ? 'AtoB' : 'BtoA',
      caption: landIsResult
        ? finalCaption(1)
        : forward
          ? T(
              `Now it lands on ${nameB}: ${baseB} becomes ${landB}. The gap falls again, ${Math.abs(liftA - liftB)} to ${Math.abs(landA - landB)}. One item, two changes — the gap moved by 2, not 1.`,
              `Sekarang mendarat di ${nameB}: ${baseB} jadi ${landB}. Selisih turun lagi, ${Math.abs(liftA - liftB)} ke ${Math.abs(landA - landB)}. Satu benda, dua perubahan — selisih bergeser 2, bukan 1.`,
            )
          : T(
              `And it lands back on ${nameA}: ${baseA} becomes ${landA}. Putting 1 back changed BOTH rows — ${nameB} down 1 and ${nameA} up 1.`,
              `Lalu mendarat lagi di ${nameA}: ${baseA} jadi ${landA}. Mengembalikan 1 mengubah DUA baris — ${nameB} turun 1 dan ${nameA} naik 1.`,
            ),
      result: landIsResult,
      reveal: landIsResult ? answer : null,
      highlightRow: landIsResult ? resultRow : null,
      hold: landIsResult ? 0 : 2800,
    })

    // Whole moves #2 … #moves — each repeats the doubling in a single step.
    for (let j = 2; j <= moves; j++) {
      const cA = forward ? startA - j : afterA + j
      const cB = forward ? startB + j : afterB - j
      const prevA = forward ? startA - (j - 1) : afterA + (j - 1)
      const prevB = forward ? startB + (j - 1) : afterB - (j - 1)
      const isLast = j === moves
      push({
        phase: forward ? 'move' : 'rewind',
        rowA: range(0, cA),
        rowB: range(cA, total),
        gap: gapOf(cA, cB),
        moved: 1,
        movedTotal: j,
        direction: forward ? 'AtoB' : 'BtoA',
        caption: isLast
          ? finalCaption(j)
          : forward
            ? T(
                `One more crosses: ${nameA} ${prevA} to ${cA}, ${nameB} ${prevB} to ${cB}. The gap drops another 2, down to ${Math.abs(cA - cB)}.`,
                `Pindah 1 lagi: ${nameA} ${prevA} jadi ${cA}, ${nameB} ${prevB} jadi ${cB}. Selisih turun 2 lagi, jadi ${Math.abs(cA - cB)}.`,
              )
            : T(
                `Put 1 more back: ${nameB} ${prevB} to ${cB}, ${nameA} ${prevA} to ${cA}. Two rows change every single time.`,
                `Kembalikan 1 lagi: ${nameB} ${prevB} jadi ${cB}, ${nameA} ${prevA} jadi ${cA}. Dua baris selalu berubah bersama.`,
              ),
        result: isLast,
        reveal: isLast ? answer : null,
        highlightRow: isLast ? resultRow : null,
        hold: isLast ? 0 : 1800,
      })
    }
  }

  // Degenerate params (nothing can move) still deserve a landing beat.
  if (!steps.some((s) => s.result)) {
    push({
      phase: 'result',
      rowA: range(0, startA),
      rowB: range(startA, total),
      gap: gapOf(startA, startB),
      caption: finalCaption(0),
      result: true,
      reveal: answer,
      highlightRow: resultRow,
      hold: 0,
    })
  }

  const capacity = steps.reduce((m, s) => Math.max(m, s.countA, s.countB), 1)

  return {
    ask,
    nameA,
    nameB,
    subject,
    subjectName,
    itemLabel,
    startA,
    startB,
    transfer,
    afterA,
    afterB,
    gapBefore,
    gapAfter,
    total,
    capacity,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }

  // Only the last beat says the answer out loud, and it says it as the payoff of
  // what the child just watched — never as a fresh assertion.
  function finalCaption(movedSoFar: number): string {
    const twice = 2 * transfer
    if (ask === 'equalize') {
      const each = startA - transfer
      return movedSoFar <= 1
        ? T(
            `That single item took 2 off the gap, not 1 — ${gapBefore} down to ${gapAfter}. Both hold ${each} now, so ${nameA} gives ${many(transfer)}.`,
            `Satu benda itu mengurangi selisih 2, bukan 1 — dari ${gapBefore} ke ${gapAfter}. Sekarang dua-duanya ${each}, jadi ${nameA} memberi ${many(transfer)}.`,
          )
        : T(
            `Every item took 2 off the gap, so a gap of ${gapBefore} needed ${gapBefore} ÷ 2 of them. Both hold ${each} now: ${nameA} gives ${many(transfer)}.`,
            `Tiap benda mengurangi selisih 2, jadi selisih ${gapBefore} butuh ${gapBefore} ÷ 2 benda. Sekarang dua-duanya ${each}: ${nameA} memberi ${many(transfer)}.`,
          )
    }
    if (ask === 'after-transfer') {
      return T(
        `${many(transfer)} crossed, and each one took 2 off the gap: ${gapBefore} − 2 × ${transfer} = ${gapAfter}. ${nameA} has ${afterA}, ${nameB} has ${afterB} — ${nameA} has ${gapAfter} more.`,
        `${many(transfer)} pindah, dan tiap satu mengurangi selisih 2: ${gapBefore} − 2 × ${transfer} = ${gapAfter}. ${nameA} punya ${afterA}, ${nameB} punya ${afterB} — ${nameA} lebih banyak ${gapAfter}.`,
      )
    }
    return T(
      `Everything is back where it began: ${nameA} ${startA}, ${nameB} ${startB}. The one move had shifted them by 2 × ${transfer} = ${twice} in all, so ${subjectName} had ${many(answer)} at first.`,
      `Semua kembali seperti semula: ${nameA} ${startA}, ${nameB} ${startB}. Satu perpindahan tadi menggeser mereka 2 × ${transfer} = ${twice}, jadi ${subjectName} mula-mula punya ${many(answer)}.`,
    )
  }
}
