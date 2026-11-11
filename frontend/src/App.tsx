import { useEffect, useState } from 'react'
import type { StatusFilter } from './domain/ticket'
import { TicketDetail } from './features/tickets/TicketDetail'
import { TicketForm } from './features/tickets/TicketForm'
import { TicketList } from './features/tickets/TicketList'
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
  // K8: filtret ligger här så att det finns kvar när vyer byts, men inte efter omladdning
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  // Ändras efter registrering så att listan hämtas på nytt
  const [listVersion, setListVersion] = useState(0)

  function openForm() {
    setSelectedTicketId(null)
    setShowForm(true)
  }

  function selectTicket(id: number) {
    setShowForm(false)
    setSelectedTicketId(id)
  }

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
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo" aria-hidden="true">
            J
          </span>
          <span>Jiriga</span>
        </div>
        <nav aria-label="Huvudmeny">
          <a className="nav-link" href="/" aria-current="page">
            Ärenden
          </a>
        </nav>
        <div className="system-status">
          <p role="status" aria-live="polite">
            API: {statusText(apiStatus)}
          </p>
          <p role="status" aria-live="polite">
            MySQL: {statusText(databaseStatus)}
          </p>
        </div>
      </aside>
      <main className="content">
        <div className="content-header">
          <h1>Ärenden</h1>
          {!showForm && (
            <button type="button" className="new-ticket-button" onClick={openForm}>
              Nytt ärende
            </button>
          )}
        </div>
        <div className="ticket-layout">
          <TicketList
            key={listVersion}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            selectedTicketId={selectedTicketId}
            onSelectTicket={selectTicket}
          />
          {showForm && (
            <TicketForm
              onCreated={() => setListVersion((version) => version + 1)}
              onCancel={() => setShowForm(false)}
            />
          )}
          {selectedTicketId !== null && (
            <TicketDetail
              key={selectedTicketId}
              ticketId={selectedTicketId}
              onClose={() => setSelectedTicketId(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
