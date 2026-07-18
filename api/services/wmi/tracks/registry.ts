// All registered learning tracks. BROWSER-SAFE (see types.ts).
import type { TrackDef } from './types.js'
import wmiGrade1 from './wmi-grade-1.js'

export const TRACKS: readonly TrackDef[] = [wmiGrade1]

export function getTrack(id: string): TrackDef | undefined {
  return TRACKS.find((t) => t.id === id)
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
