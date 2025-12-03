import React, { useState } from 'react';
import { 
  Search, Download, Upload, Filter, Edit2, Clock, X, Cloud, 
  CheckCircle, PlayCircle, Trash2, ArrowLeft, FileText, Truck, 
  Globe, Shield, DollarSign, ChevronRight, AlertCircle, Calendar,
  Calculator, MapPin, TrendingUp, Layers, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Ship, Plane, Box, Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, Legend, ComposedChart, Area
} from 'recharts';

// --- TYPES ---
interface Contract {
  id: string;
  carrier: string;
  refId: string;
  mode: string;
  laneDescription: string;
  contractType: 'Fixed' | 'Index-Linked' | 'Spot Framework' | 'Tiered';
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRING' | 'PENDING' | 'ARCHIVED';
  allocationTarget: number; // Committed %
  allocationActual: number; // Actual %
  spendYTD: number;
  paymentTerms: string;
  expiryDays: number;
}

interface RateLine {
  origin: string;
  destination: string;
  equipment: string;
  currency: string;
  baseRate: number;
  marketRate: number; // For benchmarking
  transitTime: string;
  validity: string;
}

interface Accessorial {
  code: string;
  description: string;
  chargeType: string;
  amount: number;
  currency: string;
  category: 'Fuel' | 'Security' | 'Handling' | 'Seasonal';
  logic: 'Fixed' | 'Pass-through' | '% of Freight';
}

// --- MOCK DATA ---

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    carrier: 'Maersk Line',
    refId: 'GSA-MAEU-25-01',
    mode: 'Ocean',
    laneDescription: 'Asia to North America (TPEB)',
    contractType: 'Fixed',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    status: 'ACTIVE',
    allocationTarget: 45,
    allocationActual: 48,
    spendYTD: 4250000,
    paymentTerms: 'Net 45',
    expiryDays: 405
  },
  {
    id: 'c2',
    carrier: 'MSC',
    refId: 'MSC-GL-2025-B',
    mode: 'Ocean',
    laneDescription: 'Europe to Asia (EAEB)',
    contractType: 'Index-Linked',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    status: 'EXPIRING',
    allocationTarget: 30,
    allocationActual: 22,
    spendYTD: 1850000,
    paymentTerms: 'Net 30',
    expiryDays: 35
  },
  {
    id: 'c3',
    carrier: 'C.H. Robinson',
    refId: 'CHR-NA-LTL-25',
    mode: 'Road',
    laneDescription: 'USA Domestic LTL',
    contractType: 'Tiered',
    validFrom: '2025-01-01',
    validTo: '2026-06-30',
    status: 'ACTIVE',
    allocationTarget: 100,
    allocationActual: 100,
    spendYTD: 890000,
    paymentTerms: 'Net 60',
    expiryDays: 215
  },
  {
    id: 'c4',
    carrier: 'Flexport',
    refId: 'FLX-AIR-SPOT-Q4',
    mode: 'Air',
    laneDescription: 'CN-US Urgent (Spot)',
    contractType: 'Spot Framework',
    validFrom: '2025-10-01',
    validTo: '2025-12-31',
    status: 'EXPIRING',
    allocationTarget: 0,
    allocationActual: 15,
    spendYTD: 450000,
    paymentTerms: 'Net 15',
    expiryDays: 35
  },
  {
    id: 'c5',
    carrier: 'Hapag-Lloyd',
    refId: 'HL-LATAM-25',
    mode: 'Ocean',
    laneDescription: 'US East Coast to LATAM',
    contractType: 'Fixed',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    status: 'EXPIRING',
    allocationTarget: 25,
    allocationActual: 28,
    spendYTD: 620000,
    paymentTerms: 'Net 30',
    expiryDays: 35
  },
  {
    id: 'c6',
    carrier: 'DHL Global',
    refId: 'DHL-EU-ROAD-02',
    mode: 'Road',
    laneDescription: 'Intra-Europe FTL',
    contractType: 'Index-Linked',
    validFrom: '2025-06-01',
    validTo: '2027-05-31',
    status: 'ACTIVE',
    allocationTarget: 60,
    allocationActual: 55,
    spendYTD: 1200000,
    paymentTerms: 'Net 45',
    expiryDays: 540
  },
  {
    id: 'c7',
    carrier: 'ONE Network',
    refId: 'ONE-JP-US-26',
    mode: 'Ocean',
    laneDescription: 'Japan to US West Coast',
    contractType: 'Fixed',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    status: 'PENDING',
    allocationTarget: 20,
    allocationActual: 0,
    spendYTD: 0,
    paymentTerms: 'Net 45',
    expiryDays: 765
  }
];

