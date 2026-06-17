import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { setLanguage } from "../i18n/i18n";
import { formatUsernameLabel } from "../utils/username";
import { BottomNav } from "./BottomNav";
import { UserSearch } from "./UserSearch";

export function Layout() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  useDocumentTitle();

  const hideBottomNav = pathname.startsWith("/login") || pathname.startsWith("/register");
  const mainClassName = hideBottomNav ? "main" : "main main--with-bottom-nav";
  const langSelector = (
    <select
      className="lang-select"
      value={i18n.language}
      onChange={(e) => setLanguage(e.target.value as "ru" | "en" | "zh")}
      aria-label="Language"
    >
      <option value="ru">RU</option>
      <option value="en">EN</option>
      <option value="zh">中文</option>
    </select>
  );

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          🦭 Navy Seal
        </Link>
        <nav className="nav">
          <div className="nav__search nav__search--desktop">
            <UserSearch />
          </div>

          <div className="nav__actions">
            <Link to="/discover" className="nav__discover-link">
              {t("nav.discover")}
            </Link>
            <div className="nav__auth nav__auth--desktop">
              {user ? (
                <>
                  <Link to={`/users/${user.username.replace(/^@+/, "")}`} className="nav__profile-link">
                    {t("header.profile")}
                  </Link>
                  <span className="nav__user">{formatUsernameLabel(user.username)}</span>
                  <button type="button" className="btn btn--ghost" onClick={logout}>
                    {t("auth.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">{t("auth.login")}</Link>
                  <Link to="/register" className="btn btn--primary">
                    {t("auth.register")}
                  </Link>
                </>
              )}
            </div>
            {langSelector}
          </div>
        </nav>
      </header>
      <main className={mainClassName}>
        <Outlet />
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
