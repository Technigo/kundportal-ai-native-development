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
}

export function TicketList({
  statusFilter,
  onStatusFilterChange,
}: TicketListProps) {
  const { data: tickets, error, isLoading, reload } = useTickets(statusFilter)

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
              <tr key={ticket.id}>
                <td className={styles.muted}>#{ticket.id}</td>
                <td>{ticket.customer_id}</td>
                <td>{ticket.customer_name}</td>
                <td className={styles.title}>{ticket.title}</td>
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
      )}
    </section>
  )
}
