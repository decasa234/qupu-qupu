// src/pages/MemberHome.tsx
//
// The bottom-bar "Home" tab (route /belajar). Renders the current gamemode's
// home: WMI -> the skill tree (BelajarPath), Video -> the video catalog/home
// (MemberVideos). Mode comes from wmiStore.learnMode (toggled by the top-bar
// badge or set by the Main world-chooser).
import { useWmiStore } from '../store/wmiStore'
import BelajarPath from './BelajarPath'
import MemberVideos from './MemberVideos'

export default function MemberHome() {
  const learnMode = useWmiStore((s) => s.learnMode)
  return learnMode === 'video' ? <MemberVideos /> : <BelajarPath />
}
