import React, { useState, useEffect } from 'react';
import {
   UploadCloud, DollarSign, FileText, CheckCircle, Clock, AlertCircle,
   ArrowRight, ChevronRight, Activity, Calendar, ShieldAlert, CreditCard,
   Search, Filter, ExternalLink, RefreshCw, Bell, ArrowLeft, MessageSquare, Send, X, ChevronDown, Paperclip
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';

interface VendorPortalProps {
   onNavigate: (page: string) => void;
   onSelectInvoice: (invoice: Invoice) => void;
   onUpdateDispute: (invoiceId: string, action: 'SUBMIT_JUSTIFICATION' | 'REUPLOAD', comment?: string) => void;
}

interface Stats {
   approved: number;
   pending: { total: number; count: number };
   exception: { total: number; count: number };
}

export const VendorPortal: React.FC<VendorPortalProps> = ({ onNavigate, onSelectInvoice, onUpdateDispute }) => {
   const [view, setView] = useState<'dashboard' | 'invoices'>('dashboard');
   const [filterStatus, setFilterStatus] = useState<string>('ALL');
   const [searchQuery, setSearchQuery] = useState('');
   const [showSupportModal, setShowSupportModal] = useState(false);
   const [toast, setToast] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);
   const [notificationsRead, setNotificationsRead] = useState(false);

   // NEW: State for API data
   const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
   const [allInvoices, setAllInvoices] = useState<any[]>([]);
   const [stats, setStats] = useState<Stats>({
      approved: 0,
      pending: { total: 0, count: 0 },
      exception: { total: 0, count: 0 }
   });
   const [loading, setLoading] = useState(true);

   // Dispute Modal State
   const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
   const [selectedDisputeInvoice, setSelectedDisputeInvoice] = useState<any | null>(null);
   const [justification, setJustification] = useState('');

   // SANITIZE INVOICE DATA FOR LIVE TRACKER UI (HIDE EXTRA FIELDS)
   const sanitizeInvoiceForUI = (inv: any) => ({
      _id: inv._id,
      date: inv.date || null,
      invoiceNumber: inv.invoiceNumber || 'N/A',
      carrier: inv.carrier || 'Unknown Carrier',
      consignor: {
         city: inv.consignor?.city || 'N/A',
      },
      consignee: {
         city: inv.consignee?.city || 'N/A',
      },
      createdAt: inv.createdAt,
      total: inv.total || 0,
      currency: inv.currency || 'USD',
      status: inv.status || 'pending',
   });

   // NEW: Fetch dashboard data on mount
   useEffect(() => {
      fetchDashboardData();
   }, []);

   // NEW: Fetch all invoices when switching to invoices view
   useEffect(() => {
      if (view === 'invoices') {
         fetchAllInvoices();
      }
   }, [view, filterStatus]);

   const fetchDashboardData = async () => {
      try {
         setLoading(true);

         // Fetch recent invoices (limit 3 for dashboard)
         const invoicesRes = await fetch('http://localhost:5000/api/invoices?limit=3');
         const invoicesData = await invoicesRes.json();

         // Fetch statistics
         const statsRes = await fetch('http://localhost:5000/api/invoices/stats');
         const statsData = await statsRes.json();

         if (invoicesData.success) {
            setRecentInvoices(invoicesData.data);
         }

         if (statsData.success) {
            setStats(statsData.data);
         }
      } catch (error) {
         console.error('Error fetching dashboard data:', error);
         triggerToast('Failed to load dashboard data', 'info');
      } finally {
         setLoading(false);
      }
   };

   const fetchAllInvoices = async () => {
      try {
         const statusParam = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
         const res = await fetch(`http://localhost:5000/api/invoices${statusParam}`);
         const data = await res.json();

         if (data.success) {
            setAllInvoices(data.data);
         }
      } catch (error) {
         console.error('Error fetching invoices:', error);
         triggerToast('Failed to load invoices', 'info');
      }
   };

   const getStatusStep = (status: string) => {
      switch (status) {
         case 'paid': return 4;
         case 'approved': return 3;
         case 'exception': return 2;
         case 'rejected': return 2;
         case 'pending': return 2;
         case 'processed': return 2;
         default: return 1;
      }
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'approved': return 'text-teal-600 bg-teal-50 border-teal-200';
         case 'paid': return 'text-blue-600 bg-blue-50 border-blue-200';
         case 'exception': return 'text-amber-600 bg-amber-50 border-amber-200';
         case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
         case 'processed': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
         default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
   };

   const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
   };

   const handleOpenDisputeModal = (e: React.MouseEvent, invoice: any) => {
      e.stopPropagation();
      setSelectedDisputeInvoice(invoice);
      setIsDisputeModalOpen(true);
   };

   const handleDisputeSubmit = () => {
      if (!selectedDisputeInvoice) return;
      onUpdateDispute(selectedDisputeInvoice._id, 'SUBMIT_JUSTIFICATION', justification);
      setIsDisputeModalOpen(false);
      setJustification('');
      triggerToast(`Justification for #${selectedDisputeInvoice.invoiceNumber} submitted.`);
   };

   const handleReUpload = () => {
      if (!selectedDisputeInvoice) return;
      onUpdateDispute(selectedDisputeInvoice._id, 'REUPLOAD');
      setIsDisputeModalOpen(false);
      triggerToast(`Corrected invoice for #${selectedDisputeInvoice.invoiceNumber} is being processed.`);
   };

   // Filter invoices for the list view
   const filteredInvoices = allInvoices.filter(inv => {
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery ||
         inv.invoiceNumber?.toLowerCase().includes(searchLower) ||
         inv.total?.toString().includes(searchLower);
      return searchMatch;
   });

   if (view === 'dashboard') {
      return (
         <div className="h-full overflow-y-auto custom-scrollbar bg-[#F3F4F6] p-8 font-sans relative">

            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, Sarah</h2>
                  <p className="text-sm text-gray-500 mt-1">Maersk Line • Global Logistics Partner • ID: <span className="font-mono text-gray-400">V-99281</span></p>
               </div>
               <div className="flex space-x-3">
                  <button onClick={() => { }} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-sm text-xs font-bold uppercase hover:bg-gray-50 shadow-sm transition-colors">
                     <FileText size={14} className="mr-2" /> Statements
                  </button>
                  <button onClick={() => onNavigate('ingestion')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-sm text-xs font-bold uppercase hover:bg-blue-700 shadow-sm transition-all hover:shadow-md">
                     <UploadCloud size={14} className="mr-2" /> Submit New Invoice
                  </button>
               </div>
            </div>

            {/* UPDATED: Stats cards with real data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <div onClick={() => { setFilterStatus('approved'); setView('invoices'); }} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer hover:border-teal-400 transition-colors">
                  <div className="flex justify-between items-start z-10">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ready for Payment</p>
                     <CheckCircle size={18} className="text-teal-500" />
                  </div>
                  <div className="z-10">
                     <h3 className="text-2xl font-bold text-gray-900">${stats.approved.toLocaleString()}</h3>
                     <p className="text-[10px] text-teal-600 font-bold mt-1">Approved Invoices</p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-teal-50 rounded-full opacity-50 z-0"></div>
               </div>

               <div onClick={() => { setFilterStatus('pending'); setView('invoices'); }} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex justify-between items-start z-10">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Processing</p>
                     <Activity size={18} className="text-blue-500" />
                  </div>
                  <div className="z-10">
                     <h3 className="text-2xl font-bold text-gray-900">${stats.pending.total.toLocaleString()}</h3>
                     <p className="text-[10px] text-gray-400 font-bold mt-1">{stats.pending.count} Invoices in Review</p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-50 rounded-full opacity-50 z-0"></div>
               </div>

               <div onClick={() => { setFilterStatus('exception'); setView('invoices'); }} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer hover:border-amber-300 transition-colors">
                  <div className="flex justify-between items-start z-10">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action Required</p>
                     <AlertCircle size={18} className="text-amber-500" />
                  </div>
                  <div className="z-10">
                     <h3 className="text-2xl font-bold text-amber-600">${stats.exception.total.toLocaleString()}</h3>
                     <p className="text-[10px] text-amber-700 font-bold mt-1 bg-amber-50 inline-block px-1.5 rounded">{stats.exception.count} Disputes Open</p>
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
                  {/* UPDATED: Live Invoice Tracker with real data */}
                  <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                           <Activity size={16} className="mr-2 text-teal-600" />
                           Live Invoice Tracker
                        </h3>
                        <button onClick={() => fetchDashboardData()} className="p-1 text-gray-400 hover:text-gray-600">
                           <RefreshCw size={14} />
                        </button>
                     </div>

                     <div className="divide-y divide-gray-100">
                        {loading ? (
                           <div className="p-6 text-center text-gray-500">Loading invoices...</div>
                        ) : recentInvoices.length === 0 ? (
                           <div className="p-6 text-center text-gray-500">No invoices found. Upload your first invoice!</div>
                        ) : (
                           recentInvoices.map((rawInv) => {
                              const inv = sanitizeInvoiceForUI(rawInv);
                              const currentStep = getStatusStep(inv.status);
                              const isException = inv.status === 'exception' || inv.status === 'rejected';

                              return (
                                 <div key={inv._id} className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => onSelectInvoice(rawInv)}>
                                    <div className="flex justify-between items-start mb-4">
                                       <div>
                                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                             #{inv.invoiceNumber || 'N/A'}
                                          </h4>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                             {inv.carrier || 'Unknown Carrier'}
                                          </p>
                                          <p className="text-xs text-gray-400 mt-0.5">
                                             {inv.consignor?.city || 'N/A'} → {inv.consignee?.city || 'N/A'}
                                          </p>
                                          <p className="text-[10px] text-gray-400 mt-1">
                                             Submitted: {new Date(inv.createdAt).toLocaleDateString()}
                                          </p>
                                       </div>
                                       <div className="text-right">
                                          <p className="text-sm font-bold text-gray-900">
                                             ${(inv.total || 0).toLocaleString()} {inv.currency || 'USD'}
                                          </p>
                                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1 uppercase ${getStatusColor(inv.status)}`}>
                                             {inv.status?.replace('_', ' ')}
                                          </span>
                                       </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex items-center space-x-2 mb-3">
                                       {[1, 2, 3, 4].map((step) => (
                                          <React.Fragment key={step}>
                                             <div className={`flex-1 h-1.5 rounded-full ${step <= currentStep ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                                             {step < 4 && <div className={`w-1.5 h-1.5 rounded-full ${step < currentStep ? 'bg-teal-500' : 'bg-gray-300'}`}></div>}
                                          </React.Fragment>
                                       ))}
                                    </div>

                                    {isException && (
                                       <div className="mt-4 bg-amber-50 border border-amber-100 p-3 rounded-sm flex items-start">
                                          <AlertCircle size={14} className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                                          <div>
                                             <p className="text-xs font-bold text-amber-800">Action Required</p>
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

                                    {inv.status === 'processed' && (
                                       <div className="mt-4 bg-indigo-50 border border-indigo-100 p-3 rounded-sm flex items-center">
                                          <CheckCircle size={14} className="text-indigo-600 mr-2 flex-shrink-0" />
                                          <p className="text-xs font-bold text-indigo-800">Invoice processed successfully and under review.</p>
                                       </div>
                                    )}
                                 </div>
                              );
                           })
                        )}
                     </div>

                     <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
                        <button onClick={() => setView('invoices')} className="text-xs font-bold text-gray-500 hover:text-teal-600 flex items-center justify-center mx-auto">
                           View All Invoices <ChevronRight size={12} className="ml-1" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right column - keep existing code */}
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

                  {/* Keep notifications and support sections as is */}
               </div>
            </div>

            {/* Toast, Support Modal, Dispute Modal - keep existing code */}
            {toast && (<div className={`fixed bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'}`}> <CheckCircle size={16} className="text-white mr-2" /> <div className="text-xs font-bold">{toast.msg}</div> </div>)}

            {/* ... rest of modals ... */}
         </div>
      );
   }

   // UPDATED: Invoices list view with real data
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
                  <input
                     type="text"
                     placeholder="Search Invoice #..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-9 pr-4 py-2 border border-gray-300 rounded-sm text-xs font-medium w-64 focus:outline-none focus:border-blue-500"
                  />
               </div>
               <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-bold uppercase bg-white text-gray-700 hover:bg-gray-50"
               >
                  <option value="ALL">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="approved">Approved</option>
                  <option value="exception">Exception</option>
                  <option value="rejected">Rejected</option>
                  <option value="paid">Paid</option>
               </select>
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
                        <th className="px-6 py-4">Carrier</th>
                        <th className="px-6 py-4">Route</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredInvoices.length === 0 ? (
                        <tr>
                           <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                              No invoices found matching your criteria.
                           </td>
                        </tr>
                     ) : (
                        filteredInvoices.map((rawInv) => {
                           const inv = sanitizeInvoiceForUI(rawInv);
                           return (
                              <tr key={inv._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectInvoice(rawInv)}>
                                 <td className="px-6 py-4">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(inv.status)}`}>
                                       {inv.status?.replace('_', ' ')}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 font-bold text-gray-900">{inv.invoiceNumber || 'N/A'}</td>
                                 <td className="px-6 py-4 text-gray-600">{new Date(inv.date || inv.createdAt).toLocaleDateString()}</td>
                                 <td className="px-6 py-4 text-gray-600">{inv.carrier || 'N/A'}</td>
                                 <td className="px-6 py-4 text-xs text-gray-500">
                                    {inv.consignor?.city || 'N/A'} <span className="mx-1">→</span> {inv.consignee?.city || 'N/A'}
                                 </td>
                                 <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                                    ${(inv.total || 0).toLocaleString()} {inv.currency || 'USD'}
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    {inv.status === 'exception' ? (
                                       <button onClick={(e) => handleOpenDisputeModal(e, inv)} className="text-xs font-bold text-amber-600 hover:underline">Resolve</button>
                                    ) : (
                                       <button onClick={(e) => { e.stopPropagation(); onSelectInvoice(rawInv); }} className="text-xs font-bold text-blue-600 hover:underline">View Details</button>
                                    )}
                                 </td>
                              </tr>
                           )
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};