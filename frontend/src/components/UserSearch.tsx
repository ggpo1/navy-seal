import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { UserSearchResultDto } from '../api/types'
import { formatUsernameLabel, sanitizeUsernameInput } from '../utils/username'

interface Props {
  variant?: 'compact' | 'page'
  autoFocus?: boolean
}

export function UserSearch({ variant = 'compact', autoFocus = false }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResultDto[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = window.setTimeout(() => {
      setLoading(true)
      api.searchUsers(trimmed)
        .then((response) => {
          setResults(response.items)
          setOpen(true)
        })
        .catch(() => {
          setResults([])
          setOpen(false)
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const goToProfile = (username: string) => {
    setOpen(false)
    setQuery('')
    navigate(`/users/${username}`)
  }

  const isPage = variant === 'page'
  const trimmedQuery = query.trim()
  const showResults = isPage ? trimmedQuery.length >= 2 : open

  return (
    <div className={`user-search ${isPage ? 'user-search--page' : ''}`} ref={containerRef}>
      <input
        type="search"
        className="user-search__input"
        value={query}
        onChange={(e) => setQuery(sanitizeUsernameInput(e.target.value))}
        onFocus={() => !isPage && results.length > 0 && setOpen(true)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
        aria-expanded={showResults}
        aria-controls={listboxId}
        autoComplete="off"
        autoFocus={autoFocus}
      />

      {showResults && (
        <div className="user-search__dropdown" id={listboxId} role="listbox">
          {loading && <p className="user-search__status">{t('search.loading')}</p>}

          {!loading && results.length === 0 && trimmedQuery.length >= 2 && (
            <p className="user-search__status">{t('search.empty')}</p>
          )}

          {!loading && results.map((item) => (
            <button
              key={item.id}
              type="button"
              className="user-search__option"
              role="option"
              onClick={() => goToProfile(item.username)}
            >
              <span className="user-search__name">{formatUsernameLabel(item.username)}</span>
              <span className="user-search__meta">
                {t('search.sealCount', { count: item.sealCount })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
