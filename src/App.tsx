import { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import CookieConsentBanner from './components/CookieConsentBanner'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetailPage from './pages/VideoDetail'
import VideosPage from './pages/Videos'
import MemberVideosPage from './pages/MemberVideos'
import QuizPage from './pages/Quiz'
import DashboardPage from './pages/Dashboard'
import ReportPage from './pages/Report'
import BadgesPage from './pages/Badges'
import LatihanHubPage from './pages/LatihanHub'
import WmiHubPage from './pages/WmiHub'
import WmiPapersPage from './pages/WmiPapers'
import WmiDrillPage from './pages/WmiDrill'
import WmiPaperDetailPage from './pages/WmiPaperDetail'
import WmiExamPage from './pages/WmiExam'
import WmiExamReviewPage from './pages/WmiExamReview'
import WmiKonsepDrill from './pages/WmiKonsepDrill'
import WmiChapterTest from './pages/WmiChapterTest'
import AdminVideosPage from './pages/AdminVideos'
import AdminDashboardPage from './pages/admin/AdminDashboard'
import AdminSubjectsPage from './pages/admin/AdminSubjects'
import AdminAgeGroupsPage from './pages/admin/AdminAgeGroups'
import AdminUsersPage from './pages/admin/AdminUsers'
import AdminAnalyticsPage from './pages/admin/AdminAnalytics'
import AdminImportVideosPage from './pages/admin/AdminImportVideos'
import AdminWmiConceptsPage from './pages/admin/AdminWmiConcepts'
import AdminWmiDrillPage from './pages/admin/AdminWmiDrill'
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

function HomeRoute() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <Home />
}

function DashboardRouter() {
  const { user } = useAuthStore()
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <DashboardPage />
}

// The inline boot splash (#qupu-splash in index.html) is the only loader:
// it covers the initial HTML -> React handoff on first page load, then fades
// out once React has mounted and painted the first route. Pages own their own
// loading states (skeletons) from there on. A 10s safety dismisses it
// regardless, in case the first paint never lands.
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

    // This effect runs after the first route has committed to the DOM, so the
    // page is already painted underneath the splash. Fade it on the next frame.
    const raf = window.requestAnimationFrame(dismiss)
    const safety = window.setTimeout(dismiss, SPLASH_SAFETY_MS)

    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(safety)
    }
  }, [])
}

export default function App() {
  useDismissBootSplash()

  return (
    <Router>
      <CookieConsentBanner />
      <Routes>
        {/* Marketing + auth + video + onboarding — keep marketing Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="videos/:slug" element={<VideoDetailPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Onboarding — full-screen, no chrome, locked until completed */}
        <Route
          path="/onboard/child"
          element={
            <ProtectedRoute>
              <OnboardingChild />
            </ProtectedRoute>
          }
        />

        {/* Member routes — wrapped in AppShell (sticky stat strip + bottom nav) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="library" element={<MemberVideosPage />} />
          <Route path="quiz/:slug" element={<QuizPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="me" element={<MePage />} />
          <Route path="latihan" element={<LatihanHubPage />} />
          <Route path="latihan/wmi" element={<WmiHubPage />} />
          <Route path="latihan/wmi/ujian" element={<WmiPapersPage />} />
          <Route path="latihan/wmi/drill" element={<WmiDrillPage />} />
          <Route path="latihan/wmi/konsep" element={<WmiKonsepDrill />} />
          <Route path="latihan/wmi/papers/:id" element={<WmiPaperDetailPage />} />
          <Route path="latihan/wmi/exam/:sessionId" element={<WmiExamPage />} />
          <Route path="latihan/wmi/exam/:sessionId/review" element={<WmiExamReviewPage />} />
          <Route path="latihan/wmi/tes/:subjectKey" element={<WmiChapterTest />} />
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
          <Route path="wmi-concepts" element={<AdminWmiConceptsPage />} />
          <Route path="wmi-drill" element={<AdminWmiDrillPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
