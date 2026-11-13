import { useEffect, useRef, useState } from 'react'
import { DevSkip } from '../components/DevSkip'
import { MissionHeader } from '../components/MissionHeader'
import {
  EnemyBrute,
  EnemyGunner,
  EnemyScout,
  SpaceHomyak,
} from '../components/SkySprites'
import { getStation } from '../data/content'
import { playSfx, unlockAudio } from '../lib/sfx'
import { useProgress } from '../state/progress'

type Phase = 'brief' | 'playing' | 'won' | 'lost'
type Mode = 'goal' | 'endless'
type EnemyKind = 'scout' | 'brute' | 'gunner'

type Enemy = {
  id: number
  x: number
  y: number
  hp: number
  kind: EnemyKind
  cool: number
}
type Bullet = { id: number; x: number; y: number; friendly: boolean }
type Coin = { id: number; x: number; y: number }
type Floater = { id: number; x: number; y: number; text: string }

const GOAL_SCORE = 200
const MAX_LIVES = 3

/** Волна бесконечного рейда: каждые 80 очков */
function endlessWave(score: number) {
  return Math.floor(score / 80) + 1
}

function endlessRaidParams(score: number) {
  const wave = endlessWave(score)
  const t = wave - 1
  return {
    wave,
    spawnMs: Math.max(280, 560 - t * 35),
    batch: t >= 5 ? 3 : t >= 2 ? 2 : 1,
    speedMul: Math.min(2.1, 1 + t * 0.12),
    gunnerChance: Math.min(0.55, 0.22 + t * 0.06),
    bruteChance: Math.min(0.35, 0.18 + t * 0.04),
    gunCool: Math.max(22, 55 - t * 4),
    hostileSpeed: Math.min(5.2, 3.2 + t * 0.25),
  }
}

function rollKind(endless: boolean, score = 0): EnemyKind {
  const r = Math.random()
  if (endless) {
    const p = endlessRaidParams(score)
    if (r < p.gunnerChance) return 'gunner'
    if (r < p.gunnerChance + p.bruteChance) return 'brute'
    return 'scout'
  }
  if (r < 0.28) return 'gunner'
  if (r < 0.48) return 'brute'
  return 'scout'
}

function hpFor(kind: EnemyKind) {
  if (kind === 'brute') return 3
  if (kind === 'gunner') return 2
  return 1
}

function speedFor(kind: EnemyKind, mul = 1) {
  const base = kind === 'scout' ? 1.45 : kind === 'brute' ? 0.75 : 1.05
  return base * mul
}

