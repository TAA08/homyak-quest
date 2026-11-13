import { useState } from 'react'
import { MissionHeader } from '../components/MissionHeader'
import { getStation, quiz } from '../data/content'
import { useProgress } from '../state/progress'

export function Quiz({ onBack }: { onBack: () => void }) {
  const { markDone, setQuizScore, quizScore } = useProgress()
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const q = quiz[step]

  const choose = (idx: number) => {
    if (picked != null || done) return
    setPicked(idx)
    const ok = idx === q.correctIndex
    const nextScore = score + (ok ? 1 : 0)
    setScore(nextScore)

    window.setTimeout(() => {
      if (step >= quiz.length - 1) {
        setQuizScore(nextScore)
        markDone('quiz')
        setDone(true)
      } else {
        setStep((s) => s + 1)
        setPicked(null)
      }
    }, 900)
  }

  return (
    <section className="stack">
      <div className="topbar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← карта
        </button>
        <span className="brand">Викторина</span>
        <span />
      </div>

      <div className="card stack">
        <MissionHeader
          chapter={getStation('quiz').chapter}
          title={getStation('quiz').title}
          howTo={getStation('quiz').howTo}
        />
        {!done ? (
          <>
            <div className="badge">
              Вопрос {step + 1} / {quiz.length}
            </div>
            <h2 className="screen-title" style={{ fontSize: '1.35rem' }}>
              {q.question}
            </h2>
            <div className="stack">
              {q.options.map((opt, idx) => {
                let cls = 'quiz-option'
                if (picked != null) {
                  if (idx === q.correctIndex) cls += ' correct'
                  else if (idx === picked) cls += ' wrong'
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    className={cls}
                    onClick={() => choose(idx)}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {picked != null && (
              <p className="hint">
                {picked === q.correctIndex ? q.reactionCorrect : q.reactionWrong}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="screen-title" style={{ fontSize: '1.5rem' }}>
              Результат: {score} из {quiz.length}
            </h2>
            <p className="lede">
              {score === quiz.length
                ? 'Идеально. Хомяк впечатлён.'
                : 'Уже тепло. Можно пройти ещё раз позже — рекорд сохраняется.'}
            </p>
            <p className="hint">Лучший результат: {Math.max(quizScore, score)}</p>
            <div className="actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setStep(0)
                  setScore(0)
                  setPicked(null)
                  setDone(false)
                }}
              >
                Ещё раз
              </button>
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
