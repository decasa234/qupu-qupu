// Pure curriculum validator (spec §Domain model). Deps are injected so this
// stays browser-safe; CI wires the real registries, the Postgres suite wires
// live problemRef resolution. Returns [] when valid.
import type { TrackDef } from './types.js'

export interface ValidatorDeps {
  conceptExists(slug: string): boolean
  conceptHasLevels(slug: string): boolean
  problemRefExists(ref: string): boolean
}

const PROBLEM_REF = /^[^#\s]+#\d+$/

export function validateTrack(track: TrackDef, deps: ValidatorDeps): string[] {
  const errors: string[] = []
  const seenConcepts = new Set<string>()
  const seenGateKeys = new Set<string>()

  for (const unit of track.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'concept') {
        if (seenConcepts.has(node.slug)) {
          errors.push(`duplicate concept '${node.slug}' in track '${track.id}'`)
        }
        if (!deps.conceptExists(node.slug)) {
          errors.push(`unknown concept '${node.slug}' in track '${track.id}'`)
        } else if (!deps.conceptHasLevels(node.slug)) {
          errors.push(`concept '${node.slug}' has no level generation (5-level ladder required)`)
        }
        seenConcepts.add(node.slug)
      } else {
        if (seenGateKeys.has(node.key)) {
          errors.push(`duplicate gate key '${node.key}' in track '${track.id}'`)
        }
        seenGateKeys.add(node.key)
        if (!PROBLEM_REF.test(node.problemRef) || !deps.problemRefExists(node.problemRef)) {
          errors.push(`gate '${node.key}': unresolvable problemRef '${node.problemRef}'`)
        }
        for (const req of node.requires) {
          if (!seenConcepts.has(req)) {
            errors.push(
              `gate '${node.key}': requires '${req}' which does not appear earlier in the spine`,
            )
          }
        }
      }
    }
  }
  return errors
}
