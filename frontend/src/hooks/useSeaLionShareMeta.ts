import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { SeaLionDetailDto } from '../api/types'
import { getSeaLionOgImageUrl, getSeaLionShareUrl } from '../utils/share'

const META_KEYS: Array<{ attr: 'name' | 'property'; key: string }> = [
  { attr: 'name', key: 'description' },
  { attr: 'property', key: 'og:type' },
  { attr: 'property', key: 'og:site_name' },
  { attr: 'property', key: 'og:title' },
  { attr: 'property', key: 'og:description' },
  { attr: 'property', key: 'og:image' },
  { attr: 'property', key: 'og:url' },
  { attr: 'name', key: 'twitter:card' },
  { attr: 'name', key: 'twitter:title' },
  { attr: 'name', key: 'twitter:description' },
  { attr: 'name', key: 'twitter:image' },
]

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function removeManagedMeta() {
  for (const { attr, key } of META_KEYS) {
    document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
  }
}

export function useSeaLionShareMeta(seal: SeaLionDetailDto | null) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!seal) return

    const title = `${seal.metadata.name} — Navy Seal`
    const description = t('share.description', { name: seal.metadata.name })
    const shareUrl = getSeaLionShareUrl(seal.id)
    const imageUrl = getSeaLionOgImageUrl(seal.id)

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', 'Navy Seal')
    upsertMeta('property', 'og:title', seal.metadata.name)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:url', shareUrl)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seal.metadata.name)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)

    return () => {
      removeManagedMeta()
    }
  }, [seal, t])
}
