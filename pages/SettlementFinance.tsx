import React, { useState } from 'react';
import { 
  Download, CheckCircle, Clock, AlertTriangle, FileText, Calendar, 
  DollarSign, X, ShieldCheck, TrendingUp, Lock, Globe, Building2, 
  Search, Filter, ChevronRight, ArrowRight, Wallet, PieChart as PieIcon,
  RefreshCw, Landmark, MoreHorizontal, CreditCard, Plus, Save, ChevronDown,
  ArrowUpRight, ArrowDownRight, RotateCcw, UserCheck
} from 'lucide-react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { UserRole, Invoice, PaymentBatch } from '../types';
import { MOCK_INVOICES, MOCK_BATCHES } from '../constants';

// --- MOCK DATA & TYPES ---

// Vendor Remittance Data
const VENDOR_REMITTANCES = [
   {
      id: 'REM-OCT-24-001',
      date: '2025-10-24',
      ref: 'WIRE-88291',
      amount: 42500.00,
      currency: 'USD',
      status: 'PAID',
      invoices: [
         { number: '9982770', date: '2025-09-15', amount: 22000.00 },
         { number: '9982769', date: '2025-09-18', amount: 20500.00 }
      ]
   },
   {
      id: 'REM-NOV-10-002',
      date: '2025-11-10',
      ref: 'ACH-11299',
      amount: 12800.00,
      currency: 'USD',
      status: 'PAID',
      invoices: [
         { number: '9982772', date: '2025-10-01', amount: 12800.00 }
      ]
   },
   {
      id: 'REM-NOV-24-PEND',
      date: '2025-11-28', // Future
      ref: '--',
      amount: 2925.00,
      currency: 'USD',
      status: 'SCHEDULED',
      invoices: [
         { number: '9982771-A', date: '2025-11-15', amount: 2925.00 }
      ]
   }
];

const CASH_FLOW_DATA = [
  { day: 'Mon', inflow: 400000, outflow: 240000, net: 160000 },
  { day: 'Tue', inflow: 300000, outflow: 1398000, net: -1098000 },
  { day: 'Wed', inflow: 200000, outflow: 980000, net: -780000 },
  { day: 'Thu', inflow: 278000, outflow: 390800, net: -112800 },
  { day: 'Fri', inflow: 189000, outflow: 480000, net: -291000 },
  { day: 'Sat', inflow: 239000, outflow: 380000, net: -141000 },
  { day: 'Sun', inflow: 349000, outflow: 430000, net: -81000 },
];

const CURRENCY_DISTRIBUTION = [
  { name: 'USD', value: 65, color: '#004D40' },
  { name: 'EUR', value: 20, color: '#0F62FE' },
  { name: 'CNY', value: 10, color: '#F59E0B' },
  { name: 'Other', value: 5, color: '#6B7280' },
];

const RECONCILIATION_DATA = [
  { id: 1, date: '2025-11-24', desc: 'Outbound Payment: Maersk Line', amount: -2775.00, status: 'MATCHED', bankRef: 'TRX-99281' },
  { id: 2, date: '2025-11-24', desc: 'Outbound Payment: K Line', amount: -450.00, status: 'MATCHED', bankRef: 'TRX-99282' },
  { id: 3, date: '2025-11-25', desc: 'Bank Fee: Int Transfer', amount: -25.00, status: 'UNMATCHED', bankRef: 'FEE-001' },
];

interface SettlementFinanceProps {
   userRole?: UserRole;
}

