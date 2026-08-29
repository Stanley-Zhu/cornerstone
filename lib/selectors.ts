import { CURRENT_PERIOD, PERIODS, TODAY } from './mock-data'
import { daysBetween } from './format'
import type {
  ExpenseCategory,
  Lease,
  PaymentStatus,
  PortfolioState,
  Property,
  Tenant,
  TicketStatus,
  Unit,
} from './types'

/* --------------------------------- lookups -------------------------------- */

export function unitById(state: PortfolioState, id: string) {
  return state.units.find((unit) => unit.id === id)
}

export function propertyById(state: PortfolioState, id: string) {
  return state.properties.find((property) => property.id === id)
}

export function tenantById(state: PortfolioState, id: string) {
  return state.tenants.find((tenant) => tenant.id === id)
}

export function unitsOfProperty(state: PortfolioState, propertyId: string) {
  return state.units.filter((unit) => unit.propertyId === propertyId)
}

export function activeLeaseForUnit(state: PortfolioState, unitId: string) {
  return state.leases.find(
    (lease) => lease.unitId === unitId && lease.status !== 'expired',
  )
}

export function leasesOfProperty(state: PortfolioState, propertyId: string) {
  return state.leases.filter(
    (lease) => unitById(state, lease.unitId)?.propertyId === propertyId,
  )
}

/* --------------------------------- leases --------------------------------- */

export function daysUntilLeaseEnd(lease: Lease) {
  return daysBetween(TODAY, lease.end)
}

export function leaseStage(lease: Lease): 'active' | 'expiring' | 'expired' {
  const days = daysUntilLeaseEnd(lease)
  if (days < 0) return 'expired'
  if (days <= 90) return 'expiring'
  return 'active'
}

export function expiringLeases(state: PortfolioState, withinDays = 90) {
  return state.leases
    .filter((lease) => {
      const days = daysUntilLeaseEnd(lease)
      return days >= 0 && days <= withinDays
    })
    .sort((a, b) => daysUntilLeaseEnd(a) - daysUntilLeaseEnd(b))
}

/* -------------------------------- occupancy ------------------------------- */

export function occupancy(unitList: Unit[]) {
  const total = unitList.length
  const filled = unitList.filter(
    (unit) => unit.status === 'occupied' || unit.status === 'notice',
  ).length
  return { total, filled, vacant: total - filled, rate: total ? filled / total : 0 }
}

export function occupancyBreakdown(state: PortfolioState) {
  const count = (status: Unit['status']) =>
    state.units.filter((unit) => unit.status === status).length
  return [
    { status: 'Occupied', value: count('occupied'), fill: 'var(--color-chart-1)' },
    { status: 'On notice', value: count('notice'), fill: 'var(--color-chart-4)' },
    { status: 'Vacant', value: count('vacant'), fill: 'var(--color-chart-2)' },
    { status: 'Renovating', value: count('renovating'), fill: 'var(--color-chart-5)' },
  ].filter((slice) => slice.value > 0)
}

/* --------------------------------- payments ------------------------------- */

export function paymentStatus(
  amountDue: number,
  amountPaid: number,
  dueDate: string,
): PaymentStatus {
  if (amountPaid >= amountDue) return 'paid'
  const overdue = daysBetween(dueDate, TODAY) > 5
  if (amountPaid > 0) return overdue ? 'overdue' : 'partial'
  return overdue ? 'overdue' : 'due'
}

export interface RentRollRow {
  lease: Lease
  unit: Unit
  property: Property
  tenant: Tenant
  expected: number
  collected: number
  balance: number
  status: PaymentStatus
  paidDate: string | null
  method: string | null
}

export function rentRoll(state: PortfolioState, period = CURRENT_PERIOD): RentRollRow[] {
  const rows: RentRollRow[] = []

  for (const lease of state.leases) {
    const unit = unitById(state, lease.unitId)
    const tenant = tenantById(state, lease.tenantId)
    if (!unit || !tenant) continue
    const property = propertyById(state, unit.propertyId)
    if (!property) continue

    const payment = state.payments.find(
      (item) => item.leaseId === lease.id && item.period === period,
    )
    if (!payment) continue

    rows.push({
      lease,
      unit,
      property,
      tenant,
      expected: payment.amountDue,
      collected: payment.amountPaid,
      balance: Math.max(0, payment.amountDue - payment.amountPaid),
      status: paymentStatus(payment.amountDue, payment.amountPaid, payment.dueDate),
      paidDate: payment.paidDate,
      method: payment.method,
    })
  }

  return rows.sort((a, b) => a.property.name.localeCompare(b.property.name) || a.unit.label.localeCompare(b.unit.label))
}

/** Every unpaid balance across the whole trailing window, newest first. */
export function delinquencies(state: PortfolioState) {
  return state.payments
    .filter((payment) => payment.amountPaid < payment.amountDue)
    .map((payment) => {
      const lease = state.leases.find((item) => item.id === payment.leaseId)
      const unit = lease ? unitById(state, lease.unitId) : undefined
      const tenant = lease ? tenantById(state, lease.tenantId) : undefined
      const property = unit ? propertyById(state, unit.propertyId) : undefined
      return {
        payment,
        lease,
        unit,
        tenant,
        property,
        balance: payment.amountDue - payment.amountPaid,
        daysLate: daysBetween(payment.dueDate, TODAY),
        status: paymentStatus(payment.amountDue, payment.amountPaid, payment.dueDate),
      }
    })
    .sort((a, b) => b.balance - a.balance)
}

