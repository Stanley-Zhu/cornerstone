'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { compactCurrency, periodLabel } from '@/lib/format'

const config = {
  income: { label: 'Rent collected', color: 'var(--chart-1)' },
  expenses: { label: 'Expenses', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function IncomeExpenseChart({
  data,
  className,
}: {
  data: { period: string; income: number; expenses: number }[]
  className?: string
}) {
  const rows = data.map((row) => ({
    ...row,
    label: periodLabel(row.period, { year: false }),
  }))

  return (
    <ChartContainer config={config} className={className}>
      <AreaChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-income)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0.04} />
          </linearGradient>
          <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-expenses)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-expenses)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          fontSize={12}
          tickFormatter={(value: number) => compactCurrency(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {config[name as keyof typeof config]?.label ?? name}
                  </span>
                  <span className="tabular font-medium">
                    {compactCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="income"
          type="monotone"
          stroke="var(--color-income)"
          fill="url(#fillIncome)"
          strokeWidth={2}
        />
        <Area
          dataKey="expenses"
          type="monotone"
          stroke="var(--color-expenses)"
          fill="url(#fillExpenses)"
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
