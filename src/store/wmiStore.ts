import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchGlossary } from '../lib/wmiApi'
import type { WmiGlossaryTerm, WmiGrade } from '../types/wmi'

interface WmiState {
  // Resolved grade for the active child. Consumers keep reading/writing this
  // exactly as before (WmiHub, WmiPapers, WmiKonsepDrill...).
  selectedGrade: WmiGrade
  // Child the store is currently resolved for (set by syncChildGrade; not
  // persisted — AppShell re-syncs on mount/child switch/rehydration).
  activeChildKey: string | null
  // Per-child manual grade picks — persisted. Inference never writes here;
  // only an explicit setSelectedGrade (grade chip tap) pins a child's grade.
  gradeByChild: Record<string, WmiGrade>
  // Per-child last started session subject — persisted (resume block, M2).
  lastSubjectKeyByChild: Record<string, string>
  // Resolved lastSubjectKey for the active child (mirror, not persisted).
  lastSubjectKey: string | null
  glossary: Record<string, WmiGlossaryTerm>
  glossaryLoaded: boolean
  setSelectedGrade: (grade: WmiGrade) => void
  // Pin a grade for a specific child (not necessarily the resolved/active
  // one) — used by onboarding right after creating a child, before AppShell's
  // syncChildGrade effect has run for the new id. The persisted pin then wins
  // over inference on every later sync.
  pinGradeForChild: (childId: string, grade: WmiGrade) => void
  syncChildGrade: (childId: string, inferredGrade: WmiGrade) => void
  setLastSubjectKey: (subjectKey: string) => void
  loadGlossary: () => Promise<void>
}

export const useWmiStore = create<WmiState>()(
  persist(
    (set, get) => ({
      selectedGrade: 1,
      activeChildKey: null,
      gradeByChild: {},
      lastSubjectKeyByChild: {},
      lastSubjectKey: null,
      glossary: {},
      glossaryLoaded: false,
      setSelectedGrade: (grade) =>
        set((state) => ({
          selectedGrade: grade,
          // Only grades 1-3 are garden grades. Grade 0 exists solely for the
          // papers page (TK papers) — picking it there must not pin the
          // child's garden to an empty grade-0 landing.
          gradeByChild:
            state.activeChildKey && grade >= 1 && grade <= 3
              ? { ...state.gradeByChild, [state.activeChildKey]: grade }
              : state.gradeByChild,
        })),
      pinGradeForChild: (childId, grade) =>
        set((state) => ({
          gradeByChild: { ...state.gradeByChild, [childId]: grade },
          ...(state.activeChildKey === childId ? { selectedGrade: grade } : {}),
        })),
      syncChildGrade: (childId, inferredGrade) =>
        set((state) => ({
          activeChildKey: childId,
          selectedGrade: state.gradeByChild[childId] ?? inferredGrade,
          lastSubjectKey: state.lastSubjectKeyByChild[childId] ?? null,
        })),
      setLastSubjectKey: (subjectKey) =>
        set((state) =>
          state.activeChildKey
            ? {
                lastSubjectKey: subjectKey,
                lastSubjectKeyByChild: {
                  ...state.lastSubjectKeyByChild,
                  [state.activeChildKey]: subjectKey,
                },
              }
            : { lastSubjectKey: subjectKey },
        ),
      loadGlossary: async () => {
        if (get().glossaryLoaded) return
        const terms = await fetchGlossary()
        set({
          glossaryLoaded: true,
          glossary: Object.fromEntries(terms.map((term) => [term.slug, term])),
        })
      },
    }),
    {
      name: 'wmi-prefs',
      partialize: (state) => ({
        gradeByChild: state.gradeByChild,
        lastSubjectKeyByChild: state.lastSubjectKeyByChild,
      }),
    },
  ),
)
