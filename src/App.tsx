import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CookieConsentBanner from './components/CookieConsentBanner'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import RouteFallback from './components/RouteFallback'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetailPage from './pages/VideoDetail'
import VideosPage from './pages/Videos'
import MemberVideosPage from './pages/MemberVideos'
import QuizPage from './pages/Quiz'
import BadgesPage from './pages/Badges'
import MainCatalogPage from './pages/MainCatalog'
import WmiArenaPage from './pages/WmiArena'
import MemberHome from './pages/MemberHome'
import WmiKonsepDrill from './pages/WmiKonsepDrill'
import WmiKonsepSession from './pages/WmiKonsepSession'
import WmiChapterTest from './pages/WmiChapterTest'
import OnboardingChild from './pages/OnboardingChild'
import AppShell from './components/AppShell'
import ShopPage from './pages/Shop'
import MePage from './pages/Me'
import StreakPage from './pages/StreakPage'
import { resolvePostLoginRoute } from './lib/postLoginRoute'
import { useAuthStore } from './store/authStore'

// Admin-only deployment variant: set VITE_ADMIN_ONLY=true at build time
// (e.g. the admin.qupu.id Vercel project) to lock the entire app behind an
// admin login. NOT a security boundary — the API enforces auth server-side;
// this only keeps the admin deploy's surface clean. Production builds leave
// the flag unset and behave normally.
const ADMIN_ONLY = import.meta.env.VITE_ADMIN_ONLY === 'true'

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
// Parent dashboard pulls the full Dashboard + Report stacks — lazy, and
// mounted OUTSIDE AppShell (no kid tab bar, PIN-locked inside the page).
const ParentDashboardPage = lazy(() => import('./pages/parent/ParentDashboard'))
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

// When ADMIN_ONLY is set, every route except /login requires an authenticated
// user with role 'admin' — including the marketing landing pages, which admins
// can still browse after signing in. Members and anonymous visitors are always
// sent to /login. With the flag off this renders children untouched.
function AdminOnlyGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()

  if (!ADMIN_ONLY || location.pathname === '/login') {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center ring-2 ring-[#FFE3CC] [box-shadow:0_6px_0_#FFD3B1]">
          <i className="fa-solid fa-user-shield mb-4 text-4xl text-[#F59E0B]" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold text-slate-800">Akses khusus admin</h1>
          <p className="mt-2 text-sm text-slate-500">
            Halaman ini hanya bisa diakses oleh akun admin QUPU.
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-6 w-full rounded-2xl bg-[#F59E0B] px-4 py-3 font-display font-bold text-white transition hover:brightness-105"
          >
            Keluar
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
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
    return <Navigate to="/belajar" replace />
  }

  return <>{children}</>
}

function HomeRoute() {
  const { isAuthenticated, user, children } = useAuthStore()
  // Admin-only deploys let admins browse the landing page — no redirect
  // (the gate guarantees whoever reaches "/" is an admin).
  if (ADMIN_ONLY) {
    return <Home />
  }
  if (isAuthenticated) {
    // Members land in the WMI garden; admins on the admin dashboard;
    // members without a child profile go finish onboarding first.
    return <Navigate to={resolvePostLoginRoute(user?.role ?? '', children.length)} replace />
  }
  return <Home />
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
      {/* Top-level boundary: a route-level render crash shows the friendly
          Indonesian reload card instead of a white screen. */}
      <ErrorBoundary scope="app">
        <AdminOnlyGate>
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

          {/* Parent dashboard — full-screen, outside AppShell (no kid tab
              bar); PIN gate + re-lock-on-leave live inside the page. */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute>
                {suspended(<ParentDashboardPage />)}
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
            {/* 3-tab structure: Belajar (skill tree) / Main (arena) / Profil */}
            <Route path="belajar" element={<MemberHome />} />
            <Route path="main" element={<MainCatalogPage />} />
            <Route path="wmi-arena" element={<WmiArenaPage />} />
            <Route path="wmi-arena/campur" element={<WmiKonsepDrill />} />
            <Route path="video" element={<MemberVideosPage />} />
            <Route path="profil" element={<MePage />} />
            <Route path="streak" element={<StreakPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="quiz/:slug" element={<QuizPage />} />
            <Route path="latihan/wmi/ujian" element={suspended(<WmiPapersPage />)} />
            <Route path="latihan/wmi/papers/:id" element={suspended(<WmiPaperDetailPage />)} />
            <Route path="latihan/wmi/exam/:sessionId" element={suspended(<WmiExamPage />)} />
            <Route path="latihan/wmi/exam/:sessionId/review" element={suspended(<WmiExamReviewPage />)} />
            <Route path="latihan/wmi/tes/:subjectKey" element={<WmiChapterTest />} />
            <Route path="latihan/wmi/sesi/:subjectKey" element={<WmiKonsepSession />} />

            {/* Old standalone pages now live inside /parent */}
            <Route path="dashboard" element={<Navigate to="/parent" replace />} />
            <Route path="report" element={<Navigate to="/parent" replace />} />

            {/* Legacy paths → new canonical paths */}
            <Route path="latihan/wmi" element={<Navigate to="/belajar" replace />} />
            <Route path="latihan" element={<Navigate to="/main" replace />} />
            <Route path="latihan/wmi/konsep" element={<Navigate to="/wmi-arena/campur" replace />} />
            <Route path="library" element={<Navigate to="/video" replace />} />
            <Route path="me" element={<Navigate to="/profil" replace />} />
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
        </AdminOnlyGate>
      </ErrorBoundary>
    </Router>
  )
}
