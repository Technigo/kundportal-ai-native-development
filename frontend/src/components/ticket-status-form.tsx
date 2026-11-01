import { useEffect, useRef, useState } from "react"
import { Pencil, X } from "lucide-react"

import { changeTicketStatus } from "@/api/tickets"
import type { Ticket, TicketStatus } from "@/api/types"
import { StatusBadge } from "@/components/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { statusLabels } from "@/labels"

const statuses = Object.keys(statusLabels) as TicketStatus[]

// Status change in the detail view (KSP-32). The status is shown as a badge with a pencil
// button (AC4). The pencil opens a neutral select without the badge colours, so it is clear
// that the status is being edited, with the four statuses, a save button and a cancel cross
// (AC5). Saving is disabled while the saved status is chosen, and while a save is
// running the button shows a spinner. On errors the view stays in edit mode, the message is
// shown and the select goes back to the saved status (AC6).
export function TicketStatusForm({
  ticket,
  labelId,
  onSaved,
}: {
  ticket: Ticket
  labelId: string
  onSaved: (ticket: Ticket) => void
}) {
  const [editing, setEditing] = useState(false)
  const [chosen, setChosen] = useState<TicketStatus>(ticket.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pencilRef = useRef<HTMLButtonElement>(null)
  // Focus goes back to the pencil when the editor closes, not when the page first loads.
  const returnFocus = useRef(false)

  useEffect(() => {
    if (!editing && returnFocus.current) {
      pencilRef.current?.focus()
      returnFocus.current = false
    }
  }, [editing])

  function open() {
    setChosen(ticket.status)
    setError(null)
    setEditing(true)
  }

  function close() {
    returnFocus.current = true
    setEditing(false)
  }

  function choose(status: TicketStatus) {
    setChosen(status)
    setError(null)
  }

  async function save() {
    setSaving(true)
    setError(null)
    const result = await changeTicketStatus(ticket.id, chosen)
    setSaving(false)
    if (result.state === "ok") {
      // Back to the badge, which now shows the new status from the API (HIST-02, AC5).
      onSaved(result.ticket)
      close()
    } else {
      // The detail from the API as it is (HIST-06, HIST-07, HIST-14), and the saved status.
      setError(result.message)
      setChosen(ticket.status)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={ticket.status} />
        <Button ref={pencilRef} type="button" variant="ghost" size="icon" aria-label="Ändra status" onClick={open}>
          <Pencil aria-hidden="true" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <NativeSelect
          autoFocus
          aria-labelledby={labelId}
          value={chosen}
          onChange={(event) => choose(event.target.value as TicketStatus)}
          // The theme's customizable select (appearance: base-select) puts the text at the top,
          // so it is centred here instead of changing the theme.
          className="flex items-center"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </NativeSelect>
        <Button
          type="button"
          variant="secondary"
          disabled={saving || chosen === ticket.status}
          aria-busy={saving}
          onClick={() => void save()}
          className="shrink-0"
        >
          {/* The button text says what it does, so the spinner is hidden from screen readers. */}
          {saving && <Spinner size="sm" role="none" aria-label={undefined} aria-hidden="true" />}
          Spara
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Avbryt" onClick={close} className="shrink-0">
          <X aria-hidden="true" />
        </Button>
      </div>
      {/* Same alert as the rest of the view. How errors look is decided in KSP-38. */}
      {error !== null && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
