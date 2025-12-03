

import React, { useState } from 'react';
import { 
  UploadCloud, DollarSign, FileText, CheckCircle, Clock, AlertCircle, 
  ArrowRight, ChevronRight, Activity, Calendar, ShieldAlert, CreditCard,
  Search, Filter, ExternalLink, RefreshCw, Bell, ArrowLeft, MessageSquare, Send, X, ChevronDown, Paperclip
} from 'lucide-react';
import { MOCK_INVOICES } from '../constants';
import { Invoice, InvoiceStatus } from '../types';

interface VendorPortalProps {
  invoices: Invoice[];
  onNavigate: (page: string) => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onUpdateDispute: (invoiceId: string, action: 'SUBMIT_JUSTIFICATION' | 'REUPLOAD', comment?: string) => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({ invoices, onNavigate, onSelectInvoice, onUpdateDispute }) => {
  const [view, setView] = useState<'dashboard' | 'invoices'>('dashboard');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(''); // Added Search State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info'} | null>(null);
  const [notificationsRead, setNotificationsRead] = useState(false);
  
  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedDisputeInvoice, setSelectedDisputeInvoice] = useState<Invoice | null>(null);
  const [justification, setJustification] = useState('');

  // We'll use the invoices from props
  const allVendorInvoices = [
    ...invoices,
    // Keep dummy data for UI feel until fully dynamic
    {
      id: 'INV-PEND-001',
      invoiceNumber: '9982771-A',
      carrier: 'Maersk Line',
      origin: 'Shanghai, CN',
      destination: 'Long Beach, US',
      amount: 2925.00,
      currency: 'USD',
      date: '2025-11-26',
      status: InvoiceStatus.PENDING,
      variance: 0,
      reason: 'Awaiting POD',
      matchResults: { rate: 'MATCH', delivery: 'MISSING', unit: 'MATCH' }
    } as any,
    {
      id: 'INV-PAID-992',
      invoiceNumber: '709113',
      carrier: 'Maersk Line',
      origin: 'Rotterdam, NL',
      destination: 'New York, US',
      amount: 14500.00,
      currency: 'USD',
      date: '2025-10-15',
      status: InvoiceStatus.PAID,
      variance: 0,
      reason: 'Paid',
      matchResults: { rate: 'MATCH', delivery: 'MATCH', unit: 'MATCH' }
    } as any
  ];

  const recentInvoices = allVendorInvoices.slice(0, 3);

