import type {
  Activity,
  DocumentRecord,
  Expense,
  ExpenseCategory,
  Lease,
  MaintenanceRequest,
  Payment,
  PortfolioState,
  Property,
  Tenant,
  Unit,
} from './types'

/**
 * Fixed "today" anchor so every derived figure is stable between server and
 * client renders. No Math.random() and no `new Date()` at module scope.
 */
export const TODAY = '2026-08-27'
export const CURRENT_PERIOD = '2026-08'

export const PERIODS = [
  '2025-09',
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
]

/* ---------------------------------- utils --------------------------------- */

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic 0..1 pseudo-random from a string key. */
function rand(key: string) {
  let t = hash(key) + 0x6d2b79f5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function randInt(key: string, min: number, max: number) {
  return min + Math.floor(rand(key) * (max - min + 1))
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function periodStart(period: string) {
  return `${period}-01`
}

function monthIndex(period: string) {
  const [y, m] = period.split('-').map(Number)
  return y * 12 + (m - 1)
}

/* -------------------------------- properties ------------------------------- */

export const properties: Property[] = [
  {
    id: 'p1',
    name: 'Harbor Row',
    street: '118 Harbor Street',
    city: 'Portland',
    state: 'OR',
    zip: '97209',
    kind: 'Rowhouse',
    yearBuilt: 1928,
    purchasePrice: 612000,
    currentValue: 845000,
    image: '/properties/harbor-row.png',
    notes: 'Brick rowhouse, four units. Roof replaced 2023, shared laundry in basement.',
  },
  {
    id: 'p2',
    name: 'Alder Court',
    street: '2401 Alder Court',
    city: 'Portland',
    state: 'OR',
    zip: '97214',
    kind: 'Multi-family',
    yearBuilt: 1974,
    purchasePrice: 1140000,
    currentValue: 1490000,
    image: '/properties/alder-court.png',
    notes: 'Six-unit garden apartment block. Unit 302 mid-renovation, targeting Oct listing.',
  },
  {
    id: 'p3',
    name: 'The Maples',
    street: '54 Maple Avenue',
    city: 'Beaverton',
    state: 'OR',
    zip: '97005',
    kind: 'Duplex',
    yearBuilt: 1996,
    purchasePrice: 498000,
    currentValue: 665000,
    image: '/properties/the-maples.png',
    notes: 'Side-by-side duplex with private garages. Long-tenured residents both sides.',
  },
  {
    id: 'p4',
    name: 'Cedar Bluff Townhomes',
    street: '780 Cedar Bluff Way',
    city: 'Lake Oswego',
    state: 'OR',
    zip: '97034',
    kind: 'Townhomes',
    yearBuilt: 2011,
    purchasePrice: 1320000,
    currentValue: 1710000,
    image: '/properties/cedar-bluff.png',
    notes: 'Four attached townhomes, HOA-free. Highest rents in the portfolio.',
  },
  {
    id: 'p5',
    name: '27 Willow',
    street: '27 Willow Lane',
    city: 'Milwaukie',
    state: 'OR',
    zip: '97222',
    kind: 'Single-family',
    yearBuilt: 1962,
    purchasePrice: 465000,
    currentValue: 598000,
    image: '/properties/27-willow.png',
    notes: 'Single-family rental on a large lot. Tenant maintains the yard per lease rider.',
  },
]

/* ---------------------------------- units --------------------------------- */

export const units: Unit[] = [
  { id: 'u1', propertyId: 'p1', label: '1A', beds: 2, baths: 1, sqft: 880, marketRent: 1850, status: 'occupied' },
  { id: 'u2', propertyId: 'p1', label: '1B', beds: 2, baths: 1, sqft: 860, marketRent: 1800, status: 'occupied' },
  { id: 'u3', propertyId: 'p1', label: '2A', beds: 1, baths: 1, sqft: 640, marketRent: 1495, status: 'vacant' },
  { id: 'u4', propertyId: 'p1', label: '2B', beds: 2, baths: 1.5, sqft: 940, marketRent: 1975, status: 'occupied' },
  { id: 'u5', propertyId: 'p2', label: '101', beds: 1, baths: 1, sqft: 620, marketRent: 1475, status: 'occupied' },
  { id: 'u6', propertyId: 'p2', label: '102', beds: 1, baths: 1, sqft: 610, marketRent: 1450, status: 'occupied' },
  { id: 'u7', propertyId: 'p2', label: '201', beds: 2, baths: 1, sqft: 790, marketRent: 1550, status: 'occupied' },
  { id: 'u8', propertyId: 'p2', label: '202', beds: 2, baths: 1, sqft: 785, marketRent: 1550, status: 'notice' },
  { id: 'u9', propertyId: 'p2', label: '301', beds: 2, baths: 1, sqft: 800, marketRent: 1595, status: 'occupied' },
  { id: 'u10', propertyId: 'p2', label: '302', beds: 2, baths: 1, sqft: 800, marketRent: 1650, status: 'renovating' },
  { id: 'u11', propertyId: 'p3', label: 'Unit A', beds: 3, baths: 2, sqft: 1320, marketRent: 2150, status: 'occupied' },
  { id: 'u12', propertyId: 'p3', label: 'Unit B', beds: 3, baths: 2, sqft: 1320, marketRent: 2150, status: 'occupied' },
  { id: 'u13', propertyId: 'p4', label: 'T1', beds: 3, baths: 2.5, sqft: 1580, marketRent: 2495, status: 'occupied' },
  { id: 'u14', propertyId: 'p4', label: 'T2', beds: 3, baths: 2.5, sqft: 1580, marketRent: 2495, status: 'occupied' },
  { id: 'u15', propertyId: 'p4', label: 'T3', beds: 3, baths: 2.5, sqft: 1620, marketRent: 2550, status: 'occupied' },
  { id: 'u16', propertyId: 'p4', label: 'T4', beds: 2, baths: 2, sqft: 1290, marketRent: 2250, status: 'vacant' },
  { id: 'u17', propertyId: 'p5', label: 'Main house', beds: 4, baths: 2, sqft: 1980, marketRent: 3200, status: 'occupied' },
]

/* --------------------------------- tenants -------------------------------- */

export const tenants: Tenant[] = [
  { id: 't1', name: 'Amara Osei', email: 'amara.osei@example.com', phone: '(503) 214-8890', since: '2025-04-01' },
  { id: 't2', name: 'Ben Kowalski', email: 'ben.kowalski@example.com', phone: '(503) 447-1123', since: '2024-09-01' },
  { id: 't3', name: 'Priya Raman', email: 'priya.raman@example.com', phone: '(971) 330-5512', since: '2026-02-01' },
  { id: 't4', name: 'Devon Marsh', email: 'devon.marsh@example.com', phone: '(503) 662-0417', since: '2025-07-01' },
  { id: 't5', name: 'Lucia Ferreira', email: 'lucia.ferreira@example.com', phone: '(503) 118-7734', since: '2024-11-01' },
  { id: 't6', name: 'Noah Whitfield', email: 'noah.whitfield@example.com', phone: '(971) 505-2210', since: '2026-01-15' },
  { id: 't7', name: 'Grace Lindqvist', email: 'grace.lindqvist@example.com', phone: '(503) 889-6641', since: '2025-10-01' },
  { id: 't8', name: 'Marcus Bell', email: 'marcus.bell@example.com', phone: '(503) 274-9903', since: '2025-06-01' },
  { id: 't9', name: 'Hana Sato', email: 'hana.sato@example.com', phone: '(971) 612-3388', since: '2026-03-01' },
  { id: 't10', name: 'Elliot Vance', email: 'elliot.vance@example.com', phone: '(503) 356-7719', since: '2025-08-01' },
  { id: 't11', name: 'Rosa Delgado', email: 'rosa.delgado@example.com', phone: '(503) 991-4402', since: '2024-12-01' },
  { id: 't12', name: 'Theo Nakamura', email: 'theo.nakamura@example.com', phone: '(971) 240-8865', since: '2026-05-01' },
  { id: 't13', name: 'Simone Achebe', email: 'simone.achebe@example.com', phone: '(503) 703-5590', since: '2025-03-01' },
  { id: 't14', name: 'Owen Brady', email: 'owen.brady@example.com', phone: '(503) 425-1178', since: '2025-02-01' },
]

/* --------------------------------- leases --------------------------------- */

export const leases: Lease[] = [
  { id: 'l1', unitId: 'u1', tenantId: 't1', start: '2025-04-01', end: '2027-03-31', rent: 1850, deposit: 1850, status: 'active' },
  { id: 'l2', unitId: 'u2', tenantId: 't2', start: '2024-09-01', end: '2026-08-31', rent: 1725, deposit: 1725, status: 'expiring' },
  { id: 'l3', unitId: 'u4', tenantId: 't3', start: '2026-02-01', end: '2027-01-31', rent: 1950, deposit: 1950, status: 'active' },
  { id: 'l4', unitId: 'u5', tenantId: 't4', start: '2025-07-01', end: '2027-06-30', rent: 1450, deposit: 1450, status: 'active' },
  { id: 'l5', unitId: 'u6', tenantId: 't5', start: '2024-11-01', end: '2026-10-31', rent: 1395, deposit: 1395, status: 'expiring' },
  { id: 'l6', unitId: 'u7', tenantId: 't6', start: '2026-01-15', end: '2027-01-14', rent: 1525, deposit: 1525, status: 'active' },
  { id: 'l7', unitId: 'u8', tenantId: 't7', start: '2025-10-01', end: '2026-09-30', rent: 1480, deposit: 1480, status: 'expiring' },
  { id: 'l8', unitId: 'u11', tenantId: 't8', start: '2025-06-01', end: '2027-05-31', rent: 2100, deposit: 2100, status: 'active' },
  { id: 'l9', unitId: 'u12', tenantId: 't9', start: '2026-03-01', end: '2027-02-28', rent: 2050, deposit: 2050, status: 'active' },
  { id: 'l10', unitId: 'u13', tenantId: 't10', start: '2025-08-01', end: '2027-07-31', rent: 2450, deposit: 2450, status: 'active' },
  { id: 'l11', unitId: 'u14', tenantId: 't11', start: '2024-12-01', end: '2026-11-30', rent: 2375, deposit: 2375, status: 'expiring' },
  { id: 'l12', unitId: 'u15', tenantId: 't12', start: '2026-05-01', end: '2027-04-30', rent: 2500, deposit: 2500, status: 'active' },
  { id: 'l13', unitId: 'u17', tenantId: 't13', start: '2025-03-01', end: '2027-02-28', rent: 3200, deposit: 3200, status: 'active' },
  { id: 'l14', unitId: 'u9', tenantId: 't14', start: '2025-02-01', end: '2027-01-31', rent: 1560, deposit: 1560, status: 'active' },
]

/* -------------------------------- payments -------------------------------- */

type Override = { paid: number | 'full'; lateDays?: number }

/**
 * Hand-placed exceptions so the delinquency stories are stable and legible.
 * Everything not listed here is paid in full a day or two after the due date.
 */
const PAYMENT_OVERRIDES: Record<string, Override> = {
  'l5:2026-07': { paid: 700, lateDays: 12 },
  'l5:2026-08': { paid: 700, lateDays: 14 },
  'l12:2026-06': { paid: 0 },
  'l2:2026-08': { paid: 0 },
  'l7:2026-08': { paid: 0 },
  'l12:2026-08': { paid: 0 },
  'l6:2026-04': { paid: 'full', lateDays: 19 },
  'l11:2026-02': { paid: 'full', lateDays: 16 },
}

function buildPayments(): Payment[] {
  const methods = ['ACH', 'ACH', 'ACH', 'Card', 'Check'] as const
  const result: Payment[] = []

  for (const lease of leases) {
    const from = monthIndex(lease.start.slice(0, 7))
    const to = monthIndex(lease.end.slice(0, 7))

    for (const period of PERIODS) {
      const idx = monthIndex(period)
      if (idx < from || idx > to) continue

      const key = `${lease.id}:${period}`
      const override = PAYMENT_OVERRIDES[key]
      const due = periodStart(period)

      let amountPaid = lease.rent
      let lateDays = randInt(`late-${key}`, 0, 3)

      if (override) {
        amountPaid = override.paid === 'full' ? lease.rent : override.paid
        lateDays = override.lateDays ?? 0
      }

      result.push({
        id: `pay-${key}`,
        leaseId: lease.id,
        period,
        amountDue: lease.rent,
        amountPaid,
        dueDate: due,
        paidDate: amountPaid > 0 ? addDays(due, lateDays) : null,
        method: amountPaid > 0 ? methods[randInt(`m-${key}`, 0, methods.length - 1)] : null,
      })
    }
  }

  return result
}

export const payments: Payment[] = buildPayments()

/* -------------------------------- expenses -------------------------------- */

const EXPENSE_BASELINE: Record<
  string,
  { mortgage: number; insurance: number; quarterlyTaxes: number; utilities: number }
> = {
  p1: { mortgage: 3200, insurance: 210, quarterlyTaxes: 2400, utilities: 340 },
  p2: { mortgage: 4800, insurance: 330, quarterlyTaxes: 3600, utilities: 620 },
  p3: { mortgage: 2400, insurance: 165, quarterlyTaxes: 1750, utilities: 210 },
  p4: { mortgage: 5100, insurance: 290, quarterlyTaxes: 3300, utilities: 380 },
  p5: { mortgage: 1900, insurance: 145, quarterlyTaxes: 1400, utilities: 120 },
}

const VENDORS: Record<ExpenseCategory, string> = {
  mortgage: 'Cascade Mutual',
  insurance: 'Rainier Property Ins.',
  taxes: 'Multnomah County',
  utilities: 'Portland General',
  management: 'In-house',
  maintenance: 'Bridgetown Trades',
}

function buildExpenses(): Expense[] {
  const result: Expense[] = []

  for (const property of properties) {
    const base = EXPENSE_BASELINE[property.id]
    const rentRoll = leases
      .filter((lease) => units.find((u) => u.id === lease.unitId)?.propertyId === property.id)
      .reduce((sum, lease) => sum + lease.rent, 0)

    for (const period of PERIODS) {
      const month = Number(period.split('-')[1])
      const push = (category: ExpenseCategory, amount: number) => {
        if (amount <= 0) return
        result.push({
          id: `exp-${property.id}-${period}-${category}`,
          propertyId: property.id,
          period,
          category,
          amount: Math.round(amount),
          vendor: VENDORS[category],
        })
      }

      push('mortgage', base.mortgage)
      push('insurance', base.insurance)
      push('utilities', base.utilities + randInt(`ut-${property.id}-${period}`, -60, 110))
      push('management', rentRoll * 0.08)
      if ([1, 4, 7, 10].includes(month)) push('taxes', base.quarterlyTaxes)

      const maintenanceRoll = rand(`mt-${property.id}-${period}`)
      if (maintenanceRoll > 0.28) {
        push('maintenance', 120 + maintenanceRoll * 980)
      }
    }
  }

  return result
}

export const expenses: Expense[] = buildExpenses()

/* ------------------------------- maintenance ------------------------------ */

export const requests: MaintenanceRequest[] = [
  {
    id: 'm1',
    propertyId: 'p2',
    unitId: 'u7',
    title: 'Kitchen sink draining slowly',
    description: 'Standing water in both basins. Plunger did not clear it. Tenant reports gurgling from the disposal.',
    category: 'Plumbing',
    priority: 'normal',
    status: 'in_progress',
    openedAt: '2026-08-22',
    assignee: 'Bridgetown Trades',
    estimate: 240,
  },
  {
    id: 'm2',
    propertyId: 'p1',
    unitId: 'u4',
    title: 'No hot water',
    description: 'Water heater pilot will not stay lit. Unit has two adults and an infant — treat as urgent.',
    category: 'Appliance',
    priority: 'urgent',
    status: 'open',
    openedAt: '2026-08-26',
    assignee: null,
    estimate: 780,
  },
  {
    id: 'm3',
    propertyId: 'p4',
    unitId: 'u14',
    title: 'Garage door remote unresponsive',
    description: 'Wall button works, both remotes do not. Likely receiver board.',
    category: 'Electrical',
    priority: 'low',
    status: 'scheduled',
    openedAt: '2026-08-14',
    assignee: 'Overhead Door Co.',
    estimate: 165,
  },
  {
    id: 'm4',
    propertyId: 'p2',
    unitId: null,
    title: 'Stairwell light out on 3rd floor',
    description: 'Common-area fixture. Safety issue after dark, tenants have flagged it twice.',
    category: 'Electrical',
    priority: 'high',
    status: 'open',
    openedAt: '2026-08-25',
    assignee: null,
    estimate: 90,
  },
  {
    id: 'm5',
    propertyId: 'p5',
    unitId: 'u17',
    title: 'Roof drip above back bedroom',
    description: 'Active drip during last rain. Tarped temporarily. Needs a roofer before the wet season.',
    category: 'Roofing',
    priority: 'urgent',
    status: 'in_progress',
    openedAt: '2026-08-19',
    assignee: 'Summit Roofing',
    estimate: 2400,
  },
  {
    id: 'm6',
    propertyId: 'p3',
    unitId: 'u11',
    title: 'Dishwasher leaking at door seal',
    description: 'Small puddle after each cycle. Gasket appears cracked.',
    category: 'Appliance',
    priority: 'normal',
    status: 'scheduled',
    openedAt: '2026-08-11',
    assignee: 'Bridgetown Trades',
    estimate: 195,
  },
  {
    id: 'm7',
    propertyId: 'p1',
    unitId: 'u3',
    title: 'Turnover paint and carpet — 2A',
    description: 'Full repaint plus carpet replacement in bedroom before re-listing the unit.',
    category: 'Turnover',
    priority: 'high',
    status: 'in_progress',
    openedAt: '2026-08-08',
    assignee: 'Rosewood Painting',
    estimate: 3100,
  },
  {
    id: 'm8',
    propertyId: 'p2',
    unitId: 'u10',
    title: 'Unit 302 renovation — bath tile',
    description: 'Tile and vanity install, final phase of the 302 renovation.',
    category: 'Renovation',
    priority: 'normal',
    status: 'in_progress',
    openedAt: '2026-07-29',
    assignee: 'Alder Build Co.',
    estimate: 5600,
  },
  {
    id: 'm9',
    propertyId: 'p4',
    unitId: 'u15',
    title: 'HVAC annual service',
    description: 'Preventative service and filter change ahead of the heating season.',
    category: 'HVAC',
    priority: 'low',
    status: 'resolved',
    openedAt: '2026-07-16',
    assignee: 'Northwest Air',
    estimate: 220,
  },
  {
    id: 'm10',
    propertyId: 'p1',
    unitId: 'u1',
    title: 'Window screen torn',
    description: 'Living room screen replaced.',
    category: 'General',
    priority: 'low',
    status: 'resolved',
    openedAt: '2026-07-09',
    assignee: 'Bridgetown Trades',
    estimate: 60,
  },
  {
    id: 'm11',
    propertyId: 'p3',
    unitId: 'u12',
    title: 'Fence panel down after wind',
    description: 'Two panels along the rear property line reset and re-anchored.',
    category: 'Exterior',
    priority: 'normal',
    status: 'resolved',
    openedAt: '2026-06-28',
    assignee: 'Bridgetown Trades',
    estimate: 480,
  },
  {
    id: 'm12',
    propertyId: 'p4',
    unitId: 'u16',
    title: 'Smoke detector batteries — T4',
    description: 'Replace all detector batteries as part of the vacancy checklist.',
    category: 'Safety',
    priority: 'normal',
    status: 'open',
    openedAt: '2026-08-24',
    assignee: null,
    estimate: 40,
  },
]

/* -------------------------------- documents ------------------------------- */

export const documents: DocumentRecord[] = [
  { id: 'd1', name: 'Lease — Harbor Row 1A — Osei.pdf', kind: 'lease', propertyId: 'p1', tenantId: 't1', sizeKb: 412, uploadedAt: '2025-03-24' },
  { id: 'd2', name: 'Lease — Harbor Row 1B — Kowalski.pdf', kind: 'lease', propertyId: 'p1', tenantId: 't2', sizeKb: 398, uploadedAt: '2024-08-20' },
  { id: 'd3', name: 'Lease — Cedar Bluff T3 — Nakamura.pdf', kind: 'lease', propertyId: 'p4', tenantId: 't12', sizeKb: 441, uploadedAt: '2026-04-21' },
  { id: 'd4', name: 'Move-in inspection — Maples Unit B.pdf', kind: 'inspection', propertyId: 'p3', tenantId: 't9', sizeKb: 1860, uploadedAt: '2026-02-27' },
  { id: 'd5', name: 'Roof inspection — 27 Willow.pdf', kind: 'inspection', propertyId: 'p5', tenantId: null, sizeKb: 2240, uploadedAt: '2026-08-20' },
  { id: 'd6', name: 'Portfolio insurance policy 2026.pdf', kind: 'insurance', propertyId: null, tenantId: null, sizeKb: 3120, uploadedAt: '2026-01-06' },
  { id: 'd7', name: 'Alder Court — liability rider.pdf', kind: 'insurance', propertyId: 'p2', tenantId: null, sizeKb: 640, uploadedAt: '2026-01-06' },
  { id: 'd8', name: 'Notice to renew — Ferreira (102).pdf', kind: 'notice', propertyId: 'p2', tenantId: 't5', sizeKb: 118, uploadedAt: '2026-08-01' },
  { id: 'd9', name: 'Notice to vacate — Lindqvist (202).pdf', kind: 'notice', propertyId: 'p2', tenantId: 't7', sizeKb: 96, uploadedAt: '2026-07-30' },
  { id: 'd10', name: 'Invoice — Summit Roofing #4412.pdf', kind: 'invoice', propertyId: 'p5', tenantId: null, sizeKb: 224, uploadedAt: '2026-08-21' },
  { id: 'd11', name: 'Invoice — Alder Build Co. 302 phase 2.pdf', kind: 'invoice', propertyId: 'p2', tenantId: null, sizeKb: 310, uploadedAt: '2026-08-04' },
  { id: 'd12', name: 'Receipt — Achebe August rent.pdf', kind: 'receipt', propertyId: 'p5', tenantId: 't13', sizeKb: 74, uploadedAt: '2026-08-02' },
  { id: 'd13', name: 'Receipt — Bell August rent.pdf', kind: 'receipt', propertyId: 'p3', tenantId: 't8', sizeKb: 72, uploadedAt: '2026-08-03' },
  { id: 'd14', name: 'W-9 — Bridgetown Trades.pdf', kind: 'invoice', propertyId: null, tenantId: null, sizeKb: 88, uploadedAt: '2025-11-12' },
]

/* -------------------------------- activity -------------------------------- */

export const activity: Activity[] = [
  { id: 'a1', at: '2026-08-26', kind: 'maintenance', message: 'Urgent request opened — no hot water at Harbor Row 2B' },
  { id: 'a2', at: '2026-08-25', kind: 'maintenance', message: 'Common-area light reported at Alder Court, 3rd floor' },
  { id: 'a3', at: '2026-08-24', kind: 'payment', message: 'Rent received from Simone Achebe — $3,200 via ACH' },
  { id: 'a4', at: '2026-08-22', kind: 'lease', message: 'Renewal offer sent to Lucia Ferreira for Alder Court 102' },
  { id: 'a5', at: '2026-08-21', kind: 'document', message: 'Summit Roofing invoice #4412 added to 27 Willow' },
  { id: 'a6', at: '2026-08-19', kind: 'maintenance', message: 'Roof leak at 27 Willow assigned to Summit Roofing' },
  { id: 'a7', at: '2026-08-14', kind: 'payment', message: 'Partial payment posted for Alder Court 102 — $700 of $1,395' },
  { id: 'a8', at: '2026-08-08', kind: 'tenant', message: 'Turnover started on Harbor Row 2A after move-out' },
]

export const initialState: PortfolioState = {
  properties,
  units,
  tenants,
  leases,
  payments,
  requests,
  expenses,
  documents,
  activity,
}
