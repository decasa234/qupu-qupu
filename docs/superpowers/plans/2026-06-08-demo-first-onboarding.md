# Demo-First Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-contained, demo-first onboarding flow at `/mulai` that lets a visitor answer grade-matched sample math questions, earn a celebratory first badge, tour the math features, and see a personalized plan — then funnels into the existing register → child-profile path with the child's name and grade pre-filled.

**Architecture:** A client-only multi-step state machine (`src/pages/Mulai.tsx`) orchestrates five step components under `src/components/onboarding/`. It fetches the existing public `/public/meta` once for grade options + plan data (with a hardcoded fallback), persists the captured child name + grade to `localStorage` via a new `demoStorage` shim, and navigates to the unchanged `/register`. `OnboardingChild`/`ChildForm` read that storage to pre-fill and clear it on child creation. No backend changes.

**Tech Stack:** React 18 + TypeScript, React Router 7, Tailwind (qupu-ui design tokens), `framer-motion` (already a dep, for `useReducedMotion`), reused `KonsepConfetti` (CSS `fall` keyframe).

> **Design system note:** Build the visual step components with the **qupu-ui** skill. The JSX in this plan is complete and functional, using real qupu tokens (`qupu-brand-orange`, `qupu-brand-blue`, `qupu-brand-yellow`, `qupu-shell`, `qupu-peach`, `qupu-muted`, `qupu-ink`, `font-display`, `shadow-subscribe`, hard shadows). Treat it as the working baseline and apply qupu-ui polish where noted.

> **Testing note:** This repo has **no test runner** (per CLAUDE.md). Each task is verified with `npm run check` (typecheck) and, for the final task, `npm run lint` + `npm run build` + a manual QA pass via the **webwright** skill. There are no unit-test steps because there is no harness to run them.

---

## File Structure

**New files**
- `src/lib/demoStorage.ts` — localStorage get/save/clear for `{ childName, ageGroupId }`. Mirrors `referralStorage.ts`.
- `src/lib/demoQuestions.ts` — curated 2-question sets per grade band + `bandForAgeGroup()` + `getDemoQuestions()` + `FALLBACK_GRADES`.
- `src/components/onboarding/ProgressDots.tsx` — step indicator.
- `src/components/onboarding/WhoStep.tsx` — child name + grade picker.
- `src/components/onboarding/SampleQuiz.tsx` — sample question runner.
- `src/components/onboarding/WinMoment.tsx` — confetti + first badge.
- `src/components/onboarding/MiniTour.tsx` — 2-3 feature highlight cards.
- `src/components/onboarding/PlanReveal.tsx` — personalized plan + signup CTA.
- `src/pages/Mulai.tsx` — the state machine / orchestrator page.

**Modified files**
- `src/lib/analytics.ts` — add demo funnel event names to the `AnalyticsEventName` union.
- `src/App.tsx` — add the `/mulai` route under the marketing `Layout`.
- `src/pages/Home.tsx` — add the primary "Coba gratis — tanpa daftar" hero CTA → `/mulai`.
- `src/components/ChildForm.tsx` — accept optional `initialName` / `initialAgeGroupId` props.
- `src/pages/OnboardingChild.tsx` — read demo storage, pre-fill `ChildForm`, clear storage + fire `onboarding_child_created` on create.

---

## Task 1: Analytics events

**Files:**
- Modify: `src/lib/analytics.ts:21-31`

- [ ] **Step 1: Add the demo funnel events to the union**

In `src/lib/analytics.ts`, extend the `AnalyticsEventName` union (keep all existing members, including `demo_quiz_submit`):

```ts
export type AnalyticsEventName =
  | 'page_view'
  | 'register_button_click'
  | 'login_button_click'
  | 'google_button_click'
  | 'score_submit_attempt_anon'
  | 'score_submit_attempt'
  | 'register_completed'
  | 'login_completed'
  | 'google_login_completed'
  | 'demo_quiz_submit'
  | 'demo_started'
  | 'demo_grade_selected'
  | 'demo_question_answered'
  | 'demo_badge_earned'
  | 'demo_tour_viewed'
  | 'demo_plan_viewed'
  | 'demo_signup_click'
  | 'demo_skipped'
  | 'onboarding_child_created'
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat(onboarding): add demo funnel analytics events"
```

