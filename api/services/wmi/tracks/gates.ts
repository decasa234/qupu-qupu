// Synthesis gate resolution + grading (Task 8). NOT browser-safe (owns SQL).
//
// Unlock/clear state is the single source of truth already computed by
// getTrackState (the unit-fold + GATE_BAR_LEVEL check) — this file never
// re-derives it, so there is exactly one place that decides "is this gate
// open". Here we only locate the gate node inside that state, resolve its
// past-paper problem, and grade a submitted answer.
import { query } from '../../../db.js'
import { getTrackState, type TrackNodeState } from './trackState.js'
import { paperCode as computePaperCode } from '../paperCode.js'
import { isCorrectAnswer } from '../answerMatch.js'

type GateNodeState = Extract<TrackNodeState, { kind: 'gate' }>

interface GateProblemRow {
  body_id: string
  body_en: string
  answer_type: string
  choices_id: unknown
  choices_en: unknown
  answer: string
}

async function findGateNode(
  parentUserId: string,
  childId: string,
  trackId: string,
  gateKey: string,
): Promise<GateNodeState> {
  const state = await getTrackState(parentUserId, childId, trackId)
  for (const unit of state.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'gate' && node.key === gateKey) return node
    }
  }
  throw new Error('Gate not found')
}

// problemRef is '<paperCode>#<number>' (e.g. 'WMI-21F1A#1'). wmi_papers has
// no stored `code` column — the code is derived from (brand, year, round,
// level, variant), exactly like papers.ts/paperReviews.ts/claireMock.ts
// already do for question codes — so resolve candidates by question number
// (cheap: at most a handful of papers share a given number) and match the
// derived paper code in JS.
async function resolveGateProblem(problemRef: string): Promise<GateProblemRow | null> {
  const [targetCode, numberStr] = problemRef.split('#')
  const number = Number(numberStr)
  if (!targetCode || !Number.isInteger(number)) return null

  const rows = await query<
    GateProblemRow & {
      year: number
      round: string
      variant: string
      brand: string
      level_code: string
    }
  >(
    `
      SELECT q.body_id, q.body_en, q.answer_type, q.choices_id, q.choices_en, q.answer,
             p.year, p.round, p.variant, p.brand, p.level_code
      FROM wmi_questions q
      JOIN wmi_papers p ON p.id = q.paper_id
      WHERE q.number = $1
    `,
    [number],
  )

  const match = rows.find(
    (r) =>
      computePaperCode({
        brand: r.brand,
        year: r.year,
        round: r.round,
        level: r.level_code,
        variant: r.variant,
      }) === targetCode,
  )
  return match ?? null
}

export async function getGate(
  parentUserId: string,
  childId: string,
  trackId: string,
  gateKey: string,
): Promise<{
  unlocked: boolean
  cleared: boolean
  question: {
    bodyId: string
    bodyEn: string
    answerType: string
    choicesId: unknown
    choicesEn: unknown
  } | null
}> {
  const node = await findGateNode(parentUserId, childId, trackId, gateKey)
  if (!node.unlocked) {
    // Locked: never leak the problem body, even the fact that it resolved.
    return { unlocked: false, cleared: node.cleared, question: null }
  }

  const problem = await resolveGateProblem(node.problemRef)
  if (!problem) throw new Error('Gate problem missing')

  return {
    unlocked: true,
    cleared: node.cleared,
    question: {
      bodyId: problem.body_id,
      bodyEn: problem.body_en,
      answerType: problem.answer_type,
      choicesId: problem.choices_id,
      choicesEn: problem.choices_en,
    },
  }
}

export async function submitGate(
  parentUserId: string,
  childId: string,
  trackId: string,
  gateKey: string,
  selectedAnswer: string,
): Promise<{ correct: boolean; cleared: boolean }> {
  const node = await findGateNode(parentUserId, childId, trackId, gateKey)
  if (!node.unlocked) throw new Error('Gate locked')

  const problem = await resolveGateProblem(node.problemRef)
  if (!problem) throw new Error('Gate problem missing')

  const correct = isCorrectAnswer(problem.answer, selectedAnswer)
  if (correct && !node.cleared) {
    await query(
      `INSERT INTO wmi_gate_clears (child_id, track_id, gate_key) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [childId, trackId, gateKey],
    )
  }

  // Already-cleared stays cleared regardless of this submission's
  // correctness (idempotent re-submit never un-clears a gate).
  return { correct, cleared: correct || node.cleared }
}
