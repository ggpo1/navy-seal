import type { SeaLionDto } from '../api/types'
import { formatUsernameLabel } from '../utils/username'
import { qualityClassName } from '../utils/sealQuality'
import { SeaLionCanvas } from './SeaLionCanvas'

interface Props {
  seal: SeaLionDto
  onClick?: () => void
}

export function SeaLionCard({ seal, onClick }: Props) {
  const qualityClass = qualityClassName(seal.metadata.quality)

  return (
    <button
      type="button"
      className={`seal-card ${qualityClass}`}
      onClick={onClick}
      title={`${seal.metadata.name} — ${formatUsernameLabel(seal.username)}`}
    >
      <div className="seal-card__canvas">
        <SeaLionCanvas metadata={seal.metadata} />
      </div>
      <div className="seal-card__info">
        <span className="seal-card__name">{seal.metadata.name}</span>
        <span className="seal-card__user">{formatUsernameLabel(seal.username)}</span>
      </div>
    </button>
  )
}
