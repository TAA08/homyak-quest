import { stations, type StationId } from '../data/content'
import { useProgress } from '../state/progress'

export function Hub({ onOpen }: { onOpen: (id: StationId) => void }) {
  const { completed, doneCount, totalMissions, campaignComplete, isUnlocked } =
    useProgress()
  const pct = Math.round((doneCount / totalMissions) * 100)

  return (
    <section className="stack">
      <div className="card">
        <p className="briefing-code" style={{ marginBottom: '0.35rem' }}>
          MISSION PROGRESS: {pct}%
        </p>
        <h2 className="screen-title" style={{ fontSize: '1.4rem' }}>
          Карта операции
        </h2>
        <p className="lede">
          {campaignComplete
            ? 'Кампания пройдена — все уровни открыты для свободной игры.'
            : 'Уровни открываются по цепочке. Следующий — после текущего.'}
        </p>
        <div className="progress-bar" style={{ marginTop: '0.9rem' }} aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="hint" style={{ marginTop: '0.45rem' }}>
          Готово: {doneCount} из {totalMissions}
        </p>
      </div>

      <div className="station-grid">
        {stations.map((s) => {
          const done = completed[s.id]
          const unlocked = isUnlocked(s.id)
          return (
            <button
              key={s.id}
              type="button"
              className={`station ${!unlocked ? 'station-locked' : ''}`}
              onClick={() => unlocked && onOpen(s.id)}
              disabled={!unlocked}
            >
              <span className="station-emoji" aria-hidden>
                {unlocked ? s.emoji : '🔒'}
              </span>
              <span>
                <p className="station-chapter">{s.chapter}</p>
                <h3>{s.title}</h3>
                <p>{unlocked ? s.blurb : 'Ещё закрыто временным щитом'}</p>
              </span>
              <span className={`pill ${!unlocked ? 'locked' : ''}`}>
                {!unlocked ? 'лок' : done ? 'готово' : 'миссия'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
