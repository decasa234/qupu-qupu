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
