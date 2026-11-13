import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { LEVEL_ORDER, type StationId } from '../data/content'

type Progress = {
  completed: Record<StationId, boolean>
  bestSeeds: number
  bestSeedsEndless: number
  bestSky: number
  bestSkyEndless: number
  bestDash: number
  bestDashEndless: number
  memoryBestMs: number | null
  quizScore: number
  markDone: (id: StationId) => void
  setBestSeeds: (n: number) => void
  setBestSeedsEndless: (n: number) => void
  setBestSky: (n: number) => void
  setBestSkyEndless: (n: number) => void
  setBestDash: (n: number) => void
  setBestDashEndless: (n: number) => void
  setMemoryBest: (ms: number) => void
  setQuizScore: (n: number) => void
  doneCount: number
  totalMissions: number
  campaignComplete: boolean
  isUnlocked: (id: StationId) => boolean
}

const STORAGE_KEY = 'homyak-quest-progress-v2'

type Stored = {
  completed: Partial<Record<StationId, boolean>>
  bestSeeds: number
  bestSeedsEndless?: number
  bestSky: number
  bestSkyEndless?: number
  bestDash: number
  bestDashEndless?: number
  memoryBestMs: number | null
  quizScore: number
}

const defaultCompleted: Record<StationId, boolean> = {
  seeds: false,
  skyraid: false,
  dash: false,
  memory: false,
  photos: false,
  facts: false,
  quiz: false,
  finale: false,
}

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        completed: {},
        bestSeeds: 0,
        bestSeedsEndless: 0,
        bestSky: 0,
        bestSkyEndless: 0,
        bestDash: 0,
        bestDashEndless: 0,
        memoryBestMs: null,
        quizScore: 0,
      }
    }
    return JSON.parse(raw) as Stored
  } catch {
    return {
      completed: {},
      bestSeeds: 0,
      bestSeedsEndless: 0,
      bestSky: 0,
      bestSkyEndless: 0,
      bestDash: 0,
      bestDashEndless: 0,
      memoryBestMs: null,
      quizScore: 0,
    }
  }
}

const ProgressContext = createContext<Progress | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const initial = load()
  const [completed, setCompleted] = useState<Record<StationId, boolean>>({
    ...defaultCompleted,
    ...initial.completed,
  })
  const [bestSeeds, setBestSeedsState] = useState(initial.bestSeeds ?? 0)
  const [bestSeedsEndless, setBestSeedsEndlessState] = useState(
    initial.bestSeedsEndless ?? 0,
  )
  const [bestSky, setBestSkyState] = useState(initial.bestSky ?? 0)
  const [bestSkyEndless, setBestSkyEndlessState] = useState(
    initial.bestSkyEndless ?? 0,
  )
  const [bestDash, setBestDashState] = useState(initial.bestDash ?? 0)
  const [bestDashEndless, setBestDashEndlessState] = useState(
    initial.bestDashEndless ?? 0,
  )
  const [memoryBestMs, setMemoryBestMs] = useState<number | null>(
    initial.memoryBestMs,
  )
  const [quizScore, setQuizScoreState] = useState(initial.quizScore)

  const persist = (next: Stored & { completed: Record<StationId, boolean> }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const snapshot = (): Stored & { completed: Record<StationId, boolean> } => ({
    completed,
    bestSeeds,
    bestSeedsEndless,
    bestSky,
    bestSkyEndless,
    bestDash,
    bestDashEndless,
    memoryBestMs,
    quizScore,
  })

  const value = useMemo<Progress>(() => {
    const doneCount = LEVEL_ORDER.filter((id) => completed[id]).length
    const campaignComplete = Boolean(completed.finale)

    const isUnlocked = (id: StationId) => {
      if (campaignComplete) return true
      const idx = LEVEL_ORDER.indexOf(id)
      if (idx <= 0) return true
      return LEVEL_ORDER.slice(0, idx).every((prev) => completed[prev])
    }

    return {
      completed,
      bestSeeds,
      bestSeedsEndless,
      bestSky,
      bestSkyEndless,
      bestDash,
      bestDashEndless,
      memoryBestMs,
      quizScore,
      doneCount,
      totalMissions: LEVEL_ORDER.length,
      campaignComplete,
      isUnlocked,
      markDone: (id) => {
        setCompleted((prev) => {
          const nextCompleted = { ...prev, [id]: true }
          persist({ ...snapshot(), completed: nextCompleted })
          return nextCompleted
        })
      },
      setBestSeeds: (n) => {
        setBestSeedsState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), bestSeeds: best })
          return best
        })
      },
      setBestSeedsEndless: (n) => {
        setBestSeedsEndlessState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), bestSeedsEndless: best })
          return best
        })
      },
      setBestSky: (n) => {
        setBestSkyState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), bestSky: best })
          return best
        })
      },
      setBestSkyEndless: (n) => {
        setBestSkyEndlessState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), bestSkyEndless: best })
          return best
        })
      },
      setBestDash: (n) => {
        setBestDashState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), bestDash: best })
          return best
        })
      },
      setBestDashEndless: (n) => {
        setBestDashEndlessState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), bestDashEndless: best })
          return best
        })
      },
      setMemoryBest: (ms) => {
        setMemoryBestMs((prev) => {
          const best = prev == null ? ms : Math.min(prev, ms)
          persist({ ...snapshot(), memoryBestMs: best })
          return best
        })
      },
      setQuizScore: (n) => {
        setQuizScoreState((prev) => {
          const best = Math.max(prev, n)
          persist({ ...snapshot(), quizScore: best })
          return best
        })
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    completed,
    bestSeeds,
    bestSeedsEndless,
    bestSky,
    bestSkyEndless,
    bestDash,
    bestDashEndless,
    memoryBestMs,
    quizScore,
  ])

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress outside provider')
  return ctx
}
