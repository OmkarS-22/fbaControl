
import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Mail, HelpCircle, Building, Globe, Loader, CheckCircle, ArrowLeft, FileCheck } from 'lucide-react';

interface VendorLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const VendorLogin: React.FC<VendorLoginProps> = ({ onLoginSuccess, onBack }) => {
  // View State
  const [view, setView] = useState<'login' | 'register'>('login');

  // Login State
  const [agreed, setAgreed] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration State
  const [regForm, setRegForm] = useState({
    taxId: '',
    companyName: '',
    country: 'Select Region...',
    email: '',
    inviteCode: ''
  });
  const [isVerifyingTax, setIsVerifyingTax] = useState(false);
  const [taxVerified, setTaxVerified] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // --- LOGIN HANDLERS ---
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsLoggingIn(true);
    // Simulate API Auth
    setTimeout(() => {
      onLoginSuccess();
    }, 1000);
  };

  // --- REGISTRATION HANDLERS ---
  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegForm(prev => ({ ...prev, taxId: val }));
    
    // Reset verification if user edits
    if (taxVerified) setTaxVerified(false);

    // Simulate Verification Trigger
    if (val.length >= 5 && !isVerifyingTax) {
      setIsVerifyingTax(true);
      setTimeout(() => {
        setIsVerifyingTax(false);
        setTaxVerified(true);
        // Auto-fill company name if empty
        setRegForm(prev => ({ 
           ...prev, 
           taxId: val,
           companyName: prev.companyName || 'Global Logistics Ltd (Verified)'
        }));
      }, 1500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    setTimeout(() => {
      setIsSubmittingReg(false);
      setRegSuccess(true);
    }, 2000);
  };

  const handleReturnToLogin = () => {
    setView('login');
    setRegSuccess(false);
    setRegForm({ taxId: '', companyName: '', country: 'Select Region...', email: '', inviteCode: '' });
    setTaxVerified(false);
    setAgreed(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-ibm-sans">
      
      {/* 1. Public Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-6">
           <div className="flex flex-col cursor-pointer" onClick={onBack}>
              <h1 className="text-xl font-ibm-serif font-bold text-gray-900 tracking-tight leading-none">HITACHI</h1>
              <span className="text-[10px] font-ibm-sans font-bold text-[#E60012] tracking-[0.1em] uppercase mt-1">Inspire the Next</span>
           </div>
           <div className="h-8 w-px bg-gray-300"></div>
           <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              {view === 'login' ? 'Supplier Network' : 'Partner Registration'}
           </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-full border border-teal-200">
           <Lock size={10} />
           <span>Secure Connection (TLS 1.3)</span>
        </div>
      </div>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        <div className="bg-white w-full max-w-[420px] shadow-xl rounded-sm border border-gray-200 overflow-hidden relative transition-all duration-500">
           {/* Top Banner */}
           <div className="bg-[#E60012] h-1.5 w-full"></div>
           
           {/* --- VIEW: LOGIN --- */}
           {view === 'login' && (
             <>
               <div className="p-8">
                  <div className="text-center mb-8">
                     <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Partner Login</h2>
                     <p className="text-xs text-gray-500 mt-2">Secure access to invoices, payments, and disputes.</p>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-5">
                     
                     {/* Pre-filled Credentials */}
                     <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Email Address</label>
                        <div className="relative">
                           <input 
                             type="email" 
                             value="finance@maersk.com" 
                             readOnly
                             className="w-full border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none focus:border-[#E60012] cursor-not-allowed"
                           />
                           <Mail size={14} className="absolute right-3 top-3 text-gray-400" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Password</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            value="password123" 
                            readOnly
                            className="w-full border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none focus:border-[#E60012] cursor-not-allowed"
                          />
                          <Lock size={14} className="absolute right-3 top-3 text-gray-400" />
                        </div>
                     </div>

                     {/* Compliance Check */}
                     <div className="bg-blue-50 p-3 rounded-sm border border-blue-100 mt-6">
                        <label className="flex items-start space-x-2 cursor-pointer">
                           <input 
                             type="checkbox" 
                             className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                             checked={agreed}
                             onChange={(e) => setAgreed(e.target.checked)}
                           />
                           <div className="text-[10px] text-blue-900 leading-relaxed">
                              <span className="font-bold">Compliance Required:</span> I agree to the <span className="underline cursor-pointer hover:text-blue-700 font-bold">Hitachi Energy Supplier Code of Conduct</span> (Updated Nov 2025).
                           </div>
                        </label>
                     </div>

                     {/* Sign In Button */}
                     <button 
                       type="submit"
                       disabled={!agreed || isLoggingIn}
                       className={`w-full py-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all mt-6 shadow-sm
                         ${agreed 
                            ? 'bg-[#E60012] text-white hover:bg-[#C2000F] shadow-lg transform active:scale-95' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                       `}
                     >
                       {isLoggingIn ? (
                         <span className="animate-pulse flex items-center"><div className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-bounce"></div> Authenticating...</span>
                       ) : (
                         <>
                            Secure Sign In <ArrowRight size={16} className="ml-2" />
                         </>
                       )}
                     </button>

                  </form>

                  {/* Magic Link Option */}
                  <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto hover:underline transition-colors">
                        Login via One-Time Secure Link (Email)
                     </button>
                  </div>

               </div>
               
               {/* Onboarding Hook */}
               <div className="bg-gray-50 p-4 text-center border-t border-gray-200 hover:bg-gray-100 transition-colors">
                  <p className="text-xs text-gray-600">
                     New Partner? <span onClick={() => setView('register')} className="font-bold text-[#E60012] cursor-pointer hover:underline ml-1">Register / Onboard New Supplier</span>
                  </p>
               </div>
             </>
           )}

           {/* --- VIEW: REGISTRATION --- */}
           {view === 'register' && !regSuccess && (
             <div className="p-8 animate-fadeIn">
                <button onClick={() => setView('login')} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors">
                   <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-6 mt-2">
                   <h2 className="text-xl font-bold text-gray-900 tracking-tight">Entity Verification</h2>
                   <p className="text-xs text-gray-500 mt-2 leading-relaxed">Join our global logistics ecosystem.<br/>Please provide business details for KYC check.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                   
                   {/* Tax ID Field with Verification Logic */}
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Tax ID / GSTIN / VAT Number</label>
                      <div className="relative">
                         <input 
                           type="text"
                           value={regForm.taxId}
                           onChange={handleTaxIdChange}
                           placeholder="e.g. 12-3456789"
                           className={`w-full border bg-white text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none transition-colors
                             ${taxVerified ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-300 focus:border-[#E60012]'}
                           `}
                         />
                         <div className="absolute right-3 top-2.5">
                            {isVerifyingTax && <Loader size={16} className="text-gray-400 animate-spin" />}
                            {taxVerified && <CheckCircle size={16} className="text-teal-500" />}
                            {!isVerifyingTax && !taxVerified && <ShieldCheck size={16} className="text-gray-300" />}
                         </div>
                      </div>
                      {taxVerified && <p className="text-[10px] text-teal-600 font-bold mt-1">Verified Entity found in Global Registry.</p>}
                   </div>

                   {/* Company Name (Auto-filled) */}
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Legal Company Name</label>
                      <div className="relative">
                         <input 
                           type="text"
                           value={regForm.companyName}
                           onChange={(e) => setRegForm({...regForm, companyName: e.target.value})}
                           className={`w-full border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none focus:border-[#E60012]
                              ${taxVerified ? 'bg-teal-50 text-teal-800' : ''}
                           `}
                         />
                         <Building size={14} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                   </div>

                   {/* Region */}
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Region of Operation</label>
                      <div className="relative">
                         <select 
                            value={regForm.country}
                            onChange={(e) => setRegForm({...regForm, country: e.target.value})}
                            className="w-full border border-gray-300 bg-white text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none focus:border-[#E60012] appearance-none"
                         >
                            <option>United States</option>
                            <option>Canada</option>
                            <option>EMEA (Europe, Middle East, Africa)</option>
                            <option>APAC (Asia Pacific)</option>
                            <option>LATAM (Latin America)</option>
                         </select>
                         <Globe size={14} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                   </div>

                   {/* Admin Email */}
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Administrator Email</label>
                      <div className="relative">
                         <input 
                           type="email"
                           value={regForm.email}
                           onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                           placeholder="admin@company.com"
                           className="w-full border border-gray-300 bg-white text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none focus:border-[#E60012]"
                         />
                         <Mail size={14} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                   </div>

                   {/* Invite Code */}
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Invitation Code (Optional)</label>
                      <input 
                        type="text"
                        value={regForm.inviteCode}
                        onChange={(e) => setRegForm({...regForm, inviteCode: e.target.value})}
                        placeholder="e.g. HITACHI-INV-2025"
                        className="w-full border border-gray-300 bg-white text-gray-800 px-3 py-2.5 rounded-sm text-sm font-medium focus:outline-none focus:border-[#E60012]"
                      />
                   </div>

                   <button 
                     type="submit"
                     disabled={isSubmittingReg || !regForm.taxId || !regForm.email}
                     className={`w-full py-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all mt-6 shadow-sm
                        ${(isSubmittingReg || !regForm.taxId || !regForm.email)
                           ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                           : 'bg-[#004D40] text-white hover:bg-[#00382E] shadow-lg transform active:scale-95' 
                        }
                     `}
                   >
                     {isSubmittingReg ? (
                        <span className="animate-pulse flex items-center">Processing Application...</span>
                     ) : (
                        'Submit for Compliance Review'
                     )}
                   </button>

                </form>
             </div>
           )}

           {/* --- VIEW: SUCCESS STATE --- */}
           {view === 'register' && regSuccess && (
              <div className="p-8 flex flex-col items-center justify-center text-center animate-fadeIn py-16">
                 <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <FileCheck size={32} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted</h2>
                 <p className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded mb-4">Ref: REG-2025-99</p>
                 <p className="text-sm text-gray-600 mb-8 max-w-[280px]">
                    Your application is now under review by the <span className="font-bold text-gray-800">Hitachi 3SC Control Tower</span>.
                    <br/><br/>
                    You will receive login credentials via email upon successful compliance check.
                 </p>
                 <button 
                    onClick={handleReturnToLogin}
                    className="w-full py-3 rounded-sm text-xs font-bold uppercase tracking-wider bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                 >
                    Return to Login
                 </button>
              </div>
           )}

        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-3">
           <div className="flex items-center justify-center space-x-6 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              <span className="cursor-pointer hover:text-gray-600 transition-colors">Privacy Policy</span>
              <span className="text-gray-300">|</span>
              <span className="cursor-pointer hover:text-gray-600 transition-colors">Terms of Service</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center cursor-pointer hover:text-gray-600 transition-colors"><HelpCircle size={12} className="mr-1"/> Support</span>
           </div>
           <p className="text-[10px] text-gray-400">© 2025 Hitachi Energy. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};
    