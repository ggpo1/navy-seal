import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useTranslation } from 'react-i18next'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicProfilePage } from './pages/PublicProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { SeaLionDetailPage } from './pages/SeaLionDetailPage'

function AppRoutes() {
  const { loading } = useAuth()
  const { t } = useTranslation()

  if (loading) {
    return <div className="loading-screen">{t('common.loading')}</div>
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="sealions/:id" element={<SeaLionDetailPage />} />
        <Route path="users/:username" element={<PublicProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
