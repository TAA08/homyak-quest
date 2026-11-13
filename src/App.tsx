import { useState } from 'react'
import type { StationId } from './data/content'
import { ProgressProvider } from './state/progress'
import { Welcome } from './screens/Welcome'
import { Hub } from './screens/Hub'
import { CatchSeeds } from './screens/CatchSeeds'
import { SkyRaid } from './screens/SkyRaid'
import { LaneDash } from './screens/LaneDash'
import { MemoryGame } from './screens/MemoryGame'
import { Photos } from './screens/Photos'
import { Facts } from './screens/Facts'
import { Quiz } from './screens/Quiz'
import { Finale } from './screens/Finale'

type Screen = 'welcome' | 'hub' | StationId

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const toHub = () => setScreen('hub')

  return (
    <ProgressProvider>
      <div className="app-shell">
        {screen === 'welcome' && <Welcome onStart={toHub} />}
        {screen === 'hub' && <Hub onOpen={(id) => setScreen(id)} />}
        {screen === 'seeds' && <CatchSeeds onBack={toHub} />}
        {screen === 'skyraid' && <SkyRaid onBack={toHub} />}
        {screen === 'dash' && <LaneDash onBack={toHub} />}
        {screen === 'memory' && <MemoryGame onBack={toHub} />}
        {screen === 'photos' && <Photos onBack={toHub} />}
        {screen === 'facts' && <Facts onBack={toHub} />}
        {screen === 'quiz' && <Quiz onBack={toHub} />}
        {screen === 'finale' && <Finale onBack={toHub} />}
      </div>
    </ProgressProvider>
  )
}
