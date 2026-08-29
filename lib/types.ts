export type UnitStatus = 'occupied' | 'vacant' | 'notice' | 'renovating'

export type LeaseStatus = 'active' | 'expiring' | 'expired' | 'pending'

export type PaymentStatus = 'paid' | 'due' | 'partial' | 'overdue'

export type TicketStatus = 'open' | 'in_progress' | 'scheduled' | 'resolved'

export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low'

export type ExpenseCategory =
  | 'maintenance'
  | 'taxes'
  | 'insurance'
  | 'utilities'
  | 'management'
  | 'mortgage'

export type DocumentKind =
  | 'lease'
  | 'receipt'
  | 'inspection'
  | 'insurance'
  | 'notice'
  | 'invoice'

export type PropertyKind =
  | 'Multi-family'
  | 'Duplex'
  | 'Townhomes'
  | 'Single-family'
  | 'Rowhouse'

export interface Property {
  id: string
  name: string
  street: string
  city: string
  state: string
  zip: string
  kind: PropertyKind
  yearBuilt: number
  purchasePrice: number
  currentValue: number
  image: string
  notes: string
}

export interface Unit {
  id: string
  propertyId: string
  label: string
  beds: number
  baths: number
  sqft: number
  marketRent: number
  status: UnitStatus
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  since: string
}

export interface Lease {
  id: string
  unitId: string
  tenantId: string
  start: string
  end: string
  rent: number
  deposit: number
  status: LeaseStatus
}

export interface Payment {
  id: string
  leaseId: string
  period: string
  amountDue: number
  amountPaid: number
  dueDate: string
  paidDate: string | null
  method: 'ACH' | 'Card' | 'Check' | 'Cash' | null
}

export interface MaintenanceRequest {
  id: string
  propertyId: string
  unitId: string | null
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  openedAt: string
  assignee: string | null
  estimate: number | null
}

export interface Expense {
  id: string
  propertyId: string
  period: string
  category: ExpenseCategory
  amount: number
  vendor: string
}

export interface DocumentRecord {
  id: string
  name: string
  kind: DocumentKind
  propertyId: string | null
  tenantId: string | null
  sizeKb: number
  uploadedAt: string
}

export interface Activity {
  id: string
  at: string
  kind: 'payment' | 'maintenance' | 'lease' | 'document' | 'tenant'
  message: string
}

export interface PortfolioState {
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  leases: Lease[]
  payments: Payment[]
  requests: MaintenanceRequest[]
  expenses: Expense[]
  documents: DocumentRecord[]
  activity: Activity[]
}