---

## Task 2: Demo storage shim

**Files:**
- Create: `src/lib/demoStorage.ts`

- [ ] **Step 1: Create the storage module**

Create `src/lib/demoStorage.ts`:

```ts
// src/lib/demoStorage.ts
//
// Lightweight localStorage shim for the child name + grade captured during
// the /mulai demo. Read by OnboardingChild/ChildForm to pre-fill the first
// child profile, and cleared once that profile is created. Mirrors the
// referralStorage.ts pattern.

const KEY = 'qupu_demo_selections'

export interface DemoSelections {
  childName: string
  ageGroupId: string | null
}

export function saveDemoSelections(selections: DemoSelections): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(selections))
  } catch {
    // localStorage may be disabled in private mode — silently no-op.
  }
}

export function readDemoSelections(): DemoSelections | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoSelections>
    if (typeof parsed.childName !== 'string') return null
    return {
      childName: parsed.childName,
      ageGroupId: typeof parsed.ageGroupId === 'string' ? parsed.ageGroupId : null,
    }
  } catch {
    return null
  }
}

export function clearDemoSelections(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/demoStorage.ts
git commit -m "feat(onboarding): add demo selections localStorage shim"
```

---

## Task 3: Curated demo questions + band mapping

**Files:**
- Create: `src/lib/demoQuestions.ts`

- [ ] **Step 1: Create the data module**

Create `src/lib/demoQuestions.ts`:

```ts
// src/lib/demoQuestions.ts
//
// Curated, grade-fitted sample questions for the /mulai demo. Keyed by a
// stable "band" derived from the selected age group's minAge — NOT by the
// age-group DB UUID, which differs across environments.

export type DemoBand = 'lower' | 'middle' | 'upper'

export interface DemoQuestion {
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
}

// Used when /public/meta is unavailable so the demo still runs. IDs are
// sentinel values (prefixed 'fallback-') and are never persisted as a real
// ageGroupId — see Mulai.tsx.
export const FALLBACK_GRADES = [
  { id: 'fallback-lower', name: 'Kelas 1-2', minAge: 6, maxAge: 7 },
  { id: 'fallback-middle', name: 'Kelas 3-4', minAge: 8, maxAge: 9 },
  { id: 'fallback-upper', name: 'Kelas 5-6', minAge: 10, maxAge: 12 },
]

const QUESTIONS: Record<DemoBand, DemoQuestion[]> = {
  lower: [
    {
      prompt: '3 + 4 = ?',
      choices: ['6', '7', '8', '9'],
      correctIndex: 1,
      explanation: '3 ditambah 4 sama dengan 7.',
    },
    {
      prompt: 'Berapa banyak sisi pada segitiga?',
      choices: ['2', '3', '4', '5'],
      correctIndex: 1,
      explanation: 'Segitiga punya 3 sisi.',
    },
  ],
  middle: [
    {
      prompt: '12 × 3 = ?',
      choices: ['15', '36', '32', '9'],
      correctIndex: 1,
      explanation: '12 dikali 3 sama dengan 36.',
    },
    {
      prompt: 'Setengah dari 20 adalah?',
      choices: ['5', '8', '10', '12'],
      correctIndex: 2,
      explanation: 'Setengah dari 20 adalah 10.',
    },
  ],
  upper: [
    {
      prompt: 'Berapakah 25% dari 80?',
      choices: ['15', '20', '25', '40'],
      correctIndex: 1,
      explanation: '25% dari 80 adalah 20.',
    },
    {
      prompt: 'Keliling persegi dengan sisi 6 cm adalah?',
      choices: ['12 cm', '18 cm', '24 cm', '36 cm'],
      correctIndex: 2,
      explanation: 'Keliling = 4 × 6 = 24 cm.',
    },
  ],
}

export function bandForAgeGroup(group: { minAge: number } | null): DemoBand {
  if (!group) return 'middle'
  if (group.minAge < 8) return 'lower'
  if (group.minAge <= 9) return 'middle'
  return 'upper'
}

export function getDemoQuestions(band: DemoBand): DemoQuestion[] {
  return QUESTIONS[band]
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/demoQuestions.ts
git commit -m "feat(onboarding): add curated grade-banded demo questions"
```

