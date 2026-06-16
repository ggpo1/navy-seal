import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { CommentDto, SeaLionDetailDto } from '../api/types'
import { CommentSection } from '../components/CommentSection'
import { SeaLionCanvas } from '../components/SeaLionCanvas'
import { StarRating } from '../components/StarRating'
import { useAuth } from '../context/AuthContext'
import { formatUsernameLabel } from '../utils/username'
import { qualityClassName, resolveSeaLionQuality } from '../utils/sealQuality'

export function SeaLionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [seal, setSeal] = useState<SeaLionDetailDto | null>(null)
  const [comments, setComments] = useState<CommentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)

    Promise.all([api.getSeaLion(id), api.getComments(id)])
      .then(([seaLion, commentResponse]) => {
        setSeal(seaLion)
        setComments(commentResponse.items)
      })
      .catch((e) => {
        setSeal(null)
        setComments([])
        setError(e instanceof Error ? e.message : t('errors.loadFailed'))
      })
      .finally(() => setLoading(false))
  }, [id, t])

  const handleRate = async (value: number) => {
    if (!id || !user || !seal) return

    setRatingLoading(true)
    setError(null)
    try {
      const summary = seal.userRating === value
        ? await api.removeRating(id)
        : await api.upsertRating(id, value)

      setSeal({
        ...seal,
        averageRating: summary.average,
        ratingCount: summary.count,
        userRating: summary.userRating,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('rating.submitFailed'))
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) {
    return <p className="detail__loading">{t('common.loading')}</p>
  }

  if (!seal) {
    return (
      <div className="detail detail--empty">
        <p>{error ?? t('detail.notFound')}</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
          {t('detail.backHome')}
        </button>
      </div>
    )
  }

  return (
    <div className="detail">
      <Link to="/" className="detail__back">← {t('detail.backHome')}</Link>

      <div className={`detail__hero ${qualityClassName(seal.metadata.quality)}`}>
        <div className="detail__canvas">
          <SeaLionCanvas metadata={seal.metadata} width={420} height={420} />
        </div>

        <div className="detail__info">
          <h1>{seal.metadata.name}</h1>
          <p className="detail__owner">
            {t('detail.owner')}:{' '}
            <Link to={`/users/${seal.username.replace(/^@+/, '')}`}>
              {formatUsernameLabel(seal.username)}
            </Link>
          </p>

          <div className="detail__rating-block">
            <h2>{t('rating.title')}</h2>
            {user ? (
              <>
                <p className="detail__rating-hint">{t('rating.hint')}</p>
                <StarRating
                  average={seal.averageRating ?? 0}
                  count={seal.ratingCount ?? 0}
                  userRating={seal.userRating}
                  interactive
                  disabled={ratingLoading}
                  onRate={handleRate}
                />
              </>
            ) : (
              <>
                <StarRating average={seal.averageRating ?? 0} count={seal.ratingCount ?? 0} />
                <p className="detail__rating-hint">
                  {t('rating.authHintPrefix')}
                  <Link to="/login">{t('auth.login')}</Link>
                  {t('rating.authHintSuffix')}
                </p>
              </>
            )}
          </div>

          <dl className="detail__meta">
            <div>
              <dt>{t('seaLionMeta.quality')}</dt>
              <dd className={`preview__quality ${qualityClassName(seal.metadata.quality)}`}>
                {t(`quality.${resolveSeaLionQuality(seal.metadata.quality)}`)}
              </dd>
            </div>
            <div>
              <dt>{t('seaLionMeta.age')}</dt>
              <dd>{t('seaLionMeta.ageYears', { count: seal.metadata.age ?? 0 })}</dd>
            </div>
            <div>
              <dt>{t('seaLionMeta.pose')}</dt>
              <dd>{t(`pose.${seal.metadata.pose ?? 'upright'}`)}</dd>
            </div>
            <div>
              <dt>{t('seaLionMeta.expression')}</dt>
              <dd>{t(`expression.${seal.metadata.expression}`)}</dd>
            </div>
            <div>
              <dt>{t('seaLionMeta.pattern')}</dt>
              <dd>{t(`pattern.${seal.metadata.pattern}`)}</dd>
            </div>
            <div>
              <dt>{t('seaLionMeta.eyeStyle')}</dt>
              <dd>{t(`eyeStyle.${seal.metadata.eyeStyle}`)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <CommentSection
        seaLionId={seal.id}
        comments={comments}
        onChange={setComments}
      />
    </div>
  )
}
