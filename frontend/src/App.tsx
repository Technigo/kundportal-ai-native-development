import { Route, Routes } from "react-router"

import { HealthPage } from "@/pages/HealthPage"
import { TicketListPage } from "@/pages/TicketListPage"
import { TicketDetailPage } from "@/pages/ticket-detail-page"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<TicketListPage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />
    </Routes>
  )
}

export default App