export function SkyRaid({ onBack }: { onBack: () => void }) {
  const {
    markDone,
    setBestSky,
    setBestSkyEndless,
    bestSky,
    bestSkyEndless,
    completed,
  } = useProgress()

  const saveScore = (n: number) => {
    if (modeRef.current === 'endless') setBestSkyEndless(n)
    else setBestSky(n)
  }
  const [phase, setPhase] = useState<Phase>('brief')
  const [mode, setMode] = useState<Mode>('goal')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [coins, setCoinsHud] = useState(0)
  const [playerY, setPlayerY] = useState(50)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [loot, setLoot] = useState<Coin[]>([])
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [hurt, setHurt] = useState(false)
  const [wave, setWave] = useState(1)

  const stageRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<Phase>('brief')
  const modeRef = useRef<Mode>('goal')
  const playerYRef = useRef(50)
  const scoreRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const coinsRef = useRef(0)
  const enemiesRef = useRef<Enemy[]>([])
  const bulletsRef = useRef<Bullet[]>([])
  const lootRef = useRef<Coin[]>([])
  const idRef = useRef(0)
  const invulnRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  const spawnCoolRef = useRef(0)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const bumpScore = (n: number, x: number, y: number, label: string) => {
    scoreRef.current += n
    setScore(scoreRef.current)
    saveScore(scoreRef.current)
    if (modeRef.current === 'endless') {
      setWave(endlessWave(scoreRef.current))
    }
    idRef.current += 1
    const fid = idRef.current
    setFloaters((prev) => [...prev.slice(-6), { id: fid, x, y, text: label }])
    window.setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== fid))
    }, 700)
  }

  const hurtPlayer = () => {
    const now = Date.now()
    if (now < invulnRef.current) return
    invulnRef.current = now + 900
    livesRef.current -= 1
    setLives(livesRef.current)
    setHurt(true)
    playSfx('bomb')
    window.setTimeout(() => setHurt(false), 220)
    if (livesRef.current <= 0) {
      phaseRef.current = 'lost'
      setPhase('lost')
      playSfx('lose')
    }
  }

  const endWon = () => {
    phaseRef.current = 'won'
    setPhase('won')
    markDone('skyraid')
    playSfx('win')
  }

  useEffect(() => {
    if (phase !== 'playing') return
    spawnCoolRef.current = 0

    const shoot = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return
      idRef.current += 1
      bulletsRef.current = [
        ...bulletsRef.current.slice(-18),
        { id: idRef.current, x: 24, y: playerYRef.current, friendly: true },
      ]
      setBullets(bulletsRef.current)
      playSfx('shoot')
    }, 360)

    const tick = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return

      const endless = modeRef.current === 'endless'
      const raid = endless
        ? endlessRaidParams(scoreRef.current)
        : {
            wave: 1,
            spawnMs: 640,
            batch: Math.random() < 0.55 ? 2 : 1,
            speedMul: 1,
            gunnerChance: 0.28,
            bruteChance: 0.2,
            gunCool: 55,
            hostileSpeed: 3.2,
          }

      spawnCoolRef.current -= 40
      if (spawnCoolRef.current <= 0) {
        const batch = endless ? raid.batch : Math.random() < 0.55 ? 2 : 1
        for (let i = 0; i < batch; i += 1) {
          idRef.current += 1
          const kind = rollKind(endless, scoreRef.current)
          enemiesRef.current = [
            ...enemiesRef.current.slice(-18),
            {
              id: idRef.current,
              x: 108 + i * 8,
              y: 12 + Math.random() * 76,
              hp: hpFor(kind),
              kind,
              cool: 30 + Math.floor(Math.random() * 35),
            },
          ]
        }
        if (Math.random() < 0.5) {
          idRef.current += 1
          lootRef.current = [
            ...lootRef.current.slice(-10),
            {
              id: idRef.current,
              x: 100 + Math.random() * 20,
              y: 15 + Math.random() * 70,
            },
          ]
        }
        spawnCoolRef.current = raid.spawnMs
      }

      bulletsRef.current = bulletsRef.current
        .map((b) => ({
          ...b,
          x: b.friendly ? b.x + 4.4 : b.x - raid.hostileSpeed,
        }))
        .filter((b) => b.x > -8 && b.x < 118)

      const nextEnemies: Enemy[] = []
      for (const e of enemiesRef.current) {
        const x = e.x - speedFor(e.kind, raid.speedMul)
        if (x < -12) continue
        let cool = e.cool - 1
        if (e.kind === 'gunner' && cool <= 0 && x < 95 && x > 25) {
          idRef.current += 1
          bulletsRef.current.push({
            id: idRef.current,
            x: e.x - 4,
            y: e.y,
            friendly: false,
          })
          cool = raid.gunCool + Math.floor(Math.random() * 20)
        }
        nextEnemies.push({ ...e, x, cool })
      }
      enemiesRef.current = nextEnemies

      lootRef.current = lootRef.current
        .map((c) => ({ ...c, x: c.x - 1.05 }))
        .filter((c) => c.x > -8)

      const remainingEnemies: Enemy[] = []
      let remainingBullets = [...bulletsRef.current]

      for (const e of enemiesRef.current) {
        let hp = e.hp
        for (let i = remainingBullets.length - 1; i >= 0; i -= 1) {
          const b = remainingBullets[i]
          if (!b.friendly) continue
          if (Math.abs(b.x - e.x) < 8 && Math.abs(b.y - e.y) < 9) {
            remainingBullets.splice(i, 1)
            hp -= 1
            playSfx('hit')
            break
          }
        }
        if (hp <= 0) {
          const pts = e.kind === 'brute' ? 20 : e.kind === 'gunner' ? 15 : 10
          bumpScore(pts, e.x, e.y, `+${pts}`)
          continue
        }
        remainingEnemies.push({ ...e, hp })
      }

      enemiesRef.current = remainingEnemies

      const stillBullets: Bullet[] = []
      for (const b of remainingBullets) {
        if (!b.friendly) {
          if (Math.abs(b.x - 18) < 8 && Math.abs(b.y - playerYRef.current) < 9) {
            hurtPlayer()
            if (phaseRef.current !== 'playing') break
            continue
          }
        }
        stillBullets.push(b)
      }
      bulletsRef.current = stillBullets

      const remainingLoot: Coin[] = []
      for (const c of lootRef.current) {
        if (Math.abs(c.x - 18) < 10 && Math.abs(c.y - playerYRef.current) < 10) {
          coinsRef.current += 1
          setCoinsHud(coinsRef.current)
          bumpScore(5, c.x, c.y, '+5')
          playSfx('coin')
          continue
        }
        remainingLoot.push(c)
      }
      lootRef.current = remainingLoot

      for (const e of enemiesRef.current) {
        if (Math.abs(e.x - 18) < 9 && Math.abs(e.y - playerYRef.current) < 10) {
          hurtPlayer()
          enemiesRef.current = enemiesRef.current.filter((x) => x.id !== e.id)
          if (phaseRef.current !== 'playing') break
        }
      }

      setEnemies([...enemiesRef.current])
      setBullets([...bulletsRef.current])
      setLoot([...lootRef.current])

      if (
        modeRef.current === 'goal' &&
        scoreRef.current >= GOAL_SCORE &&
        phaseRef.current === 'playing'
      ) {
        endWon()
      }
    }, 40)

    return () => {
      window.clearInterval(shoot)
      window.clearInterval(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const moveToClientY = (clientY: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const ratio = ((clientY - rect.top) / rect.height) * 100
    const y = Math.min(88, Math.max(10, ratio))
    playerYRef.current = y
    setPlayerY(y)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'playing') return
    unlockAudio()
    pointerIdRef.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    moveToClientY(e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'playing') return
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return
    moveToClientY(e.clientY)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return
    pointerIdRef.current = null
  }

  const start = (nextMode: Mode) => {
    unlockAudio()
    modeRef.current = nextMode
    setMode(nextMode)
    scoreRef.current = 0
    livesRef.current = MAX_LIVES
    coinsRef.current = 0
    playerYRef.current = 50
    enemiesRef.current = []
    bulletsRef.current = []
    lootRef.current = []
    invulnRef.current = 0
    setScore(0)
    setLives(MAX_LIVES)
    setCoinsHud(0)
    setPlayerY(50)
    setEnemies([])
    setBullets([])
    setLoot([])
    setFloaters([])
    setHurt(false)
    setWave(1)
    setPhase('playing')
  }

  const livesLabel =
    '❤'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, MAX_LIVES - lives))
  const canEndless = completed.skyraid || phase === 'won'
  const station = getStation('skyraid')

  const EnemyIcon = ({ kind }: { kind: EnemyKind }) => {
    if (kind === 'brute') return <EnemyBrute className="sky-sprite enemy" />
    if (kind === 'gunner') return <EnemyGunner className="sky-sprite enemy" />
    return <EnemyScout className="sky-sprite enemy" />
  }

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Неборазорение</span>
        <span />
      </div>

      {phase === 'brief' && (
        <div className="card stack">
          <MissionHeader
            chapter={station.chapter}
            title={station.title}
            howTo={station.howTo}
          />
          <p className="hint">
            Герой — космический Хомяк. Разведчики, тяжёлые гаргульи и стрелки,
            которые стреляют в ответ.
          </p>
          <div className="actions">
            <button
              type="button"
              className="primary-btn mission-btn"
              onClick={() => start('goal')}
            >
              ▶ START MISSION
            </button>
            {canEndless && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => start('endless')}
              >
                Бесконечный рейд
              </button>
            )}
          </div>
          <DevSkip stationId="skyraid" onDone={onBack} />
          {completed.skyraid && (
            <p className="hint">
              Рекорд миссии: {bestSky}
              {bestSkyEndless > 0 ? ` · ∞: ${bestSkyEndless}` : ''}. Можно
              переиграть свободно.
            </p>
          )}
        </div>
      )}

      {(phase === 'playing' || phase === 'won' || phase === 'lost') && (
        <div className="card stack">
          {phase !== 'playing' && (
            <MissionHeader
              chapter={station.chapter}
              title={station.title}
              howTo={station.howTo}
            />
          )}
          <div className="hud sky-hud">
            <span>{livesLabel}</span>
            <span>
              {mode === 'endless'
                ? `волна ${wave} · рек. ${Math.max(bestSkyEndless, score)}`
                : `🪙 ${coins}`}
            </span>
            <span>
              {score}
              {mode === 'goal' ? `/${GOAL_SCORE}` : ' ∞'}
            </span>
          </div>

          <div
            ref={stageRef}
            className={`sky-stage ${hurt ? 'hurt' : ''} ${phase === 'playing' ? 'playable' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="sky-stars" aria-hidden />
            <div className="sky-ship" style={{ top: `${playerY}%` }} aria-hidden>
              <SpaceHomyak className="sky-sprite hero" />
            </div>
            {bullets.map((b) => (
              <div
                key={b.id}
                className={b.friendly ? 'sky-bullet' : 'sky-bullet hostile'}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              />
            ))}
            {enemies.map((e) => (
              <div
                key={e.id}
                className={`sky-enemy-wrap kind-${e.kind}`}
                style={{ left: `${e.x}%`, top: `${e.y}%` }}
              >
                <EnemyIcon kind={e.kind} />
              </div>
            ))}
            {loot.map((c) => (
              <div
                key={c.id}
                className="sky-coin"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                ◆
              </div>
            ))}
            {floaters.map((f) => (
              <div
                key={f.id}
                className="sky-floater"
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
              >
                {f.text}
              </div>
            ))}
            {phase === 'playing' && <p className="stage-hint">води ↑↓</p>}
          </div>

          {phase === 'playing' && <DevSkip stationId="skyraid" onDone={onBack} />}

          {phase === 'won' && (
            <>
              <p className="hint" style={{ textAlign: 'center' }}>
                Небо чистое! Миссия выполнена. Очки: {score}.
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
                  ? `Рейд окончен: ${score} · волна ${wave}. Рекорд ∞: ${Math.max(bestSkyEndless, score)}.`
                  : `Корабль подбит… Набрано ${score} из ${GOAL_SCORE}.`}
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
              <DevSkip stationId="skyraid" onDone={onBack} />
            </>
          )}
        </div>
      )}
    </section>
  )
}
