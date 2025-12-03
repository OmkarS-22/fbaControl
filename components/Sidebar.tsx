
import React from 'react';
import { 
  LayoutDashboard, 
  ScrollText, 
  Truck, 
  ClipboardCheck, 
  Landmark, 
  PieChart,
  Network,
  UploadCloud,
  CreditCard,
  User,
  Settings
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  
  // Define all possible menu items
  const allMenuItems = [
    { id: 'cockpit', label: 'Control Tower', icon: LayoutDashboard, roles: ['3SC'] },
    { id: 'vendor_portal', label: 'Supplier Home', icon: LayoutDashboard, roles: ['VENDOR'] },
    
    { id: 'rates', label: 'Contracts & Rates', icon: ScrollText, roles: ['3SC'] },
    { id: 'network', label: 'Carrier Master', icon: Truck, roles: ['3SC'] },
    
    { id: 'ingestion', label: 'Upload Invoice', icon: UploadCloud, roles: ['VENDOR'] },
    
    { id: 'workbench', label: 'Freight Audit', icon: ClipboardCheck, roles: ['3SC'] },
    
    { id: 'settlement', label: 'Payments', icon: Landmark, roles: ['HITACHI', '3SC'] },
    { id: 'my_payments', label: 'My Payments', icon: CreditCard, roles: ['VENDOR'] },
    
    { id: 'intelligence', label: 'Analytics', icon: PieChart, roles: ['HITACHI', '3SC'] },
    
    // Integration Hub moved to bottom and removed HITACHI access
    { id: 'integration', label: 'Integration Hub', icon: Network, roles: ['3SC'] },
    
    // New RBAC Admin Link
    { id: 'rbac', label: 'RBAC & Workflow', icon: Settings, roles: ['3SC'] },

    { id: 'profile', label: 'My Profile', icon: User, roles: ['VENDOR'] }
  ];

  // Filter items based on userRole
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  // Role-specific Branding Colors/Styles (Optional subtle tweaks)
  const isVendor = userRole === 'VENDOR';
  const bgClass = isVendor ? 'bg-slate-800' : 'bg-[#004D40]';
  const headerBorder = isVendor ? 'border-slate-700' : 'border-teal-800';
  const activeBg = isVendor ? 'bg-slate-900' : 'bg-[#00352C]';
  const hoverBg = isVendor ? 'hover:bg-slate-700' : 'hover:bg-[#00352C]';

  return (
    <div className={`w-60 ${bgClass} text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50 font-sans transition-colors duration-300`}>
      {/* Brand Header */}
      <div className={`p-5 border-b ${headerBorder}`}>
        {isVendor ? (
          <div>
            <h1 className="text-lg font-bold tracking-wider leading-none">
              PARTNER
              <span className="text-blue-400">PORTAL</span>
            </h1>
            <p className="text-[10px] mt-1 uppercase tracking-widest opacity-80 text-slate-300">
              Maersk Line
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white leading-none">
              3SC
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-teal-200 mt-1 opacity-80">
              Control Tower
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-3 transition-all duration-200 border-l-4 group text-left ${
                isActive 
                  ? `${activeBg} border-${isVendor ? 'blue' : 'teal'}-400 text-white` 
                  : `border-transparent ${isVendor ? 'text-slate-300' : 'text-teal-100'} ${hoverBg} hover:text-white`
              }`}
            >
              <Icon size={20} className={isActive ? (isVendor ? 'text-blue-400' : 'text-teal-400') : (isVendor ? 'text-slate-400 group-hover:text-white' : 'text-teal-200 group-hover:text-white')} />
              <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className={`p-4 border-t ${headerBorder} ${isVendor ? 'bg-slate-900' : 'bg-[#003C32]'}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs text-white border ${isVendor ? 'bg-blue-600 border-blue-500' : 'bg-teal-600 border-teal-500'}`}>
            {userRole === 'HITACHI' ? 'LB' : userRole === '3SC' ? 'AD' : 'VN'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
               {userRole === 'HITACHI' ? 'Lan Banh' : userRole === '3SC' ? 'Admin User' : 'Vendor User'}
            </p>
            <p className={`text-[10px] ${isVendor ? 'text-slate-400' : 'text-teal-300'} truncate`}>
               {userRole === 'HITACHI' ? 'SCM Lead' : userRole === '3SC' ? 'System Admin' : 'Finance Rep'}
            </p>
          </div>
        </div>
        <div className={`flex items-center justify-between pt-2 border-t ${isVendor ? 'border-slate-700/50' : 'border-teal-700/50'}`}>
           <span className={`text-[10px] uppercase tracking-wider ${isVendor ? 'text-slate-500' : 'text-teal-400'}`}>v2.5.0</span>
           <div className="flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-400 mr-1.5"></div>
              <span className={`text-[10px] ${isVendor ? 'text-slate-400' : 'text-teal-200'}`}>Online</span>
           </div>
        </div>
      </div>
    </div>
  );
};
