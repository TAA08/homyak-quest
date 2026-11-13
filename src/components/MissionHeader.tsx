type Props = {
  chapter: string
  title: string
  howTo: string
}

export function MissionHeader({ chapter, title, howTo }: Props) {
  return (
    <header className="mission-header">
      <p className="mission-kicker">{chapter}</p>
      <h2 className="mission-title">{title}</h2>
      <p className="mission-how">{howTo}</p>
    </header>
  )
}
