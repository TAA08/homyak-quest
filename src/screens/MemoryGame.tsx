import { useMemo, useState } from 'react'
import { DevSkip } from '../components/DevSkip'
import { MissionHeader } from '../components/MissionHeader'
import { getStation } from '../data/content'
import { useProgress } from '../state/progress'

const EMOJIS = ['🌻', '💛', '🐹', '🎂', '⭐', '🍓']

type Card = { id: number; emoji: string; key: string }

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MemoryGame({ onBack }: { onBack: () => void }) {
  const { markDone, setMemoryBest, memoryBestMs } = useProgress()
  const deck = useMemo(() => {
    const pairs = EMOJIS.flatMap((emoji, i) => [
      { id: i * 2, emoji, key: emoji },
      { id: i * 2 + 1, emoji, key: emoji },
    ])
    return shuffle(pairs)
  }, [])

  const [cards] = useState<Card[]>(deck)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [lock, setLock] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const [doneMs, setDoneMs] = useState<number | null>(null)

  const onFlip = (id: number, key: string) => {
    if (lock || flipped.includes(id) || matched.includes(key)) return
    const next = [...flipped, id]
    setFlipped(next)
    if (next.length < 2) return

    const [a, b] = next
    const ca = cards.find((c) => c.id === a)!
    const cb = cards.find((c) => c.id === b)!
    setLock(true)

    window.setTimeout(() => {
      if (ca.key === cb.key) {
        const nextMatched = [...matched, ca.key]
        setMatched(nextMatched)
        if (nextMatched.length === EMOJIS.length) {
          const ms = Date.now() - startedAt
          setDoneMs(ms)
          setMemoryBest(ms)
          markDone('memory')
        }
      }
      setFlipped([])
      setLock(false)
    }, 450)
  }

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Найди пару</span>
        <span />
      </div>

      <div className="card stack">
        <MissionHeader
          chapter={getStation('memory').chapter}
          title={getStation('memory').title}
          howTo={getStation('memory').howTo}
        />
        <DevSkip stationId="memory" onDone={onBack} />
        {memoryBestMs != null && (
          <p className="hint">Лучшее время: {(memoryBestMs / 1000).toFixed(1)}с</p>
        )}

        <div className="memory-grid">
          {cards.map((c) => {
            const isUp = flipped.includes(c.id) || matched.includes(c.key)
            return (
              <button
                key={c.id}
                type="button"
                className={`memory-card ${isUp ? 'flipped' : ''} ${matched.includes(c.key) ? 'matched' : ''}`}
                onClick={() => onFlip(c.id, c.key)}
                aria-label={isUp ? c.emoji : 'закрытая карта'}
              >
                {isUp ? c.emoji : '❔'}
              </button>
            )
          })}
        </div>

        {doneMs != null && (
          <>
            <p className="hint" style={{ textAlign: 'center' }}>
              Ура! За {(doneMs / 1000).toFixed(1)} секунд. Станция пройдена.
            </p>
            <div className="actions">
              <button type="button" className="primary-btn" onClick={onBack}>
                На карту
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
