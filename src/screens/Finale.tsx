import { useEffect, useMemo } from 'react'
import { MissionHeader } from '../components/MissionHeader'
import { finaleLines, getStation, HERO } from '../data/content'
import { useProgress } from '../state/progress'

export function Finale({ onBack }: { onBack: () => void }) {
  const { markDone } = useProgress()

  useEffect(() => {
    markDone('finale')
  }, [markDone])

  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        delay: `${(i % 8) * 0.18}s`,
        duration: `${2.8 + (i % 5) * 0.35}s`,
        color: ['#c9a227', '#5fa896', '#7b8cff', '#f0a8b4', '#e8d5a3'][i % 5],
      })),
    [],
  )

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Коронация</span>
        <span />
      </div>

      <div className="card finale">
        <MissionHeader
          chapter={getStation('finale').chapter}
          title={getStation('finale').title}
          howTo={getStation('finale').howTo}
        />
        <div className="confetti" aria-hidden>
          {pieces.map((p) => (
            <i
              key={p.id}
              style={{
                left: p.left,
                background: p.color,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
        <p className="briefing-code">OPERATION COMPLETE</p>
        <div className="badge">🎂 {HERO.birthday}</div>
        <h1>{HERO.dedication}</h1>
        <div className="stack" style={{ textAlign: 'left' }}>
          {finaleLines.map((line) => (
            <p key={line} style={{ margin: 0 }}>
              {line}
            </p>
          ))}
        </div>
        <p className="hint" style={{ marginTop: '1rem' }}>
          Теперь все уровни открыты на карте — можно играть в любом порядке.
        </p>
        <div className="actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="primary-btn" onClick={onBack}>
            На карту
          </button>
        </div>
      </div>
    </section>
  )
}
