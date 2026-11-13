import { BRIEFING, HERO } from '../data/content'

export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className="stack">
      <div className="briefing-banner">
        <p className="briefing-code">{HERO.codename}</p>
        <h1>{HERO.title}</h1>
        <p className="lede">{HERO.subtitle}</p>
      </div>

      <div className="card stack">
        <div className="badge">🎂 {HERO.birthday} · {HERO.agent}</div>
        <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>
          {BRIEFING.headline}
        </h2>
        <p>{BRIEFING.body}</p>
        <p className="hint">{BRIEFING.tip}</p>
      </div>

      <div className="actions">
        <button type="button" className="primary-btn mission-btn" onClick={onStart}>
          ▶ START MISSION
        </button>
      </div>
      <p className="hint" style={{ textAlign: 'center' }}>
        Удобно с телефона. Можно добавить на домашний экран.
      </p>
    </section>
  )
}
