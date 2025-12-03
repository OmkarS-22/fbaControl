
import React, { useState } from 'react';
import { Shield, Users, Lock, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Save, Layout, Workflow, Plus, Trash2, ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { RoleDefinition, WorkflowStepConfig } from '../types';

interface RBACSettingsProps {
  roles: RoleDefinition[];
  setRoles: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
  workflowConfig: WorkflowStepConfig[];
  setWorkflowConfig: React.Dispatch<React.SetStateAction<WorkflowStepConfig[]>>;
}

export const RBACSettings: React.FC<RBACSettingsProps> = ({ roles, setRoles, workflowConfig, setWorkflowConfig }) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'workflow'>('profiles');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- ROLE MANAGEMENT ---
  const togglePermission = (roleId: string, perm: keyof RoleDefinition['permissions']) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return { 
          ...r, 
          permissions: { ...r.permissions, [perm]: !r.permissions[perm] } 
        };
      }
      return r;
    }));
  };

  // --- WORKFLOW MANAGEMENT ---
  const addStep = () => {
    const newStep: WorkflowStepConfig = {
      id: `step-${Date.now()}`,
      stepName: 'New Approval Step',
      roleId: roles[0].id,
      conditionType: 'ALWAYS'
    };
    // Insert before the last item (System Settlement usually last)
    const last = workflowConfig[workflowConfig.length - 1];
    if (last.isSystemStep) {
       const newConfig = [...workflowConfig];
       newConfig.splice(newConfig.length - 1, 0, newStep);
       setWorkflowConfig(newConfig);
    } else {
       setWorkflowConfig([...workflowConfig, newStep]);
    }
  };

  const removeStep = (id: string) => {
    setWorkflowConfig(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: keyof WorkflowStepConfig, value: any) => {
    setWorkflowConfig(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === workflowConfig.length - 2) return; // Cant move past system step

    const newConfig = [...workflowConfig];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newConfig[index], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[index]];
    setWorkflowConfig(newConfig);
  };

  return (
    <div className="h-full flex flex-col font-sans bg-[#F3F4F6] overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
             Access Control & Workflow
             <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-[#004D40] text-white uppercase tracking-wider">
                Admin
             </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure user roles and dynamic approval chains.</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => showToast('Configuration saved successfully.')}
             className="flex items-center px-4 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-sm transition-transform active:translate-y-0.5"
           >
              <Save size={14} className="mr-2"/> Save Configuration
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 px-8 border-b border-gray-200 bg-white pt-2 flex-shrink-0">
         <button 
            onClick={() => setActiveTab('profiles')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'profiles' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-400'}`}
         >
            User Roles
         </button>
         <button 
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'workflow' ? 'border-teal-600 text-teal-800' : 'border-transparent text-gray-400'}`}
         >
            Workflow Engine
         </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
         
         {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
               {roles.map(role => (
                  <div key={role.id} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
                     <div className={`h-2 w-full ${role.color}`}></div>
                     <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                           </div>
                           <Shield size={20} className="text-gray-400" />
                        </div>
                        
                        <div className="space-y-4 mt-6">
                           <PermissionToggle 
                              label="View Invoices" 
                              active={role.permissions.canViewInvoices} 
                              onClick={() => togglePermission(role.id, 'canViewInvoices')} 
                           />
                           <PermissionToggle 
                              label="Operational Approval (L1)" 
                              active={role.permissions.canApproveL1} 
                              onClick={() => togglePermission(role.id, 'canApproveL1')} 
                           />
                           <PermissionToggle 
                              label="Financial Approval (L2)" 
                              active={role.permissions.canApproveL2} 
                              onClick={() => togglePermission(role.id, 'canApproveL2')} 
                           />
                           <PermissionToggle 
                              label="Manage Rate Cards" 
                              active={role.permissions.canManageRates} 
                              onClick={() => togglePermission(role.id, 'canManageRates')} 
                           />
                           <PermissionToggle 
                              label="Admin System" 
                              active={role.permissions.canAdminSystem} 
                              onClick={() => togglePermission(role.id, 'canAdminSystem')} 
                           />
                        </div>
                     </div>
                     <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
                        <span className="text-xs font-bold text-gray-500">{role.users} Users Assigned</span>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'workflow' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
               <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                           <Workflow size={20} className="mr-2 text-teal-600" />
                           Approval Chain Editor
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Define the sequential steps for invoice processing.</p>
                     </div>
                     <button 
                        onClick={addStep}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-sm text-xs font-bold uppercase hover:bg-gray-50 text-gray-600 transition-colors"
                     >
                        <Plus size={14} className="mr-2"/> Add Step
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     {workflowConfig.map((step, index) => {
                        const isLast = index === workflowConfig.length - 1;
                        return (
                           <div key={step.id} className="relative group">
                              {/* Connecting Line */}
                              {!isLast && (
                                 <div className="absolute left-8 top-10 bottom-[-16px] w-0.5 bg-gray-200 z-0"></div>
                              )}
                              
                              <div className="relative z-10 flex items-start bg-white border border-gray-200 rounded-md p-4 shadow-sm group-hover:border-teal-400 transition-colors">
                                 {/* Drag Handle (Visual) */}
                                 <div className="mr-4 mt-3 text-gray-300 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} />
                                 </div>

                                 {/* Index Badge */}
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0 
                                    ${step.isSystemStep ? 'bg-gray-800 text-white' : 'bg-teal-600 text-white'}`}>
                                    {index + 1}
                                 </div>

                                 {/* Form Content */}
                                 <div className="flex-1 grid grid-cols-12 gap-4 items-end">
                                    {/* Step Name */}
                                    <div className="col-span-4">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Step Name</label>
                                       <input 
                                          type="text" 
                                          value={step.stepName}
                                          disabled={step.isSystemStep}
                                          onChange={(e) => updateStep(step.id, 'stepName', e.target.value)}
                                          className="w-full text-sm font-bold text-gray-900 border-b border-gray-300 pb-1 focus:border-teal-500 focus:outline-none disabled:bg-transparent bg-white"
                                       />
                                    </div>

                                    {/* Approver Role */}
                                    <div className="col-span-3">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Assigned Role</label>
                                       <select 
                                          value={step.roleId}
                                          disabled={step.isSystemStep}
                                          onChange={(e) => updateStep(step.id, 'roleId', e.target.value)}
                                          className="w-full text-xs font-medium bg-white border border-gray-300 rounded p-1.5 focus:border-teal-500"
                                       >
                                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                          {step.isSystemStep && <option value="system">System (Automation)</option>}
                                       </select>
                                    </div>

                                    {/* Trigger Logic */}
                                    <div className="col-span-4">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Trigger Condition</label>
                                       <div className="flex space-x-2">
                                          <select 
                                             value={step.conditionType}
                                             disabled={step.isSystemStep}
                                             onChange={(e) => updateStep(step.id, 'conditionType', e.target.value)}
                                             className="w-full text-xs font-medium bg-white border border-gray-300 rounded p-1.5 focus:border-teal-500"
                                          >
                                             <option value="ALWAYS">Always Required</option>
                                             <option value="AMOUNT_GT">If Amount &gt;</option>
                                             <option value="VARIANCE_GT">If Variance &gt;</option>
                                          </select>
                                          {step.conditionType !== 'ALWAYS' && (
                                             <input 
                                                type="number"
                                                placeholder="0.00"
                                                value={step.conditionValue}
                                                onChange={(e) => updateStep(step.id, 'conditionValue', parseFloat(e.target.value))}
                                                className="w-20 text-xs border border-gray-300 rounded p-1.5 bg-white"
                                             />
                                          )}
                                       </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 flex flex-col items-center justify-center space-y-1">
                                       {!step.isSystemStep && (
                                          <>
                                             <button onClick={() => moveStep(index, 'up')} className="text-gray-400 hover:text-teal-600 disabled:opacity-30" disabled={index === 0}>
                                                <ArrowUp size={14} />
                                             </button>
                                             <button onClick={() => moveStep(index, 'down')} className="text-gray-400 hover:text-teal-600 disabled:opacity-30" disabled={index === workflowConfig.length - 2}>
                                                <ArrowDown size={14} />
                                             </button>
                                             <button onClick={() => removeStep(step.id)} className="text-gray-400 hover:text-red-600 mt-2">
                                                <Trash2 size={14} />
                                             </button>
                                          </>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         )}

      </div>

      {/* Toast */}
      {toast && (
         <div className="absolute bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-sm shadow-xl flex items-center animate-slideIn z-50">
            <CheckCircle className="text-green-400 mr-2" size={16} />
            <div className="text-xs font-bold">{toast}</div>
         </div>
      )}
    </div>
  );
};

const PermissionToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
   <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors" onClick={onClick}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-colors ${active ? 'bg-teal-600' : 'bg-gray-300'}`}>
         <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
   </div>
);
