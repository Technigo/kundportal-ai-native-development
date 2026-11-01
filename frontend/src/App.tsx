import { useEffect, useState } from 'react'
import './App.css'

type CheckState = 'checking' | 'available' | 'unavailable'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function checkAvailability(
  path: string,
): Promise<Exclude<CheckState, 'checking'>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`)
    return response.ok ? 'available' : 'unavailable'
  } catch {
    return 'unavailable'
  }
}

function statusText(status: CheckState): string {
  if (status === 'checking') {
    return 'Kontrollerar…'
  }
  return status === 'available' ? 'Tillgänglig' : 'Inte tillgänglig'
}

function App() {
  const [apiStatus, setApiStatus] = useState<CheckState>('checking')
  const [databaseStatus, setDatabaseStatus] = useState<CheckState>('checking')

  useEffect(() => {
    let active = true

    void checkAvailability('/health').then((status) => {
      if (active) setApiStatus(status)
    })
    void checkAvailability('/health/db').then((status) => {
      if (active) setDatabaseStatus(status)
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="app-shell">
      <h1>Kundserviceportalen</h1>
      <p role="status" aria-live="polite">
        API: {statusText(apiStatus)}
      </p>
      <p role="status" aria-live="polite">
        MySQL: {statusText(databaseStatus)}
      </p>
    </main>
  )
}

export default App
