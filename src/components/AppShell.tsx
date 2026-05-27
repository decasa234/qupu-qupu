// src/components/AppShell.tsx
//
// Member-route chrome. Replaces <Layout> for /dashboard /shop /badges
// /report /me. Mobile-first phone-shell layout: sticky top stats, scrollable
// body, sticky bottom nav. Survives at any width — desktop polish (left rail)
// is deliberately deferred.
import { Outlet } from 'react-router-dom'
import TopStatStrip from './app-shell/TopStatStrip'
import BottomTabBar from './app-shell/BottomTabBar'

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-qupu-shell">
      <TopStatStrip />
      <main className="flex w-full flex-1 flex-col px-4 py-4">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
