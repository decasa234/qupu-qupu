// src/pages/MemberHome.tsx
//
// The bottom-bar "Home" tab (route /belajar). Renders the current gamemode's
// home: WMI -> the skill tree (BelajarPath) or, once a track for the child's
// grade is published, the new TrackMap engine — Video -> the video
// catalog/home (MemberVideos). Mode comes from wmiStore.learnMode (toggled by
// the top-bar badge or set by the Main world-chooser).
//
// Dark cutover (Plan 3 Task 6): getPublishedTrack('wmi', grade) is undefined
// until a track is actually flipped to 'published' in the registry, so this
// branch is unreachable today — BelajarPath keeps rendering exactly as
// before. Grade resolution mirrors BelajarPath.tsx byte-for-byte (same
// stores, same clamp) so the two never disagree about which grade a child is on.
import { getPublishedTrack } from '../../api/services/wmi/tracks/registry'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import BelajarPath from './BelajarPath'
import MemberVideos from './MemberVideos'
import TrackMap from './TrackMap'
import type { WmiGrade } from '../types/wmi'

// Garden grades are 1-3 only (grade 0 exists just for the papers page).
// Mirrors BelajarPath.tsx's clampGardenGrade — kept local (not imported) per
// task brief so BelajarPath stays free to evolve its own grade handling.
function clampGardenGrade(grade: WmiGrade): WmiGrade {
  return grade < 1 ? 1 : grade > 3 ? 3 : grade
}

export default function MemberHome() {
  const { learnMode, selectedGrade, gradeByChild } = useWmiStore()
  const { activeChildId } = useAuthStore()

  if (learnMode === 'video') return <MemberVideos />

  const pinnedGrade = activeChildId ? gradeByChild[activeChildId] : undefined
  const effectiveGrade = clampGardenGrade(pinnedGrade ?? selectedGrade)
  const published = getPublishedTrack('wmi', effectiveGrade)

  return published ? <TrackMap trackId={published.id} /> : <BelajarPath />
}
