import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { SeaLionDto } from '../api/types'
import { SeaLionCanvas } from '../components/SeaLionCanvas'
import { SeaLionCard } from '../components/SeaLionCard'
import { useAuth } from '../context/AuthContext'
import { qualityClassName, resolveSeaLionQuality } from '../utils/sealQuality'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [current, setCurrent] = useState<SeaLionDto | null>(null)
  const [recent, setRecent] = useState<SeaLionDto[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecent = useCallback(async () => {
    try {
      const response = await api.getRecent(100)
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
      navigate(`/sealions/${seal.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.generateFailed'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>{t('generator.title')}</h1>
        <p className="hero__subtitle">
          {t('generator.subtitle')}
        </p>

        {user ? (
          <button
            type="button"
            className="btn btn--generate"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? t('generator.generating') : `✨ ${t('generator.generate')}`}
          </button>
        ) : (
          <p className="hero__auth-hint">
            {t('generator.authHintPrefix')}
            <Link to="/login">{t('auth.login')}</Link> {t('common.or')}{' '}
            <Link to="/register">{t('auth.register')}</Link>
            {t('generator.authHintSuffix')}
          </p>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      <section className="preview">
        {current ? (
          <div className={`preview__content ${qualityClassName(current.metadata.quality)}`}>
            <div className="preview__canvas">
              <SeaLionCanvas metadata={current.metadata} width={400} height={400} />
            </div>
            <div className="preview__meta">
              <h2>{current.metadata.name}</h2>
              <dl>
                <div>
                  <dt>{t('seaLionMeta.quality')}</dt>
                  <dd className={`preview__quality ${qualityClassName(current.metadata.quality)}`}>
                    {t(`quality.${resolveSeaLionQuality(current.metadata.quality)}`)}
                  </dd>
                </div>
                <div>
                  <dt>{t('seaLionMeta.age')}</dt>
                  <dd>{t('seaLionMeta.ageYears', { count: current.metadata.age ?? 0 })}</dd>
                </div>
                <div>
                  <dt>{t('seaLionMeta.pose')}</dt>
                  <dd>{t(`pose.${current.metadata.pose ?? 'upright'}`)}</dd>
                </div>
                <div>
                  <dt>{t('seaLionMeta.expression')}</dt>
                  <dd>{t(`expression.${current.metadata.expression}`)}</dd>
                </div>
                <div>
                  <dt>{t('seaLionMeta.pattern')}</dt>
                  <dd>{t(`pattern.${current.metadata.pattern}`)}</dd>
                </div>
                <div>
                  <dt>{t('seaLionMeta.eyeStyle')}</dt>
                  <dd>{t(`eyeStyle.${current.metadata.eyeStyle}`)}</dd>
                </div>
                {current.metadata.hat && (
                  <div>
                    <dt>{t('seaLionMeta.hat')}</dt>
                    <dd>{t(`hat.${current.metadata.hat}`)}</dd>
                  </div>
                )}
                {current.metadata.accessory && (
                  <div>
                    <dt>{t('seaLionMeta.accessory')}</dt>
                    <dd>{t(`accessory.${current.metadata.accessory}`)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="preview__placeholder">
            <span>🦭</span>
            <p>{t('generator.previewPlaceholder')}</p>
          </div>
        )}
      </section>

      <section className="recent">
        <h2>{t('recent.title')}</h2>
        {recent.length === 0 ? (
          <p className="recent__empty">{t('recent.empty')}</p>
        ) : (
          <div className="recent__grid">
            {recent.map((seal) => (
              <SeaLionCard key={seal.id} seal={seal} showStats />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
