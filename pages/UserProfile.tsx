
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  User, Mail, Phone, Building, Shield, Bell, History, 
  Save, Camera, Key, LogOut, CheckCircle, AlertTriangle, Edit2, X 
} from 'lucide-react';

interface UserProfileProps {
  userRole: UserRole;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userRole }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications'>('general');
  const [isEditing, setIsEditing] = useState(false);

  // Mock Data based on Role
  const getInitialData = () => {
    switch (userRole) {
      case 'HITACHI':
        return {
          firstName: 'Lan',
          lastName: 'Banh',
          email: 'lan.banh@hitachienergy.com',
          phone: '+1 (919) 555-0123',
          title: 'SCM Lead - North America',
          department: 'Supply Chain Management',
          company: 'Hitachi Energy USA Inc.',
          location: 'Raleigh, NC'
        };
      case 'VENDOR':
        return {
          firstName: 'Sarah',
          lastName: 'Jennings',
          email: 's.jennings@maersk.com',
          phone: '+45 70 12 34 56',
          title: 'Key Account Manager',
          department: 'Accounts Receivable',
          company: 'Maersk Line A/S',
          location: 'Copenhagen, DK'
        };
      default: // 3SC
        return {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@3sc-solution.com',
          phone: '+91 98765 43210',
          title: 'System Administrator',
          department: 'Control Tower Ops',
          company: '3SC Solutions',
          location: 'Gurugram, IN'
        };
    }
  };

  // State: "savedProfile" drives the Header, "formData" drives the Inputs
  const [savedProfile, setSavedProfile] = useState(getInitialData());
  const [formData, setFormData] = useState(getInitialData());

  // Update data if role changes
  useEffect(() => {
    const initData = getInitialData();
    setSavedProfile(initData);
    setFormData(initData);
    setIsEditing(false);
  }, [userRole]);

  const handleEditClick = () => {
    setFormData(savedProfile); // Ensure form starts with current saved data
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData(savedProfile); // Revert to saved data
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    setIsSaving(true);
    setTimeout(() => {
      setSavedProfile(formData); // Commit changes to "Saved" state
      setIsSaving(false);
      setIsEditing(false);
      // Optional: Toast message here
    }, 1000);
  };

  const themeColor = userRole === 'VENDOR' ? 'blue' : 'teal';
  const ThemeIcon = userRole === 'VENDOR' ? Building : Shield;

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6] overflow-hidden font-sans relative">
      
      {/* 1. Header / Hero Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 shadow-sm flex-shrink-0 z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-6">
            <div className="relative group cursor-pointer">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md transition-transform transform ${userRole === 'VENDOR' ? 'bg-blue-600' : 'bg-[#004D40]'}`}>
                {savedProfile.firstName[0]}{savedProfile.lastName[0]}
              </div>
              <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 group-hover:bg-gray-100">
                 <Camera size={16} className="text-gray-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{savedProfile.firstName} {savedProfile.lastName}</h1>
              <p className="text-sm text-gray-500 font-medium">{savedProfile.title}</p>
              <div className="flex items-center mt-2 space-x-3">
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-sm border ${userRole === 'VENDOR' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                   <ThemeIcon size={12} className="mr-1" />
                   {savedProfile.company}
                </span>
                <span className="flex items-center text-xs text-gray-400">
                   <Building size={12} className="mr-1" /> {savedProfile.location}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
             <button className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-sm text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">
               <LogOut size={16} className="mr-2" />
               Sign Out
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mt-10 border-b border-gray-100 bg-white">
           {['general', 'security', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab 
                    ? `border-${themeColor}-600 text-${themeColor}-600` 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
         <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
            
            {/* Left Column: Settings Form */}
            <div className="col-span-2 space-y-8">
               
               {activeTab === 'general' && (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 animate-fadeIn">
                     <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                           <User size={20} className={`mr-2 text-${themeColor}-600`} />
                           Personal Information
                        </h3>
                        {!isEditing ? (
                           <button 
                              onClick={handleEditClick}
                              className={`flex items-center px-3 py-1.5 rounded-sm text-xs font-bold uppercase border transition-colors ${userRole === 'VENDOR' ? 'text-blue-600 border-blue-200 hover:bg-blue-50' : 'text-teal-600 border-teal-200 hover:bg-teal-50'}`}
                           >
                              <Edit2 size={14} className="mr-2" />
                              Edit Profile
                           </button>
                        ) : (
                           <div className="flex items-center space-x-2">
                              <button 
                                 onClick={handleCancelClick}
                                 className="flex items-center px-3 py-1.5 rounded-sm text-xs font-bold uppercase border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                              >
                                 <X size={14} className="mr-2" />
                                 Cancel
                              </button>
                              <button 
                                 onClick={handleSaveClick}
                                 className={`flex items-center px-3 py-1.5 rounded-sm text-xs font-bold uppercase text-white shadow-sm ${userRole === 'VENDOR' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                              >
                                 {isSaving ? (
                                    'Saving...'
                                 ) : (
                                    <>
                                       <Save size={14} className="mr-2" />
                                       Save Changes
                                    </>
                                 )}
                              </button>
                           </div>
                        )}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6 mb-6">
                        <InputGroup label="First Name" value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} disabled={!isEditing} />
                        <InputGroup label="Last Name" value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} disabled={!isEditing} />
                     </div>

                     <div className="grid grid-cols-2 gap-6 mb-6">
                        <InputGroup label="Job Title" value={formData.title} onChange={(v) => setFormData({...formData, title: v})} disabled={!isEditing} />
                        <InputGroup label="Department" value={formData.department} onChange={(v) => setFormData({...formData, department: v})} disabled={!isEditing} />
                     </div>

                     <h3 className="text-lg font-bold text-gray-800 mb-6 mt-10 flex items-center">
                        <Mail size={20} className={`mr-2 text-${themeColor}-600`} />
                        Contact Details
                     </h3>

                     <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Work Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} disabled={!isEditing} />
                        <InputGroup label="Phone Number" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} disabled={!isEditing} />
                     </div>
                  </div>
               )}

               {activeTab === 'security' && (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 animate-fadeIn">
                     <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Shield size={20} className={`mr-2 text-${themeColor}-600`} />
                        Login & Security
                     </h3>
                     
                     <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm bg-gray-50">
                           <div>
                              <p className="text-sm font-bold text-gray-800">Password</p>
                              <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                           </div>
                           <button className="text-xs font-bold text-gray-600 border border-gray-300 bg-white px-3 py-2 rounded-sm hover:bg-gray-50 uppercase">Change Password</button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm bg-gray-50">
                           <div>
                              <p className="text-sm font-bold text-gray-800">Two-Factor Authentication (2FA)</p>
                              <p className="text-xs text-green-600 font-bold flex items-center mt-1">
                                 <CheckCircle size={12} className="mr-1" /> Enabled (Microsoft Authenticator)
                              </p>
                           </div>
                           <button className="text-xs font-bold text-red-600 border border-red-200 bg-white px-3 py-2 rounded-sm hover:bg-red-50 uppercase">Disable</button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm bg-gray-50">
                           <div>
                              <p className="text-sm font-bold text-gray-800">Active Sessions</p>
                              <p className="text-xs text-gray-500">Currently logged in on Chrome (Windows)</p>
                           </div>
                           <button className="text-xs font-bold text-gray-600 border border-gray-300 bg-white px-3 py-2 rounded-sm hover:bg-gray-50 uppercase">View All Devices</button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'notifications' && (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 animate-fadeIn">
                     <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Bell size={20} className={`mr-2 text-${themeColor}-600`} />
                        Notification Preferences
                     </h3>
                     
                     <div className="space-y-4">
                        <ToggleRow label="Invoice Status Updates" desc="Receive email when invoice status changes (Approved/Rejected)" />
                        <ToggleRow label="New Exception Alerts" desc="Immediate notification for high-variance exceptions" defaultChecked />
                        <ToggleRow label="Payment Remittance Advice" desc="Weekly summary of processed payments" defaultChecked />
                        <ToggleRow label="System Maintenance" desc="Alerts regarding planned downtime or updates" />
                        <ToggleRow label="Marketing & Newsletter" desc="Updates on new AERIS features" />
                     </div>
                  </div>
               )}

            </div>

            {/* Right Column: Activity Log */}
            <div className="col-span-1">
               <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 sticky top-0">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center">
                     <History size={16} className="mr-2 text-gray-400" />
                     Recent Activity
                  </h3>
                  
                  <div className="relative border-l border-gray-200 ml-2 space-y-8">
                     
                     {userRole === 'HITACHI' && (
                        <>
                           <ActivityItem 
                              title="Approved Payment Batch" 
                              time="2 hours ago" 
                              desc="Batch #2025-11-24 ($1.2M) sent to SAP."
                              icon={<CheckCircle size={14} className="text-white" />}
                              color="bg-green-500"
                           />
                           <ActivityItem 
                              title="Updated Rate Card" 
                              time="Yesterday, 4:30 PM" 
                              desc="Modified fuel surcharge for Maersk NA contract."
                              icon={<Save size={14} className="text-white" />}
                              color="bg-blue-500"
                           />
                        </>
                     )}

                     {userRole === 'VENDOR' && (
                        <>
                           <ActivityItem 
                              title="Uploaded Invoice" 
                              time="10 mins ago" 
                              desc="Submitted Invoice #9982771-A via Portal."
                              icon={<CheckCircle size={14} className="text-white" />}
                              color="bg-blue-500"
                           />
                           <ActivityItem 
                              title="Updated Company Info" 
                              time="2 days ago" 
                              desc="Changed Tax ID document in profile."
                              icon={<Building size={14} className="text-white" />}
                              color="bg-gray-500"
                           />
                        </>
                     )}

                     <ActivityItem 
                        title="Password Changed" 
                        time="3 months ago" 
                        desc="Security checkpoint verification."
                        icon={<Key size={14} className="text-white" />}
                        color="bg-gray-400"
                     />
                     
                     <ActivityItem 
                        title="System Login" 
                        time="Nov 24, 09:00 AM" 
                        desc="Logged in from IP 192.168.1.45"
                        icon={<User size={14} className="text-white" />}
                        color="bg-teal-500"
                     />
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, value, onChange, disabled }: { label: string, value: string, onChange: (val: string) => void, disabled?: boolean }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
         w-full border rounded-sm px-4 py-2.5 text-sm font-medium transition-shadow
         ${disabled 
            ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-default' 
            : 'bg-white text-gray-900 border-gray-300 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-sm'
         }
      `}
    />
  </div>
);

const ToggleRow = ({ label, desc, defaultChecked }: { label: string, desc: string, defaultChecked?: boolean }) => {
   const [checked, setChecked] = useState(defaultChecked || false);
   return (
      <div className="flex items-start space-x-4 py-3 border-b border-gray-100 last:border-0">
         <div 
            onClick={() => setChecked(!checked)}
            className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}
         >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
         </div>
         <div>
            <p className="text-sm font-bold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
         </div>
      </div>
   );
};

const ActivityItem = ({ title, time, desc, icon, color }: any) => (
   <div className="relative pl-6">
      <div className={`absolute -left-[13px] top-0 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${color}`}>
         {icon}
      </div>
      <div>
         <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">{time}</p>
         <h4 className="text-sm font-bold text-gray-800">{title}</h4>
         <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
   </div>
);
