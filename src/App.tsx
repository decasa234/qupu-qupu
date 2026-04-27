import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetailPage from './pages/VideoDetail'
import VideosPage from './pages/Videos'
import DashboardPage from './pages/Dashboard'
import BadgesPage from './pages/Badges'
import AdminVideosPage from './pages/AdminVideos'
import AdminDashboardPage from './pages/admin/AdminDashboard'
import AdminSubjectsPage from './pages/admin/AdminSubjects'
import AdminAgeGroupsPage from './pages/admin/AdminAgeGroups'
import AdminUsersPage from './pages/admin/AdminUsers'
import AdminAnalyticsPage from './pages/admin/AdminAnalytics'
import OnboardingChild from './pages/OnboardingChild'
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

function DashboardRouter() {
  const { user } = useAuthStore()
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <DashboardPage />
}

export default function App() {
  return (
    <Router>
      <Routes>
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
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="badges"
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="videos" element={<AdminVideosPage />} />
            <Route path="subjects" element={<AdminSubjectsPage />} />
            <Route path="age-groups" element={<AdminAgeGroupsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