export function tenantLedger(state: PortfolioState, tenantId: string) {
  const leaseIds = state.leases
    .filter((lease) => lease.tenantId === tenantId)
    .map((lease) => lease.id)
  return state.payments
    .filter((payment) => leaseIds.includes(payment.leaseId))
    .sort((a, b) => b.period.localeCompare(a.period))
}

export function tenantBalance(state: PortfolioState, tenantId: string) {
  return tenantLedger(state, tenantId).reduce(
    (sum, payment) => sum + Math.max(0, payment.amountDue - payment.amountPaid),
    0,
  )
}

/* -------------------------------- financials ------------------------------ */

export function collectedIn(state: PortfolioState, period: string, propertyId?: string) {
  return state.payments
    .filter((payment) => {
      if (payment.period !== period) return false
      if (!propertyId) return true
      const lease = state.leases.find((item) => item.id === payment.leaseId)
      const unit = lease ? unitById(state, lease.unitId) : undefined
      return unit?.propertyId === propertyId
    })
    .reduce((sum, payment) => sum + payment.amountPaid, 0)
}

export function expectedIn(state: PortfolioState, period: string, propertyId?: string) {
  return state.payments
    .filter((payment) => {
      if (payment.period !== period) return false
      if (!propertyId) return true
      const lease = state.leases.find((item) => item.id === payment.leaseId)
      const unit = lease ? unitById(state, lease.unitId) : undefined
      return unit?.propertyId === propertyId
    })
    .reduce((sum, payment) => sum + payment.amountDue, 0)
}

export function expensesIn(state: PortfolioState, period: string, propertyId?: string) {
  return state.expenses
    .filter(
      (expense) =>
        expense.period === period && (!propertyId || expense.propertyId === propertyId),
    )
    .reduce((sum, expense) => sum + expense.amount, 0)
}

export function monthlySeries(state: PortfolioState, propertyId?: string) {
  return PERIODS.map((period) => {
    const income = collectedIn(state, period, propertyId)
    const spend = expensesIn(state, period, propertyId)
    return { period, income, expenses: spend, net: income - spend }
  })
}

export function expenseBreakdown(state: PortfolioState, period?: string, propertyId?: string) {
  const totals = new Map<ExpenseCategory, number>()
  for (const expense of state.expenses) {
    if (period && expense.period !== period) continue
    if (propertyId && expense.propertyId !== propertyId) continue
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount)
  }
  const palette: Record<ExpenseCategory, string> = {
    mortgage: 'var(--color-chart-3)',
    taxes: 'var(--color-chart-2)',
    insurance: 'var(--color-chart-4)',
    utilities: 'var(--color-chart-5)',
    management: 'var(--color-chart-1)',
    maintenance: 'var(--color-chart-2)',
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount, fill: palette[category] }))
    .sort((a, b) => b.amount - a.amount)
}

export interface PropertyPerformance {
  property: Property
  units: number
  occupancyRate: number
  rentRoll: number
  collected: number
  expenses: number
  net: number
  openTickets: number
}

export function propertyPerformance(
  state: PortfolioState,
  period = CURRENT_PERIOD,
): PropertyPerformance[] {
  return state.properties.map((property) => {
    const propertyUnits = unitsOfProperty(state, property.id)
    const rent = leasesOfProperty(state, property.id).reduce(
      (sum, lease) => sum + lease.rent,
      0,
    )
    const collected = collectedIn(state, period, property.id)
    const spend = expensesIn(state, period, property.id)
    return {
      property,
      units: propertyUnits.length,
      occupancyRate: occupancy(propertyUnits).rate,
      rentRoll: rent,
      collected,
      expenses: spend,
      net: collected - spend,
      openTickets: state.requests.filter(
        (request) => request.propertyId === property.id && request.status !== 'resolved',
      ).length,
    }
  })
}

/* ------------------------------- maintenance ------------------------------ */

export const TICKET_COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'open', label: 'Open' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'resolved', label: 'Resolved' },
]

export function ticketsByStatus(state: PortfolioState, status: TicketStatus) {
  return state.requests
    .filter((request) => request.status === status)
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
}

export function openTickets(state: PortfolioState) {
  return state.requests.filter((request) => request.status !== 'resolved')
}

export function urgentTickets(state: PortfolioState) {
  return openTickets(state).filter(
    (request) => request.priority === 'urgent' || request.priority === 'high',
  )
}

/* -------------------------------- portfolio ------------------------------- */

export function portfolioSummary(state: PortfolioState) {
  const occ = occupancy(state.units)
  const expected = expectedIn(state, CURRENT_PERIOD)
  const collected = collectedIn(state, CURRENT_PERIOD)
  const spend = expensesIn(state, CURRENT_PERIOD)
  const outstanding = delinquencies(state).reduce((sum, item) => sum + item.balance, 0)

  return {
    properties: state.properties.length,
    units: occ.total,
    occupied: occ.filled,
    vacant: occ.vacant,
    occupancyRate: occ.rate,
    activeLeases: state.leases.filter((lease) => leaseStage(lease) !== 'expired').length,
    expected,
    collected,
    collectionRate: expected ? collected / expected : 0,
    outstanding,
    expenses: spend,
    net: collected - spend,
    portfolioValue: state.properties.reduce(
      (sum, property) => sum + property.currentValue,
      0,
    ),
    openTickets: openTickets(state).length,
    urgentTickets: urgentTickets(state).length,
    expiringSoon: expiringLeases(state, 60).length,
  }
}
