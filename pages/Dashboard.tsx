
import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  ArrowUpRight, ArrowDownRight, Filter, Search, 
  FileText, Truck, ShieldAlert, Cpu, ChevronRight,
  BarChart2, PieChart as PieIcon, Zap, Server, Database,
  Loader
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { MOCK_INVOICES } from '../constants';
import { InvoiceStatus } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

// --- MOCK DATA FOR CHARTS ---

const VOLUME_TREND_DATA = [
  { day: 'Mon', received: 145, processed: 130, exceptions: 15 },
  { day: 'Tue', received: 210, processed: 180, exceptions: 30 },
  { day: 'Wed', received: 180, processed: 175, exceptions: 5 },
  { day: 'Thu', received: 250, processed: 220, exceptions: 30 },
  { day: 'Fri', received: 190, processed: 185, exceptions: 5 },
  { day: 'Sat', received: 80, processed: 80, exceptions: 0 },
  { day: 'Sun', received: 65, processed: 65, exceptions: 0 },
];

const EXCEPTION_ROOT_CAUSE = [
  { name: 'Rate Mismatch', value: 45, color: '#EF4444' }, // Red
  { name: 'Missing GR/PO', value: 25, color: '#F59E0B' }, // Orange
  { name: 'Duplicate', value: 15, color: '#3B82F6' },    // Blue
  { name: 'Master Data', value: 15, color: '#10B981' },   // Green
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [isIngesting, setIsIngesting] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info'} | null>(null);

  // Filter Exceptions from Mock Data
  const exceptionInvoices = MOCK_INVOICES.filter(inv => inv.status === InvoiceStatus.EXCEPTION);

  const handleForceIngestion = () => {
    setIsIngesting(true);
    setToast({ msg: "Connecting to EDI Gateway...", type: 'info' });
    
    // Simulate process
    setTimeout(() => {
       setToast({ msg: "Processing Batch #B-9921...", type: 'info' });
    }, 1500);

    setTimeout(() => {
       setIsIngesting(false);
       setToast({ msg: "Ingestion Complete: 14 New Invoices Processed.", type: 'success' });
       setTimeout(() => setToast(null), 3000);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col font-sans bg-[#F3F4F6] overflow-hidden relative">
      
      {/* 1. Header Section */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6 shadow-sm z-10">
        <div className="flex justify-between items-start">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                 Control Tower
                 <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-[#004D40] text-white uppercase tracking-wider">
                    Operations & Audit
                 </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Real-time oversight of freight audit, data ingestion, and exception workflows.</p>
           </div>
           
           <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Last Refresh: Just now</span>
              <button 
                onClick={handleForceIngestion}
                disabled={isIngesting}
                className={`flex items-center px-4 py-2 rounded-sm text-xs font-bold uppercase shadow-sm transition-all active:translate-y-0.5
                  ${isIngesting ? 'bg-gray-100 text-gray-500 cursor-wait' : 'bg-teal-600 text-white hover:bg-teal-700'}
                `}
              >
                 {isIngesting ? <Loader size={14} className="mr-2 animate-spin" /> : <Zap size={14} className="mr-2" />}
                 {isIngesting ? 'Running...' : 'Force Ingestion Run'}
              </button>
           </div>
        </div>

        {/* Operational KPIs - UPDATED TO MATCH TRANSCRIPT */}
        <div className="grid grid-cols-4 gap-6 mt-6">
           {/* KPI 1 */}
           <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-teal-500 transition-colors" onClick={() => onNavigate('workbench')}>
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Action</p>
                 <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">{exceptionInvoices.length + 12}</h3>
                    <span className="text-[10px] text-gray-400 ml-2">Invoices</span>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 group-hover:bg-red-100">
                 <AlertTriangle size={20} />
              </div>
           </div>

           {/* KPI 2 - Transcript: "Total Freight Spend 12.9" */}
           <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Freight Spend (YTD)</p>
                 <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-teal-600">$12.9M</h3>
                    <span className="text-xs text-green-600 font-bold ml-2 flex items-center">
                       <ArrowUpRight size={10} className="mr-0.5" /> 2.1%
                    </span>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                 <Cpu size={20} />
              </div>
           </div>

           {/* KPI 3 - Transcript: "Record and invoice accuracy" */}
           <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Accuracy</p>
                 <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">98.5%</h3>
                    <span className="text-[10px] text-gray-400 ml-2">First Pass</span>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                 <ShieldAlert size={20} />
              </div>
           </div>

           {/* KPI 4 - Transcript: "On time delivery performance" */}
           <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">On-Time Delivery</p>
                 <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-orange-600">94.2%</h3>
                    <span className="text-[10px] text-gray-400 ml-2">Network Avg</span>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                 <Clock size={20} />
              </div>
           </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
         
         {/* Row 1: Charts */}
         <div className="grid grid-cols-3 gap-6">
            {/* Throughput Chart */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                     <Activity size={16} className="mr-2 text-teal-600" />
                     Operational Throughput
                  </h3>
                  <div className="flex items-center space-x-2 text-xs">
                     <span className="flex items-center"><div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div> Processed</span>
                     <span className="flex items-center"><div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div> Received</span>
                     <span className="flex items-center"><div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div> Exceptions</span>
                  </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={VOLUME_TREND_DATA}>
                        <defs>
                           <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="received" stackId="1" stroke="#D1D5DB" fill="transparent" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="processed" stackId="2" stroke="#0D9488" fill="url(#colorProcessed)" />
                        <Area type="monotone" dataKey="exceptions" stackId="3" stroke="#F87171" fill="#FEF2F2" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Root Cause Donut */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
               <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Exception Root Causes</h3>
               <p className="text-xs text-gray-500 mb-6">Breakdown of current hold queue.</p>
               <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={EXCEPTION_ROOT_CAUSE}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={70}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {EXCEPTION_ROOT_CAUSE.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                     </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                     <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-900">14%</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Rate Error</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Row 2: Priority Worklist & System Health */}
         <div className="grid grid-cols-3 gap-6">
            
            {/* Worklist */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
               <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex justify-between items-center">
                  <div className="flex items-center">
                     <ShieldAlert size={16} className="mr-2 text-red-600" />
                     <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">Priority Attention Required</h3>
                  </div>
                  <button 
                     onClick={() => onNavigate('workbench')}
                     className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center"
                  >
                     View All <ChevronRight size={14} />
                  </button>
               </div>
               <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-3 font-bold">Severity</th>
                           <th className="px-6 py-3 font-bold">Invoice #</th>
                           <th className="px-6 py-3 font-bold">Carrier</th>
                           <th className="px-6 py-3 font-bold">Reason</th>
                           <th className="px-6 py-3 font-bold">Age</th>
                           <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {exceptionInvoices.slice(0, 3).map((inv, idx) => (
                           <tr key={inv.id} className="hover:bg-red-50/30">
                              <td className="px-6 py-4">
                                 <span className="px-2 py-1 rounded-sm text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase">
                                    High
                                 </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{inv.invoiceNumber}</td>
                              <td className="px-6 py-4 text-gray-700">{inv.carrier}</td>
                              <td className="px-6 py-4 font-medium text-gray-800">{inv.reason}</td>
                              <td className="px-6 py-4 text-gray-500">2d 4h</td>
                              <td className="px-6 py-4 text-right">
                                 <button 
                                    onClick={() => onNavigate('workbench')}
                                    className="text-xs font-bold text-teal-600 hover:underline"
                                 >
                                    Resolve
                                 </button>
                              </td>
                           </tr>
                        ))}
                        <tr className="hover:bg-red-50/30">
                           <td className="px-6 py-4">
                                 <span className="px-2 py-1 rounded-sm text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 uppercase">
                                    Med
                                 </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">LTL-8829-X</td>
                              <td className="px-6 py-4 text-gray-700">Old Dominion</td>
                              <td className="px-6 py-4 font-medium text-gray-800">Duplicate Suspected</td>
                              <td className="px-6 py-4 text-gray-500">1d 2h</td>
                              <td className="px-6 py-4 text-right">
                                 <button 
                                    onClick={() => onNavigate('workbench')}
                                    className="text-xs font-bold text-teal-600 hover:underline"
                                 >
                                    Resolve
                                 </button>
                              </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            {/* System Health Widget (Integration Hub Preview) */}
            <div className="bg-[#1e293b] rounded-sm shadow-sm p-6 flex flex-col justify-between relative overflow-hidden text-gray-300">
               {/* Background Tech Pattern */}
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Server size={120} />
               </div>

               <div>
                  <div className="flex justify-between items-start mb-6">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                        <Database size={16} className="mr-2 text-teal-400" />
                        System Health
                     </h3>
                     <span className="flex items-center text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                        ONLINE
                     </span>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="font-bold">EDI Gateway (X12)</span>
                           <span className="text-green-400">99.9% Uptime</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full w-[99%]"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="font-bold">OCR Engine (Azure AI)</span>
                           <span className="text-green-400">Idle</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-blue-500 h-full w-[15%]"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="font-bold">SAP S/4 Interface</span>
                           <span className="text-yellow-400">High Latency (450ms)</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full w-[100%]"></div>
                        </div>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={() => onNavigate('integration')}
                  className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-sm border border-white/10 transition-colors"
               >
                  Go to Integration Hub
               </button>
            </div>

         </div>

      </div>

      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
         <div className={`absolute bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'}`}>
            <CheckCircle size={16} className="text-white mr-2" />
            <div className="text-xs font-bold">{toast.msg}</div>
         </div>
      )}
    </div>
  );
};
