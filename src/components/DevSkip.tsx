import { DEV_MODE } from '../config'
import type { StationId } from '../data/content'
import { useProgress } from '../state/progress'

export function DevSkip({
  stationId,
  onDone,
}: {
  stationId: StationId
  onDone?: () => void
}) {
  const { markDone, completed } = useProgress()
  if (!DEV_MODE) return null

  return (
    <button
      type="button"
      className="dev-skip"
      onClick={() => {
        markDone(stationId)
        onDone?.()
      }}
    >
      {completed[stationId] ? 'dev · уже пройдено' : 'dev · пройти без очков'}
    </button>
  )
}
