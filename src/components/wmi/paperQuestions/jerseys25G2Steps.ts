import type { Lang } from '../concepts/explainers/makeTenSteps'
import { JERSEY_PHOTOS, JERSEYS_SOLUTION, type JerseyPhoto } from './Jerseys25G2Illustration'

// WMI-25F2A-Q23 — seven players in a row wear jerseys 1..7. Four partial photos
// each show a CONSECUTIVE run of players with some numbers hidden:
//   A: 7 ? 5   B: 6 4   C: 1 ? ? 7   D: 7 3
// The order is rebuilt one photo at a time, deducing the hidden slots, until the
// whole row 6 1 2 4 7 3 5 is fixed.  Everything is DERIVED from JERSEYS_SOLUTION
// — the hidden numbers and the seat positions are read out of the solution row,
// never hardcoded a second time.

export interface JerseyBeat {
  /** Which photo this beat works on ('A'|'B'|'C'|'D'), or null on the intro/finale. */
  photoLabel: string | null
  /** Slot overrides for the active photo: index -> revealed jersey number. */
  revealedSlots: Record<number, number>
  /** Left-to-right seats (0..6) that are now PINNED into the final row. */
  pinnedSeats: number[]
  /** Seats to outline this beat (the run the active photo is fixing). */
  spotlightSeats: number[]
  /** The current best guess at the full row; null where still unknown. */
  rowSoFar: (number | null)[]
  caption: string
  hold: number
  result: boolean
}

export interface JerseyStoryboard {
  answer: string
  photos: readonly JerseyPhoto[]
  /** Each photo's left seat index in the final row (derived). */
  photoStart: number[]
  steps: JerseyBeat[]
  finalIndex: number
}

/**
 * Find the left-to-right seat index where a photo's run of players lines up
 * inside the solution row, treating the photo as a CONSECUTIVE block (slide its
 * known numbers along the solution). Returns -1 when no consecutive placement
 * fits — which is the case for Photo B, whose two clear numbers (6 and 4) are
 * NOT adjacent in the answer, so B cannot be read as one solid block.
 */
function findPhotoStart(photo: JerseyPhoto, solution: readonly number[]): number {
  const n = photo.slots.length
  for (let start = 0; start + n <= solution.length; start++) {
    let ok = true
    for (let i = 0; i < n; i++) {
      const known = photo.slots[i].number
      if (known !== null && solution[start + i] !== known) {
        ok = false
        break
      }
    }
    if (ok) return start
  }
  return -1 // no consecutive fit (e.g. Photo B)
}

