

export enum InvoiceStatus {
  APPROVED = 'APPROVED',
  EXCEPTION = 'EXCEPTION',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  VENDOR_RESPONDED = 'VENDOR_RESPONDED',
  PROCESSING = 'PROCESSING',
}

export enum MatchStatus {
  MATCH = 'MATCH',
  MISMATCH = 'MISMATCH',
  MISSING = 'MISSING'
}

export type UserRole = 'HITACHI' | '3SC' | 'VENDOR';

export interface Dispute {
  status: 'OPEN' | 'VENDOR_RESPONDED' | 'UNDER_REVIEW' | 'RESOLVED';
  history: {
    actor: 'Vendor' | 'SCM' | 'System';
    timestamp: string;
    action: string;
    comment?: string;
  }[];
}
// Add to types.ts
// Add these to your types.ts file

export interface Comment {
  id: string;
  text: string;
  author: string;
  userName: string; // Add this
  role: string; // Add this
  createdAt: string;
  stepId?: string; // Add this
  action?: string; // Add this
  comment?: string; // Add this
  timestamp?: string; // Add this
  userId?: string;
  invoiceId?: string;
}

export interface WorkflowHistoryItem {
  id: string;
  stepId: string; // Add this
  stepName: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'APPROVED'; // Add 'APPROVED'
  assigneeId: string; // Add this
  assigneeName: string; // Add this
  timestamp: string;
  userId: string;
  userName: string;
  comment?: string; // Change from comments to comment
}

export interface RuntimeStep {
  id: string;
  stepName: string; // Add this
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'SKIPPED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'ACTIVE' | 'PROCESSING'; // Add all statuses
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  comments?: Comment[]; // Add this
  comment?: string; // Add this
  assigneeName?: string; // Add this
  timestamp?: string; // Add this
  isSystemStep?: boolean; // Add this
  roleId?: string; // Add this
  conditionType?: string; // Add this
  conditionValue?: number; // Add this
}


export interface Invoice {
  id: string;
  invoiceNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  amount: number;
  currency: string;
  date: string;
  dueDate?: string; // Added for payment terms
  status: InvoiceStatus;
  variance: number; // Positive means overcharge
  reason?: string;
  extractionConfidence: number;
  lineItems: LineItem[];
  matchResults: {
    rate: MatchStatus;
    delivery: MatchStatus;
    unit: MatchStatus;
  };
  workflowStep?: 'SCM_REVIEW' | 'TTL_APPROVAL' | 'COMPLETED' | 'REJECTED';
  assignedTo?: string;

  // --- SOLID FEATURES ---
  tmsEstimatedAmount?: number; // The TMS "Planning" Cost
  auditAmount?: number;        // The ATLAS "Actual" Liability
  // FIX: Added 'PORTAL' as a valid source type for an invoice to align with its usage in the mock data.
  source?: 'EDI' | 'API' | 'EMAIL' | 'MANUAL' | 'PORTAL';
  tmsMatchStatus?: 'LINKED' | 'NOT_FOUND'; // For Ghost Shipments
  sapShipmentRef?: string;

  // Smart GL Splitter
  glSegments?: {
    code: string;
    segment: string; // e.g., Power Grids, Transformers
    amount: number;
    percentage: number;
    color: string;
  }[];

  // Dispute Management
  dispute?: Dispute;
}

export interface LineItem {
  description: string;
  amount: number;
  expectedAmount: number;
}

export interface RateCard {
  id: string;
  carrier: string;
  contractRef: string;
  origin: string;
  destination: string;
  containerType: string;
  rate: number;
  currency: string;
  status: 'ACTIVE' | 'EXPIRED';
  validFrom: string;
  validTo: string;
}

export interface KPI {
  label: string;
  value: string;
  subtext: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'teal' | 'orange' | 'red';
}

export interface PaymentBatch {
  id: string;
  runDate: string;
  entity: string;
  bankAccount: string;
  currency: string;
  amount: number;
  invoiceCount: number;
  status: 'DRAFT' | 'AWAITING_APPROVAL' | 'APPROVED' | 'SENT_TO_BANK' | 'PAID' | 'REJECTED';
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  nextApprover?: string;
  // Detail Fields
  invoiceIds: string[];
  paymentTerms: string;
  sanctionStatus: 'PASSED' | 'PENDING' | 'FAILED';
  discountAvailable?: number;
}

// --- RBAC & WORKFLOW ENGINE TYPES ---

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  users: number;
  permissions: {
    canViewInvoices: boolean;
    canApproveL1: boolean; // Operational
    canApproveL2: boolean; // Financial
    canManageRates: boolean;
    canAdminSystem: boolean;
  };
}

export interface WorkflowStepConfig {
  id: string;
  stepName: string;
  roleId: string; // Links to RoleDefinition
  conditionType: 'ALWAYS' | 'AMOUNT_GT' | 'VARIANCE_GT';
  conditionValue?: number; // e.g., 10000
  isSystemStep?: boolean;
}