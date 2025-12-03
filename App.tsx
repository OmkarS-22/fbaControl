

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { InvoiceWorkbench } from './pages/InvoiceWorkbench';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { RateCards } from './pages/RateCards';
import { PartnerNetwork } from './pages/PartnerNetwork';
import { SettlementFinance } from './pages/SettlementFinance';
import { IntelligenceHub } from './pages/IntelligenceHub';
import { IntegrationHub } from './pages/IntegrationHub';
import { InvoiceIngestion } from './pages/InvoiceIngestion';
import { LandingPage } from './pages/LandingPage';
import { VendorPortal } from './pages/VendorPortal';
import { VendorLogin } from './pages/VendorLogin';
import { UserProfile } from './pages/UserProfile';
import { RBACSettings } from './pages/RBACSettings';
import { Invoice, UserRole, InvoiceStatus, RoleDefinition, WorkflowStepConfig, Dispute } from './types';
import { MOCK_INVOICES, INITIAL_ROLES, INITIAL_WORKFLOW } from './constants'; 
import { Bell, LogOut, ChevronDown, UserCircle, Users, Shield, Briefcase, Command, Check, RefreshCw, Lock } from 'lucide-react';

// Persona Definition for Demo Switching
const DEMO_PERSONAS = [
  { id: 'scm', name: 'Lan Banh', role: 'SCM Lead', initials: 'LB', roleId: 'scm', color: 'teal' },
  { id: 'finance', name: 'William Carswell', role: 'Category Mgr', initials: 'WC', roleId: 'finance', color: 'blue' },
  { id: 'admin', name: 'System Admin', role: 'Super User', initials: 'AD', roleId: 'admin', color: 'purple' }
];

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVendorGate, setShowVendorGate] = useState(false); 
  const [userRole, setUserRole] = useState<UserRole>('3SC');

  // Persona State (for RBAC Simulation)
  const [activePersona, setActivePersona] = useState(DEMO_PERSONAS[0]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  
  // Transition State
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [activeTab, setActiveTab] = useState('cockpit');
  
  // --- LIFTED STATE: INVOICES & CONFIG ---
  // This ensures changes in RBAC Settings reflect in Invoice Detail immediately
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // RBAC & Workflow State (Lifted for persistence)
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowStepConfig[]>(INITIAL_WORKFLOW);

  // --- HANDLERS ---
  const handleLogin = (role: UserRole) => {
    if (role === 'VENDOR') {
      setShowVendorGate(true);
    } else {
      setUserRole(role);
      setIsLoggedIn(true);
      if (role === 'HITACHI') setActiveTab('intelligence');
      else setActiveTab('cockpit');
    }
  };

  const handleVendorGateSuccess = () => {
    setUserRole('VENDOR');
    setIsLoggedIn(true);
    setShowVendorGate(false);
    setActiveTab('vendor_portal');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowVendorGate(false);
    setSelectedInvoice(null);
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleBackToWorkbench = () => {
    setSelectedInvoice(null);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    setSelectedInvoice(updatedInvoice);
  };

  const handleUpdateDispute = (invoiceId: string, action: 'SUBMIT_JUSTIFICATION' | 'REUPLOAD', comment?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newHistoryEntry = {
          actor: 'Vendor' as 'Vendor',
          timestamp: new Date().toLocaleString(),
          action: action === 'SUBMIT_JUSTIFICATION' ? 'Justification Submitted' : 'Corrected Invoice Uploaded',
          comment: comment,
        };
        const updatedDispute: Dispute = {
          status: 'VENDOR_RESPONDED',
          history: [...(inv.dispute?.history || []), newHistoryEntry]
        };
        return { ...inv, status: InvoiceStatus.VENDOR_RESPONDED, dispute: updatedDispute };
      }
      return inv;
    }));
  };

  const handleNavigation = (page: string) => {
     setActiveTab(page);
     setSelectedInvoice(null);
  };

  const handlePersonaSwitch = (persona: typeof DEMO_PERSONAS[0]) => {
    setShowPersonaMenu(false);
    
    // Simulate real authentication sequence
    setIsSwitchingUser(true);
    setLoadingMessage("Securely terminating current session...");
    
    // Stage 1: Authenticate
    setTimeout(() => {
        setLoadingMessage(`Authenticating user: ${persona.name}...`);
    }, 1000);

    // Stage 2: Load Permissions
    setTimeout(() => {
        setLoadingMessage("Verifying Role-Based Access Controls (RBAC)...");
    }, 2200);

    // Stage 3: Load Dashboard
    setTimeout(() => {
        setLoadingMessage("Loading personalized workspace...");
    }, 3200);

    // Stage 4: Complete
    setTimeout(() => {
      setActivePersona(persona);
      setIsSwitchingUser(false);
      
      // Redirect to home dashboard for that persona to simulate fresh login
      setSelectedInvoice(null);
      if (persona.id === 'finance') {
         setActiveTab('settlement');
      } else {
         setActiveTab('cockpit');
      }
    }, 3800);
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (selectedInvoice) {
      return (
        <InvoiceDetail 
          invoice={selectedInvoice} 
          onBack={handleBackToWorkbench} 
          onUpdateInvoice={handleUpdateInvoice}
          activePersona={activePersona} 
          roles={roles}
          workflowConfig={workflowConfig}
        />
      );
    }

    switch (activeTab) {
      case 'cockpit':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'ingestion': 
        return <InvoiceIngestion onBack={() => handleNavigation(userRole === 'VENDOR' ? 'vendor_portal' : 'cockpit')} onSubmit={() => handleNavigation(userRole === 'VENDOR' ? 'vendor_portal' : 'workbench')} userRole={userRole} />;
      case 'rates':
        return <RateCards />;
      case 'network':
        return <PartnerNetwork />;
      case 'integration':
        return <IntegrationHub />;
      case 'workbench':
        return <InvoiceWorkbench invoices={invoices} onSelectInvoice={handleInvoiceSelect} />;
      case 'settlement':
        return <SettlementFinance userRole={userRole} />;
      case 'intelligence':
        return <IntelligenceHub />;
      case 'vendor_portal':
        return <VendorPortal invoices={invoices} onNavigate={handleNavigation} onSelectInvoice={handleInvoiceSelect} onUpdateDispute={handleUpdateDispute} />;
      case 'my_payments':
        return <SettlementFinance userRole={userRole} />;
      case 'rbac': // Pass the state setters here!
        return (
          <RBACSettings 
            roles={roles} 
            setRoles={setRoles}
            workflowConfig={workflowConfig}
            setWorkflowConfig={setWorkflowConfig}
          />
        );
      case 'profile':
         return <UserProfile userRole={userRole} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium">Module Under Construction</h3>
              <p className="text-sm">This module is part of the future roadmap.</p>
            </div>
          </div>
        );
    }
  };

  // Routing Logic
  if (!isLoggedIn) {
    if (showVendorGate) {
      return (
        <VendorLogin 
          onLoginSuccess={handleVendorGateSuccess} 
          onBack={() => setShowVendorGate(false)} 
        />
      );
    }
    return <LandingPage onLogin={handleLogin} />;
  }

  // 4. Logged In Application
  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-gray-900 relative">
      
      {/* AUTHENTICATION OVERLAY (Simulates Switching User) */}
      {isSwitchingUser && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn cursor-wait">
           <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
           </div>
           
           <h3 className="text-2xl font-light text-gray-900 tracking-tight mb-2">System Switch</h3>
           <p className="text-sm font-mono text-teal-600 font-bold uppercase tracking-widest animate-pulse">{loadingMessage}</p>
           
           <div className="w-64 h-1 bg-gray-100 mt-8 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 animate-[dash_2s_linear_infinite]" style={{ width: '30%' }}></div>
           </div>
        </div>
      )}

      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedInvoice(null); }} userRole={userRole} />
      
      <main className="ml-60 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center">
             <h1 className="text-base font-semibold text-gray-800 tracking-tight flex items-center mr-6">
                {userRole === 'HITACHI' ? 'HITACHI ENERGY' : userRole === 'VENDOR' ? 'MAERSK LINE' : '3SC CONTROL TOWER'}
                <span className="text-gray-300 mx-2">|</span> 
                <span className="text-gray-500 text-xs font-normal uppercase tracking-wider">
                   {userRole === 'HITACHI' ? 'Finance Cockpit' : userRole === 'VENDOR' ? 'Supplier Portal' : 'Admin Console'}
                </span>
             </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell size={18} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div className="h-5 w-px bg-gray-200"></div>
            
            {/* USER PROFILE & SWITCHER */}
            <div className="relative">
               <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1 rounded-sm transition-colors"
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
               >
                  <div className="text-right hidden md:block">
                     <p className="text-sm font-medium text-gray-700 leading-none">
                        {userRole === 'VENDOR' ? 'Vendor User' : activePersona.name}
                     </p>
                     <p className="text-[10px] text-gray-400 mt-0.5">
                        {userRole === 'VENDOR' ? 'Finance Rep' : activePersona.role}
                     </p>
                  </div>
                  <div 
                    className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-white text-xs shadow-sm ${
                       userRole === 'VENDOR' ? 'bg-blue-600' : 
                       activePersona.id === 'scm' ? 'bg-teal-600' :
                       activePersona.id === 'finance' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}
                  >
                    {userRole === 'VENDOR' ? 'VN' : activePersona.initials}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
               </div>

               {/* Professional Dropdown Menu */}
               {showPersonaMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 shadow-xl rounded-sm z-50 animate-fade-in-up flex flex-col">
                     
                     {/* User Info Header */}
                     <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-bold text-gray-500 uppercase">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{userRole === 'VENDOR' ? 'Vendor User' : activePersona.name}</p>
                     </div>

                     {/* Role Switcher Section (Only for Internal Users) */}
                     {userRole !== 'VENDOR' && (
                        <div className="py-2 border-b border-gray-100">
                           <p className="px-4 text-[10px] font-bold text-gray-400 uppercase mb-2">Switch Account (Demo)</p>
                           {DEMO_PERSONAS.map(persona => {
                              const isActive = activePersona.id === persona.id;
                              return (
                                 <button 
                                    key={persona.id}
                                    onClick={() => handlePersonaSwitch(persona)}
                                    className="w-full text-left px-4 py-2 text-xs flex items-center hover:bg-gray-50 transition-colors"
                                 >
                                    <div className={`w-2 h-2 rounded-full mr-3 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className="flex-1">
                                       <span className={`block font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                          {persona.name}
                                       </span>
                                       <span className="text-[10px] text-gray-400">{persona.role}</span>
                                    </div>
                                    {isActive && <Check size={14} className="text-green-500" />}
                                 </button>
                              );
                           })}
                        </div>
                     )}

                     {/* Actions */}
                     <div className="py-1">
                        <button 
                           onClick={() => { setShowPersonaMenu(false); setActiveTab('profile'); }}
                           className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                           <UserCircle size={14} className="mr-2 text-gray-400"/> Profile Settings
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                           onClick={() => { setShowPersonaMenu(false); handleLogout(); }}
                           className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center"
                        >
                           <LogOut size={14} className="mr-2"/> Sign Out
                        </button>
                     </div>
                  </div>
               )}
            </div>

          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;