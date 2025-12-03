

import { Invoice, InvoiceStatus, MatchStatus, RateCard, KPI, PaymentBatch, RoleDefinition, WorkflowStepConfig } from './types';

// ... (Previous constants remain, appending new ones)

export const INITIAL_ROLES: RoleDefinition[] = [
  { 
    id: 'scm', 
    name: 'SCM Operations', 
    description: 'Logistics leads responsible for operational verification.',
    users: 4, 
    color: 'bg-teal-600',
    permissions: { canViewInvoices: true, canApproveL1: true, canApproveL2: false, canManageRates: true, canAdminSystem: false } 
  },
  { 
    id: 'finance', 
    name: 'Finance & Treasury', 
    description: 'Controllers responsible for budget and payment release.',
    users: 2, 
    color: 'bg-blue-600',
    permissions: { canViewInvoices: true, canApproveL1: false, canApproveL2: true, canManageRates: false, canAdminSystem: false } 
  },
  { 
    id: 'admin', 
    name: 'System Admin', 
    description: 'Super users with full system configuration access.',
    users: 1, 
    color: 'bg-purple-600',
    permissions: { canViewInvoices: true, canApproveL1: true, canApproveL2: true, canManageRates: true, canAdminSystem: true } 
  }
];

export const INITIAL_WORKFLOW: WorkflowStepConfig[] = [
  {
    id: 'step-1',
    stepName: 'Operational Review',
    roleId: 'scm',
    conditionType: 'ALWAYS'
  },
  {
    id: 'step-2',
    stepName: 'High Value Approval',
    roleId: 'finance',
    conditionType: 'AMOUNT_GT',
    conditionValue: 5000
  },
  {
    id: 'step-3',
    stepName: 'ERP Settlement',
    roleId: 'system', // Special ID
    conditionType: 'ALWAYS',
    isSystemStep: true
  }
];

