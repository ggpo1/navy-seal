import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { SeaLionDto } from '../api/types'
import { SeaLionCanvas } from '../components/SeaLionCanvas'
import { useAuth } from '../context/AuthContext'
import { formatUsernameLabel } from '../utils/username'
import { qualityClassName, resolveSeaLionQuality } from '../utils/sealQuality'

const DECK_BATCH = 20
const LIKE_RATING = 5
const DISLIKE_RATING = 1
const SWIPE_THRESHOLD = 80
const PREFETCH_THRESHOLD = 5

type SwipeDirection = 'left' | 'right' | null

export function DiscoverPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [deck, setDeck] = useState<SeaLionDto[]>([])
  const [remainingTotal, setRemainingTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragX, setDragX] = useState(0)
  const [exitDirection, setExitDirection] = useState<SwipeDirection>(null)
  const votingRef = useRef(false)
  const loadingRef = useRef(false)
  const exhaustedRef = useRef(false)
  const deckRef = useRef<SeaLionDto[]>([])
  const dragXRef = useRef(0)
  const touchStartXRef = useRef<number | null>(null)
  const cardRef = useRef<HTMLElement | null>(null)

  deckRef.current = deck
  const current = deck[0] ?? null

  const loadDeck = useCallback(async (force = false) => {
    if (!user || loadingRef.current) return
    if (exhaustedRef.current && !force) return

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await api.getDiscover(DECK_BATCH)
      setRemainingTotal(response.total)

      if (response.total === 0) {
        exhaustedRef.current = true
      }

      const seen = new Set(deckRef.current.map((s) => s.id))
      const fresh = response.items.filter((s) => !seen.has(s.id))

      if (fresh.length > 0) {
        setDeck((prev) => [...prev, ...fresh])
      } else if (response.total === 0) {
        exhaustedRef.current = true
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.loadFailed'))
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [user, t])

  const maybePrefetch = useCallback(() => {
    const len = deckRef.current.length
    if (len === 0 || len > PREFETCH_THRESHOLD) return
    if (exhaustedRef.current || loadingRef.current) return
    void loadDeck()
  }, [loadDeck])

  useEffect(() => {
    if (!user) return

    setDeck([])
    deckRef.current = []
    setRemainingTotal(null)
    exhaustedRef.current = false
    void loadDeck(true)
  }, [user, loadDeck])

  const advanceDeck = useCallback(() => {
    setDeck((prev) => prev.slice(1))
    setDragX(0)
    dragXRef.current = 0
    setExitDirection(null)
    window.setTimeout(maybePrefetch, 0)
  }, [maybePrefetch])

  const vote = useCallback(async (like: boolean) => {
    if (!current || votingRef.current) return

    votingRef.current = true
    setVoting(true)
    setExitDirection(like ? 'right' : 'left')
    setError(null)

    try {
      await api.upsertRating(current.id, like ? LIKE_RATING : DISLIKE_RATING)
      setRemainingTotal((prev) => (prev === null ? prev : Math.max(0, prev - 1)))
      await new Promise((resolve) => window.setTimeout(resolve, 220))
      advanceDeck()
    } catch (e) {
      setExitDirection(null)
      setDragX(0)
      dragXRef.current = 0
      setError(e instanceof Error ? e.message : t('discover.voteFailed'))
    } finally {
      setVoting(false)
      votingRef.current = false
    }
  }, [advanceDeck, current, t])

  const handleReload = () => {
    exhaustedRef.current = false
    void loadDeck(true)
  }

  useEffect(() => {
    const card = cardRef.current
    if (!card || !current || voting) return

    const handleTouchStart = (event: TouchEvent) => {
      if (votingRef.current) return
      touchStartXRef.current = event.touches[0].clientX
      dragXRef.current = 0
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (votingRef.current || touchStartXRef.current === null) return

      const delta = event.touches[0].clientX - touchStartXRef.current
      dragXRef.current = delta
      setDragX(delta)

      if (Math.abs(delta) > 8) {
        event.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      if (votingRef.current || touchStartXRef.current === null) return

      const delta = dragXRef.current
      touchStartXRef.current = null

      if (delta > SWIPE_THRESHOLD) {
        void vote(true)
      } else if (delta < -SWIPE_THRESHOLD) {
        void vote(false)
      } else {
        dragXRef.current = 0
        setDragX(0)
      }
    }

    card.addEventListener('touchstart', handleTouchStart, { passive: true })
    card.addEventListener('touchmove', handleTouchMove, { passive: false })
    card.addEventListener('touchend', handleTouchEnd)
    card.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      card.removeEventListener('touchstart', handleTouchStart)
      card.removeEventListener('touchmove', handleTouchMove)
      card.removeEventListener('touchend', handleTouchEnd)
      card.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [current, vote, voting])

  if (!user) {
    return (
      <div className="discover discover--empty">
        <h1>{t('discover.title')}</h1>
        <p>{t('discover.authHintPrefix')}</p>
        <Link to="/login" className="btn btn--primary">{t('auth.login')}</Link>
      </div>
    )
  }

  const showEmpty = !current && !loading
  const showLoading = loading && !current

  return (
    <div className="discover">
      <header className="discover__header">
        <h1>{t('discover.title')}</h1>
        <p className="discover__subtitle">{t('discover.subtitle')}</p>
        {remainingTotal !== null && remainingTotal > 0 && (
          <p className="discover__remaining">{t('discover.remaining', { count: remainingTotal })}</p>
        )}
      </header>

      {error && <p className="error discover__error">{error}</p>}

      {showLoading ? (
        <p className="discover__loading">{t('discover.loadingDeck')}</p>
      ) : showEmpty ? (
        <div className="discover__empty">
          <p>{t('discover.empty')}</p>
          <p className="discover__empty-hint">{t('discover.emptyHint')}</p>
          <p className="discover__empty-detail">{t('discover.emptyDetail')}</p>
          <button type="button" className="btn btn--primary" onClick={handleReload} disabled={loading}>
            {loading ? t('common.loading') : t('discover.reload')}
          </button>
        </div>
      ) : current ? (
        <div className="discover__stage">
          {deck[1] && (
            <div className="discover__card discover__card--behind" aria-hidden>
              <div className="discover__card-canvas">
                <SeaLionCanvas metadata={deck[1].metadata} width={360} />
              </div>
            </div>
          )}

          <article
            ref={cardRef}
            className={`discover__card ${qualityClassName(current.metadata.quality)} ${exitDirection ? `discover__card--exit-${exitDirection}` : ''}`}
            style={exitDirection ? undefined : { transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)` }}
          >
            <div className="discover__card-canvas">
              <SeaLionCanvas metadata={current.metadata} width={360} />
            </div>
            <div className="discover__card-info">
              <h2>{current.metadata.name}</h2>
              <p className="discover__card-owner">
                <Link to={`/users/${current.username.replace(/^@+/, '')}`}>
                  {formatUsernameLabel(current.username)}
                </Link>
              </p>
              <p className={`discover__card-quality preview__quality ${qualityClassName(current.metadata.quality)}`}>
                {t(`quality.${resolveSeaLionQuality(current.metadata.quality)}`)}
              </p>
            </div>

            {dragX > 30 && (
              <span className="discover__stamp discover__stamp--like" aria-hidden>{t('discover.like')}</span>
            )}
            {dragX < -30 && (
              <span className="discover__stamp discover__stamp--dislike" aria-hidden>{t('discover.dislike')}</span>
            )}
          </article>

          <div className="discover__actions">
            <button
              type="button"
              className="discover__action discover__action--dislike"
              onClick={() => vote(false)}
              disabled={voting}
              aria-label={t('discover.dislike')}
            >
              ✕
            </button>
            <button
              type="button"
              className="discover__action discover__action--like"
              onClick={() => vote(true)}
              disabled={voting}
              aria-label={t('discover.like')}
            >
              ♥
            </button>
          </div>

          {voting && <p className="discover__voting">{t('discover.voting')}</p>}
        </div>
      ) : null}
    </div>
  )
}
