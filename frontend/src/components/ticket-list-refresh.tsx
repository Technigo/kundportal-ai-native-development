import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react"

// KSP-75: the list registers its reload while it is mounted. The header calls it
// after a ticket is created. The detail view registers nothing.

type Reload = () => void

type TicketListRefresh = {
  register: (reload: Reload | null) => void
  onCreated: () => void
}

const TicketListRefreshContext = createContext<TicketListRefresh | null>(null)

export function TicketListRefreshProvider({ children }: { children: ReactNode }) {
  const reloadRef = useRef<Reload | null>(null)

  const register = useCallback((reload: Reload | null) => {
    reloadRef.current = reload
  }, [])

  const onCreated = useCallback(() => {
    reloadRef.current?.()
  }, [])

  const value = useMemo(() => ({ register, onCreated }), [register, onCreated])

  return (
    <TicketListRefreshContext.Provider value={value}>{children}</TicketListRefreshContext.Provider>
  )
}

export function useTicketListRefresh(): TicketListRefresh | null {
  return useContext(TicketListRefreshContext)
}
