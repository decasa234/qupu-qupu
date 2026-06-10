import { randomInt } from 'node:crypto'
import type { PoolClient } from 'pg'
import { pool, query, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { deterministicUuid } from '../../../lib/deterministicUuid.js'
import { wibDateString } from '../../../lib/wib.js'
import { isCorrectAnswer } from '../answerMatch.js'
import { PROFICIENT_TIER } from './comprehension.js'
import {
  EMPTY_PROGRESS,
  applyAnswers,
  lockConceptProgress,
  upsertConceptProgressRows,
  type ConceptProgressNext,
} from './conceptProgress.js'
import {
  CONCEPT_CORRECT_COINS,
  conceptXpForTier,
  grantTierUpBonuses,
} from '../../gamification/concept.js'
import {
  chestThresholdsToGrant,
  grantChapterChests,
  type GrantedChest,
} from '../../gamification/chapterChest.js'
import { appendLedger } from '../../gamification/ledger.js'
import { emitEvent, type EventType } from '../../gamification/events.js'
import { ensureTodaysQuests } from '../../gamification/questGenerator.js'
import {
  evaluateForEvent,
  type QuestProgressResult,
} from '../../gamification/questEvaluator.js'
import { evaluateAchievements } from '../../gamification/achievementEvaluator.js'
import { updateStreakForActivity } from '../../gamification/streakUpdater.js'
import {
  ensureProfile,
  updateProfileWithDelta,
} from '../../gamification/profileUpdater.js'
import { loadLevelTiers, resolveLevel } from '../../gamification/levelCurve.js'

export const SESSION_SIZE = 20

export interface GradeResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
}

// Grade a single answer for live feedback. NO writes, NO XP, NO comprehension.
export async function gradeConceptAnswer(
  parentUserId: string,
  childId: string,
  conceptInstanceId: string,
  selectedAnswer: string,
): Promise<GradeResult> {
  const client = await pool.connect()
  try {
    await assertChildOwnership(client, parentUserId, childId)
  } finally {
    client.release()
  }
  const inst = await queryOne<{
    answer: string
    hint_en: string | null
    hint_id: string | null
    hint_steps_en: string[] | null
    hint_steps_id: string[] | null
  }>(
    'SELECT answer, hint_en, hint_id, hint_steps_en, hint_steps_id FROM wmi_concept_instances WHERE id = $1',
    [conceptInstanceId],
  )
  if (!inst) throw new Error('Question not found')
  return {
    is_correct: isCorrectAnswer(inst.answer, selectedAnswer),
    correct_answer: inst.answer,
    hint_en: inst.hint_en,
    hint_id: inst.hint_id,
    hint_steps_en: inst.hint_steps_en,
    hint_steps_id: inst.hint_steps_id,
  }
}

export interface ConceptGrown {
  slug: string
  nameId: string
  fromTier: number
  toTier: number
  // One-time tier-up bonus XP granted by THIS commit for the crossed tiers
  // (0 when a concurrent path already paid it) — folded into xpEarned, shown
  // on the ceremony's growth beat.
  bonusXp: number
}

export interface CompletedQuest {
  id: string
  code: string
  title: string
  // CLAIMABLE reward (P2.2): completion no longer auto-pays — the kid claims
  // it from the Misi Hari Ini panel. Display-only; never folded into totals.
  rewardXp: number
  rewardCoins: number
}

export interface UnlockedAchievement {
  id: string
  code: string
  title: string
  iconKey: string | null
  xpAwarded: number
}

export interface SessionResult {
  correct: number
  total: number
  xpEarned: number
  coinsEarned: number
  conceptsGrown: ConceptGrown[]
  level: number
  tierName: string
  coinBalance: number
  // Streak shields owned after the commit — lets the FE stat strip show the
  // shield chip without an extra summary fetch.
  streakShields: number
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
  completedQuests: CompletedQuest[]
  unlockedAchievements: UnlockedAchievement[]
  // Chapter chests opened by THIS commit (50%/100% grown, once ever per
  // (child, chapter, threshold)) — already folded into xpEarned/coinsEarned.
  chests: GrantedChest[]
  // Variable session drop: 2-6 coins rolled server-side at commit, already
  // folded into coinsEarned. 0 when nothing was banked.
  sessionDrop: number
  // True when this response is a REPLAY of an already-committed session
  // (idempotency hit) — the FE skips celebration analytics + stat-strip sync.
  replayed?: boolean
}

