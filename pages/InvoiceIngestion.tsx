
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  X, 
  ArrowRight,
  UploadCloud,
  FileText,
  Loader,
  Database
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { UserRole } from '../types';

interface IngestionProps {
  onBack: () => void;
  onSubmit: () => void;
  userRole: UserRole;
}

export const InvoiceIngestion: React.FC<IngestionProps> = ({ onBack, onSubmit, userRole }) => {
  // Workflow State: 'upload' -> 'scanning' -> 'verify' -> 'success'
  const [ingestionStep, setIngestionStep] = useState<'upload' | 'scanning' | 'verify' | 'success'>('upload');
  
  const [activeField, setActiveField] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formValues, setFormValues] = useState({
    invoiceNumber: '',
    date: '',
    vendor: '',
    bolNumber: '',
    origin: '',
    destination: '',
    totalAmount: '',
    currency: '',
    lineItem2Desc: '',
    lineItem2Amount: '',
    lineItem2Code: '' 
  });

  const [fieldConfidence, setFieldConfidence] = useState({
    invoiceNumber: 'low',
    date: 'low',
    vendor: 'low',
    bolNumber: 'low',
    lineItem1: 'low',
    lineItem2: 'low',
    origin: 'low',
    destination: 'low'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVendor = userRole === 'VENDOR';

  // --- HANDLERS ---

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Show scanning state
    setIngestionStep('scanning');

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    
    try {
      const base64Data = await readFile(file);
      setPreviewUrl(base64Data);
      
      // 2. Call Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Extract base64 content without header
      const base64Content = base64Data.split(',')[1];
      const mimeType = base64Data.substring(base64Data.indexOf(':') + 1, base64Data.indexOf(';'));
      
      const prompt = `
        Analyze this invoice image and extract the following fields in JSON format:
        - invoiceNumber (string)
        - date (string, YYYY-MM-DD)
        - vendor (string)
        - bolNumber (string, Bill of Lading)
        - origin (string, city/port)
        - destination (string, city/port)
        - totalAmount (string, format 0.00)
        - currency (string, e.g. USD, EUR)
        - accessorials: array of objects with description, amount. Look specifically for "Bunker", "Fuel", "Security", or "THC" charges.

        If a field is not found, return an empty string.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Content } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      // 3. Parse and Map Data (Robust JSON Parsing)
      let text = response.text || "{}";
      
      // Clean up potential markdown code blocks
      if (text.startsWith('```json')) {
        text = text.replace(/^```json/, '').replace(/```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```/, '').replace(/```$/, '');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        data = {};
      }

      setFormValues({
        invoiceNumber: data.invoiceNumber || '',
        date: data.date || '',
        vendor: data.vendor || '',
        bolNumber: data.bolNumber || '',
        origin: data.origin || '',
        destination: data.destination || '',
        totalAmount: data.totalAmount || '',
        currency: data.currency || 'USD',
        lineItem2Desc: data.accessorials?.[0]?.description || '',
        lineItem2Amount: data.accessorials?.[0]?.amount ? String(data.accessorials[0].amount) : '',
        lineItem2Code: data.accessorials?.[0] ? 'FSC' : ''
      });

      // Simple confidence logic: if data exists, high confidence
      setFieldConfidence({
        invoiceNumber: data.invoiceNumber ? 'high' : 'low',
        date: data.date ? 'high' : 'low',
        vendor: data.vendor ? 'high' : 'low',
        bolNumber: data.bolNumber ? 'high' : 'low',
        lineItem1: 'high', // Base freight usually present
        lineItem2: data.accessorials?.length > 0 ? 'high' : 'low',
        origin: data.origin ? 'high' : 'low',
        destination: data.destination ? 'high' : 'low'
      });

      setIngestionStep('verify');

    } catch (error) {
      console.error("Gemini Extraction Error:", error);
      // Fallback or error handling, stay on upload or go to verify empty
      setIngestionStep('verify'); // Allow manual entry
    }
  };

  const handleFocus = (field: string) => {
    setActiveField(field);
  };

  const handleCorrection = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (field === 'lineItem2Amount' || field === 'lineItem2Desc') {
      setFieldConfidence(prev => ({ ...prev, lineItem2: 'high' }));
    }
  };

  const handleSubmitProcess = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(); // Call parent submit
    }, 2000);
  };

  // --- SUB-COMPONENTS ---

  // --- RENDER: STEP 1 - UPLOAD SCREEN ---
  if (ingestionStep === 'upload') {
    return (
      <div className="h-full flex flex-col bg-gray-50 font-sans p-8 items-center justify-center relative">
        <button onClick={onBack} className="absolute top-8 left-8 p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={24} />
        </button>
        
        <div className="max-w-2xl w-full text-center">
           <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Invoice</h2>
              <p className="text-gray-500">Supported formats: PDF, JPG, PNG (Max 25MB)</p>
           </div>

           <div 
             onClick={handleUploadClick}
             className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-16 cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all group shadow-sm"
           >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
              />
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                 <UploadCloud size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700">Click to Browse or Drag File Here</h3>
              <p className="text-sm text-gray-400">Securely encrypted upload to 3SC Control Tower</p>
           </div>

           <div className="mt-8 flex justify-center space-x-8 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span className="flex items-center"><CheckCircle size={14} className="mr-2 text-teal-500"/> AI Extraction</span>
              <span className="flex items-center"><CheckCircle size={14} className="mr-2 text-teal-500"/> Auto-Validation</span>
              <span className="flex items-center"><CheckCircle size={14} className="mr-2 text-teal-500"/> Instant Feedback</span>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: STEP 1.5 - SCANNING ---
  if (ingestionStep === 'scanning') {
    return (
      <div className="h-full flex flex-col bg-gray-50 font-sans items-center justify-center">
         <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                  <FileText size={32} />
               </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Document...</h2>
            <p className="text-gray-500 animate-pulse">Gemini AI is extracting metadata and line items</p>
         </div>
      </div>
    );
  }

  // --- RENDER: STEP 2 - VERIFICATION WORKBENCH (Split View) ---
  return (
    <div className="h-full flex flex-col font-sans bg-gray-100 overflow-hidden relative">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-30 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIngestionStep('upload')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
             <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                   {isVendor ? 'Verify & Submit Invoice' : 'Invoice Validation Workbench'}
                </h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center">
                   <AlertTriangle size={12} className="mr-1" /> {isVendor ? 'Action Required' : 'Pending Verification'}
                </span>
             </div>
             <p className="text-xs text-gray-500 mt-0.5">
                {isVendor 
                  ? 'Please review the AI-extracted data below against your original document.' 
                  : 'AI Confidence Score: 88% (Review Required) • Model: Gemini 2.5 Flash'
                }
             </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
           {!isVendor && (
             <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-sm text-xs font-bold uppercase hover:bg-red-50 transition-colors">
               <X size={16} />
               <span>Reject</span>
             </button>
           )}
           <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-teal-600 text-teal-700 rounded-sm text-xs font-bold uppercase hover:bg-teal-50 transition-colors">
             <Save size={16} />
             <span>Save Draft</span>
           </button>
           <button 
             onClick={handleSubmitProcess}
             className="flex items-center space-x-2 px-6 py-2 bg-[#004D40] text-white rounded-sm text-xs font-bold uppercase hover:bg-[#00352C] shadow-md transition-colors"
           >
             {isSubmitting ? (
               <span className="animate-pulse">Submitting...</span>
             ) : (
               <>
                 <span>{isVendor ? 'Confirm Submission' : 'Submit to Audit'}</span>
                 <ArrowRight size={16} />
               </>
             )}
           </button>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: PDF/IMAGE VIEWER */}
        <div className="w-1/2 bg-[#525659] p-8 overflow-auto custom-scrollbar flex justify-center relative">
           
           {/* Tools */}
           <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#323639] rounded-full px-4 py-2 flex items-center space-x-4 shadow-xl z-20 text-gray-300 border border-gray-600">
              <ZoomOut size={16} className="cursor-pointer hover:text-white" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} />
              <span className="text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
              <ZoomIn size={16} className="cursor-pointer hover:text-white" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} />
              <div className="w-px h-4 bg-gray-600"></div>
              <Maximize size={16} className="cursor-pointer hover:text-white" />
           </div>

           {/* The Document Container */}
           <div 
             className="bg-white shadow-2xl transition-transform duration-200 origin-top relative flex-shrink-0"
             style={{ width: '595px', minHeight: '842px', transform: `scale(${zoomLevel})` }}
           >
             {previewUrl ? (
               <img src={previewUrl} alt="Uploaded Invoice" className="w-full h-auto object-contain" />
             ) : (
               <div className="p-12 font-serif text-gray-800 relative h-full flex items-center justify-center">
                  <p className="text-gray-400">No preview available</p>
               </div>
             )}
           </div>
        </div>

        {/* RIGHT PANEL: DIGITAL TWIN FORM */}
        <div className="w-1/2 bg-white flex flex-col border-l border-gray-300">
          
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
             <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                  <Database size={16} className="mr-2 text-teal-600" />
                  Extracted Data
                </h3>
                <p className="text-xs text-gray-500 mt-1">Please verify all Amber fields before submitting.</p>
             </div>
             <div className="text-right text-xs">
                <p className="font-bold text-gray-700">Gemini 2.5 Flash</p>
                <p className="text-teal-600 flex items-center justify-end"><CheckCircle size={10} className="mr-1"/> Online</p>
             </div>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* Header Details */}
            <div>
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Header Details</h4>
               <div className="grid grid-cols-2 gap-6">
                  <InputWithStatus 
                    label="Invoice Number" 
                    value={formValues.invoiceNumber} 
                    confidence={fieldConfidence.invoiceNumber}
                    onFocus={() => handleFocus('invoiceNumber')}
                    onChange={(v) => handleCorrection('invoiceNumber', v)}
                  />
                  <InputWithStatus 
                    label="Invoice Date" 
                    value={formValues.date} 
                    confidence={fieldConfidence.date}
                    onFocus={() => handleFocus('date')}
                    onChange={(v) => handleCorrection('date', v)}
                  />
                  <InputWithStatus 
                    label="Vendor" 
                    value={formValues.vendor} 
                    confidence={fieldConfidence.vendor}
                    onFocus={() => handleFocus('vendor')}
                    onChange={(v) => handleCorrection('vendor', v)}
                  />
                  <InputWithStatus 
                    label="Bill of Lading (BOL)" 
                    value={formValues.bolNumber} 
                    confidence={fieldConfidence.bolNumber}
                    onFocus={() => handleFocus('bolNumber')}
                    onChange={(v) => handleCorrection('bolNumber', v)}
                  />
                  <InputWithStatus 
                    label="Origin Port" 
                    value={formValues.origin} 
                    confidence={fieldConfidence.origin}
                    onFocus={() => handleFocus('origin')}
                    onChange={(v) => handleCorrection('origin', v)}
                  />
                  <InputWithStatus 
                    label="Destination Port" 
                    value={formValues.destination} 
                    confidence={fieldConfidence.destination}
                    onFocus={() => handleFocus('destination')}
                    onChange={(v) => handleCorrection('destination', v)}
                  />
               </div>
            </div>

            {/* Line Items */}
            <div>
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Line Items</h4>
               
               <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase mb-2 px-2">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-3">System Code</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-1 text-center">Status</div>
               </div>

               {/* Line 1 (Inferred Base Freight) */}
               <div 
                 className={`grid grid-cols-12 gap-2 items-center p-2 rounded-sm border mb-2 transition-colors ${activeField === 'lineItem1' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                 onClick={() => handleFocus('lineItem1')}
               >
                  <div className="col-span-5 text-sm font-medium text-gray-800">Base Freight (Derived)</div>
                  <div className="col-span-3">
                     <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded">BAS</span>
                  </div>
                  <div className="col-span-3 text-right font-bold text-gray-900">
                    {(Number(formValues.totalAmount.replace(/[^0-9.-]+/g,"")) - Number(formValues.lineItem2Amount.replace(/[^0-9.-]+/g,""))).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                     <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                  </div>
               </div>

               {/* Line 2 (Extracted Accessorials) */}
               <div 
                 className={`grid grid-cols-12 gap-2 items-center p-2 rounded-sm border mb-2 transition-colors cursor-pointer
                   ${fieldConfidence.lineItem2 === 'low' ? 'border-amber-400 bg-amber-50' : 'border-teal-200 bg-teal-50'}
                   ${activeField === 'lineItem2' ? 'ring-1 ring-amber-500' : ''}
                 `}
                 onClick={() => handleFocus('lineItem2')}
               >
                  <div className="col-span-5">
                    <input 
                      type="text" 
                      value={formValues.lineItem2Desc}
                      placeholder="Accessorial (e.g. BAF)"
                      onChange={(e) => handleCorrection('lineItem2Desc', e.target.value)}
                      className={`w-full text-sm font-medium bg-transparent border-b border-dashed focus:outline-none ${fieldConfidence.lineItem2 === 'low' ? 'border-amber-500 text-amber-900' : 'border-teal-500 text-teal-900'}`}
                    />
                  </div>
                  <div className="col-span-3">
                     <div className="relative">
                        <select 
                          value={formValues.lineItem2Code}
                          onChange={(e) => handleCorrection('lineItem2Code', e.target.value)}
                          className="text-xs font-mono font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 w-full focus:border-teal-500 outline-none"
                        >
                           <option value="">Select Code</option>
                           <option value="FSC">FSC (Fuel)</option>
                           <option value="BAS">BAS (Base)</option>
                           <option value="SEC">SEC (Security)</option>
                           <option value="THC">THC (Handling)</option>
                        </select>
                     </div>
                  </div>
                  <div className="col-span-3 text-right">
                     <input 
                        type="text" 
                        value={formValues.lineItem2Amount}
                        placeholder="0.00"
                        onChange={(e) => handleCorrection('lineItem2Amount', e.target.value)}
                        className={`w-full text-right font-bold bg-transparent border-b border-dashed focus:outline-none ${fieldConfidence.lineItem2 === 'low' ? 'border-amber-500 text-amber-900' : 'border-teal-500 text-teal-900'}`}
                     />
                  </div>
                  <div className="col-span-1 flex justify-center">
                     <div className={`w-2.5 h-2.5 rounded-full ${fieldConfidence.lineItem2 === 'low' ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'}`}></div>
                  </div>
               </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
               <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2">
                     <span>Total ({formValues.currency})</span>
                     <span>{formValues.totalAmount}</span>
                  </div>
               </div>
            </div>

          </div>
        </div>

      </div>

      {/* SUBMISSION SUCCESS OVERLAY */}
      {isSubmitting && (
         <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <div className="text-center">
               <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Database size={40} />
               </div>
               <h3 className="text-2xl font-bold text-gray-800 mb-2">Submission Complete</h3>
               <p className="text-gray-500 mb-4">Invoice has been sent to 3SC for Audit.</p>
               <p className="text-xs text-gray-400 font-mono">Redirecting...</p>
            </div>
         </div>
      )}

    </div>
  );
};

// --- HELPER COMPONENT ---
const InputWithStatus = ({ label, value, confidence, onFocus, onChange }: any) => {
   const isHigh = confidence === 'high';
   return (
      <div className="relative">
         <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
            {label}
            <span className={`text-[9px] ${isHigh ? 'text-teal-600' : 'text-amber-600'}`}>{isHigh ? 'High Confidence' : 'Review Needed'}</span>
         </label>
         <div className="relative">
            <input 
               type="text" 
               value={value}
               onFocus={onFocus}
               onChange={(e) => onChange(e.target.value)}
               className={`w-full border rounded-sm px-3 py-2 text-sm font-medium transition-shadow focus:outline-none focus:ring-1 
                  ${isHigh 
                     ? 'border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-800' 
                     : 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-amber-50/50'
                  }`}
            />
            {!isHigh && <AlertTriangle size={14} className="absolute right-3 top-2.5 text-amber-500" />}
         </div>
      </div>
   );
};
