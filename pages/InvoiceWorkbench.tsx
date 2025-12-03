import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { MoreHorizontal, FileText, Filter, Download, ShieldAlert, Ghost, AlertTriangle, Search, X, RotateCcw, Check, Eye, Flag, Calculator } from 'lucide-react';

interface InvoiceWorkbenchProps {
  invoices: Invoice[]; 
  onSelectInvoice: (invoice: Invoice) => void;
}

export const InvoiceWorkbench: React.FC<InvoiceWorkbenchProps> = ({ invoices, onSelectInvoice }) => {
  // Quick Status Filter
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXCEPTION' | 'APPROVED'>('ALL');
  
  // Advanced Filters
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('All');
  
  // Interaction
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Extract Unique Carriers for Dropdown
  const uniqueCarriers = ['All', ...Array.from(new Set(invoices.map(inv => inv.carrier))).sort()];

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    triggerToast("Exporting filtered grid to CSV... Download started.");
  };

  const handleQuickApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(null);
    triggerToast(`Invoice #${id} quick-approved successfully.`);
    // Ideally this would bubble up to parent to actually update state, visual simulation here
  };

  const handleFlagReview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(null);
    triggerToast(`Invoice #${id} flagged for senior audit review.`);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.APPROVED:
        return <span className="px-2 py-1 rounded-sm text-xs font-bold bg-teal-100 text-teal-700 uppercase tracking-wide border border-teal-200">APPROVED</span>;
      case InvoiceStatus.EXCEPTION:
        return <span className="px-2 py-1 rounded-sm text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">EXCEPTION</span>;
      case InvoiceStatus.PENDING:
        return <span className="px-2 py-1 rounded-sm text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wide border border-orange-200">PENDING</span>;
      default:
        return <span className="px-2 py-1 rounded-sm text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wide border border-gray-200">{status}</span>;
    }
  };

  // --- FILTERING LOGIC ---
  const filteredInvoices = invoices.filter(inv => {
    // 1. Status Filter (Quick Toggle)
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;

    // 2. Search Query (Invoice #, Reason, Lane)
    const q = searchQuery.toLowerCase();
    if (q) {
      const match = inv.invoiceNumber.toLowerCase().includes(q) || 
                    inv.reason?.toLowerCase().includes(q) ||
                    inv.origin.toLowerCase().includes(q) ||
                    inv.destination.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 3. Carrier Filter
    if (carrierFilter !== 'All' && inv.carrier !== carrierFilter) return false;

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setCarrierFilter('All');
    setStatusFilter('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || carrierFilter !== 'All' || statusFilter !== 'ALL';

  // --- GRID SUMMARY CALCULATIONS ---
  const totalListValue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // --- TOP KPI CALCULATIONS ---
  // Using hardcoded values to create a more realistic dashboard view beyond the 5 mock invoices
  const totalPendingCount = invoices.filter(i => i.status === 'PENDING').length + 24;
  const totalApprovedCount = invoices.filter(i => i.status === 'APPROVED').length + 142;
  const totalExceptionCount = invoices.filter(i => i.status === 'EXCEPTION').length + 11;
  const totalRejectedCount = invoices.filter(i => i.status === 'REJECTED').length + 5;
  const totalInvoiceCount = totalPendingCount + totalApprovedCount + totalExceptionCount + totalRejectedCount;

  // Calculate Total Value of ALL invoices, adding a base for realism
  const totalAllInvoicesValue = invoices.reduce((sum, inv) => sum + inv.amount, 0) + 2545900.00;

  return (
    <div className="h-full flex flex-col p-8 font-sans overflow-hidden bg-[#F3F4F6] relative" onClick={() => setActiveActionMenu(null)}>
      
      {/* 1. Top Audit KPIs */}
      <div className="grid grid-cols-6 gap-6 mb-8 flex-shrink-0">
        <div className="bg-white p-4 border-l-4 border-gray-400 shadow-sm rounded-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalInvoiceCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm rounded-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value Invoiced</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${totalAllInvoicesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Audit</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalPendingCount}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-teal-500 shadow-sm rounded-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Auto-Approved</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{totalApprovedCount}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-500 shadow-sm rounded-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exceptions</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalExceptionCount}</p>
        </div>
        <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{totalRejectedCount}</p>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col mb-4 flex-shrink-0">
        <div className="flex justify-between items-end">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-sm">
            {['ALL', 'EXCEPTION', 'APPROVED'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all uppercase tracking-wide ${
                  statusFilter === f 
                    ? 'bg-white text-teal-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-300/50'
                }`}
              >
                {f === 'ALL' ? 'Show: All' : f === 'EXCEPTION' ? 'Exceptions' : 'Approved'}
              </button>
            ))}
          </div>
          <div className="flex space-x-3">
             <button 
               onClick={() => setShowFilterPanel(!showFilterPanel)}
               className={`flex items-center space-x-2 px-4 py-2 border rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm transition-colors ${
                 showFilterPanel 
                  ? 'bg-teal-50 border-teal-500 text-teal-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
               }`}
             >
              <Filter size={14} />
              <span>Filter Grid</span>
            </button>
            <button 
               onClick={handleExport}
               className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 3. Collapsible Filter Panel */}
        {showFilterPanel && (
           <div className="mt-4 p-5 bg-white border border-gray-200 shadow-sm rounded-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advanced Search</h3>
                 {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-xs text-red-600 font-bold hover:underline flex items-center">
                       <RotateCcw size={12} className="mr-1"/> Reset Filters
                    </button>
                 )}
              </div>
              <div className="grid grid-cols-3 gap-6">
                 {/* Search Input */}
                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Search Query</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         placeholder="Invoice #, Reason, Lane..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-teal-500 focus:outline-none"
                       />
                       <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                       {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                             <X size={14} />
                          </button>
                       )}
                    </div>
                 </div>
                 
                 {/* Carrier Dropdown */}
                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Carrier</label>
                    <select 
                      value={carrierFilter}
                      onChange={(e) => setCarrierFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:border-teal-500 focus:outline-none bg-white"
                    >
                       {uniqueCarriers.map(c => (
                          <option key={c} value={c}>{c}</option>
                       ))}
                    </select>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* SUMMARY HEADER (Total Amounts) */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
            <Calculator size={14} className="mr-2"/> Active View Summary
         </h3>
         <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-sm border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
               <span className="text-[10px] font-bold text-gray-400 uppercase">Count</span>
               <span className="text-sm font-bold text-gray-900">{filteredInvoices.length}</span>
            </div>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase">Total Value</span>
               <span className="text-lg font-bold text-teal-700 font-mono">
                  ${totalListValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
               </span>
            </div>
         </div>
      </div>

      {/* 4. The Workhorse Grid */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex-1 overflow-auto custom-scrollbar pb-24">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#F9FAFB] z-10 shadow-sm">
            <tr className="text-xs font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
              <th className="py-4 px-6 bg-[#F9FAFB]">Status</th>
              <th className="py-4 px-6 bg-[#F9FAFB]">Invoice #</th>
              <th className="py-4 px-6 bg-[#F9FAFB]">Carrier</th>
              
              {/* --- SOLID FEATURE: DUAL-RATING COLUMNS --- */}
              <th className="py-4 px-6 text-right bg-[#F9FAFB] border-l border-gray-100">TMS Est.</th>
              <th className="py-4 px-6 text-right bg-[#F9FAFB]">ATLAS Audit</th>
              <th className="py-4 px-6 text-right bg-[#F9FAFB]">Billed Amt</th>
              <th className="py-4 px-6 text-right bg-[#F9FAFB]">Variance</th>
              
              <th className="py-4 px-6 bg-[#F9FAFB]">Reason</th>
              <th className="py-4 px-6 text-center bg-[#F9FAFB]">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredInvoices.length > 0 ? (
               filteredInvoices.map((inv) => {
                 const isDuplicate = inv.reason?.includes('Duplicate');
                 const isGhost = inv.tmsMatchStatus === 'NOT_FOUND';
                 const isMenuOpen = activeActionMenu === inv.id;
                 
                 return (
                   <tr 
                     key={inv.id} 
                     className={`border-b border-gray-100 cursor-pointer transition-colors group
                       ${isDuplicate ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-teal-50/30'}
                     `}
                     onClick={() => onSelectInvoice(inv)}
                   >
                     <td className="py-4 px-6">
                       {getStatusBadge(inv.status)}
                       {/* --- SOLID FEATURE: GHOST TAG --- */}
                       {isGhost && (
                          <div className="mt-1 flex items-center text-[10px] text-gray-500 font-bold uppercase">
                             <Ghost size={10} className="mr-1 text-gray-400" />
                             Non-TMS
                          </div>
                       )}
                     </td>
                     <td className="py-4 px-6 font-medium text-blue-600 group-hover:underline">
                       <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-gray-400 group-hover:text-blue-600" />
                          <span>#{inv.invoiceNumber}</span>
                       </div>
                       {/* Source Tag */}
                       <span className="text-[10px] text-gray-400 font-normal ml-6 block">Src: {inv.source}</span>
                     </td>
                     <td className="py-4 px-6 font-medium">
                        {inv.carrier}
                        <span className="block text-xs text-gray-500 font-normal">{inv.origin} &rarr; {inv.destination}</span>
                     </td>
                     
                     {/* --- SOLID FEATURE: DUAL-RATING DATA --- */}
                     <td className="py-4 px-6 text-right font-mono text-gray-400 border-l border-gray-100">
                        {inv.tmsEstimatedAmount ? `$${inv.tmsEstimatedAmount.toLocaleString()}` : <span className="text-[10px] italic">--</span>}
                     </td>
                     <td className="py-4 px-6 text-right font-mono font-bold text-gray-800">
                        ${(inv.auditAmount || 0).toLocaleString()}
                     </td>
                     <td className="py-4 px-6 text-right font-mono text-gray-600">
                        ${inv.amount.toLocaleString()}
                     </td>
                     <td className={`py-4 px-6 text-right font-bold font-mono ${inv.variance > 0 ? 'text-red-600' : 'text-teal-600'}`}>
                       {inv.variance > 0 ? '+' : ''}${inv.variance.toFixed(2)}
                     </td>

                     <td className="py-4 px-6 text-xs font-medium text-gray-500">
                       <div className="flex items-center">
                          {isDuplicate && <ShieldAlert size={14} className="mr-1 text-red-600" />}
                          {isGhost && <AlertTriangle size={14} className="mr-1 text-amber-500" />}
                          <span className={isDuplicate ? 'text-red-700 font-bold' : isGhost ? 'text-amber-700 font-bold' : ''}>{inv.reason}</span>
                       </div>
                     </td>
                     <td className="py-4 px-6 text-center relative">
                       <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setActiveActionMenu(isMenuOpen ? null : inv.id);
                          }}
                          className={`p-1 rounded-full transition-colors ${isMenuOpen ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-200 text-gray-400 hover:text-teal-600'}`}
                       >
                         <MoreHorizontal size={18} />
                       </button>
                       
                       {/* Context Menu */}
                       {isMenuOpen && (
                          <div className="absolute right-8 top-8 w-48 bg-white shadow-xl border border-gray-200 rounded-sm z-50 animate-fade-in-up">
                             <div className="py-1">
                                <button 
                                   onClick={(e) => { e.stopPropagation(); onSelectInvoice(inv); }}
                                   className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                   <Eye size={14} className="mr-2 text-gray-400" /> View Details
                                </button>
                                <button 
                                   onClick={(e) => handleQuickApprove(e, inv.id)}
                                   className="w-full text-left px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 flex items-center"
                                >
                                   <Check size={14} className="mr-2" /> Quick Approve
                                </button>
                                <button 
                                   onClick={(e) => handleFlagReview(e, inv.invoiceNumber)}
                                   className="w-full text-left px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 flex items-center"
                                >
                                   <Flag size={14} className="mr-2" /> Flag for Review
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button className="w-full text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 flex items-center">
                                   <Download size={14} className="mr-2" /> Download PDF
                                </button>
                             </div>
                          </div>
                       )}
                     </td>
                   </tr>
                 );
               })
            ) : (
               <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                     <div className="flex flex-col items-center justify-center text-gray-400">
                        <Filter size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-bold text-gray-600">No invoices match your filters.</p>
                        <button onClick={clearAllFilters} className="mt-2 text-teal-600 hover:underline text-xs font-bold">Clear all filters</button>
                     </div>
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
         <div className="absolute bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 bg-gray-900 text-white">
            <Check size={16} className="text-green-400 mr-2" />
            <div className="text-xs font-bold">{toast}</div>
         </div>
      )}
    </div>
  );
};