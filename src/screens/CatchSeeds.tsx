import { useEffect, useRef, useState } from 'react'
import { DevSkip } from '../components/DevSkip'
import { MissionHeader } from '../components/MissionHeader'
import { getStation } from '../data/content'
import { playSfx, unlockAudio } from '../lib/sfx'
import { useProgress } from '../state/progress'

type DropKind = 'seed' | 'bomb'
type Drop = { id: number; x: number; y: number; kind: DropKind }

type Mode = 'goal' | 'endless'
type Phase = 'idle' | 'playing' | 'won' | 'lost'

const GOAL_SCORE = 30
const MAX_LIVES = 3
const FALL_SPEED = 1.55
const SPAWN_MS = 560
const BOMB_CHANCE_GOAL = 0.36
const CATCH_RADIUS = 11
const CATCH_Y_MIN = 78
const CATCH_Y_MAX = 98
const INVULN_MS = 700

/** Уровень бесконечного режима: растёт каждые 8 зёрен */
function endlessTier(score: number) {
  return Math.floor(score / 8)
}

function endlessParams(score: number) {
  const tier = endlessTier(score)
  return {
    tier: tier + 1,
    fallSpeed: Math.min(3.35, FALL_SPEED + tier * 0.2),
    spawnMs: Math.max(260, SPAWN_MS - tier * 40),
    bombChance: Math.min(0.72, 0.34 + tier * 0.055),
  }
}

