import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { SeaLionDto } from '../api/types'
import { SeaLionCanvas } from '../components/SeaLionCanvas'
import { SeaLionCard } from '../components/SeaLionCard'
import { useAuth } from '../context/AuthContext'

export function HomePage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState<SeaLionDto | null>(null)
  const [recent, setRecent] = useState<SeaLionDto[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecent = useCallback(async () => {
    try {
      const response = await api.getRecent(12)
      setRecent(response.items)
    } catch {
      setRecent([])
    }
  }, [])

  useEffect(() => {
    loadRecent()
  }, [loadRecent])

  const handleGenerate = async () => {
    if (!user) return
    setGenerating(true)
    setError(null)
    try {
      const seal = await api.generateSeaLion()
      setCurrent(seal)
      await loadRecent()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>Генератор морских котиков</h1>
        <p className="hero__subtitle">
          Нажми кнопку — получи уникальные метаданные и отрисованного котика
        </p>

        {user ? (
          <button
            type="button"
            className="btn btn--generate"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Генерируем...' : '✨ Сгенерировать'}
          </button>
        ) : (
          <p className="hero__auth-hint">
            <Link to="/login">Войдите</Link> или{' '}
            <Link to="/register">зарегистрируйтесь</Link>, чтобы генерировать котиков
          </p>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      <section className="preview">
        {current ? (
          <div className="preview__content">
            <SeaLionCanvas metadata={current.metadata} width={400} height={400} />
            <div className="preview__meta">
              <h2>{current.metadata.name}</h2>
              <dl>
                <div><dt>Поза</dt><dd>{current.metadata.pose ?? 'upright'}</dd></div>
                <div><dt>Выражение</dt><dd>{current.metadata.expression}</dd></div>
                <div><dt>Узор</dt><dd>{current.metadata.pattern}</dd></div>
                <div><dt>Глаза</dt><dd>{current.metadata.eyeStyle}</dd></div>
                {current.metadata.hat && (
                  <div><dt>Шляпа</dt><dd>{current.metadata.hat}</dd></div>
                )}
                {current.metadata.accessory && (
                  <div><dt>Аксессуар</dt><dd>{current.metadata.accessory}</dd></div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="preview__placeholder">
            <span>🦭</span>
            <p>Здесь появится твой морской котик</p>
          </div>
        )}
      </section>

      <section className="recent">
        <h2>Недавно сгенерированные</h2>
        {recent.length === 0 ? (
          <p className="recent__empty">Пока никто не сгенерировал котиков</p>
        ) : (
          <div className="recent__grid">
            {recent.map((seal) => (
              <SeaLionCard
                key={seal.id}
                seal={seal}
                onClick={() => setCurrent(seal)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
