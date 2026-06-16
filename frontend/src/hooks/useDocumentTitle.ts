import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

function resolveTitleKey(pathname: string): 'meta.home' | 'meta.profile' | 'meta.login' | 'meta.register' {
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
