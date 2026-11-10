import { useEffect, useRef } from 'react'
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  type StatusFilter as StatusFilterValue,
} from '../../domain/ticket'
import { formatListDate } from '../../domain/formatDate'
import { StatusBadge } from './StatusBadge'
import { StatusFilter } from './StatusFilter'
import { useTickets } from './useTickets'
import styles from './TicketList.module.css'

type TicketListProps = {
  statusFilter: StatusFilterValue
  onStatusFilterChange: (value: StatusFilterValue) => void
  selectedTicketId: number | null
  onSelectTicket: (id: number) => void
}

export function TicketList({
  statusFilter,
  onStatusFilterChange,
  selectedTicketId,
  onSelectTicket,
}: TicketListProps) {
  const { data: tickets, error, isLoading, reload } = useTickets(statusFilter)
  const openButtons = useRef(new Map<number, HTMLButtonElement>())
  const previousSelectedId = useRef(selectedTicketId)

  useEffect(() => {
    const previous = previousSelectedId.current
    previousSelectedId.current = selectedTicketId
    // Panelen stängdes: lämna tillbaka fokus till raden användaren kom från
    if (previous !== null && selectedTicketId === null) {
      openButtons.current.get(previous)?.focus()
    }
  }, [selectedTicketId])

  return (
    <section className={styles.card} aria-label="Ärendelista">
      <div className={styles.header}>
        <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
      </div>

      {isLoading && <p className={styles.message}>Hämtar ärenden …</p>}

      {!isLoading && error !== null && (
        <div className={styles.message} role="alert">
          <p>Ärendena kunde inte hämtas. Försök igen.</p>
          <button type="button" className={styles.retry} onClick={reload}>
            Försök igen
          </button>
        </div>
      )}

      {!isLoading && tickets?.length === 0 && (
        <p className={styles.message}>
          {statusFilter === null
            ? 'Det finns inga ärenden ännu'
            : 'Inga ärenden matchar vald status'}
        </p>
      )}

      {!isLoading && tickets !== null && tickets.length > 0 && (
        // Smalt fönster: tabellen rullas i sidled inne i kortet.
        // tabIndex gör att den också kan rullas med tangentbord.
        <div
          className={styles.tableWrapper}
          role="region"
          aria-label="Ärendetabell"
          tabIndex={0}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Kund-ID</th>
                <th scope="col">Kundnamn</th>
                <th scope="col">Rubrik</th>
                <th scope="col">Kategori</th>
                <th scope="col">Prio</th>
                <th scope="col">Status</th>
                <th scope="col">Skapad</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={styles.row}
                  aria-current={ticket.id === selectedTicketId ? 'true' : undefined}
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  <td className={styles.muted}>#{ticket.id}</td>
                  <td className={styles.nowrap}>{ticket.customer_id}</td>
                  <td>{ticket.customer_name}</td>
                  <td className={styles.title}>
                    {/* Knappen gör raden nåbar med tangentbord */}
                    <button
                      ref={(element) => {
                        if (element) openButtons.current.set(ticket.id, element)
                        return () => {
                          openButtons.current.delete(ticket.id)
                        }
                      }}
                      type="button"
                      className={styles.open}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectTicket(ticket.id)
                      }}
                    >
                      {ticket.title}
                    </button>
                  </td>
                  <td>{CATEGORY_LABELS[ticket.category]}</td>
                  <td className={styles[ticket.priority]}>
                    {PRIORITY_LABELS[ticket.priority]}
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className={styles.muted}>
                    <time dateTime={ticket.created_at}>
                      {formatListDate(ticket.created_at)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
