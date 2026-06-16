import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { SeaLionDto } from '../api/types'
import { SeaLionCard } from '../components/SeaLionCard'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()
  const [seals, setSeals] = useState<SeaLionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    api.getMySeaLions()
      .then((response) => setSeals(response.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className="profile profile--empty">
        <p>Войдите, чтобы увидеть свой профиль</p>
        <Link to="/login" className="btn btn--primary">Войти</Link>
      </div>
    )
  }

  return (
    <div className="profile">
      <header className="profile__header">
        <h1>Профиль @{user.username}</h1>
        <p>{user.email}</p>
        <span className="profile__count">
          {seals.length} {pluralize(seals.length, 'котик', 'котика', 'котиков')}
        </span>
      </header>

      {loading && <p>Загрузка...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && seals.length === 0 && (
        <div className="profile__empty">
          <p>У вас пока нет морских котиков</p>
          <Link to="/" className="btn btn--primary">Сгенерировать первого</Link>
        </div>
      )}

      <div className="profile__grid">
        {seals.map((seal) => (
          <SeaLionCard key={seal.id} seal={seal} size={180} />
        ))}
      </div>
    </div>
  )
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