export function CatchSeeds({ onBack }: { onBack: () => void }) {
  const {
    markDone,
    setBestSeeds,
    setBestSeedsEndless,
    bestSeeds,
    bestSeedsEndless,
    completed,
  } = useProgress()

  const saveScore = (n: number) => {
    if (modeRef.current === 'endless') setBestSeedsEndless(n)
    else setBestSeeds(n)
  }
  const [mode, setMode] = useState<Mode>('goal')
  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [drops, setDrops] = useState<Drop[]>([])
  const [hamsterX, setHamsterX] = useState(50)
  const [hurt, setHurt] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [tier, setTier] = useState(1)

  const stageRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const scoreRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const modeRef = useRef<Mode>('goal')
  const phaseRef = useRef<Phase>('idle')
  const hamsterXRef = useRef(50)
  const dropsRef = useRef<Drop[]>([])
  const invulnUntilRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  const spawnCoolRef = useRef(0)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const syncDrops = (next: Drop[]) => {
    dropsRef.current = next
    setDrops(next)
  }

  const endLost = () => {
    phaseRef.current = 'lost'
    setPhase('lost')
    syncDrops([])
    setDragging(false)
    saveScore(scoreRef.current)
    playSfx('lose')
  }

  const endWon = () => {
    phaseRef.current = 'won'
    setPhase('won')
    syncDrops([])
    setDragging(false)
    saveScore(scoreRef.current)
    markDone('seeds')
    playSfx('win')
  }

  const applyHit = (kind: DropKind) => {
    if (kind === 'bomb') {
      if (Date.now() < invulnUntilRef.current) return
      invulnUntilRef.current = Date.now() + INVULN_MS
      livesRef.current -= 1
      setLives(livesRef.current)
      setHurt(true)
      playSfx('bomb')
      window.setTimeout(() => setHurt(false), 220)
      if (livesRef.current <= 0) endLost()
      return
    }

    scoreRef.current += 1
    setScore(scoreRef.current)
    saveScore(scoreRef.current)
    playSfx('eat')

    if (modeRef.current === 'endless') {
      setTier(endlessParams(scoreRef.current).tier)
    }

    if (modeRef.current === 'goal' && scoreRef.current >= GOAL_SCORE) {
      endWon()
    }
  }

  useEffect(() => {
    if (phase !== 'playing') return
    spawnCoolRef.current = 0

    const move = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return

      const endless = modeRef.current === 'endless'
      const params = endless
        ? endlessParams(scoreRef.current)
        : { tier: 1, fallSpeed: FALL_SPEED, spawnMs: SPAWN_MS, bombChance: BOMB_CHANCE_GOAL }

      spawnCoolRef.current -= 40
      if (spawnCoolRef.current <= 0) {
        const batch: Drop[] = []
        idRef.current += 1
        batch.push({
          id: idRef.current,
          x: 10 + Math.random() * 80,
          y: -4,
          kind: Math.random() < params.bombChance ? 'bomb' : 'seed',
        })
        if (endless && params.tier >= 4 && Math.random() < 0.28) {
          idRef.current += 1
          batch.push({
            id: idRef.current,
            x: 10 + Math.random() * 80,
            y: -4,
            kind: Math.random() < params.bombChance ? 'bomb' : 'seed',
          })
        }
        syncDrops([...dropsRef.current.slice(-16), ...batch])
        spawnCoolRef.current = params.spawnMs
      }

      const hx = hamsterXRef.current
      const kept: Drop[] = []
      const hits: DropKind[] = []

      for (const d of dropsRef.current) {
        const y = d.y + params.fallSpeed
        if (y >= 110) continue

        const inCatchBand = y >= CATCH_Y_MIN && y <= CATCH_Y_MAX
        const close = Math.abs(d.x - hx) <= CATCH_RADIUS

        if (inCatchBand && close) {
          hits.push(d.kind)
          continue
        }

        kept.push({ ...d, y })
      }

      syncDrops(kept)
      for (const kind of hits) {
        if (phaseRef.current !== 'playing') break
        applyHit(kind)
      }
    }, 40)

    return () => {
      window.clearInterval(move)
    }
    // Game loop uses refs for live values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const moveHamsterToClientX = (clientX: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const ratio = ((clientX - rect.left) / rect.width) * 100
    const x = Math.min(90, Math.max(10, ratio))
    hamsterXRef.current = x
    setHamsterX(x)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'playing') return
    unlockAudio()
    pointerIdRef.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    moveHamsterToClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'playing') return
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return
    if (!dragging && pointerIdRef.current == null) return
    moveHamsterToClientX(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return
    pointerIdRef.current = null
    setDragging(false)
  }

  const start = (nextMode: Mode) => {
    unlockAudio()
    modeRef.current = nextMode
    setMode(nextMode)
    scoreRef.current = 0
    livesRef.current = MAX_LIVES
    hamsterXRef.current = 50
    invulnUntilRef.current = 0
    setScore(0)
    setLives(MAX_LIVES)
    setHamsterX(50)
    setTier(1)
    syncDrops([])
    setHurt(false)
    setDragging(false)
    setPhase('playing')
  }

  const livesLabel =
    '❤'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, MAX_LIVES - lives))
  const canEndless = completed.seeds || phase === 'won'

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Лови зёрнышки</span>
        <span />
      </div>

      <div className="card stack">
        <MissionHeader
          chapter={getStation('seeds').chapter}
          title={getStation('seeds').title}
          howTo={getStation('seeds').howTo}
        />
        <div className="hud">
          <span>
            🌻 {score}
            {mode === 'goal' ? ` / ${GOAL_SCORE}` : ''}
          </span>
          <span aria-label={`жизни ${lives}`}>{livesLabel}</span>
          <span>
            {mode === 'endless'
              ? `ур. ${tier} · рек. ${Math.max(bestSeedsEndless, score)}`
              : `рекорд ${bestSeeds}`}
          </span>
        </div>

        <div
          ref={stageRef}
          className={`game-stage ${hurt ? 'hurt' : ''} ${phase === 'playing' ? 'playable' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {drops.map((d) => (
            <div
              key={d.id}
              className={d.kind === 'bomb' ? 'bomb' : 'seed'}
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              aria-hidden
            >
              {d.kind === 'bomb' ? '💣' : '•'}
            </div>
          ))}
          <div
            className="homyak-catcher"
            style={{ left: `${hamsterX}%` }}
            aria-hidden
          >
            🐹
          </div>
          {phase === 'playing' && (
            <p className="stage-hint">води пальцем ← →</p>
          )}
        </div>

        {phase === 'idle' && (
          <>
            <div className="actions">
              <button type="button" className="primary-btn" onClick={() => start('goal')}>
                Старт · {GOAL_SCORE} зёрен
              </button>
              {canEndless && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => start('endless')}
                >
                  Бесконечный режим
                </button>
              )}
            </div>
            <DevSkip stationId="seeds" onDone={onBack} />
            {bestSeedsEndless > 0 && (
              <p className="hint">Рекорд бесконечного: {bestSeedsEndless}</p>
            )}
          </>
        )}

        {phase === 'won' && (
          <>
            <p className="hint" style={{ textAlign: 'center' }}>
              Хомяк сыт! Миссия выполнена — на карте уже открыта следующая глава.
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
                ? `Конец забега: ${score} · ур. ${tier}. Рекорд ∞: ${Math.max(bestSeedsEndless, score)}.`
                : `Ой, бомба… Набрано ${score} из ${GOAL_SCORE}. Попробуй ещё.`}
            </p>
            <div className="actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => start(mode)}
              >
                Снова
              </button>
              {canEndless && mode === 'goal' && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => start('endless')}
                >
                  Бесконечный
                </button>
              )}
              {mode === 'endless' && (
                <button type="button" className="secondary-btn" onClick={onBack}>
                  На карту
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
