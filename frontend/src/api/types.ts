export interface PatternMark {
  x: number
  y: number
  radius: number
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
  backgroundStyle?: string
  waveIntensity?: number
  name: string
}

export interface SeaLionDto {
  id: string
  userId: string
  username: string
  metadata: SeaLionMetadata
  createdAt: string
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

export interface SeaLionListResponse {
  items: SeaLionDto[]
}
