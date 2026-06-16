export interface SeaLionMetadata {
  bodyColor: string
  bellyColor: string
  noseColor: string
  size: number
  flipperLength: number
  eyeStyle: string
  expression: string
  pattern: string
  hat: string | null
  accessory: string | null
  whiskers: boolean
  rotation: number
  backgroundColor: string
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
