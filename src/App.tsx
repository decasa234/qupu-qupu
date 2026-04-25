import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetailPage from './pages/VideoDetail'
import VideosPage from './pages/Videos'
import DashboardPage from './pages/Dashboard'
import BadgesPage from './pages/Badges'
import AdminVideosPage from './pages/AdminVideos'
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
                <DashboardPage />
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
            path="admin/videos"
            element={
              <AdminRoute>
                <AdminVideosPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
