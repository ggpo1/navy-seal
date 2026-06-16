import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { sanitizeUsernameInput } from '../utils/username'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <h1>{t('auth.loginTitle')}</h1>
        <label>
          {t('auth.username')}
          <input
            value={username}
            onChange={(e) => setUsername(sanitizeUsernameInput(e.target.value))}
            required
            autoComplete="username"
            spellCheck={false}
          />
        </label>
        <label>
          {t('auth.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? t('auth.submitLoggingIn') : t('auth.submitLogin')}
        </button>
        <p className="auth__switch">
          {t('auth.noAccountPrefix')} <Link to="/register">{t('auth.noAccountAction')}</Link>
        </p>
      </form>
    </div>
  )
}
