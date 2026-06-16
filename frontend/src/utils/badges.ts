export const BADGE_IDS = {
  firstSeal: 'first_seal',
  seals5: 'seals_5',
  seals25: 'seals_25',
  firstLegendary: 'first_legendary',
  legendary10: 'legendary_10',
  comments100: 'comments_100',
  ratings50: 'ratings_50',
  commenter25: 'commenter_25',
  critic50: 'critic_50',
  popularSeal: 'popular_seal',
  topWeek: 'top_week',
  hallOfFame: 'hall_of_fame',
} as const

export type BadgeId = (typeof BADGE_IDS)[keyof typeof BADGE_IDS]

export const BADGE_ICONS: Record<BadgeId, string> = {
  first_seal: '🥇',
  seals_5: '🐾',
  seals_25: '🏆',
  first_legendary: '✨',
  legendary_10: '👑',
  comments_100: '💬',
  ratings_50: '⭐',
  commenter_25: '🗨️',
  critic_50: '🎯',
  popular_seal: '🔥',
  top_week: '📈',
  hall_of_fame: '🏛️',
}

export const BADGE_ORDER: BadgeId[] = [
  BADGE_IDS.firstSeal,
  BADGE_IDS.seals5,
  BADGE_IDS.seals25,
  BADGE_IDS.firstLegendary,
  BADGE_IDS.legendary10,
  BADGE_IDS.comments100,
  BADGE_IDS.ratings50,
  BADGE_IDS.commenter25,
  BADGE_IDS.critic50,
  BADGE_IDS.popularSeal,
  BADGE_IDS.topWeek,
  BADGE_IDS.hallOfFame,
]

export function sortBadges(badges: string[]): BadgeId[] {
  const set = new Set(badges)
  return BADGE_ORDER.filter((id) => set.has(id))
}