// Variable session drop bounds (inclusive): a tiny chest at the end of every
// completed session — variable reward without ever punishing anyone.
const SESSION_DROP_MIN = 2
const SESSION_DROP_MAX = 6

// Pure grouping helper (exported for unit tests): per-concept answer
// sequences keyed by slug in first-touch order, preserving the in-session
// answer order within each concept.
export function groupResultsBySlug(
  graded: { conceptSlug: string; isCorrect: boolean }[],
): Map<string, boolean[]> {
  const out = new Map<string, boolean[]>()
  for (const g of graded) {
    const seq = out.get(g.conceptSlug)
    if (seq) seq.push(g.isCorrect)
    else out.set(g.conceptSlug, [g.isCorrect])
  }
  return out
}

// A stored result is non-empty iff the owning commit finished (it UPDATEs
// the row before COMMIT); '{}'::jsonb only ever exists uncommitted.
function isStoredSessionResult(value: unknown): value is SessionResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { total?: unknown }).total === 'number'
  )
}

// Commit a finished session ATOMICALLY: only here do comprehension + XP bank.
// Idempotent on the client-generated sessionId (P1.5): a re-POST (timeout
// retry, lost response) returns the stored result verbatim — no new
// attempts, progress, rewards, events, or quest/achievement evaluation.
export async function commitKonsepSession(
  parentUserId: string,
  childId: string,
  subjectKey: string,
  sessionId: string,
  answers: { conceptInstanceId: string; selectedAnswer: string }[],
): Promise<SessionResult> {
  if (answers.length !== SESSION_SIZE) {
    throw new Error(`Expected ${SESSION_SIZE} answers, received ${answers.length}`)
  }
  // Round-trips (typical warm path) for the batched core, in order:
  //   1 ownership check          2 session-id claim
  //   3 instance batch fetch     4 attempts batch insert
  //   5 progress batch lock      6 progress batch upsert
  //   7 ensureProfile            8+9 streak read + write
  //   10 ledger batch insert     11 session-drop ledger append (P2.2 —
  //   every commit)              12-14 profile delta (inner ensureProfile +
  //   snapshot + UPDATE)         15 result cache write
  // = 15 (was ~140: 20 answers x ~7 queries each). Conditional extras: +1
  // level UPDATE on level-up, +1 per tier crossed (one-time tier-up bonus
  // ledger append — at most a few per session ever), +1 chapter grown COUNT
  // plus +1 ledger append per due chest ONLY when a concept newly reached
  // Mahir this commit (chest block below), +1 cold level_tiers load, +1
  // recovery-eligibility check on a 2-day streak gap, +1-2 shield-consume
  // writes when updateStreakForActivity burns a streak shield. The M2
  // events/quests/achievements block below is already aggregate (one event +
  // evaluation per event TYPE, not per answer) but still adds roughly 8-14
  // more round-trips on top of the batched core (2 per emit+evaluate pair,
  // 1 per quest progress UPDATE — completion no longer writes a ledger row
  // (P2.2 claim ritual) — achievement predicates + unlock inserts, and the
  // achievement bonus profile delta).
  return withTransaction(async (client: PoolClient) => {
    await assertChildOwnership(client, parentUserId, childId)

    // ── Idempotency claim — FIRST write of the transaction ───────────────
    // Under READ COMMITTED a concurrent commit with the same id blocks on
    // the primary key here until the in-flight owner resolves; after a
    // conflict the stored row is the committed winner's, final result
    // included (claim + work + result write are one transaction).
    const claimed = await queryOne<{ session_id: string }>(
      `INSERT INTO wmi_konsep_sessions (session_id, child_id, subject_key, result)
       VALUES ($1, $2, $3, '{}'::jsonb)
       ON CONFLICT (session_id) DO NOTHING
       RETURNING session_id`,
      [sessionId, childId, subjectKey],
      client,
    )
    if (!claimed) {
      const stored = await queryOne<{
        child_id: string
        subject_key: string
        result: unknown
      }>(
        'SELECT child_id, subject_key, result FROM wmi_konsep_sessions WHERE session_id = $1',
        [sessionId],
        client,
      )
      // A session id is private to the child+subject that started it —
      // never serve another child's result on an id collision.
      if (stored && (stored.child_id !== childId || stored.subject_key !== subjectKey)) {
        throw new Error('Konsep session conflict')
      }
      if (stored && isStoredSessionResult(stored.result)) {
        // Replay of an already-committed session: nothing was re-banked, so
        // the FE should not re-fire analytics or re-sync the stat strip.
        return { ...stored.result, replayed: true }
      }
      // Defensive: the claim conflicted but no committed result exists
      // (winner rolled back between our INSERT unblocking and this read).
      // publicError maps this to the generic retryable Indonesian copy.
      throw new Error('Konsep session still processing')
    }

    // ── Batch fetch + grade: ONE query for all distinct instances ────────
    const distinctIds = [...new Set(answers.map((a) => a.conceptInstanceId))]
    const instRows = await query<{
      id: string
      answer: string
      concept_slug: string
      name_id: string
      subject_key: string
    }>(
      `SELECT i.id, i.answer, i.concept_slug, c.name_id, c.subject_key
       FROM wmi_concept_instances i JOIN wmi_concepts c ON c.slug = i.concept_slug
       WHERE i.id = ANY($1::uuid[])`,
      [distinctIds],
      client,
    )
    const instById = new Map(instRows.map((r) => [r.id, r]))

    interface GradedAnswer {
      conceptInstanceId: string
      selectedAnswer: string
      conceptSlug: string
      nameId: string
      isCorrect: boolean
    }
    const graded: GradedAnswer[] = []
    for (const a of answers) {
      const inst = instById.get(a.conceptInstanceId)
      // Defensive: ignore off-subject or unknown instances.
      if (!inst || inst.subject_key !== subjectKey) continue
      graded.push({
        conceptInstanceId: a.conceptInstanceId,
        selectedAnswer: a.selectedAnswer,
        conceptSlug: inst.concept_slug,
        nameId: inst.name_id,
        isCorrect: isCorrectAnswer(inst.answer, a.selectedAnswer),
      })
    }
    const correct = graded.filter((g) => g.isCorrect).length
    const processedCount = graded.length

    let xpEarned = 0
    let coinsEarned = 0
    const grownList: ConceptGrown[] = []
    let levelUp: SessionResult['levelUp'] = null
    let level = 1
    let tierName = ''
    let coinBalance = 0
    let streakShields = 0
    let streakOut = { current: 0, longest: 0 }
    const completedQuests: CompletedQuest[] = []
    const unlockedAchievements: UnlockedAchievement[] = []
    const chests: GrantedChest[] = []
    let sessionDrop = 0

    if (processedCount === 0) {
      // Nothing banked (every submitted instance was off-subject/unknown) —
      // but the result payload must still carry the child's REAL profile
      // numbers: the FE pushes them into the stat strip, and fabricated
      // zeros would wipe real balances. One read, no writes (no activity
      // happened, so last_activity_date must NOT be stamped).
      const profileRow = await queryOne<{
        total_xp: number
        coin_balance: number
        current_streak_days: number
        longest_streak_days: number
        streak_shields: number
      }>(
        `SELECT total_xp, coin_balance, current_streak_days,
                longest_streak_days, streak_shields
           FROM gamification_profiles WHERE child_id = $1`,
        [childId],
        client,
      )
      const tiers = await loadLevelTiers(client)
      const resolution = resolveLevel(Number(profileRow?.total_xp ?? 0), tiers)
      level = resolution.tier.levelNumber
      tierName = resolution.tier.tierName
      coinBalance = Number(profileRow?.coin_balance ?? 0)
      streakShields = Number(profileRow?.streak_shields ?? 0)
      streakOut = {
        current: Number(profileRow?.current_streak_days ?? 0),
        longest: Number(profileRow?.longest_streak_days ?? 0),
      }
    }

    if (processedCount > 0) {
      // ── ONE multi-VALUES insert for all attempts ────────────────────────
      const attemptParams: unknown[] = [childId]
      const attemptValues = graded.map((g) => {
        const base = attemptParams.length
        attemptParams.push(g.conceptInstanceId, g.selectedAnswer, g.isCorrect)
        return `($1, $${base + 1}, 'concept', $${base + 2}, $${base + 3}, NULL, FALSE, '{}'::text[])`
      })
      const attemptRes = await client.query<{ id: string }>(
        `INSERT INTO wmi_attempts
           (child_id, concept_instance_id, mode, selected_answer, is_correct,
            time_taken_ms, revealed_id_translation, looked_up_terms)
         VALUES ${attemptValues.join(', ')}
         RETURNING id`,
        attemptParams,
      )
      // First attempt row anchors the session's gamification events (its id
      // becomes their source_id). Replay protection lives in the session-id
      // claim above — a re-POST never reaches this insert.
      const anchorAttemptId = attemptRes.rows[0]?.id ?? null

      // ── Per-concept progress: ONE lock, JS fold, ONE multi-row upsert ──
      // applyAnswers replays each concept's answer sequence exactly like N
      // sequential upsertConceptProgress calls (unit-tested equivalence).
      const bySlug = groupResultsBySlug(graded)
      const nameBySlug = new Map(graded.map((g) => [g.conceptSlug, g.nameId]))
      const prevBySlug = await lockConceptProgress(client, childId, [...bySlug.keys()])
      const progressRows: { conceptSlug: string; next: ConceptProgressNext }[] = []
      for (const [slug, results] of bySlug) {
        const prev = prevBySlug.get(slug) ?? EMPTY_PROGRESS
        const next = applyAnswers(prev, results)
        progressRows.push({ conceptSlug: slug, next })
        // Tier before = the FOR UPDATE read; after = the post-fold value.
        if (next.best_tier > prev.best_tier) {
          grownList.push({
            slug,
            nameId: nameBySlug.get(slug) ?? slug,
            fromTier: prev.best_tier,
            toTier: next.best_tier,
            bonusXp: 0, // filled below once the tier-up ledger rows land
          })
        }
      }
      await upsertConceptProgressRows(client, childId, progressRows)

      // ── Rewards: hoisted profile/streak + ONE batched ledger insert ────
      // Mirrors awardConceptReward exactly (same amounts, same per-instance
      // (child, CONCEPT_COMPLETION_XP, concept_attempt, instance_id) ledger
      // keys) but runs the shared primitives once per commit instead of once
      // per answer:
      //   - streak: any answered question counts as today's activity; the
      //     19 follow-up per-answer calls were gap-0 no-ops anyway.
      //   - ledger: one row per DISTINCT correct instance — a repeat of the
      //     same instance never double-grants (the old second appendLedger
      //     call returned appended=false).
      //   - profile: one delta summing only the APPENDED rows.
      const today = wibDateString(new Date())
      await ensureProfile(client, childId)
      const streakState = await updateStreakForActivity(client, childId, today)

      const correctInstanceIds = [
        ...new Set(graded.filter((g) => g.isCorrect).map((g) => g.conceptInstanceId)),
      ]
      if (correctInstanceIds.length > 0) {
        // Mastery-scaled XP (P2.1): every answer in this session prices at
        // the concept's PRE-SESSION tier (the FOR UPDATE read above) — simple
        // and consistent, mid-session tier rises don't reprice answers.
        // Idempotency keys are unchanged; only the amounts vary.
        const slugByInstance = new Map(graded.map((g) => [g.conceptInstanceId, g.conceptSlug]))
        const xpByInstance = correctInstanceIds.map((id) => {
          const slug = slugByInstance.get(id)
          const prev = (slug ? prevBySlug.get(slug) : undefined) ?? EMPTY_PROGRESS
          return conceptXpForTier(prev.best_tier)
        })
        const ledgerRes = await client.query<{ xp_delta: number; coin_delta: number }>(
          `INSERT INTO reward_ledger
             (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
           SELECT $1, 'CONCEPT_COMPLETION_XP', 'concept_attempt', src.id, src.xp, $2, '{}'::jsonb
           FROM unnest($3::uuid[], $4::int[]) AS src(id, xp)
           ON CONFLICT (child_id, reward_type, source_type, source_id) DO NOTHING
           RETURNING xp_delta, coin_delta`,
          [childId, CONCEPT_CORRECT_COINS, correctInstanceIds, xpByInstance],
        )
        for (const row of ledgerRes.rows) {
          xpEarned += Number(row.xp_delta)
          coinsEarned += Number(row.coin_delta)
        }
      }

      // ── One-time tier-up bonuses (P2.1) ────────────────────────────────
      // A fold can jump multiple tiers; each crossed tier grants once ever
      // (ledger-idempotent on tier-up:<child>:<slug>:<tier>). Folded into
      // this commit's totals + per-concept bonusXp for the ceremony beat.
      for (const grown of grownList) {
        const grant = await grantTierUpBonuses(
          client,
          childId,
          grown.slug,
          grown.fromTier,
          grown.toTier,
        )
        grown.bonusXp = grant.xp
        xpEarned += grant.xp
        coinsEarned += grant.coins
      }

      // ── Chapter chests (P2.2) ──────────────────────────────────────────
      // Grown share = best_tier >= Mahir over the chapter's enabled concepts.
      // Round-trip budget: ZERO extra queries unless this commit grew a
      // concept to Mahir+ (most commits don't); then ONE chapter COUNT —
      // run AFTER the progress upsert so it sees this commit's rows, giving
      // the AFTER state directly. BEFORE is derived from the fold (after −
      // newly grown), so no second count is needed. Each due threshold adds
      // one ledger append (at most twice ever per (child, chapter), plus
      // rare self-heal no-ops — see chestThresholdsToGrant).
      const newlyGrownToMahir = grownList.filter(
        (g) => g.fromTier < PROFICIENT_TIER && g.toTier >= PROFICIENT_TIER,
      ).length
      if (newlyGrownToMahir > 0) {
        const chapterRow = await queryOne<{ total: number; grown: number }>(
          `SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE p.best_tier >= $3)::int AS grown
             FROM wmi_concepts c
             LEFT JOIN wmi_concept_progress p
               ON p.concept_slug = c.slug AND p.child_id = $1
            WHERE c.subject_key = $2 AND c.enabled = TRUE`,
          [childId, subjectKey, PROFICIENT_TIER],
          client,
        )
        const grownAfter = Number(chapterRow?.grown ?? 0)
        const total = Number(chapterRow?.total ?? 0)
        const thresholds = chestThresholdsToGrant(
          grownAfter - newlyGrownToMahir,
          grownAfter,
          total,
        )
        const granted = await grantChapterChests(client, childId, subjectKey, thresholds)
        for (const chest of granted) {
          chests.push(chest)
          xpEarned += chest.xp
          coinsEarned += chest.coins
        }
      }

      // ── Variable session drop (P2.2) ───────────────────────────────────
      // 2-6 coins, rolled server-side. Ledger-idempotent on the session id
      // (belt-and-braces — the session-id claim above already guarantees a
      // replay never reaches this code; the key protects crash-replay edges).
      const dropLed = await appendLedger(client, {
        childId,
        rewardType: 'SESSION_DROP_COIN',
        sourceType: 'wmi_konsep_session',
        sourceId: deterministicUuid(`session-drop:${sessionId}`),
        xpDelta: 0,
        coinDelta: SESSION_DROP_MIN + randomInt(SESSION_DROP_MAX - SESSION_DROP_MIN + 1),
        metadata: { subjectKey },
      })
      sessionDrop = dropLed.coinDelta
      // Fold only an APPENDED grant into the banked delta (an unreachable-in-
      // practice duplicate means the coins were already credited elsewhere).
      if (dropLed.appended) coinsEarned += dropLed.coinDelta

      // Always run the profile delta — even at 0/0 it stamps
      // last_activity_date = today (so tomorrow's streak gap is correct) and
      // returns the canonical balances/level for the result payload.
      const profile = await updateProfileWithDelta(client, {
        childId,
        xpDelta: xpEarned,
        coinDelta: coinsEarned,
        activityDate: today,
      })
      if (profile.levelUp) {
        levelUp = {
          previousLevel: profile.levelUp.previousLevel,
          currentLevel: profile.levelUp.currentLevel,
          tierName: profile.levelUp.tier.tierName,
        }
      }
      level = profile.after.currentLevel
      tierName = profile.after.currentTierName
      coinBalance = profile.after.coinBalance
      streakOut = {
        current: streakState.currentStreakDays,
        longest: streakState.longestStreakDays,
      }

      // ── Gamification block (mirrors processScoreSubmission steps 2-6) ──
      // One session = one KONSEP_SESSION_COMPLETED event plus batch markers
      // for answered questions and grown concepts, each idempotent on the
      // first attempt row of the session. Quest evaluation + achievement
      // evaluation run on the SAME transaction client, so a failure rolls
      // the whole commit back.
      if (anchorAttemptId) {
        const sessionAnchorId = anchorAttemptId

        // Quest slots must exist before they can progress (video path step 2).
        await ensureTodaysQuests(client, childId, today)

        const emitAndEvaluate = async (
          eventType: EventType,
          metadata: Record<string, unknown>,
          incrementBy: number,
        ): Promise<QuestProgressResult[]> => {
          await emitEvent(client, {
            childId,
            eventType,
            sourceType: 'wmi_session',
            sourceId: sessionAnchorId,
            eventDate: today,
            metadata,
          })
          return evaluateForEvent(client, today, {
            childId,
            eventType,
            eventSourceType: 'wmi_session',
            eventSourceId: sessionAnchorId,
            currentStreakDays: streakState.currentStreakDays,
            incrementBy,
          })
        }

        const allQuestResults: QuestProgressResult[] = []
        allQuestResults.push(
          ...(await emitAndEvaluate(
            'KONSEP_SESSION_COMPLETED',
            {
              subjectKey,
              questionsAnswered: processedCount,
              correctCount: correct,
              conceptsGrownCount: grownList.length,
            },
            1,
          )),
        )
        allQuestResults.push(
          ...(await emitAndEvaluate(
            'KONSEP_QUESTION_ANSWERED',
            { subjectKey, count: processedCount },
            processedCount,
          )),
        )
        if (grownList.length > 0) {
          allQuestResults.push(
            ...(await emitAndEvaluate(
              'KONSEP_CONCEPT_GROWN',
              { subjectKey, count: grownList.length, slugs: grownList.map((g) => g.slug) },
              grownList.length,
            )),
          )
        }

        // Quest completions pay NOTHING here (P2.2 claim ritual): the
        // evaluator only stamps completed_at; the reward grants on
        // POST /me/quests/:id/claim. Collect them for the ceremony beat
        // (claimable amounts, display-only). Dedupe by quest id — the same
        // quest can only complete once per window.
        const completedById = new Map<string, QuestProgressResult>()
        for (const q of allQuestResults) {
          if (q.justCompleted && !completedById.has(q.questId)) {
            completedById.set(q.questId, q)
          }
        }
        for (const q of completedById.values()) {
          completedQuests.push({
            id: q.questId,
            code: q.code,
            title: q.title,
            rewardXp: q.rewardXp,
            rewardCoins: q.rewardCoins,
          })
        }

        // Achievements run last so the post-session state (progress rows,
        // events, streak) is fully applied before predicates are checked.
        // They are the ONLY remaining auto-paid bonus here — quests moved to
        // the claim ritual above.
        let bonusXp = 0
        const newAchievements = await evaluateAchievements(client, childId, streakState)
        for (const ach of newAchievements) {
          bonusXp += ach.xpAwarded
          unlockedAchievements.push({
            id: ach.id,
            code: ach.code,
            title: ach.title,
            iconKey: ach.iconKey,
            xpAwarded: ach.xpAwarded,
          })
        }

        if (bonusXp > 0) {
          const bonusProfile = await updateProfileWithDelta(client, {
            childId,
            xpDelta: bonusXp,
            coinDelta: 0,
            activityDate: today,
          })
          xpEarned += bonusXp
          if (bonusProfile.levelUp) {
            levelUp = {
              previousLevel: bonusProfile.levelUp.previousLevel,
              currentLevel: bonusProfile.levelUp.currentLevel,
              tierName: bonusProfile.levelUp.tier.tierName,
            }
          }
          level = bonusProfile.after.currentLevel
          tierName = bonusProfile.after.currentTierName
          coinBalance = bonusProfile.after.coinBalance
        }
      }

      // Shields can change inside this commit (updateStreakForActivity may
      // consume one on a gap day) — read the post-commit count so the FE
      // shield chip is truthful without a follow-up summary fetch.
      const shieldRow = await queryOne<{ streak_shields: number }>(
        'SELECT streak_shields FROM gamification_profiles WHERE child_id = $1',
        [childId],
        client,
      )
      streakShields = Number(shieldRow?.streak_shields ?? 0)
    }

    const result: SessionResult = {
      correct,
      total: SESSION_SIZE,
      xpEarned,
      coinsEarned,
      conceptsGrown: grownList,
      level,
      tierName,
      coinBalance,
      streakShields,
      levelUp,
      streak: streakOut,
      completedQuests,
      unlockedAchievements,
      chests,
      sessionDrop,
    }

    // Persist the result for replays BEFORE returning — same transaction as
    // the claim, so a committed claim row always carries the final result.
    await client.query(
      'UPDATE wmi_konsep_sessions SET result = $2::jsonb WHERE session_id = $1',
      [sessionId, JSON.stringify(result)],
    )

    return result
  })
}