  const getStatusStep = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 4;
      case InvoiceStatus.APPROVED: return 3;
      case InvoiceStatus.EXCEPTION: return 2;
      case InvoiceStatus.REJECTED: return 2;
      case InvoiceStatus.PENDING: return 2;
      case InvoiceStatus.VENDOR_RESPONDED: return 2; // Still in audit step
      default: return 1;
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.APPROVED: return 'text-teal-600 bg-teal-50 border-teal-200';
      case InvoiceStatus.PAID: return 'text-blue-600 bg-blue-50 border-blue-200';
      case InvoiceStatus.EXCEPTION: return 'text-amber-600 bg-amber-50 border-amber-200';
      case InvoiceStatus.REJECTED: return 'text-red-600 bg-red-50 border-red-200';
      case InvoiceStatus.VENDOR_RESPONDED: return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // --- ACTIONS ---

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenDisputeModal = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setSelectedDisputeInvoice(invoice);
    setIsDisputeModalOpen(true);
  };

  const handleDisputeSubmit = () => {
    if (!selectedDisputeInvoice) return;
    onUpdateDispute(selectedDisputeInvoice.id, 'SUBMIT_JUSTIFICATION', justification);
    setIsDisputeModalOpen(false);
    setJustification('');
    triggerToast(`Justification for #${selectedDisputeInvoice.invoiceNumber} submitted.`);
  };

  const handleReUpload = () => {
    if (!selectedDisputeInvoice) return;
    onUpdateDispute(selectedDisputeInvoice.id, 'REUPLOAD');
    setIsDisputeModalOpen(false);
    triggerToast(`Corrected invoice for #${selectedDisputeInvoice.invoiceNumber} is being processed.`);
  };
  
  // --- FILTERING LOGIC ---
  const filteredInvoices = allVendorInvoices.filter(inv => {
    const statusMatch = filterStatus === 'ALL' || inv.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || 
                        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
                        inv.amount.toString().includes(searchLower);
    return statusMatch && searchMatch;
  });

  // --- RENDER DASHBOARD ---
  if (view === 'dashboard') {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar bg-[#F3F4F6] p-8 font-sans relative">
        
        {/* ... (Dashboard UI remains the same, only the invoice list part needs changes) ... */}
        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, Sarah</h2>
              <p className="text-sm text-gray-500 mt-1">Maersk Line • Global Logistics Partner • ID: <span className="font-mono text-gray-400">V-99281</span></p>
           </div>
           <div className="flex space-x-3">
              <button onClick={() => {}} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-sm text-xs font-bold uppercase hover:bg-gray-50 shadow-sm transition-colors">
                 <FileText size={14} className="mr-2" /> Statements
              </button>
              <button onClick={() => onNavigate('ingestion')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-sm text-xs font-bold uppercase hover:bg-blue-700 shadow-sm transition-all hover:shadow-md">
                 <UploadCloud size={14} className="mr-2" /> Submit New Invoice
              </button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div onClick={() => { setFilterStatus(InvoiceStatus.APPROVED); setView('invoices'); }} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer hover:border-teal-400 transition-colors">
              <div className="flex justify-between items-start z-10">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ready for Payment</p>
                 <CheckCircle size={18} className="text-teal-500" />
              </div>
              <div className="z-10">
                 <h3 className="text-2xl font-bold text-gray-900">$452,100.00</h3>
                 <p className="text-[10px] text-teal-600 font-bold mt-1">Scheduled: Nov 28, 2025</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-teal-50 rounded-full opacity-50 z-0"></div>
           </div>
           <div onClick={() => { setFilterStatus(InvoiceStatus.PENDING); setView('invoices'); }} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors">
              <div className="flex justify-between items-start z-10">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Processing</p>
                 <Activity size={18} className="text-blue-500" />
              </div>
              <div className="z-10">
                 <h3 className="text-2xl font-bold text-gray-900">$128,450.00</h3>
                 <p className="text-[10px] text-gray-400 font-bold mt-1">12 Invoices in Audit</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-50 rounded-full opacity-50 z-0"></div>
           </div>
           <div onClick={() => { setFilterStatus(InvoiceStatus.EXCEPTION); setView('invoices'); }} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer hover:border-amber-300 transition-colors">
              <div className="flex justify-between items-start z-10">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action Required</p>
                 <AlertCircle size={18} className="text-amber-500" />
              </div>
              <div className="z-10">
                 <h3 className="text-2xl font-bold text-amber-600">$14,200.00</h3>
                 <p className="text-[10px] text-amber-700 font-bold mt-1 bg-amber-50 inline-block px-1.5 rounded">3 Disputes Open</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-50 rounded-full opacity-50 z-0 group-hover:bg-amber-100 transition-colors"></div>
           </div>
           <div onClick={() => onNavigate('my_payments')} className="bg-[#1e293b] p-5 rounded-sm shadow-sm border border-gray-700 flex flex-col justify-between h-32 relative overflow-hidden text-white cursor-pointer hover:bg-[#2d3b52] transition-colors">
              <div className="flex justify-between items-start z-10">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Remittance</p>
                 <Calendar size={18} className="text-blue-400" />
              </div>
              <div className="z-10">
                 <div className="flex items-end space-x-2">
                    <h3 className="text-3xl font-bold text-white">28</h3>
                    <div className="mb-1.5">
                       <p className="text-xs font-bold text-gray-300 uppercase leading-none">Nov</p>
                       <p className="text-[10px] text-gray-500 uppercase leading-none">Friday</p>
                    </div>
                 </div>
                 <p className="text-[10px] text-blue-400 font-bold mt-2">Ref: PAY-NOV-24-A</p>
              </div>
           </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                       <Activity size={16} className="mr-2 text-teal-600" />
                       Live Invoice Tracker
                    </h3>
                    <button onClick={() => setView('invoices')} className="p-1 text-gray-400 hover:text-gray-600"><Search size={14}/></button>
                 </div>
                 
                 <div className="divide-y divide-gray-100">
                    {recentInvoices.map((inv) => {
                       const currentStep = getStatusStep(inv.status);
                       const isException = inv.status === InvoiceStatus.EXCEPTION || inv.status === InvoiceStatus.REJECTED;
                       
                       return (
                          <div key={inv.id} className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => onSelectInvoice(inv)}>
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      #{inv.invoiceNumber}
                                   </h4>
                                   <p className="text-xs text-gray-500 mt-0.5">
                                      {inv.origin} &rarr; {inv.destination}
                                   </p>
                                   <p className="text-[10px] text-gray-400 mt-1">Submitted: {inv.date}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-bold text-gray-900">${inv.amount.toLocaleString()}</p>
                                   <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1 uppercase ${getStatusColor(inv.status)}`}>
                                      {inv.status.replace('_', ' ')}
                                   </span>
                                </div>
                             </div>
  
                             {/* ... Progress Bar remains the same ... */}
                             
                             {isException && (
                                <div className="mt-4 bg-amber-50 border border-amber-100 p-3 rounded-sm flex items-start">
                                   <AlertCircle size={14} className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                                   <div>
                                      <p className="text-xs font-bold text-amber-800">Action Required: {inv.reason}</p>
                                      <p className="text-[10px] text-amber-700 mt-1">
                                         Please review the exception details and provide a justification or a corrected invoice.
                                      </p>
                                      <button 
                                        onClick={(e) => handleOpenDisputeModal(e, inv)}
                                        className="mt-2 text-[10px] font-bold text-white bg-amber-600 px-3 py-1 rounded-sm hover:bg-amber-700">
                                         Resolve Dispute
                                      </button>
                                   </div>
                                </div>
                             )}

                             {inv.status === InvoiceStatus.VENDOR_RESPONDED && (
                                <div className="mt-4 bg-indigo-50 border border-indigo-100 p-3 rounded-sm flex items-center">
                                   <CheckCircle size={14} className="text-indigo-600 mr-2 flex-shrink-0" />
                                   <p className="text-xs font-bold text-indigo-800">Your response has been submitted and is under review by the SCM team.</p>
                                </div>
                             )}
                          </div>
                       );
                    })}
                 </div>
                 
                 <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
                    <button onClick={() => setView('invoices')} className="text-xs font-bold text-gray-500 hover:text-teal-600 flex items-center justify-center mx-auto">
                       View All Invoices <ChevronRight size={12} className="ml-1" />
                    </button>
                 </div>
              </div>
           </div>
           
           {/* ... (Right column remains the same) ... */}
           <div className="space-y-6">
              <div onClick={() => onNavigate('ingestion')} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden">
                 <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <UploadCloud size={120} />
                 </div>
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                       <UploadCloud size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Quick Upload</h3>
                    <p className="text-xs text-blue-100 mb-4 opacity-90">Drag & drop PDF invoice here or click to browse.</p>
                    <span className="inline-flex items-center text-[10px] font-bold uppercase bg-white/10 px-3 py-1.5 rounded border border-white/20 group-hover:bg-white group-hover:text-blue-800 transition-colors">
                       Start Process <ArrowRight size={10} className="ml-2" />
                    </span>
                 </div>
              </div>
              <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-0">
                 <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center">
                       <Bell size={14} className="mr-2 text-gray-400" /> Notifications
                    </h3>
                    {!notificationsRead && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">3</span>}
                 </div>
                 <div className={`divide-y divide-gray-100 ${notificationsRead ? 'opacity-50' : ''}`}>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                       <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                          <div>
                             <p className="text-xs font-bold text-gray-800">Payment Processed</p>
                             <p className="text-[10px] text-gray-500 mt-0.5">Batch #PAY-NOV-20 sent to bank ($22,500).</p>
                             <p className="text-[9px] text-gray-400 mt-1">2 hours ago</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-amber-50/50">
                       <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                          <div>
                             <p className="text-xs font-bold text-gray-800">New Dispute Raised</p>
                             <p className="text-[10px] text-gray-500 mt-0.5">Inv #709114 flagged for rate mismatch.</p>
                             <p className="text-[9px] text-gray-400 mt-1">Yesterday</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                       <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></div>
                          <div>
                             <p className="text-xs font-bold text-gray-800">Policy Update</p>
                             <p className="text-[10px] text-gray-500 mt-0.5">New "No PO No Pay" policy effective Dec 1st.</p>
                             <p className="text-[9px] text-gray-400 mt-1">3 days ago</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                    <button onClick={() => {}} className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
                 </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-5 text-center">
                 <p className="text-xs font-bold text-gray-500 uppercase mb-2">Need Help?</p>
                 <p className="text-[10px] text-gray-400 mb-4">Contact Hitachi SCM Support</p>
                 <button onClick={() => setShowSupportModal(true)} className="w-full py-2 bg-white border border-gray-300 rounded-sm text-xs font-bold text-gray-600 hover:bg-gray-100 shadow-sm">
                    Open Support Ticket
                 </button>
              </div>
           </div>
        </div>

        {/* --- TOAST --- */}
        {toast && ( <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'}`}> <CheckCircle size={16} className="text-white mr-2" /> <div className="text-xs font-bold">{toast.msg}</div> </div> )}

        {/* --- SUPPORT MODAL --- */}
        {showSupportModal && ( <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn"> <div className="bg-white w-full max-w-md rounded-sm shadow-xl overflow-hidden"> <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center"> <h3 className="text-lg font-bold text-gray-800 flex items-center"><MessageSquare size={18} className="mr-2"/> Support Request</h3> <button onClick={() => setShowSupportModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600"/></button> </div> <form onSubmit={() => {}} className="p-6 space-y-4"> <div> <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Issue Category</label> <select className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white"> <option>Invoice Dispute</option> <option>Payment Inquiry</option> <option>Portal Technical Issue</option> <option>Master Data Update</option> </select> </div> <div> <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Invoice Reference (Optional)</label> <input type="text" placeholder="e.g. 9982771-A" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" /> </div> <div> <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Message</label> <textarea className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm h-32" placeholder="Describe your issue..." required></textarea> </div> <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-sm font-bold text-sm hover:bg-blue-700 shadow-sm flex items-center justify-center"> <Send size={14} className="mr-2"/> Submit Ticket </button> </form> </div> </div> )}
        
        {/* --- DISPUTE MODAL --- */}
        {isDisputeModalOpen && selectedDisputeInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-sm shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-amber-50 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-amber-800 flex items-center">
                    <ShieldAlert size={18} className="mr-2"/> Dispute Resolution Center
                 </h3>
                 <button onClick={() => setIsDisputeModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600"/></button>
              </div>
              <div className="p-6">
                 <p className="text-xs text-gray-500 font-bold uppercase">Invoice #{selectedDisputeInvoice.invoiceNumber}</p>
                 <p className="text-sm font-bold text-gray-800 mb-2">Reason: <span className="text-amber-700">{selectedDisputeInvoice.reason}</span></p>
                 <p className="text-sm bg-gray-50 p-3 border border-gray-200 rounded-sm">
                   Billed Amount: <span className="font-bold">${selectedDisputeInvoice.amount.toLocaleString()}</span><br/>
                   Expected Amount: <span className="font-bold">${(selectedDisputeInvoice.amount - selectedDisputeInvoice.variance).toLocaleString()}</span><br/>
                   Variance: <span className="font-bold text-red-600">${selectedDisputeInvoice.variance.toLocaleString()}</span>
                 </p>

                 <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">How do you want to respond?</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Provide Justification</label>
                          <textarea 
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm h-24" 
                            placeholder="e.g., 'This includes the peak season surcharge approved via email on 2025-11-15...'"
                          ></textarea>
                          <div className="flex justify-between items-center mt-2">
                             <button className="flex items-center text-xs font-bold text-blue-600 hover:underline">
                                <Paperclip size={12} className="mr-1"/> Attach Supporting Document
                             </button>
                             <button 
                               onClick={handleDisputeSubmit} 
                               disabled={!justification}
                               className="px-4 py-2 bg-blue-600 text-white rounded-sm text-xs font-bold uppercase hover:bg-blue-700 disabled:opacity-50"
                              >
                                Submit Justification
                             </button>
                          </div>
                       </div>
                       
                       <div className="text-center text-xs text-gray-400 font-bold">OR</div>

                       <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Acknowledge Error</p>
                          <button onClick={handleReUpload} className="w-full py-2 bg-white border border-gray-300 rounded-sm text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                             <UploadCloud size={14} className="mr-2"/> Upload Corrected Invoice
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: ALL INVOICES LIST ---
  return (
    <div className="h-full flex flex-col bg-[#F3F4F6] font-sans">
       <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Invoice History</h2>
                <p className="text-sm text-gray-500">Manage and track all submitted documents.</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="Search Invoice #..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-sm text-xs font-medium w-64 focus:outline-none focus:border-blue-500" />
             </div>
             <button onClick={() => setFilterStatus(filterStatus === 'ALL' ? InvoiceStatus.EXCEPTION : 'ALL')} className={`flex items-center px-4 py-2 border rounded-sm text-xs font-bold uppercase ${filterStatus !== 'ALL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                <Filter size={14} className="mr-2"/> {filterStatus === 'ALL' ? 'Filter' : `Status: ${filterStatus}`}
             </button>
          </div>
       </div>

       <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200">
                   <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectInvoice(inv)}>
                         <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(inv.status)}`}>
                               {inv.status.replace('_', ' ')}
                            </span>
                         </td>
                         <td className="px-6 py-4 font-bold text-gray-900">{inv.invoiceNumber}</td>
                         <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                         <td className="px-6 py-4 text-xs text-gray-500">
                            {inv.origin} <span className="mx-1">&rarr;</span> {inv.destination}
                         </td>
                         <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                            ${inv.amount.toLocaleString()}
                         </td>
                         <td className="px-6 py-4 text-center">
                            {inv.status === InvoiceStatus.EXCEPTION ? (
                               <button onClick={(e) => handleOpenDisputeModal(e, inv)} className="text-xs font-bold text-amber-600 hover:underline">Resolve</button>
                            ) : (
                               <button onClick={(e) => { e.stopPropagation(); onSelectInvoice(inv); }} className="text-xs font-bold text-blue-600 hover:underline">View Details</button>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};