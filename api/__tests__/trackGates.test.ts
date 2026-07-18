// Synthesis gate service (Task 8). Runs only against TEST_DATABASE_URL
// (see api/__tests__/setup.ts).
import { describe, expect, it, beforeAll, afterAll, afterEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne } from '../db.js'
import { getGate, submitGate } from '../services/wmi/tracks/gates.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../services/wmi/concepts/bootstrap.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

const TRACK_ID = 'wmi-grade-1'
const CONCEPT_SLUG = 'single-digit-addition'
const GATE_KEY = 'gate-penjumlahan-dasar'
// wmi-grade-1's pilot gate problemRef ('WMI-21F1A#1') — paperCode({brand:
// 'wmi', year: 2021, round: 'final', level: 'g1', variant: 'A'}) === 'WMI-21F1A'.
const CORRECT_ANSWER = '5'
const WRONG_ANSWER = '999'

;(runIntegration ? describe : describe.skip)('gates', () => {
  const createdUserIds: string[] = []
  let paperId: string
  let createdPaper = false
  let createdQuestion = false

  // The disposable test DB may or may not already have WMI-21F1A#1 seeded
  // (a real paper with that code is expected to exist eventually — see
  // project memory on the WMI paper review). Reuse it if present; otherwise
  // insert a minimal row and clean up only what we created.
  async function ensurePilotPaperAndQuestion(): Promise<void> {
    let paper = await queryOne<{ id: string }>(
      `SELECT id FROM wmi_papers WHERE brand = 'wmi' AND year = 2021 AND round = 'final' AND level_code = 'g1' AND variant = 'A'`,
    )
    if (!paper) {
      paper = await queryOne<{ id: string }>(
        `INSERT INTO wmi_papers (year, grade, level_code, level_sort, round, variant, title, recommended_duration_min, question_count)
         VALUES (2021, 1, 'g1', 1, 'final', 'A', 'TEST WMI-21F1A', 60, 1)
         RETURNING id`,
      )
      createdPaper = true
    }
    paperId = paper!.id

    const question = await queryOne<{ id: string }>(
      `SELECT id FROM wmi_questions WHERE paper_id = $1 AND number = 1`,
      [paperId],
    )
    if (!question) {
      await query(
        `INSERT INTO wmi_questions (paper_id, number, body_en, body_id, answer_type, answer)
         VALUES ($1, 1, 'What is 2 + 3?', 'Berapa 2 + 3?', 'fill_in', $2)`,
        [paperId, CORRECT_ANSWER],
      )
      createdQuestion = true
    }
  }

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped() // seeds wmi_concepts, incl. single-digit-addition
    await ensurePilotPaperAndQuestion()
  })

  afterEach(async () => {
    if (createdUserIds.length) {
      // users -> children -> wmi_concept_progress/wmi_gate_clears cascade.
      await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
      createdUserIds.length = 0
    }
  })

  afterAll(async () => {
    if (createdQuestion) {
      await query(`DELETE FROM wmi_questions WHERE paper_id = $1 AND number = 1`, [paperId])
    }
    if (createdPaper) {
      await query(`DELETE FROM wmi_papers WHERE id = $1`, [paperId])
    }
    await pool.end()
  })

  async function createChild(): Promise<{ parentUserId: string; childId: string }> {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`track-gates-${tag}@example.test`, `Track Gates Test ${tag}`],
    )
    createdUserIds.push(user!.id)
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [user!.id, `Child ${tag}`],
    )
    return { parentUserId: user!.id, childId: child!.id }
  }

  async function setLevel(childId: string, level: number): Promise<void> {
    await query(
      `INSERT INTO wmi_concept_progress (child_id, concept_slug, level, best_tier)
       VALUES ($1, $2, $3, 0)
       ON CONFLICT (child_id, concept_slug) DO UPDATE SET level = EXCLUDED.level`,
      [childId, CONCEPT_SLUG, level],
    )
  }

  it('hides the question while locked, reveals it once the requirement clears the bar', async () => {
    const { parentUserId, childId } = await createChild()
    await setLevel(childId, 3) // below GATE_BAR_LEVEL (4)

    const locked = await getGate(parentUserId, childId, TRACK_ID, GATE_KEY)
    expect(locked).toEqual({ unlocked: false, cleared: false, question: null })

    await setLevel(childId, 4)
    const unlocked = await getGate(parentUserId, childId, TRACK_ID, GATE_KEY)
    expect(unlocked.unlocked).toBe(true)
    expect(unlocked.cleared).toBe(false)
    expect(unlocked.question).toEqual({
      bodyId: 'Berapa 2 + 3?',
      bodyEn: 'What is 2 + 3?',
      answerType: 'fill_in',
      choicesId: null,
      choicesEn: null,
    })
  })

  it('rejects a submission while the gate is still locked', async () => {
    const { parentUserId, childId } = await createChild()
    await setLevel(childId, 3)

    await expect(
      submitGate(parentUserId, childId, TRACK_ID, GATE_KEY, CORRECT_ANSWER),
    ).rejects.toThrow('Gate locked')
  })

  it('grades submissions and clears the gate exactly once on a correct answer', async () => {
    const { parentUserId, childId } = await createChild()
    await setLevel(childId, 4)

    const wrong = await submitGate(parentUserId, childId, TRACK_ID, GATE_KEY, WRONG_ANSWER)
    expect(wrong).toEqual({ correct: false, cleared: false })
    const noClearRow = await queryOne(
      `SELECT 1 FROM wmi_gate_clears WHERE child_id = $1 AND track_id = $2 AND gate_key = $3`,
      [childId, TRACK_ID, GATE_KEY],
    )
    expect(noClearRow).toBeNull()

    const right = await submitGate(parentUserId, childId, TRACK_ID, GATE_KEY, CORRECT_ANSWER)
    expect(right).toEqual({ correct: true, cleared: true })
    const clearRow = await queryOne(
      `SELECT 1 FROM wmi_gate_clears WHERE child_id = $1 AND track_id = $2 AND gate_key = $3`,
      [childId, TRACK_ID, GATE_KEY],
    )
    expect(clearRow).not.toBeNull()

    // Idempotent re-submit (ON CONFLICT DO NOTHING): stays cleared even on
    // a wrong resubmit, and does not error on the duplicate insert attempt.
    const resubmitWrong = await submitGate(parentUserId, childId, TRACK_ID, GATE_KEY, WRONG_ANSWER)
    expect(resubmitWrong).toEqual({ correct: false, cleared: true })

    const resubmitRight = await submitGate(parentUserId, childId, TRACK_ID, GATE_KEY, CORRECT_ANSWER)
    expect(resubmitRight).toEqual({ correct: true, cleared: true })

    const stillOneRow = await query(
      `SELECT 1 FROM wmi_gate_clears WHERE child_id = $1 AND track_id = $2 AND gate_key = $3`,
      [childId, TRACK_ID, GATE_KEY],
    )
    expect(stillOneRow).toHaveLength(1)
  })

  it('rejects an unknown gate key', async () => {
    const { parentUserId, childId } = await createChild()
    await setLevel(childId, 4)
    await expect(getGate(parentUserId, childId, TRACK_ID, 'nonexistent-gate')).rejects.toThrow(
      'Gate not found',
    )
  })

  it('rejects an unknown track id', async () => {
    const { parentUserId, childId } = await createChild()
    await expect(getGate(parentUserId, childId, 'nonexistent-track', GATE_KEY)).rejects.toThrow(
      'Track not found',
    )
  })
})
