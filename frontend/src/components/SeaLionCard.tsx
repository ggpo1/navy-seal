import type { SeaLionDto } from '../api/types'
import { SeaLionCanvas } from './SeaLionCanvas'

interface Props {
  seal: SeaLionDto
  size?: number
  onClick?: () => void
}

export function SeaLionCard({ seal, size = 140, onClick }: Props) {
  return (
    <button
      type="button"
      className="seal-card"
      onClick={onClick}
      title={`${seal.metadata.name} — @${seal.username}`}
    >
      <SeaLionCanvas metadata={seal.metadata} width={size} height={size} />
      <div className="seal-card__info">
        <span className="seal-card__name">{seal.metadata.name}</span>
        <span className="seal-card__user">@{seal.username}</span>
      </div>
    </button>
  )
}
