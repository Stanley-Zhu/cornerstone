'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { CURRENT_PERIOD, TODAY, initialState } from './mock-data'
import type {
  Activity,
  DocumentKind,
  DocumentRecord,
  Expense,
  ExpenseCategory,
  Lease,
  MaintenanceRequest,
  PortfolioState,
  PropertyKind,
  TicketPriority,
  TicketStatus,
} from './types'

/* --------------------------------- payloads -------------------------------- */

export interface NewRequestInput {
  propertyId: string
  unitId: string | null
  title: string
  description: string
  category: string
  priority: TicketPriority
}

export interface RecordPaymentInput {
  leaseId: string
  period: string
  amount: number
  method: 'ACH' | 'Card' | 'Check' | 'Cash'
}

export interface NewTenantInput {
  name: string
  email: string
  phone: string
  unitId: string
  rent: number
  deposit: number
  start: string
  end: string
}

export interface NewPropertyInput {
  name: string
  street: string
  city: string
  state: string
  zip: string
  kind: PropertyKind
  yearBuilt: number
  currentValue: number
  unitCount: number
  marketRent: number
}

export interface NewExpenseInput {
  propertyId: string
  category: ExpenseCategory
  amount: number
  vendor: string
}

export interface NewDocumentInput {
  name: string
  kind: DocumentKind
  propertyId: string | null
  tenantId: string | null
  sizeKb: number
}

type Action =
  | { type: 'request/add'; input: NewRequestInput }
  | { type: 'request/status'; id: string; status: TicketStatus }
  | { type: 'request/assign'; id: string; assignee: string }
  | { type: 'payment/record'; input: RecordPaymentInput }
  | { type: 'tenant/add'; input: NewTenantInput }
  | { type: 'property/add'; input: NewPropertyInput }
  | { type: 'expense/add'; input: NewExpenseInput }
  | { type: 'document/add'; input: NewDocumentInput }
  | { type: 'lease/renew'; id: string; end: string; rent: number }
  | { type: 'lease/end'; id: string }

let sequence = 0
function nextId(prefix: string) {
  sequence += 1
  return `${prefix}-new-${sequence}`
}

function logActivity(
  state: PortfolioState,
  kind: Activity['kind'],
  message: string,
): Activity[] {
  return [{ id: nextId('act'), at: TODAY, kind, message }, ...state.activity].slice(0, 20)
}

function reducer(state: PortfolioState, action: Action): PortfolioState {
  switch (action.type) {
    case 'request/add': {
      const request: MaintenanceRequest = {
        id: nextId('m'),
        propertyId: action.input.propertyId,
        unitId: action.input.unitId,
        title: action.input.title,
        description: action.input.description,
        category: action.input.category,
        priority: action.input.priority,
        status: 'open',
        openedAt: TODAY,
        assignee: null,
        estimate: null,
      }
      return {
        ...state,
        requests: [request, ...state.requests],
        activity: logActivity(state, 'maintenance', `Request opened — ${request.title}`),
      }
    }

    case 'request/status': {
      const target = state.requests.find((request) => request.id === action.id)
      return {
        ...state,
        requests: state.requests.map((request) =>
          request.id === action.id ? { ...request, status: action.status } : request,
        ),
        activity: target
          ? logActivity(
              state,
              'maintenance',
              `${target.title} moved to ${action.status.replace('_', ' ')}`,
            )
          : state.activity,
      }
    }

    case 'request/assign':
      return {
        ...state,
        requests: state.requests.map((request) =>
          request.id === action.id ? { ...request, assignee: action.assignee } : request,
        ),
      }

    case 'payment/record': {
      const { leaseId, period, amount, method } = action.input
      const lease = state.leases.find((item) => item.id === leaseId)
      const existing = state.payments.find(
        (payment) => payment.leaseId === leaseId && payment.period === period,
      )
      const tenant = state.tenants.find((item) => item.id === lease?.tenantId)

      const payments = existing
        ? state.payments.map((payment) =>
            payment.id === existing.id
              ? {
                  ...payment,
                  amountPaid: payment.amountPaid + amount,
                  paidDate: TODAY,
                  method,
                }
              : payment,
          )
        : [
            ...state.payments,
            {
              id: nextId('pay'),
              leaseId,
              period,
              amountDue: lease?.rent ?? amount,
              amountPaid: amount,
              dueDate: `${period}-01`,
              paidDate: TODAY,
              method,
            },
          ]

      return {
        ...state,
        payments,
        activity: logActivity(
          state,
          'payment',
          `Payment recorded — ${tenant?.name ?? 'tenant'} $${amount.toLocaleString()} via ${method}`,
        ),
      }
    }

    case 'tenant/add': {
      const tenantId = nextId('t')
      const lease: Lease = {
        id: nextId('l'),
        unitId: action.input.unitId,
        tenantId,
        start: action.input.start,
        end: action.input.end,
        rent: action.input.rent,
        deposit: action.input.deposit,
        status: 'active',
      }
      const unit = state.units.find((item) => item.id === action.input.unitId)
      return {
        ...state,
        tenants: [
          ...state.tenants,
          {
            id: tenantId,
            name: action.input.name,
            email: action.input.email,
            phone: action.input.phone,
            since: action.input.start,
          },
        ],
        leases: [...state.leases, lease],
        units: state.units.map((item) =>
          item.id === action.input.unitId ? { ...item, status: 'occupied' } : item,
        ),
        payments: [
          ...state.payments,
          {
            id: nextId('pay'),
            leaseId: lease.id,
            period: CURRENT_PERIOD,
            amountDue: lease.rent,
            amountPaid: 0,
            dueDate: `${CURRENT_PERIOD}-01`,
            paidDate: null,
            method: null,
          },
        ],
        activity: logActivity(
          state,
          'tenant',
          `${action.input.name} added to ${unit?.label ?? 'a unit'}`,
        ),
      }
    }

    case 'property/add': {
      const propertyId = nextId('p')
      const { unitCount, marketRent, ...rest } = action.input
      const newUnits = Array.from({ length: Math.max(1, unitCount) }, (_, index) => ({
        id: `${propertyId}-u${index + 1}`,
        propertyId,
        label: unitCount === 1 ? 'Main' : `Unit ${index + 1}`,
        beds: 2,
        baths: 1,
        sqft: 850,
        marketRent,
        status: 'vacant' as const,
      }))
      return {
        ...state,
        properties: [
          ...state.properties,
          {
            id: propertyId,
            ...rest,
            purchasePrice: rest.currentValue,
            image: '/properties/harbor-row.png',
            notes: 'Newly added to the portfolio.',
          },
        ],
        units: [...state.units, ...newUnits],
        activity: logActivity(state, 'lease', `${rest.name} added to the portfolio`),
      }
    }

    case 'expense/add': {
      const expense: Expense = {
        id: nextId('exp'),
        propertyId: action.input.propertyId,
        period: CURRENT_PERIOD,
        category: action.input.category,
        amount: action.input.amount,
        vendor: action.input.vendor,
      }
      return { ...state, expenses: [...state.expenses, expense] }
    }

    case 'document/add': {
      const document: DocumentRecord = {
        id: nextId('d'),
        name: action.input.name,
        kind: action.input.kind,
        propertyId: action.input.propertyId,
        tenantId: action.input.tenantId,
        sizeKb: action.input.sizeKb,
        uploadedAt: TODAY,
      }
      return {
        ...state,
        documents: [document, ...state.documents],
        activity: logActivity(state, 'document', `${document.name} uploaded`),
      }
    }

    case 'lease/renew': {
      const lease = state.leases.find((item) => item.id === action.id)
      const tenant = state.tenants.find((item) => item.id === lease?.tenantId)
      return {
        ...state,
        leases: state.leases.map((item) =>
          item.id === action.id
            ? { ...item, end: action.end, rent: action.rent, status: 'active' }
            : item,
        ),
        activity: logActivity(
          state,
          'lease',
          `Lease renewed for ${tenant?.name ?? 'tenant'} through ${action.end}`,
        ),
      }
    }

    case 'lease/end': {
      const lease = state.leases.find((item) => item.id === action.id)
      const tenant = state.tenants.find((item) => item.id === lease?.tenantId)
      return {
        ...state,
        leases: state.leases.map((item) =>
          item.id === action.id ? { ...item, status: 'expired' } : item,
        ),
        units: state.units.map((unit) =>
          unit.id === lease?.unitId ? { ...unit, status: 'vacant' } : unit,
        ),
        activity: logActivity(
          state,
          'lease',
          `Lease ended for ${tenant?.name ?? 'tenant'} — unit now vacant`,
        ),
      }
    }

    default:
      return state
  }
}

