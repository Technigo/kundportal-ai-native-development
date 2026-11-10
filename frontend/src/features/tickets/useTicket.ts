import { useCallback, useEffect, useState } from 'react'
import { getTicket } from '../../api/tickets'
import type { Ticket } from '../../domain/ticket'

type TicketState = {
  data: Ticket | null
  error: unknown
  isLoading: boolean
}

export function useTicket(id: number) {
  const [state, setState] = useState<TicketState>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // Ignorera svar som kommer efter att ett annat ärende valts
    let active = true
    setState({ data: null, error: null, isLoading: true })

    getTicket(id).then(
      (ticket) => {
        if (active) setState({ data: ticket, error: null, isLoading: false })
      },
      (error: unknown) => {
        if (active) setState({ data: null, error, isLoading: false })
      },
    )

    return () => {
      active = false
    }
  }, [id, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return { ...state, reload }
}
