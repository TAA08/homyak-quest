import { useEffect, useRef, useState } from 'react'
import { CrownLoot, KnightHomyak, MouseTrap } from '../components/DashSprites'
import { DevSkip } from '../components/DevSkip'
import { MissionHeader } from '../components/MissionHeader'
import { getStation } from '../data/content'
import { playSfx, unlockAudio } from '../lib/sfx'
import { useProgress } from '../state/progress'

type Phase = 'idle' | 'playing' | 'won' | 'lost'
type Mode = 'goal' | 'endless'
type Kind = 'crown' | 'trap'
type Item = { id: number; lane: number; y: number; kind: Kind }

const LANES = 3
const GOAL = 12
const MAX_HITS = 3
const SPEED = 2.1
const SPAWN_MS = 700

function endlessTier(score: number) {
  return Math.floor(score / 6)
}

function endlessParams(score: number) {
  const tier = endlessTier(score)
  return {
    tier: tier + 1,
    speed: Math.min(4.2, SPEED + tier * 0.22),
    spawnMs: Math.max(320, SPAWN_MS - tier * 45),
    trapChance: Math.min(0.68, 0.34 + tier * 0.05),
  }
}

export function LaneDash({ onBack }: { onBack: () => void }) {
  const {
    markDone,
    setBestDash,
    setBestDashEndless,
    bestDash,
    bestDashEndless,
    completed,
  } = useProgress()
  const [mode, setMode] = useState<Mode>('goal')
  const [phase, setPhase] = useState<Phase>('idle')
  const [lane, setLane] = useState(1)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [items, setItems] = useState<Item[]>([])
  const [tier, setTier] = useState(1)

  const phaseRef = useRef<Phase>('idle')
  const modeRef = useRef<Mode>('goal')
  const laneRef = useRef(1)
  const scoreRef = useRef(0)
  const hitsRef = useRef(0)
  const itemsRef = useRef<Item[]>([])
  const idRef = useRef(0)
  const spawnCoolRef = useRef(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const saveScore = (n: number) => {
    if (modeRef.current === 'endless') setBestDashEndless(n)
    else setBestDash(n)
  }

  const endWon = () => {
    phaseRef.current = 'won'
    setPhase('won')
    saveScore(scoreRef.current)
    markDone('dash')
    playSfx('win')
  }

  const endLost = () => {
    phaseRef.current = 'lost'
    setPhase('lost')
    saveScore(scoreRef.current)
    playSfx('lose')
  }

  useEffect(() => {
    if (phase !== 'playing') return
    spawnCoolRef.current = 0

    const tick = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return

      const endless = modeRef.current === 'endless'
      const params = endless
        ? endlessParams(scoreRef.current)
        : { tier: 1, speed: SPEED, spawnMs: SPAWN_MS, trapChance: 0.38 }

      spawnCoolRef.current -= 40
      if (spawnCoolRef.current <= 0) {
        idRef.current += 1
        const batch: Item[] = [
          {
            id: idRef.current,
            lane: Math.floor(Math.random() * LANES),
            y: -8,
            kind: Math.random() < params.trapChance ? 'trap' : 'crown',
          },
        ]
        if (endless && params.tier >= 4 && Math.random() < 0.35) {
          idRef.current += 1
          let lane2 = Math.floor(Math.random() * LANES)
          if (lane2 === batch[0].lane) lane2 = (lane2 + 1) % LANES
          batch.push({
            id: idRef.current,
            lane: lane2,
            y: -8,
            kind: Math.random() < params.trapChance ? 'trap' : 'crown',
          })
        }
        itemsRef.current = [...itemsRef.current.slice(-14), ...batch]
        setItems(itemsRef.current)
        spawnCoolRef.current = params.spawnMs
      }

      const next: Item[] = []
      for (const it of itemsRef.current) {
        const y = it.y + params.speed
        if (y > 110) continue

        const nearPlayer = y > 72 && y < 92 && it.lane === laneRef.current
        if (nearPlayer) {
          if (it.kind === 'crown') {
            scoreRef.current += 1
            setScore(scoreRef.current)
            saveScore(scoreRef.current)
            playSfx('coin')
            if (endless) setTier(endlessParams(scoreRef.current).tier)
            if (!endless && scoreRef.current >= GOAL) {
              endWon()
              return
            }
          } else {
            hitsRef.current += 1
            setHits(hitsRef.current)
            playSfx('bomb')
            if (hitsRef.current >= MAX_HITS) {
              endLost()
              return
            }
          }
          continue
        }
        next.push({ ...it, y })
      }
      itemsRef.current = next
      setItems(next)
    }, 40)

    return () => {
      window.clearInterval(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const goLane = (next: number) => {
    const clamped = Math.min(LANES - 1, Math.max(0, next))
    if (clamped === laneRef.current) return
    laneRef.current = clamped
    setLane(clamped)
    playSfx('dash')
  }

  const start = (nextMode: Mode) => {
    unlockAudio()
    modeRef.current = nextMode
    setMode(nextMode)
    scoreRef.current = 0
    hitsRef.current = 0
    laneRef.current = 1
    itemsRef.current = []
    setScore(0)
    setHits(0)
    setLane(1)
    setItems([])
    setTier(1)
    setPhase('playing')
  }

  const station = getStation('dash')
  const canEndless = completed.dash || phase === 'won'

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">{station.title}</span>
        <span />
      </div>

      <div className="card stack">
        <MissionHeader
          chapter={station.chapter}
          title={station.title}
          howTo={station.howTo}
        />
        <div className="hud">
          <span>
            👑 {score}
            {mode === 'goal' ? `/${GOAL}` : ''}
          </span>
          <span>
            {'💔'.repeat(hits)}
            {'🤍'.repeat(Math.max(0, MAX_HITS - hits))}
          </span>
          <span>
            {mode === 'endless'
              ? `ур. ${tier} · рек. ${Math.max(bestDashEndless, score)}`
              : `рекорд ${bestDash}`}
          </span>
        </div>

        <div
          className={`dash-stage ${phase === 'playing' ? 'playable' : ''}`}
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            if (phase !== 'playing' || touchStartX.current == null) return
            const x = e.changedTouches[0]?.clientX ?? touchStartX.current
            const dx = x - touchStartX.current
            if (Math.abs(dx) > 28) goLane(laneRef.current + (dx > 0 ? 1 : -1))
            touchStartX.current = null
          }}
        >
          <div className="dash-stone" aria-hidden />
          <div className="dash-torches" aria-hidden>
            <span />
            <span />
          </div>
          <div className="dash-lanes">
            {Array.from({ length: LANES }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`dash-lane ${lane === i ? 'active' : ''}`}
                onClick={() => phase === 'playing' && goLane(i)}
                aria-label={`дорожка ${i + 1}`}
              />
            ))}
          </div>

          {items.map((it) => (
            <div
              key={it.id}
              className={`dash-item ${it.kind}`}
              style={{
                left: `${(it.lane + 0.5) * (100 / LANES)}%`,
                top: `${it.y}%`,
              }}
            >
              {it.kind === 'crown' ? (
                <CrownLoot className="dash-sprite" />
              ) : (
                <MouseTrap className="dash-sprite" />
              )}
            </div>
          ))}

          <div
            className="dash-player"
            style={{ left: `${(lane + 0.5) * (100 / LANES)}%` }}
            aria-hidden
          >
            <KnightHomyak className="dash-sprite hero" />
          </div>
        </div>

        {phase === 'idle' && (
          <>
            <div className="actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => start('goal')}
              >
                В донжон · {GOAL} корон
              </button>
              {canEndless && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => start('endless')}
                >
                  Бесконечный
                </button>
              )}
            </div>
            <DevSkip stationId="dash" onDone={onBack} />
            {bestDashEndless > 0 && (
              <p className="hint">Рекорд бесконечного: {bestDashEndless}</p>
            )}
          </>
        )}

        {phase === 'won' && (
          <>
            <p className="hint" style={{ textAlign: 'center' }}>
              Короны собраны, мышеловки обойдены. Донжон покорён!
            </p>
            <div className="actions">
              <button type="button" className="primary-btn" onClick={onBack}>
                На карту
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => start('endless')}
              >
                Бесконечный
              </button>
            </div>
          </>
        )}

        {phase === 'lost' && (
          <>
            <p className="hint" style={{ textAlign: 'center' }}>
              {mode === 'endless'
                ? `Мышеловка щёлкнула. Корон: ${score} · ур. ${tier}. Рекорд ∞: ${Math.max(bestDashEndless, score)}.`
                : `Мышеловка щёлкнула. Корон: ${score}/${GOAL}.`}
            </p>
            <div className="actions">
              {mode === 'endless' ? (
                <>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => start('endless')}
                  >
                    Снова
                  </button>
                  <button type="button" className="secondary-btn" onClick={onBack}>
                    На карту
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="primary-btn" onClick={onBack}>
                    На карту
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => start('goal')}
                  >
                    Снова
                  </button>
                  {canEndless && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => start('endless')}
                    >
                      Бесконечный
                    </button>
                  )}
                </>
              )}
            </div>
            <DevSkip stationId="dash" onDone={onBack} />
          </>
        )}

        {completed.dash && phase === 'idle' && (
          <p className="hint">
            Уже пройдено. Рекорд миссии: {bestDash}
            {bestDashEndless > 0 ? ` · ∞: ${bestDashEndless}` : ''}.
          </p>
        )}
      </div>
    </section>
  )
}