export function buildJerseys25G2Steps(lang: Lang): JerseyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const solution = JERSEYS_SOLUTION
  const answer = solution.join('')

  // Index the four photos by label so the storyboard can pull them in clue order.
  const byLabel: Record<string, JerseyPhoto> = {}
  for (const p of JERSEY_PHOTOS) byLabel[p.label] = p

  // Where does each photo sit in the final row? (derived, not asserted)
  const photoStart = JERSEY_PHOTOS.map((p) => findPhotoStart(p, solution))
  const startOf = (label: string) => photoStart[JERSEY_PHOTOS.findIndex((p) => p.label === label)]

  // A running picture of the row we are rebuilding.
  const row: (number | null)[] = solution.map(() => null)
  const pinned: number[] = []
  const snapshot = () => row.slice()

  const steps: JerseyBeat[] = []

  // ── Intro ──────────────────────────────────────────────────────────────────
  steps.push({
    photoLabel: null,
    revealedSlots: {},
    pinnedSeats: [],
    spotlightSeats: [],
    rowSoFar: snapshot(),
    hold: 2600,
    result: false,
    caption: t(
      'Seven seats, jerseys 1–7, each used once. Slot each photo onto the row to fix the players, one photo at a time.',
      'Tujuh kursi, jersey 1–7, tiap nomor sekali. Tempelkan tiap foto ke barisan untuk mengunci pemain, satu foto demi satu.',
    ),
  })

  // Helper for a CONSECUTIVE photo (A, C, D): the photo is one solid run, so it
  // pins seats [start .. start+len) and reveals any hidden slots. Spotlight = the
  // whole run.
  const playConsecutivePhoto = (label: string, hold: number, caption: string) => {
    const photo = byLabel[label]
    const start = startOf(label)
    const revealedSlots: Record<number, number> = {}
    const spotlightSeats: number[] = []
    photo.slots.forEach((slot, i) => {
      const seat = start + i
      const value = solution[seat] // the truth for this seat
      spotlightSeats.push(seat)
      if (slot.number === null) revealedSlots[i] = value // hidden → reveal
      if (row[seat] === null) {
        row[seat] = value
        pinned.push(seat)
      }
    })
    steps.push({
      photoLabel: label,
      revealedSlots,
      pinnedSeats: [...pinned],
      spotlightSeats,
      rowSoFar: snapshot(),
      hold,
      result: false,
      caption,
    })
  }

  // ── Photo D: 7 then 3 → 3 sits right after 7 ────────────────────────────────
  playConsecutivePhoto(
    'D',
    2200,
    t(
      'Photo D: 7 then 3 — so 3 stands just to the RIGHT of 7. That fixes a 7–3 pair.',
      'Foto D: 7 lalu 3 — jadi 3 berdiri tepat di KANAN 7. Itu mengunci pasangan 7–3.',
    ),
  )

  // ── Photo A: 7 ? 5 → the gap is the 3 we just found ─────────────────────────
  {
    const photoA = byLabel['A']
    const start = startOf('A')
    const hiddenIdx = photoA.slots.findIndex((s) => s.number === null)
    const hiddenValue = solution[start + hiddenIdx]
    playConsecutivePhoto(
      'A',
      2400,
      t(
        `Photo A: 7, ?, 5 with one player between. From Photo D that hidden one is ${hiddenValue} → the right end is 7, ${hiddenValue}, 5.`,
        `Foto A: 7, ?, 5 dengan satu pemain di tengah. Dari Foto D yang tersembunyi itu ${hiddenValue} → ujung kanan adalah 7, ${hiddenValue}, 5.`,
      ),
    )
  }

  // ── Photo C: 1 ? ? 7 → two players between fill the left ────────────────────
  {
    const photoC = byLabel['C']
    const start = startOf('C')
    const hiddenVals = photoC.slots
      .map((s, i) => (s.number === null ? solution[start + i] : null))
      .filter((v): v is number => v !== null)
    playConsecutivePhoto(
      'C',
      2600,
      t(
        `Photo C: 1, ?, ?, 7 — 1 is left of 7 with two between. The only fit is 1, ${hiddenVals[0]}, ${hiddenVals[1]}, 7, so the middle is set.`,
        `Foto C: 1, ?, ?, 7 — 1 di kiri 7 dengan dua di tengah. Satu-satunya yang cocok 1, ${hiddenVals[0]}, ${hiddenVals[1]}, 7, jadi bagian tengah terisi.`,
      ),
    )
  }

  // ── Photo B: 6 left of 4 → 6 takes the last open seat at the front ──────────
  // B is special: its two clear numbers (6 and 4) are NOT adjacent in the answer,
  // so it is NOT a solid block (findPhotoStart returns -1). By now every seat but
  // one is filled; 6 must be left of the already-placed 4, so 6 drops into the
  // single remaining seat at the front.
  {
    const frontSeat = row.findIndex((v) => v === null)
    const frontVal = solution[frontSeat] // = 6, derived
    row[frontSeat] = frontVal
    pinned.push(frontSeat)
    steps.push({
      photoLabel: 'B',
      revealedSlots: {}, // both of B's numbers are already clear (6, 4)
      pinnedSeats: [...pinned],
      spotlightSeats: [frontSeat],
      rowSoFar: snapshot(),
      hold: 2200,
      result: false,
      caption: t(
        `Photo B: 6 is left of 4. Every other seat is now taken, so 6 drops into the only spot left — the very front. The front is ${frontVal}.`,
        `Foto B: 6 di kiri 4. Semua kursi lain sudah terisi, jadi 6 masuk ke satu-satunya tempat tersisa — paling depan. Depannya ${frontVal}.`,
      ),
    })
  }

  // ── Finale ──────────────────────────────────────────────────────────────────
  steps.push({
    photoLabel: null,
    revealedSlots: {},
    pinnedSeats: solution.map((_, i) => i),
    spotlightSeats: [],
    rowSoFar: snapshot(),
    hold: 0,
    result: true,
    caption: t(
      `Read the row left to right: ${solution.join(' ')} → ${answer}.`,
      `Baca barisan dari kiri ke kanan: ${solution.join(' ')} → ${answer}.`,
    ),
  })

  return {
    answer,
    photos: JERSEY_PHOTOS,
    photoStart,
    steps,
    finalIndex: steps.length - 1,
  }
}
