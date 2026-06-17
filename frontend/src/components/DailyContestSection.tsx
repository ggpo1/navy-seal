import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { DailyContestDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { formatUsernameLabel } from '../utils/username'
import { qualityClassName } from '../utils/sealQuality'
import { SeaLionCanvas } from './SeaLionCanvas'

export function DailyContestSection() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [contest, setContest] = useState<DailyContestDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadContest = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setContest(await api.getDailyContest())
    } catch (e) {
      setContest(null)
      setError(e instanceof Error ? e.message : t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadContest()
  }, [loadContest, user?.id])

  const handleVote = async (seaLionId: string) => {
    if (!user) return

    setVotingId(seaLionId)
    setError(null)
    try {
      const response = await api.voteDailyContest(seaLionId)
      setContest(response.contest)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('contest.voteFailed'))
    } finally {
      setVotingId(null)
    }
  }

  const formatPeriodEnd = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatWinnerDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  if (loading) {
    return (
      <section className="daily-contest">
        <p className="daily-contest__loading">{t('common.loading')}</p>
      </section>
    )
  }

  if (!contest) {
    return error ? (
      <section className="daily-contest">
        <p className="error">{error}</p>
      </section>
    ) : null
  }

  const nominationLabel = t(`contest.nominations.${contest.nomination}`, {
    defaultValue: contest.nomination,
  })

  return (
    <section className="daily-contest" aria-labelledby="daily-contest-title">
      <div className="daily-contest__header">
        <div>
          <h2 id="daily-contest-title">{t('contest.title')}</h2>
          <p className="daily-contest__subtitle">
            {t('contest.subtitle', { nomination: nominationLabel })}
          </p>
          <p className="daily-contest__deadline">
            {t('contest.deadline', { date: formatPeriodEnd(contest.periodEndUtc) })}
          </p>
        </div>
      </div>

      {contest.previousWinner && contest.previousWinnerPeriodEndUtc && (
        <div className={`daily-contest__winner ${qualityClassName(contest.previousWinner.metadata.quality)}`}>
          <div className="daily-contest__winner-badge">👑 {t('contest.previousWinner')}</div>
          <div className="daily-contest__winner-canvas">
            <SeaLionCanvas metadata={contest.previousWinner.metadata} width={160} />
          </div>
          <div className="daily-contest__winner-info">
            <Link to={`/sealions/${contest.previousWinner.id}`} className="daily-contest__winner-name">
              {contest.previousWinner.metadata.name}
            </Link>
            <p className="daily-contest__winner-meta">
              {formatUsernameLabel(contest.previousWinner.username)}
            </p>
            <p className="daily-contest__winner-award">
              {t('contest.previousWinnerAward', {
                nomination: nominationLabel,
                date: formatWinnerDate(contest.previousWinnerPeriodEndUtc),
              })}
            </p>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!user && (
        <p className="daily-contest__auth-hint">
          {t('contest.authHintPrefix')}
          <Link to="/login">{t('auth.login')}</Link>
          {t('contest.authHintSuffix')}
        </p>
      )}

      {contest.candidates.length === 0 ? (
        <p className="daily-contest__empty">{t('contest.empty')}</p>
      ) : (
        <div className="daily-contest__candidates">
          {contest.candidates.map(({ seal, voteCount }) => {
            const isVoted = contest.userVoteSeaLionId === seal.id
            const isVoting = votingId === seal.id

            return (
              <article
                key={seal.id}
                className={`daily-contest__candidate ${qualityClassName(seal.metadata.quality)} ${isVoted ? 'daily-contest__candidate--voted' : ''}`}
              >
                <Link to={`/sealions/${seal.id}`} className="daily-contest__candidate-canvas">
                  <SeaLionCanvas metadata={seal.metadata} />
                </Link>
                <div className="daily-contest__candidate-info">
                  <Link to={`/sealions/${seal.id}`} className="daily-contest__candidate-name">
                    {seal.metadata.name}
                  </Link>
                  <p className="daily-contest__candidate-votes">
                    {t('contest.votes', { count: voteCount })}
                  </p>
                  {user ? (
                    <button
                      type="button"
                      className={`btn ${isVoted ? 'btn--primary' : 'btn--ghost'}`}
                      onClick={() => handleVote(seal.id)}
                      disabled={isVoting || votingId !== null}
                    >
                      {isVoting
                        ? t('contest.voting')
                        : isVoted
                          ? t('contest.voted')
                          : t('contest.vote')}
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
