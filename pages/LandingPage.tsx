
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Building2, Radar, Ship, ArrowRight, Leaf, Activity, Server, Globe, Database } from 'lucide-react';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Universal Adapter Animation State
  const [adapterIndex, setAdapterIndex] = useState(0);
  const adapterStates = [
    'Multi-ERP Gateway',
    'SAP S/4 Connected',
    'Oracle Ready',
    'Universal Adapter'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAdapterIndex((prev) => (prev + 1) % adapterStates.length);
    }, 3000); // Cycle every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    // CRITICAL: Vendors do not use SSO. They go straight to the Login Gate.
    if (role === 'VENDOR') {
      onLogin(role);
      return; 
    }

    setLoadingRole(role);
    setLoadingStep(1); // Authenticating
    
    // Sequence for Internal Users (SSO Simulation)
    setTimeout(() => setLoadingStep(2), 600);  // Connecting SAP (Faster)
    setTimeout(() => setLoadingStep(3), 1200); // Loading Cockpit (Faster)
    setTimeout(() => onLogin(role), 1500);     // Done (Snappy)
  };

  const getLoadingText = () => {
    if (loadingStep === 1) return `Authenticating via ${loadingRole === 'HITACHI' ? 'Hitachi SSO' : 'Secure Gateway'}...`;
    if (loadingStep === 2) return "Handshake with SAP S/4HANA Finance...";
    if (loadingStep === 3) return "Initializing Control Tower...";
    return "Processing...";
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col relative overflow-hidden font-ibm-sans text-black">
      
      {/* 1. BACKGROUND: AESTHETIC STEEL GLOBE (Subtle Architectural Style) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-white to-slate-100">
         {/* Sharp Technical Grid Overlay - Very Faint */}
         <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
               backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
            }}
         ></div>

         {/* The Refined Steel Globe */}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[160vh] h-[160vh] opacity-100">
            <svg viewBox="0 0 800 800" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
               <defs>
                  {/* Subtle Inner Volume */}
                  <radialGradient id="globe-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                     <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.0" />
                     <stop offset="85%" stopColor="#cbd5e1" stopOpacity="0.1" />
                     <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.15" />
                  </radialGradient>
                  
                  {/* Fine Steel Sheen - Lighter, Technical Grey */}
                  <linearGradient id="metal-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.5" /> {/* Slate 400 */}
                     <stop offset="50%" stopColor="#475569" stopOpacity="0.8" /> {/* Slate 600 */}
                     <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
                  </linearGradient>

                  {/* Core Glow */}
                  <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </radialGradient>
               </defs>

               {/* Background Volume */}
               <circle cx="400" cy="400" r="280" fill="url(#globe-gradient)" />

               {/* LAYER 1: Main Structural Skeleton (Fine Precision Lines) */}
               <g className="animate-[spin_180s_linear_infinite] origin-center">
                  {/* Outer Rim - Thinner */}
                  <circle cx="400" cy="400" r="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="1.0" />
                  
                  {/* Primary Meridians - Very Fine */}
                  <ellipse cx="400" cy="400" rx="280" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" />
                  <ellipse cx="400" cy="400" rx="220" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" />
                  <ellipse cx="400" cy="400" rx="140" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" />
                  <ellipse cx="400" cy="400" rx="60" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" />

                  {/* Cross-Section Parallels (Gyroscopic) */}
                  <ellipse cx="400" cy="400" rx="280" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" transform="rotate(90 400 400)" />
                  <ellipse cx="400" cy="400" rx="220" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" transform="rotate(90 400 400)" />
                  <ellipse cx="400" cy="400" rx="140" ry="280" fill="none" stroke="url(#metal-sheen)" strokeWidth="0.5" transform="rotate(90 400 400)" />
               </g>

               {/* LAYER 2: Orbital Network Rings (Background Context) */}
               <g className="animate-[spin_240s_linear_infinite_reverse] origin-center">
                  {/* Dashed Orbital - Technical look */}
                  <circle cx="400" cy="400" r="340" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.4" />
                  {/* Solid Orbital */}
                  <circle cx="400" cy="400" r="320" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5" />
                  
                  {/* Tilted Orbit */}
                  <ellipse cx="400" cy="400" rx="380" ry="100" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.3" transform="rotate(45 400 400)" />
                  <ellipse cx="400" cy="400" rx="380" ry="100" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.3" transform="rotate(-45 400 400)" />
               </g>

               {/* LAYER 3: Core (Subtle Red Pulse) */}
               <g className="animate-[spin_60s_linear_infinite] origin-center">
                  <circle cx="400" cy="400" r="80" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
                  <circle cx="400" cy="400" r="20" fill="url(#core-glow)" opacity="0.3" />
               </g>
            </svg>
         </div>

         {/* Radial Vignette to focus center content */}
         <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-white/80"></div>
      </div>

      {/* 2. TOP BAR (White Enterprise) */}
      <div className="relative z-20 h-24 px-8 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur-md flex-shrink-0 shadow-sm">
         <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-ibm-serif font-semibold text-gray-900 tracking-tight leading-none">HITACHI</h1>
              <span className="text-[10px] font-ibm-sans font-bold text-[#E60012] tracking-[0.1em] uppercase mt-0.5">Inspire the Next</span>
            </div>
            
            <div className="h-12 w-px bg-slate-300 mx-4"></div>
            
            {/* 3SC Logo Area - UPDATED */}
            <div className="flex items-center">
               <img 
                 src="https://i.postimg.cc/qvGZM5dr/ss-supply-chain-solution-logo-removebg-preview.png" 
                 alt="3SC Supply Chain Solutions" 
                 className="h-20 w-auto object-contain"
               />
            </div>

            <div className="h-12 w-px bg-slate-300 mx-4"></div>

            <div className="text-sm font-medium text-slate-800">
               FBA Control Tower <span className="text-slate-400 mx-2">|</span> v3.0
            </div>
         </div>
         
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-teal-600 font-bold">
               <div className="w-1.5 h-1.5 bg-teal-500 rounded-sm animate-pulse"></div>
               <span>SYSTEM ONLINE</span>
            </div>
            <div className="text-xs font-bold text-slate-600 flex items-center">
               <Globe size={14} className="mr-2" /> US / EN
            </div>
         </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-6 px-12">
         
         {/* Top Spacer / Title */}
         <div className="text-center mt-6 mb-8">
            <h2 className="text-7xl font-ibm-serif font-medium text-slate-900 mb-2 tracking-tight drop-shadow-sm">
               ATLAS
            </h2>
            <p className="text-lg text-slate-600 font-ibm-sans font-normal max-w-lg mx-auto leading-relaxed">
               Global Logistics Command Center.
               <br/>
               <span className="text-sm opacity-80">Connecting Hitachi Energy, 3SC Operations, and Supplier Networks.</span>
            </p>
         </div>

         {/* CARD CONTAINER - Centered - REDUCED HEIGHT AND WIDTH */}
         <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
            <PersonaCard 
              role="HITACHI"
              title="Enterprise & Finance"
              subtitle="Spend Analytics, Payment Approval, & Reporting"
              icon={<Building2 size={28} />}
              theme="green"
              onClick={handleRoleSelect}
              loading={loadingRole === 'HITACHI'}
            />
            <PersonaCard 
              role="3SC"
              title="Operations & Audit"
              subtitle="Rate Management, Exceptions, & Onboarding"
              icon={<Radar size={28} />}
              theme="orange"
              onClick={handleRoleSelect}
              loading={loadingRole === '3SC'}
            />
            <PersonaCard 
              role="VENDOR"
              title="Supplier Portal"
              subtitle="Invoice Submission, Status, & Disputes"
              icon={<Ship size={28} />}
              theme="blue"
              onClick={handleRoleSelect}
              loading={loadingRole === 'VENDOR'}
            />
         </div>

         {/* FOOTER WIDGETS - Pinned to Bottom Corners - SCALED DOWN */}
         <div className="w-full flex justify-between items-end mt-auto px-2 pb-2">
            
            {/* Left Widget: Sustainability */}
            <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-sm p-3 w-64 flex flex-col hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
                  <div className="flex items-center text-teal-600">
                     <Leaf size={14} className="mr-2" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Carbon Watch</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Emissions (YTD)</div>
                     <div className="text-base font-ibm-sans font-bold text-slate-900">14,250 T</div>
                  </div>
                  <div>
                     <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Green Util.</div>
                     <div className="text-base font-ibm-sans font-bold text-slate-900">42%</div>
                  </div>
               </div>
            </div>

            {/* Right Widget: Architecture - ENTERPRISE CORE UPGRADE */}
            <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-sm p-3 w-80 flex items-center justify-between hover:shadow-md transition-shadow">
               <div className="text-center group cursor-default">
                  <div className="text-[#EA580C] mb-1 flex justify-center group-hover:scale-110 transition-transform"><Activity size={16} /></div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">3SC Tower</p>
               </div>

               <div className="h-px w-6 bg-slate-300"></div>

               <div className="text-center group cursor-default">
                  <div className="text-[#E60012] mb-1 flex justify-center group-hover:scale-110 transition-transform"><Building2 size={16} /></div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Hitachi</p>
               </div>

               <div className="h-px w-6 bg-slate-300"></div>

               <div className="text-center group cursor-default w-28">
                  <div className="text-[#0F62FE] mb-1 flex justify-center group-hover:scale-110 transition-transform relative">
                      <Database size={16} />
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse border border-white"></div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-800 uppercase">Enterprise Core</p>
                  <div className="h-3 overflow-hidden relative mt-0.5 flex items-center justify-center">
                    <p key={adapterIndex} className="text-[8px] font-bold text-slate-400 uppercase absolute whitespace-nowrap animate-fade-in-up">
                       {adapterStates[adapterIndex]} 🟢
                    </p>
                  </div>
               </div>
            </div>

         </div>

         {/* Loading Overlay */}
         {loadingRole && (
            <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
               <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-3 bg-[#E60012] rounded-sm animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 bg-[#E60012] rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-[#E60012] rounded-sm animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
               <h3 className="text-xl font-ibm-serif font-light text-gray-900 mb-2">{getLoadingText()}</h3>
               <div className="w-96 h-1 bg-gray-200 rounded-sm overflow-hidden mt-4">
                  <div 
                     className="h-full bg-[#E60012] transition-all duration-300 ease-linear"
                     style={{ width: `${loadingStep * 33}%` }}
                  ></div>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

// --- SOLID COLOR CARD COMPONENT ---
interface PersonaCardProps {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  theme: 'red' | 'green' | 'blue' | 'orange';
  onClick: (role: UserRole) => void;
  loading: boolean;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ role, title, subtitle, icon, theme, onClick, loading }) => {
  
  // Solid, Matte Enterprise Colors
  const styles = {
    red: 'bg-[#E60012] hover:bg-[#B5000E]',   // Hitachi Red
    green: 'bg-[#004D40] hover:bg-[#00382E]', // TEAL BRANDING (Was Green)
    blue: 'bg-[#0F62FE] hover:bg-[#034BD8]',  // IBM Blue
    orange: 'bg-[#EA580C] hover:bg-[#C2410C]', // 3SC Orange
  };

  return (
    <div 
      onClick={() => !loading && onClick(role)}
      className={`
        ${styles[theme]}
        relative overflow-hidden cursor-pointer
        rounded-sm p-6 h-64
        transition-all duration-300
        group
        shadow-lg hover:shadow-2xl hover:-translate-y-1
      `}
    >
      {/* Background Icon Watermark - SCALED DOWN */}
      <div className="absolute -bottom-6 -right-6 text-black opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
         {React.cloneElement(icon as React.ReactElement<any>, { size: 150 })}
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
         <div>
            <div className="w-12 h-12 bg-black/20 rounded-sm flex items-center justify-center mb-4 text-white backdrop-blur-sm">
               {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
            </div>
            <h3 className="text-2xl font-ibm-serif font-medium text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-sm font-ibm-sans text-white/95 leading-relaxed max-w-[95%] font-light text-black">
               {subtitle}
            </p>
         </div>

         <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 group-hover:opacity-100">
               Access Portal
            </span>
            <div className="bg-white/20 p-2 rounded-sm text-white group-hover:bg-white/30 transition-colors">
               <ArrowRight size={16} />
            </div>
         </div>
      </div>
    </div>
  );
};
