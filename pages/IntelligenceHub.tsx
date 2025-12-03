
import React, { useState, useEffect } from 'react';
import { 
  Download, Calendar, DollarSign, ShieldCheck, 
  TrendingUp, TrendingDown, Filter, PieChart as PieIcon,
  Layers, ArrowUpRight, ArrowDownRight, Printer, Share2,
  Lightbulb, AlertCircle, Target, Activity, X, CheckCircle,
  Truck, Search, MapPin, ArrowRight, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- MOCK DATA DATASETS ---

// SPEND DATA VARIATIONS
const SPEND_DATA_YTD = [
  { month: 'Jan', budget: 1200000, actual: 1150000, forecast: 1180000 },
  { month: 'Feb', budget: 1200000, actual: 1250000, forecast: 1200000 },
  { month: 'Mar', budget: 1200000, actual: 1180000, forecast: 1190000 },
  { month: 'Apr', budget: 1350000, actual: 1420000, forecast: 1380000 },
  { month: 'May', budget: 1350000, actual: 1300000, forecast: 1320000 },
  { month: 'Jun', budget: 1350000, actual: 1390000, forecast: 1350000 },
  { month: 'Jul', budget: 1400000, actual: 1450000, forecast: 1410000 },
  { month: 'Aug', budget: 1400000, actual: 1380000, forecast: 1400000 },
  { month: 'Sep', budget: 1500000, actual: null, forecast: 1550000 },
  { month: 'Oct', budget: 1500000, actual: null, forecast: 1600000 },
];

const SPEND_DATA_QTD = [
  { month: 'Oct', budget: 1500000, actual: 1480000, forecast: 1500000 },
  { month: 'Nov', budget: 1550000, actual: 1600000, forecast: 1550000 },
  { month: 'Dec', budget: 1600000, actual: null, forecast: 1650000 },
];

const SPEND_DATA_30D = [
  { month: 'Week 1', budget: 350000, actual: 340000, forecast: 350000 },
  { month: 'Week 2', budget: 350000, actual: 380000, forecast: 350000 },
  { month: 'Week 3', budget: 350000, actual: 345000, forecast: 350000 },
  { month: 'Week 4', budget: 350000, actual: null, forecast: 360000 },
];

const MODE_SPLIT_DATA = [
  { name: 'Ocean FCL', value: 45, color: '#004D40' },
  { name: 'Air Freight', value: 25, color: '#0F62FE' },
  { name: 'Road (FTL)', value: 20, color: '#F59E0B' },
  { name: 'LTL/Parcel', value: 10, color: '#6B7280' },
];

const ACCESSORIAL_IMPACT = [
  { name: 'Fuel (FSC)', amount: 125000 },
  { name: 'Detention/Demurrage', amount: 45000 },
  { name: 'GRI', amount: 32000 },
  { name: 'Chassis Split', amount: 18000 },
  { name: 'Waiting Time', amount: 12000 },
];

const SAVINGS_DATA = [
  { category: 'Rate Errors', amount: 142000, count: 85 },
  { category: 'Duplicate Inv', amount: 89000, count: 12 },
  { category: 'Weight/Dim', amount: 45000, count: 145 },
  { category: 'Currency Adj', amount: 22000, count: 65 },
  { category: 'Accessorials', amount: 154000, count: 210 },
];

const AUDIT_RECOVERY_TREND = [
  { month: 'Q1', identified: 120000, recovered: 95000 },
  { month: 'Q2', identified: 150000, recovered: 135000 },
  { month: 'Q3', identified: 90000, recovered: 85000 },
  { month: 'Q4', identified: 180000, recovered: 160000 },
];

const COST_TO_SERVE_DATA = [
  { lane: 'CN-US East', cpu: 1450, benchmark: 1380 },
  { lane: 'CN-EU North', cpu: 980, benchmark: 1050 }, // Good
  { lane: 'US-EU West', cpu: 1100, benchmark: 1100 },
  { lane: 'IN-US West', cpu: 2100, benchmark: 1850 }, // Bad
];

// CARRIER SCORECARD DATA (Quadrant Analysis)
// x: Cost Variance (Lower is better, left side)
// y: Performance Score (Higher is better, top side)
// z: Volume (Bubble size)
const CARRIER_SCATTER_DATA = [
  { name: 'Maersk', x: 2, y: 95, z: 4000, fill: '#004D40' }, // High Perf, Low Cost (Strategic)
  { name: 'K-Line', x: 5, y: 88, z: 1200, fill: '#0F62FE' }, // Good Perf, Mid Cost
  { name: 'MSC', x: -2, y: 82, z: 3000, fill: '#004D40' }, // Good Perf, Low Cost
  { name: 'Hapag', x: 8, y: 90, z: 2500, fill: '#F59E0B' }, // High Perf, High Cost
  { name: 'ONE', x: 4, y: 75, z: 1500, fill: '#6B7280' }, // Mid Perf, Mid Cost
  { name: 'Evergreen', x: 12, y: 65, z: 800, fill: '#EF4444' }, // Low Perf, High Cost (Risk)
  { name: 'ZIM', x: 1, y: 78, z: 1100, fill: '#6B7280' },
];

export const IntelligenceHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'spend' | 'audit' | 'cts' | 'carrier'>('spend');
  const [timeRange, setTimeRange] = useState<'YTD' | 'QTD' | '30D'>('YTD');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Derived Data based on TimeRange
  const getSpendData = () => {
    switch (timeRange) {
      case 'QTD': return SPEND_DATA_QTD;
      case '30D': return SPEND_DATA_30D;
      default: return SPEND_DATA_YTD;
    }
  };

  const handleTimeRangeChange = (range: 'YTD' | 'QTD' | '30D') => {
    setIsLoadingData(true);
    setTimeRange(range);
    setTimeout(() => setIsLoadingData(false), 600); // Simulate data fetch
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3000);
    }, 1500);
  };

  // Helper for formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- SUB-COMPONENTS ---

  const KPICard = ({ label, value, subtext, trend, color, icon: Icon }: any) => (
    <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
       <div className={`absolute right-0 top-0 w-24 h-24 ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
       <div className="flex justify-between items-start relative z-10 mb-2">
         <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
         <Icon size={18} className="text-gray-400 group-hover:text-gray-600" />
       </div>
       <div className="flex items-end justify-between relative z-10">
          <h3 className="text-3xl font-bold text-gray-900">{isLoadingData ? '...' : value}</h3>
          <div className="text-right">
             <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
               {trend === 'up' ? <ArrowUpRight size={12} className="mr-0.5"/> : <ArrowDownRight size={12} className="mr-0.5"/>} {subtext}
             </span>
          </div>
       </div>
    </div>
  );

  const renderExecutiveSummary = () => (
    <div className="grid grid-cols-4 gap-6 mb-8 animate-fade-in-up">
      <KPICard 
        label="Total Spend" 
        value={timeRange === 'YTD' ? "$10.98M" : timeRange === 'QTD' ? "$3.2M" : "$980k"}
        subtext={timeRange === 'YTD' ? "2.4% vs Bud" : "1.1% vs Bud"}
        trend="up"
        color="bg-teal-500"
        icon={DollarSign}
      />
      <KPICard 
        label="Audit Recovery" 
        value={timeRange === 'YTD' ? "$452.1k" : timeRange === 'QTD' ? "$125k" : "$42k"}
        subtext="12% Rate"
        trend="up" // Good trend (up means more savings)
        color="bg-blue-500"
        icon={ShieldCheck}
      />
      <KPICard 
        label="Cost Per Unit" 
        value="$124.50"
        subtext="1.8% vs LY"
        trend="down" // Good trend (down cost)
        color="bg-orange-500"
        icon={Target}
      />
      <KPICard 
        label="Active Disputes" 
        value="14"
        subtext="$85.2k Risk"
        trend="up" // Bad trend (more disputes)
        color="bg-gray-500"
        icon={AlertCircle}
      />
    </div>
  );

  const renderSpendDashboard = () => (
    <div className="space-y-6 animate-fade-in-up">
       {/* Row 1: Main Trend & Mode Split */}
       <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm p-6 relative min-w-0 min-h-0">
             {isLoadingData && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
             )}
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Global Spend vs Budget ({timeRange})</h3>
                   <p className="text-xs text-gray-500">Accruals vs Forecast</p>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                   <span className="flex items-center"><div className="w-2 h-2 bg-teal-600 rounded-full mr-2"></div> Actual</span>
                   <span className="flex items-center"><div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div> Budget</span>
                   <span className="flex items-center"><div className="w-2 h-2 bg-teal-600/30 rounded-full mr-2 border border-teal-600"></div> Forecast</span>
                </div>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={getSpendData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '2px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="actual" barSize={30} fill="#004D40" radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="budget" stroke="#9CA3AF" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      <Bar dataKey="forecast" barSize={30} fill="#004D40" fillOpacity={0.3} radius={[2, 2, 0, 0]} stroke="#004D40" strokeDasharray="3 3" />
                   </ComposedChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 flex flex-col min-w-0 min-h-0">
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Spend by Mode</h3>
             <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                         data={MODE_SPLIT_DATA}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                      >
                         {MODE_SPLIT_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                   </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                   <div className="text-center">
                      <span className="text-2xl font-bold text-gray-800">45%</span>
                      <p className="text-xs text-gray-500 uppercase font-bold">Ocean</p>
                   </div>
                </div>
             </div>
             {/* Textual Insight */}
             <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-sm flex items-start gap-3">
                <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                   <strong>Insight:</strong> Air freight spend is 5% higher than projected due to urgent "Red Sea" diversions in Feb/Mar.
                </p>
             </div>
          </div>
       </div>

       {/* Row 2: Leakage Analysis */}
       <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Accessorial & Surcharge Impact</h3>
                <p className="text-xs text-gray-500">Unplanned spend leakage beyond base freight.</p>
             </div>
             <button className="text-teal-600 text-xs font-bold hover:underline flex items-center">
                View Detailed Report <ArrowRight size={12} className="ml-1"/>
             </button>
          </div>
          <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ACCESSORIAL_IMPACT} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                   <XAxis type="number" hide />
                   <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
                   <Bar dataKey="amount" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );

  const renderAuditDashboard = () => (
     <div className="space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-2 gap-6">
           {/* Savings by Category */}
           <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-6">Savings by Dispute Category</h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SAVINGS_DATA}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="category" tick={{fontSize: 11}} interval={0} />
                       <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                       <Tooltip formatter={(value: any) => formatCurrency(value)} />
                       <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Recovery Trend */}
           <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-6">Identified vs Recovered</h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={AUDIT_RECOVERY_TREND}>
                       <defs>
                          <linearGradient id="colorIdentified" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="month" />
                       <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                       <Tooltip formatter={(value: any) => formatCurrency(value)} />
                       <Area type="monotone" dataKey="identified" stackId="1" stroke="#6366F1" fill="url(#colorIdentified)" />
                       <Area type="monotone" dataKey="recovered" stackId="2" stroke="#10B981" fill="#10B981" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Audit Efficiency Stats */}
        <div className="grid grid-cols-3 gap-6">
           <div className="bg-teal-50 border border-teal-100 p-6 rounded-sm">
              <div className="flex items-center mb-2">
                 <ShieldCheck size={20} className="text-teal-600 mr-2" />
                 <h4 className="font-bold text-teal-800">First Pass Yield</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">85.4%</p>
              <p className="text-xs text-teal-600 mt-1">Touchless invoices requiring no manual intervention.</p>
           </div>
           
           <div className="bg-white border border-gray-200 p-6 rounded-sm">
              <div className="flex items-center mb-2">
                 <Activity size={20} className="text-orange-500 mr-2" />
                 <h4 className="font-bold text-gray-800">Duplicate Prevention</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">$89,000</p>
              <p className="text-xs text-gray-500 mt-1">Saved from 12 duplicate invoices blocked.</p>
           </div>

           <div className="bg-white border border-gray-200 p-6 rounded-sm">
              <div className="flex items-center mb-2">
                 <Target size={20} className="text-blue-500 mr-2" />
                 <h4 className="font-bold text-gray-800">Auto-Approval Rate</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">62%</p>
              <p className="text-xs text-gray-500 mt-1">Target: 75% by Q4.</p>
           </div>
        </div>
     </div>
  );

  const renderCostToServe = () => (
     <div className="space-y-6 animate-fade-in-up">
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Cost Per TEU vs Benchmark</h3>
              <div className="flex items-center space-x-2 text-xs">
                 <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 mr-2"></div> Our Cost</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-gray-300 mr-2"></div> Market Benchmark</div>
              </div>
           </div>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={COST_TO_SERVE_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                    <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                    <YAxis dataKey="lane" type="category" width={100} tick={{fontSize: 12, fontWeight: 'bold'}} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Bar dataKey="cpu" fill="#2563EB" barSize={12} />
                    <Bar dataKey="benchmark" fill="#E5E7EB" barSize={12} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-sm flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                 <h4 className="text-sm font-bold text-red-800">High Cost Alert: IN-US West</h4>
                 <p className="text-xs text-red-700 mt-1">
                    Current CPU ($2,100) is 13.5% above market benchmark ($1,850). Recommended action: Renegotiate detention terms or switch to Maersk Spot.
                 </p>
              </div>
           </div>
        </div>
     </div>
  );

  const renderCarrierScorecard = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-3 gap-6">
        {/* KPI Cards for Carriers */}
        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Network OTD</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">94.2%</p>
            <p className="text-[10px] text-green-600 font-bold">▲ 1.2% vs Last Month</p>
          </div>
          <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
            <Truck size={20} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Billing Accuracy</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">98.5%</p>
            <p className="text-[10px] text-gray-400 font-bold">− Stable</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Tender Acceptance</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">88.0%</p>
            <p className="text-[10px] text-red-500 font-bold">▼ 2.1% Capacity Constraint</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main Quadrant Chart */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm p-6 min-w-0 min-h-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Performance vs. Cost Matrix</h3>
              <p className="text-xs text-gray-500">Bubble size indicates total volume.</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#004D40] mr-1"></span> Strategic</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EF4444] mr-1"></span> At Risk</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#F59E0B] mr-1"></span> High Cost</div>
            </div>
          </div>
          <div className="h-80 w-full relative">
            {/* Background Quadrants */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
               <div className="border-r border-b border-gray-100 bg-red-50/20 p-2"><span className="text-[9px] text-red-300 font-bold uppercase">Low Perf / Low Cost</span></div>
               <div className="border-b border-gray-100 bg-blue-50/20 p-2 text-right"><span className="text-[9px] text-blue-300 font-bold uppercase">Low Perf / High Cost</span></div>
               <div className="border-r border-gray-100 bg-green-50/20 p-2 flex items-end"><span className="text-[9px] text-green-300 font-bold uppercase">High Perf / Low Cost</span></div>
               <div className="bg-yellow-50/20 p-2 flex items-end justify-end"><span className="text-[9px] text-yellow-300 font-bold uppercase">High Perf / High Cost</span></div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Cost Variance (%)" unit="%" domain={[-5, 15]} label={{ value: 'Cost Variance (Lower is Better)', position: 'bottom', fontSize: 10 }} tick={{fontSize: 10}} />
                <YAxis type="number" dataKey="y" name="Performance Score" unit="" domain={[50, 100]} label={{ value: 'Performance Score (Higher is Better)', angle: -90, position: 'left', fontSize: 10 }} tick={{fontSize: 10}} />
                <ZAxis type="number" dataKey="z" range={[100, 600]} name="Volume" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-gray-200 shadow-lg text-xs rounded-sm">
                        <p className="font-bold mb-1">{data.name}</p>
                        <p>Score: {data.y}</p>
                        <p>Cost Var: {data.x > 0 ? '+' : ''}{data.x}%</p>
                        <p>Vol: {data.z} TEU</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter name="Carriers" data={CARRIER_SCATTER_DATA} fill="#8884d8">
                   {CARRIER_SCATTER_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                   ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top/Bottom List */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-0 flex flex-col">
          <div className="p-4 border-b border-gray-100">
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Rankings</h3>
          </div>
          <div className="flex-1 overflow-auto">
             <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                   <tr>
                      <th className="px-4 py-2">Carrier</th>
                      <th className="px-4 py-2 text-right">Score</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {CARRIER_SCATTER_DATA.sort((a,b) => b.y - a.y).slice(0, 5).map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                         <td className="px-4 py-3 flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${c.y >= 90 ? 'bg-green-500' : c.y >= 80 ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                            <span className="font-bold text-gray-800">{c.name}</span>
                         </td>
                         <td className="px-4 py-3 text-right font-mono">{c.y}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
             <button className="w-full py-2 bg-white border border-gray-300 rounded-sm text-xs font-bold uppercase hover:bg-gray-100 text-gray-600">
                View Full List
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans bg-[#F3F4F6] overflow-hidden relative">
      
      {/* 1. Header Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-5 shadow-sm z-20">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                  Financial Intelligence
                  <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white uppercase tracking-wider">PRO</span>
               </h2>
               <p className="text-sm text-gray-500 mt-1">Analytics, budgeting, and cost-to-serve optimization.</p>
            </div>
            
            <div className="flex items-center space-x-3">
               {/* Time Range Controls */}
               <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded border border-gray-200">
                  <button 
                     onClick={() => handleTimeRangeChange('YTD')} 
                     className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all ${timeRange === 'YTD' ? 'bg-white shadow-sm text-teal-800 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     YTD
                  </button>
                  <button 
                     onClick={() => handleTimeRangeChange('QTD')} 
                     className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all ${timeRange === 'QTD' ? 'bg-white shadow-sm text-teal-800 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     QTD
                  </button>
                  <button 
                     onClick={() => handleTimeRangeChange('30D')} 
                     className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all ${timeRange === '30D' ? 'bg-white shadow-sm text-teal-800 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     30 Days
                  </button>
               </div>
               
               <div className="h-8 w-px bg-gray-300"></div>

               {/* Action Buttons */}
               <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 border rounded-sm text-xs font-bold uppercase shadow-sm transition-colors ${showFilters ? 'bg-gray-100 border-gray-400 text-gray-900' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}
               >
                  <Filter size={14} className="mr-2" /> Filters
               </button>
               <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center px-4 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-sm transition-colors disabled:opacity-70"
               >
                  {isExporting ? <span className="animate-spin mr-2">⟳</span> : <Download size={14} className="mr-2" />}
                  {isExporting ? 'Generating...' : 'Report'}
               </button>
            </div>
         </div>

         {/* Collapsible Filter Panel */}
         {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm grid grid-cols-4 gap-4 animate-fade-in-up">
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Region</label>
                  <select className="w-full text-xs border border-gray-300 rounded-sm p-2 bg-white"><option>All Regions</option><option>North America</option><option>EMEA</option><option>APAC</option></select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Business Unit</label>
                  <select className="w-full text-xs border border-gray-300 rounded-sm p-2 bg-white"><option>All Units</option><option>Power Grids</option><option>Transformers</option></select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Mode</label>
                  <select className="w-full text-xs border border-gray-300 rounded-sm p-2 bg-white"><option>All Modes</option><option>Ocean</option><option>Air</option><option>Road</option></select>
               </div>
               <div className="flex items-end">
                  <button 
                     onClick={() => setShowFilters(false)}
                     className="w-full py-2 bg-teal-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-teal-700"
                  >
                     Apply Filters
                  </button>
               </div>
            </div>
         )}

         {/* Navigation Tabs */}
         <div className="flex space-x-8 mt-6 -mb-5 overflow-x-auto">
            {[
               { id: 'spend', label: 'Global Freight Spend', icon: DollarSign },
               { id: 'audit', label: 'Audit & Recovery', icon: ShieldCheck },
               { id: 'cts', label: 'Cost-to-Serve', icon: Layers },
               { id: 'carrier', label: 'Carrier Scorecard', icon: Activity }
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                     activeView === tab.id 
                        ? 'border-teal-600 text-teal-800' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
               >
                  <tab.icon size={16} className={`mr-2 ${activeView === tab.id ? 'text-teal-600' : 'text-gray-400'}`} />
                  {tab.label}
               </button>
            ))}
         </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
         {/* Common Executive Summary */}
         {renderExecutiveSummary()}

         {/* Dynamic Content */}
         {activeView === 'spend' && renderSpendDashboard()}
         {activeView === 'audit' && renderAuditDashboard()}
         {activeView === 'cts' && renderCostToServe()}
         {activeView === 'carrier' && renderCarrierScorecard()}
      </div>

      {/* Toast Notification */}
      {showExportToast && (
         <div className="absolute bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50">
            <CheckCircle className="text-green-400 mr-2" size={16} />
            <div className="text-xs font-bold">Report downloaded successfully.</div>
         </div>
      )}

    </div>
  );
};
