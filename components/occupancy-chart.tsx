'use client'

import { Cell, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { percent } from '@/lib/format'

const config = {
  value: { label: 'Units' },
} satisfies ChartConfig

export function OccupancyChart({
  data,
  rate,
  className,
}: {
  data: { status: string; value: number; fill: string }[]
  rate: number
  className?: string
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative shrink-0">
        <ChartContainer config={config} className={className ?? 'h-40 w-40'}>
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="status"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((slice) => (
                <Cell key={slice.status} fill={slice.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular font-heading text-2xl font-semibold leading-none">
            {percent(rate)}
          </span>
          <span className="text-xs text-muted-foreground">occupied</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {data.map((slice) => (
          <li key={slice.status} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.fill }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-muted-foreground">{slice.status}</span>
            <span className="tabular font-medium">{slice.value}</span>
            <span className="tabular w-10 text-right text-xs text-muted-foreground">
              {percent(total ? slice.value / total : 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
