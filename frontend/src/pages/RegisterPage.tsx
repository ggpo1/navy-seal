import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { sanitizeUsernameInput, validateUsername } from '../utils/username'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const usernameError = validateUsername(username)
    if (usernameError) {
      setError(t(`validation.username.${usernameError}`))
      setLoading(false)
      return
    }

    try {
      await register(username.trim(), email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generateFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <h1>{t('auth.registerTitle')}</h1>
        <label>
          {t('auth.username')}
          <input
            value={username}
            onChange={(e) => setUsername(sanitizeUsernameInput(e.target.value))}
            required
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9][a-zA-Z0-9_]*"
            autoComplete="username"
            spellCheck={false}
          />
          <span className="field-hint">{t('validation.username.hint')}</span>
        </label>
        <label>
          {t('auth.email')}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          {t('auth.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? t('auth.submitRegisterLoading') : t('auth.submitRegister')}
        </button>
        <p className="auth__switch">
          {t('auth.alreadyHaveAccountPrefix')} <Link to="/login">{t('auth.alreadyHaveAccountAction')}</Link>
        </p>
      </form>
    </div>
  )
}