---

## Task 4: ProgressDots component

**Files:**
- Create: `src/components/onboarding/ProgressDots.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/ProgressDots.tsx`:

```tsx
// src/components/onboarding/ProgressDots.tsx
interface ProgressDotsProps {
  total: number
  current: number // 0-based index of the active step
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-200 ${
            i === current
              ? 'w-6 bg-qupu-brand-orange'
              : i < current
                ? 'w-2 bg-qupu-brand-orange/50'
                : 'w-2 bg-qupu-peach'
          }`}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/ProgressDots.tsx
git commit -m "feat(onboarding): add ProgressDots step indicator"
```

---

## Task 5: WhoStep component (name + grade)

**Files:**
- Create: `src/components/onboarding/WhoStep.tsx`

**Context:** `AgeGroupOption` is `{ id, name, minAge, maxAge }` (`src/types/index.ts`). The parent (`Mulai.tsx`, Task 10) fetches grades and passes them in.

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/WhoStep.tsx`:

```tsx
// src/components/onboarding/WhoStep.tsx
import { useState } from 'react'
import type { AgeGroupOption } from '../../types'

interface WhoStepProps {
  ageGroups: AgeGroupOption[]
  onSubmit: (childName: string, group: AgeGroupOption) => void
}

export default function WhoStep({ ageGroups, onSubmit }: WhoStepProps) {
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')

  const selected = ageGroups.find((g) => g.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <img src="/hero-mascot.png" alt="" className="mx-auto h-28 w-auto" />
        <h1 className="mt-3 font-display text-2xl font-black text-qupu-ink">
          Siapa yang mau belajar?
        </h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          Isi nama anak (opsional) dan pilih kelasnya.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Nama anak (opsional)
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Aira"
          maxLength={80}
          className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </label>

      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Kelas anak
        </span>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {ageGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedId(group.id)}
              aria-pressed={selectedId === group.id}
              className={`flex items-center justify-between rounded-2xl border-2 px-5 py-3 text-left font-display text-base font-extrabold transition-colors ${
                selectedId === group.id
                  ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white shadow-subscribe'
                  : 'border-qupu-peach bg-qupu-shell text-qupu-brand-blue hover:border-qupu-brand-blue'
              }`}
            >
              {group.name}
              {selectedId === group.id && (
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onSubmit(name.trim(), selected)}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Mulai
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/WhoStep.tsx
git commit -m "feat(onboarding): add WhoStep name + grade picker"
```

---

## Task 6: SampleQuiz component

**Files:**
- Create: `src/components/onboarding/SampleQuiz.tsx`

