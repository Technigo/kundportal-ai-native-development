import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { STATUSES, STATUS_LABELS, type Ticket, type TicketStatus } from '../../domain/ticket'
import { StatusBadge } from './StatusBadge'
import type { StatusUpdate } from './useUpdateStatus'
import styles from './TicketStatusPicker.module.css'

type TicketStatusPickerProps = {
  ticket: Ticket
  update: StatusUpdate
}

export function TicketStatusPicker({ ticket, update }: TicketStatusPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedStatus, setFocusedStatus] = useState(ticket.status)
  const trigger = useRef<HTMLButtonElement>(null)
  const options = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const { save, verify, operation, attemptedStatus, error, message } = update

  useEffect(() => {
    if (isOpen) options.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
  }, [isOpen])

  function close() {
    if (options.current?.contains(document.activeElement)) trigger.current?.focus()
    setIsOpen(false)
  }

  function toggle() {
    if (operation) return
    setFocusedStatus(attemptedStatus ?? ticket.status)
    setIsOpen(!isOpen)
  }

  function choose(status: TicketStatus) {
    if (operation) return
    close()
    void save(status)
  }

  function checkStatus() {
    if (operation) return
    trigger.current?.focus()
    void verify()
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, status: TicketStatus) {
    const index = STATUSES.indexOf(status)
    const next = (index + 1) % STATUSES.length
    const previous = (index + STATUSES.length - 1) % STATUSES.length
    const nextIndex = {
      ArrowDown: next,
      ArrowRight: next,
      ArrowUp: previous,
      ArrowLeft: previous,
      Home: 0,
      End: STATUSES.length - 1,
    }[event.key]
    if (nextIndex === undefined) return
    event.preventDefault()
    options.current?.querySelectorAll('button')[nextIndex]?.focus()
  }

  const activity = operation === 'save' ? 'Sparar status …' : 'Hämtar aktuell status …'
  const confirmation = update.updatedTicket === ticket ? message : ''

  return (
    <div
      className={styles.picker}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault()
          close()
        }
      }}
    >
      <div className={styles.controls}>
        <StatusBadge status={ticket.status} />
        <button
          ref={trigger}
          type="button"
          className={styles.button}
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen}
          aria-disabled={operation !== null}
          onClick={toggle}
        >
          Ändra status <span aria-hidden="true">▾</span>
        </button>
      </div>
      {isOpen && (
        <div
          ref={options}
          id={menuId}
          className={styles.options}
          role="radiogroup"
          aria-label="Ändra status"
        >
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={styles.option}
              role="radio"
              aria-checked={status === ticket.status}
              aria-disabled={operation !== null}
              tabIndex={focusedStatus === status ? 0 : -1}
              onFocus={() => setFocusedStatus(status)}
              onKeyDown={(event) => navigate(event, status)}
              onClick={() => choose(status)}
            >
              <span className={styles.check} aria-hidden="true">
                {status === ticket.status ? '✓' : ''}
              </span>
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className={styles.error} role="alert">
          <span aria-hidden="true">⚠ </span>
          {error.message}
        </p>
      )}
      {attemptedStatus && error && (
        <p className={styles.feedback}>Vald status: {STATUS_LABELS[attemptedStatus]}</p>
      )}
      {error?.unknownOutcome && (
        <button
          type="button"
          className={styles.button}
          disabled={operation !== null}
          onClick={checkStatus}
        >
          Uppdatera listan
        </button>
      )}
      <p className={styles.feedback} role="status">
        {operation ? activity : confirmation}
      </p>
    </div>
  )
}
