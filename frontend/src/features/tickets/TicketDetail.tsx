import { useEffect, useRef } from 'react'
import { ApiError } from '../../api/client'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../../domain/ticket'
import { formatDetailDate } from '../../domain/formatDate'
import { TicketStatusPicker } from './TicketStatusPicker'
import { useTicket } from './useTicket'
import type { StatusUpdate } from './useUpdateStatus'
import styles from './TicketDetail.module.css'

type TicketDetailProps = {
  ticketId: number
  onClose: () => void
  statusUpdate: StatusUpdate
}

export function TicketDetail({ ticketId, onClose, statusUpdate }: TicketDetailProps) {
  const { data: ticket, error, isLoading, reload } = useTicket(ticketId, statusUpdate.updatedTicket)
  const isNotFound = error instanceof ApiError && error.code === 'not_found'
  const panelRef = useRef<HTMLElement>(null)

  // Flytta fokus till panelen när den öppnas, så att tangentbordsanvändare
  // inte behöver tabba igenom resten av listan för att nå den
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  return (
    <section
      ref={panelRef}
      className={styles.panel}
      aria-label="Ärendedetaljer"
      tabIndex={-1}
    >
      <div className={styles.toolbar}>
        <button type="button" className={styles.close} onClick={onClose}>
          <span aria-hidden="true">✕ </span>Stäng
        </button>
      </div>

      {isLoading && <p className={styles.message}>Hämtar ärendet …</p>}

      {!isLoading && isNotFound && (
        <p className={styles.message} role="alert">
          Ärendet kunde inte hittas
        </p>
      )}

      {!isLoading && error !== null && !isNotFound && (
        <div className={styles.message} role="alert">
          <p>Ärendet kunde inte hämtas. Försök igen.</p>
          <button type="button" className={styles.close} onClick={reload}>
            Försök igen
          </button>
        </div>
      )}

      {!isLoading && ticket !== null && (
        <article>
          <p className={styles.muted}>
            #{ticket.id} · {CATEGORY_LABELS[ticket.category]}
          </p>
          <h2 className={styles.title}>{ticket.title}</h2>

          <dl className={styles.facts}>
            <div>
              <dt>Kund-ID</dt>
              <dd>{ticket.customer_id}</dd>
            </div>
            <div>
              <dt>Kundnamn</dt>
              <dd>{ticket.customer_name}</dd>
            </div>
            <div>
              <dt>Prioritet</dt>
              <dd className={styles[ticket.priority]}>
                {PRIORITY_LABELS[ticket.priority]}
              </dd>
            </div>
            <div>
              <dt>Skapad</dt>
              <dd>
                <time dateTime={ticket.created_at}>
                  {formatDetailDate(ticket.created_at)}
                </time>
              </dd>
            </div>
            <div className={styles.status}>
              <dt>Status</dt>
              <dd>
                <TicketStatusPicker
                  key={ticket.id}
                  ticket={ticket}
                  update={statusUpdate}
                />
              </dd>
            </div>
          </dl>

          <h3 className={styles.label}>Beskrivning</h3>
          <p className={styles.description}>{ticket.description}</p>
        </article>
      )}
    </section>
  )
}
