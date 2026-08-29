import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="mt-0.5 shrink-0" />
        <Separator orientation="vertical" className="mt-1 h-6 shrink-0 md:hidden" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="font-heading truncate text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="text-pretty text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="hidden shrink-0 items-center gap-2 md:flex">{actions}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:hidden">{actions}</div>
      ) : null}
    </header>
  )
}
