import { useTranslation } from 'react-i18next'
import type { SeaLionAward } from '../api/types'

interface Props {
  awards?: SeaLionAward[]
}

export function SeaLionAwards({ awards = [] }: Props) {
  const { t, i18n } = useTranslation()

  if (awards.length === 0) return null

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <section className="seal-awards" aria-label={t('contest.awardsTitle')}>
      <h2 className="seal-awards__title">{t('contest.awardsTitle')}</h2>
      <ul className="seal-awards__list">
        {awards.map((award, index) => (
          <li key={`${award.nomination}-${award.wonAt}-${index}`} className="seal-awards__item">
            <span className="seal-awards__icon" aria-hidden="true">🏆</span>
            <div>
              <strong>{t(`contest.nominations.${award.nomination}`, { defaultValue: award.nomination })}</strong>
              <p>{t('contest.awardWonOn', { date: formatDate(award.wonAt) })}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
