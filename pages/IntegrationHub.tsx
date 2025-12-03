
import React, { useState } from 'react';
import { Network, Server, RefreshCw, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Activity, Database, Globe, Key, Lock, Terminal, BarChart2, X, FileText, Mail, UploadCloud, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export const IntegrationHub: React.FC = () => {
  const [sapTestStatus, setSapTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const handleTestConnection = () => {
    setSapTestStatus('testing');
    setTimeout(() => {
      setSapTestStatus('success');
      setTimeout(() => setSapTestStatus('idle'), 5000); // Reset after 5s
    }, 2000);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Updated Data to match the 3 required Ingestion Methods
  const DIGITIZATION_DATA = [
    { name: 'Direct EDI / API', value: 65, color: '#004D40' },
    { name: 'Email Extraction', value: 20, color: '#0F62FE' },
    { name: 'Manual Upload', value: 15, color: '#F59E0B' },
  ];

  const INGESTION_CHANNELS = [
    { 
      id: 'edi', 
      title: 'Direct EDI / API', 
      desc: 'Real-time bidirectional integration.', 
      detail: 'X12 (210/310) & REST API',
      icon: Server, 
      color: 'bg-teal-600', 
      textColor: 'text-teal-600',
      borderColor: 'border-teal-200',
      bgLight: 'bg-teal-50',
      status: 'Active' 
    },
    { 
      id: 'manual', 
      title: 'Manual Upload', 
      desc: 'Service partner portal upload.', 
      detail: 'PDF / Excel / Image',
      icon: UploadCloud, 
      color: 'bg-orange-500', 
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      bgLight: 'bg-orange-50',
      status: 'Active' 
    },
    { 
      id: 'email', 
      title: 'Email Extraction', 
      desc: 'AI ingestion via designated ID.', 
      detail: 'invoices@3scanalytics.ai',
      icon: Mail, 
      color: 'bg-blue-600', 
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      bgLight: 'bg-blue-50',
      status: 'Active' 
    }
  ];

  return (
    <div className="h-full flex flex-col font-sans p-8 overflow-hidden bg-[#F3F4F6] relative">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-shrink-0 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">Integration Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Connectivity status, ingestion channels, and system health.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-sm border border-gray-200 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-700 uppercase">System Status: Healthy</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8">
        
        {/* --- INGESTION CHANNELS OVERVIEW --- */}
        <div>
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
             <Zap size={16} className="mr-2" /> Active Ingestion Channels
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INGESTION_CHANNELS.map((channel) => (
                 <div key={channel.id} className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 rounded-bl-full ${channel.color} -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                    
                    <div className="flex justify-between items-start mb-4 z-10">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${channel.bgLight} ${channel.textColor}`}>
                          <channel.icon size={20} />
                       </div>
                       <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 flex items-center">
                          <CheckCircle size={10} className="mr-1"/> {channel.status}
                       </span>
                    </div>
                    
                    <div className="z-10">
                       <h4 className="text-lg font-bold text-gray-900">{channel.title}</h4>
                       <p className="text-xs text-gray-500 font-medium mt-1">{channel.desc}</p>
                       <div className={`mt-3 pt-3 border-t border-gray-100 text-xs font-mono font-bold ${channel.textColor}`}>
                          {channel.detail}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* --- DIGITIZATION METER --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-6">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                  <Activity size={16} className="mr-2 text-teal-600" />
                  Inbound Volume Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-1">Breakdown by submission method.</p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-gray-400 uppercase">Total Automated</p>
                 <p className="text-3xl font-bold text-teal-600">85%</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-48 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DIGITIZATION_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {DIGITIZATION_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '2px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-gray-400">VOLUME</span>
                 </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                 {DIGITIZATION_DATA.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-sm bg-gray-50">
                       <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-bold text-gray-700">{item.name}</span>
                       </div>
                       <span className="text-sm font-mono font-bold">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* SECTION A: Enterprise Systems */}
        <div>
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
             <Database size={16} className="mr-2" /> Enterprise Systems (ERP/TMS)
           </h3>
           <div className="grid grid-cols-2 gap-6">
              
              {/* SAP CARD */}
              <div className="bg-white border-l-4 border-l-green-500 border-gray-200 border-y border-r rounded-sm shadow-sm p-6 relative">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-14 h-10 flex items-center justify-center">
                          <img 
                            src="https://i.postimg.cc/D0d67chD/Sap-Logo-PNG-Pic.png" 
                            alt="SAP Logo" 
                            className="w-full h-full object-contain"
                          />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-800">SAP S/4HANA Finance</h4>
                          <p className="text-xs text-gray-500">OData / RFC • eccr3</p>
                       </div>
                    </div>
                    <span className="flex items-center text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> ONLINE
                    </span>
                 </div>
                 
                 <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs">
                       <span className="text-gray-500">Endpoint:</span>
                       <span className="font-mono text-gray-700">api.hitachi-energy.sap.com/eccr3</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-gray-500">Last Sync:</span>
                       <span className="font-bold text-gray-700">Today, 10:42 AM</span>
                    </div>
                 </div>

                 <button 
                   onClick={handleTestConnection}
                   disabled={sapTestStatus === 'testing'}
                   className={`w-full py-2 text-xs font-bold uppercase rounded-sm border transition-all flex items-center justify-center ${
                     sapTestStatus === 'success' 
                       ? 'bg-green-600 text-white border-green-600'
                       : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                   }`}
                 >
                   {sapTestStatus === 'testing' && <RefreshCw size={14} className="mr-2 animate-spin" />}
                   {sapTestStatus === 'success' && <CheckCircle size={14} className="mr-2" />}
                   {sapTestStatus === 'idle' ? 'Test Connection' : sapTestStatus === 'testing' ? 'Pinging eccr3...' : 'Connection Successful (45ms)'}
                 </button>
              </div>

              {/* ORACLE CARD */}
              <div className="bg-white border-l-4 border-l-gray-300 border-gray-200 border-y border-r rounded-sm shadow-sm p-6 opacity-90">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-14 h-10 flex items-center justify-center">
                          <img 
                            src="https://i.postimg.cc/hthLYnXs/or262o447-oracle-logo-oracle-logo-for-website.png" 
                            alt="Oracle Logo" 
                            className="w-full h-full object-contain"
                          />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-800">Oracle TMS</h4>
                          <p className="text-xs text-gray-500">Rest API • Legacy</p>
                       </div>
                    </div>
                    <span className="flex items-center text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span> STANDBY
                    </span>
                 </div>
                 <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs">
                       <span className="text-gray-500">Endpoint:</span>
                       <span className="font-mono text-gray-700">tms-gateway.oraclecloud.com</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-gray-500">Auth Type:</span>
                       <span className="font-mono text-gray-700">OAuth 2.0</span>
                    </div>
                 </div>
                 <button 
                    onClick={() => setShowLogsModal(true)}
                    className="w-full py-2 text-xs font-bold uppercase rounded-sm border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                 >
                    <FileText size={14} className="mr-2"/> View Logs
                 </button>
              </div>

           </div>
        </div>

        {/* SECTION B: Connectivity Grid */}
        <div>
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
             <Globe size={16} className="mr-2" /> Carrier Connectivity
           </h3>
           <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                    <tr>
                       <th className="px-6 py-3 font-bold">Connection Method</th>
                       <th className="px-6 py-3 font-bold">Protocol</th>
                       <th className="px-6 py-3 font-bold">Active Partners</th>
                       <th className="px-6 py-3 font-bold">Status</th>
                       <th className="px-6 py-3 font-bold">Volume (24h)</th>
                       <th className="px-6 py-3"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {/* ROW 1: EDI */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow('edi')}>
                       <td className="px-6 py-4 font-bold text-gray-800 flex items-center">
                          <Server size={16} className="mr-2 text-blue-600" /> EDI Gateway
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-gray-600">ANSI X12 (210/310)</td>
                       <td className="px-6 py-4">145</td>
                       <td className="px-6 py-4 text-green-600 font-bold text-xs">HEALTHY</td>
                       <td className="px-6 py-4 font-mono">2,450 Files</td>
                       <td className="px-6 py-4 text-right">
                          {expandedRow === 'edi' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                       </td>
                    </tr>
                    {expandedRow === 'edi' && (
                       <tr className="bg-blue-50/50">
                          <td colSpan={6} className="px-6 py-4">
                             <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="bg-white p-3 border border-blue-100 rounded-sm">
                                   <div className="font-bold text-gray-800">Maersk Line</div>
                                   <div className="text-green-600">Connected (EDI 310)</div>
                                </div>
                                <div className="bg-white p-3 border border-blue-100 rounded-sm">
                                   <div className="font-bold text-gray-800">K-Line America</div>
                                   <div className="text-green-600">Connected (EDI 210)</div>
                                </div>
                                <div className="bg-white p-3 border border-blue-100 rounded-sm">
                                   <div className="font-bold text-gray-800">Old Dominion</div>
                                   <div className="text-green-600">Connected (EDI 210)</div>
                                </div>
                             </div>
                          </td>
                       </tr>
                    )}

                    {/* ROW 2: API */}
                    <tr className="hover:bg-gray-50">
                       <td className="px-6 py-4 font-bold text-gray-800 flex items-center">
                          <Globe size={16} className="mr-2 text-purple-600" /> Carrier API
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-gray-600">REST / JSON</td>
                       <td className="px-6 py-4">42</td>
                       <td className="px-6 py-4 text-green-600 font-bold text-xs">HEALTHY</td>
                       <td className="px-6 py-4 font-mono">850 Calls</td>
                       <td className="px-6 py-4"></td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        {/* SECTION C: Configuration & Logs */}
        <div className="grid grid-cols-3 gap-6">
           {/* CONFIG PANEL */}
           <div className="col-span-2 bg-white border border-gray-200 shadow-sm rounded-sm">
               <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                  <Key size={14} className="mr-2 text-gray-500" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">API Configuration (Inbound)</h3>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Inbound Webhook URL</label>
                     <div className="flex bg-gray-50 border border-gray-200 rounded-sm p-2">
                        <span className="text-teal-700 font-mono text-xs truncate flex-1">https://api.3sc-controltower.com/v2/inbound/invoice</span>
                        <Lock size={12} className="text-gray-400 ml-2" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Client ID</label>
                        <input type="text" value="HITACHI_PROD_001" disabled className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs font-mono text-gray-700" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Auth Method</label>
                        <input type="text" value="OAuth 2.0 (Bearer)" disabled className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs font-mono text-gray-700" />
                     </div>
                  </div>
               </div>
           </div>

           {/* SYSTEM LOGS */}
           <div className="bg-[#1e293b] rounded-sm shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-[#0f172a] border-b border-gray-700 flex items-center">
                 <Terminal size={14} className="mr-2 text-green-400" />
                 <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live System Logs</h3>
              </div>
              <div className="p-4 font-mono text-[10px] space-y-2 flex-1 overflow-y-auto text-gray-300">
                 <div className="flex gap-2">
                    <span className="text-gray-500">10:45:12</span>
                    <span className="text-green-400">[INFO]</span>
                    <span>Inbound Invoice (EDI 210) rx from MAEU</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-500">10:44:05</span>
                    <span className="text-green-400">[INFO]</span>
                    <span>Extracting PDF Data #709114... OK</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-500">10:42:00</span>
                    <span className="text-blue-400">[SYNC]</span>
                    <span>Master Data Sync (SAP ECCR3)... OK</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-500">10:15:30</span>
                    <span className="text-yellow-400">[WARN]</span>
                    <span>API Rate Limit Warning (Oracle TMS)</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-500">10:15:00</span>
                    <span className="text-green-400">[INFO]</span>
                    <span>Payment Batch #2025-11-24 Exported</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
      
      {/* Toast Notification */}
      {sapTestStatus === 'success' && (
        <div className="absolute top-6 right-6 bg-white border-l-4 border-green-500 shadow-xl rounded-sm p-4 animate-slideIn z-50 flex items-center">
           <CheckCircle className="text-green-500 mr-3" size={20} />
           <div>
              <h4 className="font-bold text-gray-800 text-sm">Connection Successful</h4>
              <p className="text-xs text-gray-500">SAP S/4HANA Finance responded in 45ms.</p>
           </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#1e293b] w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden border border-gray-700">
               <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-white font-mono text-sm">Oracle TMS Logs (Last 1 Hour)</h3>
                  <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-white"><X size={18}/></button>
               </div>
               <div className="p-4 h-96 overflow-auto font-mono text-xs text-green-400 bg-black/50">
                  <p className="mb-1"><span className="text-gray-500">[10:00:01]</span> GET /shipments/v2?status=active 200 OK</p>
                  <p className="mb-1"><span className="text-gray-500">[10:00:05]</span> Payload: {'{ "count": 45, "region": "NA" }'}</p>
                  <p className="mb-1 text-yellow-400"><span className="text-gray-500">[10:02:12]</span> WARN: Latency spike detected on gateway-04</p>
                  <p className="mb-1"><span className="text-gray-500">[10:05:00]</span> POST /rates/lookup 201 Created</p>
                  <p className="mb-1"><span className="text-gray-500">[10:05:01]</span> Processing rate match for INV-9921...</p>
                  <p className="mb-1"><span className="text-gray-500">[10:05:02]</span> Rate Match: SUCCESS (Variance 0.00)</p>
                  <p className="mb-1 text-red-400"><span className="text-gray-500">[10:15:22]</span> ERROR: Connection timeout to Oracle OTM (Retrying...)</p>
                  <p className="mb-1"><span className="text-gray-500">[10:15:25]</span> Retry 1/3... Connected.</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
