import { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingOverlay from './components/LoadingOverlay'
import { useLoadingState } from './hooks/useLoadingState'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetailPage from './pages/VideoDetail'
import VideosPage from './pages/Videos'
import DashboardPage from './pages/Dashboard'
import ReportPage from './pages/Report'
import BadgesPage from './pages/Badges'
import WmiHubPage from './pages/WmiHub'
import WmiDrillPage from './pages/WmiDrill'
import WmiPaperDetailPage from './pages/WmiPaperDetail'
import WmiExamPage from './pages/WmiExam'
import WmiExamReviewPage from './pages/WmiExamReview'
import AdminVideosPage from './pages/AdminVideos'
import AdminDashboardPage from './pages/admin/AdminDashboard'
import AdminSubjectsPage from './pages/admin/AdminSubjects'
import AdminAgeGroupsPage from './pages/admin/AdminAgeGroups'
import AdminUsersPage from './pages/admin/AdminUsers'
import AdminAnalyticsPage from './pages/admin/AdminAnalytics'
import AdminImportVideosPage from './pages/admin/AdminImportVideos'
import OnboardingChild from './pages/OnboardingChild'
import AppShell from './components/AppShell'
import ShopPage from './pages/Shop'
import MePage from './pages/Me'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function RouteLoadingTrigger() {
  const location = useLocation()
  useEffect(() => {
    useLoadingState.getState().start()
    let stopped = false
    const stopOnce = () => {
      if (stopped) return
      stopped = true
      useLoadingState.getState().stop()
    }
    const t = window.setTimeout(stopOnce, 50)
    return () => {
      window.clearTimeout(t)
      stopOnce()
    }
  }, [location.pathname])
  return null
}

function DashboardRouter() {
  const { user } = useAuthStore()
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <DashboardPage />
}

// Boot splash dismisses when the React LoadingOverlay is ready to take
// over — specifically when useLoadingState.visible first flips to false
// (i.e. all in-flight work has settled + the 500ms tail). This avoids
// the "two loaders" effect where the splash hides on its own fixed
// timer while the React overlay is still showing (or vice versa).
// A 10s safety dismisses the splash regardless, in case the loading
// state never settles.
const SPLASH_SAFETY_MS = 10000

function useDismissBootSplash() {
  useEffect(() => {
    const splash = document.getElementById('qupu-splash')
    if (!splash) return

    let dismissed = false
    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      splash.classList.add('qupu-splash--hidden')
      window.setTimeout(() => splash.remove(), 500)
    }

    const unsubscribe = useLoadingState.subscribe((state) => {
      if (!state.visible) dismiss()
    })
    const safety = window.setTimeout(dismiss, SPLASH_SAFETY_MS)

    return () => {
      unsubscribe()
      window.clearTimeout(safety)
    }
  }, [])
}

export default function App() {
  useDismissBootSplash()

  return (
    <Router>
      <RouteLoadingTrigger />
      <LoadingOverlay />
      <Routes>
        {/* Marketing + auth + video + onboarding — keep marketing Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="videos/:slug" element={<VideoDetailPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="onboarding/child"
            element={
              <ProtectedRoute>
                <OnboardingChild />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Member routes — wrapped in AppShell (sticky stat strip + bottom nav) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="me" element={<MePage />} />
          <Route path="latihan/wmi" element={<WmiHubPage />} />
          <Route path="latihan/wmi/drill" element={<WmiDrillPage />} />
          <Route path="latihan/wmi/papers/:id" element={<WmiPaperDetailPage />} />
          <Route path="latihan/wmi/exam/:sessionId" element={<WmiExamPage />} />
          <Route path="latihan/wmi/exam/:sessionId/review" element={<WmiExamReviewPage />} />
        </Route>

        {/* Admin — untouched */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="videos" element={<AdminVideosPage />} />
          <Route path="videos/import" element={<AdminImportVideosPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="age-groups" element={<AdminAgeGroupsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
