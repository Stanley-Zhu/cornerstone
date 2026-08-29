import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'positive' | 'warning' | 'critical' | 'accent' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary-foreground border-transparent',
  positive: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/18 text-warning-foreground border-warning/35',
  critical: 'bg-destructive/12 text-destructive border-destructive/30',
  accent: 'bg-accent/25 text-accent-foreground border-accent/40',
  muted: 'bg-muted text-muted-foreground border-transparent',
}

const LABELS: Record<string, { label: string; tone: Tone }> = {
  // unit status
  occupied: { label: 'Occupied', tone: 'positive' },
  vacant: { label: 'Vacant', tone: 'critical' },
  notice: { label: 'On notice', tone: 'warning' },
  renovating: { label: 'Renovating', tone: 'muted' },
  // payment status
  paid: { label: 'Paid', tone: 'positive' },
  due: { label: 'Due', tone: 'neutral' },
  partial: { label: 'Partial', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'critical' },
  // lease status
  active: { label: 'Active', tone: 'positive' },
  expiring: { label: 'Expiring', tone: 'warning' },
  expired: { label: 'Expired', tone: 'muted' },
  pending: { label: 'Pending', tone: 'neutral' },
  // ticket status
  open: { label: 'Open', tone: 'critical' },
  in_progress: { label: 'In progress', tone: 'accent' },
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  resolved: { label: 'Resolved', tone: 'positive' },
  // ticket priority
  urgent: { label: 'Urgent', tone: 'critical' },
  high: { label: 'High', tone: 'warning' },
  normal: { label: 'Normal', tone: 'neutral' },
  low: { label: 'Low', tone: 'muted' },
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const entry = LABELS[status] ?? { label: status, tone: 'neutral' as Tone }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[entry.tone],
        className,
      )}
    >
      {label ?? entry.label}
    </span>
  )
}

export function PriorityDot({ priority }: { priority: string }) {
  const tone: Record<string, string> = {
    urgent: 'bg-destructive',
    high: 'bg-warning',
    normal: 'bg-chart-3',
    low: 'bg-muted-foreground/50',
  }
  return (
    <span
      className={cn('inline-block size-2 shrink-0 rounded-full', tone[priority])}
      aria-hidden="true"
    />
  )
}
