import { useEffect, useState } from 'react'
import { MissionHeader } from '../components/MissionHeader'
import { facts, getStation } from '../data/content'
import { useProgress } from '../state/progress'

export function Facts({ onBack }: { onBack: () => void }) {
  const { markDone } = useProgress()
  const [index, setIndex] = useState(0)
  const fact = facts[index]

  useEffect(() => {
    if (index === facts.length - 1) markDone('facts')
  }, [index, markDone])

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Факты о Хомяке</span>
        <span />
      </div>

      <MissionHeader
        chapter={getStation('facts').chapter}
        title={getStation('facts').title}
        howTo={getStation('facts').howTo}
      />

      <div className="card fact-card" key={fact.title}>
        <div className="badge">
          {index + 1} / {facts.length}
        </div>
        <h2>{fact.title}</h2>
        <p>{fact.text}</p>
      </div>

      <div className="actions">
        <button
          type="button"
          className="secondary-btn"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Назад
        </button>
        {index < facts.length - 1 ? (
          <button
            type="button"
            className="primary-btn"
            onClick={() => setIndex((i) => Math.min(facts.length - 1, i + 1))}
          >
            Дальше
          </button>
        ) : (
          <button type="button" className="primary-btn" onClick={onBack}>
            На карту
          </button>
        )}
      </div>
    </section>
  )
}
