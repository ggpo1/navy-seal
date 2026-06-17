import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

function resolveTitleKey(pathname: string):
  | 'meta.home'
  | 'meta.profile'
  | 'meta.login'
  | 'meta.register'
  | 'meta.seaLion'
  | 'meta.userProfile'
  | 'meta.discover'
  | 'meta.search' {
  if (pathname.startsWith('/discover')) return 'meta.discover'
  if (pathname.startsWith('/search')) return 'meta.search'
  if (pathname.startsWith('/users/')) return 'meta.userProfile'
  if (pathname.startsWith('/sealions/')) return 'meta.seaLion'
  if (pathname.startsWith('/profile')) return 'meta.profile'
  if (pathname.startsWith('/login')) return 'meta.login'
  if (pathname.startsWith('/register')) return 'meta.register'
  return 'meta.home'
}

export function useDocumentTitle() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = t(resolveTitleKey(pathname))
    document.documentElement.lang = i18n.language
  }, [pathname, i18n.language, t])
}