const MOCK_RATE_LINES: RateLine[] = [
  { origin: 'Shanghai (CNSHA)', destination: 'Rotterdam (NLRTM)', equipment: "40' High Cube", currency: 'USD', baseRate: 3250.00, marketRate: 3450.00, transitTime: '28 Days', validity: '2025' },
  { origin: 'Shanghai (CNSHA)', destination: 'Los Angeles (USLAX)', equipment: "40' High Cube", currency: 'USD', baseRate: 1850.00, marketRate: 2100.00, transitTime: '14 Days', validity: '2025' },
  { origin: 'Singapore (SGSIN)', destination: 'Hamburg (DEHAM)', equipment: "20' Standard", currency: 'USD', baseRate: 1450.00, marketRate: 1350.00, transitTime: '24 Days', validity: '2025' },
  { origin: 'Ningbo (CNNGB)', destination: 'New York (USNYC)', equipment: "40' Standard", currency: 'USD', baseRate: 4100.00, marketRate: 4500.00, transitTime: '32 Days', validity: '2025' },
  { origin: 'Qingdao (CNQIN)', destination: 'Savannah (USSAV)', equipment: "40' High Cube", currency: 'USD', baseRate: 3800.00, marketRate: 4100.00, transitTime: '30 Days', validity: '2025' },
];

const MOCK_ACCESSORIALS: Accessorial[] = [
  { code: 'BAF', description: 'Bunker Adjustment Factor', chargeType: 'Per Container', amount: 450.00, currency: 'USD', category: 'Fuel', logic: 'Pass-through' },
  { code: 'LSS', description: 'Low Sulphur Surcharge', chargeType: 'Per Container', amount: 150.00, currency: 'USD', category: 'Fuel', logic: 'Fixed' },
  { code: 'ISPS', description: 'Terminal Security Fee', chargeType: 'Per Container', amount: 15.00, currency: 'USD', category: 'Security', logic: 'Fixed' },
  { code: 'THC-D', description: 'Terminal Handling (Dest)', chargeType: 'Per Container', amount: 380.00, currency: 'EUR', category: 'Handling', logic: 'Pass-through' },
  { code: 'PSS', description: 'Peak Season Surcharge', chargeType: 'Per Container', amount: 500.00, currency: 'USD', category: 'Seasonal', logic: 'Fixed' },
];

const BENCHMARK_DATA = [
  { month: 'Jan', contract: 3250, market: 3100, spot: 3600 },
  { month: 'Feb', contract: 3250, market: 3300, spot: 3800 },
  { month: 'Mar', contract: 3250, market: 3450, spot: 4100 },
  { month: 'Apr', contract: 3250, market: 3400, spot: 3900 },
  { month: 'May', contract: 3350, market: 3200, spot: 3500 }, // GRI applied
  { month: 'Jun', contract: 3350, market: 3100, spot: 3400 },
];

