import { STATUS_LABELS, type TicketStatus } from '../../domain/ticket'
import styles from './StatusBadge.module.css'

type StatusBadgeProps = {
  status: TicketStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.statusBadge} ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
