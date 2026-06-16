interface Props {
  average: number
  count: number
  userRating?: number | null
  interactive?: boolean
  disabled?: boolean
  onRate?: (value: number) => void
}

export function StarRating({
  average,
  count,
  userRating = null,
  interactive = false,
  disabled = false,
  onRate,
}: Props) {
  const displayValue = userRating ?? average

  return (
    <div className="star-rating" role="img" aria-label={`${average} / 5`}>
      <div className="star-rating__stars">
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = value <= Math.round(displayValue)
          const isUserChoice = interactive && userRating === value

          if (interactive) {
            return (
              <button
                key={value}
                type="button"
                className={`star-rating__star ${filled ? 'star-rating__star--filled' : ''} ${isUserChoice ? 'star-rating__star--active' : ''}`}
                disabled={disabled}
                onClick={() => onRate?.(value)}
                aria-label={`${value}`}
              >
                ★
              </button>
            )
          }

          return (
            <span
              key={value}
              className={`star-rating__star ${filled ? 'star-rating__star--filled' : ''}`}
              aria-hidden
            >
              ★
            </span>
          )
        })}
      </div>
      <span className="star-rating__meta">
        {average.toFixed(1)} ({count})
      </span>
    </div>
  )
}
