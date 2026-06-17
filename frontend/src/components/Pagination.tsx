import { useTranslation } from 'react-i18next'

interface Props {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ page, pageSize, total, onPageChange, disabled = false }: Props) {
  const { t } = useTranslation()
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0

  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label={t('pagination.label')}>
      <button
        type="button"
        className="btn btn--ghost pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        {t('pagination.prev')}
      </button>
      <span className="pagination__info">
        {t('pagination.pageOf', { page, total: totalPages })}
      </span>
      <button
        type="button"
        className="btn btn--ghost pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        {t('pagination.next')}
      </button>
    </nav>
  )
}
