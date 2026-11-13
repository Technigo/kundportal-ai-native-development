import { useCallback, useEffect, useState } from 'react'
import { listTickets } from '../../api/tickets'
import type { StatusFilter, Ticket } from '../../domain/ticket'

export type ListRefresh = { updatedTicket?: Ticket }

type TicketsState = {
  status: StatusFilter
  refresh: ListRefresh | undefined
  data: Ticket[] | null
  error: unknown
  isLoading: boolean
}

function applyConfirmedUpdate(tickets: Ticket[], updated: Ticket, status: StatusFilter) {
  const matches = status === null || updated.status === status
  if (!matches) return tickets.filter((ticket) => ticket.id !== updated.id)

  const index = tickets.findIndex((ticket) => ticket.id === updated.id)
  if (index !== -1) {
    return tickets.map((ticket) => ticket.id === updated.id ? updated : ticket)
  }

  // Ärendet kan ha bytt till den status som just nu visas i listan.
  return [...tickets, updated].sort(
    (first, second) => second.created_at.localeCompare(first.created_at) || second.id - first.id,
  )
}

export function useTickets(status: StatusFilter, refresh?: ListRefresh) {
  const [state, setState] = useState<TicketsState>({
    status,
    refresh,
    data: null,
    error: null,
    isLoading: true,
  })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // Ignorera svar som kommer efter filterbyte eller en ny omladdning.
    let active = true
    setState((previous) => {
      let data = previous.status === status ? previous.data : null
      const updatedTicket = previous.refresh !== refresh ? refresh?.updatedTicket : undefined
      if (data && updatedTicket) {
        data = applyConfirmedUpdate(data, updatedTicket, status)
      }
      return { status, refresh, data, error: null, isLoading: true }
    })

    listTickets(status).then(
      (tickets) => {
        if (active) setState({ status, refresh, data: tickets, error: null, isLoading: false })
      },
      (error: unknown) => {
        if (active) setState((previous) => ({ ...previous, error, isLoading: false }))
      },
    )

    return () => {
      active = false
    }
  }, [status, refresh, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  if (state.status !== status) {
    return { data: null, error: null, isLoading: true, reload }
  }
  return { ...state, reload }
}
