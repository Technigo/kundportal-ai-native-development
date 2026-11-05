import { useState, type FormEvent, type ReactNode } from 'react'
import {
  mergeBackendFieldErrors,
  validateTicketForm,
  type FieldErrors,
  type TicketField,
  type TicketFormValues,
} from '../../domain/fieldErrors'
import { TEXT_LIMITS, textLength, trimText, type TextField } from '../../domain/text'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  type Ticket,
} from '../../domain/ticket'
import { useCreateTicket } from './useCreateTicket'
import styles from './TicketForm.module.css'

const EMPTY_VALUES: TicketFormValues = {
  customer_id: '',
  customer_name: '',
  title: '',
  description: '',
  category: '',
  priority: '',
}

type TicketFormProps = {
  onCreated: (ticket: Ticket) => void
  onCancel?: () => void
}

type FieldProps = {
  name: TicketField
  label: string
  error?: string
  counter?: string
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}

function Field({ name, label, error, counter, children }: FieldProps) {
  const id = `ticket-${name}`
  const errorId = `${id}-error`
  const counterId = `${id}-counter`
  const describedBy =
    [counter ? counterId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {counter && (
        <span id={counterId} className={styles.counter}>
          {counter}
        </span>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  )
}

export function TicketForm({ onCreated, onCancel }: TicketFormProps) {
  const [values, setValues] = useState<TicketFormValues>(EMPTY_VALUES)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const [created, setCreated] = useState<Ticket | null>(null)
  const { create, isSaving, error } = useCreateTicket()

  const backendErrors =
    error?.kind === 'validation'
      ? mergeBackendFieldErrors(values, error.fields)
      : {}
  const errors: FieldErrors = { ...backendErrors, ...clientErrors }

  function setField<K extends TicketField>(name: K, value: TicketFormValues[K]) {
    setValues((previous) => ({ ...previous, [name]: value }))
    setClientErrors((previous) => ({ ...previous, [name]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    const found = validateTicketForm(values)
    setClientErrors(found)
    setCreated(null)
    if (Object.keys(found).length > 0) return

    const ticket = await create({
      customer_id: trimText(values.customer_id),
      customer_name: trimText(values.customer_name),
      title: trimText(values.title),
      description: trimText(values.description),
      category: values.category as Exclude<typeof values.category, ''>,
      priority: values.priority as Exclude<typeof values.priority, ''>,
    })
    // Formuläret rensas bara efter ett lyckat svar från backend
    if (ticket === null) return
    setValues(EMPTY_VALUES)
    setCreated(ticket)
    onCreated(ticket)
  }

  function counterFor(name: TextField) {
    return `${textLength(values[name])} / ${TEXT_LIMITS[name].toLocaleString('sv-SE')} tecken`
  }

  const formError =
    error && error.kind !== 'validation' ? error.message : null

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <h2>Registrera ärende</h2>

      {formError && (
        <div className={styles.alert} role="alert">
          {formError}
        </div>
      )}
      {created && (
        <div className={styles.success} role="status">
          Ärendet har sparats som #{created.id}.
        </div>
      )}

      <Field name="customer_id" label="Kund-ID" error={errors.customer_id} counter={counterFor('customer_id')}>
        {(props) => (
          <input
            {...props}
            type="text"
            value={values.customer_id}
            onChange={(event) => setField('customer_id', event.target.value)}
          />
        )}
      </Field>

      <Field name="customer_name" label="Kundnamn" error={errors.customer_name} counter={counterFor('customer_name')}>
        {(props) => (
          <input
            {...props}
            type="text"
            value={values.customer_name}
            onChange={(event) => setField('customer_name', event.target.value)}
          />
        )}
      </Field>

      <Field name="title" label="Rubrik" error={errors.title} counter={counterFor('title')}>
        {(props) => (
          <input
            {...props}
            type="text"
            value={values.title}
            onChange={(event) => setField('title', event.target.value)}
          />
        )}
      </Field>

      <Field name="description" label="Beskrivning" error={errors.description} counter={counterFor('description')}>
        {(props) => (
          <textarea
            {...props}
            rows={6}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
          />
        )}
      </Field>

      <Field name="category" label="Kategori" error={errors.category}>
        {(props) => (
          <select
            {...props}
            value={values.category}
            onChange={(event) =>
              setField('category', event.target.value as TicketFormValues['category'])
            }
          >
            <option value="">Välj kategori</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field name="priority" label="Prioritet" error={errors.priority}>
        {(props) => (
          <select
            {...props}
            value={values.priority}
            onChange={(event) =>
              setField('priority', event.target.value as TicketFormValues['priority'])
            }
          >
            <option value="">Välj prioritet</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={isSaving}>
          {isSaving ? 'Sparar …' : 'Spara ärende'}
        </button>
        {onCancel && (
          <button type="button" className={styles.secondary} onClick={onCancel}>
            Avbryt
          </button>
        )}
      </div>
    </form>
  )
}
