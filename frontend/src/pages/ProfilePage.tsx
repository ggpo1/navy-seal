import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { ProfileAuthSection } from '../components/ProfileAuthSection'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user) {
      navigate(`/users/${user.username.replace(/^@+/, '')}`, { replace: true })
    }
  }, [user, navigate])

  if (!user) {
    return (
      <div className="profile profile--empty">
        <h1>{t('profile.emptyTitle')}</h1>
        <p className="profile__empty-hint">{t('profile.emptyHint')}</p>
        <ProfileAuthSection />
      </div>
    )
  }

  return <p className="profile__loading">{t('profile.loading')}</p>
}