export const RateCards: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  // Rate Calculator State
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcOrigin, setCalcOrigin] = useState('');
  const [calcDest, setCalcDest] = useState('');
  const [calcResult, setCalcResult] = useState<RateLine | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Import State
  const [showImport, setShowImport] = useState(false);
  const [importStep, setImportStep] = useState(0);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // --- ACTIONS ---

  const handleCalculate = () => {
    if (!calcOrigin || !calcDest) return;
    setIsCalculating(true);
    // Simulate Search
    setTimeout(() => {
       const found = MOCK_RATE_LINES.find(l => 
          l.origin.toLowerCase().includes(calcOrigin.toLowerCase()) && 
          l.destination.toLowerCase().includes(calcDest.toLowerCase())
       );
       setCalcResult(found || null);
       setIsCalculating(false);
    }, 1200);
  };

  const handleImport = () => {
    let step = 0;
    const interval = setInterval(() => {
       step++;
       setImportStep(step);
       if (step >= 3) {
          clearInterval(interval);
          setTimeout(() => {
             setShowImport(false);
             setImportStep(0);
             // Add dummy contract to UI
             const newC: Contract = {
                id: `new-${Date.now()}`,
                carrier: 'CMA CGM',
                refId: 'CMA-NEW-2026',
                mode: 'Ocean',
                laneDescription: 'Global Import',
                contractType: 'Fixed',
                validFrom: '2026-01-01',
                validTo: '2026-12-31',
                status: 'ACTIVE',
                allocationTarget: 15,
                allocationActual: 0,
                spendYTD: 0,
                paymentTerms: 'Net 30',
                expiryDays: 365
             };
             setContracts([newC, ...contracts]);
          }, 1000);
       }
    }, 1500);
  };

  const updateContract = (updated: Contract) => {
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedContract(updated);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Ocean': return <Ship size={14} className="text-blue-600" />;
      case 'Air': return <Plane size={14} className="text-sky-600" />;
      case 'Road': return <Truck size={14} className="text-orange-600" />;
      default: return <Box size={14} className="text-gray-500" />;
    }
  };

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case 'Fixed': return <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">FIXED</span>;
      case 'Index-Linked': return <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">INDEX</span>;
      case 'Spot Framework': return <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">SPOT FW</span>;
      case 'Tiered': return <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">TIERED</span>;
      default: return null;
    }
  };

  // --- FILTER LOGIC ---
  const filteredContracts = contracts.filter(c => {
     if (!searchQuery) return true;
     const query = searchQuery.toLowerCase();
     return c.carrier.toLowerCase().includes(query) || 
            c.refId.toLowerCase().includes(query) || 
            c.laneDescription.toLowerCase().includes(query);
  });

  // --- RENDER DETAIL VIEW ---
  if (selectedContract) {
    return <ContractDetail contract={selectedContract} onBack={() => setSelectedContract(null)} onUpdate={updateContract} />;
  }

  // --- RENDER LIST VIEW ---
  return (
    <div className="h-full flex flex-col font-sans bg-[#F3F4F6] overflow-hidden relative">
      
      {/* 1. Header & KPIs */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0 shadow-sm z-10">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                  Rate Management
                  <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-[#004D40] text-white uppercase tracking-wider">
                     Operations
                  </span>
               </h2>
               <p className="text-sm text-gray-500 mt-1">Centralized repository for negotiated rates, tariffs, and accessorials.</p>
            </div>
            <div className="flex space-x-3">
               <button 
                  onClick={() => setCalcOpen(!calcOpen)}
                  className={`flex items-center px-4 py-2 border rounded-sm text-xs font-bold uppercase transition-colors ${calcOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
               >
                  <Calculator size={14} className="mr-2" /> Rate Search
               </button>
               <button 
                  onClick={() => setShowImport(true)}
                  className="flex items-center px-4 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-sm"
               >
                  <Cloud size={14} className="mr-2" /> Import Rates
               </button>
            </div>
         </div>

         {/* KPIs */}
         <div className="grid grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Contracts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{contracts.filter(c => c.status === 'ACTIVE').length}</p>
               </div>
               <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                  <FileText size={20} />
               </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Expiring (30 Days)</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{contracts.filter(c => c.status === 'EXPIRING').length}</p>
               </div>
               <div className="w-10 h-10 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center">
                  <Clock size={20} />
               </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Lanes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">1,245</p>
               </div>
               <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                  <Globe size={20} />
               </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contract Spend (YTD)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">$12.4M</p>
               </div>
               <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                  <DollarSign size={20} />
               </div>
            </div>
         </div>
         
         {/* Rate Calculator Widget (Collapsible) */}
         {calcOpen && (
            <div className="mt-6 p-6 bg-white border border-blue-100 shadow-lg rounded-sm animate-fade-in-up relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                        <Search size={16} className="mr-2 text-blue-600" /> Spot Quote Engine
                     </h3>
                     <p className="text-xs text-gray-500 mt-1">Search across all 12 active contracts for the best valid rate.</p>
                  </div>
                  <button onClick={() => setCalcOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
               </div>
               
               <div className="flex items-end space-x-4">
                  <div className="flex-1">
                     <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Origin (City/Port)</label>
                     <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input 
                           type="text" 
                           placeholder="e.g. Shanghai" 
                           value={calcOrigin}
                           onChange={(e) => setCalcOrigin(e.target.value)}
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-blue-500 focus:outline-none"
                        />
                     </div>
                  </div>
                  <div className="flex-1">
                     <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Destination (City/Port)</label>
                     <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input 
                           type="text" 
                           placeholder="e.g. Rotterdam" 
                           value={calcDest}
                           onChange={(e) => setCalcDest(e.target.value)}
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-blue-500 focus:outline-none"
                        />
                     </div>
                  </div>
                  <div className="w-48">
                     <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Mode</label>
                     <select className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white">
                        <option>Ocean (FCL)</option>
                        <option>Air Freight</option>
                        <option>Road (LTL)</option>
                     </select>
                  </div>
                  <button 
                     onClick={handleCalculate}
                     disabled={isCalculating || !calcOrigin || !calcDest}
                     className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-sm hover:bg-blue-700 shadow-sm disabled:opacity-50 min-w-[120px]"
                  >
                     {isCalculating ? 'Searching...' : 'Find Rate'}
                  </button>
               </div>

               {/* Result Area */}
               {calcResult && (
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between animate-fadeIn">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100">
                           <CheckCircle size={24} />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 font-bold uppercase">Best Contract Rate Found</p>
                           <h4 className="text-xl font-bold text-gray-900">{calcResult.origin} <span className="text-gray-400 mx-1">&rarr;</span> {calcResult.destination}</h4>
                           <p className="text-sm text-gray-600 mt-1">Carrier: <span className="font-bold text-teal-700">Maersk Line</span> • Transit: {calcResult.transitTime}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                           {calcResult.baseRate.toLocaleString('en-US', { style: 'currency', currency: calcResult.currency })}
                        </p>
                        <p className="text-xs text-gray-400 uppercase font-bold mt-1">Base Rate (40' HC)</p>
                     </div>
                  </div>
               )}
               {!calcResult && !isCalculating && calcOrigin && calcDest && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500 italic">
                     Click "Find Rate" to search active contracts.
                  </div>
               )}
            </div>
         )}
      </div>

      {/* 2. Main List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
         <div className="flex justify-between items-center mb-4">
            <div className="relative w-80">
               <input 
                  type="text" 
                  placeholder="Filter by Carrier, Lane, or Ref..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-sm text-xs font-medium focus:outline-none focus:border-teal-600"
               />
               <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="text-xs font-bold text-gray-500 hover:text-teal-600 flex items-center">
               <Filter size={14} className="mr-1" /> Advanced Filters
            </button>
         </div>

         <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-bold">
                  <tr>
                     <th className="px-6 py-4">Carrier</th>
                     <th className="px-6 py-4">Contract Ref</th>
                     <th className="px-6 py-4">Mode</th>
                     <th className="px-6 py-4">Lane</th>
                     <th className="px-6 py-4">Contract Type</th>
                     <th className="px-6 py-4">Validity</th>
                     <th className="px-6 py-4">Allocation (Comm / Act)</th>
                     <th className="px-6 py-4 text-center">Status</th>
                     <th className="px-6 py-4 text-center">Expiry (Days)</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredContracts.length > 0 ? filteredContracts.map((contract) => (
                     <tr key={contract.id} className="hover:bg-teal-50/20 transition-colors group cursor-pointer" onClick={() => setSelectedContract(contract)}>
                        
                        {/* Carrier */}
                        <td className="px-6 py-4 font-bold text-gray-900">{contract.carrier}</td>
                        
                        {/* Ref */}
                        <td className="px-6 py-4 font-mono text-xs text-blue-600">{contract.refId}</td>
                        
                        {/* Mode */}
                        <td className="px-6 py-4">
                           <div className="flex items-center space-x-2">
                              {getModeIcon(contract.mode)}
                              <span className="text-sm text-gray-700">{contract.mode}</span>
                           </div>
                        </td>

                        {/* Lane */}
                        <td className="px-6 py-4 text-xs text-gray-600 max-w-[150px] truncate" title={contract.laneDescription}>
                           {contract.laneDescription}
                        </td>

                        {/* Contract Type */}
                        <td className="px-6 py-4">
                           {getContractTypeBadge(contract.contractType)}
                        </td>

                        {/* Validity */}
                        <td className="px-6 py-4 text-xs text-gray-600">
                           <div className="flex flex-col">
                              <span>{contract.validFrom}</span>
                              <span className="text-gray-400">to {contract.validTo}</span>
                           </div>
                        </td>

                        {/* Allocation */}
                        <td className="px-6 py-4">
                           <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                              <div 
                                 className={`h-full rounded-full ${contract.allocationActual > contract.allocationTarget ? 'bg-red-500' : 'bg-teal-500'}`} 
                                 style={{ width: `${Math.min(contract.allocationActual, 100)}%` }}
                              ></div>
                           </div>
                           <span className="text-[10px] text-gray-500 font-mono font-bold">
                              {contract.allocationTarget}% / {contract.allocationActual}%
                           </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                           {contract.status === 'ACTIVE' && <span className="px-2 py-1 rounded-sm bg-teal-100 text-teal-700 text-[10px] font-bold border border-teal-200">ACTIVE</span>}
                           {contract.status === 'EXPIRING' && <span className="px-2 py-1 rounded-sm bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-200 flex items-center justify-center"><Clock size={10} className="mr-1"/> EXPIRING</span>}
                           {contract.status === 'PENDING' && <span className="px-2 py-1 rounded-sm bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">PENDING</span>}
                           {contract.status === 'ARCHIVED' && <span className="px-2 py-1 rounded-sm bg-gray-100 text-gray-400 text-[10px] font-bold border border-gray-200">ARCHIVED</span>}
                        </td>

                        {/* Expiry Days */}
                        <td className="px-6 py-4 text-center">
                           {contract.status !== 'ARCHIVED' ? (
                              <span className={`font-mono font-bold text-xs ${contract.expiryDays < 45 ? 'text-red-600' : contract.expiryDays < 90 ? 'text-orange-500' : 'text-green-600'}`}>
                                 {contract.expiryDays}
                              </span>
                           ) : (
                              <span className="text-xs text-gray-400">-</span>
                           )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                           <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-600 inline-block" />
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                           <Filter size={48} className="mx-auto mb-3 opacity-20" />
                           <p className="text-sm font-bold">No contracts match your search.</p>
                           <button onClick={() => setSearchQuery('')} className="text-xs text-teal-600 hover:underline mt-2">Clear Search</button>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* --- IMPORT MODAL --- */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-[#004D40] text-white flex justify-between items-center">
                 <h3 className="text-lg font-bold">Import Rate Sheet</h3>
                 <button onClick={() => setShowImport(false)}><X size={20}/></button>
              </div>
              <div className="p-8">
                 {importStep === 0 && (
                    <div onClick={handleImport} className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                       <Cloud size={40} className="text-teal-600 mb-4" />
                       <p className="font-bold text-gray-700">Drop PDF or Excel here</p>
                       <p className="text-xs text-gray-400 mt-2">Max 50MB</p>
                    </div>
                 )}
                 {importStep > 0 && (
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                             <span>Uploading...</span>
                             <span>100%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                             <div className="h-full bg-teal-600 w-full"></div>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                             <span>AI OCR Extraction...</span>
                             <span>{importStep === 1 ? '45%' : '100%'}</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full bg-blue-600 transition-all duration-1000 ${importStep >= 2 ? 'w-full' : 'w-1/2'}`}></div>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                             <span>Validation Checks...</span>
                             <span>{importStep === 3 ? '100%' : 'Pending'}</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full bg-purple-600 transition-all duration-1000 ${importStep === 3 ? 'w-full' : 'w-0'}`}></div>
                          </div>
                       </div>

                       {importStep === 3 && (
                          <div className="flex items-center justify-center text-green-600 font-bold mt-4 animate-bounce">
                             <CheckCircle size={20} className="mr-2" /> Import Complete!
                          </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// --- SUB-COMPONENT: CONTRACT DETAIL VIEW ---

const ContractDetail: React.FC<{ contract: Contract; onBack: () => void; onUpdate: (c: Contract) => void }> = ({ contract, onBack, onUpdate }) => {
   const [activeTab, setActiveTab] = useState<'rates' | 'accessorials' | 'performance'>('rates');
   const [toast, setToast] = useState<string | null>(null);

   const triggerToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
   };

   const handleAmend = () => {
      triggerToast("Contract unlocked for amendment. Version 1.2 created.");
   };

   const handleTerminate = () => {
      if (window.confirm('Are you sure you want to terminate this contract? This action cannot be undone.')) {
         onUpdate({ ...contract, status: 'ARCHIVED' });
         onBack();
      }
   };

   return (
      <div className="h-full flex flex-col font-sans bg-gray-50 overflow-hidden relative">
         
         {/* Detail Header */}
         <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
               <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                     {contract.carrier}
                     <span className="ml-3 text-lg font-mono text-gray-400 font-normal">#{contract.refId}</span>
                  </h1>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                     <span className="flex items-center"><Truck size={14} className="mr-1" /> {contract.mode}</span>
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                     <span className="flex items-center"><Calendar size={14} className="mr-1" /> Valid: {contract.validFrom} - {contract.validTo}</span>
                     {contract.status === 'EXPIRING' && <span className="text-orange-600 font-bold flex items-center ml-2"><AlertCircle size={14} className="mr-1"/> Expiring Soon</span>}
                     {contract.status === 'ARCHIVED' && <span className="text-gray-500 font-bold flex items-center ml-2 bg-gray-200 px-2 rounded text-xs">ARCHIVED</span>}
                  </div>
               </div>
            </div>

            <div className="flex items-end justify-between">
               <div className="flex space-x-8">
                  {['rates', 'accessorials', 'performance'].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                     >
                        {tab === 'rates' ? 'Rate Sheet' : tab === 'accessorials' ? 'Surcharges' : 'Benchmarking'}
                     </button>
                  ))}
               </div>
               {contract.status !== 'ARCHIVED' && (
                  <div className="flex space-x-3 pb-2">
                     <button 
                        onClick={handleAmend}
                        className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-sm text-xs font-bold uppercase hover:bg-gray-50 shadow-sm"
                     >
                        <Edit2 size={14} className="mr-2"/> Amend
                     </button>
                     <button 
                        onClick={handleTerminate}
                        className="flex items-center px-4 py-2 border border-red-200 bg-white text-red-600 rounded-sm text-xs font-bold uppercase hover:bg-red-50 shadow-sm"
                     >
                        <Trash2 size={14} className="mr-2"/> Terminate
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Content Body */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            
            {/* TAB: RATES */}
            {activeTab === 'rates' && (
               <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Base Rate Table (Ocean)</h3>
                     <div className="flex space-x-2">
                        <button className="text-teal-600 text-xs font-bold hover:underline flex items-center"><Download size={14} className="mr-1"/> Export CSV</button>
                     </div>
                  </div>
                  <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-bold">
                           <tr>
                              <th className="px-6 py-4">Origin</th>
                              <th className="px-6 py-4">Destination</th>
                              <th className="px-6 py-4">Equipment</th>
                              <th className="px-6 py-4 text-right">Base Rate</th>
                              <th className="px-6 py-4 text-right text-gray-400">Market Avg</th>
                              <th className="px-6 py-4">Transit</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {MOCK_RATE_LINES.map((line, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 font-medium text-gray-900">{line.origin}</td>
                                 <td className="px-6 py-4 font-medium text-gray-900">{line.destination}</td>
                                 <td className="px-6 py-4 text-gray-600">{line.equipment}</td>
                                 <td className="px-6 py-4 text-right font-bold text-gray-900">{line.baseRate.toLocaleString('en-US', {style:'currency', currency: line.currency})}</td>
                                 <td className="px-6 py-4 text-right text-xs font-mono text-gray-400">
                                    {line.marketRate.toLocaleString('en-US', {style:'currency', currency: line.currency})}
                                 </td>
                                 <td className="px-6 py-4 text-xs text-gray-500">{line.transitTime}</td>
                                 <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-teal-600"><MoreHorizontal size={16}/></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* TAB: ACCESSORIALS */}
            {activeTab === 'accessorials' && (
               <div className="animate-fade-in-up">
                  <div className="grid grid-cols-3 gap-6">
                     <div className="col-span-2">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Approved Surcharges</h3>
                           </div>
                           <table className="w-full text-sm text-left">
                              <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase font-bold">
                                 <tr>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Logic</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                 {MOCK_ACCESSORIALS.map((acc, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                       <td className="px-6 py-4 font-mono font-bold text-gray-700">{acc.code}</td>
                                       <td className="px-6 py-4 text-gray-800">{acc.description}</td>
                                       <td className="px-6 py-4">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border 
                                             ${acc.category === 'Fuel' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200'}
                                          `}>
                                             {acc.category}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 text-xs text-gray-500 italic">{acc.logic}</td>
                                       <td className="px-6 py-4 text-right font-bold text-gray-900">
                                          {acc.amount.toLocaleString('en-US', {style:'currency', currency: acc.currency})}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                     <div className="col-span-1 space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-sm p-6">
                           <h4 className="font-bold text-blue-900 mb-2 flex items-center"><TrendingUp size={16} className="mr-2"/> GRI Simulator</h4>
                           <p className="text-xs text-blue-700 mb-4">Simulate a General Rate Increase (GRI) across all lines.</p>
                           <div className="flex items-center space-x-2">
                              <input type="number" placeholder="%" className="w-20 border border-blue-200 rounded-sm px-2 py-1 text-sm" />
                              <button className="flex-1 bg-blue-600 text-white text-xs font-bold py-1.5 rounded-sm hover:bg-blue-700 shadow-sm">Simulate Impact</button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* TAB: PERFORMANCE */}
            {activeTab === 'performance' && (
               <div className="animate-fade-in-up space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                     <div className="col-span-2 bg-white border border-gray-200 shadow-sm rounded-sm p-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6">Contract Rate vs Market Spot (Shanghai to Rotterdam)</h3>
                        <div className="h-72 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={BENCHMARK_DATA}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} domain={[3000, 4500]} />
                                 <Tooltip />
                                 <Legend verticalAlign="top" height={36}/>
                                 <Area type="monotone" dataKey="spot" name="Spot Market" fill="#FEE2E2" stroke="#EF4444" strokeWidth={2} />
                                 <Line type="monotone" dataKey="contract" name="Contract Rate" stroke="#004D40" strokeWidth={3} dot={{r: 4}} />
                                 <Line type="monotone" dataKey="market" name="Market Avg" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" />
                              </ComposedChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-6 flex flex-col justify-between">
                        <div>
                           <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Performance Scorecard</h3>
                           <div className="space-y-4">
                              <div>
                                 <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Allocation Adherence</span>
                                    <span className="font-bold text-green-600">98%</span>
                                 </div>
                                 <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                    <div className="bg-green-500 h-full rounded-full w-[98%]"></div>
                                 </div>
                              </div>
                              <div>
                                 <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Tender Acceptance</span>
                                    <span className="font-bold text-teal-600">92%</span>
                                 </div>
                                 <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                    <div className="bg-teal-500 h-full rounded-full w-[92%]"></div>
                                 </div>
                              </div>
                              <div>
                                 <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Invoice Accuracy</span>
                                    <span className="font-bold text-orange-600">84%</span>
                                 </div>
                                 <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                    <div className="bg-orange-500 h-full rounded-full w-[84%]"></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="bg-green-50 p-4 border border-green-100 rounded-sm">
                           <div className="flex items-start gap-2">
                              <TrendingUp size={16} className="text-green-700 mt-0.5" />
                              <div>
                                 <p className="text-xs font-bold text-green-800">Strong Performance</p>
                                 <p className="text-[10px] text-green-700 mt-1">
                                    Contract is performing 12% better than spot market average YTD. Maintain allocation.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* --- TOAST NOTIFICATION --- */}
         {toast && (
            <div className="absolute bottom-6 right-6 px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50 bg-gray-900 text-white">
               <CheckCircle size={16} className="text-green-400 mr-2" />
               <div className="text-xs font-bold">{toast}</div>
            </div>
         )}
      </div>
   );
};