import { cn } from '@/lib/utils'
import { percent } from '@/lib/format'

export function OccupancyBar({
  rate,
  filled,
  total,
  className,
  showLabel = true,
}: {
  rate: number
  filled?: number
  total?: number
  className?: string
  showLabel?: boolean
}) {
  const pct = Math.round(rate * 100)
  const tone = pct === 100 ? 'bg-success' : pct >= 75 ? 'bg-accent' : 'bg-destructive'

  return (
    <div className={cn('flex min-w-24 flex-col gap-1.5', className)}>
      {showLabel ? (
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="tabular font-medium">{percent(rate)}</span>
          {total !== undefined ? (
            <span className="text-muted-foreground">
              {filled}/{total}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Occupancy"
      >
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
