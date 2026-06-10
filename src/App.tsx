import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import CookieConsentBanner from './components/CookieConsentBanner'
import Layout from './components/Layout'
import RouteFallback from './components/RouteFallback'
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
import WmiKonsepDrill from './pages/WmiKonsepDrill'
import WmiKonsepSession from './pages/WmiKonsepSession'
import WmiChapterTest from './pages/WmiChapterTest'
import OnboardingChild from './pages/OnboardingChild'
import AppShell from './components/AppShell'
import ShopPage from './pages/Shop'
import MePage from './pages/Me'
import { resolvePostLoginRoute } from './lib/postLoginRoute'
import { useAuthStore } from './store/authStore'

// Lazy boundaries — keep the member core (garden/session/drill/dashboard/Me)
// eager: it's the post-login hot path and must never flash a route spinner.
// Marketing heavies (WMI demo pages pull the explainer stack), the exam stack,
// and the entire admin subtree load on demand.
const LatihanWmiPage = lazy(() => import('./pages/LatihanWmi'))
const HargaPage = lazy(() => import('./pages/Harga'))
const PrivasiPage = lazy(() => import('./pages/Privasi'))
const KetentuanPage = lazy(() => import('./pages/Ketentuan'))
const WmiPapersPage = lazy(() => import('./pages/WmiPapers'))
const WmiPaperDetailPage = lazy(() => import('./pages/WmiPaperDetail'))
const WmiExamPage = lazy(() => import('./pages/WmiExam'))
const WmiExamReviewPage = lazy(() => import('./pages/WmiExamReview'))
const AdminLayout = lazy(() => import('./components/AdminLayout'))
const AdminVideosPage = lazy(() => import('./pages/AdminVideos'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminSubjectsPage = lazy(() => import('./pages/admin/AdminSubjects'))
const AdminAgeGroupsPage = lazy(() => import('./pages/admin/AdminAgeGroups'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsers'))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminImportVideosPage = lazy(() => import('./pages/admin/AdminImportVideos'))
const AdminWmiConceptsPage = lazy(() => import('./pages/admin/AdminWmiConcepts'))
const AdminWmiDrillPage = lazy(() => import('./pages/admin/AdminWmiDrill'))

// Wraps a lazy page in Suspense at its render position (the layout's outlet),
// so the surrounding chrome stays put while the chunk loads.
function suspended(node: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

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
  const { isAuthenticated, user, children } = useAuthStore()
  if (isAuthenticated) {
    // Members land in the WMI garden; admins on the admin dashboard;
    // members without a child profile go finish onboarding first.
    return <Navigate to={resolvePostLoginRoute(user?.role ?? '', children.length)} replace />
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
          <Route path="wmi" element={suspended(<LatihanWmiPage />)} />
          <Route path="harga" element={suspended(<HargaPage />)} />
          <Route path="privasi" element={suspended(<PrivasiPage />)} />
          <Route path="ketentuan" element={suspended(<KetentuanPage />)} />
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
          <Route path="latihan/wmi/ujian" element={suspended(<WmiPapersPage />)} />
          <Route path="latihan/wmi/konsep" element={<WmiKonsepDrill />} />
          <Route path="latihan/wmi/papers/:id" element={suspended(<WmiPaperDetailPage />)} />
          <Route path="latihan/wmi/exam/:sessionId" element={suspended(<WmiExamPage />)} />
          <Route path="latihan/wmi/exam/:sessionId/review" element={suspended(<WmiExamReviewPage />)} />
          <Route path="latihan/wmi/tes/:subjectKey" element={<WmiChapterTest />} />
          <Route path="latihan/wmi/sesi/:subjectKey" element={<WmiKonsepSession />} />
        </Route>

        {/* Admin — one lazy boundary for the whole subtree (layout + pages) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminLayout />
              </Suspense>
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