**Context:** Fires `demo_question_answered` per answer (with `{ correct }`). Calls `onComplete(answers)` after the last question, where `answers` is a `boolean[]` of correctness.

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/SampleQuiz.tsx`:

```tsx
// src/components/onboarding/SampleQuiz.tsx
import { useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import type { DemoQuestion } from '../../lib/demoQuestions'

interface SampleQuizProps {
  questions: DemoQuestion[]
  onComplete: (answers: boolean[]) => void
}

export default function SampleQuiz({ questions, onComplete }: SampleQuizProps) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question = questions[index]
  const isLast = index === questions.length - 1
  const answered = picked !== null
  const correct = answered && picked === question.correctIndex

  function handlePick(choiceIndex: number) {
    if (answered) return
    setPicked(choiceIndex)
    trackEvent('demo_question_answered', {
      questionIndex: index,
      correct: choiceIndex === question.correctIndex,
    })
  }

  function handleNext() {
    const nextAnswers = [...answers, correct]
    if (isLast) {
      onComplete(nextAnswers)
      return
    }
    setAnswers(nextAnswers)
    setIndex((i) => i + 1)
    setPicked(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
        Soal {index + 1} dari {questions.length}
      </p>

      <div className="rounded-[1.75rem] bg-qupu-brand-blue px-5 py-8 text-center text-white shadow-[0_5px_0_0_#234B73]">
        <span className="font-display text-3xl font-black">{question.prompt}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice, i) => {
          const isCorrectChoice = i === question.correctIndex
          const isPicked = picked === i
          let tone =
            'border-qupu-peach bg-qupu-shell text-qupu-ink hover:border-qupu-brand-blue'
          if (answered && isCorrectChoice) {
            tone = 'border-green-500 bg-green-50 text-green-700'
          } else if (answered && isPicked && !isCorrectChoice) {
            tone = 'border-red-400 bg-red-50 text-red-600'
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handlePick(i)}
              className={`rounded-2xl border-2 px-4 py-4 font-display text-xl font-extrabold transition-colors disabled:cursor-default ${tone}`}
            >
              {choice}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`rounded-[1.25rem] px-4 py-3 text-sm font-semibold ${
            correct ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {correct ? 'Tepat! ' : 'Hampir! '}
          {question.explanation}
        </div>
      )}

      <button
        type="button"
        disabled={!answered}
        onClick={handleNext}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLast ? 'Selesai' : 'Lanjut'}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/SampleQuiz.tsx
git commit -m "feat(onboarding): add SampleQuiz runner"
```

---

## Task 7: WinMoment component

**Files:**
- Create: `src/components/onboarding/WinMoment.tsx`

**Context:** Reuses `KonsepConfetti` (`src/components/wmi/KonsepConfetti.tsx`, default export, prop `pieces?: number`). Suppresses confetti under `prefers-reduced-motion` via framer-motion's `useReducedMotion`. Fires `demo_badge_earned` once on mount.

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/WinMoment.tsx`:

```tsx
// src/components/onboarding/WinMoment.tsx
import { useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import KonsepConfetti from '../wmi/KonsepConfetti'
import { trackEvent } from '../../lib/analytics'

interface WinMomentProps {
  onContinue: () => void
}

export default function WinMoment({ onContinue }: WinMomentProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    trackEvent('demo_badge_earned')
  }, [])

  return (
    <div className="relative flex flex-col items-center gap-5 py-4 text-center">
      {!reduceMotion && <KonsepConfetti pieces={50} />}

      <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-qupu-brand-yellow shadow-[0_5px_0_0_#C99700]">
        <i className="fa-solid fa-medal text-5xl text-white" aria-hidden="true" />
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-3xl font-black text-qupu-ink">
          Kamu dapat badge pertama!
        </h1>
        <p className="mt-2 text-sm font-semibold text-qupu-muted">
          +10 XP · Terus kumpulkan badge di setiap kuis.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="relative z-10 inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        Lanjut
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/WinMoment.tsx
git commit -m "feat(onboarding): add WinMoment celebration"
```

---

## Task 8: MiniTour component

**Files:**
- Create: `src/components/onboarding/MiniTour.tsx`

**Context:** Steps through 3 highlight cards one at a time (advance button), then calls `onContinue`. Fires `demo_tour_viewed` once on mount.

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/MiniTour.tsx`:

```tsx
// src/components/onboarding/MiniTour.tsx
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'

interface TourCard {
  icon: string
  title: string
  body: string
  accent: string
}

const CARDS: TourCard[] = [
  {
    icon: 'fa-solid fa-medal',
    title: 'Badge & XP',
    body: 'Setiap kuis yang diselesaikan menghasilkan badge dan XP untuk naik level.',
    accent: 'bg-qupu-brand-yellow',
  },
  {
    icon: 'fa-solid fa-calculator',
    title: 'Latihan Matematika WMI',
    body: 'Latihan soal matematika ala olimpiade WMI — drill, konsep, dan ujian.',
    accent: 'bg-qupu-brand-blue',
  },
  {
    icon: 'fa-solid fa-fire',
    title: 'Target Harian & Streak',
    body: 'Tetapkan target kuis harian dan jaga streak biar belajar jadi kebiasaan.',
    accent: 'bg-qupu-brand-orange',
  },
]

interface MiniTourProps {
  onContinue: () => void
}

export default function MiniTour({ onContinue }: MiniTourProps) {
  const [index, setIndex] = useState(0)
  const isLast = index === CARDS.length - 1
  const card = CARDS[index]

  useEffect(() => {
    trackEvent('demo_tour_viewed')
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center font-display text-2xl font-black text-qupu-ink">
        Apa saja di QUPU?
      </h1>

      <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-qupu-shell p-6 text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${card.accent} text-white`}
        >
          <i className={`${card.icon} text-3xl`} aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-xl font-black text-qupu-ink">{card.title}</h2>
        <p className="mt-2 text-sm font-semibold text-qupu-muted">{card.body}</p>
      </div>

      <div className="flex items-center justify-center gap-2" aria-hidden="true">
        {CARDS.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-qupu-brand-orange' : 'w-2 bg-qupu-peach'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => (isLast ? onContinue() : setIndex((i) => i + 1))}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isLast ? 'Lihat rencana belajar' : 'Lanjut'}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/MiniTour.tsx
git commit -m "feat(onboarding): add MiniTour feature highlights"
```

---

## Task 9: PlanReveal component

**Files:**
- Create: `src/components/onboarding/PlanReveal.tsx`

**Context:** Pure presentational + two callbacks. Persistence and navigation live in `Mulai.tsx`. Fires `demo_plan_viewed` once on mount. `subjects` is `SubjectOption[]` (`src/types/index.ts`); `quizCount` comes from `meta.stats.featuredVideos`.

- [ ] **Step 1: Create the component**

Create `src/components/onboarding/PlanReveal.tsx`:

```tsx
// src/components/onboarding/PlanReveal.tsx
import { useEffect } from 'react'
import { trackEvent } from '../../lib/analytics'
import type { SubjectOption } from '../../types'

interface PlanRevealProps {
  childName: string
  gradeName: string
  subjects: SubjectOption[]
  quizCount: number
  onSignup: () => void
  onSkip: () => void
}

export default function PlanReveal({
  childName,
  gradeName,
  subjects,
  quizCount,
  onSignup,
  onSkip,
}: PlanRevealProps) {
  useEffect(() => {
    trackEvent('demo_plan_viewed')
  }, [])

  const heading = childName
    ? `Rencana belajar ${childName}`
    : 'Rencana belajar siap!'

  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <span className="inline-block rounded-full bg-qupu-brand-yellow px-4 py-1 font-display text-xs font-black uppercase tracking-[0.18em] text-qupu-ink">
          {gradeName}
        </span>
        <h1 className="mt-3 font-display text-2xl font-black text-qupu-ink">{heading}</h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          {quizCount > 0
            ? `${quizCount}+ kuis siap dimainkan, plus latihan matematika WMI.`
            : 'Kuis seru dan latihan matematika WMI menanti.'}
        </p>
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {subjects.slice(0, 6).map((subject) => (
            <span
              key={subject.id}
              className="rounded-full px-4 py-2 font-display text-sm font-extrabold text-white"
              style={{ backgroundColor: subject.colorHex }}
            >
              {subject.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSignup}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <i className="fa-solid fa-rocket" aria-hidden="true" />
          Buat akun & mulai
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="font-semibold text-qupu-muted hover:text-qupu-brand-orange"
        >
          Nanti saja
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/PlanReveal.tsx
git commit -m "feat(onboarding): add PlanReveal personalized plan"
```

---

## Task 10: Mulai orchestrator page

**Files:**
- Create: `src/pages/Mulai.tsx`

**Context:** Owns the `/public/meta` fetch (shape: `{ subjects: SubjectOption[], ageGroups: AgeGroupOption[], stats: { featuredVideos: number } }` per `PublicMeta` in `src/types`). Falls back to `FALLBACK_GRADES` when the fetch fails or returns no age groups. Redirects authenticated users to `/dashboard` (same pattern as `HomeRoute` in `App.tsx`). Persists only a **real** ageGroupId (sentinel `fallback-*` ids are not persisted).

- [ ] **Step 1: Create the page**

Create `src/pages/Mulai.tsx`:

```tsx
// src/pages/Mulai.tsx
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { saveDemoSelections } from '../lib/demoStorage'
import {
  bandForAgeGroup,
  FALLBACK_GRADES,
  getDemoQuestions,
} from '../lib/demoQuestions'
import { useAuthStore } from '../store/authStore'
import type { AgeGroupOption, PublicMeta, SubjectOption } from '../types'
import ProgressDots from '../components/onboarding/ProgressDots'
import WhoStep from '../components/onboarding/WhoStep'
import SampleQuiz from '../components/onboarding/SampleQuiz'
import WinMoment from '../components/onboarding/WinMoment'
import MiniTour from '../components/onboarding/MiniTour'
import PlanReveal from '../components/onboarding/PlanReveal'

type Step = 'who' | 'quiz' | 'win' | 'tour' | 'plan'
const STEP_ORDER: Step[] = ['who', 'quiz', 'win', 'tour', 'plan']

export default function Mulai() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [step, setStep] = useState<Step>('who')
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>(FALLBACK_GRADES)
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [quizCount, setQuizCount] = useState(0)
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState<AgeGroupOption | null>(null)

  useEffect(() => {
    trackEvent('demo_started')
  }, [])

  useEffect(() => {
    let cancelled = false
    api
      .get('/public/meta')
      .then((response) => {
        if (cancelled) return
        const meta = response.data.data as PublicMeta
        if (meta.ageGroups?.length) setAgeGroups(meta.ageGroups)
        setSubjects(meta.subjects ?? [])
        setQuizCount(meta.stats?.featuredVideos ?? 0)
      })
      .catch(() => {
        // keep FALLBACK_GRADES; demo must run without the backend.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const questions = useMemo(
    () => getDemoQuestions(bandForAgeGroup(grade)),
    [grade],
  )

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function handleWhoSubmit(name: string, group: AgeGroupOption) {
    setChildName(name)
    setGrade(group)
    trackEvent('demo_grade_selected', { gradeName: group.name })
    setStep('quiz')
  }

  function handleSignup() {
    const realId = grade && !grade.id.startsWith('fallback-') ? grade.id : null
    saveDemoSelections({ childName, ageGroupId: realId })
    trackEvent('demo_signup_click')
    navigate('/register')
  }

  function handleSkip() {
    trackEvent('demo_skipped')
    navigate('/')
  }

  const currentIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[420px] flex-col gap-6 px-4 py-8">
      <ProgressDots total={STEP_ORDER.length} current={currentIndex} />

      {step === 'who' && <WhoStep ageGroups={ageGroups} onSubmit={handleWhoSubmit} />}
      {step === 'quiz' && (
        <SampleQuiz questions={questions} onComplete={() => setStep('win')} />
      )}
      {step === 'win' && <WinMoment onContinue={() => setStep('tour')} />}
      {step === 'tour' && <MiniTour onContinue={() => setStep('plan')} />}
      {step === 'plan' && (
        <PlanReveal
          childName={childName}
          gradeName={grade?.name ?? 'Kelas anak'}
          subjects={subjects}
          quizCount={quizCount}
          onSignup={handleSignup}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Mulai.tsx
git commit -m "feat(onboarding): add Mulai demo orchestrator page"
```

---

## Task 11: Route wiring

**Files:**
- Modify: `src/App.tsx` (import near line 32; route inside the marketing `Layout` group, around line 123)

- [ ] **Step 1: Add the import**

In `src/App.tsx`, add alongside the other page imports (e.g., after the `OnboardingChild` import at line 32):

```tsx
import Mulai from './pages/Mulai'
```

- [ ] **Step 2: Add the route**

Inside the marketing `<Route path="/" element={<Layout />}>` group, after the `register` route (line 123), add:

```tsx
<Route path="mulai" element={<Mulai />} />
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(onboarding): wire /mulai route"
```

---

## Task 12: Home hero CTA

**Files:**
- Modify: `src/pages/Home.tsx:162-179` (the hero CTA `<div>`)

**Context:** The hero CTA row currently holds "Tonton Sekarang" (→ `/videos`) and "Lihat Kategori". Add the new primary "Coba gratis — tanpa daftar" → `/mulai` as the **first** button so it leads. `Link` is already imported (line 2).

- [ ] **Step 1: Insert the new primary CTA**

In `src/pages/Home.tsx`, inside the CTA `<div className="flex flex-wrap gap-3 pt-2 sm:gap-4">` (line 162), add this as the first child, before the existing "Tonton Sekarang" `<Link>`:

```tsx
<Link
  to="/mulai"
  className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
>
  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
    <i className="fa-solid fa-wand-magic-sparkles text-base text-qupu-brand-orange" aria-hidden="true" />
  </span>
  Coba gratis — tanpa daftar
</Link>
```

> qupu-ui polish note: if three buttons crowd the hero on small screens, demote "Lihat Kategori" to a text link. Confirm visually during QA.

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat(onboarding): add 'Coba gratis' hero CTA to /mulai"
```

---

## Task 13: Pre-fill ChildForm

**Files:**
- Modify: `src/components/ChildForm.tsx:8-21` (props + initial state)

**Context:** `ChildForm` currently initializes `name` and `ageGroupId` to empty strings (lines 15-16). Add optional props so the demo selections can seed them. Fully backward compatible (defaults preserve current behavior).

- [ ] **Step 1: Add optional props**

In `src/components/ChildForm.tsx`, update the props interface (line 8):

```tsx
interface ChildFormProps {
  submitLabel: string
  onCreated: (child: Child) => void
  onError?: (message: string) => void
  initialName?: string
  initialAgeGroupId?: string
}
```

- [ ] **Step 2: Seed initial state from props**

Update the component signature and the two `useState` initializers (lines 14-17):

```tsx
export default function ChildForm({
  submitLabel,
  onCreated,
  onError,
  initialName = '',
  initialAgeGroupId = '',
}: ChildFormProps) {
  const [name, setName] = useState(initialName)
  const [ageGroupId, setAgeGroupId] = useState(initialAgeGroupId)
```

(Leave the rest of the component unchanged.)

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ChildForm.tsx
git commit -m "feat(onboarding): let ChildForm accept initial name + grade"
```

---

## Task 14: Wire pre-fill + analytics into OnboardingChild

**Files:**
- Modify: `src/pages/OnboardingChild.tsx` (whole file)

**Context:** Read demo selections, pass them to `ChildForm`, show a context line, and on successful creation clear the demo storage and fire `onboarding_child_created`. `readDemoSelections`/`clearDemoSelections` come from Task 2; `trackEvent` from `../lib/analytics`.

- [ ] **Step 1: Replace the file contents**

Replace `src/pages/OnboardingChild.tsx` with:

```tsx
// src/pages/OnboardingChild.tsx
import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import ChildForm from '../components/ChildForm'
import { trackEvent } from '../lib/analytics'
import { clearDemoSelections, readDemoSelections } from '../lib/demoStorage'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { children, activeChildId, addChild, setActiveChild } = useAuthStore()

  // Read once on mount so the form's initial state is seeded before render.
  const demo = useMemo(() => readDemoSelections(), [])

  useEffect(() => {
    if (children.length > 0 && activeChildId) {
      navigate('/dashboard', { replace: true })
    }
  }, [children, activeChildId, navigate])

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
    clearDemoSelections()
    trackEvent('onboarding_child_created')
    navigate('/dashboard', { replace: true })
  }

  const subtitle = demo?.childName
    ? `Lanjutkan rencana ${demo.childName}. Setiap anak punya progres dan koleksi badge sendiri.`
    : 'Setiap anak punya progres dan koleksi badge sendiri. Kamu bisa tambah lebih banyak profil kapan saja.'

  return (
    <AuthCard
      mascotSrc="/hero-mascot.png"
      eyebrow="Profil Anak"
      title="Tambah profil anak pertama"
      subtitle={subtitle}
      footer={
        <Link to="/dashboard" className="font-semibold hover:text-qupu-brand-orange">
          Lewati untuk sekarang
        </Link>
      }
    >
      <ChildForm
        submitLabel="Simpan dan mulai"
        onCreated={handleCreated}
        initialName={demo?.childName ?? ''}
        initialAgeGroupId={demo?.ageGroupId ?? ''}
      />
    </AuthCard>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OnboardingChild.tsx
git commit -m "feat(onboarding): pre-fill child profile from demo + track creation"
```

---

## Task 15: Full verification & manual QA

**Files:** none (verification only)

- [ ] **Step 1: Typecheck, lint, build**

Run: `npm run check && npm run lint && npm run build`
Expected: all PASS, no type/lint errors, clean Vite build.

- [ ] **Step 2: Manual QA via the webwright skill**

Start the dev server (`npm run dev`) and drive `/mulai` with the **webwright** skill. Verify each critical point with screenshot evidence:

- Visiting `/mulai` as a signed-out user shows the WhoStep (name + grade).
- Selecting each grade band (lower/middle/upper) shows the matching sample questions.
- Answering correctly shows green + "Tepat!"; answering wrong shows the right answer + "Hampir!" and never blocks progress.
- Completing the quiz shows the WinMoment with confetti (and **no** confetti when the OS "reduce motion" setting is on).
- The MiniTour steps through all 3 cards.
- PlanReveal shows "Rencana belajar <name>" (and a generic heading when name was left blank).
- "Buat akun & mulai" navigates to `/register`; after completing register + OTP, `/onboarding/child` is pre-filled with the demo name + grade.
- Creating the child clears demo storage (re-visiting `/onboarding/child` is no longer pre-filled).
- "Nanti saja" returns to `/`.
- A signed-in user visiting `/mulai` is redirected to `/dashboard`.
- The Home hero shows "Coba gratis — tanpa daftar" leading to `/mulai`.

- [ ] **Step 3: Final commit (if QA required any fixes)**

```bash
git add -A
git commit -m "fix(onboarding): QA fixes for demo-first flow"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** Routing/entry (Tasks 11-12) · `/mulai` steps WhoStep/SampleQuiz/WinMoment/MiniTour/PlanReveal (Tasks 5-10) · curated grade-banded questions + band mapping (Task 3) · demo storage + pre-fill + clear (Tasks 2, 13, 14) · analytics funnel (Tasks 1, 6-9, 10, 14) · reduced-motion + meta-fetch fallback + auth redirect (Tasks 7, 10) · QA incl. all edge cases (Task 15). The in-demo badge is intentionally non-persistent per the spec (WinMoment shows it; nothing writes it to the account).
- **Placeholder scan:** No TBD/TODO; every code step shows complete content.
- **Type consistency:** `DemoSelections`, `DemoQuestion`, `DemoBand`, `bandForAgeGroup`, `getDemoQuestions`, `FALLBACK_GRADES`, `saveDemoSelections`/`readDemoSelections`/`clearDemoSelections`, and `AnalyticsEventName` members are used consistently across Tasks 1-14. `AgeGroupOption`/`SubjectOption`/`PublicMeta` match `src/types/index.ts`.