export const SettlementFinance: React.FC<SettlementFinanceProps> = ({ userRole = '3SC' }) => {
  const isVendor = userRole === 'VENDOR';
  
  // SHARED STATE
  const [activeTab, setActiveTab] = useState<'factory' | 'cashflow' | 'reconciliation'>('factory');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // VENDOR STATE
  const [expandedRemittance, setExpandedRemittance] = useState<string | null>(null);

  // INTERNAL STATE
  const [batches, setBatches] = useState<PaymentBatch[]>(MOCK_BATCHES);
  const [reconData, setReconData] = useState(RECONCILIATION_DATA);
  const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showNewRunModal, setShowNewRunModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState('All Entities');
  const [filterCurrency, setFilterCurrency] = useState('All');

  const [newRunForm, setNewRunForm] = useState({
    entity: 'Hitachi Energy USA',
    paymentMethod: 'ACH',
    runDate: new Date().toISOString().split('T')[0]
  });

  // --- FILTER LOGIC ---
  const filteredBatches = batches.filter(batch => {
    // 1. Search (ID)
    const matchesSearch = !searchQuery || batch.id.toLowerCase().includes(searchQuery.toLowerCase());
    // 2. Entity Filter
    const matchesEntity = filterEntity === 'All Entities' || batch.entity === filterEntity;
    // 3. Currency Filter
    const matchesCurrency = filterCurrency === 'All' || batch.currency === filterCurrency;

    return matchesSearch && matchesEntity && matchesCurrency;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterEntity('All Entities');
    setFilterCurrency('All');
  };

  const hasActiveFilters = searchQuery || filterEntity !== 'All Entities' || filterCurrency !== 'All';

  // --- ACTIONS ---

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const handleExport = () => {
    triggerToast("Generating Report... Download started.");
  };

  const handleDownloadRemittance = (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     triggerToast(`Downloading Remittance Advice ${id}...`);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      triggerToast("Bank Balances Synced with SAP S/4HANA (Last 5 mins).");
    }, 1500);
  };

  const handleBatchSelect = (batch: PaymentBatch) => {
    setSelectedBatch(batch);
    setIsDetailModalOpen(true);
  };

  const handleApproveClick = (id: string) => {
    setIsDetailModalOpen(false); // Close detail modal first
    setSelectedBatch(batches.find(b => b.id === id) || null);
    setShowApprovalModal(true);
  };

  const confirmApproval = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setBatches(prev => prev.map(b => b.id === selectedBatch?.id ? { ...b, status: 'SENT_TO_BANK' } : b));
      setIsProcessing(false);
      setShowApprovalModal(false);
      setSelectedBatch(null);
      triggerToast("Payment Batch authorized and transmitted to Bank.");
    }, 2000);
  };

  const handleCreateRun = () => {
    // Add new dummy batch
    const newBatch: PaymentBatch = {
      id: `PY-${newRunForm.runDate}-${Math.floor(Math.random() * 1000)}`,
      runDate: newRunForm.runDate,
      entity: newRunForm.entity,
      bankAccount: 'CITI-NEW (USD)',
      currency: 'USD',
      amount: 0,
      invoiceCount: 0,
      discountAvailable: 0,
      status: 'DRAFT',
      riskScore: 'LOW',
      invoiceIds: [],
      paymentTerms: 'Net 30',
      sanctionStatus: 'PENDING'
    };
    setBatches([newBatch, ...batches]);
    setShowNewRunModal(false);
    triggerToast(`New Payment Run ${newBatch.id} created successfully.`);
  };

  const handleApplyDiscount = () => {
    triggerToast("Optimization Applied: $125.00 early payment discount secured.");
    setBatches(prev => {
       const newB = [...prev];
       if(newB[0]) newB[0].riskScore = 'LOW'; 
       return newB;
    });
  };

  const handleReconMatch = (id: number) => {
    setReconData(prev => prev.map(r => r.id === id ? { ...r, status: 'MATCHED' as any } : r));
    triggerToast("Transaction matched manually.");
  };

  // --- RENDER VENDOR VIEW ---
  if (isVendor) {
     // ... (Vendor View remains unchanged) ...
     return (
        <div className="h-full flex flex-col font-sans bg-[#F3F4F6] overflow-hidden relative">
           {/* Vendor Header */}
           <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0 z-10 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                       My Payments
                       <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                          Remittances
                       </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Track incoming payments and download remittance advice.</p>
                 </div>
                 <button onClick={handleExport} className="flex items-center px-4 py-2 border border-gray-300 bg-white rounded-sm text-xs font-bold uppercase hover:bg-gray-50">
                    <Download size={14} className="mr-2"/> Export History
                 </button>
              </div>

              {/* Vendor KPIs */}
              <div className="grid grid-cols-3 gap-6">
                 <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Paid (YTD)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$55,300.00</p>
                 </div>
                 <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Payment</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$12,800.00</p>
                    <p className="text-[10px] text-gray-400 mt-1">Received Nov 10</p>
                 </div>
                 <div className="bg-blue-600 p-5 rounded-sm border border-blue-700 shadow-sm text-white">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Next Scheduled</p>
                    <p className="text-3xl font-bold text-white mt-2">$2,925.00</p>
                    <p className="text-[10px] text-blue-200 mt-1">Est. Nov 28</p>
                 </div>
              </div>
           </div>

           {/* Vendor Table */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200">
                       <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Remittance Ref</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {VENDOR_REMITTANCES.map((remit) => (
                          <React.Fragment key={remit.id}>
                             <tr 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => setExpandedRemittance(expandedRemittance === remit.id ? null : remit.id)}
                             >
                                <td className="px-6 py-4 text-gray-900 font-medium">{remit.date}</td>
                                <td className="px-6 py-4 font-mono text-xs text-blue-600">{remit.ref}</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900">${remit.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase
                                      ${remit.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
                                   `}>
                                      {remit.status}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button 
                                      onClick={(e) => handleDownloadRemittance(remit.ref, e)}
                                      className="text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Download Advice"
                                   >
                                      <Download size={16} />
                                   </button>
                                   <button className="ml-4 text-gray-400">
                                      {expandedRemittance === remit.id ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                   </button>
                                </td>
                             </tr>
                             {/* Expanded Invoice Details */}
                             {expandedRemittance === remit.id && (
                                <tr className="bg-gray-50">
                                   <td colSpan={5} className="px-6 py-4">
                                      <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-inner">
                                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Paid Invoices</h4>
                                         <table className="w-full text-xs">
                                            <thead className="text-gray-400 border-b border-gray-100">
                                               <tr>
                                                  <th className="text-left pb-2">Invoice #</th>
                                                  <th className="text-left pb-2">Inv Date</th>
                                                  <th className="text-right pb-2">Amount</th>
                                               </tr>
                                            </thead>
                                            <tbody>
                                               {remit.invoices.map((inv, idx) => (
                                                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                                                     <td className="py-2 font-medium text-gray-800">{inv.number}</td>
                                                     <td className="py-2 text-gray-600">{inv.date}</td>
                                                     <td className="py-2 text-right font-mono">${inv.amount.toLocaleString()}</td>
                                                  </tr>
                                               ))}
                                            </tbody>
                                         </table>
                                      </div>
                                   </td>
                                </tr>
                             )}
                          </React.Fragment>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           {/* Toast Notification */}
           {toast && (
              <div className={`absolute bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
                 <CheckCircle size={16} className="text-white mr-2" />
                 <div className="text-xs font-bold">{toast.msg}</div>
              </div>
           )}
        </div>
     );
  }

  // --- RENDER INTERNAL VIEW (Hitachi/3SC) ---
  return (
    <div className="h-full flex flex-col font-sans bg-[#F3F4F6] overflow-hidden relative">
      
      {/* 1. Header & KPI Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0 z-10 shadow-sm">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                  Settlement & Treasury
                  <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-[#004D40] text-white uppercase tracking-wider">
                     Finance
                  </span>
               </h2>
               <p className="text-sm text-gray-500 mt-1">Manage payment runs, liquidity forecasting, and bank reconciliation.</p>
            </div>
            
            <div className="flex space-x-3">
               <button 
                  onClick={handleSync}
                  className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-sm text-xs font-bold uppercase hover:bg-gray-50"
               >
                  {isSyncing ? <RefreshCw size={14} className="mr-2 animate-spin"/> : <RefreshCw size={14} className="mr-2"/>}
                  Sync SAP Banks
               </button>
               <button 
                  onClick={() => setShowNewRunModal(true)}
                  className="flex items-center px-4 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-sm"
               >
                  <Plus size={14} className="mr-2"/> New Payment Run
               </button>
            </div>
         </div>

         {/* KPIs */}
         <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 rounded-sm shadow-md">
               <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Global Cash Position</p>
                  <Wallet size={18} className="text-teal-400" />
               </div>
               <h3 className="text-3xl font-bold">$42.5M</h3>
               <p className="text-[10px] text-gray-400 mt-1">Across 12 Entities</p>
            </div>
            <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Approvals</p>
                  <Clock size={18} className="text-orange-500" />
               </div>
               <h3 className="text-3xl font-bold text-gray-900">$2.7k</h3>
               <p className="text-[10px] text-gray-400 mt-1">1 Batch Queued</p>
            </div>
            <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discount Capture (YTD)</p>
                  <TrendingUp size={18} className="text-green-600" />
               </div>
               <h3 className="text-3xl font-bold text-green-600">$85.2k</h3>
               <p className="text-[10px] text-gray-400 mt-1">98% Efficiency</p>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex space-x-8 mt-8 -mb-5">
            {[
               { id: 'factory', label: 'Payment Factory', icon: Building2 },
               { id: 'cashflow', label: 'Cash Flow Optimizer', icon: PieIcon },
               { id: 'reconciliation', label: 'Bank Reconciliation', icon: ShieldCheck }
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                     activeTab === tab.id 
                        ? 'border-teal-600 text-teal-800' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
               >
                  <tab.icon size={16} className={`mr-2 ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-400'}`} />
                  {tab.label}
               </button>
            ))}
         </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
         
         {/* VIEW: PAYMENT FACTORY */}
         {activeTab === 'factory' && (
            <div className="animate-fade-in-up">
               <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                     <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                     <input 
                        type="text" 
                        placeholder="Search Batch ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-sm text-xs font-medium w-64 focus:outline-none focus:border-teal-500" 
                     />
                  </div>
                  <button 
                     onClick={() => setShowFilterPanel(!showFilterPanel)}
                     className={`text-xs font-bold flex items-center ${hasActiveFilters ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}`}
                  >
                     <Filter size={14} className="mr-1" /> {hasActiveFilters ? 'Filters Active' : 'Advanced Filters'}
                  </button>
               </div>

               {showFilterPanel && (
                  <div className="mb-6 p-4 bg-white border border-gray-200 rounded-sm grid grid-cols-4 gap-4 shadow-sm animate-fade-in-up">
                     <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Entity</label>
                        <select 
                           value={filterEntity}
                           onChange={(e) => setFilterEntity(e.target.value)}
                           className="w-full text-xs border border-gray-300 rounded-sm p-2 bg-white focus:outline-none focus:border-teal-500"
                        >
                           <option>All Entities</option>
                           <option>Hitachi Energy USA</option>
                           <option>Hitachi Energy Canada</option>
                           <option>Hitachi Energy EU</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Currency</label>
                        <select 
                           value={filterCurrency}
                           onChange={(e) => setFilterCurrency(e.target.value)}
                           className="w-full text-xs border border-gray-300 rounded-sm p-2 bg-white focus:outline-none focus:border-teal-500"
                        >
                           <option>All</option>
                           <option>USD</option>
                           <option>EUR</option>
                           <option>CAD</option>
                        </select>
                     </div>
                     <div className="flex items-end space-x-2">
                        <button 
                           onClick={clearFilters}
                           className="w-1/2 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-sm hover:bg-gray-200 uppercase flex items-center justify-center"
                        >
                           <RotateCcw size={12} className="mr-1"/> Reset
                        </button>
                        <button 
                           onClick={() => setShowFilterPanel(false)} 
                           className="w-1/2 bg-teal-600 text-white text-xs font-bold py-2 rounded-sm hover:bg-teal-700 uppercase"
                        >
                           Done
                        </button>
                     </div>
                  </div>
               )}

               <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-4">Batch ID</th>
                           <th className="px-6 py-4">Run Date</th>
                           <th className="px-6 py-4">Entity / Account</th>
                           <th className="px-6 py-4 text-right">Total Amount</th>
                           <th className="px-6 py-4 text-center">Invoices</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredBatches.length > 0 ? (
                           filteredBatches.map((batch) => (
                           <tr key={batch.id} className="hover:bg-teal-50/20 transition-colors group cursor-pointer" onClick={() => handleBatchSelect(batch)}>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-teal-700">{batch.id}</td>
                              <td className="px-6 py-4 text-gray-600">{batch.runDate}</td>
                              <td className="px-6 py-4">
                                 <div className="font-bold text-gray-800">{batch.entity}</div>
                                 <div className="text-xs text-gray-400">{batch.bankAccount}</div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                                 {batch.amount.toLocaleString('en-US', { style: 'currency', currency: batch.currency })}
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{batch.invoiceCount}</span>
                              </td>
                              <td className="px-6 py-4">
                                 {batch.status === 'SENT_TO_BANK' && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">PROCESSED</span>}
                                 {batch.status === 'AWAITING_APPROVAL' && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200 flex items-center w-fit"><Lock size={10} className="mr-1"/> APPROVAL REQ</span>}
                                 {batch.status === 'DRAFT' && <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">DRAFT</span>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-gray-400 group-hover:text-teal-600 transition-colors">
                                    <ChevronRight size={18}/>
                                 </button>
                              </td>
                           </tr>
                        ))
                        ) : (
                           <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                 <Filter size={48} className="mx-auto mb-3 opacity-20" />
                                 <p className="text-sm font-bold">No batches match your filters.</p>
                                 <button onClick={clearFilters} className="text-xs text-teal-600 hover:underline mt-2 font-bold">Clear Filters</button>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* VIEW: CASH FLOW */}
         {activeTab === 'cashflow' && (
            <div className="space-y-6 animate-fade-in-up">
               <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 bg-white border border-gray-200 shadow-sm rounded-sm p-6">
                     <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center">
                        <TrendingUp size={16} className="mr-2 text-blue-600" />
                        Liquidity Forecast (7 Days)
                     </h3>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={CASH_FLOW_DATA}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="inflow" fill="#10B981" name="Inflow" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="outflow" fill="#EF4444" name="Outflow" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  
                  <div className="col-span-1 bg-white border border-gray-200 shadow-sm rounded-sm p-6">
                     <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Currency Exposure</h3>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={CURRENCY_DISTRIBUTION}
                                 innerRadius={60}
                                 outerRadius={80}
                                 paddingAngle={5}
                                 dataKey="value"
                              >
                                 {CURRENCY_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" height={36}/>
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-sm text-xs text-blue-800">
                        <span className="font-bold">Suggestion:</span> Consider hedging EUR exposure for upcoming Q4 payments.
                     </div>
                  </div>
               </div>

               {/* Discount Optimization */}
               <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-6 flex justify-between items-center bg-gradient-to-r from-teal-50 to-white">
                  <div>
                     <h3 className="text-lg font-bold text-teal-800 flex items-center">
                        <DollarSign size={20} className="mr-2" /> Dynamic Discounting
                     </h3>
                     <p className="text-sm text-teal-600 mt-1">1 Batch eligible for early payment (2% / 10 Net 30)</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-bold text-gray-500 uppercase">Potential Savings</p>
                     <p className="text-2xl font-bold text-gray-900">$125.00</p>
                  </div>
                  <button 
                     onClick={handleApplyDiscount}
                     className="px-6 py-2 bg-teal-600 text-white font-bold text-sm rounded-sm hover:bg-teal-700 shadow-sm transition-transform active:translate-y-0.5"
                  >
                     Apply & Save
                  </button>
               </div>
            </div>
         )}

         {/* VIEW: RECONCILIATION */}
         {activeTab === 'reconciliation' && (
            <div className="animate-fade-in-up bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bank Statement vs Ledger</h3>
                  <span className="text-xs font-bold text-gray-500">Unmatched: <span className="text-red-600">1 Item</span></span>
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase font-bold">
                     <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Bank Reference</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {reconData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 text-gray-600">{item.date}</td>
                           <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.bankRef}</td>
                           <td className="px-6 py-4 font-medium text-gray-800">{item.desc}</td>
                           <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">{item.amount.toFixed(2)}</td>
                           <td className="px-6 py-4">
                              {item.status === 'MATCHED' ? (
                                 <span className="flex items-center text-xs font-bold text-green-600"><CheckCircle size={14} className="mr-1"/> Matched</span>
                              ) : (
                                 <span className="flex items-center text-xs font-bold text-red-500"><AlertTriangle size={14} className="mr-1"/> Unmatched</span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-right">
                              {item.status === 'UNMATCHED' && (
                                 <button 
                                    onClick={() => handleReconMatch(item.id)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                 >
                                    Manual Match
                                 </button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Batch Detail Modal */}
      {isDetailModalOpen && selectedBatch && (
        <BatchDetailModal 
          batch={selectedBatch}
          onClose={() => setIsDetailModalOpen(false)}
          onApprove={() => handleApproveClick(selectedBatch.id)}
          onDownloadVoucher={(voucherId) => triggerToast(`Downloading ${voucherId}.pdf...`)}
        />
      )}

      {/* 2. Approval Modal */}
      {showApprovalModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-sm shadow-2xl p-6">
               <div className="flex items-center text-orange-600 mb-4">
                  <ShieldCheck size={24} className="mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Authorize Payment</h3>
               </div>
               <p className="text-sm text-gray-600 mb-6">
                  You are approving Batch <span className="font-bold font-mono">{selectedBatch?.id}</span> for release to the banking network. 
                  This action utilizes your Digital Signature (ID: WC-9921).
               </p>
               <div className="bg-gray-50 p-4 border border-gray-200 rounded-sm mb-6 text-xs text-gray-500">
                  <p className="flex justify-between mb-1"><span>Total Amount:</span> <span className="font-bold text-gray-900">${selectedBatch?.amount.toLocaleString()}</span></p>
                  <p className="flex justify-between"><span>Beneficiaries:</span> <span className="font-bold text-gray-900">{selectedBatch?.invoiceCount} Vendors</span></p>
               </div>
               <div className="flex justify-end space-x-3">
                  <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm">Cancel</button>
                  <button 
                     onClick={confirmApproval}
                     disabled={isProcessing}
                     className="px-6 py-2 text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 rounded-sm shadow-sm flex items-center"
                  >
                     {isProcessing ? 'Signing...' : 'Confirm Release'}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* 3. New Run Modal */}
      {showNewRunModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-[#004D40] text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">Schedule Payment Run</h3>
                  <button onClick={() => setShowNewRunModal(false)}><X size={20}/></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Paying Entity</label>
                     <select 
                        className="w-full border border-gray-300 rounded-sm p-2 text-sm"
                        value={newRunForm.entity}
                        onChange={(e) => setNewRunForm({...newRunForm, entity: e.target.value})}
                     >
                        <option>Hitachi Energy USA</option>
                        <option>Hitachi Energy Canada</option>
                        <option>Hitachi Energy EU</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Payment Method</label>
                     <select 
                        className="w-full border border-gray-300 rounded-sm p-2 text-sm"
                        value={newRunForm.paymentMethod}
                        onChange={(e) => setNewRunForm({...newRunForm, paymentMethod: e.target.value})}
                     >
                        <option value="ACH">ACH (Domestic)</option>
                        <option value="WIRE">Wire Transfer (Intl)</option>
                        <option value="CHECK">Paper Check</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Execution Date</label>
                     <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-sm p-2 text-sm"
                        value={newRunForm.runDate}
                        onChange={(e) => setNewRunForm({...newRunForm, runDate: e.target.value})}
                     />
                  </div>
                  <div className="pt-4 flex justify-end">
                     <button 
                        onClick={handleCreateRun}
                        className="px-6 py-2 bg-teal-600 text-white font-bold text-sm rounded-sm hover:bg-teal-700 shadow-sm"
                     >
                        Create Draft Run
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- TOAST --- */}
      {toast && (
         <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
            <CheckCircle size={16} className="text-white mr-2" />
            <div className="text-xs font-bold">{toast.msg}</div>
         </div>
      )}

    </div>
  );
};


// --- BATCH DETAIL MODAL COMPONENT ---

interface BatchDetailModalProps {
  batch: PaymentBatch;
  onClose: () => void;
  onApprove: () => void;
  onDownloadVoucher: (voucherId: string) => void;
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ batch, onClose, onApprove, onDownloadVoucher }) => {
  const batchInvoices = MOCK_INVOICES.filter(inv => batch.invoiceIds.includes(inv.id));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm">
      <div className="bg-gray-50 w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Payment Batch Details</h2>
            <p className="text-sm font-mono text-teal-600">{batch.id}</p>
          </div>
          <div className="flex items-center space-x-3">
            {batch.status === 'AWAITING_APPROVAL' && (
              <button onClick={onApprove} className="px-4 py-2 text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 rounded-sm shadow-sm">
                Approve Batch
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20}/></button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-3 gap-6 flex-shrink-0 bg-white border-b border-gray-200">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Payment Terms</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{batch.paymentTerms}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Sanction Screening</p>
            <p className={`text-lg font-bold mt-1 flex items-center ${batch.sanctionStatus === 'PASSED' ? 'text-green-600' : 'text-orange-500'}`}>
              <ShieldCheck size={18} className="mr-2"/> {batch.sanctionStatus}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Approval Status</p>
            <p className="text-lg font-bold text-gray-800 mt-1 flex items-center">
              <UserCheck size={18} className="mr-2 text-gray-400"/>
              {batch.status === 'AWAITING_APPROVAL' ? `Pending - ${batch.nextApprover}` : batch.status.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        {/* Invoice Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr className="text-xs text-gray-500 uppercase font-bold">
                <th className="px-6 py-3">GL Code</th>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Voucher Details</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {batchInvoices.map(inv => {
                const voucherId = `VOUCH-${inv.id}`;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{inv.glSegments?.[0]?.code || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{inv.carrier}</td>
                    <td className="px-6 py-4 text-right font-mono text-gray-800">${inv.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.dueDate}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600">{voucherId}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onDownloadVoucher(voucherId)}
                        className="p-2 text-gray-400 hover:text-blue-600" title="Download Voucher">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};