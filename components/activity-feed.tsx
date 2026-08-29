'use client'

import {
  BanknoteIcon,
  FileTextIcon,
  ScrollTextIcon,
  UserPlusIcon,
  WrenchIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { shortDate } from '@/lib/format'
import type { Activity } from '@/lib/types'

const ICONS = {
  payment: BanknoteIcon,
  maintenance: WrenchIcon,
  lease: ScrollTextIcon,
  document: FileTextIcon,
  tenant: UserPlusIcon,
} as const

export function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-4">
          {items.slice(0, 8).map((item) => {
            const Icon = ICONS[item.kind]
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-sm leading-snug">{item.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {shortDate(item.at)}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
