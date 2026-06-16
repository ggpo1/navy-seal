export type SeaLionQuality = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

const QUALITIES = new Set<SeaLionQuality>([
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
])

export function resolveSeaLionQuality(quality?: string): SeaLionQuality {
  const normalized = quality?.trim().toLowerCase()
  if (normalized && QUALITIES.has(normalized as SeaLionQuality)) {
    return normalized as SeaLionQuality
  }
  return 'common'
}

export function qualityClassName(quality?: string): string {
  return `seal-quality--${resolveSeaLionQuality(quality)}`
}
