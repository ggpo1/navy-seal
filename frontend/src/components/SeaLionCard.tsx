import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { SeaLionDto } from '../api/types'
import { formatUsernameLabel } from '../utils/username'
import { qualityClassName } from '../utils/sealQuality'
import { BadgeList } from './BadgeList'
import { SeaLionCanvas } from './SeaLionCanvas'

interface Props {
  seal: SeaLionDto
  onClick?: () => void
  showStats?: boolean
}

export function SeaLionCard({ seal, onClick, showStats = false }: Props) {
  const { t } = useTranslation()
  const qualityClass = qualityClassName(seal.metadata.quality)
  const className = `seal-card ${qualityClass}`
  const title = `${seal.metadata.name} — ${formatUsernameLabel(seal.username)}`
  const averageRating = seal.averageRating ?? 0
  const ratingCount = seal.ratingCount ?? 0
  const commentCount = seal.commentCount ?? 0

  const content = (
    <>
      <div className="seal-card__canvas">
        <SeaLionCanvas metadata={seal.metadata} />
      </div>
      <div className="seal-card__info">
        <span className="seal-card__name">{seal.metadata.name}</span>
        <span className="seal-card__user">{formatUsernameLabel(seal.username)}</span>
        <BadgeList badges={seal.badges} variant="compact" />
        {showStats && (
          <span className="seal-card__stats">
            <span className="seal-card__stat">
              ★ {averageRating.toFixed(1)} ({ratingCount})
            </span>
            <span className="seal-card__stat">
              💬 {t('comments.count', { count: commentCount })}
            </span>
          </span>
        )}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} title={title}>
        {content}
      </button>
    )
  }

  return (
    <Link to={`/sealions/${seal.id}`} className={className} title={title}>
      {content}
    </Link>
  )
}
