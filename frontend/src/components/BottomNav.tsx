import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export function BottomNav() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const profilePath = user
    ? `/users/${user.username.replace(/^@+/, '')}`
    : '/profile'

  return (
    <nav className="bottom-nav" aria-label={t('nav.label')}>
      <NavLink to="/" className="bottom-nav__link" end>
        <span className="bottom-nav__icon" aria-hidden>🏠</span>
        <span className="bottom-nav__label">{t('nav.home')}</span>
      </NavLink>
      <NavLink to="/discover" className="bottom-nav__link">
        <span className="bottom-nav__icon" aria-hidden>🔥</span>
        <span className="bottom-nav__label">{t('nav.discover')}</span>
      </NavLink>
      <NavLink to="/search" className="bottom-nav__link">
        <span className="bottom-nav__icon" aria-hidden>🔍</span>
        <span className="bottom-nav__label">{t('nav.search')}</span>
      </NavLink>
      <NavLink to={profilePath} className="bottom-nav__link">
        <span className="bottom-nav__icon" aria-hidden>👤</span>
        <span className="bottom-nav__label">{t('nav.profile')}</span>
      </NavLink>
    </nav>
  )
}
