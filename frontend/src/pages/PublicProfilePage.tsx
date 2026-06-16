import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { PublicUserProfileDto } from '../api/types'
import { SeaLionCard } from '../components/SeaLionCard'
import { useAuth } from '../context/AuthContext'
import { formatUsernameLabel } from '../utils/username'

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<PublicUserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return

    setLoading(true)
    setError(null)

    api.getUserProfile(username)
      .then(setProfile)
      .catch((e) => {
        setProfile(null)
        setError(e instanceof Error ? e.message : t('errors.loadFailed'))
      })
      .finally(() => setLoading(false))
  }, [username, t])

  if (loading) {
    return <p className="profile__loading">{t('profile.loading')}</p>
  }

  if (!profile) {
    return (
      <div className="profile profile--empty">
        <p>{error ?? t('profile.notFound')}</p>
        <Link to="/" className="btn btn--primary">{t('detail.backHome')}</Link>
      </div>
    )
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="profile">
      <header className="profile__header">
        <h1>{t('profile.publicTitle', { username: profile.username })}</h1>
        <p className="profile__username">{formatUsernameLabel(profile.username)}</p>
        {isOwnProfile && user && <p>{user.email}</p>}
        <span className="profile__count">
          {t('profile.countSeal', { count: profile.sealCount })}
        </span>
      </header>

      {profile.seals.length === 0 ? (
        <div className="profile__empty">
          <p>{t('profile.noSealsPublic')}</p>
        </div>
      ) : (
        <div className="profile__grid">
          {profile.seals.map((seal) => (
            <SeaLionCard key={seal.id} seal={seal} showStats />
          ))}
        </div>
      )}
    </div>
  )
}
