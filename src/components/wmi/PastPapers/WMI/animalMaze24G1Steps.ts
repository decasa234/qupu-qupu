// Storyboard for WMI-24F1A-Q11 (2024 Grade 1 Final, Paper A).
//
// Question: five animals each take their SHORTEST route to the flag along the
// grid lines (same speed, avoiding the X-blocked edges). Who arrives LAST?
//   A monkey · B chick · C tiger · D dog · E lion
//
// Method taught (deduce, don't assert): we DON'T just announce the tiger. Same
// speed means the animal that walks the FARTHEST arrives last, so we measure
// each animal's shortest route, one animal per beat, and keep the running
// record of who is "slowest so far". We trace the route on the maze and read
// off its length in grid steps:
//   A monkey = 2  (closest — quick out)
//   B chick  = 5
//   C tiger  = 6  ← the L-block boxes it in, so it must detour the long way
//   D dog    = 5
//   E lion   = 4
// The longest route wins "arrives last" → the tiger, answer C. The result beat
// re-traces the tiger's route and lands on C.
//
// Pure (correctAnswer, lang) => storyboard. Deterministic: the order and the
// distances come straight from the primitive's BFS (pathFor / shortestPath), no
// Math.random / Date. SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANIMAL_GLYPH,
  ANIMAL_NAME_ID,
  pathFor,
  shortestPath,
  STARTS,
  type AnimalKey,
} from './AnimalMaze24G1Illustration'

export type AnimalMazePhase = 'intro' | 'measure' | 'result'

export interface AnimalMazeStep {
  phase: AnimalMazePhase
  /** Which animal this beat is measuring (null on intro). */
  animal: AnimalKey | null
  /** Encoded route to light on the maze for this animal (null on intro). */
  litPath: string | null
  /** Shortest-route length in grid steps for the current animal (null on intro). */
  distance: number | null
  /** The biggest distance seen up to and including this beat. */
  bestDistance: number
  /** The animal holding the "arrives last so far" record at this beat. */
  bestAnimal: AnimalKey | null
  /** True when the current animal sets a NEW longest route (new record). */
  isNewLeader: boolean
  caption: string
  hold: number
  result: boolean
}

export interface AnimalMazeStoryboard {
  /** The winning option letter (longest route → arrives last). */
  answer: AnimalKey
  /** That animal's shortest-route length (6 here). */
  answerDistance: number
  /** Per-animal shortest distances, in the order they are measured. */
  distances: Record<AnimalKey, number>
  steps: AnimalMazeStep[]
  finalIndex: number
}

/** Reveal order: start with the closest, end on the eventual winner (the tiger). */
const MEASURE_ORDER: AnimalKey[] = ['A', 'D', 'E', 'B', 'C']

function distanceOf(animal: AnimalKey): number {
  return shortestPath(STARTS[animal]).length - 1
}

function animalLabel(animal: AnimalKey, lang: Lang): string {
  const en: Record<AnimalKey, string> = {
    A: 'monkey',
    B: 'chick',
    C: 'tiger',
    D: 'dog',
    E: 'lion',
  }
  const glyph = ANIMAL_GLYPH[animal]
  return lang === 'id' ? `${glyph} ${ANIMAL_NAME_ID[animal]}` : `${glyph} ${en[animal]}`
}

export function buildAnimalMaze24G1Steps(correctAnswer: string, lang: Lang): AnimalMazeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const distances = {
    A: distanceOf('A'),
    B: distanceOf('B'),
    C: distanceOf('C'),
    D: distanceOf('D'),
    E: distanceOf('E'),
  } as Record<AnimalKey, number>

  // The answer is the animal with the longest shortest-route (arrives last).
  // Trust the answer key, but it matches the BFS winner (C, distance 6).
  const answer = (['A', 'B', 'C', 'D', 'E'] as AnimalKey[]).includes(correctAnswer as AnimalKey)
    ? (correctAnswer as AnimalKey)
    : 'C'
  const answerDistance = distances[answer]

  const steps: AnimalMazeStep[] = []

  // 1) Goal beat — same speed, so the FARTHEST walker arrives last. No route yet.
  steps.push({
    phase: 'intro',
    animal: null,
    litPath: null,
    distance: null,
    bestDistance: 0,
    bestAnimal: null,
    isNewLeader: false,
    hold: 2100,
    result: false,
    caption: t(
      'Same speed for everyone. So the one whose shortest path is LONGEST arrives last. Count each path.',
      'Kecepatan semua sama. Jadi yang rute terpendeknya PALING PANJANG tiba paling akhir. Hitung tiap rute.',
    ),
  })

  // 2) Measure beats — trace one animal's shortest route, count its steps,
  //    update who is "slowest so far".
  let bestDistance = 0
  let bestAnimal: AnimalKey | null = null
  for (const animal of MEASURE_ORDER) {
    const distance = distances[animal]
    const isNewLeader = distance > bestDistance
    if (isNewLeader) {
      bestDistance = distance
      bestAnimal = animal
    }
    const label = animalLabel(animal, lang)

    let caption: string
    if (bestAnimal === null) {
      // unreachable (first beat always sets a leader), kept for safety
      caption = t(`${label}: ${distance} steps.`, `${label}: ${distance} langkah.`)
    } else if (isNewLeader) {
      caption = t(
        `${label} walks ${distance} steps — the longest so far. Slowest for now.`,
        `${label} berjalan ${distance} langkah — terpanjang sejauh ini. Paling lambat untuk saat ini.`,
      )
    } else {
      caption = t(
        `${label} walks ${distance} steps — still shorter than ${bestDistance}. Not last.`,
        `${label} berjalan ${distance} langkah — masih lebih pendek dari ${bestDistance}. Bukan paling akhir.`,
      )
    }

    steps.push({
      phase: 'measure',
      animal,
      litPath: pathFor(animal),
      distance,
      bestDistance,
      bestAnimal,
      isNewLeader,
      // A non-leader linger a touch longer so the "not last" rejection reads;
      // a new record ticks by a bit quicker.
      hold: isNewLeader ? 1700 : 2100,
      result: false,
      caption,
    })
  }

  // 3) Result beat — re-trace the winner's route, the longest, lands on the answer.
  steps.push({
    phase: 'result',
    animal: answer,
    litPath: pathFor(answer),
    distance: answerDistance,
    bestDistance: answerDistance,
    bestAnimal: answer,
    isNewLeader: true,
    hold: 0,
    result: true,
    caption: t(
      `${animalLabel(answer, lang)} has the longest route, ${answerDistance} steps. It arrives LAST. Answer ${answer}.`,
      `${animalLabel(answer, lang)} punya rute terpanjang, ${answerDistance} langkah. Ia tiba PALING AKHIR. Jawaban ${answer}.`,
    ),
  })

  return {
    answer,
    answerDistance,
    distances,
    steps,
    finalIndex: steps.length - 1,
  }
}