/* --------------------------------- context -------------------------------- */

interface StoreValue {
  state: PortfolioState
  addRequest: (input: NewRequestInput) => void
  setRequestStatus: (id: string, status: TicketStatus) => void
  assignRequest: (id: string, assignee: string) => void
  recordPayment: (input: RecordPaymentInput) => void
  addTenant: (input: NewTenantInput) => void
  addProperty: (input: NewPropertyInput) => void
  addExpense: (input: NewExpenseInput) => void
  addDocument: (input: NewDocumentInput) => void
  renewLease: (id: string, end: string, rent: number) => void
  endLease: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addRequest = useCallback(
    (input: NewRequestInput) => dispatch({ type: 'request/add', input }),
    [],
  )
  const setRequestStatus = useCallback(
    (id: string, status: TicketStatus) => dispatch({ type: 'request/status', id, status }),
    [],
  )
  const assignRequest = useCallback(
    (id: string, assignee: string) => dispatch({ type: 'request/assign', id, assignee }),
    [],
  )
  const recordPayment = useCallback(
    (input: RecordPaymentInput) => dispatch({ type: 'payment/record', input }),
    [],
  )
  const addTenant = useCallback(
    (input: NewTenantInput) => dispatch({ type: 'tenant/add', input }),
    [],
  )
  const addProperty = useCallback(
    (input: NewPropertyInput) => dispatch({ type: 'property/add', input }),
    [],
  )
  const addExpense = useCallback(
    (input: NewExpenseInput) => dispatch({ type: 'expense/add', input }),
    [],
  )
  const addDocument = useCallback(
    (input: NewDocumentInput) => dispatch({ type: 'document/add', input }),
    [],
  )
  const renewLease = useCallback(
    (id: string, end: string, rent: number) => dispatch({ type: 'lease/renew', id, end, rent }),
    [],
  )
  const endLease = useCallback((id: string) => dispatch({ type: 'lease/end', id }), [])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      addRequest,
      setRequestStatus,
      assignRequest,
      recordPayment,
      addTenant,
      addProperty,
      addExpense,
      addDocument,
      renewLease,
      endLease,
    }),
    [
      state,
      addRequest,
      setRequestStatus,
      assignRequest,
      recordPayment,
      addTenant,
      addProperty,
      addExpense,
      addDocument,
      renewLease,
      endLease,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function usePortfolio() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('usePortfolio must be used inside a StoreProvider')
  }
  return context
}
