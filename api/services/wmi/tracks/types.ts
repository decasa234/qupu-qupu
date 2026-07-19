// Learning-track registry types. BROWSER-SAFE: no pg / Node imports — the
// frontend imports this module directly (like olympiads/registry.ts).
// Spec: docs/superpowers/specs/2026-07-18-learning-track-engine-design.md

export type TrackMode = 'wmi' // 'basic-math' arrives with its first track
export type TrackStatus = 'draft' | 'review' | 'published'
export type ThemeKey = 'forest' // 'ocean' | 'zoo' arrive with their packs (Plan 2)

export interface ConceptNode {
  kind: 'concept'
  slug: string
}

// Synthesis boss: a real WMI past-paper problem. Attemptable as soon as its
// unit is open (test-out — passing unlocks the next unit); `requires` lists
// the concepts the problem draws on, shown as guidance in the UI.
export interface GateNode {
  kind: 'gate'
  /** Stable per-track key — gate clears are stored against it. */
  key: string
  /** Past-paper reference: `${paperCode}#${questionNumber}`, e.g. 'WMI-21F1A#7'. */
  problemRef: string
  /** Concept slugs (from anywhere EARLIER in the spine) this problem decomposes into. */
  requires: readonly string[]
}

export type TrackNode = ConceptNode | GateNode

export interface TrackUnit {
  key: string
  nameId: string
  nameEn: string
  colorHex: string
  /** Font Awesome 6 free icon name, without the `fa-` prefix (house style). */
  iconKey: string
  nodes: readonly TrackNode[]
}

export interface TrackDef {
  id: string
  mode: TrackMode
  grade: 1 | 2 | 3
  status: TrackStatus
  theme: ThemeKey
  nameId: string
  nameEn: string
  units: readonly TrackUnit[]
}
