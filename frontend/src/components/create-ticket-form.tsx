import { useRef, useState, type FormEvent } from "react"

import { createTicket, type TicketDraft } from "@/api/tickets"
import type { TicketCategory, TicketPriority } from "@/api/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { codePointLength } from "@/lib/code-points"
import { categoryLabels, priorityLabels } from "@/labels"

// KSP-30: create a ticket. The API owns validation. A 422 detail is shown unchanged (AC4).
// Lengths are Unicode code points (CORE-14, B11), counted on the raw field text.

const emptyDraft: TicketDraft = {
  title: "",
  description: "",
  category: "",
  priority: "",
}

type CreateTicketFormProps = {
  onCreated: () => void
}

export function CreateTicketForm({ onCreated }: CreateTicketFormProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [draft, setDraft] = useState<TicketDraft>(emptyDraft)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const requestId = useRef(0)

  function isDirty() {
    return (
      draft.title !== "" ||
      draft.description !== "" ||
      draft.category !== "" ||
      draft.priority !== ""
    )
  }

  function reset() {
    setDraft(emptyDraft)
    setError(null)
    setPending(false)
  }

  function handleOpenChange(next: boolean, eventDetails: { cancel: () => void }) {
    if (next) {
      setOpen(true)
      return
    }
    if (isDirty()) {
      eventDetails.cancel()
      setConfirmOpen(true)
      return
    }
    setOpen(false)
    reset()
  }

  function discard() {
    requestId.current += 1
    setConfirmOpen(false)
    setOpen(false)
    reset()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = ++requestId.current
    setPending(true)
    setError(null)
    const result = await createTicket(draft)
    if (id !== requestId.current) return
    setPending(false)
    if (result.state === "error") {
      setError(result.message)
      return
    }
    reset()
    setOpen(false)
    onCreated()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button />}>Nytt ärende</DialogTrigger>
        <DialogContent>
          <DialogTitle>Nytt ärende</DialogTitle>
          <DialogDescription className="sr-only">
            Rubrik, beskrivning, kategori och prioritet.
          </DialogDescription>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error !== null && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="ticket-title">Rubrik</FieldLabel>
              <Input
                id="ticket-title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
              <FieldDescription>{codePointLength(draft.title)} / 100</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-description">Beskrivning</FieldLabel>
              <Textarea
                id="ticket-description"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
              <FieldDescription>
                {codePointLength(draft.description)} / 2000
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-category">Kategori</FieldLabel>
              <NativeSelect
                id="ticket-category"
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value as TicketCategory | "",
                  }))
                }
              >
                <option value="">Välj…</option>
                {Object.entries(categoryLabels).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-priority">Prioritet</FieldLabel>
              <NativeSelect
                id="ticket-priority"
                value={draft.priority}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    priority: event.target.value as TicketPriority | "",
                  }))
                }
              >
                <option value="">Välj…</option>
                {Object.entries(priorityLabels).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Button type="submit" disabled={pending}>
              Registrera ärende
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Släng utkastet?</AlertDialogTitle>
            <AlertDialogDescription>
              Det som är ifyllt försvinner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Fortsätt redigera</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={discard}>
              Släng utkastet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
