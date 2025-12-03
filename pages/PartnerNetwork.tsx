import React, { useState } from 'react';
import { 
  Search, Plus, Filter, MoreHorizontal, ShieldCheck, AlertTriangle, 
  Globe, Truck, Ship, Plane, X, UploadCloud, FileText, Check, 
  RotateCcw, ChevronRight, Star, Activity, BarChart2, MapPin, 
  Phone, Mail, Calendar, ExternalLink, Zap, Clock, ChevronLeft,
  Award, TrendingUp, AlertCircle, Info, Send, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';

// --- TYPES & INTERFACES ---

type CarrierTier = 'Strategic' | 'Core' | 'Transactional';
type RiskLevel = 'Low' | 'Medium' | 'High';

interface Carrier {
  id: string;
  name: string;
  scac: string;
  mode: string;
  tier: CarrierTier;
  region: string;
  status: 'Active' | 'Onboarding' | 'Suspended';
  integration: {
    type: 'EDI' | 'API' | 'Portal';
    status: 'Healthy' | 'Degraded' | 'Offline';
    lastSync: string;
  };
  performance: {
    otd: number; // On-time Delivery %
    billingAccuracy: number; // %
    score: number; // 0-100
    trend: 'up' | 'down' | 'flat';
  };
  risk: {
    level: RiskLevel;
    factors: string[];
  };
  spendYTD: number;
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
}

// --- MOCK DATA ---

const MOCK_CARRIERS: Carrier[] = [
  {
    id: 'c-001',
    name: 'Maersk Line',
    scac: 'MAEU',
    mode: 'Ocean',
    tier: 'Strategic',
    region: 'Global',
    status: 'Active',
    integration: { type: 'EDI', status: 'Healthy', lastSync: '10 mins ago' },
    performance: { otd: 94, billingAccuracy: 98, score: 96, trend: 'up' },
    risk: { level: 'Low', factors: [] },
    spendYTD: 4500000,
    contact: { name: 'Sarah Jennings', role: 'Global Key Account Mgr', email: 's.jennings@maersk.com', phone: '+45 70 12 34 56' }
  },
  {
    id: 'c-002',
    name: 'K-Line America',
    scac: 'KKLU',
    mode: 'Ocean',
    tier: 'Core',
    region: 'APAC-US',
    status: 'Active',
    integration: { type: 'EDI', status: 'Healthy', lastSync: '45 mins ago' },
    performance: { otd: 88, billingAccuracy: 92, score: 89, trend: 'flat' },
    risk: { level: 'Low', factors: [] },
    spendYTD: 1200000,
    contact: { name: 'Mike Ross', role: 'Regional Sales', email: 'mike.ross@kline.com', phone: '+1 212 555 0199' }
  },
  {
    id: 'c-003',
    name: 'Old Dominion Freight',
    scac: 'ODFL',
    mode: 'Road (LTL)',
    tier: 'Core',
    region: 'North America',
    status: 'Active',
    integration: { type: 'API', status: 'Healthy', lastSync: '2 mins ago' },
    performance: { otd: 97, billingAccuracy: 95, score: 96, trend: 'up' },
    risk: { level: 'Medium', factors: ['Insurance Expiring (15 days)'] },
    spendYTD: 850000,
    contact: { name: 'Jessica Pearson', role: 'Logistics Coordinator', email: 'j.pearson@odfl.com', phone: '+1 336 555 0123' }
  },
  {
    id: 'c-004',
    name: 'Flexport International',
    scac: 'FLEX',
    mode: 'Air/Ocean',
    tier: 'Transactional',
    region: 'Global',
    status: 'Onboarding',
    integration: { type: 'API', status: 'Offline', lastSync: 'Never' },
    performance: { otd: 0, billingAccuracy: 0, score: 0, trend: 'flat' },
    risk: { level: 'High', factors: ['Pending Compliance Docs', 'No Credit Check'] },
    spendYTD: 0,
    contact: { name: 'Onboarding Team', role: 'Support', email: 'onboarding@flexport.com', phone: '--' }
  }
];

const PERFORMANCE_HISTORY = [
  { month: 'Jun', otd: 92, billing: 95 },
  { month: 'Jul', otd: 94, billing: 94 },
  { month: 'Aug', otd: 91, billing: 96 },
  { month: 'Sep', otd: 95, billing: 97 },
  { month: 'Oct', otd: 93, billing: 95 },
  { month: 'Nov', otd: 96, billing: 98 },
];

const LANE_VOLUME = [
  { lane: 'CN-US West', volume: 450, spend: 1200000 },
  { lane: 'CN-EU North', volume: 320, spend: 980000 },
  { lane: 'US-EU West', volume: 150, spend: 450000 },
  { lane: 'Intra-Asia', volume: 80, spend: 120000 },
];

export const PartnerNetwork: React.FC = () => {
  const [carriers, setCarriers] = useState<Carrier[]>(MOCK_CARRIERS);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  
  // Onboarding State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', scac: '' });
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'PERFORMANCE' | 'STRATEGIC' | 'RISK'>('ALL');
  
  const [toast, setToast] = useState<string | null>(null);

  // --- LOGIC ---
  
  const handleKpiClick = (kpi: 'PERFORMANCE' | 'STRATEGIC' | 'RISK') => {
    if (activeKpiFilter === kpi) {
       setActiveKpiFilter('ALL');
    } else {
       setActiveKpiFilter(kpi);
    }
  };

  const filteredCarriers = carriers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.scac.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'All' || c.mode.includes(filterMode);
    
    // KPI Filters
    let matchesKpi = true;
    if (activeKpiFilter === 'STRATEGIC') matchesKpi = c.tier === 'Strategic';
    if (activeKpiFilter === 'RISK') matchesKpi = c.risk.level === 'High' || c.risk.level === 'Medium';
    
    return matchesSearch && matchesMode && matchesKpi;
  }).sort((a, b) => {
    // Sort logic based on KPI
    if (activeKpiFilter === 'PERFORMANCE') {
       return b.performance.score - a.performance.score; // Top performers first
    }
    return 0;
  });

  const getTierBadge = (tier: CarrierTier) => {
    switch (tier) {
      case 'Strategic': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wide flex items-center w-fit"><Award size={10} className="mr-1"/> Strategic</span>;
      case 'Core': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide w-fit">Core</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide w-fit">Transactional</span>;
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Low': return <span className="text-green-600 font-bold text-xs flex items-center"><ShieldCheck size={14} className="mr-1"/> Low Risk</span>;
      case 'Medium': return <span className="text-orange-500 font-bold text-xs flex items-center"><AlertCircle size={14} className="mr-1"/> Medium Risk</span>;
      case 'High': return <span className="text-red-600 font-bold text-xs flex items-center"><AlertTriangle size={14} className="mr-1"/> High Risk</span>;
    }
  };

  const getModeIcon = (mode: string) => {
    if (mode.includes('Ocean')) return <Ship size={16} className="text-blue-600" />;
    if (mode.includes('Road')) return <Truck size={16} className="text-orange-600" />;
    if (mode.includes('Air')) return <Plane size={16} className="text-sky-600" />;
    return <Globe size={16} className="text-gray-600" />;
  };

  const handleSendInvite = () => {
    setInviteStep(2); // Sending
    setTimeout(() => {
       setInviteStep(3); // Done
       setTimeout(() => {
          setShowOnboardModal(false);
          setInviteStep(1);
          setInviteForm({ name: '', email: '', scac: '' });
          setToast(`Invitation sent to ${inviteForm.email}`);
          setTimeout(() => setToast(null), 3000);
       }, 1500);
    }, 1500);
  };

  // --- RENDER DETAIL VIEW ---
  if (selectedCarrier) {
    return <CarrierDetail carrier={selectedCarrier} onBack={() => setSelectedCarrier(null)} />;
  }

  // --- RENDER LIST VIEW ---
  return (
    <div className="h-full flex flex-col font-sans p-8 overflow-hidden bg-[#F3F4F6] relative">
      
      {/* Header & KPIs */}
      <div className="flex justify-between items-start mb-8 flex-shrink-0 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Carrier Master</h2>
          <p className="text-sm text-gray-500 mt-1">Manage performance, compliance, and strategic relationships.</p>
        </div>
        
        <div className="flex space-x-6">
           
           {/* KPI 1: PERFORMANCE */}
           <div 
             onClick={() => handleKpiClick('PERFORMANCE')}
             className={`p-3 rounded-sm border shadow-sm flex items-center space-x-3 cursor-pointer transition-all hover:shadow-md
               ${activeKpiFilter === 'PERFORMANCE' ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'}
             `}
             title="Click to sort list by highest Performance Score (OTD & Billing)"
           >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><Activity size={18} /></div>
              <div>
                 <div className="flex items-center space-x-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Network OTD</p>
                    <Info size={10} className="text-gray-300" />
                 </div>
                 <p className="text-lg font-bold text-gray-900">94.2%</p>
                 {activeKpiFilter === 'PERFORMANCE' && <span className="text-[9px] text-blue-600 font-bold uppercase">Sorting Active</span>}
              </div>
           </div>

           {/* KPI 2: STRATEGIC */}
           <div 
             onClick={() => handleKpiClick('STRATEGIC')}
             className={`p-3 rounded-sm border shadow-sm flex items-center space-x-3 cursor-pointer transition-all hover:shadow-md
               ${activeKpiFilter === 'STRATEGIC' ? 'bg-purple-50 border-purple-400 ring-1 ring-purple-400' : 'bg-white border-gray-200 hover:border-purple-300'}
             `}
             title="Click to filter for Strategic Partners (Key Contracts)"
           >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-full"><Award size={18} /></div>
              <div>
                 <div className="flex items-center space-x-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Strategic Partners</p>
                    <Info size={10} className="text-gray-300" />
                 </div>
                 <p className="text-lg font-bold text-gray-900">8</p>
                 {activeKpiFilter === 'STRATEGIC' && <span className="text-[9px] text-purple-600 font-bold uppercase">Filter Active</span>}
              </div>
           </div>

           {/* KPI 3: RISKS */}
           <div 
             onClick={() => handleKpiClick('RISK')}
             className={`p-3 rounded-sm border shadow-sm flex items-center space-x-3 cursor-pointer transition-all hover:shadow-md
               ${activeKpiFilter === 'RISK' ? 'bg-red-50 border-red-400 ring-1 ring-red-400' : 'bg-white border-gray-200 hover:border-red-300'}
             `}
             title="Click to show carriers with High/Medium compliance or financial risks"
           >
              <div className="p-2 bg-red-50 text-red-600 rounded-full"><AlertTriangle size={18} /></div>
              <div>
                 <div className="flex items-center space-x-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Compliance Risks</p>
                    <Info size={10} className="text-gray-300" />
                 </div>
                 <p className="text-lg font-bold text-red-600">2</p>
                 {activeKpiFilter === 'RISK' && <span className="text-[9px] text-red-600 font-bold uppercase">Filter Active</span>}
              </div>
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
         <div className="relative w-96">
            <input 
               type="text" 
               placeholder="Search Carrier Name, SCAC..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-teal-600 shadow-sm text-sm"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <X size={16} />
               </button>
            )}
         </div>

         <div className="flex space-x-3">
            <div className="flex bg-white border border-gray-300 rounded-sm overflow-hidden shadow-sm">
               {['All', 'Ocean', 'Road', 'Air'].map(m => (
                  <button 
                     key={m}
                     onClick={() => setFilterMode(m)}
                     className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${filterMode === m ? 'bg-teal-50 text-teal-800' : 'text-gray-500 hover:bg-gray-50 border-l border-gray-100 first:border-l-0'}`}
                  >
                     {m}
                  </button>
               ))}
            </div>
            
            <button 
               onClick={() => setShowOnboardModal(true)}
               className="flex items-center px-4 py-2 bg-[#004D40] text-white hover:bg-[#00352C] font-bold text-xs uppercase rounded-sm shadow-sm transition-all active:translate-y-0.5"
            >
               <Plus size={14} className="mr-2" />
               Onboard Partner
            </button>
         </div>
      </div>
      
      {/* Active Filter Indicator */}
      {activeKpiFilter !== 'ALL' && (
         <div className="mb-4 flex items-center bg-gray-100 px-3 py-2 rounded-sm border border-gray-200">
            <Filter size={14} className="text-gray-500 mr-2" />
            <span className="text-xs text-gray-600 mr-2">Active View:</span>
            <span className="text-xs font-bold text-gray-900 uppercase">{activeKpiFilter}</span>
            <button 
               onClick={() => setActiveKpiFilter('ALL')}
               className="ml-auto text-xs text-blue-600 font-bold hover:underline"
            >
               Clear View
            </button>
         </div>
      )}

      {/* Main Grid */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex-1 overflow-auto custom-scrollbar">
         <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-bold sticky top-0 z-10 shadow-sm">
               <tr>
                  <th className="px-6 py-4">Partner Name</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Mode / Region</th>
                  <th className="px-6 py-4">Connectivity</th>
                  <th className="px-6 py-4">Performance Score</th>
                  <th className="px-6 py-4">Risk Profile</th>
                  <th className="px-6 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {filteredCarriers.length > 0 ? filteredCarriers.map(carrier => (
                  <tr 
                     key={carrier.id} 
                     onClick={() => setSelectedCarrier(carrier)}
                     className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                  >
                     <td className="px-6 py-4">
                        <div className="flex items-center">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 border ${carrier.tier === 'Strategic' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {carrier.scac.substring(0, 2)}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">{carrier.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{carrier.scac}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {getTierBadge(carrier.tier)}
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-700 mb-1">
                           {getModeIcon(carrier.mode)}
                           <span className="text-xs font-medium">{carrier.mode}</span>
                        </div>
                        <p className="text-xs text-gray-400">{carrier.region}</p>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                           <span className={`w-2 h-2 rounded-full ${carrier.integration.status === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                           <span className="text-xs font-bold text-gray-700">{carrier.integration.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Sync: {carrier.integration.lastSync}</p>
                     </td>
                     <td className="px-6 py-4">
                        {carrier.status === 'Active' ? (
                           <div className="w-32">
                              <div className="flex justify-between items-end mb-1">
                                 <span className="text-lg font-bold text-gray-900">{carrier.performance.score}</span>
                                 <span className={`text-[10px] font-bold ${carrier.performance.trend === 'up' ? 'text-green-600' : carrier.performance.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                                    {carrier.performance.trend === 'up' ? '▲' : carrier.performance.trend === 'down' ? '▼' : '−'} Trend
                                 </span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${carrier.performance.score >= 90 ? 'bg-green-500' : carrier.performance.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${carrier.performance.score}%` }}
                                 ></div>
                              </div>
                           </div>
                        ) : (
                           <span className="text-xs text-gray-400 italic">No Data (Onboarding)</span>
                        )}
                     </td>
                     <td className="px-6 py-4">
                        {getRiskBadge(carrier.risk.level)}
                        {carrier.risk.factors.length > 0 && (
                           <p className="text-[10px] text-red-600 mt-1 truncate max-w-[140px]">{carrier.risk.factors[0]}</p>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right">
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-600 inline-block" />
                     </td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <Filter size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold">No carriers match the selected filters.</p>
                        <button onClick={() => { setActiveKpiFilter('ALL'); setSearchQuery(''); }} className="text-xs text-blue-600 hover:underline mt-2">Reset Filters</button>
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Onboard Modal */}
      {showOnboardModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-[#004D40] text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">Invite New Partner</h3>
                  <button onClick={() => setShowOnboardModal(false)}><X size={20}/></button>
               </div>
               
               <div className="p-6">
                  {inviteStep === 1 && (
                     <div className="space-y-4">
                        <div>
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Company Name</label>
                           <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" 
                              value={inviteForm.name}
                              onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">SCAC Code</label>
                           <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm uppercase" 
                              placeholder="e.g. MAEU"
                              maxLength={4}
                              value={inviteForm.scac}
                              onChange={(e) => setInviteForm({...inviteForm, scac: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Admin Email</label>
                           <input 
                              type="email" 
                              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" 
                              placeholder="admin@company.com"
                              value={inviteForm.email}
                              onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                           />
                        </div>
                        <div className="pt-4">
                           <button 
                              onClick={handleSendInvite}
                              disabled={!inviteForm.name || !inviteForm.email}
                              className="w-full bg-teal-600 text-white py-2 rounded-sm font-bold text-sm hover:bg-teal-700 disabled:opacity-50"
                           >
                              Send Secure Invitation
                           </button>
                        </div>
                     </div>
                  )}

                  {inviteStep === 2 && (
                     <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-bold text-gray-700">Generating secure link...</p>
                     </div>
                  )}

                  {inviteStep === 3 && (
                     <div className="text-center py-8">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Invitation Sent!</h3>
                        <p className="text-sm text-gray-500 mt-2">
                           An email has been sent to {inviteForm.email} with onboarding instructions.
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

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

// --- SUB-COMPONENT: CARRIER 360 DETAIL ---

const CarrierDetail: React.FC<{ carrier: Carrier; onBack: () => void }> = ({ carrier, onBack }) => {
   const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'compliance' | 'integration'>('overview');
   const [showEmailModal, setShowEmailModal] = useState(false);

   return (
      <div className="h-full flex flex-col font-sans bg-gray-50 overflow-hidden relative">
         {/* Detail Header */}
         <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0 shadow-sm z-10">
            <div className="flex items-start justify-between mb-6">
               <div className="flex items-center space-x-4">
                  <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                     <ChevronLeft size={20} />
                  </button>
                  <div>
                     <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{carrier.name}</h1>
                        <span className="text-sm font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{carrier.scac}</span>
                        {carrier.tier === 'Strategic' && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 uppercase">Strategic Partner</span>}
                     </div>
                     <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center"><Globe size={14} className="mr-1"/> {carrier.region}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center"><Truck size={14} className="mr-1"/> {carrier.mode}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center text-teal-600 font-medium"><Check size={14} className="mr-1"/> Active Contract</span>
                     </div>
                  </div>
               </div>
               <div className="flex space-x-3">
                  <button 
                     onClick={() => setShowEmailModal(true)}
                     className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-sm text-xs font-bold uppercase hover:bg-gray-50 shadow-sm"
                  >
                     <Mail size={14} className="mr-2"/> Contact
                  </button>
                  <button className="flex items-center px-4 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-sm">
                     <Activity size={14} className="mr-2"/> Scorecard
                  </button>
               </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-8 -mb-6">
               {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'performance', label: 'Performance' },
                  { id: 'compliance', label: 'Risk & Compliance' },
                  { id: 'integration', label: 'Integration' },
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        activeTab === tab.id ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-400 hover:text-gray-600'
                     }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Content Body */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
               <div className="grid grid-cols-3 gap-6 animate-fade-in-up">
                  {/* Key Stats */}
                  <div className="col-span-2 grid grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Spend Analysis (YTD)</h3>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-bold text-gray-900">${(carrier.spendYTD / 1000000).toFixed(2)}M</span>
                           <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12% vs LY</span>
                        </div>
                        <div className="h-16 mt-4">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={PERFORMANCE_HISTORY}>
                                 <Area type="monotone" dataKey="billing" stroke="#004D40" fill="#E0F2F1" strokeWidth={2} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Overall Score</h3>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-bold text-gray-900">{carrier.performance.score}/100</span>
                           <span className="text-xs font-bold text-gray-500">Top 5% of Network</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
                           <div className="h-full bg-teal-600 rounded-full" style={{ width: `${carrier.performance.score}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Weighted average of OTD, Billing, & Acceptance.</p>
                     </div>

                     {/* Top Lanes */}
                     <div className="col-span-2 bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Top Active Lanes</h3>
                        <div className="space-y-4">
                           {LANE_VOLUME.map((lane, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm border border-gray-100">
                                 <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white border border-gray-200 rounded-full text-gray-600">
                                       <MapPin size={16}/>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{lane.lane}</span>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{lane.volume} Shipments</p>
                                    <p className="text-xs text-gray-500">${(lane.spend/1000).toFixed(0)}k Spend</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                     <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Account Manager</h3>
                        <div className="flex items-center space-x-3 mb-4">
                           <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                              {carrier.contact.name.split(' ').map(n=>n[0]).join('')}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 text-sm">{carrier.contact.name}</p>
                              <p className="text-xs text-gray-500">{carrier.contact.role}</p>
                           </div>
                        </div>
                        <div className="space-y-2 text-sm">
                           <div className="flex items-center text-gray-600">
                              <Mail size={14} className="mr-2 text-gray-400" /> {carrier.contact.email}
                           </div>
                           <div className="flex items-center text-gray-600">
                              <Phone size={14} className="mr-2 text-gray-400" /> {carrier.contact.phone}
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Contract Status</h3>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-gray-600">Agreement</span>
                           <span className="text-sm font-mono text-blue-600">MSA-2025-001</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-gray-600">Expiry</span>
                           <span className="text-sm font-bold text-gray-900">Dec 31, 2026</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">Payment Terms</span>
                           <span className="text-sm font-bold text-gray-900">Net 45</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* TAB: PERFORMANCE */}
            {activeTab === 'performance' && (
               <div className="space-y-6 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">On-Time Delivery Trend (6 Months)</h3>
                        <div className="h-64">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={PERFORMANCE_HISTORY}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                 <XAxis dataKey="month" tick={{fontSize: 12}} />
                                 <YAxis domain={[80, 100]} tick={{fontSize: 12}} />
                                 <Tooltip />
                                 <Bar dataKey="otd" fill="#0D9488" radius={[4, 4, 0, 0]} name="OTD %" />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Billing Accuracy Trend</h3>
                        <div className="h-64">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={PERFORMANCE_HISTORY}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                 <XAxis dataKey="month" tick={{fontSize: 12}} />
                                 <YAxis domain={[80, 100]} tick={{fontSize: 12}} />
                                 <Tooltip />
                                 <Area type="monotone" dataKey="billing" stroke="#2563EB" fill="#EFF6FF" strokeWidth={3} name="Accuracy %" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* TAB: COMPLIANCE */}
            {activeTab === 'compliance' && (
               <div className="animate-fade-in-up bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                   <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Required Documentation</h3>
                   </div>
                   <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
                         <tr>
                            <th className="px-6 py-3">Document Type</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Expiry Date</th>
                            <th className="px-6 py-3 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         <tr>
                            <td className="px-6 py-4 font-bold text-gray-800">Certificate of Insurance (Liability)</td>
                            <td className="px-6 py-4"><span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">Valid</span></td>
                            <td className="px-6 py-4 text-gray-600">Oct 15, 2026</td>
                            <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:underline text-xs font-bold">View PDF</button></td>
                         </tr>
                         <tr>
                            <td className="px-6 py-4 font-bold text-gray-800">W-9 Tax Form</td>
                            <td className="px-6 py-4"><span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">Valid</span></td>
                            <td className="px-6 py-4 text-gray-600">N/A</td>
                            <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:underline text-xs font-bold">View PDF</button></td>
                         </tr>
                         <tr>
                            <td className="px-6 py-4 font-bold text-gray-800">Hazmat Certification</td>
                            <td className="px-6 py-4"><span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 flex items-center w-fit"><Clock size={12} className="mr-1"/> Expiring Soon</span></td>
                            <td className="px-6 py-4 text-orange-600 font-bold">Dec 01, 2025</td>
                            <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:underline text-xs font-bold">Request Update</button></td>
                         </tr>
                         <tr>
                            <td className="px-6 py-4 font-bold text-gray-800">ISO 9001 Certification</td>
                            <td className="px-6 py-4"><span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">Missing</span></td>
                            <td className="px-6 py-4 text-gray-400">--</td>
                            <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:underline text-xs font-bold">Upload</button></td>
                         </tr>
                      </tbody>
                   </table>
               </div>
            )}
            
            {/* TAB: INTEGRATION */}
            {activeTab === 'integration' && (
               <div className="animate-fade-in-up space-y-6">
                  <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full border border-green-100">
                           <Zap size={24} />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-gray-900">EDI Connection Active</h3>
                           <p className="text-sm text-gray-500">Protocol: ANSI X12 (Versions 4010, 5010)</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">Uptime (30 Days)</p>
                        <p className="text-xl font-bold text-green-600">99.98%</p>
                     </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Transaction Logs (Last 24h)</h3>
                     </div>
                     <div className="p-4 font-mono text-xs space-y-2">
                        <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                           <span>[10:45 AM] 210 Invoice Received</span>
                           <span className="text-green-600 font-bold">SUCCESS</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                           <span>[09:30 AM] 214 Status Update</span>
                           <span className="text-green-600 font-bold">SUCCESS</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                           <span>[08:15 AM] 990 Response to Tender</span>
                           <span className="text-green-600 font-bold">SUCCESS</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                           <span>[04:00 AM] 204 Load Tender Sent</span>
                           <span className="text-blue-600 font-bold">SENT</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

         </div>

         {/* Email Modal */}
         {showEmailModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
               <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-800">Compose Email</h3>
                     <button onClick={() => setShowEmailModal(false)}><X size={18}/></button>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">To</label>
                        <input type="text" value={carrier.contact.email} readOnly className="w-full bg-gray-50 border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-600" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subject</label>
                        <input type="text" placeholder="Regarding: Performance Review" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Message</label>
                        <textarea className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm h-32"></textarea>
                     </div>
                     <div className="flex justify-end pt-2">
                        <button onClick={() => setShowEmailModal(false)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-bold hover:bg-blue-700">
                           <Send size={14} className="mr-2"/> Send Email
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};