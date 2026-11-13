import { useEffect } from 'react'
import { MissionHeader } from '../components/MissionHeader'
import { getStation, photos } from '../data/content'
import { useProgress } from '../state/progress'

export function Photos({ onBack }: { onBack: () => void }) {
  const { markDone } = useProgress()

  useEffect(() => {
    markDone('photos')
  }, [markDone])

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Наши кадры</span>
        <span />
      </div>

      <div className="card stack">
        <MissionHeader
          chapter={getStation('photos').chapter}
          title={getStation('photos').title}
          howTo={getStation('photos').howTo}
        />
        <div className="photo-grid">
          {photos.map((p) => (
            <figure key={p.src} className="photo-card">
              <img src={p.src} alt={p.caption} loading="lazy" />
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="actions">
          <button type="button" className="primary-btn" onClick={onBack}>
            На карту
          </button>
        </div>
      </div>
    </section>
  )
}
