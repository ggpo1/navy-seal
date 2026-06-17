import { useTranslation } from 'react-i18next'
import { UserSearch } from '../components/UserSearch'

export function SearchPage() {
  const { t } = useTranslation()

  return (
    <div className="search-page">
      <header className="search-page__header">
        <h1>{t('search.title')}</h1>
        <p className="search-page__subtitle">{t('search.subtitle')}</p>
      </header>
      <UserSearch variant="page" autoFocus />
    </div>
  )
}
