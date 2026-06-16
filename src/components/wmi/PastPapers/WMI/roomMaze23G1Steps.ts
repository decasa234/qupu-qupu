// Storyboard for WMI-23F1A-Q22 (2023 Grade 1 Final).
//
// Question: 16 numbered rooms in a 4x4 maze. Laura enters at the bottom-left
// room (room 9), moves only between ADJACENT rooms, never re-entering a room,
// passes through exactly 8 rooms in all, then leaves through a border room.
// "At most how many EVEN-numbered rooms can she pass through?"  Answer: 6.
//
// Method taught (deduce, don't assert): we DON'T just announce 6. We walk one
// verified-optimal route one room at a time. The rule is fixed — pass exactly 8
// rooms — so the only freedom is WHICH rooms, and we want as many even numbers as
// we can. Each beat steps into the next room, reads its number, and decides:
//   - even  -> the even counter ticks up (this room "counts")
//   - odd   -> no tick (a wasted room; we want as few as possible)
// After all 8 rooms, only the entrance (9) and one room (5) turned out odd, so 6
// of the 8 rooms are even. The final beat lights every even room and lands on 6.
//
// One optimal route (indices): 12 -> 8 -> 4 -> 5 -> 9 -> 13 -> 14 -> 15
//   values:  9   5   2   8   2    4    6    8    (even rooms: 2,8,2,4,6,8 => SIX)
//
// Pure (lang) => storyboard. Deterministic: walks the fixed OPTIMAL_PATH in
// order, no Math.random / Date. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { OPTIMAL_PATH, ROOM_GRID } from './RoomMaze23G1Illustration'

export type RoomMazePhase = 'intro' | 'step' | 'result'

export interface RoomMazeStep {
  phase: RoomMazePhase
  /** Path traced so far (room indices), grows one room per step beat. */
  path: number[]
  /** The room index entered THIS beat (null on intro). */
  current: number | null
  /** Value (room number) of the current room, null on intro. */
  value: number | null
  /** True when the current room is even-numbered. */
  even: boolean
  /** How many rooms passed so far (path length). */
  passed: number
  /** Running count of even rooms found so far — the answer builds to 6. */
  evenCount: number
  /** When true, tint every even room (final reveal). */
  highlightEven: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RoomMazeStoryboard {
  /** Total rooms Laura passes (always 8 here). */
  roomCount: number
  /** The final answer = even rooms on the optimal route (6). */
  answer: number
  steps: RoomMazeStep[]
  finalIndex: number
}

const isEvenIdx = (idx: number) => ROOM_GRID[idx] % 2 === 0

export function buildRoomMaze23G1Steps(lang: Lang): RoomMazeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const route = OPTIMAL_PATH
  const roomCount = route.length // 8
  const answer = route.filter(isEvenIdx).length // 6

  const steps: RoomMazeStep[] = []

  // 1) Goal beat — state the rule + the strategy, no path yet, no answer.
  steps.push({
    phase: 'intro',
    path: [],
    current: null,
    value: null,
    even: false,
    passed: 0,
    evenCount: 0,
    highlightEven: false,
    hold: 2000,
    result: false,
    caption: t(
      'Walk through exactly 8 rooms. Try to step on as many EVEN numbers as you can.',
      'Lewati tepat 8 kamar. Usahakan menginjak sebanyak mungkin angka GENAP.',
    ),
  })

  // 2) Step beats — enter one room at a time, read its number, tick on evens.
  const walked: number[] = []
  let evenCount = 0
  for (let i = 0; i < route.length; i++) {
    const idx = route[i]
    walked.push(idx)
    const value = ROOM_GRID[idx]
    const even = isEvenIdx(idx)
    if (even) evenCount += 1
    const passed = i + 1
    const isEntrance = i === 0

    let caption: string
    if (isEntrance) {
      // The entrance room (9) is odd — name it so the "odd = no tick" reads.
      caption = t(
        `Enter room ${value}. Odd — it does not count. Even rooms so far: ${evenCount}.`,
        `Masuk kamar ${value}. Ganjil — tidak dihitung. Kamar genap sejauh ini: ${evenCount}.`,
      )
    } else if (even) {
      caption = t(
        `Step into room ${value}. Even! That makes ${evenCount} even rooms.`,
        `Melangkah ke kamar ${value}. Genap! Jadi ${evenCount} kamar genap.`,
      )
    } else {
      caption = t(
        `Step into room ${value}. Odd — skip it. Even rooms still ${evenCount}.`,
        `Melangkah ke kamar ${value}. Ganjil — lewati. Kamar genap tetap ${evenCount}.`,
      )
    }

    steps.push({
      phase: 'step',
      path: [...walked],
      current: idx,
      value,
      even,
      passed,
      evenCount,
      highlightEven: false,
      // Odd (wasted) rooms linger a touch longer so the rejection reads; even
      // rooms tick by a bit quicker.
      hold: even ? 1500 : 1900,
      result: false,
      caption,
    })
  }

  // 3) Result beat — light EVERY even room, show the count, land on the answer.
  steps.push({
    phase: 'result',
    path: [...walked],
    current: route[route.length - 1],
    value: ROOM_GRID[route[route.length - 1]],
    even: isEvenIdx(route[route.length - 1]),
    passed: roomCount,
    evenCount: answer,
    highlightEven: true,
    hold: 0,
    result: true,
    caption: t(
      `${roomCount} rooms, only 2 odd (9 and 5). At most ${answer} even rooms.`,
      `${roomCount} kamar, hanya 2 ganjil (9 dan 5). Paling banyak ${answer} kamar genap.`,
    ),
  })

  return {
    roomCount,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
