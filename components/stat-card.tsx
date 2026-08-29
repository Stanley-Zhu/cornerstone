import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = 'default',
  className,
}: {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  variant?: 'default' | 'accent' | 'critical'
  className?: string
}) {
  const shell =
    variant === 'accent'
      ? 'bg-accent text-accent-foreground border-transparent'
      : variant === 'critical'
        ? 'bg-destructive text-destructive-foreground border-transparent'
        : 'bg-card text-card-foreground border-border'

  const secondary =
    variant === 'default' ? 'text-muted-foreground' : 'opacity-75'

  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-6 rounded-2xl border p-5',
        shell,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('text-sm font-medium', secondary)}>{label}</span>
        {Icon ? <Icon className={cn('size-4 shrink-0', secondary)} aria-hidden="true" /> : null}
      </div>
      <div className="flex flex-col gap-1">
        <span className="tabular font-heading text-3xl font-semibold leading-none tracking-tight">
          {value}
        </span>
        {hint ? <span className={cn('text-xs', secondary)}>{hint}</span> : null}
      </div>
    </div>
  )
}

export function MiniStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="tabular font-heading text-lg font-semibold leading-tight">
        {value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}