export const KPIS: KPI[] = [
  {
    label: 'TOTAL SPEND (YTD)',
    value: '$12,910,540',
    subtext: 'vs Budget: -2.1%',
    trend: 'down',
    color: 'blue'
  },
  {
    label: 'AUDIT SAVINGS',
    value: '$90,025',
    subtext: 'From 15 Auto-Rejections',
    trend: 'up',
    color: 'teal'
  },
  {
    label: 'TOUCHLESS RATE',
    value: '57.0%',
    subtext: 'Target: 85%',
    trend: 'neutral',
    color: 'orange'
  },
  {
    label: 'OPEN EXCEPTIONS',
    value: '12',
    subtext: 'Avg Resolution: 1.5 Days',
    trend: 'down',
    color: 'red'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '5467',
    invoiceNumber: '5467',
    carrier: 'Maersk',
    origin: 'Bloomington, IL',
    destination: 'Brisbane, AU',
    amount: 2775.00,
    currency: 'USD',
    date: '2025-11-19',
    dueDate: '2025-12-19',
    status: InvoiceStatus.APPROVED,
    variance: 0.00,
    reason: '3-Way Match OK',
    extractionConfidence: 99,
    workflowStep: 'COMPLETED',
    // TMS Data
    tmsEstimatedAmount: 2775.00,
    auditAmount: 2775.00,
    source: 'EDI',
    tmsMatchStatus: 'LINKED',
    sapShipmentRef: 'SHP-889210-01',
    lineItems: [
      { description: 'Ocean Freight - 20FT Standard', amount: 2775.00, expectedAmount: 2775.00 }
    ],
    matchResults: {
      rate: MatchStatus.MATCH,
      delivery: MatchStatus.MATCH,
      unit: MatchStatus.MATCH
    },
    glSegments: [
      { code: '101-20', segment: 'Power Grids', amount: 2775.00, percentage: 100, color: 'bg-blue-500' }
    ]
  },
  {
    id: '709114',
    invoiceNumber: '709114',
    carrier: 'Chilean Line',
    origin: 'Baltimore, MD',
    destination: 'Santiago, CL',
    amount: 2678.00,
    currency: 'USD',
    date: '2025-11-20',
    dueDate: '2025-12-20',
    status: InvoiceStatus.EXCEPTION,
    variance: 178.00,
    reason: 'Rate Mismatch (>5%)',
    extractionConfidence: 96,
    workflowStep: 'SCM_REVIEW',
    assignedTo: 'Lan Banh',
    // TMS Data - Shows the gap
    tmsEstimatedAmount: 2500.00, // TMS missed the surcharge
    auditAmount: 2500.00,        // ATLAS Contract Rate
    source: 'EDI',
    tmsMatchStatus: 'LINKED',
    sapShipmentRef: 'SHP-889210-02',
    lineItems: [
      { description: 'Ocean Freight - 40FT', amount: 2500.00, expectedAmount: 2500.00 },
      { description: 'Peak Season Surcharge', amount: 178.00, expectedAmount: 0.00 }
    ],
    matchResults: {
      rate: MatchStatus.MISMATCH,
      delivery: MatchStatus.MATCH,
      unit: MatchStatus.MATCH
    },
    glSegments: [
      { code: '101-55', segment: 'Transformers', amount: 1339.00, percentage: 50, color: 'bg-teal-500' },
      { code: '102-90', segment: 'Spare Parts', amount: 1339.00, percentage: 50, color: 'bg-orange-500' }
    ],
    dispute: {
      status: 'OPEN',
      history: [
        { actor: 'System', timestamp: '2025-11-20 10:05 AM', action: 'Exception Raised', comment: 'Billed amount $2678.00 exceeds contracted rate $2500.00 by $178.00.' }
      ]
    }
  },
  // --- SOLID FEATURE: GHOST SHIPMENT ---
  {
    id: 'INV-GHOST-001',
    invoiceNumber: 'EXP-991-URGENT',
    carrier: 'Expeditors',
    origin: 'JFK Airport',
    destination: 'Raleigh Hub',
    amount: 12500.00,
    currency: 'USD',
    date: '2025-11-26',
    dueDate: '2025-12-26',
    status: InvoiceStatus.EXCEPTION,
    variance: 0.00,
    reason: 'Ghost Shipment (No TMS Link)',
    extractionConfidence: 88,
    workflowStep: 'SCM_REVIEW',
    assignedTo: 'Logistics Mgr',
    // Ghost Data
    tmsEstimatedAmount: undefined, // No TMS record
    auditAmount: 12500.00,
    source: 'EMAIL', // Inbound via Email/PDF
    tmsMatchStatus: 'NOT_FOUND',
    sapShipmentRef: undefined,
    lineItems: [
       { description: 'Air Charter - Urgent Parts', amount: 12500.00, expectedAmount: 12500.00 }
    ],
    matchResults: {
       rate: MatchStatus.MATCH, // Rate card exists
       delivery: MatchStatus.MISSING, // No receipt yet
       unit: MatchStatus.MATCH
    },
    glSegments: [
       { code: '999-00', segment: 'Unallocated / Suspense', amount: 12500.00, percentage: 100, color: 'bg-gray-400' }
    ],
    dispute: {
      status: 'OPEN',
      history: [
        { actor: 'System', timestamp: '2025-11-26 09:00 AM', action: 'Exception Raised', comment: 'Invoice received via email has no corresponding shipment in TMS. Manual verification required.' }
      ]
    }
  },
  {
    id: 'LTL-992',
    invoiceNumber: 'LTL-992',
    carrier: 'K Line America',
    origin: 'Zone 1 (East)',
    destination: 'Zone 4 (Midwest)',
    amount: 450.00,
    currency: 'USD',
    date: '2025-11-21',
    dueDate: '2025-12-21',
    status: InvoiceStatus.APPROVED,
    variance: 0.00,
    reason: 'Czar-Lite Match OK',
    extractionConfidence: 92,
    workflowStep: 'COMPLETED',
    tmsEstimatedAmount: 450.00,
    auditAmount: 450.00,
    source: 'API',
    tmsMatchStatus: 'LINKED',
    sapShipmentRef: 'SHP-889210-03',
    lineItems: [
      { description: 'LTL Base Rate', amount: 450.00, expectedAmount: 450.00 }
    ],
    matchResults: {
      rate: MatchStatus.MATCH,
      delivery: MatchStatus.MATCH,
      unit: MatchStatus.MATCH
    },
    glSegments: [
       { code: '101-20', segment: 'Power Grids', amount: 450.00, percentage: 100, color: 'bg-blue-500' }
    ]
  },
  {
    id: 'INV-992-DUP',
    invoiceNumber: 'LTL-992-B',
    carrier: 'K Line America',
    origin: 'Zone 1 (East)',
    destination: 'Zone 4 (Midwest)',
    amount: 450.00,
    currency: 'USD',
    date: '2025-11-25',
    dueDate: '2025-12-25',
    status: InvoiceStatus.EXCEPTION,
    variance: 0.00,
    reason: 'Suspect Duplicate (95% Match)',
    extractionConfidence: 98,
    workflowStep: 'SCM_REVIEW',
    assignedTo: 'System Sentinel',
    tmsEstimatedAmount: 450.00,
    auditAmount: 450.00,
    source: 'API',
    tmsMatchStatus: 'LINKED',
    sapShipmentRef: 'SHP-889210-03',
    lineItems: [
      { description: 'LTL Base Rate', amount: 450.00, expectedAmount: 450.00 }
    ],
    matchResults: {
      rate: MatchStatus.MATCH,
      delivery: MatchStatus.MATCH,
      unit: MatchStatus.MATCH
    },
    dispute: {
      status: 'OPEN',
      history: [
        { actor: 'System', timestamp: '2025-11-25 11:00 AM', action: 'Exception Raised', comment: 'Invoice is a 95% match to existing invoice #LTL-992. Please verify this is not a duplicate.' }
      ]
    }
  },
  // --- NEW INVOICES FOR POLISH ---
  {
    id: 'PAID-001',
    invoiceNumber: 'MSC-881-C',
    carrier: 'MSC',
    origin: 'Hamburg, DE',
    destination: 'Newark, NJ',
    amount: 4200.00,
    currency: 'USD',
    date: '2025-10-15',
    dueDate: '2025-11-15',
    status: InvoiceStatus.PAID,
    variance: 0.00,
    reason: 'Paid via Batch #PY-2025-10-24',
    extractionConfidence: 99,
    workflowStep: 'COMPLETED',
    tmsEstimatedAmount: 4200.00,
    auditAmount: 4200.00,
    source: 'EDI',
    tmsMatchStatus: 'LINKED',
    sapShipmentRef: 'SHP-889100-01',
    lineItems: [ { description: 'Ocean Freight 40HC', amount: 4200.00, expectedAmount: 4200.00 }],
    matchResults: { rate: MatchStatus.MATCH, delivery: MatchStatus.MATCH, unit: MatchStatus.MATCH },
    glSegments: [ { code: '101-55', segment: 'Transformers', amount: 4200.00, percentage: 100, color: 'bg-teal-500' } ]
  },
  {
    id: 'REJECTED-001',
    invoiceNumber: 'REJ-001',
    carrier: 'Flexport',
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, CA',
    amount: 3500.00,
    currency: 'USD',
    date: '2025-11-18',
    dueDate: '2025-12-18',
    status: InvoiceStatus.REJECTED,
    variance: 3500.00,
    reason: 'Auto-Rejected: No Proof of Delivery',
    extractionConfidence: 95,
    workflowStep: 'REJECTED',
    tmsEstimatedAmount: 3500.00,
    auditAmount: 0.00, // Liability is 0 until POD
    source: 'PORTAL',
    tmsMatchStatus: 'LINKED',
    sapShipmentRef: 'SHP-889205-01',
    lineItems: [ { description: 'Freight Charges', amount: 3500.00, expectedAmount: 3500.00 } ],
    matchResults: { rate: MatchStatus.MATCH, delivery: MatchStatus.MISSING, unit: MatchStatus.MATCH },
    glSegments: [ { code: '101-20', segment: 'Power Grids', amount: 3500.00, percentage: 100, color: 'bg-blue-500' } ]
  },
];

