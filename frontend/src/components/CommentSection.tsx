import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { CommentDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { formatUsernameLabel } from '../utils/username'

interface Props {
  seaLionId: string
  comments: CommentDto[]
  onChange: (comments: CommentDto[]) => void
}

export function CommentSection({ seaLionId, comments, onChange }: Props) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!text.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const comment = await api.createComment(seaLionId, text.trim())
      onChange([comment, ...comments])
      setText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('comments.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (comment: CommentDto) => {
    setEditingId(comment.id)
    setEditText(comment.text)
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleUpdate = async (commentId: string) => {
    if (!editText.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const updated = await api.updateComment(commentId, editText.trim())
      onChange(comments.map((item) => (item.id === commentId ? updated : item)))
      cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('comments.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    setSubmitting(true)
    setError(null)
    try {
      await api.deleteComment(commentId)
      onChange(comments.filter((item) => item.id !== commentId))
      if (editingId === commentId) cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('comments.deleteFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="comments">
      <h2>{t('comments.title')}</h2>

      {user ? (
        <form className="comments__form" onSubmit={handleCreate}>
          <label htmlFor="comment-text">{t('comments.placeholder')}</label>
          <textarea
            id="comment-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            disabled={submitting}
          />
          <button type="submit" className="btn btn--primary" disabled={submitting || !text.trim()}>
            {submitting ? t('comments.submitting') : t('comments.submit')}
          </button>
        </form>
      ) : (
        <p className="comments__auth-hint">
          {t('comments.authHintPrefix')}
          <Link to="/login">{t('auth.login')}</Link>
          {t('comments.authHintSuffix')}
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {comments.length === 0 ? (
        <p className="comments__empty">{t('comments.empty')}</p>
      ) : (
        <ul className="comments__list">
          {comments.map((comment) => {
            const isOwner = user?.id === comment.userId
            const isEditing = editingId === comment.id

            return (
              <li key={comment.id} className="comments__item">
                <div className="comments__header">
                  <strong>{formatUsernameLabel(comment.username)}</strong>
                  <time dateTime={comment.createdAt}>
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.updatedAt && ` · ${t('comments.edited')}`}
                  </time>
                </div>

                {isEditing ? (
                  <div className="comments__edit">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      disabled={submitting}
                    />
                    <div className="comments__actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        disabled={submitting || !editText.trim()}
                        onClick={() => handleUpdate(comment.id)}
                      >
                        {t('comments.save')}
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        disabled={submitting}
                        onClick={cancelEdit}
                      >
                        {t('comments.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comments__text">{comment.text}</p>
                )}

                {isOwner && !isEditing && (
                  <div className="comments__actions">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={submitting}
                      onClick={() => startEdit(comment)}
                    >
                      {t('comments.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={submitting}
                      onClick={() => handleDelete(comment.id)}
                    >
                      {t('comments.delete')}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
