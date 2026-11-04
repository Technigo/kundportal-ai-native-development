import {
  STATUSES,
  STATUS_LABELS,
  type StatusFilter as StatusFilterValue,
} from '../../domain/ticket'
import styles from './StatusFilter.module.css'

type StatusFilterProps = {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
}

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: null, label: 'Alla' },
  ...STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className={styles.statusFilter} role="group" aria-label="Filtrera på status">
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          className={styles.chip}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