export const MOCK_RATES: RateCard[] = [
  {
    id: 'rc-001',
    carrier: 'Maersk',
    contractRef: 'GB01/0010',
    origin: 'Bloomington, IL',
    destination: 'Brisbane, AU',
    containerType: "20' Standard",
    rate: 2775.00,
    currency: 'USD',
    status: 'ACTIVE',
    validFrom: '2025-01-01',
    validTo: '2026-12-31'
  },
  {
    id: 'rc-002',
    carrier: 'Hapag-Lloyd',
    contractRef: 'HL-EUR-NA-25',
    origin: 'Hamburg, DE',
    destination: 'Charleston, SC',
    containerType: "40' High Cube",
    rate: 4500.00,
    currency: 'USD',
    status: 'ACTIVE',
    validFrom: '2025-02-01',
    validTo: '2026-02-01'
  }
];

export const SPEND_DATA = [
  { name: 'Ocean', spend: 400000 },
  { name: 'Road (LTL)', spend: 300000 },
  { name: 'Air', spend: 200000 },
  { name: 'Rail', spend: 278000 },
];

export const MOCK_PARTNERS = [
  {
    id: 1,
    name: 'Maersk Line',
    scac: 'MAEU',
    mode: 'Ocean',
    region: 'Global',
    integration: 'EDI (210/310)',
    status: 'Verified',
    integrationType: 'edi'
  },
  {
    id: 2,
    name: 'K Line America',
    scac: 'KKLU',
    mode: 'Road/Intermodal',
    region: 'North America',
    integration: 'API',
    status: 'Verified',
    integrationType: 'api'
  },
  {
    id: 3,
    name: 'Old Dominion Freight',
    scac: 'ODFL',
    mode: 'Road (LTL)',
    region: 'USA',
    integration: 'Vendor Portal',
    status: 'Pending Docs',
    integrationType: 'portal'
  }
];

