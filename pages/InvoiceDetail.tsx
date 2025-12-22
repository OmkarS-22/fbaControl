import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Invoice, InvoiceStatus, MatchStatus, RoleDefinition, WorkflowStepConfig, Comment, WorkflowHistoryItem, RuntimeStep } from '../types';
import {
  ArrowLeft, CheckCircle, XCircle, X, Check, Printer, Download,
  ShieldCheck, AlertTriangle, FileText, DollarSign,
  AlertCircle, Clock, Link as LinkIcon, Box, PieChart, Lock,
  MessageSquare, User, Building2, Cpu, Edit2, MapPin, Package,
  Send, History, MessageCircle, Save
} from 'lucide-react';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  activePersona: { id: string; role: string; name: string, roleId: string };
  roles: RoleDefinition[];
  workflowConfig: WorkflowStepConfig[];
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  invoice,
  onBack,
  onUpdateInvoice,
  activePersona,
  roles,
  workflowConfig
}) => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [reasonCode, setReasonCode] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [currentStepComment, setCurrentStepComment] = useState('');
  const [steps, setSteps] = useState<RuntimeStep[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistoryItem[]>([]);
  const [currentInvoiceStatus, setCurrentInvoiceStatus] = useState<InvoiceStatus>(invoice.status);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize workflow with extracted data
  useEffect(() => {
    const applicableSteps = workflowConfig.map(config => {
      let isApplicable = true;

      if (config.conditionType === 'AMOUNT_GT') {
        isApplicable = invoice.total > (config.conditionValue || 0);
      } else if (config.conditionType === 'VARIANCE_GT') {
        const variance = invoice.tmsEstimatedAmount ? invoice.total - invoice.tmsEstimatedAmount : 0;
        isApplicable = variance > (config.conditionValue || 0);
      }

      let initialStatus: RuntimeStep['status'] = 'PENDING';

      if (!isApplicable) {
        initialStatus = 'SKIPPED';
      } else if (invoice.status === InvoiceStatus.APPROVED || invoice.status === InvoiceStatus.PAID) {
        initialStatus = 'APPROVED';
      } else if (invoice.status === InvoiceStatus.REJECTED) {
        initialStatus = 'REJECTED';
      }

      const roleDef = roles.find(r => r.id === config.roleId);
      const existingComments = invoice.comments?.filter(c => c.stepId === config.id) || [];

      return {
        ...config,
        status: initialStatus,
        assigneeName: roleDef ? roleDef.name : 'System',
        timestamp: (initialStatus === 'APPROVED' ? invoice.date : undefined),
        comments: existingComments
      };
    });

    // Load workflow history
    if (invoice.workflowHistory) {
      setWorkflowHistory(invoice.workflowHistory);
    }

    // Activate first applicable step if not already approved/paid/rejected
    if (![InvoiceStatus.APPROVED, InvoiceStatus.PAID, InvoiceStatus.REJECTED].includes(invoice.status)) {
      const firstActiveIndex = applicableSteps.findIndex(s => s.status !== 'SKIPPED');
      if (firstActiveIndex !== -1) {
        applicableSteps[firstActiveIndex].status = 'ACTIVE';
      }
    }

    setSteps(applicableSteps);
  }, [workflowConfig, invoice, roles]);

  // Save comments to backend API
  const saveCommentsToAPI = async (invoiceId: string, comments: Comment[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to save comments:', result.message);
      }
      return result.success;
    } catch (error) {
      console.error('Error saving comments:', error);
      return false;
    }
  };

  // Save workflow history to backend API
  const saveWorkflowHistoryToAPI = async (invoiceId: string, history: WorkflowHistoryItem[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/workflow-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflowHistory: history }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to save workflow history:', result.message);
      }
      return result.success;
    } catch (error) {
      console.error('Error saving workflow history:', error);
      return false;
    }
  };

  // Update invoice status in backend API
  const updateInvoiceStatusInAPI = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to update invoice status:', result.message);
      }
      return result.success;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return false;
    }
  };

  const addComment = async (stepId: string, commentText: string, action?: 'APPROVED' | 'REJECTED' | 'COMMENT') => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: activePersona.id,
      userName: activePersona.name,
      role: activePersona.role,
      comment: commentText.trim(),
      timestamp: new Date().toISOString(),
      stepId: stepId,
      action: action || 'COMMENT'
    };

    // Update local steps
    const updatedSteps = steps.map(step =>
      step.id === stepId
        ? {
          ...step,
          comments: [...(step.comments || []), newComment],
          comment: '' // Clear the step comment field
        }
        : step
    );

    setSteps(updatedSteps);

    // Update the invoice locally
    const updatedInvoice: Invoice = {
      ...invoice,
      comments: [...(invoice.comments || []), newComment],
      updatedAt: new Date().toISOString()
    };

    // Save comment to API
    setIsSaving(true);
    const success = await saveCommentsToAPI(invoice.id, [newComment]);
    setIsSaving(false);

    if (success) {
      onUpdateInvoice(updatedInvoice);
    }

    // Clear input
    if (action !== 'APPROVED' && action !== 'REJECTED') {
      setCommentInput('');
    }
    setCurrentStepComment('');
  };

 const updateInvoiceStatus = async (newStatus: InvoiceStatus, stepId?: string, stepComment?: string) => {
    const now = new Date().toISOString();

    // UPDATE LOCAL STATE IMMEDIATELY for instant UI feedback
    setCurrentInvoiceStatus(newStatus);

    // Create workflow history item if stepId provided
    if (stepId) {
      const step = steps.find(s => s.id === stepId);
      const historyItem: WorkflowHistoryItem = {
        stepId,
        stepName: step?.stepName || 'Unknown Step',
        status: newStatus === InvoiceStatus.REJECTED ? 'REJECTED' : 'APPROVED',
        assigneeId: activePersona.id,
        assigneeName: activePersona.name,
        timestamp: now,
        comment: stepComment
      };

      const updatedHistory = [...workflowHistory, historyItem];
      setWorkflowHistory(updatedHistory);

      // Save workflow history to API
      await saveWorkflowHistoryToAPI(invoice.id, updatedHistory);

      // Add comment to step if provided
      if (stepComment) {
        await addComment(stepId, stepComment, newStatus === InvoiceStatus.REJECTED ? 'REJECTED' : 'APPROVED');
      }
    }

    // Update invoice status in API
    await updateInvoiceStatusInAPI(invoice.id, newStatus);

    // Update the invoice locally and notify parent
    const updatedInvoice: Invoice = {
      ...invoice,
      status: newStatus,
      updatedAt: now,
      workflowHistory: workflowHistory,
      lastUpdatedBy: {
        userId: activePersona.id,
        userName: activePersona.name,
        role: activePersona.role,
        timestamp: now
      }
    };

    onUpdateInvoice(updatedInvoice);
  };

  const handleDecision = async (stepId: string, decision: 'APPROVE' | 'REJECT') => {
    const step = steps.find(s => s.id === stepId);
    const comment = currentStepComment || step?.comment || '';
    const now = new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

    if (decision === 'REJECT') {
      const updatedSteps = steps.map(step =>
        step.id === stepId ? { ...step, status: 'REJECTED', timestamp: now } : step
      );
      setSteps(updatedSteps);
      await updateInvoiceStatus(InvoiceStatus.REJECTED, stepId, comment);
      setCurrentStepComment('');
      return;
    }

    // IMMEDIATELY update UI to show PROCESSING
    setCurrentInvoiceStatus(InvoiceStatus.PROCESSING);
    
    // Approve current step - FIRST set status to PROCESSING
    let nextStepIndex = -1;
    const newSteps = steps.map((step, index) => {
      if (step.id === stepId) {
        nextStepIndex = index + 1;
        return {
          ...step,
          status: 'APPROVED',
          timestamp: now,
        };
      }
      return step;
    });

    // Find next applicable step
    let foundNext = false;
    for (let i = nextStepIndex; i < newSteps.length; i++) {
      if (newSteps[i].status !== 'SKIPPED') {
        newSteps[i].status = newSteps[i].isSystemStep ? 'PROCESSING' : 'ACTIVE';
        foundNext = true;
        break;
      }
    }

    setSteps(newSteps);

    // If no next step found, invoice is fully approved
    if (!foundNext) {
      // Set invoice status to APPROVED
      await updateInvoiceStatus(InvoiceStatus.APPROVED, stepId, comment);
    } else {
      // Set invoice status to PROCESSING while next step is active
      await updateInvoiceStatus(InvoiceStatus.PROCESSING, stepId, comment);
    }

    setCurrentStepComment('');
  };

  // Auto-process System Steps
  useEffect(() => {
    const processingStep = steps.find(s => s.status === 'PROCESSING' && s.isSystemStep);
    if (processingStep) {
      const timer = setTimeout(async () => {
        const now = new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
        const updatedSteps = steps.map(step =>
          step.id === processingStep.id
            ? {
              ...step,
              status: 'APPROVED',
              comment: 'System processed successfully',
              timestamp: now
            }
            : step
        );
        setSteps(updatedSteps);
        await updateInvoiceStatus(InvoiceStatus.APPROVED, processingStep.id, 'System processed successfully');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [steps]);

  const variance = useMemo(() => {
    return invoice.tmsEstimatedAmount ? invoice.total - invoice.tmsEstimatedAmount : 0;
  }, [invoice.total, invoice.tmsEstimatedAmount]);

  const extractionConfidence = invoice.extractionConfidence || 92;

  // Helper function to render comment thread
  const renderCommentThread = (step: RuntimeStep) => {
    const allComments = [...(step.comments || [])];

    return (
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center">
            <MessageCircle size={12} className="mr-2" /> Discussion
          </h5>
          <span className="text-xs text-gray-400">{allComments.length} comment{allComments.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {allComments.length === 0 ? (
            <div className="text-xs text-gray-400 italic py-2">No comments yet. Start the discussion...</div>
          ) : (
            allComments.map((comment, idx) => (
              <div key={comment.id || idx} className="bg-gray-50 rounded-sm p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold
                      ${comment.role?.includes('Manager') ? 'bg-purple-100 text-purple-700' :
                        comment.role?.includes('Account') ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'}`}
                    >
                      {comment.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{comment.userName}</p>
                      <p className="text-[10px] text-gray-500">{comment.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{comment.comment}</p>
                {comment.action && comment.action !== 'COMMENT' && (
                  <div className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-sm mt-2
                    ${comment.action === 'APPROVED' ? 'bg-teal-100 text-teal-700' :
                      comment.action === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'}`}
                  >
                    {comment.action === 'APPROVED' ? '✓ Approved' :
                      comment.action === 'REJECTED' ? '✗ Rejected' :
                        'System'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && commentInput.trim()) {
                addComment(step.id, commentInput);
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 text-sm border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-teal-500"
            disabled={isSaving}
          />
          <button
            onClick={() => {
              if (commentInput.trim()) {
                addComment(step.id, commentInput);
              }
            }}
            disabled={!commentInput.trim() || isSaving}
            className="bg-teal-600 text-white p-2 rounded-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <Clock size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderStandardDetail = () => {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: The Evidence (PDF) */}
        <div className="w-1/2 bg-[#525659] flex flex-col overflow-hidden relative border-r border-gray-300">
          {/* PDF Toolbar */}
          <div className="h-10 bg-[#323639] flex items-center justify-between px-4 text-gray-300 border-b border-gray-600 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium">invoice_{invoice.invoiceNumber}.pdf</span>
              <span className="text-[10px] bg-gray-600 px-1.5 rounded">1/1</span>
            </div>
            <div className="flex space-x-3">
              <Download size={14} className="cursor-pointer hover:text-white" />
              <Printer size={14} className="cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* PDF Canvas Simulation */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
            <div className="bg-white shadow-lg w-full max-w-[595px] min-h-[842px] p-10 text-xs font-mono text-gray-800 relative">
              <div className="absolute top-10 right-10 border-4 border-red-600 text-red-600 font-bold text-xl px-4 py-2 opacity-30 transform -rotate-12 pointer-events-none">
                {currentInvoiceStatus?.toUpperCase() || invoice.status?.toUpperCase() || 'PROCESSED'}
              </div>

              <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">{invoice.carrier?.toUpperCase() || 'CARRIER'}</h1>
                  <p>Global Logistics Services</p>
                  <p>100 Shipping Way, Copenhagen</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold">INVOICE</h2>
                  <p>Inv #: {invoice.invoiceNumber}</p>
                  <p>Date: {invoice.date}</p>
                </div>
              </div>

              {/* Consignor & Consignee Information */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="font-bold text-gray-600 mb-1">CONSIGNOR (Shipper):</p>
                  <p className="font-bold text-sm">{invoice.consignor?.name || 'SS Supply Chain Solution LLP'}</p>
                  <p className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {invoice.consignor?.city || 'Houston'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-600 mb-1">CONSIGNEE (Receiver):</p>
                  <p className="font-bold text-sm">{invoice.consignee?.name || 'SS Supply Chain Solution LP'}</p>
                  <p className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {invoice.consignee?.city || 'Durban'}
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-2">Qty</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-2">{item.qty}</td>
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">${item.unitPrice?.toFixed(2) || '0.00'}</td>
                      <td className="py-2 text-right font-medium">${item.lineTotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mb-12">
                <div className="w-48">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Sales Tax:</span>
                    <span>${invoice.salesTax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-black font-bold text-sm">
                    <span>TOTAL ({invoice.currency || 'USD'}):</span>
                    <span>${invoice.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-400 text-[10px] mt-auto">
                <p>Status: <span className="font-bold">{currentInvoiceStatus || invoice.status}</span></p>
                <p>Last Updated: {new Date(invoice.updatedAt || invoice.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Digitized Data & Audit */}
        <div className="w-1/2 bg-white flex flex-col overflow-y-auto custom-scrollbar">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
              <FileText size={16} className="mr-2 text-teal-600" />
              Extracted Data & Audit Results
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-6">AI Extraction Confidence: <span className="text-teal-600 font-bold">{extractionConfidence}%</span></p>
            <p className="text-xs text-gray-500 mt-1 ml-6">Invoice Status: <span className="font-bold">{currentInvoiceStatus || invoice.status}</span></p>
          </div>

          <div className="p-8 space-y-8">
            {/* Header Data Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold flex items-center">
                  <Building2 size={12} className="mr-1" /> Carrier
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">{invoice.carrier || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold">Invoice Number</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{invoice.invoiceNumber || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold">Invoice Date</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{invoice.date || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold">Currency</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{invoice.currency || 'USD'}</p>
              </div>
            </div>

            {/* Consignor & Consignee Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-sm p-4">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center">
                  <Building2 size={14} className="mr-2" /> Consignor (Shipper)
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Name</p>
                    <p className="text-sm font-bold text-gray-900">{invoice.consignor?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">City</p>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {invoice.consignor?.city || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-100 rounded-sm p-4">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3 flex items-center">
                  <Package size={14} className="mr-2" /> Consignee (Receiver)
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Name</p>
                    <p className="text-sm font-bold text-gray-900">{invoice.consignee?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">City</p>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {invoice.consignee?.city || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Details */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center">
                <Package size={14} className="mr-2" /> Line Items
              </h4>
              <div className="space-y-3">
                {invoice.lineItems?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-sm p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.description || 'Item description'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Qty: {item.qty || 1}
                          </span>
                          {item.code && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-mono">
                              Code: {item.code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${item.lineTotal?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-500">${item.unitPrice?.toFixed(2) || '0.00'} each</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 border border-gray-100 rounded-sm p-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Financial Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-bold text-gray-900">${invoice.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Sales Tax</span>
                  <span className="text-sm font-bold text-gray-900">${invoice.salesTax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-gray-900">${invoice.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Workflow History */}
            {workflowHistory.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <History size={14} className="mr-2" /> Workflow History
                </h4>
                <div className="space-y-2">
                  {workflowHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-sm">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2
                          ${item.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {item.status === 'APPROVED' ? <Check size={14} /> : <X size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.stepName}</p>
                          <p className="text-xs text-gray-500">by {item.assigneeName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{item.timestamp}</p>
                        {item.comment && (
                          <p className="text-xs text-gray-600 italic">"{item.comment}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow Steps (Dynamic) */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Approval Workflow (Dynamic)
              </h4>
              <div className="space-y-4">
                {steps.length === 0 && (
                  <div className="text-xs text-gray-400 italic">Initializing workflow engine...</div>
                )}
                {steps.map((step, idx) => {
                  if (step.status === 'SKIPPED') return null;

                  const userRoleDef = roles.find(r => r.id === activePersona.roleId);
                  const canAct = step.roleId === activePersona.roleId || (userRoleDef?.permissions.canAdminSystem);

                  const isMyTurn = step.status === 'ACTIVE' && canAct;
                  const isLocked = step.status === 'ACTIVE' && !canAct;

                  return (
                    <div key={step.id} className="relative pl-8 pb-4 last:pb-0 animate-fadeIn">
                      {/* Connector Line */}
                      {idx !== steps.length - 1 && (
                        <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${step.status === 'APPROVED' ? 'bg-teal-200' : 'bg-gray-200'}`}></div>
                      )}

                      {/* Status Dot */}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10
                        ${step.status === 'APPROVED' ? 'bg-teal-100 border-teal-500 text-teal-600' :
                          step.status === 'ACTIVE' ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                            step.status === 'REJECTED' ? 'bg-red-100 border-red-500 text-red-600' :
                              step.status === 'PROCESSING' ? 'bg-purple-100 border-purple-500 text-purple-600' :
                                'bg-gray-50 border-gray-300 text-gray-400'}
                      `}>
                        {step.status === 'APPROVED' ? <Check size={12} /> :
                          step.status === 'REJECTED' ? <X size={12} /> :
                            <div className="w-2 h-2 rounded-full bg-current"></div>}
                      </div>

                      <div className={`bg-white border rounded-sm p-4 shadow-sm transition-all ${isMyTurn ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{step.stepName}</p>
                            <p className="text-xs text-gray-500">{step.assigneeName}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {step.timestamp && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{step.timestamp}</span>}
                            {isLocked && <Lock size={14} className="text-gray-400" />}
                            {step.status === 'APPROVED' && (
                              <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                                APPROVED
                              </span>
                            )}
                            {step.status === 'REJECTED' && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                REJECTED
                              </span>
                            )}
                            {isSaving && (
                              <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold flex items-center">
                                <Clock size={10} className="mr-1 animate-spin" /> Saving...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions if Active */}
                        {step.status === 'ACTIVE' && !step.isSystemStep ? (
                          <div className="mt-3">
                            {isMyTurn ? (
                              <>
                                <textarea
                                  className="w-full text-xs p-2 border border-gray-300 rounded-sm mb-2 focus:border-blue-500 focus:outline-none"
                                  placeholder="Add approval comment..."
                                  value={currentStepComment}
                                  onChange={(e) => setCurrentStepComment(e.target.value)}
                                  disabled={isSaving}
                                ></textarea>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleDecision(step.id, 'APPROVE')}
                                    disabled={isSaving}
                                    className="flex-1 bg-teal-600 text-white text-xs font-bold py-1.5 rounded-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {isSaving ? (
                                      <>
                                        <Clock size={12} className="mr-2 animate-spin" /> Processing...
                                      </>
                                    ) : (
                                      'Approve'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDecision(step.id, 'REJECT')}
                                    disabled={isSaving}
                                    className="flex-1 bg-white border border-red-200 text-red-600 text-xs font-bold py-1.5 rounded-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 p-2 rounded-sm text-xs text-gray-500 flex items-center">
                                <Lock size={12} className="mr-2" />
                                Waiting for <span className="font-bold mx-1">{step.assigneeName}</span> to take action.
                              </div>
                            )}
                          </div>
                        ) : step.comment ? (
                          <div className="bg-gray-50 p-2 rounded-sm text-xs text-gray-600 italic border border-gray-100">
                            "{step.comment}"
                          </div>
                        ) : null}

                        {step.status === 'PROCESSING' && (
                          <div className="mt-2 text-xs text-purple-600 flex items-center font-bold">
                            <Clock size={12} className="mr-1 animate-spin" /> Processing Automation...
                          </div>
                        )}

                        {/* Comment Thread */}
                        {renderCommentThread(step)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col font-sans bg-gray-100 overflow-hidden relative">
      {/* Detail Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">Invoice #{invoice.invoiceNumber}</h2>
              {currentInvoiceStatus === InvoiceStatus.APPROVED && <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded border border-teal-200">APPROVED</span>}
              {currentInvoiceStatus === InvoiceStatus.EXCEPTION && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded border border-red-200">EXCEPTION</span>}
              {currentInvoiceStatus === InvoiceStatus.REJECTED && <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded border border-gray-300">REJECTED</span>}
              {currentInvoiceStatus === InvoiceStatus.VENDOR_RESPONDED && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">VENDOR RESPONDED</span>}
              {currentInvoiceStatus === InvoiceStatus.PROCESSING && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded border border-purple-200">PROCESSING</span>}
              {invoice.status === 'processed' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">PROCESSED</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {invoice.carrier} •
              {invoice.consignor?.city && ` ${invoice.consignor.city}`} to
              {invoice.consignee?.city && ` ${invoice.consignee.city}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right mr-4">
            <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">
              ${invoice.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              <span className="text-xs text-gray-500 ml-1">{invoice.currency || 'USD'}</span>
            </p>
          </div>
          {currentInvoiceStatus === InvoiceStatus.EXCEPTION && (
            <button
              onClick={() => setShowUnlockModal(true)}
              className="flex items-center px-4 py-2 bg-[#004D40] text-white hover:bg-[#00352C] rounded-sm text-xs font-bold uppercase shadow-sm"
            >
              Force Approve
            </button>
          )}
        </div>
      </div>

      {renderStandardDetail()}

      {/* Force Approve Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-sm shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex items-center text-red-700">
              <AlertTriangle size={20} className="mr-2" />
              <h3 className="text-lg font-bold">Force Approval Confirmation</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                You are about to override a system exception (<span className="font-bold">{invoice.reason}</span>).
                This action will be logged in the audit trail.
              </p>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Reason Code</label>
              <select
                className="w-full border border-gray-300 rounded-sm p-2 text-sm mb-4"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
              >
                <option value="">Select Reason...</option>
                <option value="commercial_decision">Commercial Decision (GM Approval)</option>
                <option value="data_error">Master Data Error</option>
                <option value="one_time_waiver">One-time Waiver</option>
              </select>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowUnlockModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm">Cancel</button>
                <button
                  onClick={async () => {
                    if (reasonCode) {
                      await updateInvoiceStatus(InvoiceStatus.APPROVED);
                      setShowUnlockModal(false);
                    }
                  }}
                  disabled={!reasonCode}
                  className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-sm disabled:opacity-50"
                >
                  Confirm Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};