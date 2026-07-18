// src/components/wmi/path/pathState.ts
//
// Shared node-state logic for the Belajar skill-tree path, kept out of the
// component files so both PathTrail and ChapterSheet can import it without a
// react-refresh "non-component export" warning.

import type { PathNodeState } from './PathNode'
import type { WmiGardenChapter } from '../../../types/wmi'

// Boss = the chapter's Tes Bab, mirroring ChapterGarden's source of truth:
// passed when chapter.testedOut; tappable ("current") when the chapter is
// locked (the test IS the unlock shortcut), fully grown (final challenge),
// or holds the kid's current node (they may take the test early); otherwise
// dormant while the kid grows the concepts.
export function bossState(chapter: WmiGardenChapter, hasCurrentNode = false): PathNodeState {
  if (chapter.testedOut) return 'open'
  if (!chapter.unlocked) return 'current'
  if (chapter.total > 0 && chapter.grownCount >= chapter.total) return 'current'
  if (hasCurrentNode) return 'current'
  return 'locked'
}
