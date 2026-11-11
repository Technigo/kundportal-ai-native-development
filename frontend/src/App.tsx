import { useEffect, useState } from 'react'
import type { StatusFilter, Ticket } from './domain/ticket'
import { TicketDetail } from './features/tickets/TicketDetail'
import { TicketForm } from './features/tickets/TicketForm'
import { TicketList } from './features/tickets/TicketList'
import type { ListRefresh } from './features/tickets/useTickets'
import { useUpdateStatus } from './features/tickets/useUpdateStatus'
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
  const [listRefresh, setListRefresh] = useState<ListRefresh>()
  const statusUpdateFor = useUpdateStatus(applyTicketUpdate, refreshList)

  function refreshList() {
    setListRefresh({})
  }

  function applyTicketUpdate(ticket: Ticket) {
    setListRefresh({ updatedTicket: ticket })
  }

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
            refresh={listRefresh}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            selectedTicketId={selectedTicketId}
            onSelectTicket={selectTicket}
          />
          {showForm && (
            <TicketForm
              onCreated={refreshList}
              onCancel={() => setShowForm(false)}
            />
          )}
          {selectedTicketId !== null && (
            <TicketDetail
              key={selectedTicketId}
              ticketId={selectedTicketId}
              statusUpdate={statusUpdateFor(selectedTicketId)}
              onClose={() => setSelectedTicketId(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
