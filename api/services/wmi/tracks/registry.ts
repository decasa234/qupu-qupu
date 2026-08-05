// All registered learning tracks. BROWSER-SAFE (see types.ts).
import type { TrackDef, TrackMode } from './types.js'
import wmiGrade1 from './wmi-grade-1.js'
import wmiGrade2 from './wmi-grade-2.js'
import wmiGrade3 from './wmi-grade-3.js'

export const TRACKS: readonly TrackDef[] = [wmiGrade1, wmiGrade2, wmiGrade3]

export function getTrack(id: string): TrackDef | undefined {
  return TRACKS.find((t) => t.id === id)
}

/** First `tracks` entry matching mode+grade with status === 'published'. */
export function findPublishedTrack(
  tracks: readonly TrackDef[],
  mode: TrackMode,
  grade: number,
): TrackDef | undefined {
  return tracks.find((t) => t.mode === mode && t.grade === grade && t.status === 'published')
}

/** Live cutover switch: the published track (if any) for a mode+grade — see TRACKS. */
export function getPublishedTrack(mode: TrackMode, grade: number): TrackDef | undefined {
  return findPublishedTrack(TRACKS, mode, grade)
}

/** Concept slugs in the order a child meets them walking the spine. */
export function conceptSlugsInSpineOrder(track: TrackDef): string[] {
  const slugs: string[] = []
  for (const unit of track.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'concept') slugs.push(node.slug)
    }
  }
  return slugs
}
