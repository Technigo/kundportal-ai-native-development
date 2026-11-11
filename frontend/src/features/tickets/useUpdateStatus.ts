import { useRef, useState } from 'react'
import { ApiError } from '../../api/client'
import { getTicket, updateTicketStatus } from '../../api/tickets'
import { STATUS_FIELD_ERROR } from '../../domain/fieldErrors'
import { STORAGE_UNAVAILABLE_MESSAGE, UNKNOWN_OUTCOME_MESSAGE } from '../../domain/saveErrors'
import type { Ticket, TicketStatus } from '../../domain/ticket'

type StatusError = {
  message: string
  unknownOutcome?: boolean
}

function getStatusError(error: unknown): StatusError {
  if (
    !(error instanceof ApiError) ||
    error.code === 'network_error' ||
    error.code === 'unknown_error' ||
    error.code === 'save_outcome_unknown'
  ) {
    return { message: UNKNOWN_OUTCOME_MESSAGE, unknownOutcome: true }
  }
  switch (error.code) {
    case 'validation_error':
      return { message: error.fields.status?.[0] ?? STATUS_FIELD_ERROR }
    case 'not_found':
      return { message: 'Ärendet kunde inte hittas.' }
    case 'storage_unavailable':
      return { message: STORAGE_UNAVAILABLE_MESSAGE }
    default:
      return { message: 'Något gick fel. Försök igen.' }
  }
}

type UpdateState = {
  updatedTicket?: Ticket
  operation: 'save' | 'verify' | null
  attemptedStatus: TicketStatus | null
  error: StatusError | null
  message: string
}

export type StatusUpdate = UpdateState & {
  save: (status: TicketStatus) => Promise<void>
  verify: () => Promise<void>
}

export const IDLE_UPDATE: UpdateState = {
  operation: null,
  attemptedStatus: null,
  error: null,
  message: '',
}

export function useUpdateStatus(
  onTicketUpdated: (ticket: Ticket) => void,
  onListRefresh: () => void,
) {
  const inFlight = useRef(new Set<number>())
  const [states, setStates] = useState<Partial<Record<number, UpdateState>>>({})

  function updateState(id: number, update: Partial<UpdateState>) {
    setStates((previous) => ({
      ...previous,
      [id]: { ...(previous[id] ?? IDLE_UPDATE), ...update },
    }))
  }

  async function save(id: number, status: TicketStatus) {
    if (inFlight.current.has(id)) return
    inFlight.current.add(id)
    updateState(id, {
      operation: 'save',
      attemptedStatus: status,
      error: null,
      message: '',
    })

    try {
      const ticket = await updateTicketStatus(id, status)
      onTicketUpdated(ticket)
      updateState(id, {
        updatedTicket: ticket,
        attemptedStatus: null,
        message: 'Statusen har sparats.',
      })
    } catch (caught) {
      updateState(id, { error: getStatusError(caught) })
    } finally {
      inFlight.current.delete(id)
      updateState(id, { operation: null })
    }
  }

  async function verify(id: number, attemptedStatus: TicketStatus | null) {
    if (inFlight.current.has(id)) return
    inFlight.current.add(id)
    updateState(id, { operation: 'verify' })

    try {
      const ticket = await getTicket(id)
      onTicketUpdated(ticket)
      updateState(id, {
        updatedTicket: ticket,
        attemptedStatus: ticket.status === attemptedStatus ? null : attemptedStatus,
        error: null,
        message: 'Aktuell status har hämtats.',
      })
    } catch (caught) {
      onListRefresh()
      const message =
        caught instanceof ApiError && caught.code === 'not_found'
          ? 'Ärendet kunde inte hittas.'
          : 'Sparandet är fortfarande obekräftat. Försök uppdatera listan igen.'
      updateState(id, { error: { unknownOutcome: true, message } })
    } finally {
      inFlight.current.delete(id)
      updateState(id, { operation: null })
    }
  }

  return (id: number): StatusUpdate => {
    const state = states[id] ?? IDLE_UPDATE
    return {
      ...state,
      save: (status) => save(id, status),
      verify: () => verify(id, state.attemptedStatus),
    }
  }
}
