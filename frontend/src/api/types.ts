export interface PatternMark {
  x: number
  y: number
  radius: number
}

export interface BackgroundMark {
  kind: string
  x: number
  y: number
  size: number
  opacity: number
  rotation: number
}

export interface SeaLionMetadata {
  seed?: number
  bodyColor: string
  bellyColor: string
  noseColor: string
  size: number
  bodyScaleX?: number
  bodyScaleY?: number
  headScale?: number
  snoutLength?: number
  tailLength?: number
  flipperLength: number
  flipperSpread?: number
  eyeSize?: number
  eyeSpacing?: number
  eyeStyle: string
  expression: string
  pose: string
  pattern: string
  patternOpacity?: number
  stripeCount?: number
  stripeWidth?: number
  patternMarks?: PatternMark[]
  hat: string | null
  accessory: string | null
  whiskers: boolean
  rotation: number
  backgroundColor: string
  backgroundColorSecondary?: string | null
  backgroundAccentColor?: string | null
  backgroundStyle?: string
  waveIntensity?: number
  backgroundMarks?: BackgroundMark[]
  name: string
  quality?: string
  age?: number
  awards?: SeaLionAward[]
}

export interface SeaLionAward {
  nomination: string
  wonAt: string
  periodStartUtc: string
  periodEndUtc: string
}

export interface SeaLionDto {
  id: string
  userId: string
  username: string
  metadata: SeaLionMetadata
  createdAt: string
  averageRating?: number
  ratingCount?: number
  commentCount?: number
  badges?: string[]
}

export interface SeaLionDetailDto extends SeaLionDto {
  userRating: number | null
}

export interface CommentDto {
  id: string
  seaLionId: string
  userId: string
  username: string
  text: string
  createdAt: string
  updatedAt: string | null
}

export interface CommentListResponse {
  items: CommentDto[]
}

export interface RatingSummaryDto {
  average: number
  count: number
  userRating: number | null
}

export interface UserDto {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: UserDto
}

export const PAGE_SIZE = 12

export interface SeaLionListResponse {
  items: SeaLionDto[]
  total: number
  page: number
  pageSize: number
}

export interface GenerateSeaLionRequest {
  quality?: string
  age?: number
}

export interface UserSearchResultDto {
  id: string
  username: string
  sealCount: number
}

export interface UserSearchResponse {
  items: UserSearchResultDto[]
}

export interface PublicUserProfileDto {
  id: string
  username: string
  createdAt: string
  sealCount: number
  badges: string[]
  seals: SeaLionDto[]
  page: number
  pageSize: number
}

export interface ContestCandidateDto {
  seal: SeaLionDto
  voteCount: number
}

export interface DailyContestDto {
  contestId: string
  nomination: string
  periodStartUtc: string
  periodEndUtc: string
  previousWinner: SeaLionDto | null
  previousWinnerPeriodEndUtc: string | null
  candidates: ContestCandidateDto[]
  userVoteSeaLionId: string | null
}

export interface CastContestVoteResponse {
  seaLionId: string
  voteCount: number
  contest: DailyContestDto
}
