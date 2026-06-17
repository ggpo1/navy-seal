import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export function ProfileAuthSection() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  if (user) {
    return (
      <section className="profile__account" aria-label={t('profile.account')}>
        <button type="button" className="btn btn--ghost profile__logout" onClick={logout}>
          {t('auth.logout')}
        </button>
      </section>
    )
  }

  return (
    <section className="profile__account" aria-label={t('profile.account')}>
      <div className="profile__account-actions">
        <Link to="/login" className="btn btn--primary">
          {t('auth.login')}
        </Link>
        <Link to="/register" className="btn btn--ghost">
          {t('auth.register')}
        </Link>
      </div>
    </section>
  )
}
