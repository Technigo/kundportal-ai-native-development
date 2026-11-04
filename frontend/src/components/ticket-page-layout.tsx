import type { ReactNode } from "react"

// KSP-76: the ticket list (CORE-03) and the detail view (CORE-04) share one
// centered column, so the width does not change when a ticket is opened.
export function TicketPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
      {children}
    </main>
  )
}
