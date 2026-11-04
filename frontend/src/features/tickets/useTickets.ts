import { useCallback, useEffect, useState } from 'react'
import { listTickets } from '../../api/tickets'
import type { StatusFilter, Ticket } from '../../domain/ticket'

type TicketsState = {
  data: Ticket[] | null
  error: unknown
  isLoading: boolean
}

export function useTickets(status: StatusFilter) {
  const [state, setState] = useState<TicketsState>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // Ignorera svar som kommer efter att filtret bytts
    let active = true
    setState((previous) => ({ ...previous, error: null, isLoading: true }))

    listTickets(status).then(
      (tickets) => {
        if (active) setState({ data: tickets, error: null, isLoading: false })
      },
      (error: unknown) => {
        if (active) setState({ data: null, error, isLoading: false })
      },
    )

    return () => {
      active = false
    }
  }, [status, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return { ...state, reload }
}
