'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ScrollText,
  Users,
  Wrench,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePortfolio } from '@/lib/store'
import { portfolioSummary } from '@/lib/selectors'
import { compactCurrency, percent } from '@/lib/format'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/tenants', label: 'Tenants', icon: Users },
  { href: '/leases', label: 'Leases', icon: ScrollText },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, badge: 'openTickets' },
  { href: '/financials', label: 'Financials', icon: FileText },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = usePortfolio()
  const summary = portfolioSummary(state)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Building2 className="size-4" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-heading truncate text-sm font-semibold leading-tight">
              Keystone
            </span>
            <span className="truncate text-xs text-muted-foreground leading-tight">
              Property management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                const badgeValue =
                  'badge' in item && item.badge === 'openTickets'
                    ? summary.openTickets
                    : 0
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link href={item.href}>
                          <item.icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                    {badgeValue > 0 ? (
                      <SidebarMenuBadge>{badgeValue}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="flex flex-col gap-3 rounded-xl border border-sidebar-border bg-card/60 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">Occupancy</span>
            <span className="tabular font-heading text-sm font-semibold">
              {percent(summary.occupancyRate)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.round(summary.occupancyRate * 100)}%` }}
            />
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">Rent collected</span>
            <span className="tabular font-heading text-sm font-semibold">
              {compactCurrency(summary.collected)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-sidebar-border pt-2">
            <span className="text-xs text-muted-foreground">
              {summary.properties} properties
            </span>
            <span className="text-xs text-muted-foreground">
              {summary.units} units
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
