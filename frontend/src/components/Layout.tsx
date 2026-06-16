import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          🦭 Navy Seal
        </Link>
        <nav className="nav">
          {user ? (
            <>
              <Link to="/profile">Профиль</Link>
              <span className="nav__user">@{user.username}</span>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Войти</Link>
              <Link to="/register" className="btn btn--primary">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