export const MOCK_BATCHES: PaymentBatch[] = [
  {
    id: 'PY-2025-11-24-001',
    runDate: '2025-11-24',
    entity: 'Hitachi Energy USA',
    bankAccount: 'JPM-8829 (USD)',
    currency: 'USD',
    amount: 7425.00,
    invoiceCount: 3,
    discountAvailable: 125.00,
    status: 'SENT_TO_BANK',
    riskScore: 'LOW',
    invoiceIds: ['5467', 'LTL-992', 'PAID-001'],
    paymentTerms: 'Net 30',
    sanctionStatus: 'PASSED'
  },
  {
    id: 'PY-2025-11-25-002',
    runDate: '2025-11-25',
    entity: 'Hitachi Energy Canada',
    bankAccount: 'RBC-9921 (CAD)',
    currency: 'USD', // For demo simplicity
    amount: 2678.00,
    invoiceCount: 1,
    status: 'AWAITING_APPROVAL',
    riskScore: 'LOW',
    nextApprover: 'William Carswell',
    invoiceIds: ['709114'],
    paymentTerms: 'Net 45',
    sanctionStatus: 'PASSED'
  },
  {
    id: 'PY-2025-11-25-003',
    runDate: '2025-11-25',
    entity: 'Hitachi Energy EU',
    bankAccount: 'DB-1120 (EUR)',
    currency: 'USD', // For demo simplicity
    amount: 12950.00,
    invoiceCount: 2,
    status: 'DRAFT',
    riskScore: 'MEDIUM',
    invoiceIds: ['INV-GHOST-001', 'INV-992-DUP'],
    paymentTerms: 'Net 60',
    sanctionStatus: 'PENDING'
  }
];

export const AGING_DATA = [
  { name: '0-30 Days', amount: 850000 },
  { name: '30-60 Days', amount: 350000 },
  { name: '60+ Days (Overdue)', amount: 15000 },
];