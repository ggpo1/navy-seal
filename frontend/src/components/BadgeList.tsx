import { useTranslation } from 'react-i18next'
import { BADGE_ICONS, sortBadges } from '../utils/badges'

interface Props {
  badges?: string[]
  variant?: 'compact' | 'full'
}

export function BadgeList({ badges = [], variant = 'compact' }: Props) {
  const { t } = useTranslation()
  const ordered = sortBadges(badges)

  if (ordered.length === 0) return null

  return (
    <div className={`badge-list badge-list--${variant}`} role="list">
      {ordered.map((id) => (
        <span
          key={id}
          className={`badge badge--${id}`}
          role="listitem"
          title={t(`badges.${id}.description`)}
        >
          <span className="badge__icon" aria-hidden="true">{BADGE_ICONS[id]}</span>
          {variant === 'full' && (
            <span className="badge__label">{t(`badges.${id}.title`)}</span>
          )}
          {variant === 'compact' && (
            <span className="visually-hidden">{t(`badges.${id}.title`)}</span>
          )}
        </span>
      ))}
    </div>
  )
}
