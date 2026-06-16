import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

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
        <p>{t('profile.emptyTitle')}</p>
        <Link to="/login" className="btn btn--primary">{t('profile.emptyAction')}</Link>
      </div>
    )
  }

  return <p className="profile__loading">{t('profile.loading')}</p>
}
