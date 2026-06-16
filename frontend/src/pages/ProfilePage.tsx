import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { SeaLionDto } from '../api/types'
import { SeaLionCard } from '../components/SeaLionCard'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export function ProfilePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [seals, setSeals] = useState<SeaLionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    api.getMySeaLions()
      .then((response) => setSeals(response.items))
      .catch((e) => setError(e instanceof Error ? e.message : t('errors.loadFailed')))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className="profile profile--empty">
        <p>{t('profile.emptyTitle')}</p>
        <Link to="/login" className="btn btn--primary">{t('profile.emptyAction')}</Link>
      </div>
    )
  }

  return (
    <div className="profile">
      <header className="profile__header">
        <h1>{t('profile.title', { username: user.username.replace(/^@+/, '') })}</h1>
        <p>{user.email}</p>
        <span className="profile__count">
          {t('profile.countSeal', { count: seals.length })}
        </span>
      </header>

      {loading && <p>{t('profile.loading')}</p>}
      {error && <p className="error">{error}</p>}

      {!loading && seals.length === 0 && (
        <div className="profile__empty">
          <p>{t('profile.noSealsTitle')}</p>
          <Link to="/" className="btn btn--primary">{t('profile.noSealsAction')}</Link>
        </div>
      )}

      <div className="profile__grid">
        {seals.map((seal) => (
          <SeaLionCard key={seal.id} seal={seal} />
        ))}
      </div>
    </div>
  )
}
