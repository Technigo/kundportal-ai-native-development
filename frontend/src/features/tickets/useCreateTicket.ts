import { useCallback, useState } from 'react'
import { ApiError } from '../../api/client'
import { createTicket, type NewTicket } from '../../api/tickets'
import { STORAGE_UNAVAILABLE_MESSAGE, UNKNOWN_OUTCOME_MESSAGE } from '../../domain/saveErrors'
import type { Ticket } from '../../domain/ticket'

export type CreateTicketError =
  | { kind: 'validation'; fields: Record<string, string[]> }
  | { kind: 'storage_unavailable'; message: string }
  | { kind: 'unknown_outcome'; message: string }
  | { kind: 'other'; message: string }

const OTHER_MESSAGE = 'Något gick fel. Försök igen.'

function toCreateTicketError(error: unknown): CreateTicketError {
  if (!(error instanceof ApiError)) {
    return { kind: 'other', message: OTHER_MESSAGE }
  }
  // Ingen respons alls vid en skrivning: utfallet är okänt
  if (error.code === 'save_outcome_unknown' || error.code === 'network_error') {
    return { kind: 'unknown_outcome', message: UNKNOWN_OUTCOME_MESSAGE }
  }
  if (error.code === 'storage_unavailable') {
    return { kind: 'storage_unavailable', message: STORAGE_UNAVAILABLE_MESSAGE }
  }
  if (error.code === 'validation_error') {
    return { kind: 'validation', fields: error.fields }
  }
  return { kind: 'other', message: OTHER_MESSAGE }
}

export function useCreateTicket() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<CreateTicketError | null>(null)

  // Skickar aldrig om automatiskt. Returnerar null om sparandet misslyckades.
  const create = useCallback(
    async (ticket: NewTicket): Promise<Ticket | null> => {
      setIsSaving(true)
      setError(null)
      try {
        return await createTicket(ticket)
      } catch (caught: unknown) {
        setError(toCreateTicketError(caught))
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  return { create, isSaving, error }
}
