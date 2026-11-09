import { Outlet, Route, Routes } from "react-router"

import { AppHeader } from "@/components/app-header"
import { TicketListRefreshProvider } from "@/components/ticket-list-refresh"
import { TicketListPage } from "@/pages/TicketListPage"
import { TicketDetailPage } from "@/pages/ticket-detail-page"

// KSP-75: the list and the detail view share the header.
function TicketShell() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  )
}

export function App() {
  return (
    <TicketListRefreshProvider>
      <Routes>
        <Route element={<TicketShell />}>
          <Route path="/" element={<TicketListPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Route>
      </Routes>
    </TicketListRefreshProvider>
  )
}

export default App
